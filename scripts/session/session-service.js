(() => {
  const createSessionService = ({ storesService }) => {
    if (!storesService || typeof storesService.fetchStoresForOwner !== 'function') {
      throw new Error('createSessionService requires a storesService with fetchStoresForOwner');
    }

    const fetchOwnerStores = async (ownerEmail) => {
      if (!ownerEmail) {
        return [];
      }
      const stores = await storesService.fetchStoresForOwner(ownerEmail);
      return Array.isArray(stores) ? stores.filter(Boolean) : [];
    };

    const fetchManageableStores = async (ownerEmail) => {
      const stores = await fetchOwnerStores(ownerEmail);
      return stores.filter((store) => store.owner_email === ownerEmail);
    };

    const resolveStoreSelection = ({ stores, requestedStoreId }) => {
      const normalizedStores = Array.isArray(stores) ? stores.filter(Boolean) : [];
      const fallbackStoreId = normalizedStores.length ? String(normalizedStores[0].id) : '';
      const resolvedStoreId = requestedStoreId || fallbackStoreId;
      const selectedStore = normalizedStores.find((store) => String(store.id) === resolvedStoreId) || null;

      return {
        selectedStore,
        resolvedStoreId,
        hasSelectionChanged: Boolean(resolvedStoreId) && String(resolvedStoreId) !== String(requestedStoreId || ''),
      };
    };

    return {
      fetchOwnerStores,
      fetchManageableStores,
      resolveStoreSelection,
    };
  };

  window.createSessionService = createSessionService;
})();
