(() => {
  const initAuthPage = ({ sessionKey, usersKey, legacyUsersKeys }) => {
    const authCard = document.querySelector('[data-auth-card]');
    if (!authCard) {
      return;
    }

    const panels = {
      login: authCard.querySelector('[data-auth-panel="login"]'),
      signup: authCard.querySelector('[data-auth-panel="signup"]'),
    };

    const readUsers = () => {
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

      try {
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
      } catch (error) {
        return {};
      }
    };

    const writeUsers = (users) => {
      try {
        localStorage.setItem(usersKey, JSON.stringify(users));
        return true;
      } catch (error) {
        return false;
      }
    };

    const setMessage = (panel, message, type) => {
      const messageEl = panel.querySelector('[data-auth-message]');
      if (!messageEl) {
        return;
      }
      messageEl.textContent = message;
      messageEl.classList.remove('is-error', 'is-success');
      if (type === 'error') {
        messageEl.classList.add('is-error');
      }
      if (type === 'success') {
        messageEl.classList.add('is-success');
      }
    };

    const clearMessages = () => {
      Object.values(panels).forEach((panel) => {
        if (!panel) {
          return;
        }
        setMessage(panel, '', '');
      });
    };

    const showPanel = (panelName) => {
      Object.entries(panels).forEach(([name, panel]) => {
        if (!panel) {
          return;
        }
        panel.classList.toggle('is-hidden', name !== panelName);
      });
      clearMessages();
    };

    authCard.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-auth-toggle]');
      if (!toggle) {
        return;
      }
      event.preventDefault();
      showPanel(toggle.dataset.authToggle);
    });

    const loginForm = authCard.querySelector('[data-auth-form="login"]');
    const signupForm = authCard.querySelector('[data-auth-form="signup"]');

    if (loginForm) {
      loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = loginForm.username.value.trim().toLowerCase();
        const password = loginForm.password.value;
        if (!username || !password) {
          setMessage(panels.login, 'Please enter both your username and password.', 'error');
          return;
        }
        const users = readUsers();
        if (!users[username]) {
          setMessage(
            panels.login,
            'No account found. Make sure you are on the same browser and URL where you signed up, or create a new account.',
            'error'
          );
          return;
        }
        if (users[username] !== password) {
          setMessage(panels.login, 'That password does not match. Try again.', 'error');
          return;
        }
        localStorage.setItem(sessionKey, username);
        setMessage(panels.login, 'Success! Redirecting to your dashboard...', 'success');
        window.location.assign('/stores');
      });
    }

    if (signupForm && loginForm) {
      signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = signupForm.username.value.trim().toLowerCase();
        const password = signupForm.password.value;
        if (!username || !password) {
          setMessage(panels.signup, 'Please enter a username and password to continue.', 'error');
          return;
        }
        const users = readUsers();
        if (users[username]) {
          setMessage(panels.signup, 'This username already exists. Log in instead.', 'error');
          return;
        }
        users[username] = password;
        const didPersist = writeUsers(users);
        if (!didPersist) {
          setMessage(
            panels.signup,
            'We could not save your account in local storage. Check browser privacy settings and try again.',
            'error'
          );
          return;
        }
        setMessage(panels.signup, 'Account created! You can log in now.', 'success');
        loginForm.username.value = username;
        loginForm.password.value = '';
        showPanel('login');
      });
    }
  };

  window.initAuthPage = initAuthPage;
})();
