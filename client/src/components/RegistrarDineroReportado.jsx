/* eslint-disable react/prop-types */
import MoneyInput from "./Inputs/MoneyInput"
import { useState } from "react"
import { useAddMoneyDelivered } from "../hooks/Supervisors/useAddMoneyDelivered"
import { useSupervisorReport } from "../hooks/Supervisors/useSupervisorReport"
import { useSelector } from "react-redux"

export default function RegistrarDineroReportado({ supervisorId, date }) {

  const { company } = useSelector((state) => state.user)
  const [inputValue, setInputValue] = useState(0.00)
  const { addMoneyDelivered } = useAddMoneyDelivered()
  const { supervisorReport } = useSupervisorReport({ supervisorId, date })


  return (
    <div className="grid grid-cols-2">
      <div className="">
        <h3 className="text-md font-bold">Dinero entregado</h3>
        <div>
          <MoneyInput onChange={(e) => { setInputValue(e) }}></MoneyInput>
          <div className="flex justify-center">
            <button className="w-10/12 p-3 bg-slate-400 mt-2 rounded-lg" onClick={() => { addMoneyDelivered({ supervisorId, companyId: company._id, amount: inputValue, date }) }}>
              {supervisorReport && supervisorReport.moneyDelivered != 0 ?
                'Guardar'
                :
                'Actualizar'
              }
            </button>
          </div>
        </div>
      </div>
      <div>

        <h3 className="text-md font-bold">Reporte de supervisor</h3>
        {supervisorReport ?
          <div>
            {supervisorReport.balance}

            <p></p>
          </div>
          : ''}
      </div>
    </div>
  )
}
