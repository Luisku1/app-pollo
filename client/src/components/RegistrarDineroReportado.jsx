/* eslint-disable react/prop-types */
import { useEffect, useState } from "react"
import { useAddMoneyDelivered } from "../hooks/Supervisors/useAddMoneyDelivered"
import { useSupervisorReport } from "../hooks/Supervisors/useSupervisorReport"
import { useSelector } from "react-redux"
import { stringToCurrency } from "../helpers/Functions"

export default function RegistrarDineroReportado({ supervisorId, date, updateReportedIncomes }) {

  const { company } = useSelector((state) => state.user)
  const [inputValue, setInputValue] = useState(0.00)
  const { addMoneyDelivered } = useAddMoneyDelivered()
  const { supervisorReport, updateSupervisorReport } = useSupervisorReport({ supervisorId, date })

  const handleInputOnChange = (e) => {

    setInputValue(e.target.value)
  }

  const submitMoneyDelivered = (e) => {

    e.preventDefault()

    addMoneyDelivered({ supervisorId, companyId: company._id, amount: inputValue, date, supervisorReport, updateSupervisorReport, updateReportedIncomes })
  }

  useEffect(() => {

    if (!supervisorReport) return

    setInputValue(supervisorReport.moneyDelivered)

  }, [supervisorReport])

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-4">
        <h3 className="text-md font-bold">Dinero entregado</h3>
        <form onSubmit={submitMoneyDelivered}>
          <input
            className='border border-black p-3 rounded-md w-full'
            type="text"
            name=""
            step={0.01}
            id=""
            onFocus={(e) => { e.target.select() }}
            value={inputValue}
            onChange={handleInputOnChange}
          />
          <div className="flex justify-center">
            <button type="submit" className="w-10/12 p-3 text-white bg-slate-500 mt-2 rounded-lg">
              {supervisorReport && supervisorReport.moneyDelivered == 0 ?
                'Guardar'
                :
                'Actualizar'
              }
            </button>
          </div>
        </form>
      </div>

      <div className="col-span-8 ml-3">

        <h3 className="text-md font-bold text-red-500">Reporte de supervisor</h3>
        {supervisorReport ?
          <div>
            <p className="p-2"><span className="font-bold">Dinero a entregar: </span>{stringToCurrency({ amount: supervisorReport.incomes - supervisorReport.extraOutgoings })}</p>
            <p className="p-2">
              <span className="font-bold">Dinero entregado: </span>{stringToCurrency({ amount: supervisorReport.moneyDelivered })}
            </p>
            <p className="p-2 font-bold">Balance: <span className={`${supervisorReport.balance < 0 ? 'text-red-700' : ''}`}>{stringToCurrency({ amount: supervisorReport.balance })}</span></p>
          </div>
          : ''}
      </div>
    </div>
  )
}
