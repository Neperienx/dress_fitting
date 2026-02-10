const detailPanel = document.querySelector('.store-detail');
const detailName = document.querySelector('.store-detail-name');
const detailLocation = document.querySelector('.store-detail-location');
const detailMeta = document.querySelector('.store-detail-meta');
const storeGrid = document.querySelector('.store-grid');
const sessionKey = 'bridalStudioCurrentUser';
const usersKey = 'bridalStudioUsers';

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

if (storeGrid) {
  storeGrid.addEventListener('click', (event) => {
    const tile = event.target.closest('.store-tile');
    if (!tile || tile.classList.contains('add-tile')) {
      return;
    }
    renderDetails(tile);
  });
}

const firstStore = document.querySelector('.store-tile:not(.add-tile)');
renderDetails(firstStore);

const authCard = document.querySelector('[data-auth-card]');
if (authCard) {
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
      const username = loginForm.username.value.trim().toLowerCase();
      const password = loginForm.password.value;
      if (!username || !password) {
        setMessage(panels.login, 'Please enter both your username and password.', 'error');
        return;
      }
      const users = readUsers();
      if (!users[username]) {
        setMessage(panels.login, 'No account found. Create one to get started.', 'error');
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

  if (signupForm) {
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
      writeUsers(users);
      setMessage(panels.signup, 'Account created! You can log in now.', 'success');
      loginForm.username.value = username;
      loginForm.password.value = '';
      showPanel('login');
    });
  }
}

const storeForm = document.querySelector('[data-store-form]');
if (storeForm && storeGrid) {
  const nameInput = storeForm.querySelector('[data-store-name]');
  const locationInput = storeForm.querySelector('[data-store-location]');
  const submitButton = storeForm.querySelector('[data-store-submit]');
  const messageEl = storeForm.querySelector('[data-store-message]');
  const joinForm = document.querySelector('[data-store-join-form]');
  const joinCodeInput = joinForm?.querySelector('[data-store-join-code]');
  const joinSubmitButton = joinForm?.querySelector('[data-store-join-submit]');
  const joinMessageEl = joinForm?.querySelector('[data-store-join-message]');

  const setStoreMessage = (message, type) => {
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

  const setJoinMessage = (message, type) => {
    if (!joinMessageEl) {
      return;
    }
    joinMessageEl.textContent = message;
    joinMessageEl.classList.remove('is-error', 'is-success');
    if (type === 'error') {
      joinMessageEl.classList.add('is-error');
    }
    if (type === 'success') {
      joinMessageEl.classList.add('is-success');
    }
  };

  const getCurrentUser = () => (localStorage.getItem(sessionKey) || '').trim();

  const buildStoreTile = (store) => {
    const tile = document.createElement('button');
    tile.classList.add('store-tile');
    tile.type = 'button';
    tile.dataset.name = store.name;
    tile.dataset.location = store.location;
    tile.dataset.manager = `Owner: ${store.owner_email}`;
    tile.dataset.invite = store.invite_code;
    if (store.id) {
      tile.dataset.storeId = store.id;
    }

    const nameSpan = document.createElement('span');
    nameSpan.classList.add('store-name');
    nameSpan.textContent = store.name;
    tile.appendChild(nameSpan);

    const locationSpan = document.createElement('span');
    locationSpan.classList.add('store-location');
    locationSpan.textContent = store.location;
    tile.appendChild(locationSpan);

    return tile;
  };

  const addStoreTile = (store) => {
    if (store.id && storeGrid.querySelector(`[data-store-id="${store.id}"]`)) {
      return null;
    }
    const tile = buildStoreTile(store);
    const addTile = storeGrid.querySelector('.add-tile');
    if (addTile) {
      addTile.insertAdjacentElement('afterend', tile);
    } else {
      storeGrid.appendChild(tile);
    }
    return tile;
  };

  const loadStores = async () => {
    const owner = getCurrentUser();
    if (!owner) {
      return;
    }
    try {
      const response = await fetch(`/api/stores?owner=${encodeURIComponent(owner)}`);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (!Array.isArray(data.stores)) {
        return;
      }
      data.stores.forEach((store) => addStoreTile(store));
    } catch (error) {
      // Ignore fetch errors for now.
    }
  };

  const handleCreate = async () => {
    const owner = getCurrentUser();
    if (!owner) {
      setStoreMessage('Please log in before creating a store.', 'error');
      return;
    }
    const name = nameInput?.value.trim();
    const location = locationInput?.value.trim();
    if (!name || !location) {
      setStoreMessage('Please add both a store name and location.', 'error');
      return;
    }
    setStoreMessage('Creating your store...', '');
    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location, owner_email: owner }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || 'Unable to create the store right now.';
        setStoreMessage(errorMessage, 'error');
        return;
      }
      const store = await response.json();
      const tile = addStoreTile(store);
      if (tile) {
        renderDetails(tile);
      }
      if (nameInput) {
        nameInput.value = '';
      }
      if (locationInput) {
        locationInput.value = '';
      }
      setStoreMessage('Store created and linked to your account.', 'success');
    } catch (error) {
      setStoreMessage('Unable to create the store right now.', 'error');
    }
  };

  const handleJoin = async () => {
    const member = getCurrentUser();
    if (!member) {
      setJoinMessage('Please log in before joining a store.', 'error');
      return;
    }
    const inviteCode = joinCodeInput?.value.trim();
    if (!inviteCode) {
      setJoinMessage('Please enter an invite code to continue.', 'error');
      return;
    }
    setJoinMessage('Linking you to the store...', '');
    try {
      const response = await fetch('/api/stores/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: inviteCode, member_email: member }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Unable to join the store right now.';
        setJoinMessage(errorMessage, 'error');
        return;
      }
      const store = await response.json();
      const tile = addStoreTile(store);
      if (tile) {
        renderDetails(tile);
      }
      if (joinCodeInput) {
        joinCodeInput.value = '';
      }
      setJoinMessage('You are now linked to this store.', 'success');
    } catch (error) {
      setJoinMessage('Unable to join the store right now.', 'error');
    }
  };

  if (submitButton) {
    submitButton.addEventListener('click', handleCreate);
  }
  storeForm.addEventListener('submit', (event) => {
    event.preventDefault();
    handleCreate();
  });

  if (joinSubmitButton) {
    joinSubmitButton.addEventListener('click', handleJoin);
  }
  if (joinForm) {
    joinForm.addEventListener('submit', (event) => {
      event.preventDefault();
      handleJoin();
    });
  }

  loadStores();
}
