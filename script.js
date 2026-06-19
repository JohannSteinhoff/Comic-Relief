// ===== Comic Relief — interactions =====

// Mobile nav toggle
const burger = document.getElementById('navBurger');
const links  = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  links.classList.toggle('open');
});
links.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    links.classList.remove('open');
  })
);

// Hide nav on scroll down, show on scroll up
const nav = document.getElementById('nav');
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > lastY && y > 300) nav.classList.add('hide');
  else nav.classList.remove('hide');
  lastY = y;
}, { passive: true });

// Scroll-reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.14 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Subtle parallax on hero cutouts
const figs = document.querySelectorAll('.hero__fig');
if (figs.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    figs.forEach((f, i) => {
      const dir = i === 0 ? -1 : 1;
      f.style.transform = `translateY(${y * 0.08}px) rotate(${dir * 3}deg)`;
    });
  }, { passive: true });
}
