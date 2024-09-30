export const useLoading = (...loadingStates) => {

  return loadingStates.some((loading) => loading === true)
}