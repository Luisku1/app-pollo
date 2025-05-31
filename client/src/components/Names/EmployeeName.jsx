import { useState } from "react";
import EmployeeInfo from "../EmployeeInfo";


export default function EmployeeName({ employee }) {

  const [showInfo, setShowInfo] = useState(false);

  return (
    <div>
      <EmployeeInfo employee={employee} toggleInfo={() => setShowInfo(prev => !prev)} isShown={showInfo} />
      <button onClick={() => setShowInfo(true)}>
        <span className="font-bold text-md flex gap-1 text-employee-name items-center hover:underline">
          {employee.name}
        </span>
      </button>
    </div>
  )
}