document.documentElement.classList.add('js');
// Reveal on scroll + mobile nav. No dependencies.
const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
const nav = document.querySelector('.nav'); const btn = document.querySelector('.menu-btn');
if (btn) btn.addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('.links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

setTimeout(() => document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in')), 1800);
