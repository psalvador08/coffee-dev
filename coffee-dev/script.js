/* ==========================================================================
   Coffee.Dev — shared site script (used by index.html and projects.html)
   ========================================================================== */

/* --------------------------------------------------------------------------
   SITE SETTINGS — edit these values
   -------------------------------------------------------------------------- */
const SITE_CONFIG = {
  // Your public profile links. Leave a value empty ('') to hide that icon.
  // Example: github: 'https://github.com/your-username'
  social: {
    github: '',
    linkedin: '',
    behance: '',
    youtube: ''
  },
  // Shown in the contact form's error message if sending fails.
  fallbackEmail: 'psalvador100891@gmail.com',
  // How long to wait for Formspree before showing a network error (ms).
  formTimeout: 15000
};

(function () {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');
  window.__coffeeDevReady = true;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Social links from SITE_CONFIG ---------- */
  function initSocialLinks() {
    document.querySelectorAll('[data-social]').forEach((link) => {
      const url = (SITE_CONFIG.social[link.dataset.social] || '').trim();
      const item = link.closest('li') || link;
      if (url) {
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        item.hidden = false;
      } else {
        link.removeAttribute('href');
        item.hidden = true;
      }
    });
    document.querySelectorAll('[data-social-list]').forEach((list) => {
      list.hidden = !list.querySelector('li:not([hidden])');
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  function initHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  function initMobileNav() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;
    const label = toggle.querySelector('.visually-hidden');
    const desktop = window.matchMedia('(min-width: 961px)');

    const setOpen = (open, { focusToggle = false } = {}) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open', open);
      if (label) label.textContent = open ? 'Close menu' : 'Open menu';
      if (open) {
        const first = nav.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      } else if (focusToggle) {
        toggle.focus();
      }
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false, { focusToggle: true });
    });

    document.addEventListener('click', (event) => {
      if (!nav.classList.contains('is-open')) return;
      if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });

    desktop.addEventListener('change', (event) => {
      if (event.matches) setOpen(false);
    });
  }

  /* ---------- Active navigation link (one-page sections) ---------- */
  function initActiveNav() {
    const links = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;

    const sections = links
      .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
      .filter(Boolean);

    const setActive = (id) => {
      links.forEach((link) => {
        const active = link.getAttribute('href') === '#' + id;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach((section) => observer.observe(section));

    // At the very bottom of the page the last section may be too short to reach the middle.
    window.addEventListener('scroll', () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && sections.length) setActive(sections[sections.length - 1].id);
    }, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const items = Array.from(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    // Small stagger for cards that sit side by side.
    document.querySelectorAll('.service-grid, .project-grid, .projects-all-grid').forEach((grid) => {
      Array.from(grid.children).forEach((child, i) => {
        child.style.setProperty('--reveal-delay', `${(i % 4) * 0.08}s`);
      });
    });

    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    items.forEach((item) => observer.observe(item));
  }

  /* ---------- Back to top ---------- */
  function initBackToTop() {
    const button = document.querySelector('[data-back-to-top]');
    if (!button) return;
    button.hidden = false;
    const update = () => button.classList.toggle('is-visible', window.scrollY > 640);
    update();
    window.addEventListener('scroll', update, { passive: true });
    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      const skipTarget = document.querySelector('.brand');
      if (skipTarget) skipTarget.focus({ preventScroll: true });
    });
  }

  /* ---------- Project screenshots ----------
     Screenshots come from local files (assets/images/projects/) or, until those exist,
     from WordPress.com mShots, which renders the real website. mShots first answers with a
     small "generating preview" image; we wait and ask again until the real capture is ready. */
  function initScreenshots() {
    const isLiveService = (src) => src.indexOf('/mshots/') !== -1;

    document.querySelectorAll('img[data-screenshot]').forEach((img) => {
      const thumb = img.closest('.project-thumb');
      let tries = 0;
      const maxTries = 6;

      const fail = () => {
        img.classList.remove('is-pending');
        if (thumb) thumb.classList.add('is-failed');
      };

      const retry = () => {
        tries += 1;
        img.classList.add('is-pending');
        window.setTimeout(() => {
          const url = new URL(img.src);
          url.searchParams.set('r', String(tries));
          img.src = url.toString();
        }, 2500 + tries * 1500);
      };

      const check = () => {
        if (!img.naturalWidth) { fail(); return; }
        if (isLiveService(img.src) && img.naturalWidth < 800) {
          if (tries < maxTries) retry();
          else fail();
          return;
        }
        img.classList.remove('is-pending');
        if (thumb) thumb.classList.remove('is-failed');
      };

      img.addEventListener('load', check);
      img.addEventListener('error', () => {
        if (isLiveService(img.src) && tries < 1) retry();
        else fail();
      });

      if (img.complete) {
        if (img.naturalWidth) check();
        else if (img.getAttribute('src')) fail();
      } else {
        img.classList.add('is-pending');
      }
    });
  }

  /* ---------- Contact form (Formspree) ---------- */
  function initContactForm() {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;

    form.noValidate = true; // we show our own, friendlier messages
    const submitButton = form.querySelector('[data-submit]');
    const buttonLabel = submitButton.querySelector('.btn-label');
    const status = form.querySelector('[data-form-status]');
    const subjectField = form.querySelector('input[name="_subject"]');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    let submitting = false;
    let attempted = false;

    const rules = {
      name: (v) => (v.trim().length >= 2 ? '' : 'Please enter your full name.'),
      email: (v) => {
        if (!v.trim()) return 'Please enter your email address.';
        return emailPattern.test(v.trim()) ? '' : 'Please enter a valid email address (e.g. name@example.com).';
      },
      service: (v) => (v ? '' : 'Please choose the service you are interested in.'),
      message: (v) => (v.trim().length >= 10 ? '' : 'Please tell me a little about your project (at least 10 characters).')
    };

    const showFieldError = (field, message) => {
      const wrapper = field.closest('[data-field]');
      const error = wrapper && wrapper.querySelector('.field-error');
      if (wrapper) wrapper.classList.toggle('is-invalid', Boolean(message));
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (error) error.textContent = message;
    };

    const validateField = (field) => {
      const rule = rules[field.name];
      if (!rule) return true;
      const message = rule(field.value);
      showFieldError(field, message);
      return !message;
    };

    const validateAll = () => {
      let firstInvalid = null;
      Object.keys(rules).forEach((name) => {
        const field = form.elements[name];
        if (field && !validateField(field) && !firstInvalid) firstInvalid = field;
      });
      return firstInvalid;
    };

    Object.keys(rules).forEach((name) => {
      const field = form.elements[name];
      if (!field) return;
      field.addEventListener('blur', () => { if (attempted || field.value) validateField(field); });
      field.addEventListener('input', () => {
        if (field.closest('[data-field]').classList.contains('is-invalid')) validateField(field);
      });
      field.addEventListener('change', () => { if (attempted) validateField(field); });
    });

    const setStatus = (type, html) => {
      const icon = type === 'success' ? 'i-check' : 'i-alert';
      status.className = `form-status is-${type}`;
      status.innerHTML = `<svg aria-hidden="true"><use href="#${icon}"/></svg><span>${html}</span>`;
      status.hidden = false;
    };

    const setLoading = (loading) => {
      submitting = loading;
      submitButton.disabled = loading;
      submitButton.classList.toggle('is-loading', loading);
      submitButton.setAttribute('aria-busy', String(loading));
      buttonLabel.textContent = loading ? 'Sending…' : 'Send Message';
    };

    const mailLink = `<a href="mailto:${SITE_CONFIG.fallbackEmail}">${SITE_CONFIG.fallbackEmail}</a>`;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (submitting) return; // prevents double submissions
      attempted = true;
      status.hidden = true;

      const firstInvalid = validateAll();
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      if (form.action.indexOf('YOUR_FORM_ID') !== -1) {
        console.warn('Coffee.Dev: the contact form is not connected yet. Replace YOUR_FORM_ID in the form action with your Formspree form ID.');
        setStatus('error', `The contact form isn't connected yet. Please email me directly at ${mailLink}.`);
        return;
      }

      if (navigator.onLine === false) {
        setStatus('error', `You seem to be offline. Please check your connection and try again, or email me at ${mailLink}.`);
        return;
      }

      if (subjectField) {
        const name = form.elements.name.value.trim();
        const service = form.elements.service.value;
        subjectField.value = `New inquiry: ${service} from ${name} (Coffee.Dev)`;
      }

      setLoading(true);
      const controller = 'AbortController' in window ? new AbortController() : null;
      const timer = controller ? window.setTimeout(() => controller.abort(), SITE_CONFIG.formTimeout) : null;

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
          signal: controller ? controller.signal : undefined
        });

        if (response.ok) {
          form.reset();
          attempted = false;
          form.querySelectorAll('[data-field]').forEach((w) => w.classList.remove('is-invalid'));
          setStatus('success', 'Thank you! Your message has been sent. I\'ll get back to you as soon as possible.');
        } else {
          let detail = '';
          try {
            const data = await response.json();
            if (data && Array.isArray(data.errors)) detail = data.errors.map((e) => e.message).join(' ');
          } catch (_) { /* response had no JSON body */ }
          setStatus('error', `Sorry, your message couldn't be sent${detail ? ': ' + escapeHtml(detail) : '.'} Please try again, or email me at ${mailLink}.`);
        }
      } catch (error) {
        const timedOut = error && error.name === 'AbortError';
        setStatus('error', `${timedOut ? 'The request took too long.' : 'Something went wrong while sending.'} Please try again, or email me at ${mailLink}.`);
      } finally {
        if (timer) window.clearTimeout(timer);
        setLoading(false);
      }
    });
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  initSocialLinks();
  initHeader();
  initMobileNav();
  initActiveNav();
  initReveal();
  initBackToTop();
  initScreenshots();
  initContactForm();
})();
