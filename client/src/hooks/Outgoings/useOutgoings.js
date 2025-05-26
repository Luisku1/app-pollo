import { useState } from "react"
import { useAddOutgoing } from "./useAddOutgoing"
import { useDeleteOutgoing } from "./useDeleteOutgoing"

export const useOutgoings = () => {
  const { deleteOutgoing } = useDeleteOutgoing()
  const { addOutgoing } = useAddOutgoing()
  const [loading, setLoading] = useState(false)

  // Ya no maneja estado local de outgoings ni mutaciones optimistas

  // Sólo expone funciones para la API
  return {
    addOutgoing,
    deleteOutgoing,
    loading
  }
}