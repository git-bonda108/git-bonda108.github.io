document.documentElement.classList.add('js');
// Reveal on scroll + mobile nav. No dependencies.
const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
const nav = document.querySelector('.nav'); const btn = document.querySelector('.menu-btn');
if (btn) btn.addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('.links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

setTimeout(() => document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in')), 1800);

// Flow player: a declarative step-through for architecture walkthroughs. Steps live in a JSON <script> inside each .flow.
(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.flow').forEach(flow => {
    const data = JSON.parse(flow.querySelector('.flow-data').textContent);
    const svg = flow.querySelector('svg'), nodes = [...svg.querySelectorAll('.fn')], edges = [...svg.querySelectorAll('.fe')];
    const cap = flow.querySelector('.flow-cap'), cnt = flow.querySelector('[data-count]'), dots = flow.querySelector('.flow-dots');
    data.forEach((_, i) => { const d = document.createElement('i'); d.addEventListener('click', () => go(i)); dots.appendChild(d); });
    let idx = -1, timer = null;
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
      cnt.textContent = (idx + 1) + ' / ' + data.length;
      if (idx === data.length - 1) stop();
    }
    function stop(){ if (timer) { clearInterval(timer); timer = null; } flow.querySelector('[data-act=play]').textContent = '▶ Play'; }
    function play(){ if (timer) return stop(); if (idx >= data.length - 1) go(-1); go(idx + 1); flow.querySelector('[data-act=play]').textContent = '❚❚ Pause'; timer = setInterval(() => go(idx + 1), reduce ? 2600 : 2000); }
    flow.querySelector('[data-act=play]').addEventListener('click', play);
    flow.querySelector('[data-act=step]').addEventListener('click', () => { stop(); go(idx + 1 > data.length - 1 ? 0 : idx + 1); });
    flow.querySelector('[data-act=reset]').addEventListener('click', () => { stop(); go(-1); });
    flow.tabIndex = 0;
    flow.addEventListener('keydown', ev => { if (ev.key === 'ArrowRight') { stop(); go(idx + 1); ev.preventDefault(); } if (ev.key === 'ArrowLeft') { stop(); go(idx - 1); ev.preventDefault(); } if (ev.key === ' ') { play(); ev.preventDefault(); } });
    go(-1);
  });
})();

// project filter (17 Oct 2026)
document.querySelectorAll('.pfilter button').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.pfilter button').forEach(x=>x.classList.toggle('on',x===b));
  const f=b.dataset.f;
  document.querySelectorAll('.ptile').forEach(t=>t.classList.toggle('hide',f!=='all'&&t.dataset.g!==f));
}));
