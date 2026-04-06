// ===========================
// GLOBAL SCRIPT — script.js
// ===========================

// ---- NAVBAR SCROLL ----
const navbar = document.getElementById('navbar');
if (navbar) {
  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('transparent');
    } else {
      if (navbar.classList.contains('transparent')) {
        // keep transparent only on homepage hero
        navbar.classList.remove('scrolled');
      }
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// ---- MOBILE NAV ----
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileNav    = document.getElementById('mobile-nav');
const mobileClose  = document.getElementById('mobile-nav-close');

if (hamburgerBtn && mobileNav) {
  hamburgerBtn.addEventListener('click', () => {
    mobileNav.classList.add('open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  });
}
if (mobileClose && mobileNav) {
  mobileClose.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
}

// ---- SCROLL REVEAL ----
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => observer.observe(el));
}

// ---- BOOKING WIDGET — Date Defaults ----
const today   = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfter = new Date(today);
dayAfter.setDate(dayAfter.getDate() + 2);

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

const checkinInput  = document.getElementById('check-in');
const checkoutInput = document.getElementById('check-out');
if (checkinInput)  { checkinInput.value = formatDate(tomorrow); checkinInput.min = formatDate(today); }
if (checkoutInput) { checkoutInput.value = formatDate(dayAfter); checkoutInput.min = formatDate(tomorrow); }

// Ensure checkout is after checkin on hero widget
if (checkinInput && checkoutInput) {
  checkinInput.addEventListener('change', () => {
    const newMin = new Date(checkinInput.value);
    newMin.setDate(newMin.getDate() + 1);
    checkoutInput.min = formatDate(newMin);
    if (new Date(checkoutInput.value) <= new Date(checkinInput.value)) {
      checkoutInput.value = formatDate(newMin);
    }
  });
}

// ---- FAQ ACCORDION ----
const accordionItems = document.querySelectorAll('.accordion-item');
accordionItems.forEach(item => {
  const header = item.querySelector('.accordion-header');
  if (!header) return;
  header.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // Close all
    accordionItems.forEach(i => {
      i.classList.remove('open');
      const h = i.querySelector('.accordion-header');
      if (h) h.setAttribute('aria-expanded', 'false');
    });
    // Open clicked if was closed
    if (!isOpen) {
      item.classList.add('open');
      header.setAttribute('aria-expanded', 'true');
    }
  });
});

// ---- TESTIMONIALS SLIDER ----
const track = document.getElementById('testimonials-track');
const dots   = document.querySelectorAll('.dot');
const prevBtn = document.getElementById('prev-testimonial');
const nextBtn = document.getElementById('next-testimonial');

if (track) {
  let currentIndex = 0;
  const cards = track.querySelectorAll('.testimonial-card');
  const visibleCount = () => window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;

  function updateSlider() {
    const cardWidth = cards[0].offsetWidth + 24; // gap = 24px
    const maxIndex  = Math.max(0, cards.length - visibleCount());
    currentIndex    = Math.min(currentIndex, maxIndex);
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { currentIndex = Math.max(0, currentIndex - 1); updateSlider(); });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    const maxIndex = Math.max(0, cards.length - visibleCount());
    currentIndex = Math.min(maxIndex, currentIndex + 1);
    updateSlider();
  });
  dots.forEach((d, i) => {
    d.addEventListener('click', () => { currentIndex = i; updateSlider(); });
  });

  // Auto-advance
  let autoSlide = setInterval(() => {
    const maxIndex = Math.max(0, cards.length - visibleCount());
    currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    updateSlider();
  }, 5000);

  // Pause on hover
  track.addEventListener('mouseenter', () => clearInterval(autoSlide));
  track.addEventListener('mouseleave', () => {
    autoSlide = setInterval(() => {
      const maxIndex = Math.max(0, cards.length - visibleCount());
      currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
      updateSlider();
    }, 5000);
  });

  window.addEventListener('resize', updateSlider);
  updateSlider();
}

// ---- CARD NUMBER FORMATTING (if on booking page) ----
const cardInput = document.getElementById('p-card');
if (cardInput) {
  cardInput.addEventListener('input', () => {
    let v = cardInput.value.replace(/\D/g, '').slice(0, 16);
    cardInput.value = v.replace(/(.{4})/g, '$1 ').trim();
  });
}
const expiryInput = document.getElementById('p-expiry');
if (expiryInput) {
  expiryInput.addEventListener('input', () => {
    let v = expiryInput.value.replace(/\D/g, '').slice(0, 4);
    if (v.length > 2) v = v.slice(0, 2) + ' / ' + v.slice(2);
    expiryInput.value = v;
  });
}
