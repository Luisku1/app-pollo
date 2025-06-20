import axios from 'axios';

/**
 * Obtiene el último precio pagado por un proveedor para un producto específico.
 * @param {string} providerId - ID del proveedor
 * @param {string} productId - ID del producto
 * @returns {Promise<number|null>} Último precio o null si no hay datos
 */
export const getProductLastPrice = async (providerId, productId) => {
  if (!providerId || !productId) return null;
  try {
    const { data } = await axios.get(`/api/provider/get-provider-last-price/${providerId}/${productId}`);
    return data?.lastPrice ?? null;
  } catch (error) {
    // Manejo de error: puedes loguear o lanzar según la necesidad
    return null;
  }
};
