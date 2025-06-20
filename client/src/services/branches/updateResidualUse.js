export const updateResidualsUse = async (branchId) => {
  try {
    console.log(branchId)
    const res = await fetch(`/api/branch/change-prices-use`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({branchId})
    })
    const data = await res.json()

    return data.data
  } catch (error) {
    console.log(error)
    throw error.message || 'Error al actualizar uso de precios fríos'
  }
}