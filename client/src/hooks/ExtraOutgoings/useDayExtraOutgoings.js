import { useEffect, useState } from "react"
import { v4 as uuidv4 } from 'uuid';
import { getDayExtraOutgoingsFetch } from "../../services/ExtraOutgoings/getDayExtraOutgoings"
import { useAddExtraOutgoing } from "./useAddExtraOutgoing"
import { deleteExtraOutgoingFetch } from "../../services/ExtraOutgoings/deleteExtraOutgoing"

export const useDayExtraOutgoings = ({ companyId = null, date = null, initialExtraOutgoings = [] }) => {

  const [extraOutgoings, setExtraOutgoings] = useState(initialExtraOutgoings)
  const [totalExtraOutgoings, setTotalExtraOutgoings] = useState(
    initialExtraOutgoings.reduce((acc, extraOutgoing) => acc + extraOutgoing.amount, 0)
  )
  const { addExtraOutgoing } = useAddExtraOutgoing()
  const [loading, setLoading] = useState(false)

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

  const onAddExtraOutgoing = async (extraOutgoing) => {

    const tempId = uuidv4()

    try {

      const tempExtraOutgoing = { ...extraOutgoing, _id: tempId }

      pushExtraOutgoing(tempExtraOutgoing)
      await addExtraOutgoing(tempExtraOutgoing)

    } catch (error) {

      spliceExtraOutgoingByIndex(extraOutgoings.findIndex((extraOutgoing) => extraOutgoing._id === tempId))
      console.log(error)
    }
  }

  const onDeleteExtraOutgoing = async (extraOutgoing, index) => {

    try {

      spliceExtraOutgoingByIndex(index)
      await deleteExtraOutgoingFetch(extraOutgoing)

    } catch (error) {

      pushExtraOutgoing(extraOutgoing)
      console.log(error)
    }
  }

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
    extraOutgoings,
    totalExtraOutgoings,
    pushExtraOutgoing,
    spliceExtraOutgoingByIndex,
    onAddExtraOutgoing,
    onDeleteExtraOutgoing,
    loading
  }
}