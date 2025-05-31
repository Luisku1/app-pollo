import { useEffect, useState } from "react"
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom';
import FechaDePagina from "../components/FechaDePagina";
import { formatDate } from "../helpers/DatePickerFunctions";
import { useEmployeesPayroll } from "../hooks/Employees/useEmployeesPayroll";
import { currency } from "../helpers/Functions";
import { useRoles } from "../context/RolesContext";
import Modal from "../components/Modals/Modal";
import { useDate } from '../context/DateContext';
import EmployeePayroll from "../components/Payroll/EmployeePayroll";

export default function Nomina() {

  let paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const { company, currentUser } = useSelector((state) => state.user)
  const [selectedEmployeePayroll, setSelectedEmployeePayroll] = useState(null)
  const { employeesPayroll, updateBranchReport, updateSupervisorReport } = useEmployeesPayroll({ companyId: company._id, date: stringDatePickerValue, setSelectedEmployeePayroll })
  const { roles, isManager } = useRoles()
  const navigate = useNavigate()
  const { currentDate, setCurrentDate } = useDate()

  const changeDatePickerValue = (e) => {

    const newDate = e.target.value + 'T06:00:00.000Z';
    setCurrentDate(newDate);
    navigate('/nomina/' + newDate)

  }

  const changeDay = (date) => {
    setCurrentDate(date)
    navigate('/nomina/' + date)

  }

  useEffect(() => {
    if (stringDatePickerValue) {
      setCurrentDate(stringDatePickerValue)
    }
  }, [stringDatePickerValue])

  useEffect(() => {

    document.title = 'Nómina (' + new Date(currentDate).toLocaleDateString() + ')'
  })

  console.log(selectedEmployeePayroll, 'selectedEmployeePayroll')

  return (
    <main className="p-3 mx-auto">
      <div className="max-w-lg">
        <Modal
          closeModal={() => setSelectedEmployeePayroll(null)}
          content={
            <EmployeePayroll
              employeePayroll={selectedEmployeePayroll?.employeePayroll}
              updateBranchReportGroup={updateBranchReport}
              updateSupervisorReportGroup={updateSupervisorReport}
              employeeId={selectedEmployeePayroll?.employeePayroll?.employee?._id}
              index={selectedEmployeePayroll?.externalIndex}
            />
          }
          fit={true}
          width="11/12"
          isShown={!!selectedEmployeePayroll}
        />
      </div>
      {roles && isManager(currentUser.role) &&
        <FechaDePagina changeDay={changeDay} stringDatePickerValue={currentDate} changeDatePickerValue={changeDatePickerValue} ></FechaDePagina>
      }

      <div className='border max-w-3xl mx-auto px-10 mt-4'>
        {roles && isManager(currentUser.role) && employeesPayroll && employeesPayroll.length > 0 && employeesPayroll.map((employeePayroll, index) => {
          const { employee, branchReports, lateDiscount, supervisorReports, missingWorkDiscount, employeePaymentsAmount, adjustments = 0 } = employeePayroll
          const salary = employee?.salary ?? 0
          const accountBalance = branchReports.reduce((acc, report) => acc + (report.balance ?? 0), 0)
          const supervisorBalance = supervisorReports.reduce((acc, report) => acc + (report.balance ?? 0), 0)
          const totalToPay = accountBalance + supervisorBalance + lateDiscount + missingWorkDiscount - employeePaymentsAmount + adjustments + salary
          return (
            <div key={employeePayroll._id} className='w-full border bg-white border-black rounded-lg shadow-sm'>
              <button onClick={() => { setSelectedEmployeePayroll({ employeePayroll, externalIndex: index }) }} id='list-element' className='w-full'>
                <div className={`flex justify-between items-center  px-8`}>
                  <p
                    className="justify-self-start w-fit text-xl font-semibold my-4 shadow-sm text-employee-name rounded-lg text-left"
                  >
                    {`${employee.name} ${employee.lastName}`}
                  </p>
                  <p className={`flex justify-end my-auto border-gray-300 p-2 ${totalToPay < 0 ? 'text-red-500' : ''} font-bold border border-black shadow-sm rounded-lg w-fit`}>
                    {currency(totalToPay)}
                  </p>
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </main >
  )
}
