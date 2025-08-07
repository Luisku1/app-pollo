export const addProviderMovementFetch = async (purchaseData) => {
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(purchaseData)
  }

  try {
    const response = await fetch('/api/provider/create-provider-movement', config)
    const data = await response.json()
    if (data.success === false) {

      throw new Error('Error adding provider purchase')
    }

    return data.data

  } catch (error) {
    console.error('Error adding provider purchase:', error)
    throw error
  }
}
