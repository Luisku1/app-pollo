/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { formatDate, getDayRange } from '../helpers/DatePickerFunctions';
import 'react-toastify/dist/ReactToastify.css';
import { IoPersonSharp } from "react-icons/io5";
import { useRoles } from '../context/RolesContext'
import Employees from '../components/SupervisorSections/Employees';
import IncomesAndOutgoings from '../components/SupervisorSections/IncomesAndOutgoings';
import InputsAndOutputs from '../components/SupervisorSections/InputsAndOutputs';
import SectionsMenu from '../components/SectionsMenu';
import { MdSupervisorAccount } from "react-icons/md";
import SupervisorReportCard from '../components/SupervisorReportCard';
import { useSupervisorsReportInfo } from '../hooks/Supervisors/useSupervisorsReportInfo';
import { MdCurrencyExchange } from "react-icons/md";
import { FaExchangeAlt } from "react-icons/fa";
import { GiChicken } from "react-icons/gi";
import { useDateNavigation } from '../hooks/useDateNavigation';

export default function ControlSupervisor({ hideFechaDePagina = false }) {

  const { currentUser, company } = useSelector((state) => state.user)
  const { isManager } = useRoles()
  const [selectedSection, setSelectedSection] = useState(null)
  const { currentDate, dateFromYYYYMMDD } = useDateNavigation()
  const {
    supervisorsInfo,
    replaceSupervisorReport: replaceReport,
  } = useSupervisorsReportInfo({ companyId: company._id, date: currentDate })

  const handleShowSections = (section) => {

    setSelectedSection(section)
  }

  useEffect(() => {

    if (hideFechaDePagina) return

    document.title = 'Supervisión (' + dateFromYYYYMMDD.toLocaleDateString() + ')'

  }, [currentDate, hideFechaDePagina])

  return (
    <main id='supervisor-main' className={"p-3 max-w-lg mx-auto"} >
      <div>
        {getDayRange(dateFromYYYYMMDD).bottomDate <= getDayRange(new Date()).bottomDate ?
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
                  component: <InputsAndOutputs />
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
                  component: <Employees />
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