import { useCallback, useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { MdEdit } from "react-icons/md";
import { weekDays } from "../helpers/Constants"
import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom"
import { useEmployees } from "../hooks/Employees/useEmployees";
import { useDeleteEmployee } from "../hooks/Employees/useDeleteEmployee";
import SearchBar from "../components/SearchBar";

export default function Empleados() {

  const { company } = useSelector((state) => state.user)
  const { employees, filterEmployees, changeEmployeeActiveStatus, spliceEmployee, loading, error } = useEmployees({ companyId: company._id, onlyActiveEmployees: false })
  const { deleteEmployee } = useDeleteEmployee()
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [buttonId, setButtonId] = useState(null)
  const searchBarRef = useRef(null);
  const [showActiveEmployees, setShowActiveEmployees] = useState(true)
  const [searching, setSearching] = useState(false)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const handleChangeEmployeeStatus = (employee) => {

    changeEmployeeActiveStatus({ employee })
  }

  const handleSearchBarChange = (value) => {

    filterEmployees(value)
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

    filterEmployees()
    setSearching(false)
  }

  useEffect(() => {

    document.title = 'Empleados'
  }, [])

  return (

    <main className="p-3 max-w-lg mx-auto">

      {error ? <p>{error}</p> : ''}

      <div className="w-full bg-white  p-3 border rounded-lg">

        <div className="border rounded-lg flex items-center w-full">

          <SearchBar ref={searchBarRef} handleFilterTextChange={handleSearchBarChange} placeholder={'Busca a tus empleados (CTRL + b)'}></SearchBar>

        </div>

      </div>

      <div className="bg-white">
        <div className="grid grid-cols-2 border w-full mt-4 mb-4 rounded-lg">
          <button className={"h-full rounded-lg hover:shadow-xl p-3 " + (showActiveEmployees && !searching ? 'border border-black bg-green-600 opacity-85 text-white font-bold' : 'bg-green-600 text-white font-bold opacity-40')} onClick={() => { setShowActiveEmployees(true), stopSearching() }}>Empleados Activos</button>
          <button className={"h-full rounded-lg hover:shadow-xl p-3 " + (!showActiveEmployees && !searching ? 'bg-red-700 text-white font-bold border opacity-85 border-black' : 'bg-red-700 font-bold opacity-40 text-white')} onClick={() => { setShowActiveEmployees(false), stopSearching() }}>Empleados Inactivos</button>
        </div>
      </div>

      <div>

        {employees && employees.length > 0 && employees.map((employee, index) => (

          <div key={employee.value}>

            {employee.active == showActiveEmployees || searching ?


              <div className="my-4 bg-white p-4 grid grid-cols-12 rounded-lg">

                <div className="col-span-9">
                  <Link to={'/perfil/' + employee.value}>
                    <p className="text-2xl font-bold">{employee.label}</p>
                  </Link>

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

                    <button id={employee.value} className={`transition-colors duration-300 w-full mx-auto border p-3 rounded-lg text-center font-bold ${hoveredIndex != employee.value ? (employee.active ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : (employee.active ? 'bg-red-600 text-white' : 'bg-green-600 text-white')}`} onMouseEnter={() => { handleMouseEnter(employee.value) }} onMouseLeave={handleMouseLeave} onClick={() => { handleChangeEmployeeStatus(employee) }}>
                      {employee.active ?
                        <div>
                          {hoveredIndex != employee.value ?
                            <p>Activo</p>
                            :
                            <p>Cambiar</p>
                          }
                        </div>
                        :
                        <div>

                          {hoveredIndex != employee.value ?
                            <p>Inactivo</p>
                            :
                            <p>Cambiar</p>
                          }
                        </div>
                      }
                    </button>

                    <button type="submit" onClick={() => console.log('editing')} disabled={loading} className='bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3 '>
                      <span >
                        <MdEdit className='text-blue-700 m-auto' />
                      </span>
                    </button>
                    <div>
                      <button id={employee.value} onClick={() => { setIsOpen(isOpen ? false : true), setButtonId(employee.value) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                        <span>
                          <FaTrash className='text-red-700 m-auto' />
                        </span>
                      </button>

                      {isOpen && employee.value == buttonId ?
                        <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                          <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                            <div>
                              <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                            </div>
                            <div className='flex gap-10'>
                              <div>
                                <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteEmployee({ employeeId: employee.value, index, spliceEmployee }), setIsOpen(isOpen ? false : true) }}>Si</button>
                              </div>
                              <div>
                                <button className='rounded-lg border shadow-lg w-20 h-10' onClick={() => { setIsOpen(isOpen ? false : true) }}>No</button>
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

        ))}

      </div>


    </main>
  )
}
