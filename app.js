/* ───────────────────────────────────────────────────────────
   네이처 멘토 2.0 — 프런트엔드 (GitHub Pages)
   백엔드: backend/Code.gs (Apps Script JSON API)
   ─────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  const CFG = window.NM_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = { get: (k, d) => { try { const v = localStorage.getItem('nm_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem('nm_' + k, JSON.stringify(v)); } catch (e) {} } };

  // ───────── 데이터 (오프라인에서도 쓰는 사본) ─────────
  const ORGANISMS = [
    ['상어', '동물', '🦈', '피부(비늘)'], ['물총새', '동물', '🐦', '부리'], ['도마뱀붙이(게코)', '동물', '🦎', '발바닥'], ['딱따구리', '동물', '🐦‍⬛', '머리와 부리'], ['올빼미', '동물', '🦉', '날개 깃털 가장자리'],
    ['모기', '동물', '🦟', '입(침)'], ['혹등고래', '동물', '🐋', '지느러미 앞쪽 혹'], ['흰개미', '동물', '🐜', '집(굴뚝)'], ['거미', '동물', '🕷️', '거미줄'], ['나미브사막 딱정벌레', '동물', '🪲', '등껍질'],
    ['북극곰', '동물', '🐻‍❄️', '털과 피부'], ['문어', '동물', '🐙', '빨판'], ['고양이', '동물', '🐱', '혀'], ['꿀벌', '동물', '🐝', '벌집'], ['박쥐', '동물', '🦇', '귀와 소리'],
    ['반딧불이', '동물', '✨', '배의 발광 부분'], ['코끼리', '동물', '🐘', '코'], ['오리', '동물', '🦆', '발'], ['돌고래', '동물', '🐬', '소리'], ['몰포나비', '동물', '🦋', '날개 비늘'],
    ['도꼬마리', '식물', '🌰', '열매의 가시'], ['연잎', '식물', '🪷', '잎 표면'], ['단풍나무 씨앗', '식물', '🍁', '씨앗의 날개'], ['민들레 씨앗', '식물', '🌼', '갓털'], ['솔방울', '식물', '🌲', '비늘'],
    ['해바라기', '식물', '🌻', '꽃의 방향'], ['선인장', '식물', '🌵', '가시와 줄기'], ['장미', '식물', '🌹', '줄기의 가시'], ['대나무', '식물', '🎋', '줄기'], ['파리지옥', '식물', '🪴', '잎'],
  ].map((r) => ({ name: r[0], type: r[1], emoji: r[2], look: r[3] }));
  const EMOJI = Object.fromEntries(ORGANISMS.map((o) => [o.name, o.emoji]));
  // ───────── 사진(Wikimedia Commons) · 구체 정보 · 검색 ─────────
  const DATA = window.NM_DATA || {};
  const WM = 'https://upload.wikimedia.org/wikipedia/commons/';
  const LEVELS = ['모습', '하는 일', '까닭', '발명'];
  function wmThumb(path, w) { return path ? `${WM}thumb/${path}/${w}px-${path.split('/').pop()}` : ''; }
  function photoTag(name, w = 330, cls = '', key = 'photo') {
    const d = DATA[name]; const emo = EMOJI[name] || '🌿';
    if (!d || !d[key]) return `<span class="emo">${emo}</span>`;
    const full = WM + d[key];
    return `<img class="${cls}" src="${wmThumb(d[key], w)}" alt="${esc(name)} 사진" loading="lazy" onerror="if(!this.dataset.f){this.dataset.f=1;this.src='${full}'}else{this.outerHTML='<span class=&quot;emo&quot;>${emo}</span>'}">`;
  }
  const SEARCH = [
    ['naver', '🟢 네이버', (q) => 'https://search.naver.com/search.naver?query=' + encodeURIComponent(q)],
    ['naverimg', '🖼️ 네이버 사진', (q) => 'https://search.naver.com/search.naver?where=image&query=' + encodeURIComponent(q)],
    ['dict', '📖 지식백과', (q) => 'https://terms.naver.com/search.naver?query=' + encodeURIComponent(q)],
    ['google', '🔵 구글', (q) => 'https://www.google.com/search?safe=active&q=' + encodeURIComponent(q)],
    ['googleimg', '🖼️ 구글 사진', (q) => 'https://www.google.com/search?safe=active&tbm=isch&q=' + encodeURIComponent(q)],
  ];
  function searchBar(q, org, compact) {
    return `<div class="search-row ${compact ? 'compact' : ''}">${SEARCH.filter((x) => !compact || x[0] !== 'dict').map(([k, l, f]) => `<a class="sbtn s-${k}" href="${f(q)}" target="_blank" rel="noopener" data-engine="${k}" data-q="${esc(q)}" data-org="${esc(org || '')}">${l}</a>`).join('')}</div>`;
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a.sbtn'); if (!a || !S.me) return;
    api('track', { engine: a.dataset.engine, query: a.dataset.q, organism: a.dataset.org, _soft: true }).catch(() => {});
  });

  const ITEMS = [
    ['CNI01', 'CNI', '나는 자연에서 나는 여러 가지 소리(새소리, 바람 소리 등)를 듣는 것이 좋다.'], ['CNI02', 'CNI', '나는 자연에서 피어 있는 들꽃을 보는 것이 좋다.'], ['CNI03', 'CNI', '나는 슬플 때 밖에 나가서 자연을 즐기는 것이 좋다.'], ['CNI04', 'CNI', '자연 속에 있으면 마음이 편안해진다.'],
    ['CNI05', 'CNI', '나는 식물을 가꾸는 것(화분, 텃밭 등)이 좋다.'], ['CNI06', 'CNI', '돌이나 조개껍데기를 모으는 것은 재미있다.'], ['CNI07', 'CNI', '야생 동물이 다치면 나는 슬프다.'], ['CNI08', 'CNI', '나는 야생 동물이 깨끗한 환경에서 사는 것을 보는 것이 좋다.'],
    ['CNI09', 'CNI', '나는 동물이나 식물을 만져 보는 것을 즐긴다.'], ['CNI10', 'CNI', '동물을 돌보는 것은 나에게 중요하다.'], ['CNI11', 'CNI', '사람은 자연의 한 부분이다.'], ['CNI12', 'CNI', '사람은 식물과 동물 없이는 살 수 없다.'],
    ['CNI13', 'CNI', '밖(자연)에 나가 있으면 나는 행복하다.'], ['CNI14', 'CNI', '내가 하는 행동은 자연을 다르게 만들 수 있다.'], ['CNI15', 'CNI', '땅에 떨어진 쓰레기를 줍는 것은 환경을 돕는 일이다.'], ['CNI16', 'CNI', '사람은 자연을 마음대로 바꿀 권리가 없다.'],
    ['CSE01', 'CSE', '나는 새로운 생각(아이디어)을 잘 떠올린다.'], ['CSE02', 'CSE', '나는 좋은 생각이 많다.'], ['CSE03', 'CSE', '나는 상상력이 풍부하다.'], ['CSE04', 'CSE', '나는 어려운 문제도 새로운 방법으로 풀 수 있다.'],
    ['CSE05', 'CSE', '나는 내 생각(아이디어)이 좋은 생각이라고 믿는다.'], ['CSE06', 'CSE', '나는 문제를 풀 때 남들과 다른 특별한 방법을 생각해 낼 수 있다.'],
    ['AIP01', 'AIP', '인공지능은 내가 스스로 생각하도록 도와주는 친구가 될 수 있다.'], ['AIP02', 'AIP', '인공지능이 질문을 하면 나는 더 깊이 생각하게 된다.'], ['AIP03', 'AIP', '인공지능과 함께 공부하는 것은 재미있다.'],
    ['AIP04', 'AIP', '인공지능이 말한 것이 맞는지 나는 스스로 확인해 본다.'], ['AIP05', 'AIP', '인공지능이 도와주어도 내 생각이 더 중요하다.'],
  ];
  const SECTIONS = { CNI: ['1. 자연과 나 🌳', '동물, 식물, 자연에 대한 내 마음을 솔직하게 골라요. 정답은 없어요.'], CSE: ['2. 생각하는 나 💡', '내가 생각하고 문제를 푸는 모습이에요.'], AIP: ['3. 인공지능(AI)과 나 🤖', '인공지능은 사람처럼 말하거나 질문하거나 그림을 그려 주는 컴퓨터 프로그램이에요.'] };
  const OPEN_Q = ['6번의 수업 중에서 가장 기억에 남는 활동은 무엇인가요? 왜 그런가요?', 'AI 네이처 멘토와 함께 공부할 때 좋았던 점과 어려웠던 점을 써 주세요.', '수업을 하고 나서 동물이나 식물을 보는 내 마음이 달라진 점이 있나요?'];
  const SCALE = [[5, '⑤', '매우 그렇다'], [4, '④', '그렇다'], [3, '③', '보통이다'], [2, '②', '아니다'], [1, '①', '전혀 아니다']];

  const QUIZ = [
    { inv: '전신 수영복', ie: '🩱', q: '물 저항을 줄여 빠르게 헤엄치게 해 주는 전신 수영복의 선생님은?', opts: ['상어', '돌고래', '금붕어'], oe: ['🦈', '🐬', '🐠'], ans: 0, secret: '피부의 아주 작은 돌기 덕분에 물이 미끄러지듯 흘러가요.', ladder: ['작은 돌기가 줄지어 있는 피부', '물의 저항을 줄여요', '전신 수영복, 배 바닥'] },
    { inv: '고속열차 앞부분', ie: '🚄', q: '터널에서 "펑" 소리가 나던 고속열차의 뾰족한 앞부분, 선생님은?', opts: ['독수리', '물총새', '펭귄'], oe: ['🦅', '🐦', '🐧'], ans: 1, secret: '길고 뾰족한 부리로 물에 들어갈 때 물이 거의 튀지 않아요.', ladder: ['길고 뾰족한 부리', '물을 조용히 가르며 들어가요', '고속열차 앞부분'] },
    { inv: '방수 옷·우산', ie: '☂️', q: '물방울이 구슬처럼 또르르 굴러가는 방수 옷과 우산의 선생님은?', opts: ['선인장', '단풍잎', '연잎'], oe: ['🌵', '🍁', '🪷'], ans: 2, secret: '잎 표면의 작은 돌기와 왁스가 물방울을 굴려 먼지까지 씻어 가요.', ladder: ['작은 돌기 + 왁스', '물이 스며들지 않고 굴러가요', '방수 옷, 우산, 유리창'] },
    { inv: '벽 타는 로봇', ie: '🤖', q: '벽과 천장을 끈끈이 없이 기어오르는 로봇은 누구를 흉내 냈을까?', opts: ['개구리', '도마뱀붙이', '달팽이'], oe: ['🐸', '🦎', '🐌'], ans: 1, secret: '발바닥의 아주 가는 털 수백만 개가 벽에 착 달라붙어요.', ladder: ['아주 가는 털이 가득한 발', '벽에 꼭 달라붙어요', '벽 타는 로봇, 붙였다 떼는 테이프'] },
    { inv: '드론 날개', ie: '🚁', q: '한 개의 날개로 빙글빙글 돌며 천천히 내려오는 드론 날개의 선생님은?', opts: ['민들레 씨앗', '솔방울', '단풍나무 씨앗'], oe: ['🌼', '🌲', '🍁'], ans: 2, secret: '한쪽으로 치우친 날개 덕분에 빙글빙글 돌며 천천히 멀리 날아가요.', ladder: ['날개 모양 씨앗', '돌면서 천천히 내려와요', '드론 날개, 씨앗 뿌리는 비행기'] },
    { inv: '안전 헬멧', ie: '⛑️', q: '머리를 지켜 주는 안전 헬멧의 선생님은 어떤 동물일까?', opts: ['딱따구리', '참새', '부엉이'], oe: ['🐦‍⬛', '🐤', '🦉'], ans: 0, secret: '하루 수천 번 나무를 쪼아도 머리뼈가 스펀지처럼 충격을 받아 줘요.', ladder: ['충격을 먹는 머리뼈', '쿵 하는 힘을 나눠서 받아요', '안전 헬멧, 블랙박스'] },
    { inv: '조용한 선풍기 날개', ie: '🌀', q: '소리 없이 조용한 선풍기·풍력 발전기 날개의 선생님은?', opts: ['비둘기', '올빼미', '까치'], oe: ['🕊️', '🦉', '🐦'], ans: 1, secret: '깃털 가장자리가 톱니처럼 갈라져 바람 소리를 잘게 흩어 줘요.', ladder: ['톱니 모양 깃털', '바람 소리를 잘게 흩어요', '조용한 선풍기, 풍력 발전기'] },
    { inv: '아프지 않은 주사바늘', ie: '💉', q: '아프지 않은 주사바늘의 비밀을 알고 있는 자연 선생님은?', opts: ['벌', '나비', '모기'], oe: ['🐝', '🦋', '🦟'], ans: 2, secret: '아주 가늘고 톱니 모양인 침이 살살 들어가서 잘 느끼지 못해요.', ladder: ['가늘고 톱니 모양인 침', '살살 들어가서 안 아파요', '아프지 않은 주사바늘'] },
  ];
  const SPECIES = [
    { name: '수달', e: '🦦', where: '부산 낙동강·온천천', why: '강이 더러워지고 사는 곳이 줄어들어요', lesson: '물속에서 빠르게 헤엄치는 매끈한 몸과 물을 막는 털 → 잠수복, 보온 옷' },
    { name: '상괭이', e: '🐬', where: '부산 앞바다', why: '그물에 걸리거나 바다가 시끄러워져요', lesson: '등지느러미 없는 매끈한 몸 → 조용하고 빠른 배 모양' },
    { name: '저어새', e: '🪿', where: '낙동강 하구 갯벌', why: '갯벌이 사라지고 있어요', lesson: '주걱 부리로 물속을 휘저어 먹이 찾기 → 물속 탐색 도구' },
    { name: '반딧불이', e: '✨', where: '깨끗한 시골 개울가', why: '불빛 공해와 농약 때문에 줄어들어요', lesson: '뜨겁지 않게 밝게 빛나는 배 → 더 밝은 LED' },
    { name: '두꺼비', e: '🐸', where: '산과 저수지', why: '길을 건너다 다치고 사는 곳이 끊겨요', lesson: '울퉁불퉁한 피부로 물 모으기 → 물 모으는 옷감' },
    { name: '맹꽁이', e: '🐸', where: '습지와 논', why: '습지가 메워져 사라져요', lesson: '큰 소리를 내는 울음주머니 → 작은 스피커' },
  ];

  const VIEWS = [
    { id: 'pre', n: '0', ico: '📝', t: '사전 검사', sub: '내 마음 알아보기', key: 'pre_done' },
    { id: 'quiz', n: '1', ico: '🔍', t: '만나기', sub: '이 발명품의 선생님은?', key: 'quiz_done' },
    { id: 'observe', n: '2', ico: '🌿', t: '비밀 찾기', sub: '관찰 + AI 멘토', key: 'secret' },
    { id: 'connect', n: '3', ico: '🔗', t: '연결하기', sub: '불편한 문제 ↔ 생물', key: 'chosen' },
    { id: 'create', n: '4', ico: '💡', t: '발명하기', sub: '설명문 → AI 그림', key: 'invention_name' },
    { id: 'protect', n: '5', ico: '💚', t: '지킴이', sub: '자연 선생님을 지켜요', key: 'protect_done' },
    { id: 'share', n: '6', ico: '🏆', t: '박람회', sub: '발표하고 칭찬하기', key: 'reflect_done' },
    { id: 'post', n: '7', ico: '📝', t: '사후 검사', sub: '달라진 내 마음', key: 'post_done' },
  ];

  // ───────── 상태 ─────────
  const S = { me: store.get('me', null), progress: {}, online: null, mode: 'rule', imageOn: false, mentorOn: true, phase: 'pre', view: 'home', orgs: ORGANISMS, gallery: [] };
  let toastT;
  function toast(m, ms = 2600) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), ms); }

  // ───────── API ─────────
  const LOCAL = !CFG.API_URL;
  async function api(action, payload = {}) {
    if (LOCAL) return localApi(action, payload);
    const body = JSON.stringify(Object.assign({ action }, S.me ? { student_id: S.me.student_id, class: S.me.class, seat: S.me.seat } : {}, payload));
    const res = await fetch(CFG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body, redirect: 'follow' });
    if (!res.ok) throw new Error('서버 응답 오류 ' + res.status);
    const data = await res.json();
    if (data && data.error && !payload._soft) throw new Error(data.error);
    return data;
  }
  // 연습 모드(서버 없음): 브라우저에만 저장
  function localApi(action, p) {
    const db = store.get('db', { survey: [], quiz: [], secret: [], connect: [], invention: [], protect: [], reflect: [], react: [], log: [] });
    const save = () => store.set('db', db);
    const sid = S.me ? S.me.student_id : '0-0';
    const now = new Date().toISOString();
    const prog = () => ({
      pre_done: db.survey.some((r) => r.sid === sid && r.phase === 'pre'), post_done: db.survey.some((r) => r.sid === sid && r.phase === 'post'),
      quiz_done: db.quiz.some((r) => r.sid === sid), organism: (db.secret.filter((r) => r.sid === sid).pop() || {}).organism || '', secret: (db.secret.filter((r) => r.sid === sid).pop() || {}).secret || '',
      problem: (db.connect.filter((r) => r.sid === sid).pop() || {}).problem || '', chosen: (db.connect.filter((r) => r.sid === sid).pop() || {}).chosen || '', reason: (db.connect.filter((r) => r.sid === sid).pop() || {}).reason || '',
      invention_name: (db.invention.filter((r) => r.sid === sid).pop() || {}).name || '', description: (db.invention.filter((r) => r.sid === sid).pop() || {}).description || '', invention_id: (db.invention.filter((r) => r.sid === sid).pop() || {}).id || '',
      protect_done: db.protect.some((r) => r.sid === sid), reflect_done: db.reflect.some((r) => r.sid === sid), rounds: db.log.filter((r) => r.sid === sid && r.stage === 'observe').length, images: 0,
    });
    switch (action) {
      case 'ping': return { ok: true, mentor: 'rule', image_on: false, mentor_on: true };
      case 'login': return { student_id: p.class + '-' + p.seat, class: p.class, seat: p.seat, mentor_on: true, image_on: false, survey_phase: store.get('phase', 'pre'), progress: prog() };
      case 'progress': return prog();
      case 'survey': db.survey.push({ sid, phase: p.phase, answers: p.answers, open: p.open, gender: p.gender, t: now }); save(); return { ok: true, phase: p.phase };
      case 'quiz': db.quiz.push({ sid, score: p.score, t: now }); save(); return { ok: true };
      case 'askMentor': { const round = prog().rounds + 1; db.log.push({ sid, stage: 'observe', t: now }); save(); return Object.assign(ruleMentor(p, Math.min(round - 1, 3)), { round, cap: 6 }); }
      case 'track': db.log.push({ sid, stage: 'search', engine: p.engine, q: p.query, t: now }); save(); return { ok: true };
      case 'saveSecret': db.secret.push({ sid, organism: p.organism, secret: p.secret, t: now }); save(); return { ok: true, version: 1 };
      case 'connect': return ruleConnect(p.problem);
      case 'saveChoice': db.connect.push({ sid, problem: p.problem, chosen: p.chosen, reason: p.reason, t: now }); save(); return { ok: true };
      case 'feedback': return { praise: '발명품 이름이 멋져요!', check: '어떤 생물의 비밀을 썼는지 한 문장 더 써 볼까요?', q: '이 발명품은 누가, 언제 쓰면 좋을까요?', mode: 'rule' };
      case 'generateImage': return { error: '연습 모드에서는 그림 선생님이 쉬고 있어요. 내 스케치로 발표해요!', unavailable: true };
      case 'saveInvention': { const id = 'INV-' + sid + '-' + Date.now().toString(36); db.invention.push({ sid, id, cls: S.me.class, organism: p.organism, name: p.name, description: p.description, sketch: p.sketch_data || '', t: now }); save(); return { ok: true, invention_id: id }; }
      case 'gallery': return { items: db.invention.filter((r) => String(r.cls) === String(p.class)).map((r) => ({ invention_id: r.id, student_id: r.sid, seat: r.sid.split('-')[1], organism: r.organism, name: r.name, description: r.description, sketch: r.sketch, likes: db.react.filter((x) => x.id === r.id && x.type === 'like').length, curious: db.react.filter((x) => x.id === r.id && x.type === 'curious').length })) };
      case 'react': if (db.react.some((x) => x.sid === sid && x.id === p.invention_id && x.type === p.type)) return { ok: false, msg: '이미 눌렀어요!' }; db.react.push({ sid, id: p.invention_id, type: p.type }); save(); return { ok: true };
      case 'protect': db.protect.push({ sid, species: p.species, promise: p.promise, letter: p.letter, t: now }); save(); return { ok: true };
      case 'reflect': db.reflect.push({ sid, s: [p.s_organism, p.s_secret, p.s_use], reflection: p.reflection, nature_is: p.nature_is, t: now }); save(); return { ok: true };
      case 'teacher': if (!p.pin || String(p.pin).length < 4) return { error: '비밀번호가 달라요.' };
        if (p.op === 'phase') { store.set('phase', p.value); return { ok: true }; }
        if (p.op === 'export') { downloadLocalCsv(db); return { ok: true }; }
        return { ok: true, students: new Set([...db.survey, ...db.quiz, ...db.secret].map((r) => r.sid)).size, pre: db.survey.filter((r) => r.phase === 'pre').length, post: db.survey.filter((r) => r.phase === 'post').length, quiz: db.quiz.length, secrets: db.secret.length, connects: db.connect.length, inventions: db.invention.length, protects: db.protect.length, reflects: db.reflect.length, mentor_mode: 'rule(연습 모드)', survey_phase: store.get('phase', 'pre'), mentor_on: true, image_on: false, local: true };
      default: return { error: '연습 모드에서는 할 수 없어요.' };
    }
  }
  function downloadLocalCsv(db) {
    const head = ['sid', 'phase', 'gender', 'timestamp'].concat(ITEMS.map((i) => i[0]), ['open1', 'open2', 'open3']);
    const rows = db.survey.map((r) => [r.sid, r.phase, r.gender || '', r.t].concat(ITEMS.map((i) => r.answers[i[0]] || ''), (r.open || []).map((o) => '"' + String(o).replace(/"/g, '""') + '"')));
    const csv = '﻿' + [head].concat(rows).map((r) => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'nature_mentor_survey_local.csv'; a.click();
  }
  function ruleMentor(p, level) {
    const d = DATA[p.organism];
    const Q = ['사진에서 그 모습을 찾아 "무엇이 특별해?" 칸에 내 말로 더 써 볼까요?', '그 모습 덕분에 하는 일을 "어떻게?" 칸에 써 볼까요?', '왜 그런 모양인지 "왜 그럴까?" 칸에 내 말로 써 볼까요?', '이 비밀을 우리 생활 어디에 또 쓸 수 있을까요?'];
    const praise = p.why ? '"왜"까지 생각했군요, 멋져요!' : p.how ? '"어떻게"까지 잘 썼어요!' : p.what ? `"${p.what.slice(0, 14)}" 잘 관찰했어요!` : `${p.organism}을(를) 골랐군요!`;
    return { praise, info: d ? d.facts[level] : '사진을 자세히 보고 특별한 부분을 찾아봐요.', q1: Q[level], keyword: d ? d.kw[level] : p.organism + ' 특징', level, mode: 'rule' };
  }
  function ruleConnect(problem) {
    const kw = [[['물', '비', '젖', '우산', '신발', '방수'], ['연잎', '오리', '나미브사막 딱정벌레']], [['미끄', '넘어', '붙', '떨어', '벽'], ['도마뱀붙이(게코)', '문어', '도꼬마리']], [['시끄', '소리', '소음', '조용'], ['올빼미', '물총새', '박쥐']], [['무거', '가방', '튼튼', '부러', '가벼'], ['대나무', '꿀벌', '거미']], [['더워', '추워', '덥', '춥', '온도'], ['흰개미', '북극곰', '선인장']], [['어두', '불', '밤', '빛'], ['반딧불이', '박쥐', '몰포나비']], [['아프', '다치', '머리', '안전'], ['딱따구리', '모기', '꿀벌']], [['빨리', '느려', '달리', '헤엄'], ['상어', '물총새', '혹등고래']]];
    let picks = (kw.find((k) => k[0].some((w) => problem.includes(w))) || [null, ['연잎', '도마뱀붙이(게코)', '단풍나무 씨앗']])[1];
    return { candidates: picks.map((n) => { const o = S.orgs.find((x) => x.name === n) || {}; return { organism: n, feature: o.look || '', principle: '이 생물의 비밀을 떠올려 봐요.', why_fit: '문제에 어울릴지 생각해 봐요.' }; }), mode: 'rule' };
  }

  // ───────── 공통 UI ─────────
  function setNet(ok, label) { const c = $('netChip'); c.className = 'top-chip status ' + (ok ? 'ok' : 'bad'); c.textContent = '● ' + label; }
  function doneOf(v) { const p = S.progress || {}; return !!p[v.key]; }
  function renderNav() {
    $('sideNav').innerHTML = VIEWS.map((v) => `<button class="side-item ${S.view === v.id ? 'active' : ''}" data-go="${v.id}"><span class="si-ico">${v.ico}</span><span class="si-text">${v.n}. ${v.t}<span class="si-sub">${v.sub}</span></span><span class="si-meta">${doneOf(v) ? '✓' : ''}</span></button>`).join('');
    const n = VIEWS.filter(doneOf).length; $('progBar').style.width = (n / VIEWS.length * 100) + '%'; $('progText').textContent = n + '/' + VIEWS.length;
    const v = VIEWS.find((x) => x.id === S.view); $('viewName').textContent = v ? v.n + '. ' + v.t : (S.view === 'home' ? '오늘의 미션' : '');
  }
  function go(id) {
    if (id !== 'home' && !S.me) { openLogin(); S.pending = id; return; }
    S.view = id; location.hash = id; renderNav(); closeSide();
    const r = RENDER[id] || RENDER.home; $('content').innerHTML = '<div class="view" id="v"></div>'; r($('v')); window.scrollTo(0, 0); $('content').scrollTop = 0;
  }
  function openSide() { $('sidebar').classList.add('open'); $('scrim').classList.add('show'); }
  function closeSide() { $('sidebar').classList.remove('open'); $('scrim').classList.remove('show'); }
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (!b) return; if (b.dataset.go === 'login') { openLogin(); return; } go(b.dataset.go); });
  $('menuBtn').onclick = openSide; $('closeSide').onclick = closeSide; $('scrim').onclick = closeSide;

  // ───────── 로그인 ─────────
  function openLogin() {
    $('selClass').innerHTML = (CFG.CLASSES || [1, 2, 3, 4, 5, 6]).map((c) => `<option value="${c}">${c}반</option>`).join('');
    $('selSeat').innerHTML = Array.from({ length: CFG.SEATS || 32 }, (_, i) => `<option value="${i + 1}">${i + 1}번</option>`).join('') + '<option value="99">99번(선생님 테스트)</option>';
    if (S.me) { $('selClass').value = S.me.class; $('selSeat').value = S.me.seat; }
    $('loginModal').hidden = false;
  }
  $('clsChip').onclick = openLogin;
  $('loginGo').onclick = async () => {
    const cls = parseInt($('selClass').value, 10), seat = parseInt($('selSeat').value, 10);
    $('loginGo').disabled = true;
    try {
      S.me = { student_id: cls + '-' + seat, class: cls, seat };
      const r = await api('login', { class: cls, seat });
      S.progress = r.progress || {}; S.imageOn = !!r.image_on; S.mentorOn = r.mentor_on !== false; S.phase = r.survey_phase || 'pre';
      store.set('me', S.me);
      $('clsLabel').textContent = `${cls}반 ${seat}번`; $('clsChip').classList.remove('unset');
      $('loginModal').hidden = true; toast(`안녕하세요, ${cls}반 ${seat}번 발명가! 🌿`);
      renderNav(); go(S.pending || (S.view === 'home' ? 'home' : S.view)); S.pending = null;
    } catch (e) { toast('들어가지 못했어요: ' + e.message); S.me = null; }
    $('loginGo').disabled = false;
  };
  async function refreshProgress() { if (!S.me) return; try { const p = await api('progress'); if (p && !p.error) S.progress = p; } catch (e) {} renderNav(); }

  // ───────── 뷰 ─────────
  const RENDER = {};
  RENDER.home = (el) => {
    const next = VIEWS.find((v) => !doneOf(v)) || VIEWS[0];
    el.innerHTML = `
      <section class="keyart">
        <span class="ka-badge">${S.me ? `🏫 ${S.me.class}반 ${S.me.seat}번 발명가` : '🌿 3학년 창의적 체험활동(디지털)'}</span>
        <div class="ka-text">
          <div class="ka-kicker">3학년 창체 디지털 · 생체모방 발명 교실</div>
          <h1 class="ka-title">자연이<br>선생님!</h1>
          <div class="ka-sub">AI 네이처 멘토 · NATURE MENTOR</div>
          <p class="ka-desc">보고, 묻고, 연결하고, 발명하라!<br>동물·식물의 <b>비밀</b>을 찾아 우리 생활을 바꾸는 <b>6번의 모험</b></p>
          <div class="ka-cta">
            <button class="btn start" data-go="${S.me ? next.id : 'login'}">${S.me ? `${next.ico} ${next.n}. ${next.t} 시작 ▶` : '🔒 모험 시작 ▶'}</button>
            <div class="ka-row"><button class="btn glass sm" data-go="pre">📝 사전 검사</button><button class="btn glass sm" id="howBtn">❓ 놀이 방법</button><button class="btn glass sm" data-go="share">🏆 발명 박람회</button><button class="btn glass sm" id="homeTeacher">🔑 선생님</button></div>
          </div>
        </div>
      </section>
      <div class="card soft"><h3>🔎 비밀을 찾는 세 가지 질문</h3>
        <div class="ladder"><div><b>① 무엇이 특별해?</b>모양·색깔·크기·움직임</div><div><b>② 어떻게 그런 일을 해?</b>특별한 부분이 하는 일과 까닭</div><div><b>③ 우리 생활 어디에 쓸까?</b>어떤 불편을 없앨 수 있을까</div></div></div>
      <h2>오늘의 미션 고르기</h2>
      <div class="grid">${VIEWS.map((v) => `<button class="mission ${doneOf(v) ? 'done' : ''}" data-go="${v.id}"><span class="mi-ico">${v.ico}</span><b>${v.n}. ${v.t}</b><small>${v.sub}</small></button>`).join('')}</div>`;
    el.querySelector('[data-go="login"]') && (el.querySelector('[data-go="login"]').onclick = (e) => { e.stopPropagation(); openLogin(); });
    $('homeTeacher').onclick = () => $('teacherBtn').click();
    $('howBtn').onclick = () => { $('teacherModal').hidden = false; $('teacherBody').innerHTML = `<h3>❓ 놀이 방법</h3><ol style="line-height:1.9"><li>위쪽 <b>🏫 반·번호</b>를 고르고 들어가요 (이름은 안 써요).</li><li>왼쪽 <b>수업 순서</b> 0번부터 차례로 해요. 끝난 미션엔 ✓가 붙어요.</li><li><b>네이처 멘토</b>는 답을 주지 않아요. 멘토의 질문에 답하며 생물의 비밀을 내 말로 써요.</li><li>발명하기에서는 <b>내 스케치가 먼저</b>, AI 그림은 참고(3번까지)!</li><li>박람회에서 친구 작품에 👍 ❓ 스티커를 붙이고 3문장으로 발표해요.</li><li>막히면 손을 들어 선생님을 불러요 🙋</li></ol>`; };
  };

  // ── 설문(사전/사후) ──
  function surveyView(el, phase) {
    const done = phase === 'pre' ? S.progress.pre_done : S.progress.post_done;
    const key = 'survey_' + phase + '_' + (S.me ? S.me.student_id : '');
    const ans = store.get(key, {});
    if (done) { el.innerHTML = `<div class="card accent"><h2>${phase === 'pre' ? '📝 사전 검사' : '📝 사후 검사'} 완료!</h2><p>이미 제출했어요. 고마워요 🌿</p><div class="actions"><button class="btn" data-go="${phase === 'pre' ? 'quiz' : 'home'}">${phase === 'pre' ? '1. 만나기로 가기 →' : '처음으로'}</button></div></div>`; return; }
    let html = `<div class="card accent"><h2>${phase === 'pre' ? '📝 사전 검사 · 내 마음 알아보기' : '📝 사후 검사 · 달라진 내 마음'}</h2>
      <p>이건 <b>시험이 아니에요.</b> 정답이 없으니 내 마음과 가장 가까운 것을 골라요. 선생님이 한 문항씩 읽어 줄 거예요.</p>
      <div class="row"><label>성별 <select id="svGender"><option value="">선택</option><option value="1">남</option><option value="2">여</option></select></label><span class="tiny">총 ${ITEMS.length}문항${phase === 'post' ? ' + 생각 쓰기 3개' : ''}</span></div></div>`;
    let n = 0;
    ['CNI', 'CSE', 'AIP'].forEach((sec) => {
      html += `<div class="survey-section"><div class="card"><h3>${SECTIONS[sec][0]}</h3><p class="muted">${SECTIONS[sec][1]}</p>`;
      ITEMS.filter((i) => i[1] === sec).forEach((it) => {
        n++;
        html += `<div class="field" data-code="${it[0]}"><div class="q"><span class="n">${n}</span>${esc(it[2])}</div><div class="likert">${SCALE.map((s) => `<button type="button" data-v="${s[0]}" class="${ans[it[0]] == s[0] ? 'sel' : ''}"><b>${s[1]}</b>${s[2]}</button>`).join('')}</div></div>`;
      });
      html += '</div></div>';
    });
    if (phase === 'post') html += `<div class="survey-section"><div class="card"><h3>4. 내 생각 쓰기 ✏️</h3>${OPEN_Q.map((q, i) => `<div class="field"><div class="q">${esc(q)}</div><textarea id="open${i}" placeholder="한두 문장이면 충분해요"></textarea></div>`).join('')}</div></div>`;
    html += `<div class="sticky-done"><button class="btn big" id="svSubmit">제출하기 ✅ <span id="svCount" class="tiny" style="color:#dff5e7"></span></button></div>`;
    el.innerHTML = html;
    const count = () => { const k = Object.keys(ans).length; $('svCount').textContent = `(${k}/${ITEMS.length})`; };
    count();
    el.querySelectorAll('.likert button').forEach((b) => b.onclick = () => {
      const code = b.closest('.field').dataset.code; ans[code] = parseInt(b.dataset.v, 10); store.set(key, ans);
      b.parentElement.querySelectorAll('button').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); count();
      const next = b.closest('.field').nextElementSibling; if (next && next.classList.contains('field')) next.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    $('svSubmit').onclick = async () => {
      const missing = ITEMS.filter((i) => !ans[i[0]]);
      if (missing.length) { toast(`아직 ${missing.length}문항이 남았어요!`); const f = el.querySelector(`.field[data-code="${missing[0][0]}"]`); f.scrollIntoView({ behavior: 'smooth', block: 'center' }); f.style.outline = '3px solid var(--accent)'; setTimeout(() => (f.style.outline = ''), 1500); return; }
      $('svSubmit').disabled = true;
      try {
        await api('survey', { phase, answers: ans, gender: $('svGender').value, open: phase === 'post' ? [0, 1, 2].map((i) => ($('open' + i) || {}).value || '') : [] });
        store.set(key, {}); S.progress[phase + '_done'] = true; renderNav();
        el.innerHTML = `<div class="card accent" style="text-align:center"><div style="font-size:4rem">🎉</div><h2>제출 완료! 고마워요</h2><p>내 마음을 솔직하게 알려 줘서 고마워요.</p><div class="actions" style="justify-content:center"><button class="btn" data-go="${phase === 'pre' ? 'quiz' : 'home'}">${phase === 'pre' ? '1. 만나기로 가기 →' : '처음으로 🏠'}</button></div></div>`;
      } catch (e) { toast('저장하지 못했어요. 다시 눌러 봐요. (' + e.message + ')'); $('svSubmit').disabled = false; }
    };
  }
  RENDER.pre = (el) => surveyView(el, 'pre');
  RENDER.post = (el) => surveyView(el, 'post');

  // ── 1. 만나기(퀴즈) ──
  RENDER.quiz = (el) => {
    let i = 0, score = 0; const answers = [];
    const draw = () => {
      if (i >= QUIZ.length) return finish();
      const q = QUIZ[i];
      el.innerHTML = `<div class="steps">${QUIZ.map((_, k) => `<span class="${k < i ? 'ok' : k === i ? 'on' : ''}">${k + 1}</span>`).join('')}</div>
        <div class="card"><span class="badge">퀴즈 ${i + 1} / ${QUIZ.length}</span><h2>${q.ie} ${esc(q.inv)}</h2><p style="font-size:1.15rem">${esc(q.q)}</p>
        <div class="quiz-img">${q.ie}</div>
        <div class="quiz-opts">${q.opts.map((o, k) => `<button class="quiz-opt" data-k="${k}"><span>${q.oe[k]}</span>${k + 1}. ${esc(o)}</button>`).join('')}</div>
        <div id="reveal"></div></div>`;
      el.querySelectorAll('.quiz-opt').forEach((b) => b.onclick = () => {
        const k = parseInt(b.dataset.k, 10); const right = k === q.ans; answers.push(right ? 1 : 0); if (right) score++;
        el.querySelectorAll('.quiz-opt').forEach((x) => { x.disabled = true; if (parseInt(x.dataset.k, 10) === q.ans) x.classList.add('right'); });
        if (!right) b.classList.add('wrong');
        $('reveal').innerHTML = `<div class="reveal"><b>${right ? '🎉 맞았어요!' : '🙂 아쉬워요!'} 정답은 ${q.oe[q.ans]} ${esc(q.opts[q.ans])}</b><p style="margin:.4em 0">비밀: ${esc(q.secret)}</p>
          <div class="ladder"><div><b>무엇이 특별해?</b>${esc(q.ladder[0])}</div><div><b>어떻게?</b>${esc(q.ladder[1])}</div><div><b>어디에 썼지?</b>${esc(q.ladder[2])}</div></div>
          <div class="actions"><button class="btn" id="nextQ">${i + 1 < QUIZ.length ? '다음 문제 →' : '결과 보기 🏁'}</button></div></div>`;
        $('nextQ').onclick = () => { i++; draw(); };
      });
    };
    const finish = () => {
      el.innerHTML = `<div class="card accent" style="text-align:center"><div style="font-size:4rem">${score >= 7 ? '🏆' : score >= 4 ? '🌟' : '🌱'}</div><h2>${QUIZ.length}문제 중 ${score}개!</h2><p>정답보다 중요한 건 <b>"왜?"</b>를 말하는 거예요.</p></div>
        <div class="card"><h3>✏️ 생체모방이란?</h3><p style="font-size:1.1rem">생체모방은 <b>동물</b>이나 <b>식물</b>의 특별한 모습이나 사는 방법을 <b>흉내</b> 내어 사람들의 <b>문제</b>를 해결하는 발명이에요.</p>
        <div class="field"><div class="q">오늘의 한 문장: 자연은 ______ 선생님이다. 왜냐하면 ______</div><input type="text" id="tsent" placeholder="예) 자연은 발명 선생님이다. 왜냐하면 비밀이 가득하니까"></div>
        <div class="actions"><button class="btn" id="saveQuiz">저장하고 다음 미션 →</button></div></div>`;
      $('saveQuiz').onclick = async () => { $('saveQuiz').disabled = true; try { await api('quiz', { score, answers, teacher_sentence: $('tsent').value }); S.progress.quiz_done = true; renderNav(); toast('저장했어요! 다음 시간엔 AI 멘토를 만나요 🤖'); go('home'); } catch (e) { toast('저장 실패: ' + e.message); $('saveQuiz').disabled = false; } };
    };
    if (S.progress.quiz_done) { el.innerHTML = `<div class="card accent"><h2>🔍 만나기 완료!</h2><p>퀴즈를 이미 풀었어요. 다시 풀어 볼래요?</p><div class="actions"><button class="btn ghost" id="again">다시 풀기</button><button class="btn" data-go="observe">2. 비밀 찾기 →</button></div></div>`; $('again').onclick = draw; return; }
    draw();
  };

  // ── 2. 비밀 찾기 (개별 활동) ──
  function mentorBubble(r, org) {
    if (!r.info && r.q2) return `<div class="mentor-bubble"><div class="mentor-avatar">🤖</div><div class="bubble"><div class="praise">${esc(r.praise)}</div><ul class="qs"><li>❓ ${esc(r.q1)}</li><li>❓ ${esc(r.q2)}</li></ul><div class="hint">💡 ${esc(r.hint || '')}</div></div></div>`;
    const lv = typeof r.level === 'number' ? r.level : -1;
    return `<div class="mentor-bubble"><div class="mentor-avatar">🤖</div><div class="bubble">
      <div class="praise">${esc(r.praise)}</div>
      ${lv >= 0 ? `<div class="lvl">${LEVELS.map((l, k) => `<span class="${k < lv ? 'ok' : k === lv ? 'on' : ''}">${k + 1}. ${l}</span>`).join('')}</div>` : ''}
      <div class="info"><b>📚 멘토가 알려 주는 정보</b><p>${esc(r.info)}</p></div>
      <ul class="qs"><li>✏️ ${esc(r.q1)}</li></ul>
      ${r.keyword ? `<div class="hint">🔎 더 찾아볼 검색어: <b>${esc(r.keyword)}</b>${searchBar(r.keyword, org, true)}</div>` : ''}
      ${r.capped ? '<div class="tiny" style="margin-top:6px">멘토 도움은 여기까지! 이제 알게 된 것을 모아 비밀 1문장을 써요.</div>' : ''}
    </div></div>`;
  }
  RENDER.observe = (el) => {
    const P = S.progress; let org = P.organism || '';
    const obs = store.get('obs_' + S.me.student_id, { what: P.what || '', how: P.how || '', why: P.why || '', secret: P.secret || '' });
    const drawHero = () => {
      if (!org) return;
      const d = DATA[org] || {}; const o = S.orgs.find((x) => x.name === org) || {};
      $('obsHero').innerHTML = `
        <figure class="ph">${photoTag(org, 500, 'big')}${d.credit ? `<figcaption><a href="${d.credit}" target="_blank" rel="noopener">사진: Wikimedia Commons</a></figcaption>` : ''}</figure>
        ${d.zoom ? `<figure class="ph zoom">${photoTag(org, 500, 'big', 'zoom')}<figcaption>🔬 확대해서 보면? · <a href="${d.zoom_credit}" target="_blank" rel="noopener">출처</a></figcaption></figure>` : ''}
        <div class="org-info">
          <h3>${EMOJI[org] || '🌿'} ${esc(org)}의 비밀을 찾아요</h3>
          <p>👀 자세히 볼 곳: <b>${esc(o.look || '')}</b></p>
          <div class="tiny">🔎 직접 찾아보기 (새 창으로 열려요)</div>
          ${searchBar(org + ' ' + (o.look || ''), org)}
          <div class="tiny" style="margin-top:6px">💡 생체모방 사례 찾기</div>
          ${searchBar(org + ' 생체모방', org, true)}
        </div>`;
    };
    const draw = () => {
      el.innerHTML = `<div class="steps"><span class="${org ? 'ok' : 'on'}">① 생물 고르기</span><span class="${org ? 'on' : ''}">② 사진 관찰·검색</span><span>③ 멘토 정보로 채우기</span><span>④ 비밀 1문장</span></div>
        <div class="card"><h2>🌿 비밀 찾기 — 나만의 생물을 관찰해요</h2><p class="muted"><b>혼자 하는 활동이에요.</b> 관찰할 생물을 하나 골라 사진을 자세히 보고, 네이버·구글에서 찾아보고, 네이처 멘토의 정보를 받아 세 칸을 내 말로 채워요.</p>
        <div class="chips" style="margin:6px 0 10px"><button class="chip sel" data-f="all">전체</button><button class="chip" data-f="동물">동물</button><button class="chip" data-f="식물">식물</button></div>
        <div class="org-grid" id="orgGrid"></div></div>
        <div class="card" id="obsForm" ${org ? '' : 'hidden'}>
          <div class="org-hero" id="obsHero"></div>
          <div class="field"><div class="q"><span class="n">1</span>무엇이 특별해? (모양·색깔·크기·움직임)</div><textarea id="what" placeholder="사진에서 본 것을 써요">${esc(obs.what)}</textarea></div>
          <div class="field"><div class="q"><span class="n">2</span>어떻게 그런 일을 해?</div><textarea id="how" placeholder="검색이나 멘토 정보에서 알게 된 것을 내 말로 써요">${esc(obs.how)}</textarea></div>
          <div class="field"><div class="q"><span class="n">3</span>왜 그럴까?</div><textarea id="why">${esc(obs.why)}</textarea></div>
          <div class="actions"><button class="btn violet" id="ask">🤖 네이처 멘토에게 물어보기</button><span class="tiny" id="roundInfo">${P.rounds ? `지금까지 ${P.rounds}번 물어봤어요` : '물어볼 때마다 모습 → 하는 일 → 까닭 → 발명 순서로 정보를 알려 줘요'}</span></div>
          <div id="mentorOut" style="margin-top:14px"></div>
        </div>
        <div class="card mentor" id="secretCard" ${org ? '' : 'hidden'}><h3>✍️ 비밀 1문장 만들기</h3>
          <p class="muted">틀: <b>○○의 비밀은 ~~해서 ~~할 수 있다는 것!</b></p>
          <textarea id="secret" placeholder="예) 연잎의 비밀은 작은 돌기와 왁스가 있어서 물이 굴러 떨어진다는 것!">${esc(obs.secret)}</textarea>
          <div class="actions"><button class="btn" id="saveSecret">비밀 저장하기 ✅</button>${P.secret ? '<span class="badge">저장한 비밀이 있어요 · 고치면 새 버전으로 저장돼요</span>' : ''}</div></div>`;
      const grid = $('orgGrid');
      const drawGrid = (f) => {
        grid.innerHTML = S.orgs.filter((o) => f === 'all' || o.type === f).map((o) => `<button class="org ${o.name === org ? 'sel' : ''}" data-n="${esc(o.name)}"><div class="oph">${photoTag(o.name, 330)}</div><b>${esc(o.name)}</b><small>${esc(o.look)}</small></button>`).join('');
        grid.querySelectorAll('.org').forEach((b) => b.onclick = () => { org = b.dataset.n; grid.querySelectorAll('.org').forEach((x) => x.classList.toggle('sel', x.dataset.n === org)); $('obsForm').hidden = false; $('secretCard').hidden = false; $('mentorOut').innerHTML = ''; drawHero(); $('obsForm').scrollIntoView({ behavior: 'smooth' }); });
      };
      drawGrid('all');
      el.querySelectorAll('.chip[data-f]').forEach((c) => c.onclick = () => { el.querySelectorAll('.chip[data-f]').forEach((x) => x.classList.remove('sel')); c.classList.add('sel'); drawGrid(c.dataset.f); });
      drawHero();
      const keep = () => store.set('obs_' + S.me.student_id, { what: $('what').value, how: $('how').value, why: $('why').value, secret: $('secret').value });
      ['what', 'how', 'why', 'secret'].forEach((id) => $(id).oninput = keep);
      $('ask').onclick = async () => {
        if (!$('what').value.trim()) { toast('먼저 사진을 보고 "무엇이 특별해?"를 한 가지 써 봐요!'); $('what').focus(); return; }
        $('ask').disabled = true; $('mentorOut').innerHTML = `<div class="mentor-bubble"><div class="mentor-avatar">🤖</div><div class="bubble thinking">멘토가 정보를 찾고 있어요…</div></div>`;
        try {
          const r = await api('askMentor', { organism: org, what: $('what').value, how: $('how').value, why: $('why').value });
          $('mentorOut').innerHTML = mentorBubble(r, org);
          if (r.round) { S.progress.rounds = r.round; $('roundInfo').textContent = `${Math.min(r.round, r.cap)}/${r.cap}번 물어봤어요`; }
        } catch (e) { $('mentorOut').innerHTML = `<div class="banner">멘토가 잠깐 쉬고 있어요. 검색으로 먼저 찾아보고 잠시 뒤 다시 눌러요. (${esc(e.message)})</div>`; }
        $('ask').disabled = false;
      };
      $('saveSecret').onclick = async () => {
        if ($('secret').value.trim().length < 5) { toast('비밀을 한 문장으로 써 봐요!'); return; }
        $('saveSecret').disabled = true;
        try { const r = await api('saveSecret', { organism: org, what: $('what').value, how: $('how').value, why: $('why').value, secret: $('secret').value }); Object.assign(S.progress, { organism: org, secret: $('secret').value, what: $('what').value, how: $('how').value, why: $('why').value }); renderNav(); toast(`비밀을 저장했어요! (버전 ${r.version}) 🌿`); }
        catch (e) { toast('저장 실패: ' + e.message); }
        $('saveSecret').disabled = false;
      };
    };
    draw();
  };

  // ── 3. 연결하기 ──
  RENDER.connect = (el) => {
    const P = S.progress; let cands = [], chosen = P.chosen ? { organism: P.chosen } : null;
    el.innerHTML = `<div class="steps"><span class="on">① 불편한 문제</span><span>② 후보 3개</span><span>③ 왜 이 생물?</span><span>④ 첫 스케치</span></div>
      <div class="card"><h2>🔗 연결하기 — 우리 생활의 불편한 문제와 생물의 비밀 잇기</h2>
      <div class="chips" style="margin-bottom:8px">${['비 오는 날 신발이 젖어요', '가방이 너무 무거워요', '복도가 미끄러워요', '교실이 시끄러워요', '겨울에 손이 시려요', '밤에 책상이 어두워요'].map((t) => `<button class="chip ex">${t}</button>`).join('')}</div>
      <div class="field"><div class="q"><span class="n">1</span>우리 반·학교·집에서 불편한 문제를 한 문장으로 써요</div><textarea id="problem" placeholder="예) 비 오는 날 운동화가 다 젖어서 발이 차가워요">${esc(P.problem || '')}</textarea></div>
      <div class="actions"><button class="btn violet" id="askConnect">🤖 어울리는 생물 비밀 후보 받기</button></div></div>
      <div class="card" id="candCard" hidden><h3>② 멘토가 찾은 후보 3개 — 마음에 드는 생물 하나를 골라요</h3><div id="cands" style="display:grid;gap:10px"></div></div>
      <div class="card mentor" id="whyCard" ${chosen ? '' : 'hidden'}><h3>③ 왜 이 생물을 골랐나요?</h3><p class="muted">틀: <b>○○은 ~~하니까 ~~에 어울려요.</b></p>
        <div class="badge v" id="chosenBadge">${chosen ? esc(chosen.organism) : ''}</div>
        <textarea id="reason" placeholder="예) 연잎은 물을 굴려 떨어뜨리니까 젖지 않는 신발에 어울려요">${esc(P.reason || '')}</textarea>
        <div class="actions"><button class="btn" id="saveChoice">연결 저장하기 ✅</button></div>
        <p class="tiny" style="margin-top:10px">④ 첫 스케치는 설계지(종이)에 그려요: 발명품 이름 · 흉내 낸 생물 · 비밀 · 모양</p></div>`;
    el.querySelectorAll('.chip.ex').forEach((c) => c.onclick = () => { $('problem').value = c.textContent; });
    $('askConnect').onclick = async () => {
      const problem = $('problem').value.trim(); if (problem.length < 4) { toast('불편한 문제를 먼저 써요!'); return; }
      $('askConnect').disabled = true; $('candCard').hidden = false; $('cands').innerHTML = '<div class="thinking">멘토가 생물 카드를 뒤적이고 있어요…</div>';
      try {
        const r = await api('connect', { problem });
        if (r.redirect && !(r.candidates || []).length) { $('cands').innerHTML = `<div class="banner">${esc(r.redirect)}</div>`; }
        else {
          cands = r.candidates || [];
          $('cands').innerHTML = cands.map((c, i) => `<button class="cand" data-i="${i}"><span class="ce">${photoTag(c.organism, 120)}</span><div><b>${esc(c.organism)}</b> <span class="tiny">${esc(c.feature)}</span><div>${esc(c.principle)}</div><div class="tiny">${esc(c.why_fit)}</div></div></button>`).join('');
          $('cands').querySelectorAll('.cand').forEach((b) => b.onclick = () => { chosen = cands[parseInt(b.dataset.i, 10)]; $('cands').querySelectorAll('.cand').forEach((x) => x.classList.toggle('sel', x === b)); $('whyCard').hidden = false; $('chosenBadge').textContent = (EMOJI[chosen.organism] || '🌿') + ' ' + chosen.organism; $('whyCard').scrollIntoView({ behavior: 'smooth' }); });
        }
      } catch (e) { $('cands').innerHTML = `<div class="banner">멘토가 잠깐 쉬고 있어요. 생물 카드에서 직접 골라도 돼요. (${esc(e.message)})</div>`; }
      $('askConnect').disabled = false;
    };
    $('saveChoice').onclick = async () => {
      if (!chosen) { toast('생물을 먼저 골라요!'); return; } if ($('reason').value.trim().length < 5) { toast('"왜 이 생물?"을 한 문장 써요!'); return; }
      $('saveChoice').disabled = true;
      try { await api('saveChoice', { problem: $('problem').value, candidates: cands, chosen: chosen.organism, reason: $('reason').value }); Object.assign(S.progress, { problem: $('problem').value, chosen: chosen.organism, reason: $('reason').value }); renderNav(); toast('연결을 저장했어요! 다음은 발명하기 💡'); }
      catch (e) { toast('저장 실패: ' + e.message); }
      $('saveChoice').disabled = false;
    };
  };

  // ── 4. 발명하기 ──
  RENDER.create = (el) => {
    const P = S.progress; let fileId = '', imgCount = P.images || 0, aiImg = '';
    el.innerHTML = `<div class="steps"><span class="on">① 설명문 3문장</span><span>② 멘토 피드백</span><span>③ 스케치 ↔ AI 그림</span><span>④ 설계도 저장</span></div>
      <div class="card"><h2>💡 발명하기 — 생물의 비밀로 발명품 설계</h2>
        ${P.chosen ? `<p>내가 고른 생물: <span class="badge v">${EMOJI[P.chosen] || '🌿'} ${esc(P.chosen)}</span> ${P.problem ? `· 문제: <span class="badge">${esc(P.problem)}</span>` : ''}</p>` : '<div class="banner">3. 연결하기에서 생물을 먼저 골라요. (바로 발명해도 괜찮아요)</div>'}
        <div class="row"><label style="flex:1">발명품 이름 <input type="text" id="invName" placeholder="예) 연잎 운동화" value="${esc(P.invention_name || '')}"></label><label>흉내 낸 생물 <select id="invOrg">${S.orgs.map((o) => `<option ${o.name === P.chosen ? 'selected' : ''}>${esc(o.name)}</option>`).join('')}</select></label></div>
        <div class="field"><div class="q"><span class="n">1</span>설명문 3문장: 이름은 ○○이에요 · ○○의 ○○ 비밀을 흉내 냈어요 · ~~할 때 ~~하게 써요</div><textarea id="desc" style="min-height:110px" placeholder="내 발명품 이름은 연잎 운동화예요. 연잎의 물을 굴려 떨어뜨리는 비밀을 흉내 냈어요. 비 오는 날 신으면 발이 젖지 않아요.">${esc(P.description || '')}</textarea><div class="counter" id="descCnt"></div></div>
        <div class="actions"><button class="btn violet" id="fb">🤖 멘토 피드백 받기</button></div><div id="fbOut" style="margin-top:12px"></div></div>
      <div class="card"><h3>③ 내 스케치 ↔ AI 그림 비교</h3><p class="muted">먼저 내 생각대로 그려요. 그다음 AI 그림을 보고 <b>다른 점 1가지</b>를 찾아요. AI 그림은 참고일 뿐, 내 설계도가 진짜 발명품!</p>
        <div class="compare"><div><div class="palette" id="palette"></div><canvas class="sketch" id="sketch" width="600" height="600"></canvas><div class="actions"><button class="btn ghost sm" id="undo">↩ 되돌리기</button><button class="btn ghost sm" id="clear">🧽 지우기</button></div></div>
          <div><div class="box" id="aiBox">${S.imageOn ? '설명문을 쓰고 아래 버튼을 누르면<br>AI 그림이 여기에 나와요 🎨' : '지금은 그림 선생님이 쉬고 있어요.<br>내 스케치로 발표해요 ✏️'}</div><div class="actions"><button class="btn gold" id="gen" ${S.imageOn ? '' : 'disabled'}>🎨 AI 그림 그리기 <span class="tiny" id="genCnt">(${imgCount}/3)</span></button></div></div></div>
        <div class="field" style="margin-top:12px"><div class="q">AI 그림과 내 스케치, 다른 점 1가지와 고칠 점</div><textarea id="diff" placeholder="예) AI 그림은 바닥에 돌기가 없어요. 내 설계도에는 연잎처럼 작은 돌기를 그렸어요."></textarea></div>
        <div class="actions"><button class="btn big" id="saveInv">④ 설계도 저장하고 갤러리에 올리기 🏆</button></div></div>`;
    const cnt = () => { $('descCnt').textContent = $('desc').value.length + '자'; }; cnt(); $('desc').oninput = cnt;
    // 스케치 캔버스
    const cv = $('sketch'), ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    let color = '#17301f', size = 6, drawing = false, hist = [];
    const colors = ['#17301f', '#2e9e6b', '#38b6ff', '#ffb74a', '#ff6f61', '#ff7eb6', '#7c5cff', '#8d6e63', '#ffffff'];
    $('palette').innerHTML = colors.map((c) => `<button data-c="${c}" style="background:${c}" class="${c === color ? 'sel' : ''}"></button>`).join('') + `<select id="brush" style="min-width:auto;padding:4px 8px"><option value="3">가는 선</option><option value="6" selected>보통</option><option value="14">굵은 선</option></select>`;
    $('palette').querySelectorAll('button').forEach((b) => b.onclick = () => { color = b.dataset.c; $('palette').querySelectorAll('button').forEach((x) => x.classList.toggle('sel', x === b)); });
    $('brush').onchange = (e) => (size = parseInt(e.target.value, 10));
    const pos = (e) => { const r = cv.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return [(t.clientX - r.left) * cv.width / r.width, (t.clientY - r.top) * cv.height / r.height]; };
    const start = (e) => { e.preventDefault(); hist.push(ctx.getImageData(0, 0, cv.width, cv.height)); if (hist.length > 20) hist.shift(); drawing = true; const [x, y] = pos(e); ctx.beginPath(); ctx.moveTo(x, y); ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineTo(x + .1, y + .1); ctx.stroke(); };
    const move = (e) => { if (!drawing) return; e.preventDefault(); const [x, y] = pos(e); ctx.lineTo(x, y); ctx.stroke(); };
    const end = () => (drawing = false);
    cv.addEventListener('pointerdown', start); cv.addEventListener('pointermove', move); window.addEventListener('pointerup', end);
    $('undo').onclick = () => { const h = hist.pop(); if (h) ctx.putImageData(h, 0, 0); };
    $('clear').onclick = () => { hist.push(ctx.getImageData(0, 0, cv.width, cv.height)); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); };
    $('fb').onclick = async () => {
      if ($('desc').value.trim().length < 10) { toast('설명문을 세 문장으로 써 봐요!'); return; }
      $('fb').disabled = true; $('fbOut').innerHTML = '<div class="mentor-bubble"><div class="mentor-avatar">🤖</div><div class="bubble thinking">읽고 있어요…</div></div>';
      try { const r = await api('feedback', { name: $('invName').value, organism: $('invOrg').value, description: $('desc').value }); $('fbOut').innerHTML = `<div class="mentor-bubble"><div class="mentor-avatar">🤖</div><div class="bubble"><div class="praise">${esc(r.praise)}</div><ul class="qs"><li>✅ ${esc(r.check)}</li><li>❓ ${esc(r.q)}</li></ul></div></div>`; }
      catch (e) { $('fbOut').innerHTML = `<div class="banner">${esc(e.message)}</div>`; }
      $('fb').disabled = false;
    };
    $('gen').onclick = async () => {
      if ($('desc').value.trim().length < 10) { toast('설명문을 먼저 세 문장으로 써요!'); return; }
      $('gen').disabled = true; $('aiBox').innerHTML = '<div class="thinking">그림 선생님이 그리고 있어요… (20초쯤 걸려요) 🎨</div>';
      try {
        const r = await api('generateImage', { description: $('desc').value, organism: $('invOrg').value, _soft: true });
        if (r.error) { $('aiBox').innerHTML = `<div>${esc(r.error)}</div>`; if (!r.capped) $('gen').disabled = false; return; }
        aiImg = r.data_url; fileId = r.file_id; imgCount = r.count; $('genCnt').textContent = `(${imgCount}/${r.cap})`;
        $('aiBox').innerHTML = `<img src="${r.data_url}" alt="AI가 그린 발명품">`;
        toast('AI 그림이 왔어요! 내 스케치와 다른 점을 찾아봐요 🔍'); $('diff').focus();
        if (imgCount < r.cap) $('gen').disabled = false;
      } catch (e) { $('aiBox').innerHTML = `<div>그림 선생님이 잠깐 자리를 비웠어요.<br>${esc(e.message)}</div>`; $('gen').disabled = false; }
    };
    $('saveInv').onclick = async () => {
      if (!$('invName').value.trim()) { toast('발명품 이름을 지어요!'); $('invName').focus(); return; }
      if ($('desc').value.trim().length < 10) { toast('설명문 3문장을 써요!'); return; }
      $('saveInv').disabled = true;
      try {
        const sketch = cv.toDataURL('image/jpeg', 0.6);
        const r = await api('saveInvention', { name: $('invName').value, organism: $('invOrg').value, description: $('desc').value, diff_note: $('diff').value, file_id: fileId, image_count: imgCount, sketch_data: LOCAL ? sketch : '' });
        store.set('sketch_' + S.me.student_id, sketch);
        Object.assign(S.progress, { invention_name: $('invName').value, description: $('desc').value, invention_id: r.invention_id, file_id: fileId }); renderNav();
        toast('설계도를 갤러리에 올렸어요! 🏆'); go('share');
      } catch (e) { toast('저장 실패: ' + e.message); $('saveInv').disabled = false; }
    };
  };

  // ── 5. 지킴이 ──
  RENDER.protect = (el) => {
    let sp = null;
    el.innerHTML = `<div class="card"><h2>💚 자연 선생님을 지켜요</h2><p>생물이 사라지면 <b>발명 아이디어</b>도 함께 사라져요. 생물다양성은 발명 아이디어 도서관 📚</p>
      <h3>① 지키고 싶은 자연 선생님을 골라요 (부산·우리나라 멸종 위기 생물)</h3><div class="species">${SPECIES.map((s, i) => `<button class="sp" data-i="${i}"><span>${s.e}</span><b>${s.name}</b><small>📍 ${s.where}</small><small>⚠️ ${s.why}</small><small>💡 ${s.lesson}</small></button>`).join('')}</div></div>
      <div class="card" id="pForm" hidden><h3 id="pTitle"></h3>
        <div class="field"><div class="q"><span class="n">2</span>이 생물이 사라지면 어떤 발명품(아이디어)을 잃을까요?</div><textarea id="lost"></textarea></div>
        <div class="field"><div class="q"><span class="n">3</span>내가 지키는 방법 한 가지 (약속)</div><div class="chips" style="margin-bottom:6px">${['바다와 강에 쓰레기 버리지 않기', '해변 쓰레기 줍기', '생물을 만지거나 데려오지 않기', '가족과 친구에게 알리기'].map((t) => `<button class="chip pr">${t}</button>`).join('')}</div><input type="text" id="promise" placeholder="나는 ~~할게요"></div>
        <div class="field"><div class="q"><span class="n">4</span>자연에게 감사 편지 (세 줄)</div><div class="letter"><textarea id="letter" placeholder="고마운 자연 선생님 ○○에게&#10;너의 ○○ 덕분에 ~~을 배웠어.&#10;나는 너를 위해 ~~할게."></textarea></div></div>
        <div class="actions"><button class="btn" id="saveP">저장하기 ✅</button><span class="tiny">포스터는 Canva에서 만들어 복도에 붙여요 🎨</span></div></div>`;
    el.querySelectorAll('.sp').forEach((b) => b.onclick = () => { sp = SPECIES[parseInt(b.dataset.i, 10)]; el.querySelectorAll('.sp').forEach((x) => x.classList.toggle('sel', x === b)); $('pForm').hidden = false; $('pTitle').textContent = `${sp.e} ${sp.name} 지킴이가 되어요`; $('pForm').scrollIntoView({ behavior: 'smooth' }); });
    el.querySelectorAll('.chip.pr').forEach((c) => c.onclick = () => ($('promise').value = c.textContent));
    $('saveP').onclick = async () => {
      if (!sp) { toast('생물을 먼저 골라요!'); return; } if (!$('promise').value.trim()) { toast('약속 한 가지를 써요!'); return; }
      $('saveP').disabled = true;
      try { await api('protect', { species: sp.name, lost_invention: $('lost').value, promise: $('promise').value, letter: $('letter').value }); S.progress.protect_done = true; renderNav(); toast('지킴이 약속을 저장했어요 💚'); go('home'); }
      catch (e) { toast('저장 실패: ' + e.message); $('saveP').disabled = false; }
    };
  };

  // ── 6. 박람회 ──
  RENDER.share = async (el) => {
    const P = S.progress;
    el.innerHTML = `<div class="card accent"><h2>🏆 생체모방 발명 박람회 — ${S.me.class}반 갤러리</h2><p>친구 작품을 보고 <b>좋아요 👍 · 궁금해요 ❓</b> 스티커를 붙여요(작품마다 한 번씩). 발표는 3문장!</p>
      <div class="ladder"><div><b>어떤 생물의</b></div><div><b>어떤 비밀을</b></div><div><b>어디에 썼어요</b></div></div></div>
      <div class="gallery" id="gal"><div class="thinking">갤러리를 여는 중…</div></div>
      <div class="card mentor" style="margin-top:18px"><h3>🎤 발표 3문장 + 오늘의 소감</h3>
        <div class="row"><label style="flex:1">어떤 생물의 <input type="text" id="s1" placeholder="도마뱀붙이의" value="${esc(P.chosen ? P.chosen + '의' : '')}"></label><label style="flex:1">어떤 비밀을 <input type="text" id="s2" placeholder="끈끈한 발 비밀을"></label><label style="flex:1">어디에 썼어요 <input type="text" id="s3" placeholder="벽에 붙는 가방 걸이에 썼어요"></label></div>
        <div class="field" style="margin-top:10px"><div class="q">가장 기억에 남는 것 한 문장</div><textarea id="refl"></textarea></div>
        <div class="field"><div class="q">자연은 나에게 ______ 선생님이다</div><input type="text" id="natureIs" placeholder="예) 비밀이 가득한"></div>
        <div class="actions"><button class="btn" id="saveR">소감 저장하기 ✅</button>${P.reflect_done ? '<span class="badge">이미 저장했어요 · 다시 저장하면 새로 기록돼요</span>' : ''}</div></div>`;
    const loadGallery = async () => {
      try {
        const r = await api('gallery', { class: S.me.class }); const items = r.items || [];
        if (!items.length) { $('gal').innerHTML = '<div class="card soft">아직 올라온 작품이 없어요. 4. 발명하기에서 설계도를 올려요!</div>'; return; }
        $('gal').innerHTML = items.map((w) => `<div class="work ${w.student_id === S.me.student_id ? 'mine' : ''}" data-id="${w.invention_id}"><div class="thumb" data-f="${esc(w.file_id || '')}">${w.sketch ? `<img src="${w.sketch}">` : photoTag(w.organism, 330)}</div><div class="wb"><b>${esc(w.name)}</b><span class="tiny">${w.seat}번 · ${EMOJI[w.organism] || ''} ${esc(w.organism)}</span><p>${esc(w.description)}</p><div class="react"><button data-t="like">👍 ${w.likes}</button><button data-t="curious">❓ ${w.curious}</button></div></div></div>`).join('');
        $('gal').querySelectorAll('.react button').forEach((b) => b.onclick = async () => { const id = b.closest('.work').dataset.id; try { const r = await api('react', { invention_id: id, type: b.dataset.t, _soft: true }); toast(r.ok ? '마음을 전했어요 💌' : r.msg || r.error); if (r.ok) loadGallery(); } catch (e) { toast(e.message); } });
        if (!LOCAL) $('gal').querySelectorAll('.thumb[data-f]').forEach(async (t) => { if (!t.dataset.f) return; try { const r = await api('image', { file_id: t.dataset.f }); if (r.data_url) t.innerHTML = `<img src="${r.data_url}">`; } catch (e) {} });
        const mine = store.get('sketch_' + S.me.student_id, ''); const myCard = $('gal').querySelector('.work.mine .thumb'); if (mine && myCard && !myCard.querySelector('img') && !myCard.dataset.f) myCard.innerHTML = `<img src="${mine}">`;
      } catch (e) { $('gal').innerHTML = `<div class="banner">갤러리를 열지 못했어요: ${esc(e.message)}</div>`; }
    };
    loadGallery();
    $('saveR').onclick = async () => {
      if (!$('s1').value || !$('s2').value || !$('s3').value) { toast('발표 3문장을 모두 채워요!'); return; }
      $('saveR').disabled = true;
      try { await api('reflect', { s_organism: $('s1').value, s_secret: $('s2').value, s_use: $('s3').value, reflection: $('refl').value, nature_is: $('natureIs').value }); S.progress.reflect_done = true; renderNav(); toast('소감을 저장했어요! 마지막으로 사후 검사를 해요 📝'); go('post'); }
      catch (e) { toast('저장 실패: ' + e.message); $('saveR').disabled = false; }
    };
  };

  // ───────── 선생님 메뉴 ─────────
  $('teacherBtn').onclick = () => { $('teacherModal').hidden = false; $('teacherBody').innerHTML = `<p class="muted">선생님 비밀번호를 입력하세요.</p><div class="row"><input type="text" id="pin" placeholder="PIN" style="max-width:160px" inputmode="numeric"><button class="btn" id="pinGo">열기</button></div>`; $('pinGo').onclick = () => teacherLoad($('pin').value); $('pin').onkeydown = (e) => { if (e.key === 'Enter') teacherLoad($('pin').value); }; };
  $('teacherClose').onclick = () => ($('teacherModal').hidden = true);
  async function teacherLoad(pin) {
    $('teacherBody').innerHTML = '<div class="thinking">불러오는 중…</div>';
    try {
      const r = await api('teacher', { pin, op: 'summary', _soft: true }); if (r.error) { $('teacherBody').innerHTML = `<div class="banner">${esc(r.error)}</div>`; return; }
      $('teacherBody').innerHTML = `
        ${r.local ? '<div class="banner">연습 모드: config.js의 API_URL이 비어 있어 데이터가 이 브라우저에만 저장돼요. 백엔드를 배포한 뒤 URL을 넣으면 스프레드시트에 저장됩니다.</div>' : `<div class="banner ok">서버 연결됨 · 멘토: ${esc(r.mentor_mode)} · <a href="${esc(r.sheet_url)}" target="_blank">데이터 스프레드시트 열기 ↗</a></div>`}
        <div class="kpi"><div><b>${r.students}</b><small>접속 학생</small></div><div><b>${r.pre}</b><small>사전 검사</small></div><div><b>${r.post}</b><small>사후 검사</small></div><div><b>${r.quiz}</b><small>퀴즈</small></div><div><b>${r.secrets}</b><small>비밀 저장</small></div><div><b>${r.connects}</b><small>연결</small></div><div><b>${r.inventions}</b><small>발명 설계도</small></div><div><b>${r.protects}</b><small>지킴이</small></div><div><b>${r.reflects}</b><small>소감</small></div></div>
        <h3 style="margin-top:16px">설정</h3>
        <div class="switch"><label><input type="checkbox" id="tMentor" ${r.mentor_on ? 'checked' : ''}> AI 멘토 켜기 (끄면 "쉬는 시간" 안내)</label></div>
        <div class="switch"><label><input type="checkbox" id="tImage" ${r.image_on ? 'checked' : ''}> AI 그림 생성 켜기 (API 키 있을 때만 동작)</label></div>
        <div class="switch">검사 단계: <select id="tPhase"><option value="pre" ${r.survey_phase === 'pre' ? 'selected' : ''}>사전(1차시)</option><option value="post" ${r.survey_phase === 'post' ? 'selected' : ''}>사후(6차시)</option></select><span class="tiny">학생 화면 안내용 표시</span></div>
        <div class="actions"><button class="btn sm" id="tExport">📊 SPSS용 시트 내보내기(SPSS_사전·사후·로그요약)</button><button class="btn ghost sm" id="tRefresh">새로고침</button></div>
        <h3 style="margin-top:16px">학생 접속 QR</h3><div id="qr"></div><p class="tiny">${esc(CFG.QR_URL || location.href)}</p>`;
      const tog = async (key, el) => { try { await api('teacher', { pin, op: 'toggle', key, value: el.checked }); toast('저장했어요'); } catch (e) { toast(e.message); } };
      $('tMentor').onchange = (e) => tog('mentor_on', e.target); $('tImage').onchange = (e) => tog('image_on', e.target);
      $('tPhase').onchange = async (e) => { try { await api('teacher', { pin, op: 'phase', value: e.target.value }); toast('검사 단계를 바꿨어요'); } catch (err) { toast(err.message); } };
      $('tExport').onclick = async () => { $('tExport').disabled = true; try { const x = await api('teacher', { pin, op: 'export' }); toast('내보내기 완료!'); if (x.url) window.open(x.url, '_blank'); } catch (e) { toast(e.message); } $('tExport').disabled = false; };
      $('tRefresh').onclick = () => teacherLoad(pin);
      if (window.QRCode) new QRCode($('qr'), { text: CFG.QR_URL || location.href.split('#')[0], width: 180, height: 180 });
    } catch (e) { $('teacherBody').innerHTML = `<div class="banner">${esc(e.message)}</div>`; }
  }

  // ───────── 시작 ─────────
  async function boot() {
    renderNav();
    if (LOCAL) setNet(false, '연습 모드(서버 없음)');
    else { try { const r = await api('ping'); S.mode = r.mentor; S.imageOn = !!r.image_on; setNet(true, r.mentor === 'gemini' ? 'AI 멘토 연결됨' : '연결됨(규칙 멘토)'); } catch (e) { setNet(false, '서버 연결 안 됨'); } }
    if (S.me) { $('clsLabel').textContent = `${S.me.class}반 ${S.me.seat}번`; $('clsChip').classList.remove('unset'); try { const r = await api('login', { class: S.me.class, seat: S.me.seat }); S.progress = r.progress || {}; S.imageOn = !!r.image_on; S.phase = r.survey_phase || 'pre'; } catch (e) {} }
    const h = location.hash.replace('#', '');
    go(VIEWS.some((v) => v.id === h) ? h : 'home');
  }
  window.addEventListener('hashchange', () => { const h = location.hash.replace('#', ''); if (h && h !== S.view && (h === 'home' || VIEWS.some((v) => v.id === h))) go(h); });
  boot();
})();
