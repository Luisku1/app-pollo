/* eslint-disable react/prop-types */
import { useEffect, useState } from "react"
import { useSupervisorReport } from "../hooks/Supervisors/useSupervisorReport"
import { useSelector } from "react-redux"
import { stringToCurrency } from "../helpers/Functions"
import { useVerifyMoney } from "../hooks/Supervisors/useVerifyMoney"
import { ToastWarning } from "../helpers/toastify"

export default function RegistrarDineroReportado({ setNegativeBalances, supervisorId, date, updateReportedCash, updateReportedDeposits }) {

  const { company } = useSelector((state) => state.user)
  const [verifiedCash, setVerifiedCash] = useState(0.00)
  const [verifiedDeposits, setVerifiedDeposits] = useState(0.00)
  const { verifyMoney } = useVerifyMoney()
  const { supervisorReport, updateSupervisorReport } = useSupervisorReport({ supervisorId, date })

  const handleVerifiedCashOnChange = (e) => {

    setVerifiedCash(e.target.value)
  }
  const handleVerifiedDepositsOnChange = (e) => {

    setVerifiedDeposits(e.target.value)
  }

  const submitVerifyMoney = (e, typeField) => {

    e.preventDefault()

    const amount = typeField == "verifiedCash" ? verifiedCash : verifiedDeposits

    if (isNaN(amount) || amount === "") {
      ToastWarning("Ingresa un monto válido")
      return
    }

    verifyMoney({ typeField, supervisorId, companyId: company._id, amount, date, supervisorReport, updateSupervisorReport, updateReportedCash, updateReportedDeposits })
  }

  useEffect(() => {

    if (!supervisorReport || !supervisorId) return

    setVerifiedCash(supervisorReport.verifiedCash)
    setVerifiedDeposits(supervisorReport.verifiedDeposits)

    const handleNegativeBalances = (supervisorId, balance) => {

      setNegativeBalances((prevBalances) => {
        const negativeBalances = new Set(prevBalances)
        if(balance < 0) {
          negativeBalances.add(supervisorId)
        } else {
          if (negativeBalances.has(supervisorId))
            negativeBalances.delete(supervisorId)
        }
        return negativeBalances
      })
    }
      handleNegativeBalances(supervisorId, supervisorReport.balance)

  }, [setNegativeBalances, supervisorId, supervisorReport])

  return (
    <div className="grid grid-cols-12 justify-self-center">
      <div className="col-span-6">
        <h3 className="text-md font-bold">Efectivo verificado</h3>
        <form onSubmit={(e) => { submitVerifyMoney(e, "verifiedCash") }}>
          <input
            className='border border-black p-2 rounded-md w-full mr-2'
            type="text"
            name=""
            step={0.01}
            id=""
            onFocus={(e) => { e.target.select() }}
            value={verifiedCash}
            onChange={handleVerifiedCashOnChange}
          />
          <div className="flex justify-center">
            <button type="submit" className="w-10/12 p-3 text-white bg-slate-500 mt-2 rounded-lg">
              {supervisorReport && supervisorReport.verifiedCash == 0 ?
                'Guardar'
                :
                'Actualizar'
              }
            </button>
          </div>
        </form>
      </div>

      <div className="col-span-6">
        <h3 className="text-md font-bold">Depósitos verificados</h3>
        <form onSubmit={(e) => { submitVerifyMoney(e, "verifiedDeposits") }}>
          <input
            className='border border-black p-2 rounded-md w-full ml-2'
            type="number"
            name=""
            step={0.01}
            id=""
            onFocus={(e) => { e.target.select() }}
            value={verifiedDeposits}
            onChange={handleVerifiedDepositsOnChange}
          />
          <div className="flex justify-center">
            <button type="submit" className="w-10/12 p-3 text-white bg-slate-500 mt-2 rounded-lg">
              {supervisorReport && supervisorReport.verifiedDeposits == 0 ?
                'Guardar'
                :
                'Actualizar'
              }
            </button>
          </div>
        </form>
      </div>

      <div className="col-span-12 ml-3 mt-3">

        {supervisorReport ?
          <div>
            <p className="p-2"><span className="font-bold">Dinero a entregar: </span>{stringToCurrency({ amount: supervisorReport.incomes - supervisorReport.extraOutgoings })}</p>
            <p className="p-2">
              <span className="font-bold">Dinero entregado: </span>{stringToCurrency({ amount: (supervisorReport.verifiedCash + supervisorReport.verifiedDeposits) || 0 })}
            </p>
            <p className="p-2 font-bold">Balance: <span className={`${supervisorReport.balance < 0 ? 'text-red-700' : ''}`}>{stringToCurrency({ amount: supervisorReport.balance })}</span></p>
          </div>
          : ''}
      </div>
    </div>
  )
}
