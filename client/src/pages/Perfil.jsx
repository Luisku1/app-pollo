import { useDispatch, useSelector } from 'react-redux'
import { signOutFailiure, signOutStart, signOutSuccess } from '../redux/user/userSlice'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { weekDays } from '../helpers/Constants'
import TarjetaCuenta from '../components/TarjetaCuenta'
import ShowEmployeePayments from '../components/ShowEmployeePayments'
import { useLoading } from '../hooks/loading'
import { useSignOut } from '../hooks/Auth/useSignOut'
import { useSupervisorReport } from '../hooks/Supervisors/useSupervisorReport'
import { formatDate } from '../helpers/DatePickerFunctions'
import { useRoles } from '../hooks/useRoles'
import { stringToCurrency } from '../helpers/Functions'
import ShowListButton from '../components/Buttons/ShowListButton'
import { useSupervisorReports } from '../hooks/Supervisors/useSupervisorReports'
import SupervisorReports from '../components/SupervisorReports'

export default function Perfil() {

  const { error, currentUser } = useSelector((state) => state.user)
  const { employeeId } = useParams()
  const [employee, setEmployee] = useState(null)
  const [employeeDayInfo, setEmployeeDayInfo] = useState(null)
  const { currentSupervisorReport } = useSupervisorReport({ supervisorId: employeeId, date: formatDate(new Date()) })
  const [employeeBranchReports, setEmployeeBranchReports] = useState([])
  const { supervisorReports } = useSupervisorReports({ supervisorId: employeeId })
  const [fetchError, setFetchError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { roles } = useRoles()
  const { isLoading } = useLoading(loading)
  const { signOut } = useSignOut()
  const dispatch = useDispatch()

  const handleSignOut = async () => {

    try {

      dispatch(signOutStart())

      signOut()

      dispatch(signOutSuccess())

    } catch (error) {

      dispatch(signOutFailiure())
    }
  }

  useEffect(() => {

    setEmployeeBranchReports([])

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

    const fetchEmployeeDayInformation = async () => {

      setLoading(true)

      try {

        const res = await fetch('/api/employee/get-employee-day-information/' + employeeId)
        const data = await res.json()

        if (data.success === false) {

          setFetchError(data.message)
          setLoading(false)
          return
        }

        setEmployeeDayInfo(data.employeeDayInfo)
        setLoading(false)
        setFetchError(null)

      } catch (error) {

        setLoading(false)
        setFetchError(error.message)
      }
    }

    const fetchEmployeeReports = async () => {

      try {

        const res = await fetch('/api/employee/get-employee-reports/' + employeeId + '/' + currentUser.role)
        const data = await res.json()

        if (data.success === false) {

          setFetchError(data.message)
          return
        }

        setEmployeeBranchReports(data.employeeBranchReports)
        setFetchError(null)

      } catch (error) {

        setFetchError(error.message)
      }
    }

    fetchEmployee()
    fetchEmployeeDayInformation()
    fetchEmployeeReports()


  }, [employeeId, currentUser])

  useEffect(() => {

    if (employee) {

      document.title = employee.name + ' ' + employee.lastName
    }
  }, [employee])

  return (

    <main className="p-3 max-w-lg mx-auto">

      {error ? <p>{error}</p> : ''}
      {fetchError ? <p>{fetchError}</p> : ''}

      {!isLoading ?

        <div>



          {employee && roles ?

            <div id='personal-info' className="my-4 bg-white p-4" key={employee._id}>
              <h1 className="text-3xl font-bold">{employee.name + ' ' + employee.lastName}</h1>

              {roles.managerRole._id == currentUser.role || currentUser._id == employee._id ?
                <div className='p-3'>
                  <div className='flex flex-row-reverse gap-2 items-center'>
                    <ShowEmployeePayments date={(new Date()).toISOString()} employeeId={employee._id} employeeName={employee.name}></ShowEmployeePayments>
                    <p className='text-center text-lg'>Pagos: </p>
                  </div>
                </div>
                : ''}
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

              {roles.sellerRole._id != employee.role._id ?
                <div className=''>
                  {currentSupervisorReport ?
                    <div>
                      <h2 className='text-2xl font-semibold'>Supervisión</h2>

                      <div className='p-3 text-lg'>
                        <div className='flex gap-2'>
                          <p>Efectivo y depósitos recogidos: </p>
                          <p>{parseFloat(currentSupervisorReport.incomes).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                        </div>

                        <div className='flex gap-2'>
                          <p>Gastos: </p>
                          <p>{stringToCurrency({ amount: parseFloat(currentSupervisorReport.outgoings) })}</p>
                        </div>

                        <div className='flex gap-2'>
                          <p>Dinero a entregar: </p>
                          <p>{parseFloat(currentSupervisorReport.incomes - currentSupervisorReport.outgoings).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                        </div>
                      </div>
                    </div>
                    : ''}
                </div>
                : ''}

              <div className='border bg-white shadow-lg p-3 mt-4'>


                {employeeDayInfo ?

                  <div className='p-3'>

                    <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold'>
                      <p className='p-3 rounded-lg col-span-4 text-sm text-center'>Retardo</p>
                      <p className='p-3 rounded-lg col-span-4 text-sm text-center'>Descanso</p>
                      <p className='p-3 rounded-lg col-span-4 text-sm text-center'>Falta</p>
                    </div>


                    <div key={employeeDayInfo._id} className='grid grid-cols-12 items-center border border-black border-opacity-30 rounded-lg shadow-sm mt-2'>

                      <div id='list-element' className='flex col-span-12 items-center justify-around py-3'>
                        <input className='w-4/12' type="checkbox" name="foodDiscount" id="foodDiscount" checked={employeeDayInfo.foodDiscount} />
                        <input className='w-4/12' type="checkbox" name="restDay" id="restDay" checked={employeeDayInfo.restDay} />
                        <input className='w-4/12' type="checkbox" name="dayDiscount" id="dayDiscount" checked={employeeDayInfo.dayDiscount} />
                      </div>

                    </div>

                  </div>
                  : ''}

              </div>


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

              {employeeBranchReports && employeeBranchReports.length > 0 ?

                <div className='flex gap-4 mt-4 items-center'>

                  <h3 className='text-2xl font-bold'>Cuentas en pollería</h3>
                  <div>
                    <ShowListButton ListComponent={<TarjetaCuenta reportArray={employeeBranchReports} managerRole={roles.managerRole} currentUser={currentUser} />}>
                    </ShowListButton>
                  </div>
                </div>
                : ''
              }

              {supervisorReports && supervisorReports.length > 0 &&  currentUser._id == employeeId || roles.managerRole._id == currentUser.role?

                <div className='flex gap-4 mt-4 items-center'>

                  <h3 className='text-2xl font-bold'>Cuentas de supervisor</h3>
                  <div>
                    <ShowListButton ListComponent={<SupervisorReports supervisorReports={supervisorReports}/>}>
                    </ShowListButton>
                  </div>
                </div>
                : ''
              }
            </div >
            : ''}
        </div>
        :
        <div className="bg-white p-5 my-4 rounded-3xl shadow-lg text-lg font-semibold text-center">

          <p>No tienes acceso a esta información</p>

        </div>
      }
    </main >
  )
}
