import { useEffect, useState } from "react"
import { getDayExtraOutgoingsFetch } from "../../services/ExtraOutgoings/getDayExtraOutgoings"

export const useDayExtraOutgoings = ({ companyId, date }) => {

  const [extraOutgoings, setExtraOutgoings] = useState([])
  const [totalExtraOutgoings, setTotalExtraOutgoings] = useState(0.0)
  const [loading, setLoading] = useState(false)

  const pushExtraOutgoing = ({ extraOutgoing }) => {

    setExtraOutgoings((prevExtraOutgoings) => [extraOutgoing, ...prevExtraOutgoings])
    setTotalExtraOutgoings((prevTotal) => prevTotal + extraOutgoing.amount)
  }

  const spliceExtraOutgoing = ({ index }) => {

    const removedExtraOutgoing = extraOutgoings.splice(index, 1)
    setTotalExtraOutgoings((prevTotal) => prevTotal - removedExtraOutgoing[0].amount)
  }

  const spliceExtraOutgoingById = ({ extraOutgoingId, amount }) => {

    setExtraOutgoings((prevExtraOutgoings) => prevExtraOutgoings.map((extraOutgoing) =>

      extraOutgoing._id != extraOutgoingId
    ))

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

  return { extraOutgoings, totalExtraOutgoings, pushExtraOutgoing, spliceExtraOutgoing, spliceExtraOutgoingById, updateLastExtraOutgoingId, loading }
}