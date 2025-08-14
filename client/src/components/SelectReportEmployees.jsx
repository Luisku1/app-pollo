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
  const isCurrentUserSupervisor = isSupervisor(currentUser.companyData?.[0].role);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedAssistants, setSelectedAssistants] = useState(currentAssistants || []);
  const sameData = currentReportEmployee && selectedEmployee && currentReportEmployee._id === selectedEmployee._id && (currentReportEmployee.assistants || []).length === selectedAssistants.length && (currentReportEmployee.assistants || []).every(assistant => selectedAssistants.some(selAssistant => selAssistant._id === assistant._id));

  // Primer useEffect: selecciona encargado por defecto
  useEffect(() => {
    if (!employees || employees.length === 0) return;
    if (!selectedEmployee && currentReportEmployee) {
      setSelectedEmployee({ ...currentReportEmployee, label: getEmployeeFullName(currentReportEmployee), value: currentReportEmployee._id });
      return;
    }
    if (!selectedEmployee && !currentReportEmployee) {
      setSelectedEmployee({ ...currentUser, label: getEmployeeFullName(currentUser), value: currentUser._id });
      return;
    }
  }, [selectedEmployee, currentReportEmployee, currentUser, employees]);

  // Segundo useEffect: sincroniza si cambia el encargado del reporte
  useEffect(() => {
    if (!employees || employees.length === 0) return;
    if (currentReportEmployee && selectedEmployee && currentReportEmployee._id !== selectedEmployee._id && !isSupervisor(currentUser.companyData?.[0].role)) {
      setSelectedEmployee({ ...currentReportEmployee, label: getEmployeeFullName(currentReportEmployee), value: currentReportEmployee._id });
    }
  }, [selectedEmployee, currentReportEmployee, employees]);


  useEffect(() => {
    if (!employees || employees.length === 0) return;
    if (currentAssistants && currentAssistants.length > 0) {
      const assistantsOptions = currentAssistants.map(assistant => ({
        ...assistant,
        label: getEmployeeFullName(assistant),
        value: assistant._id
      }));
      setSelectedAssistants(assistantsOptions);
    }
  }, [currentAssistants, employees]);

  return (
    <div className='w-full mt-10'>
      <div>
        <h2 className='text-xl text-center font-semibold mb-2 text-black'>{`Responsables de `}<span className='text-red-800 font-bold'>{branch.branch}🍗</span></h2>
      </div>
      <div className="mt-1 ">
        <div className='w-full'>
          <p className='w-full font-semibold text-md'>Encargado</p>
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
            value={selectedAssistants}
          />
        </div>
      </div>
      {(!currentReportEmployee || (currentReportEmployee && (currentReportEmployee?._id !== currentUser._id && isSupervisor(currentUser.companyData?.[0].role))) || (currentReportEmployee && currentReportEmployee._id === currentUser._id)) &&
        <button
          onClick={() => onRegisterEmployees(selectedEmployee, selectedAssistants)}
          className='mt-2 rounded-lg text-white text-md p-3 w-full bg-button'
        >
          {!inReport || !currentReportEmployee ? 'Asignar Personal' : 'Continuar con el Reporte'}
        </button>
      }
      {((currentReportEmployee && currentReportEmployee._id !== currentUser._id) || inReport) && (
        <button
          onClick={() => onRegisterEmployees(null, selectedAssistants)}
          className="mt-2 rounded-lg text-white text-md p-3 w-full bg-red-600 hover:bg-red-700"
        >
          No soy el encargado de la sucursal
        </button>
      )}
    </div>
  );
}