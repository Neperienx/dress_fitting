(() => {
  const initStoresPage = ({ getSessionUser, storeGrid }) => {
    const storeForm = document.querySelector('[data-store-form]');
    if (!storeForm || !storeGrid) {
      return;
    }

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
      const tile = document.createElement('a');
      tile.classList.add('store-tile');
      tile.href = `/details?store=${encodeURIComponent(String(store.id || ''))}`;
      tile.dataset.name = store.name;
      tile.dataset.location = store.location;
      tile.dataset.manager = `Owner: ${store.owner_email}`;
      tile.dataset.invite = store.invite_code;
      const dressPhotos = Array.isArray(store.dress_photos) ? store.dress_photos : [];
      const photoUrls = dressPhotos
        .map((photo) => photo?.photo_path)
        .filter((photoPath) => typeof photoPath === 'string' && photoPath.trim());
      tile.dataset.photoUrls = JSON.stringify(photoUrls);
      tile.dataset.photoUrl = store.dress_photo_url || 'images/default-dress.svg';
      tile.dataset.storeId = store.id ? String(store.id) : '';

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
        addStoreTile(store);
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
        addStoreTile(store);
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
  };

  window.initStoresPage = initStoresPage;
})();
