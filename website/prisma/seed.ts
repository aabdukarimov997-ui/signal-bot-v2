import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
import { Course, Signal, FAQ, SiteSetting, Banner, Coupon, BlogPost, User } from '@prisma/client';

async function seed() {
  console.log('Seeding database...');

  const adminEmail = 'admin@aaa-trading.academy';
  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });
  let admin: User | null = null;
  if (!existingAdmin) {
    admin = await db.user.create({
      data: { email: adminEmail, name: 'ABDULLOH', role: 'ADMIN' },
    });
    console.log('Admin created');
  } else {
    admin = existingAdmin;
  }

  const existingCourse = await db.course.findFirst();
  if (!existingCourse) {
    await db.course.create({
      data: {
        name: 'Trading Haqiqati',
        description: 'Professional kripto savdo kursi. Bozorni chuqur tushunish, texnik analiz, risk boshqaruvi va savdo strategiyalarini o\'rganing.',
        starterPrice: 49.99,
        professionalPrice: 99.99,
        masterPrice: 199.99,
        starterFeatures: JSON.stringify(['Asosiy savdo konsepsiyalari', 'Texnik analiz asoslari', '3 ta modul', 'Telegram guruhga kirish', '1 oy qo\'llab-quvvatlash']),
        professionalFeatures: JSON.stringify(['Barcha Starter xususiyatlari', 'Advanced texnik analiz', 'Risk management strategiyalari', '7 ta modul', 'Shaxsiy mentorlik', '3 oy qo\'llab-quvvatlash', 'VIP signal kirish']),
        masterFeatures: JSON.stringify(['Barcha Professional xususiyatlari', '12 ta modul', '1-on-1 mentoring', 'Lifetime kirish', 'Exclusive savdo strategiyalari', 'VIP hamjamiyat', 'Haqiqiy pul bilan savdo amaliyoti', 'Sertifikat', 'Priority qo\'llab-quvvatlash']),
        isActive: true,
      },
    });
    console.log('Course created');
  }

  const existingSignal = await db.signal.findFirst();
  if (!existingSignal) {
    await db.signal.create({
      data: {
        name: 'AT_analysis',
        description: 'Professional kripto savdo signallari. Har kuni aniq kirish/chiqish nuqtalari, stop-loss va take-profit darajalari.',
        monthlyPrice: 29.99,
        quarterlyPrice: 69.99,
        semiannualPrice: 119.99,
        monthlyFeatures: JSON.stringify(['Kunlik 3-5 signal', 'BTC, ETH, SOL, GRAM', 'Kirish/chiqish nuqtalari', 'Stop-loss va take-profit', 'Telegram kanal orqali']),
        quarterlyFeatures: JSON.stringify(['Barcha oylik xususiyatlari', 'Haftalik market analysis', 'Risk management maslahatlari', 'Priority qo\'llab-quvvatlash', '25% chegirma']),
        semiannualFeatures: JSON.stringify(['Barcha choraklik xususiyatlari', 'VIP market analysis', 'Shaxsiy maslahatlar', 'Exclusive signal guruh', '40% chegirma', 'Bonus: Trading Haqiqati kursiga kirish']),
        isActive: true,
      },
    });
    console.log('Signal created');
  }

  const faqCount = await db.fAQ.count();
  if (faqCount === 0) {
    await db.fAQ.createMany({
      data: [
        { question: 'Trading Haqiqati kursi nima?', answer: 'Trading Haqiqati — bu kripto valyutalar bozorida professional savdo qilishni o\'rgatadigan komprehensiv kurs. Kurs texnik analiz, risk boshqaruvi, savdo psixologiyasi va amaliy strategiyalarni o\'z ichiga oladi. 5 yillik tajribaga ega mutaxassis tomonidan tayyorlangan.', category: 'course', order: 1 },
        { question: 'AT_analysis signallari nima?', answer: 'AT_analysis — bu professional savdo signallari xizmati. Har kuni BTC, ETH, SOL, GRAM kabi asosiy kripto valyutalar uchun aniq kirish/chiqish nuqtalari, stop-loss va take-profit darajalari taqdim etiladi. Signallar faqat aniq tasdiqlangan va yuqori ehtimollikli setuplar asosida beriladi.', category: 'signal', order: 2 },
        { question: 'To\'lov qanday amalga oshiriladi?', answer: 'Barcha to\'lovlar Telegram Bot (@AT_analysis_bot) orqali amalga oshiriladi. Kripto valyuta (USDT, USDC) yoki boshqa qulay usullar orqali to\'lov qilishingiz mumkin. To\'lov tasdiqlangach, darhol kirish olinadi.', category: 'payment', order: 3 },
        { question: 'Kursni sotib olgandan so\'ng nima olaman?', answer: 'Kursni sotib olgandan so\'ng Telegram guruhiga kirish, barcha modullarga kirish, mentorlik va qo\'llab-quvvatlash xizmatlaridan foydalanasiz. To\'lov Telegram Bot orqali tasdiqlanadi va darhol kirish beriladi.', category: 'course', order: 4 },
        { question: 'Kurs kimlarga mos keladi?', answer: 'Bizning kursimiz yangi boshlovchilar ham, tajribali treyderlar ham uchun moslashgan. Agar siz kripto savdo dunyosiga birinchi marta kirayotgan bo\'lsangiz, biz kripto valyuta, birja ishlashi va savdo asoslari haqida barcha kerakli bilimlarni taqdim etamiz. Agar allaqachon tajribangiz bor bo\'lsa, advanced strategiyalar va texnik tahlilning chuqur yo\'nalishlari sizga foyda keltiradi.', category: 'course', order: 5 },
        { question: 'To\'lovdan keyin kirishni qanday olaman?', answer: 'To\'lovni amalga oshirgach, Telegram Botga tasdiq yuboring. Bot sizga avtomatik ravishda zaruriy materiallarga kirishni va Telegram guruhiga havolani beradi. Jarayon 5-10 daqiqa ichida yakunlanadi. Agar muammo yuzaga kelsa, @abdulloh1997ka ga murojaat qiling.', category: 'payment', order: 6 },
        { question: 'Darslar yozib olinadimi?', answer: 'Ha, barcha darslar yozib olinadi va Telegram guruhida saqlanadi. Siz istalgan vaqtda qayta ko\'rish imkoniga egasiz. Online darslardan keyin yozuvlar bir necha daqiqa ichida mavjud bo\'ladi, shuning uchun darsni o\'tkazib yuborsangiz ham keyinroq to\'ldirib o\'qishingiz mumkin.', category: 'course', order: 7 },
        { question: 'Uy vazifalari tekshiriladimi?', answer: 'Har bir darsga mos vazifalar beriladi va ularni bajarish bilimlarni mustahkamlash uchun muhim qadam hisoblanadi. Bajarilgan vazifalar batafsil tekshiriladi va sizga shaxsiy fikr-mulohaza hamda takomillashtirish bo\'yicha tavsiyalar beriladi. Bu jarayon ta\'lim samaradorligini oshirishda kalitli ahamiyatga ega.', category: 'course', order: 8 },
        { question: 'Obuna muddati tugaganda nima bo\'ladi?', answer: 'Obuna muddati tugaganda, matn va video darslarga kirish doimiy saqlanib qoladi — bu sizga istalgan vaqtda qayta o\'qish va takrorlash imkonini beradi. Signal xizmati va qo\'llab-quvvatlash obuna tugagandan keyin to\'xtaydi, lekin istasangiz obunangizni yangilashingiz mumkin.', category: 'signal', order: 9 },
        { question: 'Zarar seriyasiga qanday munosabatda bo\'lish kerak?', answer: 'Zarar seriyasi — bu har bir treyder duch keladigan tabiiy jarayon. Asosiysi — bir savdodagi xarajatni kapitalingizning 1-2% dan oshirmaslik, har doim stop-loss qo\'yish va savdo rejangizdan chetlamaslik. Zarar seriyasida emotsional qarorlar qabul qilmaslik, tanaffus olish va rejangizni tahlil qilish muhim. Bizning kursda savdo psixologiyasi bo\'yicha maxsus bo\'lim mavjud.', category: 'general', order: 10 },
        { question: 'Intizomni qanday rivojlantirish mumkin?', answer: 'Treyder intizomi — bu kundalik mashq va o\'zini nazorat qilish natijasida shakllanadi. Savdo rejangizni yozib qo\'ying, har kuni bozor ochilishidan oldin tayyorgarlik qiling, savdo jurnalini yuriting. Bizning kursda savdo intizomi va psixologiya bo\'yicha maxsus modul mavjud. Bilimlar vaqti o\'tishi bilan qiymatini yo\'qotmaydi — shuning uchun sarmoyangiz doimo sizda qoladi.', category: 'general', order: 11 },
        { question: 'Yuqori ehtimollikli setupni qanday topish mumkin?', answer: 'Yuqori ehtimollikli setup — bu bir necha texnik indikator va narx harakati modeli bir-birini tasdiqlaydigan vaziyat. Asosiy modellar: "W" va "M" naqshlari, Failure Swing, Stop Hunt, Three Drives Pattern. Har bir setupda support/resistance darajalari, trend yo\'nalishi va hajimni birgalikda tahlil qilish muhim. Bizning kurs va signallarda aynan shunday tasdiqlangan setuplar ishlatiladi.', category: 'signal', order: 12 },
        { question: 'Referral dasturi bormi?', answer: 'Ha, referral dasturi mavjud. Do\'stlaringizni taklif qiling va ular har bir sotib olishda siz bonus olasiz. Batafsil ma\'lumot uchun Dashboard sahifasiga o\'ting yoki @abdulloh1997ka ga murojaat qiling.', category: 'general', order: 13 },
        { question: '100% foyda kafolati bormi?', answer: 'Yo\'q. Kripto savdo xavfli faoliyatdir. Biz professional ta\'lim va sifatli signallar taqdim etamiz, lekin hech qachon kafolatlangan foyda va\'da qilmaymiz. Bozor tushganda kapitalni depolaringizga minusga kirgizmaslik uchun aniq sabab va tasdiqdan keyin signallar beriladi. Har doim o\'z risklaringizni boshqaring.', category: 'general', order: 14 },
        { question: 'Qo\'llab-quvvatlash qanday ishlaydi?', answer: '24/7 Telegram orqali yordam beriladi. Savollar, muammolar yoki takliflar uchun @abdulloh1997ka ga murojaat qiling. Shuningdek, kurs obunachilari uchun maxsus Telegram guruh mavjud bo\'lib, u yerda boshqa o\'quvchilar va mentorlar bilan muloqot qilishingiz mumkin.', category: 'general', order: 15 },
      ],
    });
    console.log('FAQs created');
  }

  const settingsCount = await db.siteSetting.count();
  if (settingsCount === 0) {
    await db.siteSetting.createMany({
      data: [
        { key: 'site_title', value: 'AAA — Premium Crypto Trading Academy' },
        { key: 'site_description', value: 'Professional kripto savdo akademiyasi va signal platformasi. Trading Haqiqati kursi va AT_analysis signallari.' },
        { key: 'og_image', value: '/aaa-logo.svg' },
        { key: 'telegram_channel', value: 'https://t.me/abdullohtreydr' },
        { key: 'telegram_bot', value: 'https://t.me/AT_analysis_bot' },
        { key: 'telegram_help', value: '@abdulloh1997ka' },
        { key: 'contact_email', value: 'info@aaa-trading.academy' },
      ],
    });
    console.log('Settings created');
  }

  const bannerCount = await db.banner.count();
  if (bannerCount === 0) {
    await db.banner.createMany({
      data: [
        { title: 'Trading Haqiqati', subtitle: 'Professional kripto savdo kursini boshlang', imageUrl: '', link: 'https://t.me/AT_analysis_bot', isActive: true, order: 1 },
        { title: 'AT_analysis Signals', subtitle: 'Kunlik aniq savdo signallari', imageUrl: '', link: 'https://t.me/AT_analysis_bot', isActive: true, order: 2 },
      ],
    });
    console.log('Banners created');
  }

  const couponCount = await db.coupon.count();
  if (couponCount === 0) {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    await db.coupon.create({
      data: {
        code: 'WELCOME20',
        discountPercent: 20,
        validTo: futureDate.toISOString(),
        maxUses: 100,
      },
    });
    console.log('Coupon created');
  }

  const blogCount = await db.blogPost.count();
  if (blogCount === 0 && admin) {
    await db.blogPost.createMany({
      data: [
        {
          title: 'Kripto Savdoga Kirish: Boshlang\'ich Qo\'llanma',
          slug: 'kripto-savdoga-kirish',
          content: 'Kripto savdo dunyoga kirish uchun eng muhim narsa — bu asosiy tushunchalarni o\'rganish. Ushbu maqolada siz kripto valyutalar, blokcheyn texnologiyasi va savdo asoslari haqida bilib olasiz.\n\n## Nima uchun Kripto Savdo?\n\nKripto savdo — bu yangi avlod moliyaviy faoliyati. U an\'anaviy fond bozorlaridan farq qiluvchi xususiyatlarga ega: 24/7 ishlaydi, global accessibility va yuqori volatillik.\n\n## Asosiy Tushunchalar\n\n- **Blockchain**: Ochiq tarqatilgan ledger texnologiyasi\n- **Wallet**: Kripto valyutalaringizni saqlash uchun digital hamyon\n- **Exchange**: Kripto savdo platformasi\n- **Order Book**: Sotuv va xarid buyruqlari ro\'yxati',
          excerpt: 'Kripto savdoni boshlash uchun kerak bo\'lgan barcha asosiy tushunchalar va qadamlar.',
          coverImage: '',
          published: true,
          authorId: admin.id,
        },
        {
          title: 'Risk Management: Savdoda Qolib Qolmaslik Uchun',
          slug: 'risk-management-savdoda',
          content: 'Risk management — muvaffaqiyatli savdoning eng muhim pilaridan biri. Ushbu maqolada professional risk boshqarish strategiyalarini o\'rganasiz.\n\n## Nima uchun Risk Management Muhim?\n\nSavdoda eng katta xato — bu risklarni boshqarmaslik. Professional savdogarlar har doim o\'z kapitallarining faqat kichik qismini xavf ostiga qo\'yishadi.\n\n## Asosiy Qoidalar\n\n1. **1-2% qoida**: Hech bir savdoda kapitalingizning 1-2% dan ko\'pini xavf ostiga qo\'ymang\n2. **Stop-loss**: Har doim stop-loss qo\'ying\n3. **Risk/Reward nisbati**: Minimum 1:2 bo\'lishi kerak\n4. **Diversifikasiya**: Barcha mablag\'ni bir tanga bilan savdo qilmang',
          excerpt: 'Professional savdogarlar ishlatadigan risk boshqarish strategiyalari va asosiy qoidalar.',
          coverImage: '',
          published: true,
          authorId: admin.id,
        },
        {
          title: 'Texnik Analiz Asoslari: Grafiklarni O\'qish',
          slug: 'texnik-analiz-asoslari',
          content: 'Texnik analiz — bu savdogarlar tomonidan keng ishlatiladigan bozor tahlil usuli. Narx grafiklaridagi naqshlarni aniqlash orqali kelajakdagi harakatlarni bashorat qilishga yordam beradi.\n\n## Asosiy Tahlil Vositalari\n\n- **Yapon shamlari (Candlesticks)**: Narx harakatini ko\'rsatadi\n- **Support va Resistance**: Muhim narx darajalari\n- **Trend chiziqlari**: Bozor yo\'nalishini aniqlash\n- **Indikatorlar**: RSI, MACD, Moving Averages\n\n## Grafik Naqshlari\n\nEng ko\'p uchraydigan naqshlar: Head and Shoulders, Double Top/Bottom, Triangles, Flags.',
          excerpt: 'Grafiklarni o\'qish va texnik analiz vositalarini ishlatish bo\'yicha boshlang\'ich qo\'llanma.',
          coverImage: '',
          published: true,
          authorId: admin.id,
        },
      ],
    });
    console.log('Blog posts created');
  }

  console.log('Seeding complete!');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => process.exit(0));