import { useEffect, useState } from "react"
import { useSelector } from 'react-redux'
import { useEmployeesPayroll } from "../hooks/Employees/useEmployeesPayroll";
import { currency } from "../helpers/Functions";
import { useRoles } from "../context/RolesContext";
import Modal from "../components/Modals/Modal";
import EmployeePayroll from "../components/Payroll/EmployeePayroll";
import { useDateNavigation } from "../hooks/useDateNavigation";

export default function Nomina() {

  const { currentDate, dateFromYYYYMMDD } = useDateNavigation();
  const { company, currentUser } = useSelector((state) => state.user)
  const [selectedEmployeePayroll, setSelectedEmployeePayroll] = useState(null)
  const { employeesPayroll, updateBranchReport, updateSupervisorReport, loading } = useEmployeesPayroll({ companyId: company._id, date: currentDate, setSelectedEmployeePayroll })
  const { roles, isManager } = useRoles()

  useEffect(() => {

    document.title = 'Nómina (' + dateFromYYYYMMDD.toLocaleDateString('es-MX') + ')'
  })

  if (loading) {
    return (
      <div className="fixed left-0 right-0 top-16 bottom-0 z-30 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm transition-all animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 border-8 border-gray-200 border-t-gray-500 rounded-full animate-spin shadow-lg"></div>
          <span className="text-xl font-bold text-gray-700 animate-pulse">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!employeesPayroll || employeesPayroll.length === 0) {
    return (
      <main className="p-3 w-full mx-auto">
        <div className="">
          <div className="text-center text-gray-500 mt-10">
            <h2 className="text-2xl font-semibold">No hay nómina registrada para el {dateFromYYYYMMDD.toLocaleDateString('es-Mx', { weekday: 'long' })}</h2>
            <p className="mt-4">Verifica tu lista de empleados.</p>
          </div>
        </div>
      </main>
    )
  }

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
          isShown={!!selectedEmployeePayroll}
        />
      </div>
      <div className='border max-w-3xl mx-auto px-10 mt-4'>
        {roles && isManager(currentUser.companyData?.[0].role) && employeesPayroll && employeesPayroll.length > 0 && employeesPayroll.map((employeePayroll, index) => {
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
                    {employee &&
                      <>
                        {`${employee.name} ${employee.lastName}`}
                      </>}
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
