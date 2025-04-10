/* eslint-disable react/prop-types */

import { useState } from "react";
import { NavLink } from "react-router-dom"; // Import NavLink
import Modal from "./Modals/Modal";
import EmployeeBranchReports from "./EmployeeBranchReports";
import EmployeeSupervisorReports from "./EmployeeSupervisorReports";
import PhoneLinks from "./PhoneLinks";

export default function EmployeeInfo({ employee, toggleInfo }) {

  const [showEmployeeBranchReports, setShowEmployeeBranchReports] = useState(false);
  const [showEmployeeSupervisorReports, setShowEmployeeSupervisorReports] = useState(false);

  if (!employee) return null;

  const employeeRole = employee.role?._id ?? employee.role;

  const handleViewBranchAccounts = () => {
    setShowEmployeeBranchReports(true);
  };

  const handleViewSupervisorAccounts = () => {
    setShowEmployeeSupervisorReports(true);
  };

  const employeeCard = () => {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">
          <NavLink to={`/perfil/${employee._id}`} className="text-[#2B6CB0] hover:underline">
            {`${employee.name} ${employee.lastName}`}
          </NavLink>
        </h2>
        <p className="text-lg mb-2 text-gray-700">{`Rol: ${employee?.role?.name ?? 'No disponible'}`}</p>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <p className="text-lg">
            Teléfono:
          </p>
          <PhoneLinks phoneNumber={employee.phoneNumber} name={employee.name} />
        </div>
        <div className="flex flex-col gap-2">
          <button
            className="bg-[#2B6CB0] text-white py-3 px-4 rounded"
            onClick={handleViewBranchAccounts}
          >
            Ver Cuentas en Pollería
          </button>
          {employeeRole && (
            <button
              className="bg-[#2F855A] text-white py-3 px-4 rounded"
              onClick={handleViewSupervisorAccounts}
            >
              Ver Cuentas de Supervisión
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="">
      {employee && (
        <Modal
          closeModal={() => toggleInfo()}
          closeOnClickOutside={true}
          closeOnClickInside={false}
          width="4/6"
          shape="rounded-3xl"
          content={employeeCard()}
        />
      )}
      {showEmployeeBranchReports && (
        <EmployeeBranchReports employeeId={employee._id} employee={employee} toggleComponent={() => setShowEmployeeBranchReports(prev => !prev)} />
      )}
      {showEmployeeSupervisorReports && (
        <EmployeeSupervisorReports employeeId={employee._id} employee={employee} toggleComponent={() => setShowEmployeeSupervisorReports(prev => !prev)} />
      )}
    </div>
  );
}
