import { useEffect, useMemo, useState } from "react"
import { getOutgoings } from "../../services/Outgoings/getOutgoings"
import { useAddOutgoing } from "./useAddOutgoing"
import { Types } from "mongoose"
import { useDeleteOutgoing } from "./useDeleteOutgoing"

export const useOutgoings = ({ branchId = null, date = null, initialOutgoings = null }) => {

  const [outgoings, setOutgoings] = useState([])
  const { deleteOutgoing } = useDeleteOutgoing()
  const { addOutgoing } = useAddOutgoing()
  const [loading, setLoading] = useState(false)

  const pushOutgoing = (outgoing) => {

    setOutgoings((prevOutgoings) => [outgoing, ...prevOutgoings])
  }

  const spliceOutgoing = (index) => {
    setOutgoings((prevOutgoings) => {
      const newOutgoings = prevOutgoings.filter((_, i) => i !== index);
      return newOutgoings;
    });
  };

  const onAddOutgoing = async (outgoing, modifyBalance) => {

    const tempId = new Types.ObjectId().toHexString()

    try {

      const tempOutgoing = { ...outgoing, _id: tempId }

      modifyBalance(tempOutgoing.amount, 'add')
      pushOutgoing(tempOutgoing)
      await addOutgoing(tempOutgoing)

    } catch (error) {

      spliceOutgoing(outgoings.findIndex((outgoing) => outgoing._id === tempId))
      console.log(error)
    }
  }

  const onDeleteOutgoing = async (outgoing, index, modifyBalance) => {

    try {

      modifyBalance(outgoing.amount, 'subtract')
      spliceOutgoing(index)
      await deleteOutgoing(outgoing)

    } catch (error) {

      pushOutgoing(outgoing)
      console.log(error)
    }
  }

  const initialize = (initialArray) => {
    setOutgoings(initialArray);
  };

  useEffect(() => {

    if (!initialOutgoings || initialOutgoings == outgoings) return

    setOutgoings(initialOutgoings)

  }, [initialOutgoings, outgoings])

  useEffect(() => {

    if (!branchId || !date) return

    const fetchOutgoings = async () => {
      setLoading(true)
      try {
        const response = await getOutgoings({ branchId, date })
        setOutgoings(response.outgoings)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchOutgoings()
  }, [branchId, date])

  const outgoingsTotal = useMemo(() => {
    return outgoings.reduce((acc, outgoing) => acc + outgoing.amount, 0)
  }, [outgoings])

  const sortedOutgoings = useMemo(() => {
    return outgoings.sort((a, b) => a.amount - b.amount)
  }, [outgoings])

  return {
    outgoings: sortedOutgoings,
    outgoingsTotal,
    onAddOutgoing,
    onDeleteOutgoing,
    pushOutgoing,
    spliceOutgoing,
    loading,
    initialize
  }
}