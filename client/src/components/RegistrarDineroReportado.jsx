/* eslint-disable react/prop-types */
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { currency, getEmployeeFullName } from "../helpers/Functions"
import { useVerifyMoney } from "../hooks/Supervisors/useVerifyMoney"
import { ToastWarning } from "../helpers/toastify"
import { CgProfile } from "react-icons/cg"
import { formatInformationDate } from "../helpers/DatePickerFunctions"

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
      replaceReport({ ...supervisorReport, balance: updatedReport.balance, [typeField]: amount }, supervisorReport.externalIndex)


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
        <div className="flex justify-between items-center px-2 pt-1 mb-2">
          <p className="text-lg font-semibold text-red-500 flex items-center gap-1"><CgProfile />{getEmployeeFullName(supervisorReport.supervisor)}</p>
          <div className="flex items-center gap-1">
            <p className="text-lg font-semibold text-red-500">
              {formatInformationDate(new Date(supervisorReport.createdAt))}
            </p>
          </div>
        </div>
        <form onSubmit={(e) => { submitVerifyMoney(e, "verifiedCash") }}>
          <div className="grid grid-cols-2 px-2 items-center py-2">
            <p className="items-center flex w-full"> Efectivo a entregar</p>
            <p>{currency(supervisorReport.cash - supervisorReport.extraOutgoings)}</p>
          </div>
          <div className="grid grid-cols-2 items-center px-2">
            <p className='font-semibold'>Efectivo entregado</p>
            <input
              className='border border-red-700 border-solid p-2 rounded-md w-full'
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
            <button type="submit" className="w-full p-3 text-white bg-button mt-2 rounded-lg">
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
        <form onSubmit={(e) => { submitVerifyMoney(e, "verifiedDeposits") }}>
          <div className="grid grid-cols-2 px-2 items-center py-2">
            <p className="w-full">Depositos a verificar</p>
            <p>{currency(supervisorReport.deposits + supervisorReport.terminalIncomes)}</p>
          </div>
          <div className="grid grid-cols-2 items-center px-2">
            <p className='font-semibold'>Depositos verificados</p>
            <input
              className='border border-red-700 border-solid p-2 rounded-md w-full'
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
            <button type="submit" className="w-full p-3 text-white bg-button mt-2 rounded-lg">
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
