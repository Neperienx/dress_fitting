(() => {
  const parseStoredUsers = (storageAdapter, key) => {
    try {
      const raw = storageAdapter.getItem(key);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  };

  const createAuthStorage = ({ sessionKey, usersKey, legacyUsersKeys = [], storageAdapter }) => {
    const adapter =
      storageAdapter ||
      (typeof window.createBrowserStorageAdapter === 'function' ? window.createBrowserStorageAdapter() : null);

    if (!adapter) {
      return null;
    }
    const readUsers = () => {
      const users = parseStoredUsers(adapter, usersKey);
      if (Object.keys(users).length > 0) {
        return users;
      }

      for (const key of legacyUsersKeys) {
        const legacyUsers = parseStoredUsers(adapter, key);
        if (Object.keys(legacyUsers).length > 0) {
          adapter.setItem(usersKey, JSON.stringify(legacyUsers));
          return legacyUsers;
        }
      }

      return {};
    };

    const writeUsers = (users) => {
      try {
        return adapter.setItem(usersKey, JSON.stringify(users));
      } catch (error) {
        return false;
      }
    };

    const persistSessionUser = (username) => {
      return adapter.setItem(sessionKey, username);
    };

    return {
      readUsers,
      writeUsers,
      persistSessionUser,
    };
  };

  window.createAuthStorage = createAuthStorage;
})();
