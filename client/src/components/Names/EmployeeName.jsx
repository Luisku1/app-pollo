import { useState } from "react";
import EmployeeInfo from "../EmployeeInfo";


export default function EmployeeName({ employee, handleEmployeeUpdate, fullName = false, assistant = false }) {

  const [showInfo, setShowInfo] = useState(false);
  const handleClick = (e) => {
    e.stopPropagation();
    setShowInfo(prev => !prev);
  }

  return (
    <div>
      <EmployeeInfo employee={employee} toggleInfo={() => setShowInfo(prev => !prev)} isShown={showInfo} handleEmployeeUpdate={handleEmployeeUpdate}/>
      <button onClick={handleClick}>
        <span className="font-bold text-md flex gap-1 text-employee-name items-center hover:underline">
          {fullName ? `${employee.name} ${employee.lastName}` : employee.name}
        </span>
      </button>
    </div>
  )
}