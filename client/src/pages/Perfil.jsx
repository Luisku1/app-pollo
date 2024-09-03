import { useDispatch, useSelector } from 'react-redux'
import { signOutFailiure, signOutStart, signOutSuccess } from '../redux/user/userSlice'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { weekDays } from '../helpers/Constants'
import TarjetaCuenta from '../components/TarjetaCuenta'
import ShowEmployeePayments from '../components/ShowEmployeePayments'

export default function Perfil() {

  const { error, currentUser } = useSelector((state) => state.user)
  const { employeeId } = useParams()
  const [employee, setEmployee] = useState(null)
  const [employeeDayInfo, setEmployeeDayInfo] = useState(null)
  const [supervisorInfo, setSupervisorInfo] = useState({})
  const [employeeReports, setEmployeeReports] = useState([])
  const [fetchError, setFetchError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [managerRole, setManagerRole] = useState({})
  const [access, setAccess] = useState(true)
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

  useEffect(() => {

    const setManagerRoleFunction = (roles) => {

      const managerRole = roles.find((elemento) => elemento.name == 'Gerente')
      setManagerRole(managerRole)

    }

    const fetchRoles = async () => {

      try {

        const res = await fetch('/api/role/get')
        const data = await res.json()

        if (data.success === false) {
          setFetchError(data.message)
          return
        }
        await setManagerRoleFunction(data.roles)
        setFetchError(null)

      } catch (error) {

        setFetchError(error.message)

      }
    }

    fetchRoles()

  }, [])

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

    if ((managerRole && managerRole._id == currentUser.role) || (currentUser._id == employeeId)) {

      setAccess(true)
      fetchEmployee()
      fetchEmployeeDayInformation()
      fetchEmployeeReports()

    } else {

      setAccess(false)
    }

  }, [employeeId, currentUser, managerRole])

  useEffect(() => {

    const fetchSupervisorDayInfo = async () => {

      try {

        const res = await fetch('/api/report/get-supervisor-info/' + employeeId)
        const data = await res.json()

        if (data.success === false) {

          setFetchError(data.message)
          return
        }
        setSupervisorInfo(data.supervisorInfo)

      } catch (error) {

        setFetchError(error)
      }
    }


    if (employee) {

      if (employee.role.name == 'Supervisor' || employee.role.name == 'Gerente') {

        fetchSupervisorDayInfo()
      }
    }
  }, [employee, employeeId])

  useEffect(() => {

    if (employee) {

      document.title = employee.name + ' ' + employee.lastName
    }
  }, [employee])



  return (

    <main className="p-3 max-w-lg mx-auto">

      {error ? <p>{error}</p> : ''}
      {fetchError ? <p>{fetchError}</p> : ''}

      {access ?

        <div>



          {employee ?

            <div id='personal-info' className="my-4 bg-white p-4" key={employee._id}>

              <h1 className="text-3xl font-bold">{employee.name + ' ' + employee.lastName}</h1>

              <div className='p-3'>

                <div className='flex flex-row-reverse gap-2 items-center'>
                  <ShowEmployeePayments employeeId={employee._id} employeeName={employee.name} date={(new Date()).toISOString()}></ShowEmployeePayments>
                  <p className='text-center text-lg'>Pagos: </p>
                </div>
              </div>

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

              {(employee.role.name == 'Supervisor' || employee.role.name == 'Gerente') ?

                <div className=''>
                  <h2 className='text-2xl font-semibold'>Supervisión</h2>

                  <div className='p-3 text-lg'>

                    <div className='flex gap-2'>
                      <p>Efectivo y depósitos: </p>
                      <p>{parseFloat(supervisorInfo.incomes).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                    </div>

                    <div className='flex gap-2'>
                      <p>Gastos: </p>
                      <p>{parseFloat(supervisorInfo.outgoings).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                    </div>

                    <div className='flex gap-2'>
                      <p>Efectivo Neto: </p>
                      <p>{parseFloat(supervisorInfo.incomes - supervisorInfo.outgoings).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                    </div>
                  </div>

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

              {employeeReports && employeeReports.length > 0 ?

                <div className='mt-4'>

                  <h3 className='text-2xl font-bold'>Cuentas</h3>

                  <TarjetaCuenta reportArray={employeeReports} managerRole={managerRole} currentUser={currentUser} />

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
