'use strict';
const tg = window.Telegram?.WebApp;
const initData = tg?.initData || '';
const demo = !initData;
const main = document.querySelector('#main');
let data, busy = false, page = 'home', activeSection = '', cards = [];
let toastTimer;
const sections = {
  signal: ['📈 Signal kanal', 'VIP Signallar', 'chart'],
  course: ['📚 Darslar', 'Trading akademiyasi', 'book'],
  account: ['👤 Hisobim', 'Hisobim', 'user'],
  referral: ['👥 Referal', 'Do‘stlarni taklif qilish', 'users'],
  quiz: ['🎯 Viktorina', 'Bilimingizni sinang', 'bolt'],
  social: ['🌐 Ijtimoiy tarmoqlar', 'Biz bilan bog‘laning', 'globe'],
  help: ['☎️ Yordam', 'Yordam markazi', 'help'],
  admin: ['/admin', 'Admin panel', 'shield'],
};
const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => Number(value).toLocaleString('en-US', {maximumFractionDigits:2});
function safeUrl(url) { try { const parsed = new URL(url); return ['https:', 'http:', 'tg:'].includes(parsed.protocol) ? parsed.href : ''; } catch { return ''; } }
function richText(html) {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const allowed = new Set(['B','STRONG','I','EM','U','S','DEL','CODE','PRE','A','BR','BLOCKQUOTE']);
  function clean(node) {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
    const fragment = document.createDocumentFragment();
    for (const child of node.childNodes) fragment.append(clean(child));
    if (node.nodeType !== Node.ELEMENT_NODE || !allowed.has(node.tagName)) return fragment;
    const element = document.createElement(node.tagName.toLowerCase());
    if (node.tagName === 'A') {
      const href = safeUrl(node.getAttribute('href'));
      if (!href) return fragment;
      element.href = href; element.target = '_blank'; element.rel = 'noopener noreferrer';
    }
    element.append(fragment); return element;
  }
  const container = document.createElement('div'); container.append(clean(parsed.body)); return container.innerHTML;
}
function toast(text) {
  const element = document.querySelector('#toast'); element.textContent = text;
  element.classList.add('show'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('show'), 4200);
}
async function api(path, options = {}) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(`/miniapp/api/${path}`, {...options, signal:controller.signal, headers:{'X-Telegram-Init-Data':initData, ...options.headers}});
    if (!response.ok) {
      const raw = await response.text(); let message;
      try { message = JSON.parse(raw).error; } catch { message = raw; }
      throw new Error(message || `So‘rov bajarilmadi (${response.status}).`);
    }
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Javob vaqti tugadi. Amal bajarilgan bo‘lishi mumkin — bot chatini tekshiring.');
    throw error;
  } finally { clearTimeout(timer); }
}
function heading(title, subtitle, eyebrow = 'SIGNAL CLUB ECOSYSTEM') {
  return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${escape(title)}</h1><p>${escape(subtitle)}</p></div><span class="date-badge">${new Date().toLocaleDateString('uz-UZ',{day:'numeric',month:'short',year:'numeric'})}</span></div>`;
}
function demoBanner() { return demo ? `<div class="demo-banner">${icon('shield')}<span><b>Dizayn namoyishi.</b> Quyidagi ma’lumotlar namuna. Haqiqiy hisob va amallar uchun Mini App’ni bot ichida oching.</span></div>` : ''; }
function nav() {
  const items = [['home','Bosh sahifa','home'],['signal','VIP Signallar','chart'],['course','Darslar','book'],['account','Hisobim','user'],['referral','Referal dasturi','users']];
  const navButton = ([key,label,symbol]) => `<button class="nav-item ${page === key || (page === 'workspace' && activeSection === key) ? 'active' : ''}" ${['home','account','referral'].includes(key) ? `data-page="${key}"` : `data-section="${key}"`}>${icon(symbol)}<span>${label}</span></button>`;
  document.querySelector('#desktop-nav').innerHTML = items.map(navButton).join('') + '<div class="nav-divider"></div>' +
    (data?.quiz ? navButton(['quiz','Viktorina','bolt']) : '') + navButton(['social','Ijtimoiy tarmoqlar','globe']) + navButton(['help','Yordam markazi','help']) + (data?.user.admin ? navButton(['admin','Admin panel','shield']) : '');
  document.querySelector('#mobile-nav').innerHTML = items.map(item => navButton([item[0],item[0] === 'referral' ? 'Referal' : item[1],item[2]])).join('');
  const title = page === 'workspace' ? sections[activeSection]?.[1] : {home:'Bosh sahifa',account:'Hisobim',referral:'Referal dasturi'}[page];
  document.querySelector('#breadcrumb').textContent = title || 'Mini App';
}
function stat(symbol, label, value, unit = '') {
  return `<div class="stat"><span class="stat-icon">${icon(symbol)}</span><div><div class="stat-label">${label}</div><strong>${escape(value)}<small>${unit}</small></strong></div><svg class="arrow-tiny"><use href="#i-arrow"/></svg></div>`;
}
function planCard(plan, index, count) {
  const featured = index === (count > 1 ? 1 : 0);
  return `<article class="plan ${featured?'featured':''}">${featured?'<span class="plan-tag">TAVSIYA ETILADI</span>':''}<div class="plan-top"><strong>${escape(plan.duration)}</strong>${icon(featured?'star':'shield')}</div><div class="plan-price">$${money(plan.price)} <small>/ ${escape(plan.duration)}</small></div><div class="plan-caption">${plan.discount ? `<s>$${money(plan.base)}</s> · Sizga ${plan.discount}% chegirma` : 'O‘sishingiz uchun to‘g‘ri tanlov'}</div><ul class="plan-list"><li>${plan.product === 'course' ? 'Trading bo‘yicha darslar' : 'Yopiq signal kanaliga kirish'}</li><li>${plan.product === 'course' ? 'Bilim va amaliy tajriba' : 'Professional tahlillar'}</li><li>Shaxsiy obuna boshqaruvi</li></ul><button class="btn ${featured?'btn-primary':''}" data-buy="${escape(plan.id)}" data-product="${plan.product}">Tarifni tanlash ${icon('arrow')}</button></article>`;
}
function home() {
  const active = data.subscriptions.filter(s => s.active);
  const plans = data.tariffs.filter(t => t.product === 'signal');
  return heading(`Salom, ${data.user.name} ✦`, 'Trading olamidagi keyingi qadamingiz shu yerdan boshlanadi.') + demoBanner() + `
  <section class="hero"><div class="hero-copy"><span class="pill">${icon('bolt')} PROFESSIONAL TRADING HAMJAMIYATI</span><h2>Bozorni kuzatmang.<br><span>Uni tushuning.</span></h2><p>Professional signallar, amaliy darslar va bir maqsad sari intiluvchi hamjamiyat. Barchasi bir joyda.</p><button class="btn btn-primary" data-section="signal">VIP signallarga qo‘shilish ${icon('arrow')}</button><p class="hero-note">${icon('shield')} Xavfsiz to‘lov · Shaxsiy hisob · Qulay boshqaruv</p></div><div class="hero-art" aria-hidden="true"><div class="orbit"></div><div class="orbit two"></div><div class="chart-platform"><div class="bars"><i class="bar"></i><i class="bar"></i><i class="bar"></i><i class="bar"></i></div></div><div class="coin-wrap"><div class="coin">↗</div></div><div class="floating-chip first">${icon('chart')} Bir qadam oldinda</div><div class="floating-chip second">${icon('shield')} Bilimga sarmoya</div></div></section>
  <section class="stat-grid" aria-label="Shaxsiy statistika">${stat('shield','Obuna holati',active.length?'Faol':'Faol emas',active.length?`${Math.max(...active.map(s=>s.days))} kun`:'')}${stat('users','Taklif qilgan do‘stlar',data.referrals,'nafar')}${stat('gift','Referal bonuslar',data.user.bonus,'kun')}</section>
  <section><div class="section-heading"><h2>Imkoniyatlaringiz <span>HAMMASI BIR JOYDA</span></h2><button class="text-btn" data-section="help">Yordam kerakmi? ↗</button></div><div class="quick-grid">${[
    ['signal','chart','VIP Signallar','Bozorni mutaxassislar bilan tahlil qiling'],['course','book','Trading darslari','Bilimingizga yangi daraja bering'],[data.quiz?'quiz':'referral',data.quiz?'bolt':'gift',data.quiz?'Bilimingizni sinang':'Do‘stlarni taklif qiling',data.quiz?'Viktorinada ishtirok eting':'Referal bonuslarni to‘plang'],['social','globe','Bizning hamjamiyat','Yangiliklardan xabardor bo‘ling']
  ].map(([key,symbol,title,sub])=>`<button class="quick-card" data-section="${key}"><span class="q-icon">${icon(symbol)}</span>${icon('arrow').replace('<svg ','<svg class="arrow-tiny" ')}<strong>${title}</strong><small>${sub}</small></button>`).join('')}</div></section>
  <section><div class="section-heading"><h2>Sizga mos tarifni tanlang</h2><button class="text-btn" data-section="signal">Barcha tariflar ↗</button></div><div class="plans">${plans.length ? plans.slice(0,3).map((p,i)=>planCard(p,i,Math.min(plans.length,3))).join('') : '<div class="panel empty-state">Hozircha faol tariflar yo‘q.</div>'}</div></section>
  <div class="trust-row"><span>${icon('shield')} Himoyalangan to‘lovlar</span><span>${icon('bolt')} Qulay faollashtirish</span><span>${icon('help')} Doimiy qo‘llab-quvvatlash</span></div>`;
}
function account() {
  const active = data.subscriptions.filter(s=>s.active);
  const statuses = {approved:'Tasdiqlangan',pending:'Kutilmoqda',rejected:'Rad etilgan',expired:'Muddati tugagan'};
  return heading('Shaxsiy hisobim','Obunalaringiz, bonuslaringiz va to‘lovlaringiz nazorat ostida.') + demoBanner() + `<div class="account-grid"><section class="panel"><div class="account-name"><span class="avatar">${escape(data.user.name.slice(0,1))}</span><div><h2>${escape(data.user.name)}</h2><span class="account-id">ID: ${data.user.id}</span></div></div><div class="info-row">Obuna holati <strong>${active.length?'Faol':'Faol emas'}</strong></div><div class="info-row">Bonus kunlar <strong>${data.user.bonus} kun</strong></div><div class="info-row">Referallar <strong>${data.referrals} nafar</strong></div><div class="info-row">Interfeys <strong>${data.mode === 'miniapp'?'Mini App':'Oldingi rejim'}</strong></div><br><button class="btn btn-primary" data-section="account">Obunalarni boshqarish ${icon('arrow')}</button></section><section class="panel"><h2>Obunalarim</h2>${data.subscriptions.length ? data.subscriptions.map(s=>`<div class="info-row"><span>${s.active?'Faol obuna':'Tugagan obuna'}<br><small>${new Date(s.end).toLocaleDateString('uz-UZ')}</small></span><strong>${s.days} kun</strong></div>`).join('') : `<div class="empty-state">${icon('shield')}<p>Hozircha obunangiz yo‘q.<br>O‘zingizga mos tarifdan boshlang.</p></div>`}<br><button class="btn" data-section="signal">Obunani uzaytirish ${icon('arrow')}</button></section></div><br><section class="panel"><h2>Oxirgi to‘lovlar</h2>${data.payments.length ? data.payments.map(p=>`<div class="payment-row">${icon('shield')}<div>$${money(p.amount)} ${escape(p.currency === 'USD' ? '' : p.currency)}<small>${escape(p.method)} · ${new Date(p.date).toLocaleDateString('uz-UZ')}</small></div><span class="badge ${escape(p.status)}">${escape(statuses[p.status] || p.status)}</span></div>`).join('') : '<p>To‘lovlar tarixi bo‘sh. Yangi to‘lovlaringiz shu yerda ko‘rinadi.</p>'}</section>${data.user.admin ? '<button class="btn" data-section="admin">Admin panelni ochish ↗</button>':''}`;
}
function referral() {
  return heading('Birga o‘sish — yanada oson','Hamjamiyatga do‘stlaringizni taklif qiling va bonus oling.') + demoBanner() + `<section class="panel referral-panel"><div class="gift-3d">${icon('gift')}</div><span class="pill">REFERAL DASTURI</span><h2>Taklif sizdan.<br>Bonus bizdan.</h2><p>Shaxsiy havolangizni do‘stlaringizga yuboring.<br>Bonuslar botning amaldagi referal qoidalari bo‘yicha hisoblanadi.</p><div class="referral-link"><code>${escape(data.referralLink)}</code><button data-copy aria-label="Havolani nusxalash">${icon('copy')}</button></div><button class="btn btn-primary" data-share>Do‘stlarga yuborish ${icon('send')}</button><div class="referral-steps"><div class="referral-step"><b>01</b>Havolangizni ulashing</div><div class="referral-step"><b>02</b>Do‘stingiz botga qo‘shiladi</div><div class="referral-step"><b>03</b>Bonuslaringizni kuzating</div></div></section><div class="stat-grid">${stat('users','Taklif qilinganlar',data.referrals,'nafar')}${stat('gift','Bonuslaringiz',data.user.bonus,'kun')}${stat('shield','Shaxsiy kabinet','24/7')}</div><button class="btn" data-section="referral">Batafsil referal ma’lumotlari ${icon('arrow')}</button>`;
}
function render() {
  nav();
  if (page === 'workspace') { renderWorkspace(); return; }
  main.innerHTML = ({home,account,referral}[page] || home)();
}
function navigate(target) {
  if (!data) return;
  if (busy) return toast('Oldingi amal tugashini kuting.');
  if (!['home','account','referral'].includes(target)) target='home';
  page=target; activeSection=''; render(); window.scrollTo({top:0});
  if (tg?.BackButton) tg.BackButton.hide();
}
function renderWorkspace() {
  nav();
  main.innerHTML = heading(sections[activeSection]?.[1] || 'Bot bilan ishlash','Mavjud botning barcha amallari — yangi interfeysda.') + demoBanner() + `<div class="workspace-head"><button class="text-btn" data-page="home">${icon('back')} Bosh sahifa</button><a class="text-btn" href="${escape(safeUrl(data.botUrl))}" target="_blank" rel="noopener noreferrer">Telegram chatida davom etish ↗</a></div><div class="conversation" id="conversation"></div><form class="composer" id="composer"><label title="Chek yoki rasm yuborish">${icon('upload')}<input type="file" id="photo" accept="image/jpeg,image/png,image/webp" aria-label="Chek yoki rasm yuborish"></label><input type="text" name="message" maxlength="4096" autocomplete="off" placeholder="Xabar yoki promo kod yozing…" aria-label="Botga xabar"><button class="btn btn-primary" type="submit">Yuborish ${icon('send')}</button></form><div class="workspace-note">Chek uchun avval tegishli «Chek yuborish» tugmasini bosing, keyin rasm tanlang. Stars to‘lovi, video va katta fayllar Telegram chatida ochiladi. Amallar bot chatida ham saqlanadi.</div>`;
  drawCards();
  if (tg?.BackButton) tg.BackButton.show();
}
function drawCards() {
  const container = document.querySelector('#conversation'); if (!container) return;
  container.innerHTML = cards.map((card, index)=>`<article class="bot-card">${card.media || card.invoice ? `<div class="media-note">${icon(card.invoice?'star':'book')}<span>${card.invoice ? 'Stars hisob-fakturasi bot chatiga yuborildi.' : 'Rasm, video yoki fayl bot chatida mavjud.'}</span><a href="${escape(safeUrl(data.botUrl))}" target="_blank" rel="noopener noreferrer">Ochish ↗</a></div>` : ''}<div class="bot-text">${richText(card.text)}</div><div class="inline-buttons">${card.buttons.map((row,r)=>`<div class="inline-row">${row.map((b,col)=>b.callback ? `<button class="btn" data-callback="${index},${r},${col}" ${busy?'disabled':''}>${escape(b.text)}</button>` : `<a class="btn" href="${escape(safeUrl(b.native ? data.botUrl : b.url))}" target="_blank" rel="noopener noreferrer">${escape(b.text)} ↗</a>`).join('')}</div>`).join('')}</div></article>`).join('') + (busy?'<div class="busy-indicator"><span class="loader"></span> Bot javob bermoqda…</div>':'');
  document.querySelectorAll('.composer input,.composer button').forEach(el=>el.disabled=busy);
}
async function doAction(payload) {
  const response = await api('action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if (response.cards.length) cards = response.cards;
  else if (!response.alerts.length) toast('Amal bajarildi. Zarur bo‘lsa Telegram chatini tekshiring.');
  response.alerts.forEach(toast); return response;
}
async function perform(task) {
  if (busy) return;
  if (demo) return toast('Bu dizayn namoyishi. Haqiqiy amallar uchun bot ichida oching.');
  busy=true; drawCards();
  try { await task(); } catch(error) { toast(error.message); }
  finally { busy=false; if (page==='workspace') drawCards(); }
}
async function openSection(section, tariffId) {
  if (!sections[section] || busy) return;
  if (demo) {
    if (['signal','course'].includes(section)) {
      activeSection=section;page='workspace';cards=[{id:0,text:section==='signal'?'VIP Signallar — namuna ko‘rinishi.\nHaqiqiy tarif va to‘lovlar uchun Mini App’ni Telegram bot ichida oching.':'Trading darslari — namuna ko‘rinishi.\nHaqiqiy darslar va obunalar Telegram orqali ishlaydi.',media:false,buttons:[]}];render();
      document.querySelector('#conversation').insertAdjacentHTML('afterbegin',`<div class="plans">${data.tariffs.filter(t=>t.product===section).map((p,i,all)=>planCard(p,i,all.length)).join('')}</div>`);
    } else toast('Haqiqiy funksiyalar uchun Mini App’ni Telegram bot ichida oching.');
    return;
  }
  activeSection=section;page='workspace';cards=[];render();window.scrollTo({top:0});
  await perform(async()=>{
    await doAction({text:sections[section][0]});
    if (tariffId) {
      let match;
      for (const card of cards) for (const row of card.buttons) for (const button of row) {
        if (button.callback === `${section==='course'?'course_tariff_':'tariff_'}${tariffId}`) match={callback:button.callback,message_id:card.id};
      }
      if (match) await doAction(match);
      else toast('Tarif yangilangan bo‘lishi mumkin. Ro‘yxatdan qayta tanlang.');
    }
  });
}
async function bootstrap() {
  if (busy) return;
  main.innerHTML='<div class="loading-state"><span class="loader"></span><h2>Maydoningiz tayyorlanmoqda…</h2></div>';
  try {
    data = demo ? {
      project:'Signal Club',user:{name:'Treyder',id:123456789,admin:false,bonus:0},
      tariffs:[{id:'demo-1',name:'1 oy',duration:'1 oy',product:'signal',price:25,base:25,discount:0},{id:'demo-3',name:'3 oy',duration:'3 oy',product:'signal',price:50,base:50,discount:0},{id:'demo-6',name:'6 oy',duration:'6 oy',product:'signal',price:100,base:100,discount:0},{id:'demo-course',name:'Trading kursi',duration:'1 oy',product:'course',price:25,base:25,discount:0}],
      subscriptions:[],payments:[],referrals:0,referralLink:'Telegram ichida shaxsiy havolangiz ko‘rinadi',botUrl:'',quiz:true,mode:'miniapp'
    } : await api('bootstrap');
    document.title=`${data.project} · Mini App`;document.querySelector('#avatar').textContent=data.user.name.slice(0,1).toUpperCase();
    page='home';activeSection='';cards=[];render();
  } catch(error) {
    main.innerHTML=`<section class="error-state">${icon('shield')}<h2>Mini App’ni ochib bo‘lmadi</h2><p>${escape(error.message)}</p><button class="btn btn-primary" data-retry>Qayta urinish ${icon('refresh')}</button><p>Bot chatida /start yuboring. Seans tugagan bo‘lsa, Mini App’ni yoping va qayta oching.</p></section>`;
  }
}
document.addEventListener('click', async event => {
  const el = event.target.closest('button,a'); if (!el) return;
  if (el.matches('[data-page]')) { event.preventDefault(); navigate(el.dataset.page); }
  else if (el.matches('[data-section]')) await openSection(el.dataset.section);
  else if (el.matches('[data-buy]')) await openSection(el.dataset.product,el.dataset.buy);
  else if (el.matches('[data-callback]')) {
    const [i,r,c]=el.dataset.callback.split(',').map(Number);const card=cards[i],button=card?.buttons[r]?.[c];
    if (button) await perform(()=>doAction({callback:button.callback,message_id:card.id}));
  } else if (el.matches('[data-retry],#refresh')) await bootstrap();
  else if (el.matches('[data-copy]')) {
    if (demo) return toast('Shaxsiy havola Telegram ichida ko‘rinadi.');
    try { await navigator.clipboard.writeText(data.referralLink); toast('Havola nusxalandi.'); } catch { toast('Havolani belgilab nusxalang.'); }
  } else if (el.matches('[data-share]')) {
    if (demo) return toast('Haqiqiy havola uchun Telegram bot ichida oching.');
    const url='https://t.me/share/url?url='+encodeURIComponent(data.referralLink)+'&text='+encodeURIComponent('Signal Club hamjamiyatiga qo‘shiling!');
    if(tg?.openTelegramLink) tg.openTelegramLink(url); else window.open(url,'_blank','noopener,noreferrer');
  }
});
document.addEventListener('submit',async event=>{
  if(event.target.id!=='composer')return;event.preventDefault();
  const input=event.target.elements.message;const text=input.value.trim();if(!text)return;
  await perform(async()=>{await doAction({text});input.value='';});
});
document.addEventListener('change',async event=>{
  if(event.target.id!=='photo')return;const file=event.target.files[0];if(!file)return;
  if(file.size>8*1024*1024){toast('Rasm 8 MB dan kichik bo‘lishi kerak.');event.target.value='';return;}
  await perform(async()=>{const form=new FormData();form.append('photo',file);const response=await api('upload',{method:'POST',body:form});cards=response.cards;response.alerts.forEach(toast);toast('Rasm yuborildi.');});
  event.target.value='';
});
if(tg){tg.ready();tg.expand();tg.setHeaderColor?.('#0a100f');tg.setBackgroundColor?.('#0a100f');tg.BackButton?.onClick(()=>navigate('home'));}
bootstrap();
