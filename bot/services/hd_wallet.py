"""HD (BIP32/BIP44) hamyon — har bir mijozga alohida manzil.

Bu modul faqat **public** kalit (xpub) bilan ishlaydi. Serverda private key
yoki seed phrase saqlanmaydi, shuning uchun serverdan mablag' o'g'irlab
bo'lmaydi. Manzillar xpub'dan deterministik hosil qilinadi:

    TRON : m/44'/195'/0'/0/{index}
    BNB  : m/44'/60'/0'/0/{index}

`index` — mijozning doimiy raqami (DB'da saqlanadi).
"""

from __future__ import annotations

import hashlib
import hmac

from Crypto.Hash import RIPEMD160, keccak

# secp256k1 parametrlari
P = 2**256 - 2**32 - 977
N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
GX = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798
GY = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8

B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
B58_MAP = {c: i for i, c in enumerate(B58_ALPHABET)}

XPUB_VERSIONS = {
    bytes.fromhex("0488b21e"): "xpub",
    bytes.fromhex("0488ade4"): "xprv",
    bytes.fromhex("049d7cb2"): "ypub",
    bytes.fromhex("04b24746"): "zpub",
    bytes.fromhex("043587cf"): "tpub",
}

HARDENED = 0x80000000


class HDWalletError(ValueError):
    """xpub noto'g'ri yoki manzil hosil qilib bo'lmadi."""


def _b58decode(value: str) -> bytes:
    num = 0
    for char in value:
        try:
            num = num * 58 + B58_MAP[char]
        except KeyError as exc:
            raise HDWalletError("xpub noto'g'ri: base58 belgisi xato") from exc
    raw = num.to_bytes((num.bit_length() + 7) // 8, "big") if num else b""
    pad = len(value) - len(value.lstrip("1"))
    return b"\x00" * pad + raw


def _b58encode(raw: bytes) -> str:
    num = int.from_bytes(raw, "big")
    chars = []
    while num:
        num, rem = divmod(num, 58)
        chars.append(B58_ALPHABET[rem])
    pad = len(raw) - len(raw.lstrip(b"\x00"))
    return "1" * pad + "".join(reversed(chars))


def _b58check_encode(payload: bytes) -> str:
    checksum = hashlib.sha256(hashlib.sha256(payload).digest()).digest()[:4]
    return _b58encode(payload + checksum)


def _b58check_decode(value: str) -> bytes:
    raw = _b58decode(value)
    if len(raw) < 5:
        raise HDWalletError("base58check ma'lumoti juda qisqa")
    payload, checksum = raw[:-4], raw[-4:]
    expected = hashlib.sha256(hashlib.sha256(payload).digest()).digest()[:4]
    if checksum != expected:
        raise HDWalletError("base58check nazorat summasi mos emas")
    return payload


def _point_add(p1: tuple[int, int], p2: tuple[int, int]) -> tuple[int, int]:
    if p1 is None:
        return p2
    if p2 is None:
        return p1
    x1, y1 = p1
    x2, y2 = p2
    if x1 == x2 and (y1 + y2) % P == 0:
        return None
    lam = (
        (3 * x1 * x1) * pow(2 * y1, P - 2, P) % P
        if p1 == p2
        else (y2 - y1) * pow(x2 - x1, P - 2, P) % P
    )
    x3 = (lam * lam - x1 - x2) % P
    y3 = (lam * (x1 - x3) - y1) % P
    return x3, y3


def _point_mul(point: tuple[int, int], scalar: int) -> tuple[int, int]:
    result = None
    addend = point
    while scalar:
        if scalar & 1:
            result = _point_add(result, addend)
        addend = _point_add(addend, addend)
        scalar >>= 1
    return result


def _decompress(pubkey: bytes) -> tuple[int, int]:
    if len(pubkey) != 33 or pubkey[0] not in (2, 3):
        raise HDWalletError("public key formati noto'g'ri")
    x = int.from_bytes(pubkey[1:], "big")
    if x >= P:
        raise HDWalletError("public key noto'g'ri")
    alpha = (pow(x, 3, P) + 7) % P
    beta = pow(alpha, (P + 1) // 4, P)
    if pow(beta, 2, P) != alpha:
        raise HDWalletError("public key egri chiziqda emas")
    y = beta if beta % 2 == (pubkey[0] & 1) else P - beta
    return x, y


def _compress(point: tuple[int, int]) -> bytes:
    x, y = point
    return bytes([2 + (y & 1)]) + x.to_bytes(32, "big")


def _uncompressed(point: tuple[int, int]) -> bytes:
    x, y = point
    return b"\x04" + x.to_bytes(32, "big") + y.to_bytes(32, "big")


class ExtendedPublicKey:
    """BIP32 kengaytirilgan public kalit (xpub)."""

    def __init__(self, payload: bytes) -> None:
        if len(payload) != 78:
            raise HDWalletError("xpub uzunligi 78 bayt bo'lishi kerak")
        self.version = payload[:4]
        self.depth = payload[4]
        self.parent_fingerprint = payload[5:9]
        self.child_number = int.from_bytes(payload[9:13], "big")
        self.chain_code = payload[13:45]
        self.public_key = payload[45:78]
        _decompress(self.public_key)

    @classmethod
    def from_string(cls, value: str) -> ExtendedPublicKey:
        value = (value or "").strip()
        if not value:
            raise HDWalletError("xpub bo'sh")
        payload = _b58check_decode(value)
        if len(payload) != 78:
            raise HDWalletError("xpub uzunligi noto'g'ri")
        if payload[:4] in (bytes.fromhex("0488ade4"),):
            raise HDWalletError(
                "Bu xprv (private) kalit. Xavfsizlik uchun faqat xpub kiriting — "
                "private kalitni serverga hech qachon yubormang."
            )
        if payload[:4] not in XPUB_VERSIONS:
            raise HDWalletError("xpub versiyasi noma'lum")
        if payload[45] not in (2, 3):
            raise HDWalletError("xpub ichida public kalit topilmadi")
        return cls(payload)

    def child(self, index: int) -> ExtendedPublicKey:
        """Qattiqlashtirilmagan (non-hardened) child kalit."""
        if index < 0 or index >= HARDENED:
            raise HDWalletError("child indeks 0..2^31-1 oralig'ida bo'lishi kerak")
        data = self.public_key + index.to_bytes(4, "big")
        digest = hmac.new(self.chain_code, data, hashlib.sha512).digest()
        left, right = digest[:32], digest[32:]
        tweak = int.from_bytes(left, "big")
        if tweak >= N:
            raise HDWalletError("child kalit chegaradan chiqdi")
        parent_point = _decompress(self.public_key)
        child_point = _point_add(_point_mul((GX, GY), tweak), parent_point)
        if child_point is None:
            raise HDWalletError("child kalit cheksiz nuqta")
        payload = (
            self.version
            + bytes([self.depth + 1])
            + RIPEMD160.new(hashlib.sha256(self.public_key).digest()).digest()[:4]
            + index.to_bytes(4, "big")
            + right
            + _compress(child_point)
        )
        return ExtendedPublicKey(payload)

    def derive(self, path: str) -> ExtendedPublicKey:
        """`0/5` ko'rinishidagi yo'lni yurish (qattiqlashtirilmagan)."""
        node = self
        for part in [p for p in path.split("/") if p]:
            if part.endswith("'") or part.endswith("h"):
                raise HDWalletError("xpub'dan qattiqlashtirilgan yo'lni yurib bo'lmaydi")
            node = node.child(int(part))
        return node

    def address_bytes(self) -> bytes:
        """20 baytli manzil (keccak256 asosida, TRON/EVM uchun umumiy)."""
        point = _decompress(self.public_key)
        digest = keccak.new(digest_bits=256)
        digest.update(_uncompressed(point)[1:])
        return digest.digest()[-20:]

    def tron_address(self) -> str:
        return _b58check_encode(b"\x41" + self.address_bytes())

    def evm_address(self) -> str:
        return to_checksum_address(self.address_bytes().hex())


def to_checksum_address(hex_address: str) -> str:
    """EIP-55 checksum bilan `0x...` manzil."""
    addr = hex_address.lower().replace("0x", "")
    if len(addr) != 40:
        raise HDWalletError("EVM manzil 20 bayt bo'lishi kerak")
    digest = keccak.new(digest_bits=256)
    digest.update(addr.encode())
    checksum = digest.hexdigest()
    return "0x" + "".join(
        char.upper() if int(checksum[i], 16) >= 8 else char for i, char in enumerate(addr)
    )


def validate_xpub(value: str, network: str) -> str:
    """xpub'ni tekshiradi; xato bo'lsa tushunarli xabar beradi.

    Qaytadi: normallashtirilgan xpub. Xato bo'lsa `HDWalletError`.

    Diqqat: TRON va EVM bir xil secp256k1 kalitdan foydalanadi, shuning uchun
    manzil formatidan xpub qaysi tarmoqqa tegishli ekanini aniqlab bo'lmaydi.
    Bu yerda faqat format, chuqurlik va hosil qilish imkoniyati tekshiriladi.
    """
    if network not in ("tron", "bnb"):
        raise HDWalletError(f"Noma'lum tarmoq: {network}")

    node = ExtendedPublicKey.from_string(value)
    if node.depth != 3:
        raise HDWalletError(
            f"xpub chuqurligi {node.depth}, lekin 3 bo'lishi kerak. "
            "Account darajasidagi xpub kerak (m/44'/195'/0' yoki m/44'/60'/0'). "
            "Manzil darajasidagi yoki master xpub mos emas."
        )

    # Hosil qilish ishlashini tekshiramiz (egri chiziqda xato bo'lmasin).
    derive_address(value, network, 0)
    return value.strip()


def derive_address(xpub: str, network: str, index: int) -> str:
    """xpub va indeksdan mijoz manzilini hosil qiladi."""
    node = ExtendedPublicKey.from_string(xpub)
    child = node.derive(f"0/{index}")
    if network == "tron":
        return child.tron_address()
    if network == "bnb":
        return child.evm_address()
    raise HDWalletError(f"Noma'lum tarmoq: {network}")


def xpub_fingerprint(xpub: str) -> str:
    """Diagnostika uchun xpub barmoq izi (maxfiy emas)."""
    payload = _b58check_decode((xpub or "").strip())
    return hashlib.sha256(payload).hexdigest()[:12]
