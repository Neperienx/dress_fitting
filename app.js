const detailPanel = document.querySelector('.store-detail');
const detailName = document.querySelector('.store-detail-name');
const detailLocation = document.querySelector('.store-detail-location');
const detailMeta = document.querySelector('.store-detail-meta');
const storeTiles = document.querySelectorAll('.store-tile');

const renderDetails = (tile) => {
  if (!detailPanel || !detailName || !detailLocation || !detailMeta) {
    return;
  }

  if (!tile) {
    detailName.textContent = detailPanel.dataset.emptyText || 'Select a store to see details.';
    detailLocation.textContent = '';
    detailMeta.innerHTML = '';
    return;
  }

  const name = tile.dataset.name;
  const location = tile.dataset.location;
  const manager = tile.dataset.manager;
  const invite = tile.dataset.invite;

  detailName.textContent = name;
  detailLocation.textContent = location;
  detailMeta.innerHTML = '';

  const managerItem = document.createElement('li');
  managerItem.textContent = manager;
  detailMeta.appendChild(managerItem);

  const inviteItem = document.createElement('li');
  inviteItem.textContent = `Invite code: ${invite}`;
  detailMeta.appendChild(inviteItem);
};

storeTiles.forEach((tile) => {
  if (tile.classList.contains('add-tile')) {
    return;
  }
  tile.addEventListener('click', () => renderDetails(tile));
});

const firstStore = document.querySelector('.store-tile:not(.add-tile)');
renderDetails(firstStore);

const authCard = document.querySelector('[data-auth-card]');
if (authCard) {
  const usersKey = 'bridalStudioUsers';
  const sessionKey = 'bridalStudioCurrentUser';
  const panels = {
    login: authCard.querySelector('[data-auth-panel="login"]'),
    signup: authCard.querySelector('[data-auth-panel="signup"]'),
  };

  const readUsers = () => {
    try {
      return JSON.parse(localStorage.getItem(usersKey)) || {};
    } catch (error) {
      return {};
    }
  };

  const writeUsers = (users) => {
    localStorage.setItem(usersKey, JSON.stringify(users));
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
      const email = loginForm.email.value.trim().toLowerCase();
      const password = loginForm.password.value;
      if (!email || !password) {
        setMessage(panels.login, 'Please enter both your email and password.', 'error');
        return;
      }
      const users = readUsers();
      if (!users[email]) {
        setMessage(panels.login, 'No account found. Create one to get started.', 'error');
        return;
      }
      if (users[email] !== password) {
        setMessage(panels.login, 'That password does not match. Try again.', 'error');
        return;
      }
      localStorage.setItem(sessionKey, email);
      setMessage(panels.login, 'Success! Redirecting to your dashboard...', 'success');
      window.location.assign('/stores');
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = signupForm.email.value.trim().toLowerCase();
      const password = signupForm.password.value;
      if (!email || !password) {
        setMessage(panels.signup, 'Please enter an email and password to continue.', 'error');
        return;
      }
      const users = readUsers();
      if (users[email]) {
        setMessage(panels.signup, 'This email already exists. Log in instead.', 'error');
        return;
      }
      users[email] = password;
      writeUsers(users);
      setMessage(panels.signup, 'Account created! You can log in now.', 'success');
      loginForm.email.value = email;
      loginForm.password.value = '';
      showPanel('login');
    });
  }
}
