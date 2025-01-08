import { useParams } from "react-router-dom";
import MenuProveedor from "../components/Proveedores/MenuProveedor";
import { formatDate } from "../helpers/DatePickerFunctions";
import useProvidersPurchases from "../hooks/Providers/useProvidersPurchases";

export default function ControlProveedor() {

  let paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const {purchases} = useProvidersPurchases({date: stringDatePickerValue})

  return (
    <div>
      <h1>Control de Proveedor</h1>
      <MenuProveedor
        date={stringDatePickerValue}
      />
    </div>
  );
}
