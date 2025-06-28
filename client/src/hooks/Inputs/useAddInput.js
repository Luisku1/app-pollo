import { useMutation } from '@tanstack/react-query';
import { addInputFetch } from "../../services/Inputs/addInput"

export const useAddInput = () => {
  const { mutateAsync, isPending } = useMutation({
    mutation: async ({ input, group }) => {
      return await addInputFetch({
        input: {
          ...input,
          _id: input._id || null,
          product: input.product._id,
          employee: input.employee._id,
          branch: input.branch?.value || null,
          customer: input.customer?.value || null,
        },
        group,
      });
    },
  });

  const addInput = async (input, group) => {
    try {
      await mutateAsync({ input, group });
    } catch (error) {
      console.error('Error adding input:', error);
      throw error;
    }
  };

  return { addInput, isLoading: isPending };
};