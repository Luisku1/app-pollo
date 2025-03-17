import { useState } from "react"
import { addIncomeFetch } from "../../services/Incomes/addIncome"

export const useAddIncome = () => {

  const [loading, setLoading] = useState(false)

  const addIncome = async (income, prevOwnerIncome, group) => {

    setLoading(true)

    try {

      await addIncomeFetch(
        {
          _id: income._id,
          amount: income.amount,
          company: income.company,
          branch: income.branch?._id || null,
          customer: income.customer?._id || null,
          employee: income.employee?._id || null,
          prevOwner: income.prevOwner?._id || null,
          prevOwnerIncome: income.prevOwnerIncome || null,
          partOfAPayment: income.partOfAPayment,
          type: income.type._id,
          createdAt: income.createdAt
        },
        (prevOwnerIncome ?
          {
            _id: prevOwnerIncome?._id,
            amount: prevOwnerIncome?.amount,
            company: prevOwnerIncome?.company,
            employee: prevOwnerIncome?.employee?._id,
            owner: prevOwnerIncome?.owner?._id,
            type: prevOwnerIncome?.type?._id,
            createdAt: prevOwnerIncome?.createdAt
          } : null
        ),
        group
      )

    } catch (error) {
      console.log(error)
      throw new Error(error);
    }
  }

  return { addIncome, loading }
}