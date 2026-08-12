(() => {
  const KEY = 'myfit-language';
  const SUPPORTED = new Set(['en','ja','ru','fr','es','de','pt','zh','ko']);

  function storedLanguage() {
    const value = localStorage.getItem(KEY);
    return SUPPORTED.has(value) ? value : 'en';
  }

  function syncSelector() {
    const select = document.querySelector('.lang-mini');
    if (!select) return;
    const value = storedLanguage();
    if (select.value !== value) select.value = value;
    document.documentElement.lang = value;
  }

  document.addEventListener('change', event => {
    const select = event.target.closest?.('.lang-mini, #welcomeLang');
    if (!select || !SUPPORTED.has(select.value)) return;
    localStorage.setItem(KEY, select.value);
    document.documentElement.lang = select.value;
    queueMicrotask(syncSelector);
    document.dispatchEvent(new CustomEvent('myfit-language-change', {
      detail: { language: select.value }
    }));
  });

  document.addEventListener('myfit-language-change', syncSelector);
  window.addEventListener('pageshow', syncSelector);
  window.addEventListener('focus', syncSelector);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) syncSelector();
  });

  syncSelector();
  window.MyFitLanguage = {
    get: storedLanguage,
    set(value) {
      if (!SUPPORTED.has(value)) return false;
      localStorage.setItem(KEY, value);
      syncSelector();
      document.dispatchEvent(new CustomEvent('myfit-language-change', { detail: { language: value } }));
      return true;
    }
  };
})();
