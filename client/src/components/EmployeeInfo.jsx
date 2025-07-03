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
import { weekDays } from "../helpers/Constants";
import { FaEdit } from "react-icons/fa";
import RegistroEmpleadoNuevo from "../pages/RegistroEmpleado";
import PortatilEmployeePayroll from "./Payroll/PortatilEmployeePayroll";

export default function EmployeeInfo({ employee, toggleInfo, isShown, handleEmployeeUpdate }) {

  const { currentUser } = useSelector((state) => state.user);
  const [showEmployeeBranchReports, setShowEmployeeBranchReports] = useState(false);
  const [showEmployeeSupervisorReports, setShowEmployeeSupervisorReports] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [showPayroll, setShowPayroll] = useState(false);
  const { isSupervisor, isManager } = useRoles();
  const [employeeToEdit, setEmployeeToEdit] = useState(null);

  if (!employee) return null;

  const employeeRole = employee.role?._id ?? employee.role;

  const onUpdate = (updatedEmployee) => {
    setEmployeeToEdit(null);
    handleEmployeeUpdate(updatedEmployee);
  }

  const handleViewBranchAccounts = () => {
    setShowEmployeeBranchReports(true);
  };

  const handleViewSupervisorAccounts = () => {
    setShowEmployeeSupervisorReports(true);
  };

  const handleViewPayments = () => {
    setShowPayments(true);
  };

  const toggleEditEmployee = () => {

    setEmployeeToEdit(employee)
  }

  const togglePayroll = () => {
    setShowPayroll((prev) => !prev);
  };

  const employeeCard = () => {
    return (
      <div className={"p-2"}>
        <h2 className="text-xl font-bold mb-4 flex justify-evenly gap-2 items-center">
          {isSupervisor(currentUser.role) ? (
            <NavLink to={`/perfil/${employee._id}`} className="text-[#2B6CB0] hover:underline">
              {`${employee.name} ${employee.lastName}`}
            </NavLink>
          ) : (
            <span className="text-gray-700">{`${employee.name} ${employee.lastName}`}</span>
          )}
          {isManager(currentUser.role) && (
            <button className="" onClick={toggleEditEmployee}>
              <FaEdit className="text-blue-500" />
            </button>
          )}
        </h2>
        <p className="text-lg">{`Día de cobro: `} <span className={`font-semibold ${(new Date()).getDay() == (new Date()).getDay() ? 'text-red-600 font-bold' : ''}`}>{weekDays[employee.payDay]}</span></p>
        <p className="text-lg mb-2 text-gray-700">{`Rol: `}<span className="font-semibold">{employee?.role?.name ?? 'No disponible'}</span></p>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <p className="text-lg">
            Teléfono:
          </p>
          <PhoneLinks phoneNumber={employee.phoneNumber} name={employee.name} />
        </div>
        <div className="flex flex-col gap-2">
          {isManager(currentUser.role) && (
            <button
              className="bg-[#805AD5] text-white py-3 px-4 rounded"
              onClick={togglePayroll}
            >
              Nómina
            </button>
          )}
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
      <Modal
        closeModal={() => toggleInfo()}
        closeOnClickOutside={true}
        closeOnClickInside={false}
        closeOnEsc={true}
        width="4/6"
        shape="rounded-3xl"
        isShown={isShown}
        content={employeeCard()}
      />

      <Modal
        content={<RegistroEmpleadoNuevo setEmployee={onUpdate} employee={employeeToEdit} />}
        closeModal={() => setEmployeeToEdit(null)}
        ableToClose={true}
        isShown={employeeToEdit}
      />
      {showEmployeeBranchReports && (
        <EmployeeBranchReports employeeId={employee._id} employee={employee} toggleComponent={() => setShowEmployeeBranchReports(prev => !prev)} />
      )}
      {showEmployeeSupervisorReports && isSupervisor(currentUser.role) && (
        <EmployeeSupervisorReports employeeId={employee._id} employee={employee} toggleComponent={() => setShowEmployeeSupervisorReports(prev => !prev)} />
      )}
      {showPayments && (
        <EmployeePayments employeeId={employee._id} employee={employee} toggleComponent={() => setShowPayments(prev => !prev)} />
      )}
      {showPayroll && (
        <Modal
          closeModal={() => setShowPayroll(false)}
          closeOnClickOutside={true}
          closeOnClickInside={false}
          closeOnEsc={true}
          width="4/6"
          shape="rounded-3xl"
          isShown={showPayroll}
          content={<PortatilEmployeePayroll employee={employee} />}
        />
      )}
    </div>
  );
}
