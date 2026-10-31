'use strict';
/* Iron Temple Desk — demo. All data lives in this browser (localStorage). */

const KEY = 'irontemple.desk.v1';

/* ---------- small helpers ---------- */
const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const TODAY = iso(new Date());
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const addMonths = (s, n) => {
  const d = parse(s), day = d.getDate();
  d.setMonth(d.getMonth() + n);
  if (d.getDate() !== day) d.setDate(0);
  return iso(d);
};
const planEnd = (start, months) => { const e = addMonths(start, months); return parse(e).getDate() === parse(start).getDate() ? addDays(e, -1) : e; };
const diff =(a, b) => Math.round((parse(a) - parse(b)) / 864e5);
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const fmt = s => { const d = parse(s); return `${d.getDate()} ${MON[d.getMonth()]}`; };
const fmtLong = s => { const d = parse(s); return `${DOW[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`; };
const money = n => '₹' + Math.round(n).toLocaleString('en-IN');
const moneyShort = n => n >= 100000 ? '₹' + (n / 100000).toFixed(1) + 'L' : n >= 1000 ? '₹' + (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : money(n);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const initials = n => n.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const first = n => n.trim().split(/\s+/)[0];
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

/* ---------- workout templates ---------- */
const ROUTINES = {
  beginner: { name: 'Beginner strength', days: [
    { name: 'Day A', items: ['Treadmill warm-up 10 min', 'Leg press 3 × 12', 'Lat pulldown 3 × 12', 'Chest press machine 3 × 12', 'Plank 3 × 30 s'] },
    { name: 'Day B', items: ['Cycling warm-up 10 min', 'Goblet squat 3 × 10', 'Seated row 3 × 12', 'Shoulder press machine 3 × 10', 'Crunches 3 × 15'] } ] },
  fatloss: { name: 'Fat loss', days: [
    { name: 'Circuit', items: ['Treadmill 20 min', 'Squats, push-ups, rows × 3 rounds', 'Kettlebell swings 3 × 15', 'Plank 3 × 40 s'] },
    { name: 'Cardio + core', items: ['Cross-trainer 25 min', 'Walking lunges 3 × 20', 'Mountain climbers 3 × 30 s', 'Leg raises 3 × 12'] } ] },
  muscle: { name: 'Muscle gain · Push/Pull/Legs', days: [
    { name: 'Push', items: ['Bench press 4 × 8', 'Incline dumbbell press 3 × 10', 'Shoulder press 3 × 10', 'Lateral raises 3 × 12', 'Triceps pushdown 3 × 12'] },
    { name: 'Pull', items: ['Deadlift 4 × 6', 'Lat pulldown 3 × 10', 'Barbell row 3 × 10', 'Face pulls 3 × 15', 'Biceps curl 3 × 12'] },
    { name: 'Legs', items: ['Back squat 4 × 8', 'Romanian deadlift 3 × 10', 'Leg press 3 × 12', 'Leg curl 3 × 12', 'Calf raises 4 × 15'] } ] },
  general: { name: 'General fitness', days: [
    { name: 'Full body', items: ['Cycling 15 min', 'Machine circuit × 2 rounds', 'Push-ups 3 × 10', 'Stretching 10 min'] } ] }
};

/* ---------- sample data ---------- */
const NAMES = ['Karthik Rai','Deeksha Shetty','Sujith Gowda','Raksha Poojary','Nithin Alva','Chaithra K','Manoj Kulal','Pranav Bhat',
  'Shreya Nayak','Akshay Poojary','Ganesh Acharya','Vinay Shenoy','Rakesh Bangera','Sandesh Kotian','Ashwini Hegde','Prajwal Suvarna',
  'Kavya Rao','Darshan Moolya','Rohith Salian','Shravya Kamath','Varun Kini','Pooja Devadiga','Sachin Amin','Yashas Bhandary',
  'Megha Pai','Lohith Gatty','Tejas Kudva','Anusha Mendon','Kiran Naik','Sumanth Ullal','Bhavya Karkera','Harish Puthran',
  'Navya Prabhu','Guru Prasad','Sneha Kotian','Abhishek Rao','Ramya Shetty','Chethan Gowda','Pavan Kumar','Divya Nayak',
  'Mithun Poojary','Nisha Bhat','Arjun Hegde','Shilpa Rai','Vikas Alva','Lavanya Acharya','Sharath Kulal','Keerthi Shenoy',
  'Puneeth Salian','Swathi Kamath','Naveen Amin','Rashmi Pai','Santosh Naik','Deepa Kini','Ajay Suvarna','Vidya Moolya',
  'Kishore Bangera','Anjali Prabhu','Ravi Devadiga','Smitha Kudva','Praveen Ullal','Jyothi Karkera'];

function rng(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

function seedData() {
  const r = rng(7);
  const S = {
    v: 1, seededOn: TODAY, lang: 'kn',
    gym: { name: 'Iron Temple', place: 'Alankar', trainer: 'Harshit' },
    plans: [
      { id: '1m', name: '1 month', months: 1, price: 800 },
      { id: '3m', name: '3 months', months: 3, price: 2100 },
      { id: '6m', name: '6 months', months: 6, price: 4000 },
      { id: '12m', name: '12 months', months: 12, price: 7500 } ],
    members: [], att: {}, done: {}, pays: [], sent: {}
  };
  const keys = Object.keys(ROUTINES);
  const markVisit = (id, d) => { (S.att[d] || (S.att[d] = [])).push(id); };

  NAMES.forEach((name, i) => {
    const id = 's' + i;
    let kind, expiry, plan = '1m';
    if (i < 2) { kind = 'drift'; expiry = addDays(TODAY, 3 + i * 2); }                 // the two with dues show up early
    else if (i < 7) { kind = 'drift'; expiry = addDays(TODAY, 2 + Math.floor(r() * 9)); }
    else if (i < 35) { kind = r() < 0.7 ? 'regular' : 'irregular'; if (r() < 0.15) plan = '3m';
      expiry = addDays(TODAY, Math.floor(r() * (plan === '3m' ? 85 : 30))); }
    else if (i < 47) { kind = r() < 0.6 ? 'regular' : 'irregular'; expiry = addDays(TODAY, 11 + Math.floor(r() * 19)); }
    else if (i < 56) { kind = 'lapsed'; expiry = addDays(TODAY, -(1 + Math.floor(r() * 28))); }
    else { kind = 'old'; expiry = addDays(TODAY, -(40 + Math.floor(r() * 150))); }
    const p = S.plans.find(x => x.id === plan);
    const start = addMonths(addDays(expiry, 1), -p.months);
    const joined = r() < 0.7 ? addDays(start, -Math.floor(r() * 300)) : start;
    const routine = kind === 'drift' && i % 2 ? 'fatloss' : keys[Math.floor(r() * keys.length)];
    const m = { id, name, phone: '', sample: true, plan, start, expiry, joined, routine, due: 0 };
    S.members.push(m);

    // attendance
    const prob = { regular: 0.82, irregular: 0.45, drift: 0.8, lapsed: 0.5, old: 0.45 }[kind];
    const stop = kind === 'drift' ? addDays(TODAY, -(4 + Math.floor(r() * 6))) :
                 kind === 'lapsed' ? addDays(expiry, -Math.floor(r() * 8)) : addDays(TODAY, -1);
    let d = joined > addDays(TODAY, -40) ? joined : addDays(TODAY, -40);
    const end = expiry < TODAY ? (stop < expiry ? stop : expiry) : stop;
    let n = 0;
    while (d <= end) {
      if (parse(d).getDay() !== 0 && r() < prob) {
        markVisit(id, d);
        const R = ROUTINES[routine], day = R.days[n % R.days.length];
        const idx = day.items.map((_, k) => k).filter(() => r() < (kind === 'regular' ? 0.92 : 0.7));
        S.done[id + '|' + d] = idx;
        n++;
      }
      d = addDays(d, 1);
    }
    if (expiry >= TODAY && parse(TODAY).getDay() !== 0) {
      const t = kind === 'regular' ? 0.5 : kind === 'irregular' ? 0.18 : 0;
      if (r() < t) markVisit(id, TODAY);
    }
    // payment for the current plan
    S.pays.push({ id: 'p' + i, member: id, amount: p.price, date: start, note: p.name + ' plan' });
  });
  // two members owe money (matches Iron Temple's current dashboard: ₹1,100 from 2 members)
  const owe = [[0, 700], [1, 400]];
  owe.forEach(([i, a]) => { S.members[i].due = a; S.pays.find(p => p.member === 's' + i).amount -= a; });
  return S;
}

/* ---------- state ---------- */
let S;
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) { S = JSON.parse(raw); return; } } catch (e) { /* fall through */ }
  S = seedData(); save();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage blocked: keep in memory */ } }
load();

/* ---------- derived data ---------- */
function visitsIndex() {
  const v = {};
  for (const [d, ids] of Object.entries(S.att)) for (const id of ids) (v[id] || (v[id] = [])).push(d);
  for (const k in v) v[k].sort();
  return v;
}
let V = visitsIndex();
const member = id => S.members.find(m => m.id === id);
const plan = id => S.plans.find(p => p.id === id) || S.plans[0];
const isIn = (id, d = TODAY) => (S.att[d] || []).includes(id);
const daysLeft = m => diff(m.expiry, TODAY);
const isActive = m => daysLeft(m) >= 0;
function lastVisit(m) { const v = V[m.id]; return v && v.length ? v[v.length - 1] : null; }
function daysAway(m) { const l = lastVisit(m); return l ? diff(TODAY, l) : diff(TODAY, m.start); }
function atRisk(m) { return isActive(m) && !isIn(m.id) && daysAway(m) >= 4; }
function routineDay(m, date = TODAY) {
  const R = ROUTINES[m.routine] || ROUTINES.general;
  const before = (V[m.id] || []).filter(d => d < date).length;
  return { R, i: before % R.days.length, day: R.days[before % R.days.length] };
}
function lists() {
  const act = S.members.filter(isActive);
  return {
    active: act,
    risk: act.filter(atRisk).sort((a, b) => daysLeft(a) - daysLeft(b) || daysAway(b) - daysAway(a)),
    renew: act.filter(m => daysLeft(m) <= 10).sort((a, b) => daysLeft(a) - daysLeft(b)),
    dues: S.members.filter(m => m.due > 0).sort((a, b) => b.due - a.due),
    lapsed: S.members.filter(m => daysLeft(m) < 0 && daysLeft(m) >= -30).sort((a, b) => daysLeft(b) - daysLeft(a)),
    today: S.att[TODAY] || []
  };
}
const leftText = m => { const l = daysLeft(m); return l < 0 ? `Expired ${fmt(m.expiry)}` : l === 0 ? 'Ends today' : l === 1 ? 'Ends tomorrow' : `Ends in ${l} days`; };
const leftPill = m => { const l = daysLeft(m); return `<span class="pill ${l < 0 ? 'risk' : l <= 3 ? 'warn' : l <= 10 ? 'warn' : 'ok'}">${leftText(m)}</span>`; };

/* ---------- icons ---------- */
const I = {
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  tick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
};

/* ---------- WhatsApp messages ---------- */
const MSG = {
  renew: { title: 'Renewal reminder',
    en: (n, m) => `Hi ${n}, your ${S.gym.name} membership ${daysLeft(m) < 0 ? 'ended on ' + fmt(m.expiry) : 'ends on ' + fmt(m.expiry)}. Renew at the desk or pay by UPI to keep training without a break. See you at the gym!\n– ${S.gym.trainer}`,
    kn: (n, m) => `ನಮಸ್ಕಾರ ${n}, ನಿಮ್ಮ ${S.gym.name} ಸದಸ್ಯತ್ವ ${fmt(m.expiry)} ರಂದು ${daysLeft(m) < 0 ? 'ಮುಗಿದಿದೆ' : 'ಮುಗಿಯುತ್ತದೆ'}. ವಿರಾಮವಿಲ್ಲದೆ ತರಬೇತಿ ಮುಂದುವರಿಸಲು ಕೌಂಟರ್‌ನಲ್ಲಿ ಅಥವಾ UPI ಮೂಲಕ ನವೀಕರಿಸಿ. ಜಿಮ್‌ನಲ್ಲಿ ಸಿಗೋಣ!\n– ${S.gym.trainer}` },
  miss: { title: 'Check-in message',
    en: (n, m) => `Hi ${n}, haven't seen you at ${S.gym.name} for ${daysAway(m)} days. All okay? Your ${routineDay(m).day.name} workout is waiting. Come in today and we'll pick up where you left off.\n– ${S.gym.trainer}`,
    kn: (n, m) => `ನಮಸ್ಕಾರ ${n}, ${daysAway(m)} ದಿನಗಳಿಂದ ಜಿಮ್‌ನಲ್ಲಿ ಕಾಣಿಸಿಲ್ಲ. ಎಲ್ಲಾ ಚೆನ್ನಾಗಿದೆಯಾ? ನಿಮ್ಮ ವರ್ಕೌಟ್ ಕಾಯುತ್ತಿದೆ. ಇವತ್ತು ಬನ್ನಿ, ನಿಲ್ಲಿಸಿದಲ್ಲಿಂದ ಮುಂದುವರಿಸೋಣ.\n– ${S.gym.trainer}` },
  due: { title: 'Dues reminder',
    en: (n, m) => `Hi ${n}, ${money(m.due)} is pending on your ${S.gym.name} account. You can pay at the desk or by UPI on your next visit. Thanks!\n– ${S.gym.trainer}`,
    kn: (n, m) => `ನಮಸ್ಕಾರ ${n}, ನಿಮ್ಮ ${S.gym.name} ಖಾತೆಯಲ್ಲಿ ${money(m.due)} ಬಾಕಿ ಇದೆ. ಮುಂದಿನ ಭೇಟಿಯಲ್ಲಿ ಕೌಂಟರ್‌ನಲ್ಲಿ ಅಥವಾ UPI ಮೂಲಕ ಪಾವತಿಸಬಹುದು. ಧನ್ಯವಾದಗಳು!\n– ${S.gym.trainer}` },
  back: { title: 'Win-back message',
    en: (n, m) => `Hi ${n}, we miss you at ${S.gym.name}! Your membership ended on ${fmt(m.expiry)}. Come back this week and we'll set up a fresh plan for you.\n– ${S.gym.trainer}`,
    kn: (n, m) => `ನಮಸ್ಕಾರ ${n}, ${S.gym.name} ನಿಮ್ಮನ್ನು ಮಿಸ್ ಮಾಡುತ್ತಿದೆ! ನಿಮ್ಮ ಸದಸ್ಯತ್ವ ${fmt(m.expiry)} ರಂದು ಮುಗಿದಿದೆ. ಈ ವಾರ ಮತ್ತೆ ಬನ್ನಿ, ನಿಮಗಾಗಿ ಹೊಸ ಪ್ಲಾನ್ ಮಾಡೋಣ.\n– ${S.gym.trainer}` }
};
const sentToday = (id, kind) => S.sent[id + '|' + kind] === TODAY;
function waBtn(m, kind) {
  const d = sentToday(m.id, kind);
  return `<button class="btn-wa${d ? ' done' : ''}" data-a="wa" data-id="${m.id}" data-kind="${kind}">${d ? 'Sent' : I.wa + 'Remind'}</button>`;
}

/* ---------- rows ---------- */
function rowLink(m, metaHtml, right = I.chev) {
  return `<div class="row"><a class="who" href="#/m/${m.id}" style="display:flex;gap:12px;align-items:center">
    <span class="av${isIn(m.id) ? ' in' : ''}">${esc(initials(m.name))}</span>
    <span style="min-width:0;flex:1"><span class="nm">${esc(m.name)}</span><span class="meta">${metaHtml}</span></span></a>${right}</div>`;
}
const moreRow = (n, href, label) => `<a class="row more" href="${href}"><span>${label || 'See all ' + n}</span>${I.chev}</a>`;

/* ---------- views ---------- */
function vToday() {
  const L = lists();
  const dueTotal = L.dues.reduce((s, m) => s + m.due, 0);
  const riskTop = L.risk.slice(0, 5), renewTop = L.renew.slice(0, 5);
  return `
  <header class="top">
    <div><div class="gym">${esc(S.gym.name)}</div><div class="place">${esc(S.gym.place)} · Trainer: ${esc(S.gym.trainer)}</div></div>
    <div class="top-r"><div class="date"><b>${fmtLong(TODAY)}</b>${L.today.length} checked in</div>
      <button class="icon-btn" data-a="settings" aria-label="Settings">${I.gear}</button></div>
  </header>
  <div class="strip" aria-label="At a glance">
    <a class="stat" href="#/members/active"><div class="n">${L.active.length}</div><div class="l">Active members</div></a>
    <a class="stat risk" href="#/members/away"><div class="n">${L.risk.length}</div><div class="l">Not coming</div></a>
    <a class="stat warn" href="#/members/soon"><div class="n">${L.renew.length}</div><div class="l">Renew in 10 days</div></a>
    <a class="stat" href="#/payments"><div class="n">${moneyShort(dueTotal)}</div><div class="l">Dues pending</div></a>
  </div>

  <section class="sec">
    <div class="sec-h"><h2>Call before they quit <span class="count risk">${L.risk.length}</span></h2></div>
    <div class="sub" style="margin-top:-6px">Active members who haven't come in 4 or more days. Soonest renewal first.</div>
    <div class="list">${riskTop.length ? riskTop.map(m => rowLink(m,
      `<span class="pill risk">Away ${daysAway(m)} days</span><span>${leftText(m)}</span>`, waBtn(m, 'miss'))).join('') +
      (L.risk.length > riskTop.length ? moreRow(L.risk.length, '#/members/away') : '')
      : '<div class="empty">Everyone has been in this week.</div>'}</div>
  </section>

  <section class="sec">
    <div class="sec-h"><h2>Renewals due <span class="count warn">${L.renew.length}</span></h2><span class="sub">next 10 days</span></div>
    <div class="list">${renewTop.length ? renewTop.map(m => rowLink(m,
      `${leftPill(m)}<span>${esc(plan(m.plan).name)}</span>`, waBtn(m, 'renew'))).join('') +
      (L.renew.length > renewTop.length ? moreRow(L.renew.length, '#/members/soon') : '')
      : '<div class="empty">No renewals in the next 10 days.</div>'}</div>
  </section>

  <section class="sec">
    <div class="sec-h"><h2>Dues</h2><span class="sub">${money(dueTotal)} from ${plural(L.dues.length, 'member')}</span></div>
    <div class="list">${L.dues.length ? L.dues.map(m => rowLink(m,
      `<span>${leftText(m)}</span>`, `<span class="money">${money(m.due)}</span>${waBtn(m, 'due')}`)).join('')
      : '<div class="empty">Nobody owes anything.</div>'}</div>
  </section>

  <a class="lapsed" href="#/members/lapsed">
    <span class="big">${L.lapsed.length}</span>
    <p><b>didn't renew in the last 30 days</b><span>Open the win-back list and send a friendly message.</span></p>
  </a>
  ${S.members.some(m => m.sample) ? `<p class="demo">This is a demo. The members are sample data and everything you add stays on this phone. Reset it any time from Settings.</p>` : ''}`;
}

const FILTERS = {
  active: { label: 'Active', fn: isActive },
  away: { label: 'Not coming', fn: atRisk },
  soon: { label: 'Renew soon', fn: m => isActive(m) && daysLeft(m) <= 10 },
  dues: { label: 'Dues', fn: m => m.due > 0 },
  lapsed: { label: 'Expired', fn: m => daysLeft(m) < 0 },
  all: { label: 'All', fn: () => true }
};
let memberQuery = '';
function vMembers(f = 'active') {
  if (!FILTERS[f]) f = 'active';
  return `
  <div class="page-h"><h1>Members</h1><a class="btn primary" href="#/add">+ Add</a></div>
  <input class="search" id="q" type="search" placeholder="Search by name or phone" value="${esc(memberQuery)}" autocomplete="off" aria-label="Search members">
  <div class="chips" role="group" aria-label="Filter">${Object.entries(FILTERS).map(([k, x]) =>
    `<a class="chip" href="#/members/${k}" aria-pressed="${k === f}">${x.label} <span>${S.members.filter(x.fn).length}</span></a>`).join('')}</div>
  <div class="list" id="mlist" data-filter="${f}">${memberRows(f)}</div>`;
}
function memberRows(f) {
  const q = memberQuery.trim().toLowerCase();
  let ms = S.members.filter(FILTERS[f].fn).filter(m => !q || m.name.toLowerCase().includes(q) || (m.phone || '').includes(q));
  if (f === 'away') ms.sort((a, b) => daysLeft(a) - daysLeft(b));
  else if (f === 'soon') ms.sort((a, b) => daysLeft(a) - daysLeft(b));
  else if (f === 'lapsed') ms.sort((a, b) => b.expiry.localeCompare(a.expiry));
  else if (f === 'dues') ms.sort((a, b) => b.due - a.due);
  else ms.sort((a, b) => a.name.localeCompare(b.name));
  if (!ms.length) return `<div class="empty">${q ? 'No member matches “' + esc(q) + '”.' : 'Nobody here.'}</div>`;
  const right = m => f === 'away' ? waBtn(m, 'miss') : f === 'soon' ? waBtn(m, 'renew') : f === 'dues' ? waBtn(m, 'due')
    : f === 'lapsed' ? waBtn(m, 'back') : I.chev;
  return ms.map(m => rowLink(m, `${leftPill(m)}${m.due > 0 ? `<span class="pill risk">Owes ${money(m.due)}</span>` : ''}${
    isIn(m.id) ? '<span class="pill ok">In today</span>' : isActive(m) && daysAway(m) >= 4 ? `<span>Away ${daysAway(m)} days</span>` : ''}`, right(m))).join('');
}

let checkQuery = '';
function vCheckin() {
  const L = lists();
  return `
  <div class="page-h"><h1>Check-in</h1><div style="text-align:right"><div class="big-count">${L.today.length}</div><div class="sub">in today</div></div></div>
  <p class="sub" style="margin:-10px 0 0">${fmtLong(TODAY)}. Tap the box when a member walks in.</p>
  <input class="search" id="cq" type="search" placeholder="Type a name" value="${esc(checkQuery)}" autocomplete="off" aria-label="Find member">
  <div class="list" id="clist">${checkRows()}</div>`;
}
function checkRows() {
  const q = checkQuery.trim().toLowerCase();
  const ms = S.members.filter(m => (isActive(m) || isIn(m.id) || daysLeft(m) >= -30) && (!q || m.name.toLowerCase().includes(q)))
    .sort((a, b) => (isIn(b.id) - isIn(a.id)) || (isActive(b) - isActive(a)) || a.name.localeCompare(b.name));
  if (!ms.length) return `<div class="empty">No member matches “${esc(q)}”.</div>`;
  return ms.map(m => {
    const on = isIn(m.id), rd = routineDay(m);
    return rowLink(m, isActive(m)
      ? `<span>Today: ${esc(rd.day.name)} · ${esc(rd.R.name)}</span>${m.due > 0 ? `<span class="pill risk">Owes ${money(m.due)}</span>` : ''}`
      : `<span class="pill risk">Expired ${fmt(m.expiry)}</span>`,
      `<button class="tick${on ? ' on' : ''}" data-a="checkin" data-id="${m.id}" aria-pressed="${on}" aria-label="${on ? 'Undo check-in for' : 'Check in'} ${esc(m.name)}">${I.tick}</button>`);
  }).join('');
}

function vPayments() {
  const L = lists();
  const monthKey = TODAY.slice(0, 7);
  const thisMonth = S.pays.filter(p => p.date.startsWith(monthKey));
  const total = thisMonth.reduce((s, p) => s + p.amount, 0);
  const recent = [...S.pays].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 25);
  const dueTotal = L.dues.reduce((s, m) => s + m.due, 0);
  return `
  <div class="page-h"><h1>Payments</h1></div>
  <div class="strip" style="grid-template-columns:repeat(3,1fr)">
    <div class="stat"><div class="n">${moneyShort(total)}</div><div class="l">Collected in ${MON[parse(TODAY).getMonth()]}</div></div>
    <div class="stat"><div class="n">${thisMonth.length}</div><div class="l">Payments in ${MON[parse(TODAY).getMonth()]}</div></div>
    <div class="stat ${dueTotal ? 'risk' : ''}"><div class="n">${moneyShort(dueTotal)}</div><div class="l">Pending dues</div></div>
  </div>
  <section class="sec">
    <div class="sec-h"><h2>Pending dues</h2></div>
    <div class="list">${L.dues.length ? L.dues.map(m => rowLink(m, `<span>${leftText(m)}</span>`,
      `<span class="money">${money(m.due)}</span><button class="btn" style="padding:7px 11px;font-size:13px" data-a="pay" data-id="${m.id}">Received</button>`)).join('')
      : '<div class="empty">Nobody owes anything.</div>'}</div>
  </section>
  <section class="sec">
    <div class="sec-h"><h2>Recent payments</h2></div>
    <div class="list">${recent.map(p => { const m = member(p.member); if (!m) return '';
      return rowLink(m, `<span>${fmt(p.date)}</span><span>${esc(p.note)}</span>`, `<span class="money">${money(p.amount)}</span>`); }).join('')}</div>
  </section>`;
}

function vMember(id) {
  const m = member(id);
  if (!m) return `<div class="page-h"><a class="icon-btn" href="#/members">${I.back}</a><h1>Not found</h1></div><p class="empty">This member was removed.</p>`;
  const p = plan(m.plan), on = isIn(m.id), rd = routineDay(m);
  const key = m.id + '|' + TODAY, done = S.done[key] || [];
  const pct = Math.round(done.length / rd.day.items.length * 100);
  const v = V[m.id] || [];
  const last30 = v.filter(d => diff(TODAY, d) < 30).length;
  // 4-week grid ending this week (Mon-start)
  const todayDow = (parse(TODAY).getDay() + 6) % 7;
  const gridStart = addDays(TODAY, -todayDow - 21);
  let cells = '';
  for (let k = 0; k < 28; k++) {
    const d = addDays(gridStart, k);
    const cls = d > TODAY ? 'f' : (v.includes(d) ? 'y' : '') + (d === TODAY ? ' t' : '');
    cells += `<i class="${cls}" title="${fmt(d)}"></i>`;
  }
  const pays = S.pays.filter(x => x.member === m.id).sort((a, b) => b.date.localeCompare(a.date));
  const phone = m.phone ? `<a href="tel:+91${esc(m.phone)}" style="color:var(--accent);font-weight:600">${esc(m.phone.replace(/(\d{5})(\d{5})/, '$1 $2'))}</a>` : `<span>${m.sample ? 'Sample member, no phone' : 'No phone number'}</span>`;
  return `
  <div class="page-h"><button class="icon-btn" data-a="back" aria-label="Back">${I.back}</button><h1 style="font-size:22px">Member</h1></div>
  <div class="card">
    <div class="m-head"><span class="av${on ? ' in' : ''}">${esc(initials(m.name))}</span>
      <div style="min-width:0"><div class="m-name">${esc(m.name)}</div><div class="meta">${phone}</div></div></div>
    <div class="meta">${leftPill(m)}${m.due > 0 ? `<span class="pill risk">Owes ${money(m.due)}</span>` : ''}${on ? '<span class="pill ok">In today</span>' : ''}${atRisk(m) ? `<span class="pill risk">Away ${daysAway(m)} days</span>` : ''}</div>
    <div class="kv">
      <div><div class="k">Plan</div><div class="v">${esc(p.name)}</div></div>
      <div><div class="k">Valid till</div><div class="v">${fmt(m.expiry)}</div></div>
      <div><div class="k">Member since</div><div class="v">${fmt(m.joined)} ${parse(m.joined).getFullYear() !== parse(TODAY).getFullYear() ? parse(m.joined).getFullYear() : ''}</div></div>
    </div>
    <div class="btn-row">
      <button class="btn ${on ? '' : 'ok'}" data-a="checkin" data-id="${m.id}">${on ? 'Undo check-in' : 'Check in today'}</button>
      <button class="btn primary" data-a="renew" data-id="${m.id}">Renew</button>
      ${m.due > 0 ? `<button class="btn" data-a="pay" data-id="${m.id}">Dues received</button>` : ''}
    </div>
    <div class="btn-row">
      <button class="btn wa" data-a="wa" data-id="${m.id}" data-kind="${daysLeft(m) < 0 ? 'back' : m.due > 0 ? 'due' : atRisk(m) ? 'miss' : 'renew'}">${I.wa} WhatsApp</button>
    </div>
  </div>

  <section class="sec">
    <div class="sec-h"><h2>Today's workout</h2><span class="sub">${esc(rd.day.name)} · ${done.length}/${rd.day.items.length} done</span></div>
    <div class="card">
      <div class="progress" aria-hidden="true"><b style="width:${pct}%"></b></div>
      <div class="check">${rd.day.items.map((it, k) => `<label><input type="checkbox" data-a="item" data-id="${m.id}" data-k="${k}" ${done.includes(k) ? 'checked' : ''}><span>${esc(it)}</span></label>`).join('')}</div>
      ${!on && isActive(m) ? '<div class="hint">Ticking an exercise also checks the member in for today.</div>' : ''}
      <div class="field"><label for="routine">Routine</label>
        <select id="routine" data-a="routine" data-id="${m.id}">${Object.entries(ROUTINES).map(([k, r]) => `<option value="${k}" ${k === m.routine ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select></div>
      <div class="hint">The next workout follows the member's visits, not the calendar. Missing a day doesn't skip a workout.</div>
    </div>
  </section>

  <section class="sec">
    <div class="sec-h"><h2>Attendance</h2><span class="sub">${last30} visits in 30 days</span></div>
    <div class="card">
      <div class="grid28">${['M','T','W','T','F','S','S'].map(x => `<div class="dh">${x}</div>`).join('')}${cells}</div>
      <div class="legend"><span class="y">Came</span><span>Didn't come</span><span>Last visit: ${lastVisit(m) ? fmt(lastVisit(m)) : 'none yet'}</span></div>
    </div>
  </section>

  <section class="sec">
    <div class="sec-h"><h2>Payments</h2></div>
    <div class="list">${pays.length ? pays.map(x => `<div class="row"><span class="who"><span class="nm">${esc(x.note)}</span><span class="meta">${fmt(x.date)} ${parse(x.date).getFullYear()}</span></span><span class="money">${money(x.amount)}</span></div>`).join('') : '<div class="empty">No payments recorded.</div>'}</div>
  </section>
  <button class="btn danger" data-a="delete" data-id="${m.id}" style="align-self:center;background:none">Remove member</button>`;
}

function vAdd() {
  const opts = S.plans.map(p => `<option value="${p.id}">${esc(p.name)} · ${money(p.price)}</option>`).join('');
  return `
  <div class="page-h"><h1>Add member</h1></div>
  <form class="form" id="addForm" novalidate>
    <div class="field"><label for="f-name">Name</label><input id="f-name" name="mname" autocomplete="off" required placeholder="e.g. Ramesh Shetty"></div>
    <div class="field"><label for="f-phone">WhatsApp number</label><input id="f-phone" name="phone" inputmode="numeric" maxlength="10" placeholder="10-digit mobile number"></div>
    <div class="two">
      <div class="field"><label for="f-plan">Plan</label><select id="f-plan" name="plan">${opts}</select></div>
      <div class="field"><label for="f-start">Starts</label><input id="f-start" name="start" type="date" value="${TODAY}"></div>
    </div>
    <div class="field"><label for="f-paid">Paid now (₹)</label><input id="f-paid" name="paid" inputmode="numeric" value="${S.plans[0].price}"></div>
    <div class="field"><label for="f-routine">Routine</label><select id="f-routine" name="routine">${Object.entries(ROUTINES).map(([k, r]) => `<option value="${k}">${esc(r.name)}</option>`).join('')}</select></div>
    <div class="summary" id="addSummary"></div>
    <div class="err" id="addErr" hidden></div>
    <button class="btn primary" type="submit" style="padding:14px">Add member</button>
  </form>`;
}
function addSummary() {
  const f = $('#addForm'); if (!f) return;
  const p = plan(f.plan.value), start = f.start.value || TODAY;
  const exp = planEnd(start, p.months);
  const paid = Number(f.paid.value.replace(/\D/g, '')) || 0;
  const bal = p.price - paid;
  $('#addSummary').innerHTML = `Valid till <b>${fmt(exp)} ${parse(exp).getFullYear()}</b>. ${bal > 0 ? `Balance due <b>${money(bal)}</b>.` : bal < 0 ? `Paid <b>${money(-bal)}</b> more than the plan price.` : 'Fully paid.'}`;
}

/* ---------- sheets ---------- */
function openSheet(html, focusSel) {
  $('#sheet').innerHTML = html; $('#scrim').hidden = false;
  const f = focusSel && $('#sheet ' + focusSel); (f || $('#sheet button'))?.focus();
}
function closeSheet() { $('#scrim').hidden = true; $('#sheet').innerHTML = ''; }
let waCtx = null;
function sheetWA(id, kind) {
  const m = member(id); waCtx = { id, kind };
  const text = MSG[kind][S.lang](first(m.name), m);
  openSheet(`
    <h3>${MSG[kind].title}</h3>
    <div class="sub">To ${esc(m.name)}${m.phone ? ' · ' + esc(m.phone) : ''}</div>
    <div class="seg" role="group" aria-label="Language">
      <button data-a="lang" data-l="kn" aria-pressed="${S.lang === 'kn'}">ಕನ್ನಡ</button>
      <button data-a="lang" data-l="en" aria-pressed="${S.lang === 'en'}">English</button></div>
    <textarea class="bubble" id="waText" aria-label="Message">${esc(text)}</textarea>
    ${m.phone ? '' : `<div class="hint">${m.sample ? 'Sample members have no number' : 'No number saved'}, so WhatsApp will ask you to pick a contact.</div>`}
    <div class="sheet-acts"><button class="btn" data-a="close">Cancel</button><button class="btn wa" data-a="waSend">${I.wa} Open WhatsApp</button></div>`, '[data-a="waSend"]');
}
function sheetRenew(id) {
  const m = member(id);
  const from = isActive(m) ? addDays(m.expiry, 1) : TODAY;
  openSheet(`
    <h3>Renew ${esc(first(m.name))}</h3>
    <div class="seg" role="group" aria-label="Plan" id="rPlans">${S.plans.map(p => `<button data-a="rplan" data-p="${p.id}" aria-pressed="${p.id === m.plan}">${esc(p.name)}<br><small>${money(p.price)}</small></button>`).join('')}</div>
    <div class="field"><label for="rPaid">Paid now (₹)</label><input id="rPaid" inputmode="numeric" value="${plan(m.plan).price}"></div>
    <div class="summary" id="rSum" data-id="${m.id}" data-from="${from}" data-plan="${m.plan}"></div>
    <div class="sheet-acts"><button class="btn" data-a="close">Cancel</button><button class="btn primary" data-a="renewSave">Renew</button></div>`, '#rPaid');
  renewSummary();
}
function renewSummary() {
  const el = $('#rSum'); if (!el) return;
  const p = plan(el.dataset.plan), from = el.dataset.from;
  const exp = planEnd(from, p.months);
  const paid = Number(($('#rPaid').value || '').replace(/\D/g, '')) || 0;
  const bal = p.price - paid;
  el.innerHTML = `${from === TODAY ? 'Starts today' : 'Continues from ' + fmt(from)}, valid till <b>${fmt(exp)} ${parse(exp).getFullYear()}</b>. ${bal > 0 ? `Adds <b>${money(bal)}</b> to dues.` : 'Fully paid.'}`;
}
function sheetPay(id) {
  const m = member(id);
  openSheet(`
    <h3>Dues received</h3>
    <div class="sub">${esc(m.name)} owes ${money(m.due)}</div>
    <div class="field"><label for="payAmt">Amount received (₹)</label><input id="payAmt" inputmode="numeric" value="${m.due}"></div>
    <div class="sheet-acts"><button class="btn" data-a="close">Cancel</button><button class="btn primary" data-a="paySave" data-id="${m.id}">Save</button></div>`, '#payAmt');
}
function sheetSettings() {
  openSheet(`
    <h3>Settings</h3>
    <div class="two">
      <div class="field"><label for="s-name">Gym name</label><input id="s-name" value="${esc(S.gym.name)}"></div>
      <div class="field"><label for="s-trainer">Trainer</label><input id="s-trainer" value="${esc(S.gym.trainer)}"></div>
    </div>
    <div class="field"><label for="s-place">Town</label><input id="s-place" value="${esc(S.gym.place)}"></div>
    <div class="field"><label>Plan prices (₹)</label>
      <div class="two">${S.plans.map(p => `<div class="field"><label for="s-p-${p.id}" style="text-transform:none;letter-spacing:0">${esc(p.name)}</label><input id="s-p-${p.id}" inputmode="numeric" value="${p.price}"></div>`).join('')}</div></div>
    <div class="sheet-acts"><button class="btn" data-a="close">Cancel</button><button class="btn primary" data-a="settingsSave">Save</button></div>
    <button class="btn danger" data-a="reset" style="background:none">Reset demo data</button>`);
}

/* ---------- toast ---------- */
let tt;
function toast(t) { const e = $('#toast'); e.textContent = t; e.hidden = false; clearTimeout(tt); tt = setTimeout(() => e.hidden = true, 2200); }

/* ---------- actions ---------- */
function setCheckin(id, on) {
  const arr = S.att[TODAY] || (S.att[TODAY] = []);
  const i = arr.indexOf(id);
  if (on && i < 0) arr.push(id);
  if (!on && i >= 0) arr.splice(i, 1);
  save(); V = visitsIndex();
}
function toggleCheckin(id) {
  const m = member(id), on = !isIn(id);
  setCheckin(id, on);
  if (on && !isActive(m)) toast(`${first(m.name)}'s plan expired on ${fmt(m.expiry)}. Renew it from the member page.`);
  else if (on && m.due > 0) toast(`${first(m.name)} checked in. Owes ${money(m.due)}.`);
  else toast(on ? `${first(m.name)} checked in` : `Check-in removed`);
}

const confirmArm = {};
function armed(key, btn, label) {
  if (confirmArm[key] && Date.now() - confirmArm[key] < 4000) { delete confirmArm[key]; return true; }
  confirmArm[key] = Date.now(); btn.textContent = label; return false;
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el) return;
  const a = el.dataset.a, id = el.dataset.id;
  if (el.tagName === 'INPUT' || el.tagName === 'SELECT') return; // handled on change
  e.preventDefault();
  switch (a) {
    case 'wa': sheetWA(id, el.dataset.kind); break;
    case 'lang': S.lang = el.dataset.l; save(); sheetWA(waCtx.id, waCtx.kind); break;
    case 'waSend': {
      const m = member(waCtx.id), text = $('#waText').value;
      const url = (m.phone ? `https://wa.me/91${m.phone}` : 'https://wa.me/') + '?text=' + encodeURIComponent(text);
      window.open(url, '_blank', 'noopener');
      S.sent[m.id + '|' + waCtx.kind] = TODAY; save(); closeSheet(); render();
      toast('Opened WhatsApp. Marked as reminded today.');
      break; }
    case 'close': closeSheet(); break;
    case 'back': if (history.length > 1) history.back(); else location.hash = '#/members'; break;
    case 'checkin': toggleCheckin(id); render(); break;
    case 'renew': sheetRenew(id); break;
    case 'rplan': {
      document.querySelectorAll('#rPlans button').forEach(b => b.setAttribute('aria-pressed', b === el));
      $('#rSum').dataset.plan = el.dataset.p; $('#rPaid').value = plan(el.dataset.p).price; renewSummary(); break; }
    case 'renewSave': {
      const s = $('#rSum'), m = member(s.dataset.id), p = plan(s.dataset.plan);
      const paid = Number(($('#rPaid').value || '').replace(/\D/g, '')) || 0;
      m.plan = p.id; m.start = s.dataset.from; m.expiry = planEnd(s.dataset.from, p.months);
      m.due = Math.max(0, m.due + p.price - paid);
      if (paid > 0) S.pays.push({ id: 'p' + Date.now(), member: m.id, amount: paid, date: TODAY, note: p.name + ' renewal' });
      save(); closeSheet(); render(); toast(`Renewed till ${fmt(m.expiry)}`); break; }
    case 'pay': sheetPay(id); break;
    case 'paySave': {
      const m = member(id), amt = Math.min(m.due, Number(($('#payAmt').value || '').replace(/\D/g, '')) || 0);
      if (!amt) { toast('Enter the amount received'); break; }
      m.due -= amt; S.pays.push({ id: 'p' + Date.now(), member: m.id, amount: amt, date: TODAY, note: 'Dues' });
      save(); closeSheet(); render(); toast(`${money(amt)} recorded`); break; }
    case 'settings': sheetSettings(); break;
    case 'settingsSave': {
      S.gym.name = $('#s-name').value.trim() || S.gym.name;
      S.gym.trainer = $('#s-trainer').value.trim() || S.gym.trainer;
      S.gym.place = $('#s-place').value.trim();
      S.plans.forEach(p => { const v = Number(($('#s-p-' + p.id).value || '').replace(/\D/g, '')); if (v) p.price = v; });
      save(); closeSheet(); render(); toast('Settings saved'); break; }
    case 'reset':
      if (armed('reset', el, 'Tap again to erase everything and reload sample data')) {
        S = seedData(); save(); V = visitsIndex(); closeSheet(); location.hash = '#/today'; render(); toast('Demo data reset');
      } break;
    case 'delete':
      if (armed('del' + id, el, 'Tap again to remove for good')) {
        S.members = S.members.filter(m => m.id !== id); S.pays = S.pays.filter(p => p.member !== id);
        for (const d in S.att) S.att[d] = S.att[d].filter(x => x !== id);
        save(); V = visitsIndex(); location.hash = '#/members'; toast('Member removed');
      } break;
  }
});

document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.a === 'item') {
    const m = member(el.dataset.id), key = m.id + '|' + TODAY, k = Number(el.dataset.k);
    const arr = S.done[key] || (S.done[key] = []);
    if (el.checked && !arr.includes(k)) arr.push(k);
    if (!el.checked) S.done[key] = arr.filter(x => x !== k);
    if (el.checked && !isIn(m.id) && isActive(m)) { setCheckin(m.id, true); toast(`${first(m.name)} checked in`); }
    save(); const y = scrollY; render(); scrollTo(0, y);
  } else if (el.dataset.a === 'routine') {
    member(el.dataset.id).routine = el.value; save(); const y = scrollY; render(); scrollTo(0, y); toast('Routine changed');
  }
});

document.addEventListener('input', e => {
  if (e.target.id === 'q') { memberQuery = e.target.value; $('#mlist').innerHTML = memberRows($('#mlist').dataset.filter); }
  if (e.target.id === 'cq') { checkQuery = e.target.value; $('#clist').innerHTML = checkRows(); }
  if (e.target.closest && e.target.closest('#addForm')) { addSummary(); $('#addErr').hidden = true; }
  if (e.target.id === 'rPaid') renewSummary();
});

document.addEventListener('submit', e => {
  if (e.target.id !== 'addForm') return;
  e.preventDefault();
  const f = e.target, err = $('#addErr');
  const name = f.mname.value.trim(), phone = f.phone.value.replace(/\D/g, '');
  const problems = [];
  if (!name) problems.push('Enter the member’s name.');
  if (phone && phone.length !== 10) problems.push('The phone number needs 10 digits.');
  if (problems.length) { err.textContent = problems.join(' '); err.hidden = false; return; }
  const p = plan(f.plan.value), start = f.start.value || TODAY;
  const paid = Number(f.paid.value.replace(/\D/g, '')) || 0;
  const m = { id: uid(), name, phone, sample: false, plan: p.id, start, expiry: planEnd(start, p.months),
    joined: start, routine: f.routine.value, due: Math.max(0, p.price - paid) };
  S.members.push(m);
  if (paid > 0) S.pays.push({ id: 'p' + Date.now(), member: m.id, amount: paid, date: TODAY, note: p.name + ' plan' });
  save(); location.hash = '#/m/' + m.id; toast(`${first(name)} added`);
});

document.addEventListener('change', e => {
  if (e.target.closest && e.target.closest('#addForm')) {
    if (e.target.name === 'plan') e.target.form.paid.value = plan(e.target.value).price;
    addSummary();
  }
});

$('#scrim').addEventListener('click', e => { if (e.target.id === 'scrim') closeSheet(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#scrim').hidden) closeSheet(); });

/* ---------- router ---------- */
function render() {
  const h = location.hash.replace(/^#\/?/, '') || 'today';
  const [page, arg] = h.split('/');
  const view = $('#view');
  let html, tab = page;
  if (page === 'members') html = vMembers(arg);
  else if (page === 'checkin') html = vCheckin();
  else if (page === 'payments') html = vPayments();
  else if (page === 'add') html = vAdd();
  else if (page === 'm') { html = vMember(arg); tab = 'members'; }
  else { html = vToday(); tab = 'today'; }
  view.innerHTML = html;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === tab));
  if (page === 'add') addSummary();
}
let lastPage = '';
window.addEventListener('hashchange', () => {
  closeSheet(); render();
  const p = location.hash; if (p !== lastPage) { scrollTo(0, 0); lastPage = p; }
});
render();
