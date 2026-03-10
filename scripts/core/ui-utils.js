(function bootstrapUiUtils(globalScope) {
  const createStatusMessageSetter = (element) => {
    return (message, type) => {
      if (!element) {
        return;
      }
      element.textContent = message;
      element.classList.remove('is-error', 'is-success');
      if (type === 'error') {
        element.classList.add('is-error');
      }
      if (type === 'success') {
        element.classList.add('is-success');
      }
    };
  };

  const getActiveLocale = () => (document.documentElement?.lang || 'en').trim().toLowerCase() || 'en';

  const getLocalizedValue = (labels, locale, fallback = 'en') => {
    if (!labels || typeof labels !== 'object') {
      return '';
    }
    return labels[locale] || labels[fallback] || Object.values(labels)[0] || '';
  };

  const normalizeToken = (value) =>
    (value || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

  const resolvePhotoUrl = (photoPath) => {
    const rawPath = (photoPath || '').toString().trim();
    if (!rawPath) {
      return '';
    }
    if (/^(?:https?:|data:|blob:|\/)/i.test(rawPath)) {
      return rawPath;
    }
    return `/${rawPath.replace(/^\.\//, '')}`;
  };

  globalScope.uiUtils = {
    createStatusMessageSetter,
    getActiveLocale,
    getLocalizedValue,
    normalizeToken,
    resolvePhotoUrl,
  };
})(window);
