document.documentElement.classList.add('js');
// Reveal on scroll + mobile nav. No dependencies.
const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
const nav = document.querySelector('.nav'); const btn = document.querySelector('.menu-btn');
if (btn) btn.addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('.links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

setTimeout(() => document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in')), 1800);

// Flow player: a declarative step-through for architecture walkthroughs. Steps live in a JSON <script> inside each .flow.
// 18 Oct 2026: auto-plays once when 40% of the player is on screen, pauses when it scrolls away and resumes on return.
// Any click or key press hands control to the reader. No autoplay under prefers-reduced-motion.
(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.flow').forEach(flow => {
    const data = JSON.parse(flow.querySelector('.flow-data').textContent);
    const svg = flow.querySelector('svg'), nodes = [...svg.querySelectorAll('.fn')], edges = [...svg.querySelectorAll('.fe')];
    const cap = flow.querySelector('.flow-cap'), cnt = flow.querySelector('[data-count]'), dots = flow.querySelector('.flow-dots');
    const playBtn = flow.querySelector('[data-act=play]');
    edges.forEach(e => { try { e.style.setProperty('--len', Math.ceil(e.getTotalLength())); } catch (_) {} });
    let idx = -1, timer = null, auto = reduce ? 'off' : 'idle'; // idle → playing ⇄ paused → done | off (reader took over)
    data.forEach((_, i) => { const d = document.createElement('i'); d.addEventListener('click', () => { take(); go(i); }); dots.appendChild(d); });
    function go(i){
      idx = Math.max(-1, Math.min(i, data.length - 1));
      const seen = new Set(), seenE = new Set();
      data.slice(0, idx + 1).forEach(s => { (s.n||[]).forEach(n => seen.add(n)); (s.e||[]).forEach(e => seenE.add(e)); });
      const cur = idx >= 0 ? data[idx] : {n:[],e:[]};
      nodes.forEach(n => { const id = n.dataset.n; n.classList.toggle('done', seen.has(id) && !(cur.n||[]).includes(id)); n.classList.toggle('on', (cur.n||[]).includes(id)); });
      edges.forEach(e => { const id = e.dataset.e; e.classList.toggle('done', seenE.has(id) && !(cur.e||[]).includes(id)); e.classList.toggle('on', (cur.e||[]).includes(id)); });
      [...dots.children].forEach((d, k) => { d.classList.toggle('done', k < idx); d.classList.toggle('on', k === idx); });
      if (idx >= 0) { cap.querySelector('[data-idx]').textContent = String(idx + 1).padStart(2, '0'); cap.querySelector('[data-title]').textContent = cur.t; cap.querySelector('[data-text]').textContent = cur.x; }
      else { cap.querySelector('[data-idx]').textContent = '—'; cap.querySelector('[data-title]').textContent = flow.dataset.intro || 'Press Play'; cap.querySelector('[data-text]').textContent = flow.dataset.introText || 'Step through the system the way I would explain it on a whiteboard.'; }
      cap.classList.remove('tick'); void cap.offsetWidth; cap.classList.add('tick');
      cnt.textContent = (idx + 1) + ' / ' + data.length;
      if (idx === data.length - 1) { stop(); if (auto === 'playing') auto = 'done'; }
    }
    function stop(){ if (timer) { clearInterval(timer); timer = null; } playBtn.textContent = '▶ Play'; }
    function start(){ if (idx >= data.length - 1) go(-1); go(idx + 1); if (idx < data.length - 1) { playBtn.textContent = '❚❚ Pause'; timer = setInterval(() => go(idx + 1), reduce ? 2600 : 3500); } }
    function take(){ auto = 'off'; }
    playBtn.addEventListener('click', () => { take(); if (timer) stop(); else start(); });
    flow.querySelector('[data-act=step]').addEventListener('click', () => { take(); stop(); go(idx + 1 > data.length - 1 ? 0 : idx + 1); });
    flow.querySelector('[data-act=reset]').addEventListener('click', () => { take(); stop(); go(-1); });
    flow.tabIndex = 0;
    flow.addEventListener('keydown', ev => {
      if (ev.target.closest('button')) return;
      if (ev.key === 'ArrowRight') { take(); stop(); go(idx + 1); ev.preventDefault(); }
      if (ev.key === 'ArrowLeft') { take(); stop(); go(idx - 1); ev.preventDefault(); }
      if (ev.key === ' ') { take(); if (timer) stop(); else start(); ev.preventDefault(); }
    });
    go(-1);
    if (auto === 'idle' && 'IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(en => {
        if (en.isIntersecting) { if (auto === 'idle' || auto === 'paused') { auto = 'playing'; start(); } }
        else if (auto === 'playing' && timer) { stop(); auto = 'paused'; }
      }), { threshold: 0.4 }).observe(flow);
    }
  });
})();

// project filter (17 Oct 2026)
document.querySelectorAll('.pfilter button').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.pfilter button').forEach(x=>x.classList.toggle('on',x===b));
  const f=b.dataset.f;
  document.querySelectorAll('.ptile').forEach(t=>t.classList.toggle('hide',f!=='all'&&t.dataset.g!==f));
}));

// 24 Oct 2026 — business / tech layers and animated explainers.
// The view lives on <html data-view>, is remembered per browser, and can be forced with ?view=tech|biz.
(function(){
  const root = document.documentElement;
  function setView(v, save){
    root.dataset.view = v;
    document.querySelectorAll('.view-toggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
    if (save) { try { localStorage.setItem('sb-view', v); } catch (_) {} }
  }
  document.querySelectorAll('.view-toggle button').forEach(b => b.addEventListener('click', () => setView(b.dataset.view, true)));
  setView(root.dataset.view || 'biz', false);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vids = [...document.querySelectorAll('.explainer video')];
  function arm(v){ if (v.dataset.armed) return; v.querySelectorAll('source[data-src]').forEach(s => { s.src = s.dataset.src; }); v.load(); v.dataset.armed = '1'; }
  // A click pauses or resumes; a reader's pause holds until they click again, even when scrolled back into view.
  vids.forEach(v => {
    if (reduce) { v.controls = true; arm(v); return; } // preload=none: nothing downloads until the reader presses play
    v.addEventListener('click', () => { arm(v); if (v.paused) { delete v.dataset.hold; v.play().catch(() => {}); } else { v.dataset.hold = '1'; v.pause(); } });
  });
  document.querySelectorAll('.explainer .x-full').forEach(b => b.addEventListener('click', () => {
    const v = b.closest('.explainer').querySelector('video'); arm(v); delete v.dataset.hold; v.play().catch(() => {});
    if (v.requestFullscreen) v.requestFullscreen().catch(() => {}); else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
  }));
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      const v = en.target;
      if (en.isIntersecting) { arm(v); if (!v.dataset.hold) v.play().catch(() => {}); }
      else if (!v.paused) v.pause();
    }), { threshold: 0.35 });
    vids.forEach(v => io.observe(v));
  }
})();
