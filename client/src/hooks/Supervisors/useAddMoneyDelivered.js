import { useState } from "react"
import { addMoneyDeliveredFetch } from "../../services/Supervisors/addMoneyDelivered"

export const useAddMoneyDelivered = () => {

  const [loading, setLoading] = useState(false)

  const addMoneyDelivered = ({ supervisorId, companyId, amount, date }) => {

    setLoading(true)

    addMoneyDeliveredFetch({ supervisorId, companyId, amount, date }).then((response) => {

      return response

    }).catch((error) => {

      console.log(error)
    })

    setLoading(false)
  }

  return { addMoneyDelivered, loading }
}