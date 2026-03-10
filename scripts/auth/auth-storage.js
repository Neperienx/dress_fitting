(() => {
  const parseStoredUsers = (key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  };

  const createAuthStorage = ({ sessionKey, usersKey, legacyUsersKeys = [] }) => {
    const readUsers = () => {
      const users = parseStoredUsers(usersKey);
      if (Object.keys(users).length > 0) {
        return users;
      }

      for (const key of legacyUsersKeys) {
        const legacyUsers = parseStoredUsers(key);
        if (Object.keys(legacyUsers).length > 0) {
          localStorage.setItem(usersKey, JSON.stringify(legacyUsers));
          return legacyUsers;
        }
      }

      return {};
    };

    const writeUsers = (users) => {
      try {
        localStorage.setItem(usersKey, JSON.stringify(users));
        return true;
      } catch (error) {
        return false;
      }
    };

    const persistSessionUser = (username) => {
      localStorage.setItem(sessionKey, username);
    };

    return {
      readUsers,
      writeUsers,
      persistSessionUser,
    };
  };

  window.createAuthStorage = createAuthStorage;
})();
