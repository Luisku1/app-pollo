import { useEffect, useState, useRef, useCallback } from "react"
import SectionHeader from "./SectionHeader"
import SearchBar from "./SearchBar"
import { useEmployeesDailyBalances } from "../hooks/Employees/useEmployeesDailyBalances"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { useDateNavigation } from "../hooks/useDateNavigation"

// Mejoras de usabilidad añadidas:
// - Responsive: vista tipo tabla en desktop, cards apiladas en móvil
// - Accesibilidad: labels asociadas a checkboxes, foco visible
// - Feedback: estados loading / vacío / error, actualización optimista con indicador por fila
// - Toggle entre fecha seleccionada y hoy más claro
// - Área clickeable mayor en los toggles

export default function Penalties() {
  const { currentDate, today } = useDateNavigation();
  const { company } = useSelector((state) => state.user);
  const companyId = company?._id;

  const [showToday, setShowToday] = useState(today);
  const {
    employeesDailyBalances: balancesCurrent,
    loading: loadingCurrent,
    error: errorCurrent,
    filterText,
    setFilterText
  } = useEmployeesDailyBalances({ companyId, date: currentDate });

  const todayString = new Date().toISOString().slice(0, 10);
  const {
    employeesDailyBalances: balancesToday,
    loading: loadingToday,
    error: errorToday
  } = useEmployeesDailyBalances({ companyId, date: todayString });

  const employeesDailyBalances = showToday ? balancesToday : balancesCurrent;
  const loading = showToday ? loadingToday : loadingCurrent;
  const error = showToday ? errorToday : errorCurrent;

  const [checkboxStates, setCheckboxStates] = useState({});
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const [inlineError, setInlineError] = useState(null)
  const searchBarRef = useRef(null);

  // Auto-focus buscador al montar
  useEffect(() => { searchBarRef.current?.focus(); }, []);

  // Sincronizar estados de checkboxes al cambiar dataset
  useEffect(() => {
    const initial = {};
    (employeesDailyBalances || []).forEach(db => {
      initial[db._id] = {
        lateDiscount: db.lateDiscount,
        restDay: db.restDay,
        dayDiscount: db.dayDiscount
      }
    })
    setCheckboxStates(initial)
  }, [employeesDailyBalances]);

  const optimisticUpdate = (dailyBalanceId, field, value) => {
    setCheckboxStates(prev => ({
      ...prev,
      [dailyBalanceId]: { ...prev[dailyBalanceId], [field]: value }
    }))
  }

  const handleDailyBalanceInputs = useCallback(async (e, dailyBalanceId) => {
    const { id: field, checked: value } = e.target
    setInlineError(null)
    optimisticUpdate(dailyBalanceId, field, value)
    setUpdatingIds(prev => new Set(prev).add(dailyBalanceId))
    try {
      const res = await fetch('/api/employee/update-daily-balance/' + dailyBalanceId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      })
      const data = await res.json()
      if (!res.ok || data.success === false) {
        // revert
        optimisticUpdate(dailyBalanceId, field, !value)
        setInlineError(data?.message || 'Error al actualizar')
      }
    } catch (err) {
      optimisticUpdate(dailyBalanceId, field, !value)
      setInlineError(err.message)
    } finally {
      setUpdatingIds(prev => { const n = new Set(prev); n.delete(dailyBalanceId); return n })
    }
  }, [])

  const renderHeader = () => (
    <div id='header' className='hidden md:grid grid-cols-12 gap-4 items-center font-semibold mt-4 text-xs lg:text-sm'>
      <p className='p-2 rounded-lg col-span-4 text-center'>Empleado</p>
      <p className='p-2 rounded-lg col-span-2 text-center'>Retardo</p>
      <p className='p-2 rounded-lg col-span-2 text-center'>Descanso</p>
      <p className='p-2 rounded-lg col-span-2 text-center'>Falta</p>
      <p className='p-2 rounded-lg col-span-2 text-center'>Estado</p>
    </div>
  )

  const skeleton = (
    <div className='animate-pulse space-y-2 mt-4'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className='h-10 bg-gray-200 rounded-md' />
      ))}
    </div>
  )

  const emptyState = (
    <div className='mt-6 text-center text-sm text-gray-500'>
      {filterText ? 'No hay coincidencias con el filtro.' : 'No hay registros para esta fecha.'}
    </div>
  )

  return (
    <div className='mt-2'>
      {!today && (
        <div className='flex flex-wrap gap-2 mb-3'>
          <button
            onClick={() => setShowToday(false)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${!showToday ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >Día seleccionado</button>
          <button
            onClick={() => setShowToday(true)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${showToday ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >Hoy</button>
        </div>
      )}
      <div className='border bg-white shadow-lg p-4 rounded-xl'>
        <SectionHeader label={'Empleados'} />
        <div id='filterBySupervisor' className='w-full sticky top-16 bg-white z-30 mt-2'>
          <SearchBar
            ref={searchBarRef}
            handleFilterTextChange={setFilterText}
            value={filterText}
            placeholder={'Búsqueda de empleados'}
          />
        </div>
        {error && <p className='mt-3 text-sm text-red-600'>{error}</p>}
        {loading && skeleton}
        {!loading && employeesDailyBalances?.length === 0 && emptyState}
        {!loading && employeesDailyBalances?.length > 0 && (
          <div className='mt-2'>
            {renderHeader()}
            <ul className='mt-1 space-y-2'>
              {employeesDailyBalances.map(db => {
                const rowState = checkboxStates[db._id] || {}
                const updating = updatingIds.has(db._id)
                return (
                  <li
                    key={db._id}
                    className='group border border-gray-200 rounded-lg px-3 py-2 flex flex-col md:grid md:grid-cols-12 md:items-center gap-2 md:gap-0 bg-white hover:border-blue-300 transition'
                  >
                    {/* Empleado */}
                    <div className='md:col-span-4 flex items-center gap-2'>
                      <span className='inline-block w-2 h-2 rounded-full bg-blue-500' />
                      <Link
                        to={db.employee ? '/perfil/' + db.employee._id : ''}
                        className='text-sm font-medium text-blue-700 hover:underline truncate'
                      >
                        {db.employee ? `${db.employee.name} ${db.employee.lastName}` : 'Trabajador despedido'}
                      </Link>
                    </div>
                    {/* Retardo */}
                    <div className='md:col-span-2 flex items-center justify-between md:justify-center'>
                      <label htmlFor={`late-${db._id}`} className='md:hidden text-xs font-medium text-gray-500'>Retardo</label>
                      <input
                        id={`late-${db._id}`}
                        type='checkbox'
                        className='h-5 w-5 accent-blue-600 cursor-pointer'
                        checked={!!rowState.lateDiscount}
                        disabled={updating}
                        onChange={(e) => handleDailyBalanceInputs(e, db._id)}
                        name='lateDiscount'
                      />
                    </div>
                    {/* Descanso */}
                    <div className='md:col-span-2 flex items-center justify-between md:justify-center'>
                      <label htmlFor={`rest-${db._id}`} className='md:hidden text-xs font-medium text-gray-500'>Descanso</label>
                      <input
                        id={`rest-${db._id}`}
                        type='checkbox'
                        className='h-5 w-5 accent-blue-600 cursor-pointer'
                        checked={!!rowState.restDay}
                        disabled={updating}
                        onChange={(e) => handleDailyBalanceInputs(e, db._id)}
                        name='restDay'
                      />
                    </div>
                    {/* Falta */}
                    <div className='md:col-span-2 flex items-center justify-between md:justify-center'>
                      <label htmlFor={`day-${db._id}`} className='md:hidden text-xs font-medium text-gray-500'>Falta</label>
                      <input
                        id={`day-${db._id}`}
                        type='checkbox'
                        className='h-5 w-5 accent-blue-600 cursor-pointer'
                        checked={!!rowState.dayDiscount}
                        disabled={updating}
                        onChange={(e) => handleDailyBalanceInputs(e, db._id)}
                        name='dayDiscount'
                      />
                    </div>
                    {/* Estado */}
                    <div className='md:col-span-2 flex items-center justify-start md:justify-center'>
                      {updating && <span className='text-[10px] md:text-xs text-blue-600 font-medium animate-pulse'>Guardando...</span>}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        {inlineError && <p className='mt-3 text-xs text-red-500'>{inlineError}</p>}
      </div>
    </div>
  )
}
