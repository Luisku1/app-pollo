/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom';
import { formatDate, getDayRange } from '../helpers/DatePickerFunctions';
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
import { getArrayForSelects } from '../helpers/Functions';

export default function ControlSupervisor({ hideFechaDePagina = false }) {

  let paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const { currentUser, company } = useSelector((state) => state.user)
  const { employees, loading: empLoading } = useEmployees({ companyId: company._id, date: stringDatePickerValue })
  const { branches, loading: branchLoading } = useBranches({ companyId: company._id })
  const { customers, loading: custLoading } = useCustomers({ companyId: company._id })
  const { products, loading: prodLoading } = useProducts({ companyId: company._id })
  const { roles, loading: roleLoading, isManager } = useRoles()
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
        options: getArrayForSelects(branches, (branch) => branch.branch)
      },
      {
        label: 'Empleados',
        options: getArrayForSelects(employees.filter(employee => employee.withMoney), (employee) => employee.name + ' ' + employee.lastName)
      },
      {
        label: 'Clientes',
        options: getArrayForSelects(customers, (customer) => customer.name + ' ' + (customer?.lastName ?? ''))
      }
    ])

  }, [branches, customers, employees])

  const isLoading = useLoading(roleLoading, empLoading, branchLoading, custLoading, prodLoading)

  const changeDatePickerValue = (e) => {

    stringDatePickerValue = (e.target.value + 'T06:00:00.000Z')

    navigate('/supervision-diaria/' + stringDatePickerValue)

  }

  const changeDay = (date) => {

    navigate('/supervision-diaria/' + date)

  }

  useEffect(() => {

    if (hideFechaDePagina) return

    document.title = 'Supervisión (' + new Date(stringDatePickerValue).toLocaleDateString() + ')'

  }, [stringDatePickerValue, hideFechaDePagina])

  if (isLoading) {

    return <Loading></Loading>

  } else {

    return (
      <main id='supervisor-main' className={"p-3 max-w-lg mx-auto"} >
        <div>
          <div className={`w-fit mx-auto sticky ${hideFechaDePagina ? '-top-[4rem]' : 'top-16'} bg-opacity-60 bg-menu z-10 mb-2`}>
            {roles && roles.manager && isManager(currentUser.role)&& !hideFechaDePagina ?

              <FechaDePagina changeDay={changeDay} stringDatePickerValue={stringDatePickerValue} changeDatePickerValue={changeDatePickerValue} higherZ={true}></FechaDePagina>

              : ''}

          </div>
          {getDayRange(new Date(stringDatePickerValue)).bottomDate <= getDayRange(new Date()).bottomDate ?
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
            :
            <div className='flex justify-center mt-4'>
              <p className='text-red-800 font-bold text-lg'>No puedes ver información de días futuros</p>
            </div>
          }
        </div>
      </main >
    )
  }
}