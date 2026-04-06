// ===========================
// BOOKING PAGE JS — booking.js
// ===========================

const ROOM_PRICES = {
  deluxe: { name: 'Deluxe Ocean View', price: 340 },
  suite:  { name: 'Presidential Suite', price: 780 },
  family: { name: 'Family Garden Suite', price: 520 },
};

const DISCOUNT_RATE = 0.05;  // 5% direct booking
const TAX_RATE      = 0.12;  // 12% taxes

let currentStep = 1;

// ---- DATE SETUP ----
const today = new Date();
const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfter = new Date(today); dayAfter.setDate(dayAfter.getDate() + 2);

function fmtDate(d) { return d.toISOString().split('T')[0]; }
function displayDate(str) {
  if (!str) return '—';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });
}

const bCheckin  = document.getElementById('b-checkin');
const bCheckout = document.getElementById('b-checkout');
if (bCheckin)  { bCheckin.value  = fmtDate(tomorrow); bCheckin.min = fmtDate(today); }
if (bCheckout) { bCheckout.value = fmtDate(dayAfter); bCheckout.min = fmtDate(tomorrow); }

if (bCheckin && bCheckout) {
  bCheckin.addEventListener('change', () => {
    const nextDay = new Date(bCheckin.value);
    nextDay.setDate(nextDay.getDate() + 1);
    bCheckout.min = fmtDate(nextDay);
    if (new Date(bCheckout.value) <= new Date(bCheckin.value)) {
      bCheckout.value = fmtDate(nextDay);
    }
    updateSidebar();
  });
  bCheckout.addEventListener('change', updateSidebar);
}

// Read room from URL param
const urlParams = new URLSearchParams(window.location.search);
const preRoom   = urlParams.get('room');
if (preRoom && document.getElementById('room-' + preRoom)) {
  document.querySelectorAll('.room-select-card').forEach(c => c.classList.remove('selected'));
  const radio = document.getElementById('room-' + preRoom);
  if (radio) {
    radio.checked = true;
    radio.closest('.room-select-card').classList.add('selected');
  }
}

// Room selection click
document.querySelectorAll('.room-select-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.room-select-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    const radio = card.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
    updateSidebar();
  });
});

// ---- STEP NAVIGATION ----
function goToStep(step) {
  // Hide all panels
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`panel-${step}`)?.classList.add('active');

  // Update stepper indicators
  for (let i = 1; i <= 3; i++) {
    const ind    = document.getElementById(`step-indicator-${i}`);
    const circle = document.getElementById(`step-circle-${i}`);
    if (!ind) continue;
    ind.classList.remove('active', 'done');
    if (i < step)  { ind.classList.add('done'); circle.textContent = '<svg class="icon-svg-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'; }
    if (i === step){ ind.classList.add('active'); circle.textContent = i; }
    if (i > step)  { circle.textContent = i; }
  }
  const c1 = document.getElementById('connector-1');
  const c2 = document.getElementById('connector-2');
  if (c1) c1.classList.toggle('done', step > 1);
  if (c2) c2.classList.toggle('done', step > 2);

  currentStep = step;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- STEP 1 → 2 ----
document.getElementById('step1-next')?.addEventListener('click', () => {
  const cin  = bCheckin ? bCheckin.value  : '';
  const cout = bCheckout ? bCheckout.value : '';
  if (!cin || !cout) { alert('Please select check-in and check-out dates.'); return; }
  if (new Date(cout) <= new Date(cin)) { alert('Check-out must be after check-in.'); return; }
  goToStep(2);
});

// ---- STEP 2 → 3 ----
document.getElementById('step2-next')?.addEventListener('click', () => {
  let valid = true;
  const fields = [
    { id: 'g-firstname', msg: 'Please enter your first name.' },
    { id: 'g-lastname',  msg: 'Please enter your last name.' },
    { id: 'g-email',     msg: 'Please enter a valid email address.' },
    { id: 'g-phone',     msg: 'Please enter a phone number.' },
  ];
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    const grp = el?.closest('.form-group');
    if (!el || !el.value.trim()) {
      if (grp) grp.classList.add('has-error');
      valid = false;
    } else {
      if (grp) grp.classList.remove('has-error');
    }
  });
  // Email format check
  const emailEl = document.getElementById('g-email');
  if (emailEl && emailEl.value && !/^\S+@\S+\.\S+$/.test(emailEl.value)) {
    emailEl.closest('.form-group')?.classList.add('has-error');
    valid = false;
  }
  if (!valid) return;
  populateSummary();
  goToStep(3);
});

// ---- BACK BUTTONS ----
document.getElementById('step2-back')?.addEventListener('click', () => goToStep(1));
document.getElementById('step3-back')?.addEventListener('click', () => goToStep(2));

// ---- SUMMARY POPULATION ----
function getSelectedRoom() {
  const selected = document.querySelector('input[name="room"]:checked');
  return selected ? ROOM_PRICES[selected.value] || ROOM_PRICES.deluxe : ROOM_PRICES.deluxe;
}

function getNights() {
  if (!bCheckin || !bCheckout) return 0;
  const ci = new Date(bCheckin.value);
  const co = new Date(bCheckout.value);
  const diff = (co - ci) / (1000 * 60 * 60 * 24);
  return Math.max(0, diff);
}

function calcPricing(room, nights) {
  const subtotal  = room.price * nights;
  const discount  = subtotal * DISCOUNT_RATE;
  const taxBase   = subtotal - discount;
  const taxes     = taxBase * TAX_RATE;
  const total     = taxBase + taxes;
  return { subtotal, discount, taxes, total };
}

function fmt(n) { return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

function updateSidebar() {
  const room   = getSelectedRoom();
  const nights = getNights();
  const pricing = calcPricing(room, nights);

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('sb-room',    room.name);
  set('sb-checkin', bCheckin  ? displayDate(bCheckin.value)  : '—');
  set('sb-checkout', bCheckout ? displayDate(bCheckout.value) : '—');
  set('sb-nights',  nights ? nights + (nights === 1 ? ' night' : ' nights') : '—');
  const adults   = document.getElementById('b-adults');
  const children = document.getElementById('b-children');
  let guestStr = adults ? adults.options[adults.selectedIndex].text : '2 Adults';
  if (children && children.value !== '0') guestStr += ', ' + children.options[children.selectedIndex].text;
  set('sb-guests', guestStr);
  set('sb-total', nights ? fmt(pricing.total) : '—');
}

function populateSummary() {
  const room   = getSelectedRoom();
  const nights = getNights();
  const pricing = calcPricing(room, nights);
  const adults  = document.getElementById('b-adults');
  const children = document.getElementById('b-children');
  const firstname = (document.getElementById('g-firstname')?.value || '').trim();
  const lastname  = (document.getElementById('g-lastname')?.value  || '').trim();
  const email     = (document.getElementById('g-email')?.value     || '').trim();

  let guestStr = adults ? adults.options[adults.selectedIndex].text : '2 Adults';
  if (children && children.value !== '0') guestStr += ', ' + children.options[children.selectedIndex].text;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('sum-room',    room.name);
  set('sum-checkin', bCheckin  ? displayDate(bCheckin.value)  : '—');
  set('sum-checkout', bCheckout ? displayDate(bCheckout.value) : '—');
  set('sum-guests',  guestStr);
  set('sum-nights',  nights + (nights === 1 ? ' night' : ' nights'));
  set('sum-name',    firstname + ' ' + lastname);
  set('sum-email',   email);
  set('sum-rate',    fmt(pricing.subtotal));
  set('sum-discount', '−' + fmt(pricing.discount));
  set('sum-taxes',   fmt(pricing.taxes));
  set('sum-total',   fmt(pricing.total));
  // Sidebar too
  updateSidebar();
}

// ---- CONFIRM BOOKING ----
document.getElementById('confirm-booking-btn')?.addEventListener('click', () => {
  // Generate reference
  const ref = 'REF-AUR-' + Math.random().toString(36).toUpperCase().slice(2, 8);
  const refEl = document.getElementById('booking-ref');
  if (refEl) refEl.textContent = ref;

  // Show success panel
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-success')?.classList.add('active');

  // Update all steps to done
  for (let i = 1; i <= 3; i++) {
    const ind = document.getElementById(`step-indicator-${i}`);
    if (ind) { ind.classList.remove('active'); ind.classList.add('done'); }
    const circle = document.getElementById(`step-circle-${i}`);
    if (circle) circle.textContent = '<svg class="icon-svg-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  }
  const c1 = document.getElementById('connector-1');
  const c2 = document.getElementById('connector-2');
  if (c1) c1.classList.add('done');
  if (c2) c2.classList.add('done');

  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ---- INITIAL SIDEBAR ----
updateSidebar();

// Update when adults/children change
document.getElementById('b-adults')?.addEventListener('change', updateSidebar);
document.getElementById('b-children')?.addEventListener('change', updateSidebar);
// Update when room changes
document.querySelectorAll('input[name="room"]').forEach(r => r.addEventListener('change', updateSidebar));
