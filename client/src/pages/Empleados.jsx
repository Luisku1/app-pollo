import { useCallback, useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { weekDays } from "../helpers/Constants"
import { FaEdit, FaTrash } from "react-icons/fa";
import { useEmployees } from "../hooks/Employees/useEmployees";
import { useDeleteEmployee } from "../hooks/Employees/useDeleteEmployee";
import SearchBar from "../components/SearchBar";
import { getEmployeeFullName } from "../helpers/Functions";
import Modal from "../components/Modals/Modal";
import RegistroEmpleadoNuevo from "./RegistroEmpleado";
import { CgProfile } from "react-icons/cg";
import EmployeeInfo from "../components/EmployeeInfo";
import PhoneLinks from "../components/PhoneLinks";
import { getDateDay } from "../helpers/DatePickerFunctions";

export default function Empleados() {

  const { company } = useSelector((state) => state.user)
  const { employees, activeEmployees, inactiveEmployees, setFilterString, changeEmployeeActiveStatus, onUpdateEmployee, spliceEmployee, loading, error } = useEmployees({ companyId: company._id })
  const { deleteEmployee } = useDeleteEmployee()
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [buttonId, setButtonId] = useState(null)
  const searchBarRef = useRef(null);
  const [showActiveEmployees, setShowActiveEmployees] = useState(true)
  const [showPayDayEmployees, setShowPayDayEmployees] = useState(false);
  const [searching, setSearching] = useState(false)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [employeeToEdit, setEmployeeToEdit] = useState(null)

  const handleEmployeeUpdate = (employee) => {

    onUpdateEmployee(employee)
    if (selectedEmployee && selectedEmployee._id === employee._id) {

      setSelectedEmployee(employee)
    }
    setEmployeeToEdit(null)
  }

  const handleChangeEmployeeStatus = (employee) => {

    changeEmployeeActiveStatus({ employee })
  }

  const handleSearchBarChange = (value) => {

    setFilterString(value)
  }

  const handleMouseEnter = useCallback((value) => {

    if (isTouchDevice) return

    setHoveredIndex(value)

  }, [isTouchDevice])

  const handleMouseLeave = useCallback(() => {

    setHoveredIndex(null)

  }, [])

  // Manejar el atajo de teclado Ctrl + F para hacer focus en la barra de búsqueda
  useEffect(() => {

    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        setSearching(true)
        searchBarRef.current.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };

  }, []);

  const stopSearching = () => {

    setSearching(false)
  }

  useEffect(() => {

    document.title = 'Empleados'
  }, [])

  const filteredEmployees = searching
    ? employees
    : showPayDayEmployees
      ? activeEmployees.filter(employee => employee.payDay === getDateDay(new Date()))
      : showActiveEmployees
        ? activeEmployees
        : inactiveEmployees;

  // Modern table/grid for employees
  return (
    <main className="p-3 max-w-5xl mx-auto">
      <Modal
        content={<RegistroEmpleadoNuevo setEmployee={handleEmployeeUpdate} employee={employeeToEdit} />}
        closeModal={() => setEmployeeToEdit(null)}
        ableToClose={true}
        isShown={employeeToEdit}
      />
      {error ? <p>{error}</p> : ''}
      <EmployeeInfo employee={selectedEmployee} handleEmployeeUpdate={handleEmployeeUpdate} toggleInfo={() => setSelectedEmployee(null)} />
      <div className="bg-white rounded-lg mb-4">
        <div className="grid grid-cols-3 border w-full mt-4 mb-4 rounded-lg">
          <button
            className={"h-full rounded-lg hover:shadow-xl p-3 border border-black text-white font-bold " + (showActiveEmployees && !searching && !showPayDayEmployees ? 'bg-green-600 opacity-85' : 'bg-green-600 opacity-40')}
            onClick={() => {
              setShowActiveEmployees(true);
              setShowPayDayEmployees(false);
              stopSearching();
            }}
          >
            Empleados Activos
          </button>
          <button
            className={"h-full rounded-lg hover:shadow-xl p-3 border border-black text-white font-bold " + (showPayDayEmployees && !searching ? 'bg-blue-600 opacity-85' : 'bg-blue-600 opacity-40')}
            onClick={() => {
              setShowPayDayEmployees(true);
              setShowActiveEmployees(false);
              stopSearching();
            }}
          >
            Día de Cobro
          </button>
          <button
            className={"h-full rounded-lg hover:shadow-xl p-3 border border-black text-white font-bold " + (!showActiveEmployees && !searching && !showPayDayEmployees ? 'bg-red-700 opacity-85' : 'bg-red-700 opacity-40')}
            onClick={() => {
              setShowActiveEmployees(false);
              setShowPayDayEmployees(false);
              stopSearching();
            }}
          >
            Empleados Inactivos
          </button>
        </div>
      </div>
      <div className="w-full bg-white p-3 border rounded-lg sticky top-16 z-10 mb-4">
        <div className="border rounded-lg flex items-center w-full">
          <SearchBar ref={searchBarRef} handleFilterTextChange={handleSearchBarChange} placeholder={'Busca a tus empleados (CTRL + f)'}></SearchBar>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl shadow-md bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 uppercase text-xs text-gray-700">
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left hidden md:table-cell">Rol</th>
              <th className="px-3 py-2 text-center hidden md:table-cell">Balance</th>
              <th className="px-3 py-2 text-center hidden lg:table-cell">Sueldo</th>
              <th className="px-3 py-2 text-center hidden lg:table-cell">Día de cobro</th>
              <th className="px-3 py-2 text-center">Teléfono</th>
              <th className="px-3 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee, index) => (
              <tr
                key={employee._id}
                onClick={(e) => {
                  if (!e.target.closest('.actions-column')) {
                    setSelectedEmployee(employee);
                  }
                }}
                className={`transition hover:bg-blue-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-3 py-2 text-left font-bold text-blue-900">
                  <div className="flex items-center gap-2">
                    <CgProfile className="inline-block text-2xl text-blue-400" />
                    {getEmployeeFullName(employee)}
                  </div>
                </td>
                <td className="px-3 py-2 text-left hidden md:table-cell">{employee.role?.name}</td>
                <td className={`px-3 py-2 text-center hidden md:table-cell font-semibold ${employee.balance < 0 ? 'text-red-600' : 'text-green-700'}`}>{parseFloat(employee.balance).toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</td>
                <td className="px-3 py-2 text-center hidden lg:table-cell">{employee.salary ? parseFloat(employee.salary).toLocaleString("es-MX", { style: 'currency', currency: 'MXN' }) : '-'}</td>
                <td className={`px-3 py-2 text-center ${employee.payDay === getDateDay(new Date()) ? 'text-red-600 font-bold' : ''} hidden lg:table-cell`}>{employee.payDay > -1 ? weekDays[employee.payDay] : '-'}</td>
                <td className="px-3 py-2 text-center cursor-auto" onClick={(e) => { e.stopPropagation() }}>{employee.phoneNumber ? <PhoneLinks phoneNumber={employee.phoneNumber} name={getEmployeeFullName(employee)} /> : '-'}</td>
                <td className="px-3 py-2 text-center flex flex-wrap gap-2 justify-center cursor-auto actions-column" onClick={(e) => e.stopPropagation()}>
                  {employee._id !== company.owner._id && (
                    <>
                      <button
                        className={`transition-colors duration-300 border p-2 rounded-lg text-center font-bold text-xs ${employee.active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'} hover:opacity-80`}
                        onClick={(e) => { e.stopPropagation(); handleChangeEmployeeStatus(employee); }}
                        title={employee.active ? 'Desactivar' : 'Activar'}
                      >
                        {employee.active ? 'Activo' : 'Inactivo'}
                      </button>
                      <button className="border shadow-lg rounded-lg text-center h-8 w-8" onClick={(e) => { e.stopPropagation(); setEmployeeToEdit(employee); }} title="Editar">
                        <FaEdit className="text-blue-500 m-auto h-fit w-fit" />
                      </button>
                      <button className="border shadow-lg rounded-lg text-center h-8 w-8" onClick={(e) => { e.stopPropagation(); setIsOpen(isOpen ? false : true); setButtonId(employee._id); }} disabled={loading} title="Eliminar">
                        <FaTrash className='text-red-700 m-auto' />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50'>
            <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5 text-base mx-auto max-w-lg'>
              <div>
                <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
              </div>
              <div className='flex gap-10'>
                <button className='rounded-lg border shadow-lg w-20 h-10' onClick={() => setIsOpen(false)}>No</button>
                <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteEmployee({ employeeId: buttonId, spliceEmployee }); setIsOpen(false); }}>Si</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
