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
const dressMetadataForm = document.querySelector('[data-dress-metadata-form]');
const dressPriceInput = dressMetadataForm?.querySelector('[data-dress-price-input]');
const dressMetadataSubmit = dressMetadataForm?.querySelector('[data-dress-metadata-submit]');
const dressMetadataMessage = dressMetadataForm?.querySelector('[data-dress-metadata-message]');
const dressTagOptionsContainer = dressMetadataForm?.querySelector('[data-dress-tag-options]');
const startSessionButton = document.querySelector('[data-start-session-button]');
const sessionMessage = document.querySelector('[data-session-message]');
const swipeWorkspace = document.querySelector('[data-swipe-workspace]');
const swipeCategoryChip = document.querySelector('[data-swipe-category-chip]');
const swipeImage = document.querySelector('[data-swipe-image]');
const swipeCaption = document.querySelector('[data-swipe-caption]');
const swipeProgress = document.querySelector('[data-swipe-progress]');
const swipeSelectedTags = document.querySelector('[data-swipe-selected-tags]');
const dislikeButton = document.querySelector('[data-swipe-dislike]');
const likeButton = document.querySelector('[data-swipe-like]');
const sessionResults = document.querySelector('[data-session-results]');
const sessionBars = document.querySelector('[data-session-bars]');
const adminGrid = document.querySelector('[data-admin-grid]');
const adminMessage = document.querySelector('[data-admin-message]');
const sessionKey = 'bridalStudioCurrentUser';
const usersKey = 'bridalStudioUsers';
const legacyUsersKeys = ['bridalStudioAuthUsers', 'bridalStudioAccounts'];
const loginLink = document.querySelector('[data-auth-login-link]');
const userMenu = document.querySelector('[data-user-menu]');
const userMenuTrigger = document.querySelector('[data-user-menu-trigger]');
const userMenuName = document.querySelector('[data-user-menu-name]');
const userMenuPanel = document.querySelector('[data-user-menu-panel]');
const logoutButton = document.querySelector('[data-auth-logout]');

let photoLightbox = null;
let photoLightboxImage = null;
let selectedPreviewPhotoUrl = '';
let selectedDressPhotoPath = '';
let selectedStoreId = '';
let activeStoreCanManagePhotos = false;
let currentDressPhotos = [];
let tagOptions = null;

let swipeDeck = [];
let swipeIndex = 0;
let swipeLikes = [];
let swipeDislikes = [];

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

const getActiveLocale = () => (document.documentElement?.lang || 'en').trim().toLowerCase() || 'en';

const getLocalizedValue = (labels, locale, fallback = 'en') => {
  if (!labels || typeof labels !== 'object') {
    return '';
  }
  return labels[locale] || labels[fallback] || Object.values(labels)[0] || '';
};

const setDressMetadataMessage = (message, type) => {
  if (!dressMetadataMessage) {
    return;
  }
  dressMetadataMessage.textContent = message;
  dressMetadataMessage.classList.remove('is-error', 'is-success');
  if (type === 'error') {
    dressMetadataMessage.classList.add('is-error');
  }
  if (type === 'success') {
    dressMetadataMessage.classList.add('is-success');
  }
};

const loadTagOptions = async () => {
  if (tagOptions) {
    return tagOptions;
  }
  try {
    const response = await fetch('/api/tag-options');
    if (!response.ok) {
      return null;
    }
    tagOptions = await response.json();
    return tagOptions;
  } catch (error) {
    return null;
  }
};


const setSessionMessage = (message, type) => {
  if (!sessionMessage) {
    return;
  }
  sessionMessage.textContent = message;
  sessionMessage.classList.remove('is-error', 'is-success');
  if (type === 'error') {
    sessionMessage.classList.add('is-error');
  }
  if (type === 'success') {
    sessionMessage.classList.add('is-success');
  }
};

const setAdminMessage = (message, type) => {
  if (!adminMessage) {
    return;
  }
  adminMessage.textContent = message;
  adminMessage.classList.remove('is-error', 'is-success');
  if (type === 'error') {
    adminMessage.classList.add('is-error');
  }
  if (type === 'success') {
    adminMessage.classList.add('is-success');
  }
};

const normalizeToken = (value) =>
  (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

const buildTagToCategoryMap = () => {
  const map = new Map();
  if (!tagOptions || !Array.isArray(tagOptions.categories)) {
    return map;
  }
  tagOptions.categories.forEach((category) => {
    const label = getLocalizedValue(category.label, 'en', tagOptions.defaultLocale || 'en') || category.id;
    (category.tags || []).forEach((tag) => {
      map.set(normalizeToken(tag.id), label);
      map.set(normalizeToken(getLocalizedValue(tag.label, 'en', tagOptions.defaultLocale || 'en')), label);
    });
  });
  return map;
};

const resolvePhotoCategory = (photoPath, tagToCategoryMap, fallbackCategories = []) => {
  const tokens = normalizeToken(photoPath).split('-').filter(Boolean);
  for (const token of tokens) {
    if (tagToCategoryMap.has(token)) {
      return tagToCategoryMap.get(token);
    }
  }
  for (let index = 0; index < tokens.length - 1; index += 1) {
    const pair = `${tokens[index]}-${tokens[index + 1]}`;
    if (tagToCategoryMap.has(pair)) {
      return tagToCategoryMap.get(pair);
    }
  }
  if (fallbackCategories.length) {
    const numericSeed = tokens.join('').split('').reduce((total, char) => total + char.charCodeAt(0), 0);
    return fallbackCategories[numericSeed % fallbackCategories.length];
  }
  return 'General Style';
};

const renderSwipeCard = () => {
  if (!swipeWorkspace || !swipeImage || !swipeCaption || !swipeProgress || !swipeCategoryChip || !dislikeButton || !likeButton) {
    return;
  }
  if (!swipeDeck.length || swipeIndex >= swipeDeck.length) {
    swipeWorkspace.classList.add('is-hidden');
    return;
  }

  const current = swipeDeck[swipeIndex];
  swipeImage.src = current.photoPath;
  swipeCaption.textContent = current.fileName;
  swipeCategoryChip.textContent = current.category;
  swipeProgress.textContent = `Look ${swipeIndex + 1} of ${swipeDeck.length}`;
  if (swipeSelectedTags) {
    const tags = Array.isArray(current.tags) ? current.tags : [];
    swipeSelectedTags.textContent = tags.length
      ? `Selected tags (debug): ${tags.join(', ')}`
      : 'Selected tags (debug): none';
  }
  dislikeButton.disabled = false;
  likeButton.disabled = false;
};

const buildSessionTagInsights = () => {
  const locale = getActiveLocale();
  const defaultLocale = tagOptions?.defaultLocale || 'en';
  const categories = Array.isArray(tagOptions?.categories) ? tagOptions.categories : [];
  const fallbackCategoryLabel = 'Additional Tags';

  const categorySummaries = categories.map((category) => {
    const categoryLabel = getLocalizedValue(category.label, locale, defaultLocale) || category.id;
    const tags = (category.tags || []).map((tag) => ({
      id: tag.id,
      normalizedId: normalizeToken(tag.id),
      label: getLocalizedValue(tag.label, locale, defaultLocale) || tag.id,
      likeCount: 0,
      dislikeCount: 0,
    }));
    return {
      id: category.id,
      label: categoryLabel,
      tags,
    };
  });

  const tagLookup = new Map();
  categorySummaries.forEach((category) => {
    category.tags.forEach((tag) => {
      tagLookup.set(tag.normalizedId, tag);
    });
  });

  const additionalTags = new Map();
  const tallySentimentForItem = (item, sentiment) => {
    const uniqueTags = new Set((Array.isArray(item.tags) ? item.tags : []).map((tag) => normalizeToken(tag)).filter(Boolean));
    uniqueTags.forEach((tagId) => {
      const knownTag = tagLookup.get(tagId);
      if (knownTag) {
        if (sentiment === 'like') {
          knownTag.likeCount += 1;
        } else {
          knownTag.dislikeCount += 1;
        }
        return;
      }

      if (!additionalTags.has(tagId)) {
        additionalTags.set(tagId, {
          id: tagId,
          normalizedId: tagId,
          label: tagId,
          likeCount: 0,
          dislikeCount: 0,
        });
      }
      const additionalTag = additionalTags.get(tagId);
      if (sentiment === 'like') {
        additionalTag.likeCount += 1;
      } else {
        additionalTag.dislikeCount += 1;
      }
    });
  };

  swipeLikes.forEach((item) => tallySentimentForItem(item, 'like'));
  swipeDislikes.forEach((item) => tallySentimentForItem(item, 'dislike'));

  if (additionalTags.size) {
    categorySummaries.push({
      id: 'additional-tags',
      label: fallbackCategoryLabel,
      tags: Array.from(additionalTags.values()).sort((a, b) => a.label.localeCompare(b.label)),
    });
  }

  return categorySummaries;
};

const renderSessionResults = () => {
  if (!sessionResults || !sessionBars) {
    return;
  }
  sessionBars.innerHTML = '';

  if (!swipeLikes.length && !swipeDislikes.length) {
    const empty = document.createElement('p');
    empty.className = 'store-detail-location';
    empty.textContent = 'No swipes recorded yet.';
    sessionBars.appendChild(empty);
  } else {
    const categoryInsights = buildSessionTagInsights();
    const strongest = Math.max(
      1,
      ...categoryInsights.flatMap((category) =>
        category.tags.map((tag) => Math.abs((tag.likeCount || 0) - (tag.dislikeCount || 0)))
      )
    );

    const addScoreBar = (scoreRow, score) => {
      const scoreLabel = document.createElement('span');
      scoreLabel.className = 'session-bar-score-label';
      if (score > 0) {
        scoreLabel.textContent = 'Liked';
      } else if (score < 0) {
        scoreLabel.textContent = 'Disliked';
      } else {
        scoreLabel.textContent = 'Neutral';
      }

      const track = document.createElement('div');
      track.className = 'session-bar-track';

      const fill = document.createElement('div');
      const sentimentClass = score >= 0 ? 'like' : 'dislike';
      fill.className = `session-bar-fill ${sentimentClass}`;
      fill.style.width = score ? `${(Math.abs(score) / strongest) * 100}%` : '0%';
      track.appendChild(fill);

      const countText = document.createElement('span');
      countText.className = 'session-bar-count';
      countText.textContent = score > 0 ? `+${score}` : `${score}`;

      scoreRow.appendChild(scoreLabel);
      scoreRow.appendChild(track);
      scoreRow.appendChild(countText);
    };

    categoryInsights.forEach((category) => {
      const categorySection = document.createElement('section');
      categorySection.className = 'session-tag-category';

      const title = document.createElement('h5');
      title.className = 'session-tag-category-title';
      title.textContent = category.label;
      categorySection.appendChild(title);

      category.tags.forEach((tag) => {
        const score = (tag.likeCount || 0) - (tag.dislikeCount || 0);
        const tagRow = document.createElement('div');
        tagRow.className = 'session-tag-row';

        const label = document.createElement('div');
        label.className = 'session-bar-label';
        label.textContent = `${tag.label} (${tag.likeCount} likes • ${tag.dislikeCount} dislikes)`;

        const scoreRow = document.createElement('div');
        scoreRow.className = 'session-bar-row';
        addScoreBar(scoreRow, score);

        tagRow.appendChild(label);
        tagRow.appendChild(scoreRow);
        categorySection.appendChild(tagRow);
      });

      sessionBars.appendChild(categorySection);
    });
  }

  sessionResults.classList.remove('is-hidden');
  setSessionMessage('Session complete! Here is what your client loved most.', 'success');
};

const handleSwipe = (direction) => {
  if (swipeIndex >= swipeDeck.length) {
    return;
  }
  const current = swipeDeck[swipeIndex];
  if (direction === 'like') {
    swipeLikes.push(current);
  } else {
    swipeDislikes.push(current);
  }
  swipeIndex += 1;

  if (swipeIndex >= swipeDeck.length) {
    renderSessionResults();
    if (swipeWorkspace) {
      swipeWorkspace.classList.add('is-hidden');
    }
    return;
  }

  renderSwipeCard();
};

const startDefaultSession = async () => {
  if (!activeStoreCanManagePhotos) {
    setSessionMessage('Only the store owner can start a session.', 'error');
    return;
  }

  setSessionMessage('Preparing swipe deck...', '');
  await loadTagOptions();

  try {
    const response = await fetch('/api/default-dress-photos');
    if (!response.ok) {
      setSessionMessage('Unable to load default dress photos.', 'error');
      return;
    }
    const data = await response.json();
    const photos = Array.isArray(data.photos) ? data.photos : [];
    if (!photos.length) {
      setSessionMessage('No default photos were found.', 'error');
      return;
    }

    let metadataByPhoto = new Map();
    try {
      const metadataResponse = await fetch('/api/default-dress-metadata');
      if (metadataResponse.ok) {
        const metadataPayload = await metadataResponse.json();
        const metadataRows = Array.isArray(metadataPayload.photos) ? metadataPayload.photos : [];
        metadataByPhoto = new Map(
          metadataRows.map((row) => [row.photo_path, Array.isArray(row.tags) ? row.tags : []])
        );
      }
    } catch (error) {
      // Fallback to filename heuristics.
    }

    const tagMap = buildTagToCategoryMap();
    const fallbackCategories = Array.from(new Set(Array.from(tagMap.values())));
    swipeDeck = photos.map((photoPath) => {
      const tags = metadataByPhoto.get(photoPath) || [];
      const categoryFromTag = tags
        .map((tag) => tagMap.get(normalizeToken(tag)))
        .find((value) => Boolean(value));
      return {
        photoPath,
        fileName: photoPath.split('/').pop() || photoPath,
        tags,
        category: categoryFromTag || resolvePhotoCategory(photoPath, tagMap, fallbackCategories),
      };
    });
    swipeIndex = 0;
    swipeLikes = [];
    swipeDislikes = [];

    if (swipeWorkspace) {
      swipeWorkspace.classList.remove('is-hidden');
    }
    if (sessionResults) {
      sessionResults.classList.add('is-hidden');
    }
    renderSwipeCard();
    setSessionMessage('Swipe right for like and left for dislike. You can also use arrow keys.', '');
  } catch (error) {
    setSessionMessage('Unable to start this session right now.', 'error');
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

const renderTagOptions = (selectedTags = []) => {
  if (!dressTagOptionsContainer) {
    return;
  }
  dressTagOptionsContainer.innerHTML = '';
  const options = tagOptions;
  const locale = getActiveLocale();
  if (!options || !Array.isArray(options.categories)) {
    const empty = document.createElement('p');
    empty.className = 'store-detail-location';
    empty.textContent = 'Tag options unavailable.';
    dressTagOptionsContainer.appendChild(empty);
    return;
  }

  options.categories.forEach((category) => {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'dress-tag-category';

    const legend = document.createElement('legend');
    legend.textContent = getLocalizedValue(category.label, locale, options.defaultLocale || 'en') || category.id;
    fieldset.appendChild(legend);

    const group = document.createElement('div');
    group.className = 'dress-tag-group';
    (category.tags || []).forEach((tag) => {
      const optionLabel = document.createElement('label');
      optionLabel.className = 'dress-tag-option';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = tag.id;
      checkbox.checked = selectedTags.includes(tag.id);
      checkbox.dataset.tagId = tag.id;
      checkbox.disabled = !activeStoreCanManagePhotos;

      const text = document.createElement('span');
      text.textContent = getLocalizedValue(tag.label, locale, options.defaultLocale || 'en') || tag.id;

      optionLabel.appendChild(checkbox);
      optionLabel.appendChild(text);
      group.appendChild(optionLabel);
    });

    fieldset.appendChild(group);
    dressTagOptionsContainer.appendChild(fieldset);
  });
};

const getCurrentDressPhoto = () => currentDressPhotos.find((photo) => photo.photo_path === selectedDressPhotoPath) || null;

const selectDressPhoto = (photoPath) => {
  selectedDressPhotoPath = photoPath || '';
  setPreviewPhoto(photoPath || '');
  const selectedPhoto = getCurrentDressPhoto();
  if (dressPriceInput) {
    dressPriceInput.value = selectedPhoto && typeof selectedPhoto.price === 'number' ? selectedPhoto.price : '';
  }
  renderTagOptions(selectedPhoto?.tags || []);
};

const renderDetailsGallery = (dressPhotos, storeId) => {
  if (!detailMiniatures) {
    return;
  }
  detailMiniatures.innerHTML = '';
  const safePhotos = Array.isArray(dressPhotos) ? dressPhotos : [];
  currentDressPhotos = safePhotos;
  selectedStoreId = storeId || '';
  const firstPath = safePhotos[0]?.photo_path || '';
  const currentPathStillExists = safePhotos.some((photo) => photo.photo_path === selectedDressPhotoPath);
  selectDressPhoto(currentPathStillExists ? selectedDressPhotoPath : firstPath);

  if (!safePhotos.length) {
    const empty = document.createElement('p');
    empty.className = 'store-detail-location';
    empty.textContent = 'No dress pictures yet. Upload your first one above.';
    detailMiniatures.appendChild(empty);
    return;
  }

  safePhotos.forEach((photo, index) => {
    const photoUrl = photo.photo_path;
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
      selectDressPhoto(photoUrl);
      const allButtons = detailMiniatures.querySelectorAll('.store-miniature-button');
      allButtons.forEach((button) => button.classList.remove('is-selected'));
      previewButton.classList.add('is-selected');
      setDressMetadataMessage('', '');
    });

    if (photoUrl === selectedDressPhotoPath || (!selectedDressPhotoPath && index === 0)) {
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
    if (dressPriceInput) {
      dressPriceInput.value = '';
      dressPriceInput.disabled = true;
    }
    if (dressMetadataSubmit) {
      dressMetadataSubmit.disabled = true;
    }
    if (startSessionButton) {
      startSessionButton.disabled = true;
    }
    if (swipeWorkspace) {
      swipeWorkspace.classList.add('is-hidden');
    }
    if (sessionResults) {
      sessionResults.classList.add('is-hidden');
    }
    setSessionMessage('', '');
    activeStoreCanManagePhotos = false;
    renderDetailsGallery([], '');
    return;
  }

  const dressPhotos = Array.isArray(store.dress_photos) ? store.dress_photos : [];
  const currentUser = getSessionUser();
  activeStoreCanManagePhotos = Boolean(currentUser && store.owner_email === currentUser);
  detailsName.textContent = store.name || '';
  detailsAddress.textContent = store.location || '';
  detailsPhotoCount.textContent = `${dressPhotos.length} picture${dressPhotos.length === 1 ? '' : 's'}`;
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
  if (dressPriceInput) {
    dressPriceInput.disabled = !activeStoreCanManagePhotos;
  }
  if (dressMetadataSubmit) {
    dressMetadataSubmit.disabled = !activeStoreCanManagePhotos;
  }
  if (startSessionButton) {
    startSessionButton.disabled = !activeStoreCanManagePhotos;
  }
  if (!activeStoreCanManagePhotos) {
    if (swipeWorkspace) {
      swipeWorkspace.classList.add('is-hidden');
    }
    if (sessionResults) {
      sessionResults.classList.add('is-hidden');
    }
    setSessionMessage('Only the store owner can run swipe sessions.', 'error');
  } else {
    setSessionMessage('', '');
  }
  renderDetailsGallery(dressPhotos, String(store.id));
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
  setDressMetadataMessage('', '');
  await loadTagOptions();
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


if (dressMetadataForm) {
  dressMetadataForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!selectedStoreId || !selectedDressPhotoPath) {
      setDressMetadataMessage('Choose a dress photo first.', 'error');
      return;
    }
    if (!activeStoreCanManagePhotos) {
      setDressMetadataMessage('Only the store owner can edit metadata.', 'error');
      return;
    }

    const selectedTags = Array.from(dressMetadataForm.querySelectorAll('input[type="checkbox"][data-tag-id]:checked')).map((input) => input.value);
    const rawPrice = dressPriceInput?.value.trim() || '';
    const price = rawPrice ? Number(rawPrice) : null;
    if (rawPrice && Number.isNaN(price)) {
      setDressMetadataMessage('Price must be a valid number.', 'error');
      return;
    }

    setDressMetadataMessage('Saving metadata...', '');
    try {
      const response = await fetch(`/api/stores/${encodeURIComponent(selectedStoreId)}/dress-photo-metadata`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_email: getSessionUser(),
          photo_path: selectedDressPhotoPath,
          price,
          tags: selectedTags,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setDressMetadataMessage(errorData.error || 'Unable to save metadata right now.', 'error');
        return;
      }
      const store = await response.json();
      updateDetailsSummary(store);
      setDressMetadataMessage('Metadata saved.', 'success');
    } catch (error) {
      setDressMetadataMessage('Unable to save metadata right now.', 'error');
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
    const dressPhotos = Array.isArray(store.dress_photos) ? store.dress_photos : [];
    const photoUrls = dressPhotos
      .map((photo) => photo?.photo_path)
      .filter((photoPath) => typeof photoPath === 'string' && photoPath.trim());
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

const renderAdminTagOptions = (container, selectedTags = []) => {
  if (!container) {
    return;
  }
  container.innerHTML = '';
  const options = tagOptions;
  const locale = getActiveLocale();
  if (!options || !Array.isArray(options.categories)) {
    container.textContent = 'Tag options unavailable.';
    return;
  }
  options.categories.forEach((category) => {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'dress-tag-category';
    const legend = document.createElement('legend');
    legend.textContent = getLocalizedValue(category.label, locale, options.defaultLocale || 'en') || category.id;
    fieldset.appendChild(legend);
    const group = document.createElement('div');
    group.className = 'dress-tag-group';
    (category.tags || []).forEach((tag) => {
      const label = document.createElement('label');
      label.className = 'dress-tag-option';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = tag.id;
      checkbox.checked = selectedTags.includes(tag.id);
      const text = document.createElement('span');
      text.textContent = getLocalizedValue(tag.label, locale, options.defaultLocale || 'en') || tag.id;
      label.appendChild(checkbox);
      label.appendChild(text);
      group.appendChild(label);
    });
    fieldset.appendChild(group);
    container.appendChild(fieldset);
  });
};

const loadAdminPage = async () => {
  if (!adminGrid) {
    return;
  }
  await loadTagOptions();
  setAdminMessage('Loading default dresses...', '');
  try {
    const response = await fetch('/api/default-dress-metadata');
    if (!response.ok) {
      setAdminMessage('Unable to load default dresses.', 'error');
      return;
    }
    const data = await response.json();
    const photos = Array.isArray(data.photos) ? data.photos : [];
    adminGrid.innerHTML = '';

    photos.forEach((photo) => {
      const card = document.createElement('article');
      card.className = 'admin-card';

      const image = document.createElement('img');
      image.className = 'admin-card-image';
      image.src = photo.photo_path;
      image.alt = photo.photo_path;

      const title = document.createElement('p');
      title.className = 'store-detail-meta';
      title.textContent = photo.photo_path.split('/').pop() || photo.photo_path;

      const tagWrap = document.createElement('div');
      renderAdminTagOptions(tagWrap, Array.isArray(photo.tags) ? photo.tags : []);

      const saveButton = document.createElement('button');
      saveButton.type = 'button';
      saveButton.className = 'button secondary';
      saveButton.textContent = 'Save tags';
      saveButton.addEventListener('click', async () => {
        const selectedTags = Array.from(tagWrap.querySelectorAll('input[type="checkbox"]:checked')).map((input) => input.value);
        saveButton.disabled = true;
        try {
          const saveResponse = await fetch('/api/default-dress-metadata', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photo_path: photo.photo_path, tags: selectedTags }),
          });
          if (!saveResponse.ok) {
            setAdminMessage('Failed to save tags for one or more dresses.', 'error');
            return;
          }
          setAdminMessage('Tags saved.', 'success');
        } catch (error) {
          setAdminMessage('Failed to save tags for one or more dresses.', 'error');
        } finally {
          saveButton.disabled = false;
        }
      });

      card.appendChild(image);
      card.appendChild(title);
      card.appendChild(tagWrap);
      card.appendChild(saveButton);
      adminGrid.appendChild(card);
    });

    if (!photos.length) {
      setAdminMessage('No default dresses found.', 'error');
      return;
    }
    setAdminMessage('Loaded default dress library.', 'success');
  } catch (error) {
    setAdminMessage('Unable to load default dresses.', 'error');
  }
};

if (startSessionButton) {
  startSessionButton.addEventListener('click', startDefaultSession);
}

if (dislikeButton) {
  dislikeButton.addEventListener('click', () => handleSwipe('dislike'));
}

if (likeButton) {
  likeButton.addEventListener('click', () => handleSwipe('like'));
}

document.addEventListener('keydown', (event) => {
  if (!swipeWorkspace || swipeWorkspace.classList.contains('is-hidden')) {
    return;
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    handleSwipe('dislike');
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    handleSwipe('like');
  }
});

loadStoreDetailsPage();
loadAdminPage();

if (detailsPreviewImage) {
  detailsPreviewImage.addEventListener('click', () => {
    if (selectedPreviewPhotoUrl) {
      openPhotoLightbox(selectedPreviewPhotoUrl);
    }
  });
}
