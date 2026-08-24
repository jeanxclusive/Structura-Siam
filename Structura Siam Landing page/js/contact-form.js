// ============================================================
// js/contact-form.js
// Handles the lead capture form: validates required fields, saves
// the enquiry into Supabase, and shows loading/success/error states.
// Depends on the shared client exported from js/supabase.js.
// ============================================================

import { supabase } from './supabase.js';

// ---- OPTIONAL: email notification via EmailJS ----------------
// Leave all three blank to skip email notifications entirely — the
// lead will still be saved to Supabase either way.
//
// To enable:
//   1. Sign up at https://www.emailjs.com (free tier is fine)
//   2. Add an Email Service (e.g. connect your Gmail) -> copy its Service ID
//   3. Create an Email Template with variables {{full_name}}, {{email}},
//      {{phone}}, {{business_name}}, {{service_interested}}, {{message}}
//      -> copy its Template ID
//   4. Account -> General -> copy your Public Key
//   5. Paste all three below. The EmailJS SDK script tag is already
//      included in index.html <head>.
const EMAILJS_PUBLIC_KEY = '';
const EMAILJS_SERVICE_ID = '';
const EMAILJS_TEMPLATE_ID = '';

// ---- Element references ---------------------------------------
const form = document.getElementById('leadForm');
const submitBtn = document.getElementById('leadSubmitBtn');
const statusEl = document.getElementById('formStatus');

// Field IDs that must be non-empty before we submit.
// (business_name is intentionally left out — it's optional.)
const REQUIRED_FIELDS = ['full_name', 'email', 'phone', 'service_interested', 'message'];

const SUBMIT_LABEL_DEFAULT = 'Send Project Details →';

// ---- Small helpers ----------------------------------------------
function setStatus(type, text) {
  // type: 'loading' | 'success' | 'error'
  statusEl.textContent = text;
  statusEl.className = 'status-msg show ' + type;
}

function clearStatus() {
  statusEl.className = 'status-msg';
  statusEl.textContent = '';
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function markField(id, invalid) {
  const wrapper = document.getElementById('field-' + id);
  if (wrapper) wrapper.classList.toggle('invalid', invalid);
}

function clearFieldErrors() {
  document.querySelectorAll('.field.invalid').forEach((el) => el.classList.remove('invalid'));
}

// Validates required fields + email format. Returns true if the form
// can be submitted, and focuses + flags the first problem field if not.
function validateForm() {
  clearFieldErrors();
  let firstInvalidEl = null;

  REQUIRED_FIELDS.forEach((id) => {
    const el = document.getElementById(id);
    const empty = !el.value.trim();
    markField(id, empty);
    if (empty && !firstInvalidEl) firstInvalidEl = el;
  });

  const emailEl = document.getElementById('email');
  const emailVal = emailEl.value.trim();
  if (emailVal && !isValidEmail(emailVal)) {
    markField('email', true);
    if (!firstInvalidEl) firstInvalidEl = emailEl;
  }

  if (firstInvalidEl) {
    firstInvalidEl.focus();
    return false;
  }
  return true;
}

// Fires an EmailJS notification. Never throws — a failed notification
// should never undo the fact that the lead was already saved.
async function sendEmailNotification(payload) {
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) return;
  if (typeof emailjs === 'undefined') return; // SDK script not loaded

  try {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload);
  } catch (err) {
    console.warn('EmailJS notification failed (lead was still saved):', err);
  }
}

// ---- Main submit handler ----------------------------------------
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearStatus();

  // Honeypot check: if this hidden field has a value, a bot filled it in.
  // Silently drop the submission without showing an error (don't tip off bots).
  const honeypot = document.getElementById('company_website');
  if (honeypot && honeypot.value) return;

  if (!validateForm()) {
    setStatus('error', 'Please fill in the required fields (marked *) with a valid email address.');
    return;
  }

  const payload = {
    full_name: document.getElementById('full_name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    business_name: document.getElementById('business_name').value.trim() || null,
    service_interested: document.getElementById('service_interested').value,
    message: document.getElementById('message').value.trim(),
    // "status" is not set here — the database defaults it to 'new'.
  };

  // Loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  setStatus('loading', 'Sending your project details…');

  const { error } = await supabase.from('enquiries').insert([payload]);

  // Reset button regardless of outcome
  submitBtn.disabled = false;
  submitBtn.textContent = SUBMIT_LABEL_DEFAULT;

  if (error) {
    console.error('Supabase insert error:', error);
    setStatus('error', "Something went wrong and we couldn't send your details. Please try again, or email us directly.");
    return;
  }

  // Success
  setStatus('success', "Thanks — your project details are in. We'll be in touch within 2 business days.");
  form.reset();
  clearFieldErrors();

  // Fire-and-forget; does not block or affect the success message above.
  sendEmailNotification(payload);
});
