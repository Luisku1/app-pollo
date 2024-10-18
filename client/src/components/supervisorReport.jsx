/* eslint-disable react/prop-types */
import { formatInformationDate } from "../helpers/DatePickerFunctions";
import { stringToCurrency } from "../helpers/Functions";

export default function SupervisorReport({supervisorReport}) {
  return (
    <div>
      <div key={supervisorReport._id} className="rounded-lg mt-4 border border-black shadow-md">
        <p className="text-center font-bold"><span className="text-red-600 font-bold">Fecha: </span>{formatInformationDate(supervisorReport.createdAt)}</p>
        <p className="p-2"><span className="font-bold">Dinero a entregar: </span>{stringToCurrency({ amount: supervisorReport.incomes - supervisorReport.extraOutgoings })}</p>
        <p className="p-2">
          <span className="font-bold">Dinero entregado: </span>{stringToCurrency({ amount: supervisorReport.moneyDelivered })}
        </p>
        <p className="p-2 font-bold">Balance: <span className={`${supervisorReport.balance < 0 ? 'text-red-700' : ''}`}>{stringToCurrency({ amount: supervisorReport.balance })}</span></p>
      </div>
    </div>
  )
}
