/* eslint-disable react/prop-types */
import { formatInformationDate, isToday } from "../helpers/DatePickerFunctions";
import { stringToCurrency } from "../helpers/Functions";

export default function SupervisorReport({supervisorReport}) {
  return (
    <div>
      <div key={supervisorReport._id} className="rounded-3xl mt-4 border shadow-md">
        <p className="text-center text-lg font-semibold"><span className="text-red-500">Fecha: </span>{`${isToday(supervisorReport.createdAt) ? 'hoy' : ''} ` + formatInformationDate(supervisorReport.createdAt)}</p>
        <p className="p-2"><span className="font-bold">Dinero recogido: </span>{stringToCurrency({ amount: supervisorReport.incomes })}</p>
        <p className="p-2"><span className="font-bold">Gastos: </span>{stringToCurrency({ amount: supervisorReport.extraOutgoings })}</p>
        <p className="p-2">
          <span className="font-bold">Efectivo verificado: </span>{stringToCurrency({ amount: supervisorReport.verifiedCash || 0 })}
        </p>
        <p className="p-2">
          <span className="font-bold">Depósitos verificados: </span>{stringToCurrency({ amount: supervisorReport.verifiedDeposits || 0 })}
        </p>
        <p className="p-2 font-bold">Balance: <span className={`${supervisorReport.balance < 0 ? 'text-red-700' : ''}`}>{stringToCurrency({ amount: supervisorReport.balance })}</span></p>
      </div>
    </div>
  )
}