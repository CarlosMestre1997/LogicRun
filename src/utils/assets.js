// Shared asset path utility
export function getAssetPath(filename) {
  // Vite publicDir serves 'assets' folder at root
  return `/${filename}`;
}

