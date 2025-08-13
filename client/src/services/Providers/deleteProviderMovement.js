export const deleteProviderMovementFetch = async ({ purchaseId }) => {
  const res = await fetch(`/api/provider/delete-provider-movement/${purchaseId}`, {
    method: 'DELETE'
  })

  const data = await res.json()

  if (data.success === false) {
    throw new Error(data.message);
  }
}