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
  const [checkboxStates, setCheckboxStates] = useState({})

  const searchBarRef = useRef(null)

  useEffect(() => {
    const initialCheckboxStates = {}
    dailyBalances.forEach(dailyBalance => {
      initialCheckboxStates[dailyBalance._id] = {
        lateDiscount: dailyBalance.lateDiscount,
        restDay: dailyBalance.restDay,
        dayDiscount: dailyBalance.dayDiscount
      }
    })
    setCheckboxStates(initialCheckboxStates)
  }, [dailyBalances])

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

  const handleDailyBalancesFilterText = (text) => {
    setDailyBalancesFilterText(text)
  }

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
    </div>
  )
}
