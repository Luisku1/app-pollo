import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from 'react-redux'
import { FaCheck } from "react-icons/fa"
import { MdCancel } from "react-icons/md";
import { formatDate } from "../helpers/DatePickerFunctions"
import FechaDePagina from "../components/FechaDePagina"
import { useDate } from '../context/DateContext';

export default function Gastos() {

  let paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const { company, currentUser } = useSelector((state) => state.user)
  const [outgoings, setOutgoings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [buttonId, setButtonId] = useState(null)
  const [employees, setEmployees] = useState([])
  const [outgoingsTotal, setOutgoingsTotal] = useState(0.0)
  const [manager, setManagerRole] = useState({})
  const navigate = useNavigate()

  const { currentDate, setCurrentDate } = useDate()

  const changeDatePickerValue = (e) => {

    stringDatePickerValue = (e.target.value + 'T06:00:00.000Z')

    navigate('/supervision-diaria/' + stringDatePickerValue)

  }

  const changeDay = (date) => {
    setCurrentDate(date)
    navigate('/supervision-diaria/' + date)

  }

  useEffect(() => {
    if (stringDatePickerValue) {
      setCurrentDate(stringDatePickerValue)
    }
  }, [stringDatePickerValue])

  const setOutgoingsTotalFunction = (outgoings) => {

    let total = 0
    outgoings.forEach((outgoing) => {
      total += parseFloat(outgoing.amount)
    })

    setOutgoingsTotal(total)
  }

  const rejectOutgoing = async (employeeId, outgoingId, index) => {

    setLoading(true)

    try {

      const res = await fetch('/api/outgoing/reject-outgoing/' + outgoingId, {

        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({


          approved: outgoings[index].addmitted
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      outgoings[index].addmitted = !(outgoings[index].addmitted)
      setError(null)
      setLoading(false)

    } catch (error) {
      setError(error.message)
    }
  }

  useEffect(() => {

    const setManagerRoleFunction = async (roles) => {

      const manager = roles.find((elemento) => elemento.name == 'Gerente')
      setManagerRole(manager)

    }

    const fetchRoles = async () => {

      try {

        const res = await fetch('/api/role/get')
        const data = await res.json()

        if (data.success === false) {
          setError(data.message)
          return
        }
        await setManagerRoleFunction(data.roles)
        setError(null)

      } catch (error) {

        setError(error.message)

      }
    }

    fetchRoles()
  })

  useEffect(() => {

    const fetchOutgoings = async () => {

      const date = (paramsDate ? new Date(paramsDate) : new Date()).toISOString()

      setLoading(true)
      setOutgoingsTotal(0.0)
      setOutgoings([])

      try {

        const res = await fetch('/api/outgoing/get-outgoings/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError('No hay gastos registrados')
          setLoading(false)
          return
        }

        data.outgoings.sort((outgoing, nextOutgoing) => {

          return outgoing.branch.position - nextOutgoing.branch.position
        })

        setOutgoings(data.outgoings)
        setOutgoingsTotalFunction(data.outgoings)
        setError(null)
        setLoading(false)

      } catch (error) {

        setError(error.message)
        setLoading(false)
      }
    }

    fetchOutgoings()

  }, [paramsDate, company])

  useEffect(() => {

    document.title = 'Gastos (' + new Date(currentDate).toLocaleDateString() + ')'
  })


  return (

    <main className="p-3 max-w-lg mx-auto">
      <h1 className='text-3xl text-center font-semibold mt-7'>
        Gastos
        <br />
      </h1>

      {manager._id == currentUser.role ?

        <FechaDePagina changeDay={changeDay} stringDatePickerValue={currentDate} changeDatePickerValue={changeDatePickerValue} ></FechaDePagina>

        : ''}
      {error ? <p>{error}</p> : ''}

      {outgoings && outgoings.length > 0 ?

        <div className="bg-white p-3 mt-4">

          <p className="p-3 my-4">{outgoingsTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>

          {outgoings && outgoings.length > 0 ?
            <div id='header' className='grid grid-cols-12 gap-4 items-center justify-around font-semibold'>
              <p className='p-3 rounded-lg col-span-3 text-center'>Sucursal</p>
              <p className='p-3 rounded-lg col-span-4 text-center'>Concepto</p>
              <p className='p-3 rounded-lg col-span-3 text-center'>Monto</p>
            </div>
            : ''}
          {outgoings && outgoings.length > 0 && outgoings.map((outgoing, index) => (


            <div key={outgoing._id} className={'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

              <div id='list-element' className='flex col-span-10 items-center'>
                <p className='text-center text-xs w-6/12'>{outgoing.branch.branch}</p>
                <p className='text-center text-xs w-6/12'>{outgoing.concept}</p>
                <p className='text-center text-xs w-6/12'>{outgoing.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
              </div>

              <div>
                <button id={outgoing._id} disabled={loading} onClick={() => { setIsOpen(!isOpen), setButtonId(outgoing._id) }} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                  <span>
                    <FaCheck className='text-green-700 m-auto' />
                  </span>
                </button>
                {isOpen && outgoing._id == buttonId ?
                  <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center'>
                    <div className='bg-white p-5 rounded-lg justify-center items-center h-4/6 my-auto'>
                      <div className="mb-10 flex">
                        <p className='text-3xl font-semibold text-red-500'>Selecciona el empleado al que se le cobrará el gasto</p>
                        <button className="m-auto" onClick={() => { setIsOpen(!isOpen) }}><MdCancel className="h-7 w-7" /></button>
                      </div>
                      <div className='h-5/6 overflow-y-scroll'>
                        <div className={"border border-red-800 p-3 shadow-lg rounded-lg overflow-y-scroll mb-4"}>
                          <p className="font-bold text-lg">{outgoing.employee.name + ' ' + outgoing.employee.lastName}</p>
                        </div>

                        {employees && employees.length > 0 && employees.map((employee) => (
                          <div key={employee._id} onClick={() => { rejectOutgoing(employee._id, outgoing._id, index) }}>
                            {employee._id != outgoing.employee._id ?
                              <div className=" p-3 shadow-lg rounded-lg">
                                <p className="font-bold text-lg">{employee.name + ' ' + employee.lastName}</p>
                              </div>
                              : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  : ''}
              </div>
            </div>
          ))}
        </div>
        : ''}
    </main>
  )
}
