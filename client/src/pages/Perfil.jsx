import { useDispatch, useSelector } from 'react-redux'
import { signOutFailiure, signOutStart, signOutSuccess } from '../redux/user/userSlice'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { weekDays } from '../helpers/Constants'
import { FaTrash } from 'react-icons/fa'

export default function Perfil() {

  const { error, currentUser } = useSelector((state) => state.user)
  const { employeeId } = useParams()
  const [employee, setEmployee] = useState(null)
  const [employeeReports, setEmployeeReports] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [buttonId, setButtonId] = useState(null)
  const [fetchError, setFetchError] = useState(null)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  const handleSignOut = async () => {

    try {

      dispatch(signOutStart())

      const res = await fetch('/api/auth/sign-out')

      const data = await res.json()

      if (data.success === false) {

        dispatch(signOutFailiure(data.message))
        return
      }

      dispatch(signOutSuccess())

    } catch (error) {

      dispatch(signOutFailiure(error.message))
    }

  }

  const deleteBranchReport = async (reportId, index) => {

    setLoading(true)

    try {

      const res = await fetch('/api/branch/report/delete/' + reportId, {

        method: 'DELETE'

      })

      const data = await res.json()

      if (data.success === false) {

        setFetchError(data.message)
        setLoading(false)
        return
      }

      setFetchError(null)
      setLoading(false)

      employeeReports.splice(index, 1)

    } catch (error) {

      setFetchError(error)
    }
  }

  useEffect(() => {

    setEmployeeReports([])

    const fetchEmployee = async () => {

      try {

        const res = await fetch('/api/employee/get-employee/' + employeeId)
        const data = await res.json()

        if (data.success === false) {

          setFetchError(data.message)
          return
        }

        setEmployee(data.employee)
        setFetchError(null)

      } catch (error) {

        setFetchError(error.message)
      }
    }

    const fetchEmployeeReports = async () => {

      try {

        const res = await fetch('/api/employee/get-employee-reports/' + employeeId)
        const data = await res.json()

        if (data.success === false) {

          setFetchError(data.message)
          return
        }

        setEmployeeReports(data.employeeReports)
        setFetchError(null)

      } catch (error) {

        setFetchError(error.message)
      }
    }

    fetchEmployee()
    fetchEmployeeReports()

  }, [employeeId])


  return (

    <main className="p-3 max-w-lg mx-auto">

      {error ? <p>{error}</p> : ''}
      {fetchError ? <p>{fetchError}</p> : ''}

      {employee ?

        <div className="my-4 bg-white p-4" key={employee._id}>

          <div className="">
            <h1 className="text-3xl font-bold">{employee.name + ' ' + employee.lastName}</h1>

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

          {employeeReports && employeeReports.length > 0 ?

            <div className='mt-10'>

              <h2 className='text-2xl font-bold'>Cuentas</h2>

              {employeeReports.map((reportData, index) => (

                <div key={reportData._id} className="bg-white p-5 mb-4 mt-4 rounded-3xl shadow-lg border" >

                  <p className="text-center text-lg font-semibold text-red-500 mb-3">Fecha: {(new Date(reportData.createdAt)).toLocaleDateString()}</p>

                  <div className='grid grid-cols-12'>

                    <Link className='col-span-10' to={'/formato/' + reportData.createdAt + '/' + reportData.branch}>

                      <div className=''>
                        {index != 0 && (new Date().getDate() - 1) > new Date(new Date(reportData.createdAt).toLocaleDateString().slice(0, 10))  ?
                          <div className="flex gap-2">
                            <p className="text-lg">Faltante: </p>
                            <p className={reportData.balance < 0 ? 'text-red-700 font-bold' : '' + 'text-lg font-bold'}>{parseFloat(reportData.balance).toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
                          </div>
                          : ''}
                        <p>Efectivo: {reportData.incomes.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                        <p>Sobrante: {reportData.finalStock.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                        <p>Gastos: {reportData.outgoings.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                        <p>Efectivo neto: {(reportData.incomes - reportData.outgoings).toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                      </div>
                    </Link>

                    {index == 0 && employeeId == currentUser._id ?

                      <div className=' col-span-2'>
                        <button id={reportData._id} onClick={() => { setIsOpen(isOpen ? false : true), setButtonId(reportData._id) }} disabled={loading} className='bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                          <span>
                            <FaTrash className='text-red-700 m-auto' />
                          </span>
                        </button>

                        {isOpen && reportData._id == buttonId ?
                          <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                            <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                              <div>
                                <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                              </div>
                              <div className='flex gap-10'>
                                <div>
                                  <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteBranchReport(reportData._id, index), setIsOpen(isOpen ? false : true) }}>Si</button>
                                </div>
                                <div>
                                  <button className='rounded-lg border shadow-lg w-20 h-10' onClick={() => { setIsOpen(isOpen ? false : true) }}>No</button>
                                </div>
                              </div>
                            </div>
                          </div>
                          : ''}

                      </div>

                      : ''}
                  </div>
                </div>

              ))}
            </div>
            : ''
          }

          {
            employeeId == currentUser._id ?
              <div className='mt-8 grid grid-1'>
                <button className='border shadow-lg rounded-full p-3 flex-col-reverse justify-self-end'>
                  <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>Sign out</span>
                </button>
                <span>{error ? ' Error al fetch' : ''}</span>
              </div>
              : ''
          }
        </div >
        : ''}

    </main >

  )
}
