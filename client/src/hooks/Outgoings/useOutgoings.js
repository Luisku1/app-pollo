import { useEffect, useState } from "react"
import { getOutgoings } from "../../services/Outgoings/getOutgoings"
import { useAddOutgoing } from "./useAddOutgoing"
import { Types } from "mongoose"
import { useDeleteOutgoing } from "./useDeleteOutgoing"

export const useOutgoings = ({ branchId = null, date = null, initialOutgoings = [] }) => {

  const [outgoings, setOutgoings] = useState(initialOutgoings)
  const [outgoingsTotal, setOutgoingsTotal] = useState(
    initialOutgoings.reduce((acc, outgoing) => acc + outgoing.amount, 0)
  )
  const { deleteOutgoing } = useDeleteOutgoing()
  const { addOutgoing } = useAddOutgoing()
  const [loading, setLoading] = useState(false)

  const calculateTotal = (outgoingsList) => {

    setOutgoingsTotal(outgoingsList.reduce((acc, outgoing) => acc + outgoing.amount, 0))
  }

  const pushOutgoing = (outgoing) => {

    setOutgoings((prevOutgoings) => [outgoing, ...prevOutgoings])
    setOutgoingsTotal((prev) => prev + outgoing.amount)
  }

  const spliceOutgoing = (index) => {
    setOutgoings((prevOutgoings) => {
      const newOutgoings = prevOutgoings.filter((_, i) => i !== index);
      calculateTotal(newOutgoings);
      return newOutgoings;
    });
  };

  const onAddOutgoing = async (outgoing) => {

    const tempId = new Types.ObjectId().toHexString()

    try {

      const tempOutgoing = { ...outgoing, _id: tempId }

      pushOutgoing(tempOutgoing)
      await addOutgoing(tempOutgoing)

    } catch (error) {

      spliceOutgoing(outgoings.findIndex((outgoing) => outgoing._id === tempId))
      console.log(error)
    }
  }

  const onDeleteOutgoing = async (outgoing, index) => {

    try {

      spliceOutgoing(index)
      await deleteOutgoing(outgoing)

    } catch (error) {

      pushOutgoing(outgoing)
      console.log(error)
    }
  }

  useEffect(() => {

    if (initialOutgoings.length > 0) return
    if (!branchId || !date) return

    setLoading(true)

    setOutgoings([])
    setOutgoingsTotal(0.0)

    getOutgoings({ branchId, date }).then((response) => {

      setOutgoings(response.outgoings)
      setOutgoingsTotal(response.outgoingsTotal)

    }).catch((error) => {

      console.log(error)
    })

    setLoading(false)
  }, [branchId, date, initialOutgoings])

  return {
    outgoings,
    outgoingsTotal,
    onAddOutgoing,
    onDeleteOutgoing,
    pushOutgoing,
    spliceOutgoing,
    loading
  }
}