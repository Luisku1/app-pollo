import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { getProvidersMovements } from '../../services/Providers/getProvidersMovements';
import useAddProviderMovement from './useAddProviderMovement';
import { useDeleteProviderMovement } from './useDeleteProviderMovement';
import { getProductLastPrice } from '../../services/Providers/getProductLastPrice';
import { useEffect, useState } from 'react';

const useProvidersMovements = ({ companyId, date = null, productId, providerId }) => {
  const queryClient = useQueryClient();
  const { addMovement, loading: addLoading } = useAddProviderMovement();
  const { deleteProviderMovement, loading: deleteLoading } = useDeleteProviderMovement();

  // Query para obtener movimientos
  const {
    data,
    isLoading: queryLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['providersMovements', companyId, date],
    queryFn: () => getProvidersMovements({ companyId, date }),
    enabled: !!companyId && !!date,
    select: (data) => ({
      movements: data || [],
      totalAmount: data.reduce((acc, movement) => acc + movement.amount, 0) || 0
    })
  });

  const {
    lastPrice,
    loading: lastPriceLoading,
    error: lastPriceError,
  } = useQuery({
    queryKey: ['providerLastPrice', providerId, productId],
    queryFn: () => getProductLastPrice(providerId, productId).then(data => data?.lastPrice),
    enabled: !!providerId && !!productId
  });

  const [price, setPrice] = useState(lastPrice || 0);

  useEffect(() => {
    if (lastPrice !== undefined) {
      setPrice(lastPrice);
    }
  }, [lastPrice]);

  useEffect(() => {
    if (!productId || !providerId) {
      setPrice(0.0);
    }
  }, [productId, providerId]);

  // Mutación para agregar compra
  const addMutation = useMutation({
    mutationFn: async (purchase) => {
      await addMovement(purchase);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providersMovements', companyId, date] });
    }
  });

  // Mutación para eliminar compra
  const deleteMutation = useMutation({
    mutationFn: async (purchase) => {
      await deleteProviderMovement(purchase);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providersMovements', companyId, date] });
    }
  });

  const onAddMovement = async (purchase) => {
    const tempId = uuidv4();
    try {
      await addMutation.mutateAsync({ ...purchase, _id: tempId });
    } catch (error) {
      // Error handling ya gestionado en el hook de addMovement
    }
  };

  const onDeleteMovement = async (purchase) => {
    try {
      await deleteMutation.mutateAsync(purchase);
    } catch (error) {
      // Error handling ya gestionado en el hook de deleteProviderMovement
    }
  };

  return {
    movements: data?.movements || [],
    totalAmount: data?.totalAmount || 0,
    onAddMovement,
    onDeleteMovement,
    loading: queryLoading || addLoading || deleteLoading,
    error,
    refetch,
    price
  };
};

export default useProvidersMovements;
