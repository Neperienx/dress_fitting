(() => {
  const createAiService = (fetchImpl = window.fetch.bind(window)) => {
    const postJson = async (url, payload) => {
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      return { ok: response.ok, status: response.status, data };
    };

    const autolabelPhoto = ({ storeId, ownerEmail, photoPath }) =>
      postJson(`/api/stores/${encodeURIComponent(storeId)}/dress-photo-autolabel`, {
        owner_email: ownerEmail,
        photo_path: photoPath,
      });

    const autolabelAll = ({ storeId, ownerEmail }) =>
      postJson(`/api/stores/${encodeURIComponent(storeId)}/dress-photo-autolabel-all`, {
        owner_email: ownerEmail,
      });

    const autolabelOverwrite = ({ storeId, ownerEmail }) =>
      postJson(`/api/stores/${encodeURIComponent(storeId)}/dress-photo-autolabel-overwrite`, {
        owner_email: ownerEmail,
      });

    return {
      autolabelPhoto,
      autolabelAll,
      autolabelOverwrite,
    };
  };

  window.createAiService = createAiService;
})();
