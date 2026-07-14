/**
 * Builds a browser-usable URL for images served from the backend's /static
 * mount. Paths coming from the API are OS-native (may use backslashes on
 * Windows), so they're normalized to forward slashes before being appended
 * to the origin.
 */
export function useAuthenticatedImage(rawPath) {
  if (!rawPath) return null;

  const normalized = rawPath.replace(/\\/g, "/");

  // Already starts with /static -> don't prepend again
  if (normalized.startsWith("/static/")) {
    return normalized;
  }

  // Starts with storage -> prepend /static
  if (normalized.startsWith("storage/")) {
    return `/${"static"}/${normalized}`;
  }

  // Any other relative path
  return `/static/${normalized.replace(/^\/+/, "")}`;
}
