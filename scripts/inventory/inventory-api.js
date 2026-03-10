(function bootstrapInventoryApi(globalScope) {
  const parseJsonSafe = async (response) => response.json().catch(() => ({}));

  const uploadDressPhotos = async ({ storeId, files, ownerEmail, dressProfileId }) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('dress_photo', file));
    formData.append('owner_email', ownerEmail);
    if (dressProfileId) {
      formData.append('dress_profile_id', dressProfileId);
    }

    const response = await fetch(`/api/stores/${storeId}/dress-photo`, {
      method: 'POST',
      body: formData,
    });
    const data = await parseJsonSafe(response);
    return { ok: response.ok, data };
  };

  const removeDressPhoto = async ({ storeId, ownerEmail, photoPath }) => {
    const response = await fetch(`/api/stores/${storeId}/dress-photo`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo_path: photoPath, owner_email: ownerEmail }),
    });
    const data = await parseJsonSafe(response);
    return { ok: response.ok, data };
  };

  const mergeDressProfiles = async ({ storeId, ownerEmail, sourceProfileId, targetProfileId }) => {
    const response = await fetch(`/api/stores/${encodeURIComponent(storeId)}/dress-profile-merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_email: ownerEmail,
        source_profile_id: Number(sourceProfileId),
        target_profile_id: Number(targetProfileId),
      }),
    });
    const data = await parseJsonSafe(response);
    return { ok: response.ok, data };
  };

  const saveDressMetadata = async ({ storeId, ownerEmail, photoPath, dressProfileId, tags, price }) => {
    const response = await fetch(`/api/stores/${encodeURIComponent(storeId)}/dress-photo-metadata`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        photo_path: photoPath,
        owner_email: ownerEmail,
        dress_profile_id: dressProfileId || null,
        tags,
        price,
      }),
    });
    const data = await parseJsonSafe(response);
    return { ok: response.ok, data };
  };

  globalScope.createInventoryApi = () => ({
    uploadDressPhotos,
    removeDressPhoto,
    mergeDressProfiles,
    saveDressMetadata,
  });
})(window);
