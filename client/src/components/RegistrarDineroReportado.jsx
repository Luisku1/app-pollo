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

      replaceReport(updatedReport)

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

      <div className="col-span-12 ml-3 mt-3">

        {supervisorReport ?
          <div>
            <p className="p-2"><span className="font-bold">Dinero a entregar: </span>{currency({ amount: supervisorReport.incomes - supervisorReport.extraOutgoings })}</p>
            <p className="p-2">
              <span className="font-bold">Dinero entregado: </span>{currency({ amount: (supervisorReport.verifiedCash + supervisorReport.verifiedDeposits) || 0 })}
            </p>
            <p className="p-2 font-bold">Balance: <span className={`${supervisorReport.balance < 0 ? 'text-red-700' : ''}`}>{currency({ amount: supervisorReport.balance })}</span></p>
          </div>
          : ''}
      </div>
    </div>
  )
}
