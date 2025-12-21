// Shared asset path utility
export function getAssetPath(filename) {
  const isLevelPage = window.location.pathname.includes('levels/');
  const assetPath = isLevelPage ? '../assets/' : './assets/';
  return assetPath + filename;
}

