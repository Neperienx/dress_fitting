const detailPanel = document.querySelector('.store-detail');
const detailName = document.querySelector('.store-detail-name');
const detailLocation = document.querySelector('.store-detail-location');
const detailMeta = document.querySelector('.store-detail-meta');
const detailPhoto = document.querySelector('.store-detail-photo');
const detailMiniatures = document.querySelector('[data-dress-miniatures]');
const dressPhotoForm = document.querySelector('[data-dress-photo-form]');
const dressPhotoInput = dressPhotoForm?.querySelector('[data-dress-photo-input]');
const dressPhotoSubmit = dressPhotoForm?.querySelector('[data-dress-photo-submit]');
const dressPhotoMessage = dressPhotoForm?.querySelector('[data-dress-photo-message]');
const storeGrid = document.querySelector('.store-grid');
const sessionKey = 'bridalStudioCurrentUser';
const usersKey = 'bridalStudioUsers';
const loginLink = document.querySelector('[data-auth-login-link]');
const userMenu = document.querySelector('[data-user-menu]');
const userMenuTrigger = document.querySelector('[data-user-menu-trigger]');
const userMenuName = document.querySelector('[data-user-menu-name]');
const userMenuPanel = document.querySelector('[data-user-menu-panel]');
const logoutButton = document.querySelector('[data-auth-logout]');

const getSessionUser = () => (localStorage.getItem(sessionKey) || '').trim();

const closeUserMenu = () => {
  if (!userMenuPanel) {
    return;
  }
  userMenuPanel.classList.add('is-hidden');
};

const updateHeaderAuth = () => {
  const currentUser = getSessionUser();
  const isLoggedIn = Boolean(currentUser);

  if (loginLink) {
    loginLink.classList.toggle('is-hidden', isLoggedIn);
  }
  if (userMenu) {
    userMenu.classList.toggle('is-hidden', !isLoggedIn);
  }
  if (userMenuName) {
    userMenuName.textContent = currentUser;
  }
  if (!isLoggedIn) {
    closeUserMenu();
  }
};

const setDressPhotoMessage = (message, type) => {
  if (!dressPhotoMessage) {
    return;
  }
  dressPhotoMessage.textContent = message;
  dressPhotoMessage.classList.remove('is-error', 'is-success');
  if (type === 'error') {
    dressPhotoMessage.classList.add('is-error');
  }
  if (type === 'success') {
    dressPhotoMessage.classList.add('is-success');
  }
};

const setDressPhotoFormState = (tile) => {
  if (!dressPhotoForm || !dressPhotoSubmit) {
    return;
  }
  const storeId = tile?.dataset.storeId;
  dressPhotoForm.dataset.storeId = storeId || '';
  dressPhotoSubmit.disabled = !storeId;
  if (!storeId) {
    setDressPhotoMessage('Upload is available for stores linked to your account.', '');
    return;
  }
  setDressPhotoMessage('', '');
};

if (userMenuTrigger) {
  userMenuTrigger.addEventListener('click', () => {
    if (!userMenuPanel) {
      return;
    }
    userMenuPanel.classList.toggle('is-hidden');
  });
}

document.addEventListener('click', (event) => {
  if (!userMenu) {
    return;
  }
  if (!userMenu.contains(event.target)) {
    closeUserMenu();
  }
});

if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem(sessionKey);
    updateHeaderAuth();
    if (window.location.pathname === '/stores' || window.location.pathname === '/stores/') {
      window.location.assign('/login');
      return;
    }
    window.location.reload();
  });
}

updateHeaderAuth();


const getStorePhotoUrls = (tile, defaultPhoto) => {
  if (!tile) {
    return [defaultPhoto];
  }
  const photoUrlsRaw = tile.dataset.photoUrls;
  if (photoUrlsRaw) {
    try {
      const parsed = JSON.parse(photoUrlsRaw);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed;
      }
    } catch (error) {
      // Ignore invalid payloads.
    }
  }
  const singlePhoto = tile.dataset.photoUrl;
  return singlePhoto ? [singlePhoto] : [defaultPhoto];
};

const renderMiniatures = (photoUrls, selectedPhoto) => {
  if (!detailMiniatures) {
    return;
  }
  detailMiniatures.innerHTML = '';
  photoUrls.forEach((photoUrl, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('store-miniature-button');
    if (photoUrl === selectedPhoto) {
      button.classList.add('is-selected');
    }

    const image = document.createElement('img');
    image.classList.add('store-miniature-image');
    image.src = photoUrl;
    image.alt = `Dress ${index + 1}`;

    button.appendChild(image);
    button.addEventListener('click', () => {
      if (!detailPhoto) {
        return;
      }
      detailPhoto.src = photoUrl;
      renderMiniatures(photoUrls, photoUrl);
    });
    detailMiniatures.appendChild(button);
  });
};

const renderDetails = (tile) => {
  if (!detailPanel || !detailName || !detailLocation || !detailMeta) {
    return;
  }

  const defaultPhoto = detailPanel.dataset.defaultPhoto || 'images/default-dress.svg';

  if (!tile) {
    detailName.textContent = detailPanel.dataset.emptyText || 'Select a store to see details.';
    detailLocation.textContent = '';
    detailMeta.innerHTML = '';
    if (detailPhoto) {
      detailPhoto.src = defaultPhoto;
    }
    renderMiniatures([defaultPhoto], defaultPhoto);
    setDressPhotoFormState(null);
    return;
  }

  const name = tile.dataset.name;
  const location = tile.dataset.location;
  const manager = tile.dataset.manager;
  const invite = tile.dataset.invite;
  const photoUrls = getStorePhotoUrls(tile, defaultPhoto);
  const photoUrl = photoUrls[0] || defaultPhoto;

  detailName.textContent = name;
  detailLocation.textContent = location;
  detailMeta.innerHTML = '';
  if (detailPhoto) {
    detailPhoto.src = photoUrl;
  }
  renderMiniatures(photoUrls, photoUrl);

  const managerItem = document.createElement('li');
  managerItem.textContent = manager;
  detailMeta.appendChild(managerItem);

  const inviteItem = document.createElement('li');
  inviteItem.textContent = `Invite code: ${invite}`;
  detailMeta.appendChild(inviteItem);

  setDressPhotoFormState(tile);
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

if (dressPhotoForm) {
  dressPhotoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const storeId = dressPhotoForm.dataset.storeId;
    if (!storeId) {
      setDressPhotoMessage('Select one of your stores first.', 'error');
      return;
    }
    const file = dressPhotoInput?.files?.[0];
    if (!file) {
      setDressPhotoMessage('Please choose a photo before uploading.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('dress_photo', file);
    setDressPhotoMessage('Uploading photo...', '');

    try {
      const response = await fetch(`/api/stores/${storeId}/dress-photo`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setDressPhotoMessage(errorData.error || 'Unable to upload photo right now.', 'error');
        return;
      }

      const store = await response.json();
      const photoUrl = store.dress_photo_url;
      const photoUrls = Array.isArray(store.dress_photo_urls) ? store.dress_photo_urls : [];
      const tile = storeGrid?.querySelector(`[data-store-id="${storeId}"]`);
      if (tile && photoUrl) {
        tile.dataset.photoUrl = photoUrl;
        tile.dataset.photoUrls = JSON.stringify(photoUrls);
      }
      if (tile && detailName?.textContent === tile.dataset.name) {
        renderDetails(tile);
      }
      if (dressPhotoInput) {
        dressPhotoInput.value = '';
      }
      setDressPhotoMessage('Dress photo updated for this store.', 'success');
    } catch (error) {
      setDressPhotoMessage('Unable to upload photo right now.', 'error');
    }
  });
}

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

  const getCurrentUser = () => getSessionUser();

  const buildStoreTile = (store) => {
    const tile = document.createElement('button');
    tile.classList.add('store-tile');
    tile.type = 'button';
    tile.dataset.name = store.name;
    tile.dataset.location = store.location;
    tile.dataset.manager = `Owner: ${store.owner_email}`;
    tile.dataset.invite = store.invite_code;
    const photoUrls = Array.isArray(store.dress_photo_urls) ? store.dress_photo_urls : [];
    tile.dataset.photoUrls = JSON.stringify(photoUrls);
    tile.dataset.photoUrl = store.dress_photo_url || detailPanel?.dataset.defaultPhoto || 'images/default-dress.svg';
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
