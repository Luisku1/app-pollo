/* eslint-disable react/prop-types */
import { formatInformationDate, today } from "../helpers/DatePickerFunctions";
import { stringToCurrency } from "../helpers/Functions";

export default function SupervisorReport({supervisorReport}) {
  return (
    <div>
      <div key={supervisorReport._id} className="rounded-3xl mt-4 border shadow-md">
        <p className="text-center text-lg font-semibold"><span className="text-red-500">Fecha: </span>{`${today(supervisorReport.createdAt) ? 'hoy' : ''} ` + formatInformationDate(supervisorReport.createdAt)}</p>
        <p className="p-2"><span className="font-bold">Dinero recogido: </span>{stringToCurrency({ amount: supervisorReport.incomes })}</p>
        <p className="p-2"><span className="font-bold">Gastos: </span>{stringToCurrency({ amount: supervisorReport.extraOutgoings })}</p>
        <p className="p-2">
          <span className="font-bold">Dinero entregado: </span>{stringToCurrency({ amount: supervisorReport.moneyDelivered })}
        </p>
        <p className="p-2 font-bold">Balance: <span className={`${supervisorReport.balance < 0 ? 'text-red-700' : ''}`}>{stringToCurrency({ amount: supervisorReport.balance })}</span></p>
      </div>
    </div>
  )
}