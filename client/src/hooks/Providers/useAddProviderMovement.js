import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from "react"
import { addProviderMovementFetch } from "../../services/Providers/addProviderMovement"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { getProductLastPrice } from '../../services/Providers/getProductLastPrice';

/**
 * Hook para agregar una compra a un proveedor usando TanStack Query y obtener el último precio del producto.
 * @returns {{ addMovement: Function, loading: boolean, lastPrice: number|null, fetchLastPrice: Function }}
 */
const useAddProviderMovement = () => {
  const queryClient = useQueryClient();
  const [lastPrice, setLastPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mutación para agregar la compra
  const mutation = useMutation({
    mutationFn: async (purchaseData) => {
      setLoading(true);
      await addProviderMovementFetch(purchaseData);
    },
    onSuccess: () => {
      ToastSuccess('Compra del proveedor guardada exitosamente');
      // Invalida queries relevantes para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['providersMovements'] });
      setLoading(false);
    },
    onError: (error) => {
      ToastDanger('Error al guardar la compra del proveedor');
      setLoading(false);
    },
  });

  // Función para obtener el último precio del producto para el proveedor
  const fetchLastPrice = async (providerId, productId) => {
    setLastPrice(null);
    if (!providerId || !productId) return null;
    const price = await getProductLastPrice(providerId, productId);
    setLastPrice(price);
    return price;
  };

  // addMovement recibe purchaseData y un flag specialPrice
  const addMovement = async (purchaseData, specialPrice = false) => {
    // Si el usuario no quiere cambiar el precio, obtenemos el último precio
    if (!specialPrice && purchaseData.provider && purchaseData.product) {
      const price = await fetchLastPrice(purchaseData.provider, purchaseData.product);
      if (price != null) {
        purchaseData.price = price;
      }
    }
    purchaseData.specialPrice = !!specialPrice;
    mutation.mutate(purchaseData);
  };

  return { addMovement, loading: mutation.isLoading || loading, lastPrice, fetchLastPrice };
};

export default useAddProviderMovement