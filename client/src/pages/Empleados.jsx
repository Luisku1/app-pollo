import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { fetchEmployees } from "../helpers/FetchFunctions"
import { MdEdit } from "react-icons/md";
import { weekDays } from "../helpers/Constants"
import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom"
import { CiSearch } from "react-icons/ci";
import { MdClear } from "react-icons/md";

export default function Empleados() {

  const { company } = useSelector((state) => state.user)
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [buttonId, setButtonId] = useState(null)

  const handleSearchBarChange = (e) => {

    const searchString = e.target.value

    if (searchString != '') {

      const filteredList = employees.filter((employee) =>

        employee.name.toLowerCase().includes(searchString.toLowerCase()) || employee.lastName.toLowerCase().includes(searchString.toLowerCase())
      )

      setFilteredEmployees(filteredList)

    } else {

      setFilteredEmployees(employees)
    }
  }

  const clearSearchBar = () => {

    const searchBar = document.getElementById('searchBar')

    searchBar.value = ''
    searchBar.focus()

    setFilteredEmployees(employees)
  }

  const deleteEmployee = async (employeeId, index) => {

    setLoading(true)

    try {

      const res = await fetch('/api/employee/delete/' + employeeId, {
        method: 'DELETE'
      })
      const data = res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      employees.splice(index, 1)
      setLoading(false)
      setError(null)

    } catch (error) {


      setError(error.message)
    }
  }

  useEffect(() => {

    const setEmployeesFunction = async () => {

      const result = await fetchEmployees(company._id)

      if (result.error == null) {

        setEmployees(result.data)
        setFilteredEmployees(result.data)

      } else {

        setError(result.error)
      }

    }

    setEmployeesFunction()

  }, [company])

  useEffect(() => {


  }, [filteredEmployees])

  return (

    <main className="p-3 max-w-lg mx-auto">

      {error ? <p>{error}</p> : ''}

      <div className="w-full bg-white  p-3 border">

        <div className="border flex items-center">

          <CiSearch className=" h-8 w-8 border-r" />
          <input autoComplete="off" className=" h-full w-full p-2 outline-none" type="text" name="searchBar" id="searchBar" onChange={handleSearchBarChange} />
          <button className="h-8 w-8" onClick={clearSearchBar}>
            <MdClear className="w-full h-full"/>
          </button>

        </div>

      </div>

      <div>

        {filteredEmployees && filteredEmployees.length > 0 && filteredEmployees.map((employee, index) => (

          <div className="my-4 bg-white p-4 grid grid-cols-12" key={employee._id}>

            <div className="col-span-10">
              <Link to={'/perfil/' + employee._id}>
                <p className="text-2xl font-bold">{employee.name + ' ' + employee.lastName}</p>
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

              <div className="col-span-2 my-auto">
                <button type="submit" onClick={() => console.log('editing')} disabled={loading} className='bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3 '>
                  <span >
                    <MdEdit className='text-blue-700 m-auto' />
                  </span>
                </button>
                <div>
                  <button id={employee._id} onClick={() => { setIsOpen(isOpen ? false : true), setButtonId(employee._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                    <span>
                      <FaTrash className='text-red-700 m-auto' />
                    </span>
                  </button>

                  {isOpen && employee._id == buttonId ?
                    <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                      <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                        <div>
                          <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                        </div>
                        <div className='flex gap-10'>
                          <div>
                            <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteEmployee(employee._id, index), setIsOpen(isOpen ? false : true) }}>Si</button>
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

        ))}

      </div>


    </main>
  )
}
