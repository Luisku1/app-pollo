/* eslint-disable react/prop-types */

import { useState } from "react";
import { NavLink } from "react-router-dom"; // Import NavLink
import Modal from "./Modals/Modal";
import EmployeeBranchReports from "./EmployeeBranchReports";
import EmployeeSupervisorReports from "./EmployeeSupervisorReports";
import PhoneLinks from "./PhoneLinks";
import EmployeePayments from "./EmployeePayments";
import { useRoles } from "../context/RolesContext";
import { useSelector } from "react-redux";

export default function EmployeeInfo({ employee, toggleInfo }) {

  const { currentUser } = useSelector((state) => state.user);
  const [showEmployeeBranchReports, setShowEmployeeBranchReports] = useState(false);
  const [showEmployeeSupervisorReports, setShowEmployeeSupervisorReports] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const { isSupervisor } = useRoles();

  if (!employee) return null;

  const employeeRole = employee.role?._id ?? employee.role;

  const handleViewBranchAccounts = () => {
    setShowEmployeeBranchReports(true);
  };

  const handleViewSupervisorAccounts = () => {
    setShowEmployeeSupervisorReports(true);
  };

  const handleViewPayments = () => {
    setShowPayments(true);
  }

  const employeeCard = () => {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">
          {isSupervisor(currentUser.role) ? (
            <NavLink to={`/perfil/${employee._id}`} className="text-[#2B6CB0] hover:underline">
              {`${employee.name} ${employee.lastName}`}
            </NavLink>
          ) : (
            <span className="text-gray-700">{`${employee.name} ${employee.lastName}`}</span>
          )}
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
            className="bg-[#3182CE] text-white py-3 px-4 rounded"
            onClick={handleViewPayments}
          >
            Ver Pagos
          </button>
          <button
            className="bg-[#2B6CB0] text-white py-3 px-4 rounded"
            onClick={handleViewBranchAccounts}
          >
            Ver Cuentas en Pollería
          </button>
          {isSupervisor(employeeRole) && isSupervisor(currentUser.role) && (
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
    <div className="text-base">
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
      {showEmployeeSupervisorReports && is && (
        <EmployeeSupervisorReports employeeId={employee._id} employee={employee} toggleComponent={() => setShowEmployeeSupervisorReports(prev => !prev)} />
      )}
      {showPayments && (
        <EmployeePayments employeeId={employee._id} employee={employee} toggleComponent={() => setShowPayments(prev => !prev)} />
      )}
    </div>
  );
}
