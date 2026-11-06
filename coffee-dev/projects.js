/* ==========================================================================
   Coffee.Dev — projects page: filter the project cards by type.
   Cards list their types in data-category, e.g. data-category="ecommerce industrial".
   The chosen filter is kept in the address (?type=ecommerce) so it can be shared.
   ========================================================================== */
(function () {
  'use strict';

  const bar = document.querySelector('[data-filter-bar]');
  const grid = document.querySelector('[data-projects-grid]');
  if (!bar || !grid) return;

  const buttons = Array.from(bar.querySelectorAll('[data-filter]'));
  const cards = Array.from(grid.querySelectorAll('[data-category]'));
  const status = bar.querySelector('[data-filter-status]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const validFilters = buttons.map((b) => b.dataset.filter);

  const matches = (card, filter) =>
    filter === 'all' || card.dataset.category.split(/\s+/).includes(filter);

  // Show how many projects each filter holds.
  bar.querySelectorAll('[data-count]').forEach((badge) => {
    badge.textContent = String(cards.filter((card) => matches(card, badge.dataset.count)).length);
  });

  function applyFilter(filter, { updateUrl = true } = {}) {
    if (!validFilters.includes(filter)) filter = 'all';

    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    });

    let shown = 0;
    cards.forEach((card) => {
      const visible = matches(card, filter);
      const wasHidden = card.hidden;
      card.hidden = !visible;
      if (visible) {
        shown += 1;
        if (wasHidden) card.classList.add('is-visible'); // a card shown by the filter skips the scroll reveal
        if (wasHidden && !reduceMotion.matches) {
          card.classList.remove('is-entering');
          void card.offsetWidth; // restart the entrance animation
          card.classList.add('is-entering');
        }
      }
    });

    if (status) status.textContent = `Showing ${shown} ${shown === 1 ? 'project' : 'projects'}`;

    if (updateUrl && window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      if (filter === 'all') url.searchParams.delete('type');
      else url.searchParams.set('type', filter);
      window.history.replaceState(null, '', url.toString());
    }
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => applyFilter(button.dataset.filter));
  });

  bar.hidden = false;
  const initial = new URLSearchParams(window.location.search).get('type') || 'all';
  applyFilter(initial, { updateUrl: false });
})();
