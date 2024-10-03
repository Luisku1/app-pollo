/* eslint-disable react/prop-types */
import Entradas from "./Entradas/Entradas";
import Salidas from "./Salidas/Salidas";

export default function EntradasYSalidas({ products, branchAndCustomerSelectOptions, date, roles }) {

  return (
    <div>
      < Salidas products={products} branchAndCustomerSelectOptions={branchAndCustomerSelectOptions} date={date} roles={roles}></Salidas>

      <Entradas products={products} branchAndCustomerSelectOptions={branchAndCustomerSelectOptions} date={date} roles={roles}></Entradas>
    </div>
  )
}
