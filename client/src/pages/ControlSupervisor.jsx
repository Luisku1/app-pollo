/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom';
import { formatDate, getDayRange } from '../helpers/DatePickerFunctions';
import FechaDePagina from '../components/FechaDePagina';
import 'react-toastify/dist/ReactToastify.css';
import { useProducts } from '../hooks/Products/useProducts';
import { IoPersonSharp } from "react-icons/io5";
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
import { MdSupervisorAccount } from "react-icons/md";
import SupervisorReportCard from '../components/SupervisorReportCard';
import { useSupervisorsReportInfo } from '../hooks/Supervisors/useSupervisorsReportInfo';
import { MdCurrencyExchange } from "react-icons/md";
import { FaExchangeAlt } from "react-icons/fa";
import { GiChicken } from "react-icons/gi";
import { useDate } from '../context/DateContext';

export default function ControlSupervisor({ hideFechaDePagina = false }) {

  let paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const { currentUser, company } = useSelector((state) => state.user)
  const { activeEmployees: employees, loading: empLoading } = useEmployees({ companyId: company._id })
  const { branches, loading: branchLoading } = useBranches({ companyId: company._id })
  const { customers, loading: custLoading } = useCustomers({ companyId: company._id })
  const { products, loading: prodLoading } = useProducts({ companyId: company._id })
  const { roles, loading: roleLoading, isManager, isSupervisor } = useRoles()
  const navigate = useNavigate()
  const [branchAndCustomerSelectOptions, setBranchAndCustomerSelectOptions] = useState([])
  const [selectedSection, setSelectedSection] = useState(null)
  const { employeesDailyBalances } = useEmployeesDailyBalances({ companyId: company._id, date: stringDatePickerValue })
  const {
    supervisorsInfo,
    replaceSupervisorReport: replaceReport,
  } = useSupervisorsReportInfo({ companyId: company._id, date: stringDatePickerValue })
  const { currentDate, setCurrentDate } = useDate()

  const handleShowSections = (section) => {

    setSelectedSection(section)
  }

  const isLoading = useLoading(roleLoading, empLoading, branchLoading, custLoading, prodLoading)

  const changeDatePickerValue = (e) => {
    const newDate = e.target.value + 'T06:00:00.000Z';
    setCurrentDate(newDate);
    navigate('/supervision-diaria/' + newDate);
  };

  const changeDay = (date) => {
    setCurrentDate(date);
    navigate('/supervision-diaria/' + date);
  };

  useEffect(() => {
    if (stringDatePickerValue) {
      setCurrentDate(stringDatePickerValue)
    } else {
      setCurrentDate(formatDate(new Date()))
    }
  }, [stringDatePickerValue])

  useEffect(() => {

    if (hideFechaDePagina) return

    document.title = 'Supervisión (' + new Date(currentDate).toLocaleDateString() + ')'

  }, [currentDate, hideFechaDePagina])

  if (isLoading) {

    return <Loading></Loading>

  } else {

    return (
      <main id='supervisor-main' className={"p-3 max-w-lg mx-auto"} >
        <div>
          <div className={`w-fit mx-auto sticky ${hideFechaDePagina ? '-top-[4rem]' : 'top-16'} bg-opacity-60 bg-menu z-10 mb-2`}>
            {isManager(currentUser.role) && !hideFechaDePagina ?
              <FechaDePagina changeDay={changeDay} stringDatePickerValue={currentDate} changeDatePickerValue={changeDatePickerValue} higherZ={true}></FechaDePagina>
              : ''}
          </div>
          {getDayRange(new Date(currentDate)).bottomDate <= getDayRange(new Date()).bottomDate ?
            <SectionsMenu
              handleShowSections={handleShowSections}
              selectedSection={selectedSection}
              setSelectedSection={setSelectedSection}
              sections={
                [
                  {
                    label: 'Entradas y Salidas',
                    button: (
                      <div className='flex justify-center gap-1'>
                        <FaExchangeAlt className='justify-self-center text-2xl' />
                        <GiChicken className='justify-self-center text-2xl' />
                      </div>
                    ),
                    component: <InputsAndOutputs
                      companyId={company._id}
                      date={currentDate}
                      roles={roles}
                      currentUser={currentUser}
                      products={products}
                      branchAndCustomerSelectOptions={branchAndCustomerSelectOptions}
                    />
                  },
                  {
                    label: 'Efectivos y Gastos',
                    button: (
                      <MdCurrencyExchange className='justify-self-center text-2xl' />
                    ),
                    component: <IncomesAndOutgoings />
                  },
                  {
                    label: 'Empleados',
                    button: (
                      <IoPersonSharp className='justify-self-center text-2xl' />
                    ),
                    component: <Employees dailyBalances={employeesDailyBalances} employees={employees} companyId={company._id} date={currentDate} />
                  },
                  {
                    label: 'Supervisores',
                    button: (
                      <MdSupervisorAccount className='justify-self-center text-2xl' />
                    ),
                    component: <div className="my-1 border border-slate-500 border-spacing-4 p-2 bg-white z-5 rounded-lg mb-5">
                      {supervisorsInfo.filter((report) => isManager(currentUser.role) || report.supervisor._id == currentUser._id).map((supervisorReport) => (
                        <SupervisorReportCard
                          key={supervisorReport._id}
                          supervisorReport={supervisorReport}
                          replaceReport={replaceReport}
                        />
                      ))}
                    </div>
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