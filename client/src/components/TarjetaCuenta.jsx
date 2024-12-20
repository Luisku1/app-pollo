import { Link } from "react-router-dom"
import { isToday } from "../helpers/DatePickerFunctions"
import { useRoles } from "../context/RolesContext"

/* eslint-disable react/prop-types */
export default function TarjetaCuenta({ reportArray, currentUser }) {

  const roles = useRoles()
  const reports = reportArray

  return (

    <div className="">
      {roles && reports.map((reportData) => (
        <Link
          key={reportData._id}
          className={`block p-5 mb-4 mt-4 rounded-3xl shadow-lg border transition-all duration-200 ${reportData.balance < 0 ? 'bg-pastel-pink hover:shadow-red-400/30' : 'bg-white hover:shadow-gray-200'
            } hover:scale-[1.01] hover:border-pink-300`}
          to={`/formato/${reportData.createdAt}/${reportData.branch._id}`}
        >
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg font-semibold text-red-500">{reportData.branch.branch}</p>
            <div className="flex items-center gap-1">
              <p className="text-lg font-semibold text-red-500">Fecha:</p>
              <p className="text-lg font-semibold text-black">
                {`${isToday(reportData.createdAt) ? 'hoy ' : ''}` + (new Date(reportData.createdAt)).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Encargado y Auxiliar */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-bold text-lg text-gray-600">Encargado:</p>
                <p className="text-black font-semibold">{reportData.employee?.name || 'Sin empleado'}</p>
              </div>
              {reportData.assistant?.name && (
                <div>
                  <p className="font-bold text-lg text-gray-600">Auxiliar:</p>
                  <p className="text-black font-semibold">{reportData.assistant?.name}</p>
                </div>
              )}
            </div>

            {/* Resumen financiero */}
            <div className="overflow-x-auto">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                {/* Primer grupo: Efectivo, Sobrante, Gastos, Salidas */}
                <div>
                  <p className="font-semibold text-lg">Efectivo:</p>
                  <p className="text-gray-800">
                    {reportData.incomes.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-lg">Sobrante:</p>
                  <p className="text-gray-800">
                    {reportData.finalStock.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-lg">Gastos:</p>
                  <p className="text-gray-800">
                    {reportData.outgoings.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-lg">Salidas:</p>
                  <p className="text-gray-800">
                    {reportData.outputs.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </p>
                </div>

                {/* Segundo grupo: Entradas, Inicial */}
                <div>
                  <p className="font-semibold text-lg">Entradas:</p>
                  <p className="text-gray-800">
                    {Math.abs((reportData.inputs) + Math.abs(reportData.providerInputs)).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-lg">Inicial:</p>
                  <p className="text-gray-800">
                    {reportData.initialStock.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Faltante */}
          {(!isToday(reportData.createdAt) || roles.managerRole?._id === currentUser.role || reportData.balance < 0) && (
            <div className="mt-4 border-t-2 border-black pt-4">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-600 text-lg">Faltante:</p>
                <p
                  className={`text-lg font-bold ${reportData.balance < 0
                    ? 'text-red-700'
                    : roles.managerRole?._id === currentUser.role
                      ? 'text-gray-800'
                      : 'text-green-600'
                    }`}
                >
                  {reportData.balance > 0
                    ? roles.managerRole?._id === currentUser.role
                      ? parseFloat(reportData.balance).toLocaleString('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                      })
                      : '$0.00'
                    : parseFloat(reportData.balance).toLocaleString('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                    })}
                </p>
              </div>
            </div>
          )}
        </Link>
      ))}
    </div>


  )
}
