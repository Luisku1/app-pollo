import { useEffect, useState, useRef } from "react"
import SectionHeader from "./SectionHeader"
import SearchBar from "./SearchBar"
import { useEmployeesDailyBalances } from "../hooks/Employees/useEmployeesDailyBalances"
import { useDate } from "../context/DateContext"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"

export default function Penalties() {
  const { currentDate } = useDate()
  const { company } = useSelector((state) => state.user)
  const companyId = company?._id
  const {
    employeesDailyBalances,
    loading,
    error,
    filterText,
    setFilterText
  } = useEmployeesDailyBalances({ companyId, date: currentDate });

  const [checkboxStates, setCheckboxStates] = useState({})
  const searchBarRef = useRef(null)

  useEffect(() => {
    if (searchBarRef.current) {
      searchBarRef.current.focus()
    }
  }, [])

  useEffect(() => {
    const initialCheckboxStates = {}
    employeesDailyBalances.forEach(dailyBalance => {
      initialCheckboxStates[dailyBalance._id] = {
        lateDiscount: dailyBalance.lateDiscount,
        restDay: dailyBalance.restDay,
        dayDiscount: dailyBalance.dayDiscount
      }
    })
    setCheckboxStates(initialCheckboxStates)
  }, [employeesDailyBalances])

  const handleDailyBalanceInputs = async (e, dailyBalanceId) => {
    const { id, checked } = e.target
    setCheckboxStates(prevState => ({
      ...prevState,
      [dailyBalanceId]: {
        ...prevState[dailyBalanceId],
        [id]: checked
      }
    }))

    try {
      const res = await fetch('/api/employee/update-daily-balance/' + dailyBalanceId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [id]: checked })
      })

      const data = await res.json()

      if (data.success === false) {
        setCheckboxStates(prevState => ({
          ...prevState,
          [dailyBalanceId]: {
            ...prevState[dailyBalanceId],
            [id]: !checked
          }
        }))
      }
    } catch (error) {
      setCheckboxStates(prevState => ({
        ...prevState,
        [dailyBalanceId]: {
          ...prevState[dailyBalanceId],
          [id]: !checked
        }
      }))
    }
  }

  return (
    <div>
      {employeesDailyBalances && employeesDailyBalances.length > 0 ?
        <div className='border bg-white shadow-lg p-3 mt-4'>
          <SectionHeader label={'Empleados'} />
          <div id="filterBySupervisor" className="w-full sticky border border-black rounded-md border-opacity-50 top-16 bg-white z-30">
            <SearchBar ref={searchBarRef} handleFilterTextChange={setFilterText} value={filterText} placeholder={'Búsqueda de empleados'} />
          </div>
          <div id='header' className='grid grid-cols-12 gap-4 items-center justify-around font-semibold mt-4'>
            <p className='p-3 rounded-lg col-span-3 text-sm text-center'>Empleado</p>
            <p className='p-3 rounded-lg col-span-3 text-sm text-center'>Retardo</p>
            <p className='p-3 rounded-lg col-span-3 text-sm text-center'>Descanso</p>
            <p className='p-3 rounded-lg col-span-3 text-sm text-center'>Falta</p>
          </div>
          {employeesDailyBalances.map((dailyBalance) => (
            <div key={dailyBalance._id} className='grid grid-cols-12 items-center border border-black border-opacity-30 rounded-lg shadow-sm mt-2'>
              <div id='list-element' className='flex col-span-12 items-center justify-around'>
                <Link className='w-3/12' to={dailyBalance.employee != null ? '/perfil/' + dailyBalance.employee._id : ''}>
                  <p className='text-center text-sm'>{dailyBalance.employee != null ? dailyBalance.employee.name + ' ' + dailyBalance.employee.lastName : 'Trabajador despedido'}</p>
                </Link>
                <div className='w-3/12'>
                  <input className='w-full' type="checkbox" name="lateDiscount" id="lateDiscount" checked={checkboxStates[dailyBalance._id]?.lateDiscount || false} onChange={(e) => { handleDailyBalanceInputs(e, dailyBalance._id) }} />
                </div>
                <input className='w-3/12' type="checkbox" name="restDay" id="restDay" checked={checkboxStates[dailyBalance._id]?.restDay || false} onChange={(e) => handleDailyBalanceInputs(e, dailyBalance._id)} />
                <input className='w-3/12' type="checkbox" name="dayDiscount" id="dayDiscount" checked={checkboxStates[dailyBalance._id]?.dayDiscount || false} onChange={(e) => handleDailyBalanceInputs(e, dailyBalance._id)} />
              </div>
            </div>
          ))}
        </div>
        : ''}
    </div >
  )
}
