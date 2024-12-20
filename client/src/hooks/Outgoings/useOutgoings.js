import { useEffect, useState } from "react"
import { getOutgoings } from "../../services/Outgoings/getOutgoings"

export const useOutgoings = ({ branchId, date }) => {

  const [outgoings, setOutgoings] = useState([])
  const [outgoingsTotal, setOutgoingsTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const pushOutgoing = ({ outgoing }) => {

    setOutgoings((prevOutgoings) => [outgoing, ...prevOutgoings])
    setOutgoingsTotal((prev) => prev + outgoing.amount)
  }

  const spliceOutgoing = ({ index }) => {

    if(outgoings.length === 0) return
    const removedOutgoing = outgoings.splice(index, 1)
    setOutgoingsTotal((prev) => prev - parseFloat(removedOutgoing[0].amount))
  }

  const updateOutgoingId = (tempId, realId) => {
    setOutgoings((prevOutgoings) => {

      prevOutgoings[0]._id = realId

      return prevOutgoings
    })
  }

  useEffect(() => {

    if (!branchId || !date) return

    setLoading(true)

    setOutgoings([])
    setOutgoingsTotal(0.0)

    getOutgoings({ branchId, date }).then((response) => {

      setOutgoings(response.outgoings)
      setOutgoingsTotal(response.outgoingsTotal)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)
  }, [branchId, date])

  return { outgoings, updateOutgoingId, outgoingsTotal, pushOutgoing, spliceOutgoing, loading, error }

}