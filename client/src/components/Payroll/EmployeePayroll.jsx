import { useState } from "react"
import EmployeeInfo from "../EmployeeInfo"
import PayrollResume from "./PayrollResume"

export default function EmployeePayroll({
  employeePayroll,
  updateBranchReportGroup, // (employeeId, report)
  updateBranchReportSingle, // (report)
  updateSupervisorReportGroup, // (employeeId, report)
  updateSupervisorReportSingle, // (report)
}) {

  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const { employee } = employeePayroll


  return (
    <div key={employeePayroll._id} className=' w-fit items-center border border-black rounded-lg shadow-sm'>
      <EmployeeInfo
        employee={selectedEmployee}
        toggleInfo={() => setSelectedEmployee(null)}
      />
      <div id='list-element' className=' p-2'>
        <div id="header" className="max-w-lf mt-1 mb-2 border-b border-black shadow-sm text-center">
          <div className="w-full">
            <div className="w-full">
              <p
                className="justify-self-start w-fit text-2xl font-semibold my-4 shadow-sm text-employee-name hover:underline rounded-lg cursor-pointer text-left"
                onClick={() => setSelectedEmployee(employee)}
              >
                {`${employee.name} ${employee.lastName}`}
              </p>
            </div>
            <PayrollResume
              employeePayroll={employeePayroll}
              updateSupervisorReportGroup={updateSupervisorReportGroup}
              updateSupervisorReportSingle={updateSupervisorReportSingle}
              updateBranchReportGroup={updateBranchReportGroup}
              updateBranchReportSingle={updateBranchReportSingle}
            />
          </div>
        </div>
        <div className="col-span-12 mt-4 p-2 bg-button text-white rounded-lg mx-2">
          <button className="w-full">Liberar nómina</button>
        </div>
      </div>
    </div>
  )
}