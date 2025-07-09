import { useState } from "react";
import EmployeeInfo from "../EmployeeInfo";


export default function EmployeeName({ employee, handleEmployeeUpdate, fullName = false }) {

  const [showInfo, setShowInfo] = useState(false);

  return (
    <div>
      <EmployeeInfo employee={employee} toggleInfo={() => setShowInfo(prev => !prev)} isShown={showInfo} handleEmployeeUpdate={handleEmployeeUpdate}/>
      <button onClick={() => setShowInfo(true)}>
        <span className="font-bold text-md flex gap-1 text-employee-name items-center hover:underline">
          {fullName ? `${employee.name} ${employee.lastName}` : employee.name}
        </span>
      </button>
    </div>
  )
}