(() => {
  const createMemoryStorage = () => {
    const values = new Map();
    return {
      getItem: (key) => (values.has(key) ? values.get(key) : null),
      setItem: (key, value) => {
        values.set(key, String(value));
      },
      removeItem: (key) => {
        values.delete(key);
      },
    };
  };

  const canUseBrowserStorage = () => {
    try {
      return Boolean(window.localStorage);
    } catch (error) {
      return false;
    }
  };

  const createBrowserStorageAdapter = () => {
    const storage = canUseBrowserStorage() ? window.localStorage : createMemoryStorage();

    return {
      getItem: (key) => {
        try {
          return storage.getItem(key);
        } catch (error) {
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          storage.setItem(key, String(value));
          return true;
        } catch (error) {
          return false;
        }
      },
      removeItem: (key) => {
        try {
          storage.removeItem(key);
          return true;
        } catch (error) {
          return false;
        }
      },
    };
  };

  window.createBrowserStorageAdapter = createBrowserStorageAdapter;
})();
