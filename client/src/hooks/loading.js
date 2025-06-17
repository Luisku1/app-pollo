export const useLoading = (loadingStates) => {
  // Accepts an array of booleans or a single boolean
  if (Array.isArray(loadingStates)) {
    return loadingStates.every(Boolean);
  }
  return Boolean(loadingStates);
}