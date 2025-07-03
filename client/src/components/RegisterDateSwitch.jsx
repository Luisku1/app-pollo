import React from 'react'
import { useDateNavigation } from '../hooks/useDateNavigation'
import { formatDateYYYYMMDD } from '../../../common/dateOps';

/**
 * Switch para elegir si registrar para la fecha seleccionada o para hoy.
 * Visible solo si !today y solo si el usuario es manager.
 * @param {boolean} useToday - true para registrar para hoy, false para la fecha seleccionada
 * @param {function} setUseToday - setter para cambiar el estado
 */
export default function RegisterDateSwitch({ useToday, setUseToday }) {

  const { dateFromYYYYMMDD } = useDateNavigation();

  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="font-semibold text-sm">Registrar para:</span>
      <button
        className={`px-3 py-1 rounded-full text-xs font-bold border transition ${!useToday ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
        onClick={() => setUseToday(false)}
        type="button"
        aria-pressed={!useToday}
        title="Registrar para la fecha seleccionada en pantalla"
      >
        {formatDateYYYYMMDD(new Date(dateFromYYYYMMDD))}
      </button>
      <button
        className={`px-3 py-1 rounded-full text-xs font-bold border transition ${useToday ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
        onClick={() => setUseToday(true)}
        type="button"
        aria-pressed={useToday}
        title="Registrar para hoy (fecha actual)"
      >
        Hoy
      </button>
      <span className="ml-2 text-xs text-gray-500" title="Puedes elegir si el registro se guarda para la fecha seleccionada o para hoy.">¿Dudas? <span className="underline cursor-help">Ayuda</span></span>
    </div>
  )
}
