(function bootstrapInventorySessionEngine(globalScope) {
  const normalizeToken = (value) => globalScope.uiUtils?.normalizeToken?.(value) || '';

  const getLocalizedValue = (...args) => {
    if (globalScope.uiUtils?.getLocalizedValue) {
      return globalScope.uiUtils.getLocalizedValue(...args);
    }
    return '';
  };

  const buildTagToCategoryMap = (tagOptions) => {
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

  const loadDefaultSessionDeck = async ({ limit, tagMap, fallbackCategories }) => {
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
        metadataByPhoto = new Map(metadataRows.map((row) => [row.photo_path, Array.isArray(row.tags) ? row.tags : []]));
      }
    } catch (error) {
      // Fallback to filename heuristics.
    }

    return photos.slice(0, limit).map((photoPath) => {
      const tags = metadataByPhoto.get(photoPath) || [];
      const categoryFromTag = tags.map((tag) => tagMap.get(normalizeToken(tag))).find((value) => Boolean(value));
      return {
        photoPath,
        fileName: photoPath.split('/').pop() || photoPath,
        tags,
        category: categoryFromTag || resolvePhotoCategory(photoPath, tagMap, fallbackCategories),
      };
    });
  };

  globalScope.createInventorySessionEngine = () => ({
    buildTagToCategoryMap,
    resolvePhotoCategory,
    buildInventorySessionCandidates,
    selectProfilesForTagVariety,
    loadDefaultSessionDeck,
  });
})(window);
