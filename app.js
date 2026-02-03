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
