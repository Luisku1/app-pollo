import { useMutation } from '@tanstack/react-query';
import { verifyMoneyFetch } from "../../services/Supervisors/verifyMoney";

export const useVerifyMoney = () => {
  const mutation = useMutation({
    mutationFn: verifyMoneyFetch,
  });

  return {
    verifyMoney: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    ...mutation,
  };
};