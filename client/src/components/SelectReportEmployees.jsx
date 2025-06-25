import { useSelector } from "react-redux";
import { getArrayForSelects, getEmployeeFullName } from "../helpers/Functions";
import EmployeesSelect from "./Select/EmployeesSelect";
import Select from "react-select";
import { useRoles } from "../context/RolesContext";
import { customSelectStyles } from "../helpers/Constants";

export const SelectReportEmployees = ({ employees, employee, branch, onRegisterEmployees, onChangeAssistants, onChangeEmployee, selectedAssistants }) => {

  const { currentUser } = useSelector((state) => state.user);
  const { isSupervisor } = useRoles();

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
              isEditing={isSupervisor(currentUser.role)}
              employees={employees}
              selectedEmployee={employee}
              handleEmployeeSelectChange={onChangeEmployee}
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
              onChangeAssistants(options);
            }}
            styles={customSelectStyles}
            placeholder={'Selecciona auxiliares'}
          />
        </div>
      </div>
      <button
        onClick={() => onRegisterEmployees(employee, selectedAssistants)}
        className='mt-2 rounded-lg text-white text-md p-3 w-full bg-button'
      >
        Asignar personal
      </button>
      {!employee && (
        <button
          onClick={() => onRegisterEmployees(null, selectedAssistants)}
        >
          No soy el encargado de la sucursal
        </button>
      )}
    </div>
  );
}