const storeGrid = document.querySelector('.store-grid');
const detailsName = document.querySelector('[data-store-details-name]');
const detailsAddress = document.querySelector('[data-store-details-address]');
const detailsPhotoCount = document.querySelector('[data-store-details-photo-count]');
const detailsStylistCount = document.querySelector('[data-store-details-stylist-count]');
const detailsOwner = document.querySelector('[data-store-details-owner]');
const detailsInviteCode = document.querySelector('[data-store-details-invite]');
const detailsCreatedAt = document.querySelector('[data-store-details-created]');
const storeBrandNames = Array.from(document.querySelectorAll('[data-store-brand-name]'));
const storeBrandBadge = document.querySelector('[data-store-brand-badge]');
const storeSwitcher = document.querySelector('[data-store-switcher]');
const storeSwitcherTrigger = document.querySelector('[data-store-switcher-trigger]');
const storeSwitcherMenu = document.querySelector('[data-store-switcher-menu]');
const openInventoryButton = document.querySelector('[data-open-inventory]');
const detailsPreviewImage = document.querySelector('[data-dress-preview-image]');
const detailsPreviewSwitcher = document.querySelector('[data-dress-preview-switcher]');
const detailMiniatures = document.querySelector('[data-dress-miniatures]');
const dressPhotoForm = document.querySelector('[data-dress-photo-form]');
const dressPhotoInput = dressPhotoForm?.querySelector('[data-dress-photo-input]');
const dressPhotoSubmit = dressPhotoForm?.querySelector('[data-dress-photo-submit]');
const dressPhotoMessage = dressPhotoForm?.querySelector('[data-dress-photo-message]');
const profileAddPhotoButton = dressPhotoForm?.querySelector('[data-profile-add-photo-button]');
const profileAddPhotoInput = dressPhotoForm?.querySelector('[data-profile-add-photo-input]');
const profileMergeButton = dressPhotoForm?.querySelector('[data-profile-merge-button]');
const profileMergeModal = document.querySelector('[data-profile-merge-modal]');
const profileMergeOptions = document.querySelector('[data-profile-merge-options]');
const profileMergeCancel = document.querySelector('[data-profile-merge-cancel]');
const dressMetadataForm = document.querySelector('[data-dress-metadata-form]');
const dressPriceInput = dressMetadataForm?.querySelector('[data-dress-price-input]');
const dressMetadataSubmit = dressMetadataForm?.querySelector('[data-dress-metadata-submit]');
const dressAutolabelButton = dressMetadataForm?.querySelector('[data-dress-autolabel-button]');
const dressAutolabelAllButton = dressMetadataForm?.querySelector('[data-dress-autolabel-all-button]');
const dressAutolabelOverwriteButton = dressMetadataForm?.querySelector('[data-dress-autolabel-overwrite-button]');
const dressMetadataMessage = dressMetadataForm?.querySelector('[data-dress-metadata-message]');
const dressTagOptionsContainer = dressMetadataForm?.querySelector('[data-dress-tag-options]');
const startSessionButton = document.querySelector('[data-start-session-button]');
const sessionMessage = document.querySelector('[data-session-message]');
const sessionStorePicker = document.querySelector('[data-session-store-picker]');
const sessionStoreSelect = document.querySelector('[data-session-store-select]');
const sessionDressCountInput = document.querySelector('[data-session-dress-count]');
const sessionStoreConfirm = document.querySelector('[data-session-store-confirm]');
const teamStorePicker = document.querySelector('[data-team-store-picker]');
const teamStoreGrid = document.querySelector('[data-team-store-grid]');
const teamMessage = document.querySelector('[data-team-message]');
const teamResults = document.querySelector('[data-team-results]');
const teamSelectedStore = document.querySelector('[data-team-selected-store]');
const teamMemberList = document.querySelector('[data-team-member-list]');
const sessionRouteGrid = document.querySelector('[data-session-route-grid]');
const sessionRouteMessage = document.querySelector('[data-session-route-message]');
const swipeWorkspace = document.querySelector('[data-swipe-workspace]');
const swipeCategoryChip = document.querySelector('[data-swipe-category-chip]');
const swipeImage = document.querySelector('[data-swipe-image]');
const swipeCaption = document.querySelector('[data-swipe-caption]');
const swipeProgress = document.querySelector('[data-swipe-progress]');
const swipeSelectedTags = document.querySelector('[data-swipe-selected-tags]');
const swipePhotoPrev = document.querySelector('[data-swipe-photo-prev]');
const swipePhotoNext = document.querySelector('[data-swipe-photo-next]');
const swipePhotoIndicator = document.querySelector('[data-swipe-photo-indicator]');
const dislikeButton = document.querySelector('[data-swipe-dislike]');
const likeButton = document.querySelector('[data-swipe-like]');
const sessionResults = document.querySelector('[data-session-results]');
const sessionBars = document.querySelector('[data-session-bars]');
const sessionResultTabs = Array.from(document.querySelectorAll('[data-session-results-tab]'));
const sessionResultPanels = Array.from(document.querySelectorAll('[data-session-results-panel]'));
const sessionRankingImage = document.querySelector('[data-session-ranking-image]');
const sessionRankingCaption = document.querySelector('[data-session-ranking-caption]');
const sessionRankingScore = document.querySelector('[data-session-ranking-score]');
const sessionRankingPosition = document.querySelector('[data-session-ranking-position]');
const sessionRankingPrev = document.querySelector('[data-session-ranking-prev]');
const sessionRankingNext = document.querySelector('[data-session-ranking-next]');
const sessionRankingPhotoPrev = document.querySelector('[data-session-ranking-photo-prev]');
const sessionRankingPhotoNext = document.querySelector('[data-session-ranking-photo-next]');
const sessionRankingPhotoIndicator = document.querySelector('[data-session-ranking-photo-indicator]');
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
const settingsMenu = document.querySelector('[data-settings-menu]');
const settingsMenuTrigger = document.querySelector('[data-settings-menu-trigger]');
const settingsMenuPanel = document.querySelector('[data-settings-menu-panel]');
const mobilePanels = Array.from(document.querySelectorAll('[data-mobile-panel]'));
const mobileTabButtons = Array.from(document.querySelectorAll('[data-mobile-tab]'));

let photoLightbox = null;
let photoLightboxImage = null;
let selectedPreviewPhotoUrl = '';
let selectedDressPhotoPath = '';
let selectedDressProfileId = '';
let selectedStoreId = '';
let activeStoreCanManagePhotos = false;
let currentDressPhotos = [];
let currentDressProfiles = [];
let tagOptions = null;
let linkedStores = [];

let swipeDeck = [];
let swipeIndex = 0;
let swipePhotoIndex = 0;
let swipeLikes = [];
let swipeDislikes = [];
let rankedStoreDresses = [];
let rankedStoreDressIndex = 0;
let rankedStoreDressPhotoIndex = 0;
let selectedTeamStoreId = '';
const DEFAULT_SESSION_DRESS_COUNT = 10;

const getSessionUser = () => (localStorage.getItem(sessionKey) || '').trim();

const updateStoreBranding = (store) => {
  if (!storeBrandNames.length) {
    return;
  }
  const brandName = (store?.name || 'Store').trim() || 'Store';
  storeBrandNames.forEach((element) => {
    element.textContent = brandName;
  });
  if (storeBrandBadge) {
    const initials = brandName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
    storeBrandBadge.textContent = initials || 'ST';
  }
};

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
    closeProfileMergeModal();
  }
});

const closeUserMenu = () => {
  if (!userMenuPanel) {
    return;
  }
  userMenuPanel.classList.add('is-hidden');
};

const closeSettingsMenu = () => {
  if (!settingsMenuPanel) {
    return;
  }
  settingsMenuPanel.classList.add('is-hidden');
};

const closeStoreSwitcher = () => {
  if (!storeSwitcherMenu) {
    return;
  }
  storeSwitcherMenu.classList.add('is-hidden');
  if (storeSwitcherTrigger) {
    storeSwitcherTrigger.setAttribute('aria-expanded', 'false');
  }
};

const renderStoreSwitcher = () => {
  if (!storeSwitcher || !storeSwitcherMenu) {
    return;
  }

  storeSwitcherMenu.innerHTML = '';
  const hasStores = linkedStores.length > 0;
  const hasMultipleStores = linkedStores.length > 1;
  storeSwitcher.classList.toggle('is-static', !hasStores);

  if (storeSwitcherTrigger) {
    storeSwitcherTrigger.disabled = !hasStores;
    storeSwitcherTrigger.setAttribute('aria-expanded', 'false');
  }

  if (!hasStores) {
    closeStoreSwitcher();
    return;
  }

  linkedStores.forEach((store) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'bridal-store-switcher-item';
    const storeName = store.name || `Store ${store.id}`;
    const storeLocation = (store.location || '').trim();
    option.textContent = storeLocation ? `${storeName} — ${storeLocation}` : storeName;
    const storeId = String(store.id || '');
    option.classList.toggle('is-selected', storeId === String(selectedStoreId));
    option.addEventListener('click', () => {
      activateStoreById(storeId);
      closeStoreSwitcher();
    });
    storeSwitcherMenu.appendChild(option);
  });
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
    closeSettingsMenu();
  });
}

if (settingsMenuTrigger) {
  settingsMenuTrigger.addEventListener('click', () => {
    if (!settingsMenuPanel) {
      return;
    }
    settingsMenuPanel.classList.toggle('is-hidden');
    closeUserMenu();
  });
}

if (storeSwitcherTrigger) {
  storeSwitcherTrigger.addEventListener('click', (event) => {
    if (!storeSwitcherMenu || storeSwitcherTrigger.disabled) {
      return;
    }
    event.stopPropagation();
    storeSwitcherMenu.classList.toggle('is-hidden');
    storeSwitcherTrigger.setAttribute(
      'aria-expanded',
      storeSwitcherMenu.classList.contains('is-hidden') ? 'false' : 'true'
    );
    closeUserMenu();
    closeSettingsMenu();
  });
}

if (storeSwitcherMenu) {
  storeSwitcherMenu.addEventListener('click', (event) => {
    event.stopPropagation();
  });
}

document.addEventListener('click', (event) => {
  if (userMenu && !userMenu.contains(event.target)) {
    closeUserMenu();
  }
  if (settingsMenu && !settingsMenu.contains(event.target)) {
    closeSettingsMenu();
  }
  if (storeSwitcher && !storeSwitcher.contains(event.target)) {
    closeStoreSwitcher();
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

const setMobileTab = (tabName) => {
  if (!mobilePanels.length || !mobileTabButtons.length) {
    return;
  }
  mobilePanels.forEach((panel) => {
    panel.classList.toggle('is-hidden', panel.dataset.mobilePanel !== tabName);
  });
  mobileTabButtons.forEach((button) => {
    const isActive = button.dataset.mobileTab === tabName;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
};

if (mobileTabButtons.length && mobilePanels.length) {
  mobileTabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const tabName = button.dataset.mobileTab;
      if (!tabName) {
        return;
      }
      setMobileTab(tabName);
    });
  });
  setMobileTab('management');
}

if (openInventoryButton) {
  openInventoryButton.addEventListener('click', () => {
    setMobileTab('inventory');
  });
}

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

const setSessionRouteMessage = (message, type) => {
  if (!sessionRouteMessage) {
    return;
  }
  sessionRouteMessage.textContent = message;
  sessionRouteMessage.classList.remove('is-error', 'is-success');
  if (type === 'error') {
    sessionRouteMessage.classList.add('is-error');
  }
  if (type === 'success') {
    sessionRouteMessage.classList.add('is-success');
  }
};

const setTeamMessage = (message, type) => {
  if (!teamMessage) {
    return;
  }
  teamMessage.textContent = message;
  teamMessage.classList.remove('is-error', 'is-success');
  if (type === 'error') {
    teamMessage.classList.add('is-error');
  }
  if (type === 'success') {
    teamMessage.classList.add('is-success');
  }
};

const getLinkedStoreMembers = (store) => {
  if (!store || !Array.isArray(store.team_members)) {
    return [];
  }
  return store.team_members
    .map((member) => (member || '').toString().trim())
    .filter((member, index, members) => Boolean(member) && members.indexOf(member) === index);
};

const formatTeamMemberDisplayName = (member) => {
  const normalized = (member || '').trim();
  if (!normalized) {
    return '';
  }
  const usernamePart = normalized.includes('@') ? normalized.split('@')[0] : normalized;
  return usernamePart
    .split(/[._\-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const renderTeamMembersForStore = (store) => {
  if (!teamResults || !teamSelectedStore || !teamMemberList) {
    return;
  }
  if (!store) {
    teamResults.classList.add('is-hidden');
    teamSelectedStore.textContent = '';
    teamMemberList.innerHTML = '';
    return;
  }

  const members = getLinkedStoreMembers(store);
  selectedTeamStoreId = String(store.id || '');
  teamSelectedStore.textContent = `${store.name || 'Selected store'} team members`;
  teamMemberList.innerHTML = '';

  if (!members.length) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'team-member-list-item';
    emptyItem.textContent = 'No linked team members found for this store yet.';
    teamMemberList.appendChild(emptyItem);
  } else {
    members.forEach((member) => {
      const item = document.createElement('li');
      item.className = 'team-member-list-item';

      const memberName = document.createElement('strong');
      memberName.className = 'team-member-name';
      memberName.textContent = formatTeamMemberDisplayName(member) || member;

      const memberEmail = document.createElement('span');
      memberEmail.className = 'team-member-email';
      memberEmail.textContent = member;

      item.appendChild(memberName);
      item.appendChild(memberEmail);
      teamMemberList.appendChild(item);
    });
  }

  teamResults.classList.remove('is-hidden');
};

const renderTeamStorePicker = () => {
  if (!teamStorePicker || !teamStoreGrid) {
    return;
  }
  teamStoreGrid.innerHTML = '';

  if (!linkedStores.length) {
    teamStorePicker.classList.add('is-hidden');
    selectedTeamStoreId = '';
    renderTeamMembersForStore(null);
    setTeamMessage('No linked stores found for this account.', 'error');
    return;
  }

  if (linkedStores.length === 1) {
    teamStorePicker.classList.add('is-hidden');
    selectedTeamStoreId = String(linkedStores[0].id || '');
    renderTeamMembersForStore(linkedStores[0]);
    setTeamMessage('Showing all users linked to your store.', '');
    return;
  }

  teamStorePicker.classList.remove('is-hidden');
  setTeamMessage('Select a store to view linked users.', '');
  const preferredStoreId = selectedTeamStoreId;
  const selectedStoreFromDetails = linkedStores.find((store) => String(store.id) === String(preferredStoreId));
  renderTeamMembersForStore(selectedStoreFromDetails || null);

  linkedStores.forEach((store) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'store-tile';
    button.dataset.storeId = String(store.id);

    const name = document.createElement('span');
    name.className = 'store-name';
    name.textContent = store.name || '';

    const location = document.createElement('span');
    location.className = 'store-location';
    location.textContent = store.location || '';

    button.appendChild(name);
    button.appendChild(location);
    const isSelected = String(store.id) === String(selectedTeamStoreId);
    button.classList.toggle('is-selected', isSelected);
    button.addEventListener('click', () => {
      selectedTeamStoreId = String(store.id || '');
      renderTeamMembersForStore(store);
      setTeamMessage(`Showing users linked to ${store.name || 'this store'}.`, '');
      renderTeamStorePicker();
    });

    teamStoreGrid.appendChild(button);
  });
};

const redirectToSessionStore = (storeId) => {
  if (!storeId) {
    return;
  }
  const params = new URLSearchParams();
  params.set('store', String(storeId));
  params.set('autostartSession', '1');
  window.location.assign(`/details?${params.toString()}`);
};

const getManageableStores = () => {
  const currentUser = getSessionUser();
  if (!currentUser) {
    return [];
  }
  return linkedStores.filter((store) => store && store.owner_email === currentUser);
};

const updateSessionStorePicker = () => {
  if (!sessionStorePicker || !sessionStoreSelect) {
    return;
  }
  const manageableStores = getManageableStores();
  sessionStoreSelect.innerHTML = '';

  manageableStores.forEach((store) => {
    const option = document.createElement('option');
    option.value = String(store.id);
    option.textContent = `${store.name} — ${store.location}`;
    sessionStoreSelect.appendChild(option);
  });

  if (manageableStores.length > 1) {
    sessionStorePicker.classList.remove('is-hidden');
    const selectedFromDetails = manageableStores.find((store) => String(store.id) === selectedStoreId);
    sessionStoreSelect.value = selectedFromDetails ? String(selectedFromDetails.id) : String(manageableStores[0].id);
    return;
  }

  sessionStorePicker.classList.add('is-hidden');
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

const parseSessionDressCount = () => {
  const rawValue = Number.parseInt((sessionDressCountInput?.value || '').trim(), 10);
  if (!Number.isFinite(rawValue) || rawValue <= 0) {
    if (sessionDressCountInput) {
      sessionDressCountInput.value = String(DEFAULT_SESSION_DRESS_COUNT);
    }
    return DEFAULT_SESSION_DRESS_COUNT;
  }
  if (sessionDressCountInput) {
    sessionDressCountInput.value = String(rawValue);
  }
  return rawValue;
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

const buildInventorySessionCandidates = (store) => {
  const dressPhotos = Array.isArray(store?.dress_photos) ? store.dress_photos : [];
  const profileMap = new Map();

  dressPhotos.forEach((photo) => {
    const profileId = String(photo?.dress_profile_id || photo?.photo_path || '');
    if (!profileId || !photo?.photo_path) {
      return;
    }
    if (!profileMap.has(profileId)) {
      profileMap.set(profileId, {
        profileId,
        coverPhotoPath: photo.photo_path,
        photoPaths: [],
        tags: new Set(),
      });
    }
    const profile = profileMap.get(profileId);
    profile.photoPaths.push(photo.photo_path);
    (Array.isArray(photo.tags) ? photo.tags : []).forEach((tag) => {
      if (typeof tag === 'string' && tag.trim()) {
        profile.tags.add(tag.trim());
      }
    });
  });

  return Array.from(profileMap.values()).map((profile) => ({
    profileId: profile.profileId,
    coverPhotoPath: profile.coverPhotoPath,
    photoPaths: profile.photoPaths,
    tags: Array.from(profile.tags),
  }));
};

const selectProfilesForTagVariety = (profiles, limit) => {
  const remaining = [...profiles];
  const selected = [];
  const coveredTags = new Set();

  while (selected.length < limit && remaining.length) {
    remaining.sort((first, second) => {
      const firstGain = first.tags.reduce((count, tag) => count + (coveredTags.has(normalizeToken(tag)) ? 0 : 1), 0);
      const secondGain = second.tags.reduce((count, tag) => count + (coveredTags.has(normalizeToken(tag)) ? 0 : 1), 0);
      if (secondGain !== firstGain) {
        return secondGain - firstGain;
      }
      if (second.tags.length !== first.tags.length) {
        return second.tags.length - first.tags.length;
      }
      return first.coverPhotoPath.localeCompare(second.coverPhotoPath);
    });

    const next = remaining.shift();
    if (!next) {
      break;
    }

    selected.push(next);
    next.tags.forEach((tag) => {
      const normalized = normalizeToken(tag);
      if (normalized) {
        coveredTags.add(normalized);
      }
    });
  }

  return selected;
};

const loadDefaultSessionDeck = async (limit, tagMap, fallbackCategories) => {
  if (limit <= 0) {
    return [];
  }

  const response = await fetch('/api/default-dress-photos');
  if (!response.ok) {
    throw new Error('Unable to load default dress photos.');
  }
  const data = await response.json();
  const photos = Array.isArray(data.photos) ? data.photos : [];
  if (!photos.length) {
    return [];
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

  return photos.slice(0, limit).map((photoPath) => {
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
  const photoPaths = Array.isArray(current.photoPaths) && current.photoPaths.length
    ? current.photoPaths
    : [current.photoPath].filter(Boolean);
  if (swipePhotoIndex >= photoPaths.length) {
    swipePhotoIndex = 0;
  }
  const currentPhotoPath = photoPaths[swipePhotoIndex] || current.photoPath;

  swipeImage.src = currentPhotoPath;
  swipeCaption.textContent = (currentPhotoPath || '').split('/').pop() || current.fileName;
  swipeCategoryChip.textContent = current.category;
  swipeProgress.textContent = `Look ${swipeIndex + 1} of ${swipeDeck.length}`;
  if (swipePhotoIndicator) {
    swipePhotoIndicator.textContent = `${swipePhotoIndex + 1}/${Math.max(photoPaths.length, 1)}`;
  }
  if (swipePhotoPrev) {
    swipePhotoPrev.disabled = swipePhotoIndex === 0;
  }
  if (swipePhotoNext) {
    swipePhotoNext.disabled = swipePhotoIndex >= photoPaths.length - 1;
  }
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

const buildSwipePreferenceScores = () => {
  const scores = new Map();
  const updateScores = (items, delta) => {
    items.forEach((item) => {
      const uniqueTags = new Set((Array.isArray(item.tags) ? item.tags : []).map((tag) => normalizeToken(tag)).filter(Boolean));
      uniqueTags.forEach((tagId) => {
        scores.set(tagId, (scores.get(tagId) || 0) + delta);
      });
    });
  };

  updateScores(swipeLikes, 1);
  updateScores(swipeDislikes, -1);
  return scores;
};

const rankStoreDressesFromSession = () => {
  const preferenceScores = buildSwipePreferenceScores();
  const safePhotos = Array.isArray(currentDressPhotos) ? currentDressPhotos : [];
  const groupedProfiles = new Map();

  safePhotos.forEach((photo) => {
    const profileId = String(photo?.dress_profile_id || photo?.photo_path || '');
    if (!profileId) {
      return;
    }
    if (!groupedProfiles.has(profileId)) {
      groupedProfiles.set(profileId, []);
    }
    groupedProfiles.get(profileId).push(photo);
  });

  return Array.from(groupedProfiles.entries())
    .map(([profileId, photos]) => {
      const normalizedTags = Array.from(
        new Set(
          photos.flatMap((photo) =>
            Array.isArray(photo.tags) ? photo.tags.map((tag) => normalizeToken(tag)).filter(Boolean) : []
          )
        )
      );
      const score = normalizedTags.reduce((total, tagId) => total + (preferenceScores.get(tagId) || 0), 0);
      return {
        profileId,
        photos,
        normalizedTags,
        score,
      };
    })
    .sort((first, second) => {
      if (second.score !== first.score) {
        return second.score - first.score;
      }
      return (first.photos[0]?.photo_path || '').localeCompare(second.photos[0]?.photo_path || '');
    });
};

const setSessionResultsTab = (tabId) => {
  sessionResultTabs.forEach((tab) => {
    const isActive = tab.dataset.sessionResultsTab === tabId;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  sessionResultPanels.forEach((panel) => {
    panel.classList.toggle('is-hidden', panel.dataset.sessionResultsPanel !== tabId);
  });
};

const renderRankedStoreDress = () => {
  if (!sessionRankingImage || !sessionRankingCaption || !sessionRankingScore || !sessionRankingPosition || !sessionRankingPrev || !sessionRankingNext || !sessionRankingPhotoPrev || !sessionRankingPhotoNext) {
    return;
  }

  if (!rankedStoreDresses.length) {
    sessionRankingImage.removeAttribute('src');
    sessionRankingCaption.textContent = 'No in-stock dresses to rank yet.';
    sessionRankingScore.textContent = 'Add dresses with metadata tags to this store to get matching recommendations.';
    sessionRankingPosition.textContent = '';
    sessionRankingPrev.disabled = true;
    sessionRankingNext.disabled = true;
    sessionRankingPhotoPrev.disabled = true;
    sessionRankingPhotoNext.disabled = true;
    if (sessionRankingPhotoIndicator) {
      sessionRankingPhotoIndicator.textContent = '';
    }
    return;
  }

  const current = rankedStoreDresses[rankedStoreDressIndex];
  const photos = Array.isArray(current.photos) ? current.photos : [];
  if (rankedStoreDressPhotoIndex >= photos.length) {
    rankedStoreDressPhotoIndex = 0;
  }
  const currentPhoto = photos[rankedStoreDressPhotoIndex] || photos[0] || null;
  const tagText = current.normalizedTags.length ? current.normalizedTags.join(', ') : 'none';
  if (currentPhoto?.photo_path) {
    sessionRankingImage.src = currentPhoto.photo_path;
  }
  sessionRankingCaption.textContent = `Top match tags: ${tagText}`;
  sessionRankingScore.textContent = `Match score: ${current.score > 0 ? `+${current.score}` : current.score}`;
  sessionRankingPosition.textContent = `Dress ${rankedStoreDressIndex + 1} of ${rankedStoreDresses.length}`;
  if (sessionRankingPhotoIndicator) {
    sessionRankingPhotoIndicator.textContent = `${rankedStoreDressPhotoIndex + 1}/${Math.max(photos.length, 1)}`;
  }
  sessionRankingPrev.disabled = rankedStoreDressIndex === 0;
  sessionRankingNext.disabled = rankedStoreDressIndex >= rankedStoreDresses.length - 1;
  sessionRankingPhotoPrev.disabled = rankedStoreDressPhotoIndex === 0;
  sessionRankingPhotoNext.disabled = rankedStoreDressPhotoIndex >= photos.length - 1;
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

  rankedStoreDresses = rankStoreDressesFromSession();
  rankedStoreDressIndex = 0;
  rankedStoreDressPhotoIndex = 0;
  renderRankedStoreDress();
  setSessionResultsTab('insights');

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
  swipePhotoIndex = 0;

  if (swipeIndex >= swipeDeck.length) {
    renderSessionResults();
    if (swipeWorkspace) {
      swipeWorkspace.classList.add('is-hidden');
    }
    return;
  }

  renderSwipeCard();
};

const startDefaultSession = async (requestedDressCount = DEFAULT_SESSION_DRESS_COUNT) => {
  if (!activeStoreCanManagePhotos) {
    setSessionMessage('Only the store owner can start a session.', 'error');
    return;
  }

  setSessionMessage('Preparing swipe deck...', '');
  await loadTagOptions();

  try {
    const dressCount = Number.isFinite(requestedDressCount) && requestedDressCount > 0
      ? requestedDressCount
      : DEFAULT_SESSION_DRESS_COUNT;
    const activeStore = linkedStores.find((store) => String(store.id) === String(selectedStoreId));
    if (!activeStore) {
      setSessionMessage('Unable to load this store inventory right now.', 'error');
      return;
    }

    const tagMap = buildTagToCategoryMap();
    const fallbackCategories = Array.from(new Set(Array.from(tagMap.values())));
    const inventoryCandidates = buildInventorySessionCandidates(activeStore);
    const selectedInventory = selectProfilesForTagVariety(inventoryCandidates, dressCount);
    const inventoryDeck = selectedInventory.map((profile) => {
      const tags = Array.isArray(profile.tags) ? profile.tags : [];
      const categoryFromTag = tags
        .map((tag) => tagMap.get(normalizeToken(tag)))
        .find((value) => Boolean(value));
      return {
        photoPath: profile.coverPhotoPath,
        fileName: profile.coverPhotoPath.split('/').pop() || profile.coverPhotoPath,
        photoPaths: Array.isArray(profile.photoPaths) ? profile.photoPaths : [profile.coverPhotoPath],
        tags,
        category: categoryFromTag || resolvePhotoCategory(profile.coverPhotoPath, tagMap, fallbackCategories),
      };
    });

    const missingCount = Math.max(0, dressCount - inventoryDeck.length);
    const defaultDeck = await loadDefaultSessionDeck(missingCount, tagMap, fallbackCategories);
    swipeDeck = [...inventoryDeck, ...defaultDeck];
    if (!swipeDeck.length) {
      setSessionMessage('No dresses were found for this session.', 'error');
      return;
    }

    swipeIndex = 0;
    swipePhotoIndex = 0;
    swipeLikes = [];
    swipeDislikes = [];
    rankedStoreDresses = [];
    rankedStoreDressIndex = 0;
    rankedStoreDressPhotoIndex = 0;

    if (swipeWorkspace) {
      swipeWorkspace.classList.remove('is-hidden');
    }
    if (sessionResults) {
      sessionResults.classList.add('is-hidden');
    }
    setSessionResultsTab('insights');
    renderSwipeCard();
    if (defaultDeck.length) {
      setSessionMessage(`Loaded ${inventoryDeck.length} inventory dresses and ${defaultDeck.length} default looks. Swipe right for like and left for dislike.`, '');
    } else {
      setSessionMessage('Loaded inventory looks with maximum tag variety. Swipe right for like and left for dislike.', '');
    }
  } catch (error) {
    setSessionMessage('Unable to start this session right now.', 'error');
  }
};

const activateStoreById = (storeId) => {
  if (!storeId) {
    return false;
  }
  const nextStore = linkedStores.find((store) => String(store.id) === String(storeId));
  if (!nextStore) {
    return false;
  }
  updateDetailsSummary(nextStore);
  updateSessionStorePicker();
  renderStoreSwitcher();
  const params = new URLSearchParams(window.location.search);
  params.set('store', String(nextStore.id));
  const nextUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', nextUrl);
  return true;
};

const handleStartSession = () => {
  const manageableStores = getManageableStores();
  if (!manageableStores.length) {
    setSessionMessage('Only the store owner can start a session.', 'error');
    return;
  }

  if (manageableStores.length === 1) {
    activateStoreById(manageableStores[0].id);
    startDefaultSession(parseSessionDressCount());
    return;
  }

  updateSessionStorePicker();
  setSessionMessage('For what store would you like to initiate a session?', '');
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


const closeProfileMergeModal = () => {
  if (!profileMergeModal) {
    return;
  }
  profileMergeModal.classList.add('is-hidden');
};

const performDressPhotoUpload = async (files, profileId, options = {}) => {
  const { fallbackToSelectedProfile = true } = options;
  const storeId = dressPhotoForm?.dataset.storeId;
  if (!storeId) {
    setDressPhotoMessage('Select a store first.', 'error');
    return;
  }
  if (!Array.isArray(files) || !files.length) {
    setDressPhotoMessage('Please choose at least one photo before uploading.', 'error');
    return;
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('dress_photo', file);
  });
  setDressPhotoMessage(`Uploading ${files.length} photo${files.length === 1 ? '' : 's'}...`, '');

  try {
    formData.append('owner_email', getSessionUser());
    const resolvedProfileId = profileId || (fallbackToSelectedProfile ? selectedDressProfileId : '');
    if (resolvedProfileId) {
      formData.append('dress_profile_id', resolvedProfileId);
    }
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
    if (profileAddPhotoInput) {
      profileAddPhotoInput.value = '';
    }
    setDressPhotoMessage(`${files.length} dress photo${files.length === 1 ? '' : 's'} uploaded.`, 'success');
  } catch (error) {
    setDressPhotoMessage('Unable to upload photo right now.', 'error');
  }
};

const openProfileMergeModal = () => {
  if (!profileMergeModal || !profileMergeOptions) {
    return;
  }
  if (!selectedDressProfileId) {
    setDressMetadataMessage('Select a profile first.', 'error');
    return;
  }
  const mergeCandidates = currentDressProfiles.filter(
    (profile) => String(profile?.id || '') !== String(selectedDressProfileId)
  );
  if (!mergeCandidates.length) {
    setDressMetadataMessage('No other profiles are available to merge.', 'error');
    return;
  }

  profileMergeOptions.innerHTML = '';
  mergeCandidates.forEach((profile, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button secondary';
    const photosInProfile = currentDressPhotos.filter(
      (photo) => String(photo?.dress_profile_id || '') === String(profile.id)
    ).length;
    button.textContent = `Profile ${index + 1} (${photosInProfile} photo${photosInProfile === 1 ? '' : 's'})`;
    button.addEventListener('click', async () => {
      const ownerEmail = getSessionUser();
      if (!selectedStoreId || !ownerEmail) {
        return;
      }
      setDressMetadataMessage('Merging profiles...', '');
      try {
        const response = await fetch(`/api/stores/${encodeURIComponent(selectedStoreId)}/dress-profile-merge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            owner_email: ownerEmail,
            source_profile_id: Number(selectedDressProfileId),
            target_profile_id: Number(profile.id),
          }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setDressMetadataMessage(errorData.error || 'Unable to merge profiles right now.', 'error');
          return;
        }
        const store = await response.json();
        closeProfileMergeModal();
        updateDetailsSummary(store);
        setDressMetadataMessage('Profiles merged successfully.', 'success');
      } catch (error) {
        setDressMetadataMessage('Unable to merge profiles right now.', 'error');
      }
    });
    profileMergeOptions.appendChild(button);
  });

  profileMergeModal.classList.remove('is-hidden');
};

if (storeGrid) {
  storeGrid.addEventListener('click', (event) => {
    const tile = event.target.closest('.store-tile');
    if (!tile || tile.classList.contains('add-tile')) {
      return;
    }
    const storeId = tile.dataset.storeId;
    if (!storeId) {
      return;
    }
    window.location.assign(`/details?store=${encodeURIComponent(storeId)}`);
  });
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
    if (selectedDressProfileId) {
      const refreshedPhoto = (Array.isArray(store?.dress_photos) ? store.dress_photos : []).find(
        (photo) => String(photo.dress_profile_id || '') === String(selectedDressProfileId)
      );
      if (refreshedPhoto?.photo_path) {
        selectDressPhoto(refreshedPhoto.photo_path);
      }
    }
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

const getCurrentProfilePhotos = () => {
  if (!selectedDressProfileId) {
    return [];
  }
  return currentDressPhotos.filter((photo) => String(photo?.dress_profile_id || '') === String(selectedDressProfileId));
};

const renderDetailsPreviewSwitcher = () => {
  if (!detailsPreviewSwitcher) {
    return;
  }
  detailsPreviewSwitcher.innerHTML = '';
  const profilePhotos = getCurrentProfilePhotos();
  if (profilePhotos.length <= 1) {
    detailsPreviewSwitcher.classList.add('is-hidden');
    return;
  }

  profilePhotos.forEach((photo, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'dress-preview-switcher-item';
    button.classList.toggle('is-selected', photo.photo_path === selectedDressPhotoPath);

    const image = document.createElement('img');
    image.src = photo.photo_path;
    image.alt = `Dress profile photo ${index + 1}`;
    image.className = 'dress-preview-switcher-image';

    button.appendChild(image);
    button.addEventListener('click', () => {
      selectDressPhoto(photo.photo_path);
      setDressMetadataMessage('', '');
    });
    detailsPreviewSwitcher.appendChild(button);
  });

  detailsPreviewSwitcher.classList.remove('is-hidden');
};

const selectDressPhoto = (photoPath) => {
  selectedDressPhotoPath = photoPath || '';
  const selectedPhoto = getCurrentDressPhoto();
  selectedDressProfileId = selectedPhoto?.dress_profile_id ? String(selectedPhoto.dress_profile_id) : '';
  if (dressPriceInput) {
    dressPriceInput.value = selectedPhoto && typeof selectedPhoto.price === 'number' ? selectedPhoto.price : '';
  }
  const canEditProfile = activeStoreCanManagePhotos && Boolean(selectedDressProfileId);
  if (profileAddPhotoButton) {
    profileAddPhotoButton.disabled = !canEditProfile;
  }
  if (profileMergeButton) {
    profileMergeButton.disabled = !canEditProfile;
  }
  setPreviewPhoto(photoPath || '');
  renderTagOptions(selectedPhoto?.tags || []);
  renderDetailsPreviewSwitcher();
};

const renderDetailsGallery = (dressPhotos, storeId) => {
  if (!detailMiniatures) {
    return;
  }
  detailMiniatures.innerHTML = '';
  const safePhotos = Array.isArray(dressPhotos) ? dressPhotos : [];
  currentDressPhotos = safePhotos;
  selectedStoreId = storeId || '';
  const profileGroups = new Map();
  safePhotos.forEach((photo) => {
    const key = String(photo?.dress_profile_id || photo?.photo_path || '');
    if (!key) {
      return;
    }
    if (!profileGroups.has(key)) {
      profileGroups.set(key, []);
    }
    profileGroups.get(key).push(photo);
  });

  const selectedPhotoStillExists = safePhotos.some((photo) => photo.photo_path === selectedDressPhotoPath);
  if (selectedPhotoStillExists) {
    selectDressPhoto(selectedDressPhotoPath);
  } else {
    const selectedProfilePhotos = profileGroups.get(String(selectedDressProfileId || '')) || [];
    const fallbackPath = selectedProfilePhotos[0]?.photo_path || safePhotos[0]?.photo_path || '';
    selectDressPhoto(fallbackPath);
  }

  if (!safePhotos.length) {
    const empty = document.createElement('p');
    empty.className = 'store-detail-location';
    empty.textContent = 'No dress pictures yet. Upload your first one above.';
    detailMiniatures.appendChild(empty);
    return;
  }

  Array.from(profileGroups.entries()).forEach(([profileId, photos], profileIndex) => {
    const cover = photos[0];
    const photoUrl = cover.photo_path;
    const tile = document.createElement('div');
    tile.className = 'dress-grid-tile';

    const previewButton = document.createElement('button');
    previewButton.type = 'button';
    previewButton.className = 'store-miniature-button';

    const image = document.createElement('img');
    image.className = 'store-miniature-image';
    image.src = photoUrl;
    image.alt = `Dress ${profileIndex + 1}`;

    const badge = document.createElement('span');
    badge.className = 'dress-photo-count-badge';
    badge.textContent = `${photos.length} photo${photos.length === 1 ? '' : 's'}`;

    previewButton.appendChild(image);
    previewButton.appendChild(badge);
    previewButton.addEventListener('click', () => {
      selectDressPhoto(photoUrl);
      selectedDressProfileId = profileId;
      const allButtons = detailMiniatures.querySelectorAll('.store-miniature-button');
      allButtons.forEach((button) => button.classList.remove('is-selected'));
      previewButton.classList.add('is-selected');
      setDressMetadataMessage('', '');
    });

    if (String(selectedDressProfileId || '') === String(profileId) || (!selectedDressProfileId && profileIndex === 0)) {
      previewButton.classList.add('is-selected');
    }
    tile.appendChild(previewButton);

    if (activeStoreCanManagePhotos) {
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'text-link dress-remove-button';
      removeButton.textContent = photos.length > 1 ? 'Remove cover photo' : 'Remove';
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
    updateStoreBranding(null);
    detailsName.textContent = 'Store not found. Return to Stores and choose a store again.';
    detailsAddress.textContent = '';
    detailsPhotoCount.textContent = '';
    if (detailsOwner) {
      detailsOwner.textContent = '';
    }
    if (detailsStylistCount) {
      detailsStylistCount.textContent = '';
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
    if (profileAddPhotoButton) {
      profileAddPhotoButton.disabled = true;
    }
    if (profileMergeButton) {
      profileMergeButton.disabled = true;
    }
    if (dressPriceInput) {
      dressPriceInput.value = '';
      dressPriceInput.disabled = true;
    }
    if (dressMetadataSubmit) {
      dressMetadataSubmit.disabled = true;
    }
    if (dressAutolabelButton) {
      dressAutolabelButton.disabled = true;
    }
    if (dressAutolabelAllButton) {
      dressAutolabelAllButton.disabled = true;
    }
    if (dressAutolabelOverwriteButton) {
      dressAutolabelOverwriteButton.disabled = true;
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
    currentDressProfiles = [];
    closeProfileMergeModal();
    renderDetailsGallery([], '');
    renderTeamStorePicker();
    renderStoreSwitcher();
    return;
  }

  const dressPhotos = Array.isArray(store.dress_photos) ? store.dress_photos : [];
  const dressProfiles = Array.isArray(store.dress_profiles) ? store.dress_profiles : [];
  currentDressProfiles = dressProfiles;
  const storeMembers = getLinkedStoreMembers(store);
  const currentUser = getSessionUser();
  activeStoreCanManagePhotos = Boolean(currentUser && store.owner_email === currentUser);
  updateStoreBranding(store);
  detailsName.textContent = store.name || '';
  detailsAddress.textContent = store.location || '';
  detailsPhotoCount.textContent = `${dressProfiles.length} dress profile${dressProfiles.length === 1 ? '' : 's'} · ${dressPhotos.length} picture${dressPhotos.length === 1 ? '' : 's'}`;
  if (detailsStylistCount) {
    detailsStylistCount.textContent = `${storeMembers.length} active stylist${storeMembers.length === 1 ? '' : 's'}`;
  }
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
  if (profileAddPhotoButton) {
    profileAddPhotoButton.disabled = !activeStoreCanManagePhotos || !selectedDressProfileId;
  }
  if (profileMergeButton) {
    profileMergeButton.disabled = !activeStoreCanManagePhotos || !selectedDressProfileId;
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
  if (dressAutolabelButton) {
    dressAutolabelButton.disabled = !activeStoreCanManagePhotos;
  }
  if (dressAutolabelAllButton) {
    dressAutolabelAllButton.disabled = !activeStoreCanManagePhotos;
  }
  if (dressAutolabelOverwriteButton) {
    dressAutolabelOverwriteButton.disabled = !activeStoreCanManagePhotos;
  }
  const hasAnyManageableStore = getManageableStores().length > 0;
  if (startSessionButton) {
    startSessionButton.disabled = !hasAnyManageableStore;
  }
  if (!activeStoreCanManagePhotos) {
    if (swipeWorkspace) {
      swipeWorkspace.classList.add('is-hidden');
    }
    if (sessionResults) {
      sessionResults.classList.add('is-hidden');
    }
    if (!hasAnyManageableStore) {
      setSessionMessage('Only the store owner can run swipe sessions.', 'error');
    } else {
      setSessionMessage('Switch to one of your owned stores to run a session.', '');
    }
  } else {
    setSessionMessage('', '');
  }
  closeProfileMergeModal();
  renderDetailsGallery(dressPhotos, String(store.id));
  renderTeamStorePicker();
  renderStoreSwitcher();
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
  const requestedStoreId = params.get('store');

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
    linkedStores = stores;
    updateSessionStorePicker();
    renderTeamStorePicker();
    renderStoreSwitcher();
    const fallbackStoreId = stores.length ? String(stores[0].id) : '';
    const resolvedStoreId = requestedStoreId || fallbackStoreId;
    const store = stores.find((candidate) => String(candidate.id) === resolvedStoreId);
    if (resolvedStoreId && String(resolvedStoreId) !== requestedStoreId) {
      const nextParams = new URLSearchParams(window.location.search);
      nextParams.set('store', String(resolvedStoreId));
      window.history.replaceState({}, '', `${window.location.pathname}?${nextParams.toString()}`);
    }
    updateDetailsSummary(store || null);

    const shouldAutostartSession = ['1', 'true'].includes((params.get('autostartSession') || '').toLowerCase());
    if (shouldAutostartSession && store) {
      const nextParams = new URLSearchParams(window.location.search);
      nextParams.delete('autostartSession');
      const nextQuery = nextParams.toString();
      window.history.replaceState({}, '', `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`);
      setMobileTab('session');
      if (activeStoreCanManagePhotos) {
        startDefaultSession(parseSessionDressCount());
      } else {
        setSessionMessage('Only the store owner can start a session.', 'error');
      }
    }
  } catch (error) {
    linkedStores = [];
    updateSessionStorePicker();
    renderTeamStorePicker();
    renderStoreSwitcher();
    updateDetailsSummary(null);
  }
};

if (dressPhotoForm) {
  dressPhotoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const files = Array.from(dressPhotoInput?.files || []).filter(Boolean);
    await performDressPhotoUpload(files, '', { fallbackToSelectedProfile: false });
  });
}

if (profileAddPhotoButton) {
  profileAddPhotoButton.addEventListener('click', () => {
    if (!selectedDressProfileId) {
      setDressPhotoMessage('Select a dress profile first.', 'error');
      return;
    }
    profileAddPhotoInput?.click();
  });
}

if (profileAddPhotoInput) {
  profileAddPhotoInput.addEventListener('change', async () => {
    const files = Array.from(profileAddPhotoInput.files || []).filter(Boolean);
    await performDressPhotoUpload(files, selectedDressProfileId);
  });
}

if (profileMergeButton) {
  profileMergeButton.addEventListener('click', () => {
    openProfileMergeModal();
  });
}

if (profileMergeCancel) {
  profileMergeCancel.addEventListener('click', () => {
    closeProfileMergeModal();
  });
}

if (profileMergeModal) {
  profileMergeModal.addEventListener('click', (event) => {
    if (event.target === profileMergeModal) {
      closeProfileMergeModal();
    }
  });
}




const setAutolabelButtonsDisabled = (disabled) => {
  if (dressAutolabelButton) {
    dressAutolabelButton.disabled = disabled;
  }
  if (dressAutolabelAllButton) {
    dressAutolabelAllButton.disabled = disabled;
  }
  if (dressAutolabelOverwriteButton) {
    dressAutolabelOverwriteButton.disabled = disabled;
  }
};

const runBulkAutolabel = async (endpoint, startMessage, completeMessage) => {
  if (!selectedStoreId) {
    setDressMetadataMessage('Select a store first.', 'error');
    return;
  }
  if (!activeStoreCanManagePhotos) {
    setDressMetadataMessage('Only the store owner can autolabel metadata.', 'error');
    return;
  }

  setAutolabelButtonsDisabled(true);
  setDressMetadataMessage(startMessage, '');
  try {
    const response = await fetch(`/api/stores/${encodeURIComponent(selectedStoreId)}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner_email: getSessionUser() }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setDressMetadataMessage(data.error || 'Unable to autolabel photos right now.', 'error');
      return;
    }

    updateDetailsSummary(data.store);
    const summary = data.summary || {};
    setDressMetadataMessage(
      `${completeMessage} Updated: ${summary.updated_count || 0}, skipped: ${summary.skipped_count || 0}, failed: ${summary.failed_count || 0}.`,
      'success'
    );
  } catch (error) {
    setDressMetadataMessage('Unable to autolabel photos right now.', 'error');
  } finally {
    setAutolabelButtonsDisabled(!activeStoreCanManagePhotos);
  }
};

if (dressAutolabelButton) {
  dressAutolabelButton.addEventListener('click', async () => {
    if (!selectedStoreId || !selectedDressPhotoPath) {
      setDressMetadataMessage('Choose a dress photo first.', 'error');
      return;
    }
    if (!activeStoreCanManagePhotos) {
      setDressMetadataMessage('Only the store owner can autolabel metadata.', 'error');
      return;
    }

    setAutolabelButtonsDisabled(true);
    setDressMetadataMessage('Running autolabel...', '');
    try {
      const response = await fetch(`/api/stores/${encodeURIComponent(selectedStoreId)}/dress-photo-autolabel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_email: getSessionUser(),
          photo_path: selectedDressPhotoPath,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const debug = errorData.debug || {};
        const stage = debug.stage ? ` (stage: ${debug.stage})` : '';
        const details = debug.reason || debug.details || debug.openai_error || '';
        if (details) {
          console.error('Autolabel failed', {
            selectedStoreId,
            selectedDressPhotoPath,
            status: response.status,
            error: errorData.error,
            debug,
          });
        }
        setDressMetadataMessage(
          `${errorData.error || 'Unable to autolabel this photo right now.'}${stage}${details ? ` — ${details}` : ''}`,
          'error'
        );
        return;
      }

      const data = await response.json();
      updateDetailsSummary(data.store);
      setDressMetadataMessage('Autolabel complete and tags saved.', 'success');
    } catch (error) {
      console.error('Autolabel request failed before completion', {
        selectedStoreId,
        selectedDressPhotoPath,
        error,
      });
      setDressMetadataMessage(`Unable to autolabel this photo right now. ${error?.message ? `(${error.message})` : ''}`.trim(), 'error');
    } finally {
      setAutolabelButtonsDisabled(!activeStoreCanManagePhotos);
    }
  });
}

if (dressAutolabelAllButton) {
  dressAutolabelAllButton.addEventListener('click', async () => {
    await runBulkAutolabel('dress-photo-autolabel-all', 'Running autolabel for non-labeled photos...', 'Autolabel all complete.');
  });
}

if (dressAutolabelOverwriteButton) {
  dressAutolabelOverwriteButton.addEventListener('click', async () => {
    await runBulkAutolabel('dress-photo-autolabel-overwrite', 'Running autolabel overwrite for all dresses...', 'Autolabel overwrite complete.');
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
          dress_profile_id: selectedDressProfileId || null,
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
}

const loadSessionRoutePage = async () => {
  if (!sessionRouteGrid) {
    return;
  }

  const currentUser = getSessionUser();
  if (!currentUser) {
    window.location.assign('/login');
    return;
  }

  setSessionRouteMessage('Loading your stores...', '');
  sessionRouteGrid.innerHTML = '';

  try {
    const response = await fetch(`/api/stores?owner=${encodeURIComponent(currentUser)}`);
    if (!response.ok) {
      setSessionRouteMessage('Unable to load stores right now.', 'error');
      return;
    }

    const data = await response.json();
    const stores = Array.isArray(data.stores) ? data.stores : [];
    const manageableStores = stores.filter((store) => store && store.owner_email === currentUser);

    if (!manageableStores.length) {
      setSessionRouteMessage('Only the store owner can start a session.', 'error');
      return;
    }

    if (manageableStores.length === 1) {
      setSessionRouteMessage('Starting your session…', '');
      redirectToSessionStore(manageableStores[0].id);
      return;
    }

    setSessionRouteMessage('Choose a store to start a session.', '');
    manageableStores.forEach((store) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'store-tile';

      const name = document.createElement('span');
      name.className = 'store-name';
      name.textContent = store.name || 'Unnamed store';

      const location = document.createElement('span');
      location.className = 'store-location';
      location.textContent = store.location || '';

      tile.appendChild(name);
      tile.appendChild(location);
      tile.addEventListener('click', () => {
        redirectToSessionStore(store.id);
      });
      sessionRouteGrid.appendChild(tile);
    });
  } catch (error) {
    setSessionRouteMessage('Unable to load stores right now.', 'error');
  }
};

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
  startSessionButton.addEventListener('click', handleStartSession);
}

if (sessionStoreConfirm) {
  sessionStoreConfirm.addEventListener('click', () => {
    const storeId = sessionStoreSelect?.value;
    if (!storeId) {
      setSessionMessage('Please select a store first.', 'error');
      return;
    }
    const didActivate = activateStoreById(storeId);
    if (!didActivate) {
      setSessionMessage('Unable to load this store. Please choose another one.', 'error');
      return;
    }
    startDefaultSession(parseSessionDressCount());
  });
}

if (sessionDressCountInput && !sessionDressCountInput.value) {
  sessionDressCountInput.value = String(DEFAULT_SESSION_DRESS_COUNT);
}

if (dislikeButton) {
  dislikeButton.addEventListener('click', () => handleSwipe('dislike'));
}

if (likeButton) {
  likeButton.addEventListener('click', () => handleSwipe('like'));
}

if (swipePhotoPrev) {
  swipePhotoPrev.addEventListener('click', () => {
    if (swipePhotoIndex <= 0) {
      return;
    }
    swipePhotoIndex -= 1;
    renderSwipeCard();
  });
}

if (swipePhotoNext) {
  swipePhotoNext.addEventListener('click', () => {
    const current = swipeDeck[swipeIndex];
    const photoCount = Array.isArray(current?.photoPaths) && current.photoPaths.length
      ? current.photoPaths.length
      : 1;
    if (swipePhotoIndex >= photoCount - 1) {
      return;
    }
    swipePhotoIndex += 1;
    renderSwipeCard();
  });
}

if (sessionResultTabs.length) {
  sessionResultTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.sessionResultsTab;
      if (tabId) {
        setSessionResultsTab(tabId);
      }
    });
  });
}

if (sessionRankingPrev) {
  sessionRankingPrev.addEventListener('click', () => {
    if (rankedStoreDressIndex <= 0) {
      return;
    }
    rankedStoreDressIndex -= 1;
    rankedStoreDressPhotoIndex = 0;
    renderRankedStoreDress();
  });
}

if (sessionRankingNext) {
  sessionRankingNext.addEventListener('click', () => {
    if (rankedStoreDressIndex >= rankedStoreDresses.length - 1) {
      return;
    }
    rankedStoreDressIndex += 1;
    rankedStoreDressPhotoIndex = 0;
    renderRankedStoreDress();
  });
}

if (sessionRankingPhotoPrev) {
  sessionRankingPhotoPrev.addEventListener('click', () => {
    if (rankedStoreDressPhotoIndex <= 0) {
      return;
    }
    rankedStoreDressPhotoIndex -= 1;
    renderRankedStoreDress();
  });
}

if (sessionRankingPhotoNext) {
  sessionRankingPhotoNext.addEventListener('click', () => {
    const current = rankedStoreDresses[rankedStoreDressIndex];
    const photoCount = Array.isArray(current?.photos) ? current.photos.length : 0;
    if (rankedStoreDressPhotoIndex >= photoCount - 1) {
      return;
    }
    rankedStoreDressPhotoIndex += 1;
    renderRankedStoreDress();
  });
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
loadSessionRoutePage();

if (detailsPreviewImage) {
  detailsPreviewImage.addEventListener('click', () => {
    if (selectedPreviewPhotoUrl) {
      openPhotoLightbox(selectedPreviewPhotoUrl);
    }
  });
}
