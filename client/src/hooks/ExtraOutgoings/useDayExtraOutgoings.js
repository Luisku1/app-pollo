import { useEffect, useMemo, useState } from "react"
import { getDayExtraOutgoingsFetch } from "../../services/ExtraOutgoings/getDayExtraOutgoings"
import { useAddExtraOutgoing } from "./useAddExtraOutgoing"
import { useDeleteExtraOutgoing } from "./useDeleteExtraOutgoing";
import { Types } from "mongoose";
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useDayExtraOutgoings = ({ companyId = null, date = null, initialExtraOutgoings = [] }) => {
  const { addExtraOutgoing } = useAddExtraOutgoing()
  const { deleteExtraOutgoing } = useDeleteExtraOutgoing()
  const [error, setError] = useState(null)
  const queryClient = useQueryClient();

  const sanitizeExtraOutgoings = (outgoings) => {
    return outgoings.map((outgoing) => {
      const sanitizedOutgoing = { ...outgoing };
      Object.keys(sanitizedOutgoing).forEach((key) => {
        if (typeof sanitizedOutgoing[key] === "object" && sanitizedOutgoing[key] !== null) {
          sanitizedOutgoing[key] = JSON.parse(JSON.stringify(sanitizedOutgoing[key]));
        }
      });
      return sanitizedOutgoing;
    });
  };

  // React Query para obtener extraOutgoings
  const {
    data: extraOutgoingsData,
    isLoading: loading,
    refetch: refetchExtraOutgoings
  } = useQuery({
    queryKey: ["extraOutgoings", companyId, date],
    queryFn: async () => {
      const response = await getDayExtraOutgoingsFetch({ companyId, date });
      const { extraOutgoings } = response;

      // Sanitizar los datos para evitar estructuras circulares
      return sanitizeExtraOutgoings(extraOutgoings);
    },
    enabled: !!companyId && !!date,
    staleTime: 1000 * 60 * 3
  });

  const [extraOutgoings, setExtraOutgoings] = useState(initialExtraOutgoings)

  useEffect(() => {
    if (extraOutgoingsData) setExtraOutgoings(extraOutgoingsData)
  }, [extraOutgoingsData])

  useEffect(() => {
    if (initialExtraOutgoings) setExtraOutgoings(initialExtraOutgoings)
  }, [initialExtraOutgoings])

  const pushExtraOutgoing = (extraOutgoing) => {
    setExtraOutgoings((prevExtraOutgoings) => [extraOutgoing, ...prevExtraOutgoings])
  }

  const spliceExtraOutgoingByIndex = (index) => {
    setExtraOutgoings((prevExtraOutgoings) => {
      const newExtraOutgoings = prevExtraOutgoings.filter((_, i) => i !== index);
      return newExtraOutgoings;
    });
  };

  const spliceExtraOutgoingById = (extraOutgoingId) => {
    setExtraOutgoings((prevExtraOutgoings) => {
      const filteredExtraOutgoings = prevExtraOutgoings.filter((extraOutgoing) => extraOutgoing._id !== extraOutgoingId)
      return filteredExtraOutgoings
    })
  }

  const onAddExtraOutgoing = async (extraOutgoing) => {
    const tempId = new Types.ObjectId().toHexString()
    try {
      const tempExtraOutgoing = { ...extraOutgoing, _id: tempId }

      pushExtraOutgoing(tempExtraOutgoing)
      await addExtraOutgoing(tempExtraOutgoing)
    } catch (error) {
      spliceExtraOutgoingByIndex(extraOutgoings.findIndex((extraOutgoing) => extraOutgoing._id === tempId))
      setError(error)
      console.log(error)
    }
  }

  const onDeleteExtraOutgoing = async (extraOutgoing) => {
    try {
      spliceExtraOutgoingByIndex(extraOutgoing.index)
      await deleteExtraOutgoing(extraOutgoing)
    } catch (error) {
      pushExtraOutgoing(extraOutgoing)
      setError(error)
      console.log(error)
    }
  }

  const sortedExtraOutgoings = useMemo(() => {
    // Orden descendente por monto
    return [...extraOutgoings].sort((a, b) => b.amount - a.amount)
  }, [extraOutgoings])

  const totalExtraOutgoings = useMemo(() => {
    return extraOutgoings.reduce((total, extraOutgoing) => total + extraOutgoing.amount, 0)
  }, [extraOutgoings])

  return {
    extraOutgoings: sortedExtraOutgoings,
    totalExtraOutgoings,
    spliceExtraOutgoingById,
    pushExtraOutgoing,
    spliceExtraOutgoingByIndex,
    onAddExtraOutgoing,
    onDeleteExtraOutgoing,
    loading,
    error,
    refetchExtraOutgoings
  }
}