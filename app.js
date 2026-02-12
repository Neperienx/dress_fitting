const storeGrid = document.querySelector('.store-grid');
const detailPanel = document.querySelector('.store-detail');
const overviewName = document.querySelector('[data-store-overview-name]');
const overviewAddress = document.querySelector('[data-store-overview-address]');
const overviewPhotoCount = document.querySelector('[data-store-overview-photo-count]');
const storeDetailsLink = document.querySelector('[data-store-details-link]');
const detailsName = document.querySelector('[data-store-details-name]');
const detailsAddress = document.querySelector('[data-store-details-address]');
const detailsPhotoCount = document.querySelector('[data-store-details-photo-count]');
const detailsOwner = document.querySelector('[data-store-details-owner]');
const detailsInviteCode = document.querySelector('[data-store-details-invite]');
const detailsCreatedAt = document.querySelector('[data-store-details-created]');
const detailsPreviewImage = document.querySelector('[data-dress-preview-image]');
const detailMiniatures = document.querySelector('[data-dress-miniatures]');
const dressPhotoForm = document.querySelector('[data-dress-photo-form]');
const dressPhotoInput = dressPhotoForm?.querySelector('[data-dress-photo-input]');
const dressPhotoSubmit = dressPhotoForm?.querySelector('[data-dress-photo-submit]');
const dressPhotoMessage = dressPhotoForm?.querySelector('[data-dress-photo-message]');
const sessionKey = 'bridalStudioCurrentUser';
const usersKey = 'bridalStudioUsers';
const loginLink = document.querySelector('[data-auth-login-link]');
const userMenu = document.querySelector('[data-user-menu]');
const userMenuTrigger = document.querySelector('[data-user-menu-trigger]');
const userMenuName = document.querySelector('[data-user-menu-name]');
const userMenuPanel = document.querySelector('[data-user-menu-panel]');
const logoutButton = document.querySelector('[data-auth-logout]');

let photoLightbox = null;
let photoLightboxImage = null;
let selectedPreviewPhotoUrl = '';
let activeStoreCanManagePhotos = false;

const getSessionUser = () => (localStorage.getItem(sessionKey) || '').trim();

const closePhotoLightbox = () => {
  if (!photoLightbox) {
    return;
  }
  photoLightbox.classList.add('is-hidden');
};

const ensurePhotoLightbox = () => {
  if (photoLightbox) {
    return;
  }

  photoLightbox = document.createElement('div');
  photoLightbox.className = 'photo-lightbox is-hidden';

  const content = document.createElement('div');
  content.className = 'photo-lightbox-content';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'photo-lightbox-close';
  closeButton.setAttribute('aria-label', 'Close full-size image');
  closeButton.textContent = '×';

  photoLightboxImage = document.createElement('img');
  photoLightboxImage.className = 'photo-lightbox-image';
  photoLightboxImage.alt = 'Full-size dress photo';

  closeButton.addEventListener('click', closePhotoLightbox);
  content.addEventListener('click', (event) => {
    event.stopPropagation();
  });
  photoLightbox.addEventListener('click', closePhotoLightbox);

  content.appendChild(closeButton);
  content.appendChild(photoLightboxImage);
  photoLightbox.appendChild(content);
  document.body.appendChild(photoLightbox);
};

const openPhotoLightbox = (photoUrl) => {
  if (!photoUrl) {
    return;
  }
  ensurePhotoLightbox();
  if (!photoLightbox || !photoLightboxImage) {
    return;
  }
  photoLightboxImage.src = photoUrl;
  photoLightbox.classList.remove('is-hidden');
};

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closePhotoLightbox();
  }
});

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
    if (window.location.pathname.startsWith('/stores')) {
      window.location.assign('/login');
      return;
    }
    window.location.reload();
  });
}

updateHeaderAuth();

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

const getStorePhotoUrlsFromTile = (tile) => {
  if (!tile) {
    return [];
  }
  const photoUrlsRaw = tile.dataset.photoUrls;
  if (!photoUrlsRaw) {
    return [];
  }
  try {
    const parsed = JSON.parse(photoUrlsRaw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    // Ignore malformed payload.
  }
  return [];
};

const setOverviewStore = (tile) => {
  if (!detailPanel || !overviewName || !overviewAddress || !overviewPhotoCount || !storeDetailsLink) {
    return;
  }

  if (!tile) {
    const emptyText = detailPanel.dataset.emptyText || 'Select a store to see details.';
    overviewName.textContent = emptyText;
    overviewAddress.textContent = '';
    overviewPhotoCount.textContent = '';
    storeDetailsLink.classList.add('is-disabled');
    storeDetailsLink.setAttribute('aria-disabled', 'true');
    storeDetailsLink.setAttribute('href', '#');
    return;
  }

  const photoUrls = getStorePhotoUrlsFromTile(tile);
  const photoCount = photoUrls.length;
  overviewName.textContent = tile.dataset.name || '';
  overviewAddress.textContent = tile.dataset.location || '';
  overviewPhotoCount.textContent = `${photoCount} picture${photoCount === 1 ? '' : 's'}`;

  const storeId = tile.dataset.storeId;
  if (storeId) {
    storeDetailsLink.classList.remove('is-disabled');
    storeDetailsLink.setAttribute('aria-disabled', 'false');
    storeDetailsLink.setAttribute('href', `/details?store=${encodeURIComponent(storeId)}`);
  }
};

if (storeGrid) {
  storeGrid.addEventListener('click', (event) => {
    const tile = event.target.closest('.store-tile');
    if (!tile || tile.classList.contains('add-tile')) {
      return;
    }
    setOverviewStore(tile);
  });
}

const initialStore = document.querySelector('.store-tile:not(.add-tile)');
if (initialStore && overviewName) {
  setOverviewStore(initialStore);
}

const setPreviewPhoto = (photoUrl) => {
  selectedPreviewPhotoUrl = photoUrl || '';
  if (!detailsPreviewImage) {
    return;
  }
  if (!photoUrl) {
    detailsPreviewImage.classList.add('is-hidden');
    detailsPreviewImage.removeAttribute('src');
    return;
  }
  detailsPreviewImage.src = photoUrl;
  detailsPreviewImage.classList.remove('is-hidden');
};

const removeDressPhoto = async (storeId, photoUrl) => {
  const ownerEmail = getSessionUser();
  if (!storeId || !photoUrl || !ownerEmail) {
    return;
  }

  setDressPhotoMessage('Removing photo...', '');
  try {
    const response = await fetch(`/api/stores/${storeId}/dress-photo`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo_path: photoUrl, owner_email: ownerEmail }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      setDressPhotoMessage(errorData.error || 'Unable to remove this photo right now.', 'error');
      return;
    }
    const store = await response.json();
    updateDetailsSummary(store);
    setDressPhotoMessage('Photo removed.', 'success');
  } catch (error) {
    setDressPhotoMessage('Unable to remove this photo right now.', 'error');
  }
};

const renderDetailsGallery = (photoUrls, storeId) => {
  if (!detailMiniatures) {
    return;
  }
  detailMiniatures.innerHTML = '';
  setPreviewPhoto(photoUrls[0] || '');

  if (!photoUrls.length) {
    const empty = document.createElement('p');
    empty.className = 'store-detail-location';
    empty.textContent = 'No dress pictures yet. Upload your first one above.';
    detailMiniatures.appendChild(empty);
    return;
  }

  photoUrls.forEach((photoUrl, index) => {
    const tile = document.createElement('div');
    tile.className = 'dress-grid-tile';

    const previewButton = document.createElement('button');
    previewButton.type = 'button';
    previewButton.className = 'store-miniature-button';

    const image = document.createElement('img');
    image.className = 'store-miniature-image';
    image.src = photoUrl;
    image.alt = `Dress ${index + 1}`;

    previewButton.appendChild(image);
    previewButton.addEventListener('click', () => {
      setPreviewPhoto(photoUrl);
      const allButtons = detailMiniatures.querySelectorAll('.store-miniature-button');
      allButtons.forEach((button) => button.classList.remove('is-selected'));
      previewButton.classList.add('is-selected');
    });

    if (photoUrl === selectedPreviewPhotoUrl || (!selectedPreviewPhotoUrl && index === 0)) {
      previewButton.classList.add('is-selected');
    }
    tile.appendChild(previewButton);

    if (activeStoreCanManagePhotos) {
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'text-link dress-remove-button';
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => {
        removeDressPhoto(storeId, photoUrl);
      });
      tile.appendChild(removeButton);
    }

    detailMiniatures.appendChild(tile);
  });
};

const updateDetailsSummary = (store) => {
  if (!detailsName || !detailsAddress || !detailsPhotoCount) {
    return;
  }
  if (!store) {
    detailsName.textContent = 'Store not found. Return to Stores and choose a store again.';
    detailsAddress.textContent = '';
    detailsPhotoCount.textContent = '';
    if (detailsOwner) {
      detailsOwner.textContent = '';
    }
    if (detailsInviteCode) {
      detailsInviteCode.textContent = '';
    }
    if (detailsCreatedAt) {
      detailsCreatedAt.textContent = '';
    }
    if (dressPhotoSubmit) {
      dressPhotoSubmit.disabled = true;
    }
    activeStoreCanManagePhotos = false;
    renderDetailsGallery([], '');
    return;
  }

  const photoUrls = Array.isArray(store.dress_photo_urls) ? store.dress_photo_urls : [];
  const currentUser = getSessionUser();
  activeStoreCanManagePhotos = Boolean(currentUser && store.owner_email === currentUser);
  detailsName.textContent = store.name || '';
  detailsAddress.textContent = store.location || '';
  detailsPhotoCount.textContent = `${photoUrls.length} picture${photoUrls.length === 1 ? '' : 's'}`;
  if (detailsOwner) {
    detailsOwner.textContent = `Owner: ${store.owner_email || ''}`;
  }
  if (detailsInviteCode) {
    detailsInviteCode.textContent = `Invite code: ${store.invite_code || ''}`;
  }
  if (detailsCreatedAt) {
    const readableDate = store.created_at
      ? new Date(store.created_at).toLocaleString()
      : '';
    detailsCreatedAt.textContent = readableDate ? `Created: ${readableDate}` : '';
  }
  if (dressPhotoForm) {
    dressPhotoForm.dataset.storeId = String(store.id);
  }
  if (dressPhotoSubmit) {
    dressPhotoSubmit.disabled = !activeStoreCanManagePhotos;
  }
  if (dressPhotoInput) {
    dressPhotoInput.disabled = !activeStoreCanManagePhotos;
  }
  renderDetailsGallery(photoUrls, String(store.id));
};

const loadStoreDetailsPage = async () => {
  if (!detailsName) {
    return;
  }

  const currentUser = getSessionUser();
  if (!currentUser) {
    window.location.assign('/login');
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const storeId = params.get('store');
  if (!storeId) {
    updateDetailsSummary(null);
    return;
  }

  setDressPhotoMessage('', '');
  if (dressPhotoSubmit) {
    dressPhotoSubmit.disabled = true;
  }

  try {
    const response = await fetch(`/api/stores?owner=${encodeURIComponent(currentUser)}`);
    if (!response.ok) {
      updateDetailsSummary(null);
      return;
    }

    const data = await response.json();
    const stores = Array.isArray(data.stores) ? data.stores : [];
    const store = stores.find((candidate) => String(candidate.id) === storeId);
    updateDetailsSummary(store || null);
  } catch (error) {
    updateDetailsSummary(null);
  }
};

if (dressPhotoForm) {
  dressPhotoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const storeId = dressPhotoForm.dataset.storeId;
    if (!storeId) {
      setDressPhotoMessage('Select a store first.', 'error');
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
      formData.append('owner_email', getSessionUser());
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
      updateDetailsSummary(store);
      if (dressPhotoInput) {
        dressPhotoInput.value = '';
      }
      setDressPhotoMessage('Dress photo uploaded.', 'success');
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
    tile.dataset.photoUrl = store.dress_photo_url || 'images/default-dress.svg';
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
      const firstLoadedStore = document.querySelector('.store-tile:not(.add-tile)');
      setOverviewStore(firstLoadedStore);
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
        setOverviewStore(tile);
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
        setOverviewStore(tile);
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

loadStoreDetailsPage();

if (detailsPreviewImage) {
  detailsPreviewImage.addEventListener('click', () => {
    if (selectedPreviewPhotoUrl) {
      openPhotoLightbox(selectedPreviewPhotoUrl);
    }
  });
}
