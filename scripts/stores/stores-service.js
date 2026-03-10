(() => {
  const createStoresService = (fetchImpl = window.fetch.bind(window)) => {
    const requestJson = async (url, options) => {
      const response = await fetchImpl(url, options);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'Request failed');
      }
      return payload;
    };

    const fetchStoresForOwner = async (ownerEmail) => {
      const payload = await requestJson(`/api/stores?owner=${encodeURIComponent(ownerEmail)}`);
      return Array.isArray(payload.stores) ? payload.stores : [];
    };

    const createStore = (storeInput) =>
      requestJson('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeInput),
      });

    const joinStoreByCode = (joinInput) =>
      requestJson('/api/stores/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(joinInput),
      });

    return {
      fetchStoresForOwner,
      createStore,
      joinStoreByCode,
    };
  };

  window.createStoresService = createStoresService;
})();
