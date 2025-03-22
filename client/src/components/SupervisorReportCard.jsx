/* eslint-disable react/prop-types */
import { MdEdit } from "react-icons/md"
import { useRoles } from "../context/RolesContext"
import { PiNumberZeroBold } from "react-icons/pi"
import { formatInformationDate, isToday } from "../helpers/DatePickerFunctions"
import { useSelector } from "react-redux"
import { useState } from "react"
import { ToastDanger } from "../helpers/toastify"
import { TbReload } from "react-icons/tb"
import { blockedButton } from "../helpers/Constants"
import { FaSpinner } from "react-icons/fa"
import ExtraOutgoingsList from "../components/Outgoings/ExtraOutgoingsList.jsx";
import ShowIncomesModal from "../components/Incomes/ShowIncomesModal.jsx";
import ShowListModal from "../components/Modals/ShowListModal.jsx";
import { currency, getEmployeeFullName } from "../helpers/Functions"
import { CgProfile } from "react-icons/cg"
import { recalculateSupervisorReport } from "../services/Supervisors/recalculateSupervisorReport.js"
import { setSupervisorReportOnZero } from "../services/Supervisors/setSupervisorReportOnZero.js"
import Modal from "./Modals/Modal.jsx"
import RegistrarDineroReportado from "./RegistrarDineroReportado.jsx"

export default function SupervisorReportCard({ supervisorReport, replaceReport, externalIndex, selfChange }) {

  const { currentUser } = useSelector((state) => state.user)
  const { isController, isManager } = useRoles()
  const [toModifyReport, setToModifyReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editingReport, setEditingReport] = useState(false)

  const handleSetReportOnZero = async (reportId) => {
    try {
      setLoading(true)
      setToModifyReport(reportId)
      await setSupervisorReportOnZero(reportId)
      replaceReport({ ...supervisorReport, balance: 0 }, externalIndex)
      if (selfChange) selfChange({ ...supervisorReport, balance: 0 })
      setToModifyReport(null)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setToModifyReport(null)
      setLoading(false)
      ToastDanger('Hubo un error al establecer el balance en cero')
    }
  }

  const handleReloadReport = async () => {
    try {
      setLoading(true)
      setToModifyReport(supervisorReport._id)
      const updatedReport = await recalculateSupervisorReport(supervisorReport._id)
      replaceReport({...supervisorReport, balance: updatedReport.balance}, externalIndex)
      if (selfChange) selfChange({...supervisorReport, balance: updatedReport.balance})
      setToModifyReport(null)
      setLoading(false)
    } catch (error) {
      console.error(error)
      setToModifyReport(null)
      setLoading(false)
      ToastDanger('Hubo un error al recalcular el reporte')
    }
  }

  return (
    <div
      className={`w-full p-1 mb-4 mt-4 rounded-3xl border border-black shadow-md transition-all duration-200 ${supervisorReport.balance < 0 ? 'bg-pastel-pink' : supervisorReport.onZero ? 'bg-yellow-100' : 'bg-white'}`}
      key={supervisorReport._id}>
      {editingReport && (
        <Modal
          closeModal={() => setEditingReport(false)}
          content={
            <RegistrarDineroReportado
              supervisorId={supervisorReport.supervisor._id}
              date={supervisorReport.createdAt}
              replaceReport={replaceReport}
            />
          }
        />
      )}
      <div className="flex justify-between items-center px-2 pt-1 mb-2">
        <p className="text-lg font-semibold text-red-500 flex items-center gap-1"><CgProfile />{getEmployeeFullName(supervisorReport.supervisor)}</p>
        <div className="flex items-center gap-1">
          <p className="text-lg font-semibold text-red-500">
            {formatInformationDate(new Date(supervisorReport.createdAt))}
          </p>
        </div>
      </div>
      <div className="w-full flex flex-row-reverse text-3xl gap-3 pr-2">
        <button className="border border-black rounded-lg" onClick={() => handleReloadReport()}>
          <TbReload />
        </button>
        <button onClick={() => { setEditingReport(true) }} className="border border-black rounded-lg">
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
          <div className="space-y-4 mt-2">
            {/* Resumen financiero */}
            <div className="overflow-x-auto">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 text-left">
                {/* Primer grupo: Depósitos, Gastos, Efectivo */}
                <ShowListModal
                  title={`Gastos de ${supervisorReport.supervisor.name}`}
                  ListComponent={ExtraOutgoingsList}
                  ListComponentProps={{ extraOutgoings: supervisorReport.extraOutgoingsArray ?? [], totalExtraOutgoings: supervisorReport.extraOutgoings }}
                  className={'w-full h-full border border-black rounded-lg'}
                  clickableComponent={
                    <p className="font-semibold text-lg bg-green-400 rounded-lg bg-opacity-50 text-center text-gray-800">
                      Gastos: {currency({ amount: supervisorReport.extraOutgoings })}
                    </p>
                  }
                  data={supervisorReport.extraOutgoingsArray ?? []}
                />
                <ShowIncomesModal
                  title={`Depósitos de ${supervisorReport.supervisor.name}`}
                  clickableComponent={
                    <p className="font-semibold text-lg bg-green-400 rounded-lg bg-opacity-50 text-center text-gray-800">
                      Depósitos: {currency({ amount: supervisorReport.deposits + supervisorReport.terminalIncomes })}
                    </p>
                  }
                  incomes={[...supervisorReport.terminalIncomesArray ?? [], ...supervisorReport.depositsArray ?? []]}
                />
                <ShowIncomesModal
                  title={`Efectivo de ${supervisorReport.supervisor.name}`}
                  clickableComponent={
                    <p className="font-semibold text-lg bg-green-400 items-center rounded-lg bg-opacity-50 text-center text-gray-800">
                      Efectivo bruto: {currency({ amount: supervisorReport.cash })}
                    </p>
                  }
                  incomes={supervisorReport.cashArray ?? []}
                />
                {/* Segundo grupo: Efectivo neto */}
                <div className="flex flex-wrap gap-1 justify-center font-semibold text-lg bg-red-500 bg-opacity-40 rounded-lg text-center text-black items-center">
                  <p>
                    Efectivo final:
                  </p>
                  <p>{(supervisorReport.cash - supervisorReport.extraOutgoings).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                </div>
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
