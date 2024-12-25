//hook para agregar una compra a un proveedor
const useAddProviderPurchase = () => {

  const addProviderPurchase = async (providerId, purchase) => {
    try {
      const response = await fetch(`/api/providers/${providerId}/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(purchase)
      });
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  return { addProviderPurchase }
}