/* eslint-disable react/prop-types */
import { MdEdit } from "react-icons/md"
import { useRoles } from "../context/RolesContext"
import { PiNumberZeroBold } from "react-icons/pi"
import { formatInformationDate, isToday } from "../helpers/DatePickerFunctions"
import { useSelector } from "react-redux"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { setBalanceOnZero } from "../services/BranchReports/setBalanceOnZero"
import { recalculateBranchReport } from "../services/BranchReports/updateBranchReport"
import { ToastDanger } from "../helpers/toastify"
import { TbReload } from "react-icons/tb"
import { blockedButton } from "../helpers/Constants"
import { FaSpinner } from "react-icons/fa"
import ExtraOutgoingsList from "../components/Outgoings/ExtraOutgoingsList.jsx";
import ShowIncomesModal from "../components/Incomes/ShowIncomesModal.jsx";
import ShowListModal from "../components/Modals/ShowListModal.jsx";
import { currency, getEmployeeFullName } from "../helpers/Functions"

export default function SupervisorReportCard({ supervisorReport, replaceReport, externalIndex }) {
  const { currentUser } = useSelector((state) => state.user)
  const { isController, isManager } = useRoles()
  const [toModifyReport, setToModifyReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSetReportOnZero = async (reportId) => {
    try {
      setLoading(true)
      setToModifyReport(reportId)
      replaceReport(await setBalanceOnZero(reportId), externalIndex)
      setToModifyReport(null)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setToModifyReport(null)
      setLoading(false)
      ToastDanger('Hubo un error al establecer el balance en cero')
    }
  }

  const handleReloadReport = async (report) => {
    try {
      setLoading(true)
      setToModifyReport(report._id)
      const updatedReport = await recalculateBranchReport(report)
      replaceReport(updatedReport, externalIndex)
      setToModifyReport(null)
      setLoading(false)
    } catch (error) {
      console.error(error)
      setToModifyReport(null)
      setLoading(false)
      ToastDanger('Hubo un error al recalcular el reporte')
    }
  }

  const navToEditReport = (reportData) => {
    navigate(`/formato/${reportData.createdAt}/${reportData.branch._id}`)
  }

  return (
    <div
      className={`w-full p-1 mb-4 mt-4 rounded-3xl border border-black shadow-md transition-all duration-200 ${supervisorReport.balance < 0 ? 'bg-pastel-pink' : supervisorReport.onZero ? 'bg-yellow-100' : 'bg-white'}`}
      key={supervisorReport._id}>
      <div className="flex justify-between items-center px-2 pt-1 mb-4">
        <p className="text-lg font-semibold text-red-500">{supervisorReport.supervisor.name}</p>
        <div className="flex items-center gap-1">
          <p className="text-lg font-semibold text-red-500">
            {formatInformationDate(new Date(supervisorReport.createdAt))}
          </p>
        </div>
      </div>
      <div className="w-full flex flex-row-reverse text-3xl gap-3 pr-2">
        <button className="border border-black rounded-lg" onClick={() => handleReloadReport(supervisorReport)}>
          <TbReload />
        </button>
        <button onClick={() => { navToEditReport(supervisorReport) }} className="border border-black rounded-lg">
          <MdEdit />
        </button>
        <button className={`border border-black rounded-lg ${!isController(currentUser.role) ? blockedButton : ''}`} disabled={!isController(currentUser.role)} onClick={() => handleSetReportOnZero(supervisorReport._id)}>
          <PiNumberZeroBold />
        </button>
      </div>
      <div className="relative">
        {loading && toModifyReport == supervisorReport._id && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
            <FaSpinner className="text-4xl animate-spin" />
          </div>
        )}
        <div className={`${loading && toModifyReport == supervisorReport._id ? 'blur-sm' : ''} px-3`}>
          <div className="space-y-4">
            {/* Encargado y Auxiliar */}
            <div className="grid grid-cols-2 gap-4 text-sm text-left">
              <div>
                <p className="font-bold text-lg text-gray-600">Supervisor:</p>
                <p className="text-black font-semibold">{getEmployeeFullName(supervisorReport.supervisor)}</p>
              </div>
            </div>
            {/* Resumen financiero */}
            <div className="overflow-x-auto">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 text-left">
                {/* Primer grupo: Depósitos, Gastos, Efectivo */}
                <ShowIncomesModal
                  title={`Depósitos de ${supervisorReport.supervisor.name}`}
                  clickableComponent={
                    <p className="font-semibold text-lg bg-green-400 rounded-lg bg-opacity-50 text-center text-gray-800">
                      Depósitos: {currency({ amount: supervisorReport.deposits + supervisorReport.terminalIncomes })}
                    </p>
                  }
                  incomes={[...supervisorReport.terminalIncomesArray ?? [], ...supervisorReport.depositsArray ?? []]}
                />
                <ShowListModal
                  title={`Gastos de ${supervisorReport.supervisor.name}`}
                  ListComponent={ExtraOutgoingsList}
                  ListComponentProps={{ extraOutgoings: supervisorReport.extraOutgoingsArray ?? [], totalExtraOutgoings: supervisorReport.extraOutgoings }}
                  className={'w-full'}
                  clickableComponent={
                    <p className="font-semibold text-lg bg-green-400 rounded-lg bg-opacity-50 text-center text-gray-800">
                      Gastos: {currency({ amount: supervisorReport.extraOutgoings })}
                    </p>
                  }
                  data={supervisorReport.extraOutgoingsArray ?? []}
                />
                <ShowIncomesModal
                  title={`Efectivo de ${supervisorReport.supervisor.name}`}
                  clickableComponent={
                    <p className="font-semibold text-lg bg-green-400 rounded-lg bg-opacity-50 text-center text-gray-800">
                      Efectivo: {currency({ amount: supervisorReport.cash })}
                    </p>
                  }
                  incomes={supervisorReport.cashArray ?? []}
                />
                {/* Segundo grupo: Efectivo neto */}
                <p className="font-semibold text-lg bg-red-500 bg-opacity-40 rounded-lg text-center text-black">
                  Efectivo neto: {(supervisorReport.cash - supervisorReport.extraOutgoings).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                </p>
              </div>
            </div>
          </div>
          {/* Faltante */}
          {(!isToday(supervisorReport.createdAt) || isManager(currentUser.role) || supervisorReport.balance < 0) && (
            <div className="mt-4 border-t-2 border-black pt-4">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-600 text-lg">Faltante:</p>
                <p
                  className={`text-lg font-bold ${supervisorReport.balance < 0
                    ? 'text-red-700' // Si el balance es negativo, mostrar en rojo
                    // Si es manager, mostrar en gris oscuro
                    : 'text-green-600' // Si no es manager, mostrar en verde si el balance es positivo
                    }`}
                >
                  {isManager(currentUser.role) || supervisorReport.balance < 0 // Mostrar siempre si es manager o el balance es negativo
                    ? parseFloat(supervisorReport.balance).toLocaleString('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                    })
                    : (supervisorReport.balance > 0 ? '$0.00' : '$0.00') // Para el resto de los usuarios, mostrar $0.00 solo si el balance es positivo
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
