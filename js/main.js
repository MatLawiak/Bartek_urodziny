// ============================================================
//  BARTEK 40 — main.js
// ============================================================

/* ---- PHOTOS (slider) ---- */
const PHOTOS = [
  'zdj%C4%99cia/zdj%C4%99cia/IMG_0407.JPG',
  'zdj%C4%99cia/zdj%C4%99cia/85A4FE13-3A05-4E43-94B3-47E72FED9B75.JPG',
  'zdj%C4%99cia/zdj%C4%99cia/292F7B8A-9047-4C9D-B102-F34AC6C0D3D8.JPG',
  'zdj%C4%99cia/zdj%C4%99cia/292F7B8A-9047-4C9D-B102-F34AC6C0D3D8%202.JPG',
  'zdj%C4%99cia/zdj%C4%99cia/A5D9BC0C-029D-4B5F-AFEC-6DCC022EDB77.JPG',
  'zdj%C4%99cia/zdj%C4%99cia/A5D9BC0C-029D-4B5F-AFEC-6DCC022EDB77%202.JPG',
  'zdj%C4%99cia/zdj%C4%99cia/ADA547AD-3162-4F7C-A2BE-CA4F72AFC79C.JPG',
  'zdj%C4%99cia/zdj%C4%99cia/CD21416C-CD07-416A-89FC-178B27A70C9F.JPG',
  'zdj%C4%99cia/zdj%C4%99cia/IMG_1584.jpg',
  'zdj%C4%99cia/zdj%C4%99cia/IMG_1653.jpg',
  'zdj%C4%99cia/zdj%C4%99cia/IMG_1807.jpg',
  'zdj%C4%99cia/zdj%C4%99cia/IMG_1894.jpg',
  'zdj%C4%99cia/zdj%C4%99cia/IMG_3191.jpg',
  'zdj%C4%99cia/zdj%C4%99cia/IMG_6657.jpg',
  'zdj%C4%99cia/zdj%C4%99cia/IMG_6793.jpg',
  'zdj%C4%99cia/zdj%C4%99cia/IMG_6991.jpg',
  'zdj%C4%99cia/zdj%C4%99cia/IMG_7507.jpg',
  'zdj%C4%99cia/zdj%C4%99cia/IMG_9038.jpg',
  'zdj%C4%99cia/zdj%C4%99cia/IMG_9233.jpg',
  'zdj%C4%99cia/zdj%C4%99cia/IMG_9274.jpg',
  'zdj%C4%99cia/zdj%C4%99cia/IMG_9351.jpg',
  'zdj%C4%99cia/zdj%C4%99cia/IMG_9516.jpg',
  'zdj%C4%99cia/zdj%C4%99cia/IMG_9779.jpg',
  'zdj%C4%99cia/zdj%C4%99cia/IMG_9837.jpg',
];

// ============================================================
//  SLIDER
// ============================================================
let currentSlide = 0;
let sliderInterval = null;

function initSlider() {
  const sliderEl = document.getElementById('heroSlider');
  const dotsEl   = document.getElementById('sliderDots');
  if (!sliderEl || !dotsEl) return;

  // Build slides
  PHOTOS.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
    slide.style.backgroundImage = `url('${src}')`;
    sliderEl.appendChild(slide);

    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Zdjęcie ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsEl.appendChild(dot);
  });

  startSlider();
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.dot');
  if (!slides.length) return;

  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');

  currentSlide = (index + PHOTOS.length) % PHOTOS.length;

  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function startSlider() {
  sliderInterval = setInterval(() => goToSlide(currentSlide + 1), 4500);
}

// Pause on hover
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('mouseenter', () => clearInterval(sliderInterval));
    hero.addEventListener('mouseleave', startSlider);
  }
});

// ============================================================
//  COUNTDOWN
// ============================================================
function initCountdown() {
  const eventDate = new Date(CONFIG.EVENT_DATE);

  function tick() {
    const now   = new Date();
    const diff  = eventDate - now;

    if (diff <= 0) {
      document.getElementById('countdown-days').textContent  = '0';
      document.getElementById('countdown-hours').textContent = '0';
      document.getElementById('countdown-mins').textContent  = '0';
      document.getElementById('countdown-secs').textContent  = '0';
      return;
    }

    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const secs  = Math.floor((diff % 60000)    / 1000);

    document.getElementById('countdown-days').textContent  = days;
    document.getElementById('countdown-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('countdown-mins').textContent  = String(mins).padStart(2, '0');
    document.getElementById('countdown-secs').textContent  = String(secs).padStart(2, '0');
  }

  tick();
  setInterval(tick, 1000);
}

// ============================================================
//  RSVP FORM
// ============================================================
function initRSVP() {
  const form = document.getElementById('rsvpForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn     = form.querySelector('.btn-submit');
    const msgEl   = document.getElementById('formMessage');
    const data    = Object.fromEntries(new FormData(form));

    // Basic validation
    if (!data.firstName.trim() || !data.lastName.trim()) {
      showMessage(msgEl, 'error', 'Uzupełnij imię i nazwisko, żebyśmy wiedzieli kogo witać 😊');
      return;
    }

    btn.disabled    = true;
    btn.textContent = 'Wysyłam... 🚀';

    if (!CONFIG.BACKEND_URL) {
      // Demo mode — brak backendu
      setTimeout(() => {
        showMessage(msgEl, 'success',
          `🎉 Świetnie, ${data.firstName}! Twoja obecność została odnotowana. Do zobaczenia 8 maja!`);
        form.reset();
        btn.disabled    = false;
        btn.textContent = 'Potwierdzam obecność 🎉';
        fireConfetti();
      }, 800);
      return;
    }

    try {
      const res = await fetch(CONFIG.BACKEND_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          firstName:  data.firstName.trim(),
          lastName:   data.lastName.trim(),
          companions: parseInt(data.companions) || 0,
        }),
      });

      if (!res.ok) throw new Error('HTTP ' + res.status);

      showMessage(msgEl, 'success',
        `🎉 Hurra, ${data.firstName}! Bartek i Natalia już się cieszą. Do zobaczenia 8 maja!`);
      form.reset();
      fireConfetti();
      fetchCounter(); // odśwież licznik

    } catch (err) {
      showMessage(msgEl, 'error',
        'Coś poszło nie tak. Spróbuj jeszcze raz lub napisz do Barta bezpośrednio 😅');
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Potwierdzam obecność 🎉';
    }
  });
}

function showMessage(el, type, text) {
  el.className     = `form-message ${type}`;
  el.textContent   = text;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  setTimeout(() => { el.style.display = 'none'; }, 8000);
}

// ============================================================
//  COUNTER
// ============================================================
async function fetchCounter() {
  const el = document.getElementById('guestCount');
  if (!el) return;

  if (!CONFIG.BACKEND_URL) {
    el.textContent = '?';
    document.querySelector('.counter-sub').textContent =
      'Licznik ruszy po skonfigurowaniu backendu 🔧';
    return;
  }

  try {
    const res  = await fetch(CONFIG.BACKEND_URL + '?action=count');
    const json = await res.json();
    animateCounter(el, json.people || 0);
  } catch {
    el.textContent = '?';
  }
}

function animateCounter(el, target) {
  const start    = parseInt(el.textContent) || 0;
  const duration = 1200;
  const startTs  = performance.now();

  function step(ts) {
    const progress = Math.min((ts - startTs) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(start + (target - start) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// ============================================================
//  CONFETTI
// ============================================================
function fireConfetti() {
  if (typeof confetti === 'undefined') return;

  const colors = ['#c9a84c', '#e8c97a', '#f0ede8', '#c03030', '#ffffff'];

  confetti({
    particleCount: 120,
    spread:        80,
    origin:        { y: 0.6 },
    colors,
  });

  setTimeout(() =>
    confetti({ particleCount: 60, spread: 100, origin: { x: 0.2, y: 0.7 }, colors }), 300);
  setTimeout(() =>
    confetti({ particleCount: 60, spread: 100, origin: { x: 0.8, y: 0.7 }, colors }), 500);
}

// Małe confetti przy wejściu na stronę
function entryConfetti() {
  if (typeof confetti === 'undefined') return;
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle:         60,
      spread:        55,
      origin:        { x: 0 },
      colors:        ['#c9a84c', '#e8c97a', '#ffffff'],
    });
    confetti({
      particleCount: 50,
      angle:         120,
      spread:        55,
      origin:        { x: 1 },
      colors:        ['#c9a84c', '#e8c97a', '#ffffff'],
    });
  }, 1200);
}

// ============================================================
//  SCROLL REVEAL
// ============================================================
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  initCountdown();
  initRSVP();
  initReveal();
  fetchCounter();
  entryConfetti();
});
