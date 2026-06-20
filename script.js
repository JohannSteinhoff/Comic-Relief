// ===== Comic Relief — interactions =====

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

// ===== Section indicators: scroll-spy =====
// Activates the matching dot-nav dot + top-nav link for the section
// currently crossing the middle of the viewport.
const dotDots  = document.querySelectorAll('[data-spy-dot]');
const navItems = document.querySelectorAll('[data-spy-link]');

function setActiveSection(id) {
  dotDots.forEach(d => d.classList.toggle('is-active', d.dataset.spyDot === id));
  navItems.forEach(n => n.classList.toggle('is-active', n.dataset.spyLink === id));
}

const spy = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) setActiveSection(e.target.id);
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
document.querySelectorAll('[data-spy]').forEach(s => spy.observe(s));

// ===== Scroll progress bar =====
const bar = document.getElementById('scrollbar');
function updateProgress() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  const p = max > 0 ? doc.scrollTop / max : 0;
  bar.style.transform = `scaleX(${p})`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// ===== Parallax on hero + reused section cutouts =====
const parallaxEls = document.querySelectorAll('[data-parallax]');
if (parallaxEls.length && !reduceMotion) {
  let ticking = false;
  const applyParallax = () => {
    parallaxEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2);
      const speed = parseFloat(el.dataset.parallax) || 0.06;
      el.style.translate = `0 ${(-offset * speed).toFixed(1)}px`;
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(applyParallax); ticking = true; }
  }, { passive: true });
  applyParallax();
}

// ===== Gallery lightbox =====
const galleryImgs = [...document.querySelectorAll('#gallery-grid img')];
const lightbox    = document.getElementById('lightbox');
const lbImg       = document.getElementById('lightboxImg');
const lbClose     = document.getElementById('lightboxClose');
const lbPrev      = document.getElementById('lightboxPrev');
const lbNext      = document.getElementById('lightboxNext');
let lbIndex = 0;

function showLightbox(i) {
  lbIndex = (i + galleryImgs.length) % galleryImgs.length;
  const src = galleryImgs[lbIndex];
  lbImg.src = src.src;
  lbImg.alt = src.alt;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

galleryImgs.forEach((img, i) =>
  img.parentElement.addEventListener('click', () => showLightbox(i))
);
lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => showLightbox(lbIndex - 1));
lbNext.addEventListener('click', () => showLightbox(lbIndex + 1));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   showLightbox(lbIndex - 1);
  if (e.key === 'ArrowRight')  showLightbox(lbIndex + 1);
});
