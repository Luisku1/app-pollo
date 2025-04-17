import { useCallback, useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { weekDays } from "../helpers/Constants"
import { FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom"
import { useEmployees } from "../hooks/Employees/useEmployees";
import { useDeleteEmployee } from "../hooks/Employees/useDeleteEmployee";
import SearchBar from "../components/SearchBar";
import { getEmployeeFullName } from "../helpers/Functions";
import Modal from "../components/Modals/Modal";
import RegistroEmpleadoNuevo from "./RegistroEmpleado";
import { CgProfile } from "react-icons/cg";
import EmployeeInfo from "../components/EmployeeInfo";

export default function Empleados() {

  const { company } = useSelector((state) => state.user)
  const date = (new Date()).toISOString().split('T')[0]
  const { employees, activeEmployees, inactiveEmployees, setFilterString, changeEmployeeActiveStatus, onUpdateEmployee, spliceEmployee, loading, error } = useEmployees({ companyId: company._id, date, onlyActiveEmployees: false })
  const { deleteEmployee } = useDeleteEmployee()
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [buttonId, setButtonId] = useState(null)
  const searchBarRef = useRef(null);
  const [showActiveEmployees, setShowActiveEmployees] = useState(true)
  const [searching, setSearching] = useState(false)
  const [editEmployee, setEditEmployee] = useState(null)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const [selectedEmployee, setSelectedEmployee] = useState(null)

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
      if (event.ctrlKey && event.key === 'b') {
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

  const toggleEditEmployee = () => {

    setEditEmployee((prev) => !prev)
  }

  const renderEmployeesList = (employeesList = []) => {

    return employeesList.map((employee, index) => (
      <div key={employee._id}>
        {employee.active == showActiveEmployees || searching ?
          <div className="my-4 bg-white p-4 grid grid-cols-12 rounded-lg">

            <div className="col-span-9">

              <button onClick={() => setSelectedEmployee(employee)} className="font-bold text-xl flex gap-1 items-center text-red-700"><span><CgProfile /></span>{getEmployeeFullName(employee)}</button>

              <div className="p-3">
                <div className="flex gap-2">
                  <p className="text-lg">Balance: </p>
                  <p className={employee.balance < 0 ? 'text-red-700 font-bold' : '' + 'text-lg font-bold'}>{parseFloat(employee.balance).toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
                </div>
                <p className="text-lg">{'Rol: ' + employee.role.name}</p>
                {employee.salary ?
                  <p className="text-lg">{'Sueldo: ' + parseFloat(employee.salary).toLocaleString("es-Mx", { style: 'currency', currency: 'MXN' })}</p>
                  : ''}
                {employee.payDay > -1 ?
                  <p className="text-lg">{'Día de cobro: ' + weekDays[employee.payDay]}</p>
                  : ''}
                <p className="text-lg">Teléfono: {employee.phoneNumber ? employee.phoneNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3') : ''}</p>
              </div>
            </div>

            {employee._id != company.owner._id ?

              <div className="col-span-3 my-auto justify-self-center">

                <button id={employee._id} className={`transition-colors duration-300 w-full mx-auto border p-3 rounded-lg text-center font-bold ${hoveredIndex != employee._id ? (employee.active ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : (employee.active ? 'bg-red-600 text-white' : 'bg-green-600 text-white')}`} onMouseEnter={() => { handleMouseEnter(employee._id) }} onMouseLeave={handleMouseLeave} onClick={() => { handleChangeEmployeeStatus(employee) }}>
                  {employee.active ?
                    <div>
                      {hoveredIndex != employee._id ?
                        <p>Activo</p>
                        :
                        <p>Cambiar</p>
                      }
                    </div>
                    :
                    <div>

                      {hoveredIndex != employee._id ?
                        <p>Inactivo</p>
                        :
                        <p>Cambiar</p>
                      }
                    </div>
                  }
                </button>
                <button className="border shadow-lg rounded-lg text-center h-10 w-10 m-3" onClick={toggleEditEmployee}>
                  <FaEdit className="text-blue-500 m-auto h-fit w-fit" />
                </button>

                {editEmployee && (
                  <Modal
                    content={<RegistroEmpleadoNuevo setEmployee={onUpdateEmployee} employee={employee} />}
                    closeModal={toggleEditEmployee}
                    ableToClose={true}
                  />
                )}
                <div>
                  <button id={employee._id} onClick={() => { setIsOpen(isOpen ? false : true), setButtonId(employee._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                    <span>
                      <FaTrash className='text-red-700 m-auto' />
                    </span>
                  </button>

                  {isOpen && employee._id == buttonId ?
                    <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                      <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5 text-base mx-auto max-w-lg'>
                        <div>
                          <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                        </div>
                        <div className='flex gap-10'>
                          <div>
                            <button className='rounded-lg border shadow-lg w-20 h-10' onClick={() => { setIsOpen(isOpen ? false : true) }}>No</button>
                          </div>
                          <div>
                            <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteEmployee({ employeeId: employee._id, index, spliceEmployee }), setIsOpen(isOpen ? false : true) }}>Si</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    : ''}

                </div>
              </div>
              : ''}
          </div>
          : ''}
      </div>
    ))
  }


  return (

    <main className="p-3 max-w-lg mx-auto">

      {error ? <p>{error}</p> : ''}
      <EmployeeInfo employee={selectedEmployee} toggleInfo={() => setSelectedEmployee(null)} />

      <div className="bg-white rounded-lg">
        <div className="grid grid-cols-2 border w-full mt-4 mb-4 rounded-lg">
          <button className={"h-full rounded-lg rounded-r-none hover:shadow-xl p-3 border border-black text-white font-bold border-r-0 " + (showActiveEmployees && !searching ? ' bg-green-600  opacity-85' : 'bg-green-600 text-white font-bold opacity-40')} onClick={() => { setShowActiveEmployees(true), stopSearching() }}>Empleados Activos</button>
          <button className={"h-full rounded-lg rounded-l-none hover:shadow-xl p-3 border border-black border-l-0 " + (!showActiveEmployees && !searching ? 'bg-red-700 text-white font-bold opacity-85' : 'bg-red-700 font-bold border-opacity-85 opacity-40 text-white')} onClick={() => { setShowActiveEmployees(false), stopSearching() }}>Empleados Inactivos</button>
        </div>
      </div>
      <div className="w-full bg-white  p-3 border rounded-lg sticky top-16 z-10">
        <div className="border rounded-lg flex items-center w-full">
          <SearchBar ref={searchBarRef} handleFilterTextChange={handleSearchBarChange} placeholder={'Busca a tus empleados (CTRL + b)'}></SearchBar>
        </div>
      </div>
      <div>
        {searching ?
          renderEmployeesList(employees)
          :
          <div>
            {showActiveEmployees ?
              renderEmployeesList(activeEmployees)
              :
              renderEmployeesList(inactiveEmployees)
            }
          </div>
        }
      </div>
    </main>
  )
}
