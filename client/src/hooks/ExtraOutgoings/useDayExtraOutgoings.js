import { useEffect, useMemo, useState } from "react"
import { getDayExtraOutgoingsFetch } from "../../services/ExtraOutgoings/getDayExtraOutgoings"
import { useAddExtraOutgoing } from "./useAddExtraOutgoing"
import { useDeleteExtraOutgoing } from "./useDeleteExtraOutgoing";
import { Types } from "mongoose";

export const useDayExtraOutgoings = ({ companyId = null, date = null, initialExtraOutgoings = [] }) => {

  const [extraOutgoings, setExtraOutgoings] = useState(initialExtraOutgoings)
  const [totalExtraOutgoings, setTotalExtraOutgoings] = useState(
    initialExtraOutgoings.reduce((acc, extraOutgoing) => acc + extraOutgoing.amount, 0)
  )
  const { addExtraOutgoing } = useAddExtraOutgoing()
  const { deleteExtraOutgoing } = useDeleteExtraOutgoing()
  const [loading, setLoading] = useState(false)

  const calculateTotal = (extraOutgoingsList) => {

    setTotalExtraOutgoings(extraOutgoingsList.reduce((acc, extraOutgoing) => acc + extraOutgoing.amount, 0))
  }

  const pushExtraOutgoing = (extraOutgoing) => {

    setExtraOutgoings((prevExtraOutgoings) => [extraOutgoing, ...prevExtraOutgoings])
    setTotalExtraOutgoings((prevTotal) => prevTotal + extraOutgoing.amount)
  }

  const spliceExtraOutgoingByIndex = (index) => {
    setExtraOutgoings((prevExtraOutgoings) => {
      const removed = prevExtraOutgoings[index];
      const newExtraOutgoings = prevExtraOutgoings.filter((_, i) => i !== index);
      setTotalExtraOutgoings((prevTotal) => prevTotal - removed.amount);
      return newExtraOutgoings;
    });
  };

  const spliceExtraOutgoingById = (extraOutgoingId) => {

    setExtraOutgoings((prevExtraOutgoings) => {

      const filteredExtraOutgoings = prevExtraOutgoings.filter((extraOutgoing) => extraOutgoing._id !== extraOutgoingId)
      setTotalExtraOutgoings(calculateTotal(filteredExtraOutgoings))
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
      console.log(error)
    }
  }

  const onDeleteExtraOutgoing = async (extraOutgoing) => {

    try {

      spliceExtraOutgoingByIndex(extraOutgoing.index)
      await deleteExtraOutgoing(extraOutgoing)

    } catch (error) {

      pushExtraOutgoing(extraOutgoing)
      console.log(error)
    }
  }

  const sortedExtraOutgoings = useMemo(() => {

    return extraOutgoings.sort((a, b) => { b.amount - a.amount })

  }, [extraOutgoings])

  useEffect(() => {

    if (!companyId || !date) return

    setLoading(true)

    setExtraOutgoings([])
    setTotalExtraOutgoings(0.0)

    getDayExtraOutgoingsFetch({ companyId, date }).then((response) => {

      setExtraOutgoings(response.extraOutgoings)
      setTotalExtraOutgoings(response.totalExtraOutgoings)

    }).catch((error) => {

      console.log(error)
    })

    setLoading(false)

  }, [companyId, date])

  return {
    extraOutgoings: sortedExtraOutgoings,
    totalExtraOutgoings,
    spliceExtraOutgoingById,
    pushExtraOutgoing,
    spliceExtraOutgoingByIndex,
    onAddExtraOutgoing,
    onDeleteExtraOutgoing,
    loading
  }
}