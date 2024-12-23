import { useEffect, useState } from "react"
import { getDayExtraOutgoingsFetch } from "../../services/ExtraOutgoings/getDayExtraOutgoings"

export const useDayExtraOutgoings = ({ companyId = null, date = null, initialExtraOutgoings = [] }) => {

  const [extraOutgoings, setExtraOutgoings] = useState(initialExtraOutgoings)
  const [totalExtraOutgoings, setTotalExtraOutgoings] = useState(
    initialExtraOutgoings.reduce((acc, extraOutgoing) => acc + extraOutgoing.amount, 0)
  )
  const [loading, setLoading] = useState(false)

  const pushExtraOutgoing = ({ extraOutgoing }) => {

    setExtraOutgoings((prevExtraOutgoings) => [extraOutgoing, ...prevExtraOutgoings])
    setTotalExtraOutgoings((prevTotal) => prevTotal + extraOutgoing.amount)
  }

  const spliceExtraOutgoing = ({ index }) => {
    setExtraOutgoings((prevExtraOutgoings) => {
      const newExtraOutgoings = [...prevExtraOutgoings];
      const removed = newExtraOutgoings.splice(index, 1);
      setTotalExtraOutgoings((prevTotal) => prevTotal - removed[0].amount);

      return newExtraOutgoings;
    })
  }

  const spliceExtraOutgoingById = ({ extraOutgoingId, amount }) => {

    setExtraOutgoings((prevExtraOutgoings) =>
      prevExtraOutgoings.filter((extraOutgoing) => extraOutgoing._id !== extraOutgoingId)
    )

    setTotalExtraOutgoings((prevTotal) => prevTotal - amount)
  }

  const updateLastExtraOutgoingId = ({ extraOutgoingId }) => {

    setExtraOutgoings((prevExtraOutgoings) => prevExtraOutgoings.map((extraOutgoing, index) =>

      index == 0 ? { _id: extraOutgoingId, ...extraOutgoing } : extraOutgoing
    ))
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
    spliceExtraOutgoing,
    spliceExtraOutgoingById,
    updateLastExtraOutgoingId,
    loading
  }
}