/**
 * Select Components — Design System
 * Supports: DefaultSelect, MultiSelect, CurrencySelect
 */

/* ====================================================
   Snackbar
   ==================================================== */
function showSnackbar(message) {
  const existing = document.querySelector('.snackbar');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = 'snackbar';
  el.textContent = message;
  document.body.appendChild(el);

  // Trigger animation
  requestAnimationFrame(() => el.classList.add('snackbar--visible'));

  setTimeout(() => {
    el.classList.remove('snackbar--visible');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  }, 2800);
}

/* ====================================================
   Shared utilities
   ==================================================== */

function flagImg(currency) {
  if (!currency) return '';
  if (currency.flagSrc) {
    return `<img src="${currency.flagSrc}" width="20" height="20" alt="${currency.code}" style="border-radius:50%;object-fit:cover;display:block;" />`;
  }
  return currency.flag ?? '';
}

function chevronDown(color = '#202020') {
  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6L8 10L12 6" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function iconClose() {
  return `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2L10 10M10 2L2 10" stroke="#202020" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;
}

function iconCheck() {
  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8L6.5 11.5L13 5" stroke="#202020" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function closeOnClickOutside(wrapperEl) {
  document.addEventListener('click', function handler(e) {
    if (!wrapperEl.contains(e.target)) {
      wrapperEl.classList.remove('is-open');
    }
  });
}

/* ====================================================
   DefaultSelect
   Usage:
     new DefaultSelect('#my-select', {
       label: 'Color',
       placeholder: 'Select an option',
       options: ['Option A', 'Option B'],
       size: 'sm' | 'md',        // default: 'sm'
       disabled: false,
       onChange: (value) => {}
     })
   ==================================================== */
class DefaultSelect {
  constructor(selector, config = {}) {
    this.el = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;
    if (!this.el) return;

    this.config = {
      label: config.label ?? 'Label',
      placeholder: config.placeholder ?? 'Placeholder',
      options: config.options ?? [],
      size: config.size ?? 'sm',
      disabled: config.disabled ?? false,
      onChange: config.onChange ?? null,
    };

    this.value = null;
    this._render();
    this._bind();
  }

  _render() {
    const { label, placeholder, options, size, disabled } = this.config;
    const chevronColor = disabled ? '#D2D2D2' : '#202020';

    this.el.classList.add('select-wrapper', 'select-default', `size-${size}`);
    if (disabled) this.el.classList.add('is-disabled');

    this.el.innerHTML = `
      <label class="select-label">${label}</label>
      <button class="select-field" ${disabled ? 'disabled' : ''} aria-haspopup="listbox" aria-expanded="false">
        <span class="select-text">${placeholder}</span>
        <span class="select-chevron">${chevronDown(chevronColor)}</span>
      </button>
      <ul class="select-dropdown" role="listbox">
        ${options.map((opt, i) => `
          <li class="select-option" role="option" data-index="${i}" data-value="${opt}">
            <span class="select-option-text">${opt}</span>
            <span class="select-option-check"></span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  _bind() {
    const field = this.el.querySelector('.select-field');
    const dropdown = this.el.querySelector('.select-dropdown');

    field?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = this.el.classList.toggle('is-open');
      field.setAttribute('aria-expanded', String(isOpen));
    });

    dropdown?.querySelectorAll('.select-option').forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = opt.dataset.value;
        this.value = text;

        const textEl = this.el.querySelector('.select-text');
        textEl.textContent = text;
        textEl.classList.add('has-value');

        // Update check icons
        dropdown.querySelectorAll('.select-option').forEach(o => {
          o.classList.remove('is-selected');
          o.querySelector('.select-option-check').innerHTML = '';
        });
        opt.classList.add('is-selected');
        opt.querySelector('.select-option-check').innerHTML = iconCheck();

        this.el.classList.remove('is-open');
        field.setAttribute('aria-expanded', 'false');

        if (typeof this.config.onChange === 'function') {
          this.config.onChange(text);
        }
      });
    });

    closeOnClickOutside(this.el);
  }
}

/* ====================================================
   MultiSelect
   Usage:
     new MultiSelect('#my-multi', {
       label: 'Colors',
       placeholder: 'Select several options',
       options: [
         { name: 'Forest Green', sub: 'Pantone 349', color: '#2B8867' },
         { name: 'Teal Blue',    sub: 'Pantone 320', color: '#1D7A8A' },
       ],
       size: 'sm' | 'md',
       disabled: false,
       onChange: (values) => {}
     })
   ==================================================== */
class MultiSelect {
  constructor(selector, config = {}) {
    this.el = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;
    if (!this.el) return;

    this.config = {
      label: config.label ?? 'Label',
      placeholder: config.placeholder ?? 'Select several options',
      options: config.options ?? [],
      size: config.size ?? 'sm',
      disabled: config.disabled ?? false,
      onChange: config.onChange ?? null,
    };

    this.selected = []; // array of option indexes
    this._render();
    this._bind();
  }

  _render() {
    const { label, size, disabled } = this.config;

    this.el.classList.add('select-wrapper', 'select-multi', `size-${size}`);
    if (disabled) this.el.classList.add('is-disabled');

    this.el.innerHTML = `
      <label class="select-label">${label}</label>
      <div class="select-field" role="combobox" aria-expanded="false">
        <div class="select-multi-input">
          <div class="select-tags"></div>
          <span class="select-chevron">${chevronDown()}</span>
        </div>
      </div>
      <ul class="select-dropdown" role="listbox"></ul>
    `;

    this._renderTags();
    this._renderDropdown();
  }

  _renderTags() {
    const tagsEl = this.el.querySelector('.select-tags');
    const { placeholder, options } = this.config;
    const hasSelection = this.selected.length > 0;

    // Toggle chevron ↔ Add button
    const chevronEl = this.el.querySelector('.select-chevron');
    const existingAddBtn = this.el.querySelector('.select-add-btn');

    if (hasSelection && !existingAddBtn) {
      chevronEl?.remove();
      const addBtn = document.createElement('button');
      addBtn.className = 'select-add-btn';
      addBtn.type = 'button';
      addBtn.textContent = 'Add';
      this.el.querySelector('.select-multi-input').appendChild(addBtn);
      this._bindAddBtn(addBtn);
    } else if (!hasSelection && existingAddBtn) {
      existingAddBtn.remove();
      const chevron = document.createElement('span');
      chevron.className = 'select-chevron';
      chevron.innerHTML = chevronDown();
      this.el.querySelector('.select-multi-input').appendChild(chevron);
    }

    if (!hasSelection) {
      tagsEl.innerHTML = `<span class="select-text">${placeholder}</span>`;
      return;
    }

    tagsEl.innerHTML = this.selected.map(idx => {
      const opt = options[idx];
      return `
        <span class="select-tag" data-index="${idx}">
          <span class="select-tag-color" style="background:${opt.color}"></span>
          <span class="select-tag-text">${opt.name}</span>
          <button class="select-tag-remove" type="button" data-index="${idx}" aria-label="Remove ${opt.name}">
            ${iconClose()}
          </button>
        </span>
      `;
    }).join('');

    tagsEl.querySelectorAll('.select-tag-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._deselect(Number(btn.dataset.index));
      });
    });
  }

  _bindAddBtn(btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Confirm selection: clear tags, close dropdown, show snackbar
      const added = this.selected.map(i => this.config.options[i]);
      if (typeof this.config.onChange === 'function') this.config.onChange(added);
      this.selected = [];
      this.el.classList.remove('is-open');
      this.el.querySelector('.select-field')?.setAttribute('aria-expanded', 'false');
      this._update();
      showSnackbar('Colores agregados');
    });
  }

  _renderDropdown() {
    const dropdown = this.el.querySelector('.select-dropdown');
    const { options } = this.config;

    // Only show options that haven't been selected yet
    const available = options.filter((_, i) => !this.selected.includes(i));

    dropdown.innerHTML = available.map((opt) => {
      const i = options.indexOf(opt);
      return `
        <li class="select-option" role="option" aria-selected="false" data-index="${i}">
          <span class="select-option-color" style="background:${opt.color}"></span>
          <div class="select-option-info">
            <span class="select-option-name">${opt.name}</span>
            <span class="select-option-sub">${opt.sub ?? ''}</span>
          </div>
        </li>
      `;
    }).join('');

    // Close dropdown automatically when no options remain
    if (available.length === 0) {
      this.el.classList.remove('is-open');
      this.el.querySelector('.select-field')?.setAttribute('aria-expanded', 'false');
    }

    dropdown.querySelectorAll('.select-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        this._select(Number(opt.dataset.index));
      });
    });
  }

  _select(idx) {
    if (!this.selected.includes(idx)) {
      this.selected.push(idx);
      this._update();
    }
  }

  _deselect(idx) {
    this.selected = this.selected.filter(i => i !== idx);
    this._update();
  }

  _update() {
    this._renderTags();
    this._renderDropdown();
    if (typeof this.config.onChange === 'function') {
      this.config.onChange(this.selected.map(i => this.config.options[i]));
    }
  }

  _bind() {
    const field = this.el.querySelector('.select-field');

    // Toggle open on field click (ignore tag-remove and add-btn — handled separately)
    field.addEventListener('click', (e) => {
      if (e.target.closest('.select-tag-remove') || e.target.closest('.select-add-btn')) return;
      e.stopPropagation();
      const isOpen = this.el.classList.toggle('is-open');
      field.setAttribute('aria-expanded', String(isOpen));
    });

    closeOnClickOutside(this.el);
  }
}

/* ====================================================
   CurrencySelect
   Usage:
     new CurrencySelect('#my-currency', {
       label: 'Currency',
       currencies: [
         { code: 'MXN', flag: '🇲🇽' },
         { code: 'USD', flag: '🇺🇸' },
         { code: 'EUR', flag: '🇪🇺' },
       ],
       value: 'MXN',             // pre-selected
       size: 'sm' | 'md',
       disabled: false,
       onChange: (currency) => {}
     })
   ==================================================== */
class CurrencySelect {
  constructor(selector, config = {}) {
    this.el = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;
    if (!this.el) return;

    this.config = {
      label: config.label ?? 'Label',
      currencies: config.currencies ?? [
        { code: 'MXN', flag: '🇲🇽' },
        { code: 'USD', flag: '🇺🇸' },
      ],
      value: config.value ?? null,
      size: config.size ?? 'sm',
      disabled: config.disabled ?? false,
      onChange: config.onChange ?? null,
    };

    this.value = this.config.value ?? this.config.currencies[0]?.code ?? null;
    this._render();
    this._bind();
  }

  _currentCurrency() {
    return this.config.currencies.find(c => c.code === this.value)
      ?? this.config.currencies[0];
  }

  _render() {
    const { label, size, disabled } = this.config;
    const current = this._currentCurrency();
    const chevronColor = disabled ? '#D2D2D2' : '#202020';

    this.el.classList.add('select-wrapper', 'select-currency', `size-${size}`);
    if (disabled) this.el.classList.add('is-disabled');

    this.el.innerHTML = `
      <label class="select-label">${label}</label>
      <button class="select-field" ${disabled ? 'disabled' : ''} aria-haspopup="listbox" aria-expanded="false">
        <span class="select-currency-flag">${flagImg(current)}</span>
        <span class="select-currency-code">${current?.code ?? ''}</span>
        <span class="select-chevron">${chevronDown(chevronColor)}</span>
      </button>
      <ul class="select-dropdown" role="listbox">
        ${this.config.currencies.map(c => `
          <li class="select-option ${c.code === this.value ? 'is-selected' : ''}"
              role="option"
              aria-selected="${c.code === this.value}"
              data-code="${c.code}">
            <span class="select-option-flag">${flagImg(c)}</span>
            <span class="select-option-code">${c.code}</span>
            ${c.code === this.value
              ? `<span class="select-option-check">${iconCheck()}</span>`
              : '<span class="select-option-check"></span>'
            }
          </li>
        `).join('')}
      </ul>
    `;
  }

  _updateField() {
    const current = this._currentCurrency();
    this.el.querySelector('.select-currency-flag').innerHTML = flagImg(current);
    this.el.querySelector('.select-currency-code').textContent = current?.code ?? '';

    this.el.querySelectorAll('.select-option').forEach(opt => {
      const code = opt.dataset.code;
      const isSelected = code === this.value;
      opt.classList.toggle('is-selected', isSelected);
      opt.setAttribute('aria-selected', String(isSelected));
      opt.querySelector('.select-option-check').innerHTML = isSelected ? iconCheck() : '';
    });
  }

  _bind() {
    const field = this.el.querySelector('.select-field');

    field?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = this.el.classList.toggle('is-open');
      field.setAttribute('aria-expanded', String(isOpen));
    });

    this.el.querySelectorAll('.select-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        this.value = opt.dataset.code;
        this._updateField();
        this.el.classList.remove('is-open');
        field.setAttribute('aria-expanded', 'false');
        if (typeof this.config.onChange === 'function') {
          this.config.onChange(this._currentCurrency());
        }
      });
    });

    closeOnClickOutside(this.el);
  }
}

/* ====================================================
   Exports (for module usage)
   ==================================================== */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DefaultSelect, MultiSelect, CurrencySelect };
}
