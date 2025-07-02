import { useSelector } from "react-redux";
import { getArrayForSelects, getEmployeeFullName } from "../helpers/Functions";
import EmployeesSelect from "./Select/EmployeesSelect";
import Select from "react-select";
import { useRoles } from "../context/RolesContext";
import { customSelectStyles } from "../helpers/Constants";
import { useEffect, useState } from "react";

export const SelectReportEmployees = ({ employees, currentReportEmployee, branch, onRegisterEmployees, currentAssistants, inReport = false }) => {

  const { currentUser } = useSelector((state) => state.user);
  const { isSupervisor } = useRoles();
  const isCurrentUserSupervisor = isSupervisor(currentUser.role);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedAssistants, setSelectedAssistants] = useState(currentAssistants || []);

  useEffect(() => {

    if (!employees.length > 0) return
    if (selectedEmployee) return

    setSelectedEmployee(currentReportEmployee ? currentReportEmployee : { ...currentUser, label: getEmployeeFullName(currentUser), value: currentUser._id });

  }, [currentReportEmployee, employees, currentUser])

  return (
    <div className='w-full mt-10'>
      <div>
        <h2 className='text-xl text-center font-semibold mb-4 text-black'>{`Responsables de `}<span className='text-red-800 font-bold'>{branch.branch}🍗</span></h2>
      </div>
      <div className="mt-1 ">
        <div className='w-full'>
          <p className='w-full font-semibold'>Encargado</p>
          <div className='p-3'>
            <EmployeesSelect
              defaultLabel={'Sin Encargado'}
              isEditing={isCurrentUserSupervisor}
              employees={employees}
              selectedEmployee={selectedEmployee}
              handleEmployeeSelectChange={setSelectedEmployee}
            />
          </div>
        </div>
      </div>
      <div className="mt-1">
        <p className='w-full font-semibold'>Auxiliares</p>
        <div className='p-3'>
          <Select
            isMulti={true}
            options={getArrayForSelects(employees, (employee) => getEmployeeFullName(employee))}
            onChange={(options) => {
              setSelectedAssistants(options);
            }}
            styles={customSelectStyles}
            placeholder={'Selecciona auxiliares'}
          />
        </div>
      </div>
      {!currentReportEmployee || (currentReportEmployee && (currentReportEmployee?._id !== currentUser._id && isSupervisor(currentUser.role))) &&

        <button
          onClick={() => onRegisterEmployees(selectedEmployee, selectedAssistants)}
          className='mt-2 rounded-lg text-white text-md p-3 w-full bg-button'
        >
          {!inReport ? 'Asignar Personal' : 'Continuar con el Reporte'}
        </button>
      }
      {(currentReportEmployee && currentReportEmployee._id !== currentUser._id) || !inReport && (
        <button
          onClick={() => onRegisterEmployees(null, selectedAssistants)}
        >
          No soy el encargado de la sucursal
        </button>
      )}
    </div>
  );
}