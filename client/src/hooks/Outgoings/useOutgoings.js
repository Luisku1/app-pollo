import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { addOutgoingFetch } from "../../services/Outgoings/addOutgoing";
import { deleteOutgoingFetch } from "../../services/Outgoings/deleteOutgoing";

export const useOutgoings = () => {
  const addOutgoingMutation = useMutation({
    mutationFn: addOutgoingFetch
  });

  const deleteOutgoingMutation = useMutation(async (outgoing) => {
    console.log("Executing deleteOutgoingFetch with:", outgoing);
    alert("Executing deleteOutgoingFetch with: " + JSON.stringify(outgoing));
    return await deleteOutgoingFetch(outgoing._id);
  });

  const [loading, setLoading] = useState(false);

  // Ya no maneja estado local de outgoings ni mutaciones optimistas

  // Sólo expone funciones para la API
  return {
    addOutgoing: addOutgoingMutation.mutateAsync,
    deleteOutgoing: deleteOutgoingMutation.mutateAsync,
    loading: deleteOutgoingMutation.isLoading || addOutgoingMutation.isLoading,
  };
};