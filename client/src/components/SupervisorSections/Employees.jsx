/* eslint-disable react/prop-types */
import { Link } from "react-router-dom"
import { usePendingEmployeesRests } from "../../hooks/Employees/useEmployesRests"
import CreateRests from '../CreateRest'
import SectionHeader from "../SectionHeader"
import SearchBar from "../SearchBar"
import { useEffect, useState, useRef } from "react"

export default function Employees({ companyId, employees, dailyBalances }) {

  const [dailyBalancesFilterText, setDailyBalancesFilterText] = useState('')
  const { pendingRests, onAddEmployeeRest, onDeleteEmployeeRest } = usePendingEmployeesRests({ companyId: companyId })

  const searchBarRef = useRef(null)

  const handleDailyBalanceInputs = async (e, dailyBalanceId) => {


    try {

      const res = await fetch('/api/employee/update-daily-balance/' + dailyBalanceId, {

        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({

          [e.target.id]: e.target.checked
        })
      })

      const data = await res.json()

      if (data.success === false) {

        e.target.checked = !e.target.checked
        return
      }

    } catch (error) {

      e.target.checked = !e.target.checked
    }
  }

  const handleDailyBalancesFilterText = (text) => {

    setDailyBalancesFilterText(text)
  }

  useEffect(() => {


  })

  useEffect(() => {
    const currentScrollPosition = window.scrollY;
    window.scrollTo(0, currentScrollPosition);
  }, [dailyBalancesFilterText])

  useEffect(() => {
    if (searchBarRef.current) {
      searchBarRef.current.focus()
    }
  }, [])

  return (

    <div className=''>
      <CreateRests employees={employees} onAddEmployeeRest={onAddEmployeeRest} onDeleteEmployeeRest={onDeleteEmployeeRest} pendingEmployeesRests={pendingRests}></CreateRests>
      {dailyBalances && dailyBalances.length > 0 ?
        <div className='border bg-white shadow-lg p-3 mt-4'>
          <SectionHeader label={'Empleados'} />
          <div id="filterBySupervisor" className="w-full sticky border border-black rounded-md border-opacity-50 top-16 bg-white z-30">
            <SearchBar ref={searchBarRef} handleFilterTextChange={handleDailyBalancesFilterText} placeholder={'Búsqueda de empleados'}></SearchBar>
          </div>
          {dailyBalances && dailyBalances.length > 0 ?
            <div id='header' className='grid grid-cols-12 gap-4 items-center justify-around font-semibold mt-4'>
              <p className='p-3 rounded-lg col-span-3 text-sm text-center'>Empleado</p>
              <p className='p-3 rounded-lg col-span-3 text-sm text-center'>Retardo</p>
              <p className='p-3 rounded-lg col-span-3 text-sm text-center'>Descanso</p>
              <p className='p-3 rounded-lg col-span-3 text-sm text-center'>Falta</p>
            </div>
            : ''}
          {dailyBalances && dailyBalances.length > 0 && dailyBalances.map((dailyBalance) => (
            ((`${dailyBalance.employee.name} ${dailyBalance.employee.lastName}`).toLowerCase().includes(dailyBalancesFilterText) || dailyBalancesFilterText == '') && (
              <div key={dailyBalance._id} className='grid grid-cols-12 items-center border border-black border-opacity-30 rounded-lg shadow-sm mt-2'>
                <div id='list-element' className='flex col-span-12 items-center justify-around'>
                  <Link className='w-3/12' to={dailyBalance.employee != null ? '/perfil/' + dailyBalance.employee._id : ''}>
                    <p className='text-center text-sm'>{dailyBalance.employee != null ? dailyBalance.employee.name + ' ' + dailyBalance.employee.lastName : 'Trabajador despedido'}</p>
                  </Link>
                  <div className='w-3/12'>
                    <input className='w-full' type="checkbox" name="foodDiscount" id="foodDiscount" defaultChecked={dailyBalance.foodDiscount} onChange={(e) => { handleDailyBalanceInputs(e, dailyBalance._id) }} />
                  </div>
                  <input className='w-3/12' type="checkbox" name="restDay" id="restDay" defaultChecked={dailyBalance.restDay} onChange={(e) => handleDailyBalanceInputs(e, dailyBalance._id)} />
                  <input className='w-3/12' type="checkbox" name="dayDiscount" id="dayDiscount" defaultChecked={dailyBalance.dayDiscount} onChange={(e) => handleDailyBalanceInputs(e, dailyBalance._id)} />
                </div>
              </div>
            )
          ))}
        </div>
        : ''}
    </div>
  )
}
