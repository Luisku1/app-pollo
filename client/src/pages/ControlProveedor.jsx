import { useNavigate, useParams } from "react-router-dom";
import CompraProveedor from "../components/Proveedores/CompraProveedor";
import { formatDate } from "../helpers/DatePickerFunctions";
import { useSelector } from "react-redux";
import { useEmployees } from "../hooks/Employees/useEmployees";
import { useProducts } from "../hooks/Products/useProducts";
import { useRoles } from "../context/RolesContext";

export default function ControlProveedor() {

  let paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const { currentUser, company } = useSelector((state) => state.user)
  const { employees, loading: empLoading } = useEmployees({ companyId: company._id })
  const { products, loading: prodLoading } = useProducts({ companyId: company._id })
  const { roles, loading: roleLoading } = useRoles()
  const navigate = useNavigate()

  return (
    <main className={"p-3 max-w-lg mx-auto"} >
      <CompraProveedor

      />
    </main>
  )
}
