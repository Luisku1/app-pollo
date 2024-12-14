/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom';
import { formatDate } from '../helpers/DatePickerFunctions';
import FechaDePagina from '../components/FechaDePagina';
import 'react-toastify/dist/ReactToastify.css';
import { useProducts } from '../hooks/Products/useProducts';
import { useLoading } from '../hooks/loading';
import { useEmployees } from '../hooks/Employees/useEmployees';
import { useBranches } from '../hooks/Branches/useBranches';
import { useCustomers } from '../hooks/Customers/useCustomers';
import Loading from '../components/Loading';
import { useRoles } from '../context/RolesContext'
import Employees from '../components/SupervisorSections/Employees';
import IncomesAndOutgoings from '../components/SupervisorSections/IncomesAndOutgoings';
import InputsAndOutputs from '../components/SupervisorSections/InputsAndOutputs';
import SectionsMenu from '../components/SectionsMenu';
import { useEmployeesDailyBalances } from '../hooks/Employees/useEmployeesDailyBalances';

export default function ControlSupervisor() {

  let paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const { currentUser, company } = useSelector((state) => state.user)
  const { employees, loading: empLoading } = useEmployees({ companyId: company._id })
  const { branches, loading: branchLoading } = useBranches({ companyId: company._id })
  const { customers, loading: custLoading } = useCustomers({ companyId: company._id })
  const { products, loading: prodLoading } = useProducts({ companyId: company._id })
  const { roles, loading: roleLoading } = useRoles()
  const navigate = useNavigate()
  const [branchAndCustomerSelectOptions, setBranchAndCustomerSelectOptions] = useState([])
  const [selectedSection, setSelectedSection] = useState(null)
  const { employeesDailyBalances } = useEmployeesDailyBalances({ companyId: company._id, date: stringDatePickerValue })

  const handleShowSections = (section) => {

    setSelectedSection(section)
  }

  useEffect(() => {

    setBranchAndCustomerSelectOptions([
      {
        label: 'Sucursales',
        options: branches
      },
      {
        label: 'Clientes',
        options: customers
      }])

  }, [branches, customers])

  const isLoading = useLoading(roleLoading, empLoading, branchLoading, custLoading, prodLoading)

  const changeDatePickerValue = (e) => {

    stringDatePickerValue = (e.target.value + 'T06:00:00.000Z')

    navigate('/supervision-diaria/' + stringDatePickerValue)

  }

  const changeDay = (date) => {

    navigate('/supervision-diaria/' + date)

  }

  useEffect(() => {

    document.title = 'Supervisión (' + new Date(stringDatePickerValue).toLocaleDateString() + ')'

  }, [stringDatePickerValue])

  if (isLoading) {

    return <Loading></Loading>

  } else {

    return (

      <main id='supervisor-main' className={"p-3 max-w-lg mx-auto"} >
        <div>
          {roles && roles.managerRole && roles.managerRole._id == currentUser.role ?

            <FechaDePagina changeDay={changeDay} stringDatePickerValue={stringDatePickerValue} changeDatePickerValue={changeDatePickerValue} ></FechaDePagina>

            : ''}

          <h1 className='text-3xl text-center font-semibold mt-7 '>
            Supervisión
          </h1>

          <SectionsMenu
            handleShowSections={handleShowSections}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            sections={
              [
                {
                  label: 'Entradas y Salidas',
                  component: <InputsAndOutputs
                    companyId={company._id}
                    date={stringDatePickerValue}
                    roles={roles}
                    currentUser={currentUser}
                    products={products}
                    branchAndCustomerSelectOptions={branchAndCustomerSelectOptions}
                  />
                },
                {
                  label: 'Efectivos y Gastos',
                  component: <IncomesAndOutgoings
                    date={stringDatePickerValue}
                    companyId={company._id}
                    currentUser={currentUser}
                    roles={roles}
                    branches={branches} branchAndCustomerSelectOptions={branchAndCustomerSelectOptions}
                    employees={employees}
                  />
                },
                {
                  label: 'Empleados',
                  component: <Employees dailyBalances={employeesDailyBalances} employees={employees} companyId={company._id} date={stringDatePickerValue} />
                }
              ]
            }
          />
        </div>
      </main >
    )
  }
}