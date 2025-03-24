/* eslint-disable react/prop-types */
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { currency } from "../helpers/Functions"
import { useVerifyMoney } from "../hooks/Supervisors/useVerifyMoney"
import { ToastWarning } from "../helpers/toastify"

export default function RegistrarDineroReportado({ supervisorReport, replaceReport }) {

  const { company } = useSelector((state) => state.user)
  const [verifiedCash, setVerifiedCash] = useState(0.00)
  const [verifiedDeposits, setVerifiedDeposits] = useState(0.00)
  const { verifyMoney } = useVerifyMoney()

  const handleVerifiedCashOnChange = (e) => {

    setVerifiedCash(e.target.value)
  }
  const handleVerifiedDepositsOnChange = (e) => {

    setVerifiedDeposits(e.target.value)
  }

  const submitVerifyMoney = async (e, typeField) => {

    e.preventDefault()

    const amount = typeField == "verifiedCash" ? verifiedCash : verifiedDeposits

    try {


      if (isNaN(amount) || amount === "" || amount < 0) {
        ToastWarning("Ingresa un monto válido")
        return
      }

      const updatedReport = await verifyMoney({ typeField, supervisorReportId: supervisorReport._id, companyId: company._id, amount, date: supervisorReport.createdAt })
      replaceReport({...supervisorReport, balance: updatedReport.balance, [typeField]: amount })


    } catch (error) {

      console.log(error)
    }
  }

  useEffect(() => {

    if (supervisorReport) {
      setVerifiedCash(supervisorReport.verifiedCash)
      setVerifiedDeposits(supervisorReport.verifiedDeposits)
    }

  }, [supervisorReport])

  return (
    <div className="">
      <div className="w-full">
        <h3 className="text-md font-bold">Efectivo verificado</h3>
        <form onSubmit={(e) => { submitVerifyMoney(e, "verifiedCash") }}>
          <p className="items-center flex justify-center"> Efectivo a entregar: {currency(supervisorReport.cash - supervisorReport.extraOutgoings)}</p>
          <div className="">
            <input
              className='border border-black p-2 rounded-md w-full'
              type="text"
              name=""
              step={0.01}
              id=""
              onFocus={(e) => { e.target.select() }}
              value={verifiedCash}
              onChange={handleVerifiedCashOnChange}
            />
          </div>
          <div className="flex justify-center">
            <button type="submit" className="w-10/12 p-3 text-white bg-button mt-2 rounded-lg">
              {supervisorReport && supervisorReport.verifiedCash == 0 ?
                'Guardar'
                :
                'Actualizar'
              }
            </button>
          </div>
        </form>
      </div>

      <div className="w-full">
        <h3 className="text-md font-bold">Depósitos verificados</h3>
        <form onSubmit={(e) => { submitVerifyMoney(e, "verifiedDeposits") }}>
          <p className="items-center flex justify-center">Depositos a verificar: {currency(supervisorReport.deposits + supervisorReport.terminalIncomes)}</p>
          <div className="">
            <input
              className='border border-black p-2 rounded-md w-full'
              type="number"
              name=""
              step={0.01}
              id=""
              onFocus={(e) => { e.target.select() }}
              value={verifiedDeposits}
              onChange={handleVerifiedDepositsOnChange}
            />
          </div>
          <div className="flex justify-center">
            <button type="submit" className="w-10/12 p-3 text-white bg-button mt-2 rounded-lg">
              {supervisorReport && supervisorReport.verifiedDeposits == 0 ?
                'Guardar'
                :
                'Actualizar'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
