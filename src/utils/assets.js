// Shared asset path utility
export function getAssetPath(filename) {
  // Vite handles asset paths automatically in production
  return `/assets/${filename}`;
}

