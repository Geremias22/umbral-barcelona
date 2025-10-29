(() => {
  const MODAL_ID = 'auth-modal';
  let modalEl, dialogEl, lastFocused, focusables;

  // 1) Cargar el fragmento solo una vez
  document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('modal-root');
    if (!root) return;

    try {
      const res = await fetch('partials/auth-modal.html', { credentials: 'same-origin' });
      const html = await res.text();
      root.innerHTML = html;

      modalEl  = document.getElementById(MODAL_ID);
      dialogEl = modalEl?.querySelector('.modal__dialog');

      wireUpEvents();
    } catch (e) {
      console.error('No se pudo cargar el modal de auth:', e);
    }
  });

  // 2) Delegación de eventos global
  function wireUpEvents(){
    // Abrir modal (cualquier botón con data-open="auth")
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-open="auth"]');
      if (btn) {
        e.preventDefault();
        const view = btn.getAttribute('data-view') || 'login';
        openModal(view, btn);
      }
    });

    // Cerrar (overlay o botón con data-close)
    modalEl.addEventListener('click', (e) => {
      if (e.target.matches('[data-close]')) closeModal();
    });

    // Cambiar entre login / registro
    modalEl.addEventListener('click', (e) => {
      const sw = e.target.closest('[data-switch]');
      if (!sw) return;
      const to = sw.getAttribute('data-switch'); // 'login' | 'register'
      switchView(to);
    });

    // Toggle contraseña
    modalEl.addEventListener('click', (e) => {
      const t = e.target.closest('.js-toggle-pass');
      if (!t) return;
      const input = t.parentElement.querySelector('input[type="password"], input[type="text"]');
      if (!input) return;
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      t.setAttribute('aria-pressed', String(isPass));
      t.textContent = isPass ? '👁' : '🔒';
    });

    // Tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        e.preventDefault();
        closeModal();
      }
    });

    // Focus trap (Tab dentro del modal)
    document.addEventListener('keydown', (e) => {
      if (!isOpen() || e.key !== 'Tab') return;
      trapFocus(e);
    });
  }

  function isOpen(){
    return modalEl && modalEl.classList.contains('is-open');
  }

  function openModal(view = 'login', triggerEl = null){
    if (!modalEl) return;
    lastFocused = triggerEl || document.activeElement;

    modalEl.classList.add('is-open');
    document.body.classList.add('no-scroll');
    modalEl.setAttribute('aria-hidden', 'false');

    switchView(view);
    setTimeout(() => {
      dialogEl.focus();
      // lista de focusables
      focusables = dialogEl.querySelectorAll('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])');
    }, 0);
  }

  function closeModal(){
    modalEl.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    modalEl.setAttribute('aria-hidden', 'true');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  function switchView(to){
    const login = modalEl.querySelector('#login-panel');
    const reg   = modalEl.querySelector('#register-panel');
    const title = modalEl.querySelector('#auth-title');

    const showLogin = to === 'login';
    login.hidden = !showLogin;
    reg.hidden   = showLogin;
    title.textContent = showLogin ? 'Inicio de sesión' : 'Registro';

    // Foco inicial
    const first = (showLogin ? login : reg).querySelector('input, button');
    if (first) first.focus();
  }

  function trapFocus(e){
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first){
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last){
      e.preventDefault(); first.focus();
    }
  }
})();
