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
import EmployeeInfo from "./EmployeeInfo.jsx"
import { toPng } from "html-to-image";
import { AiOutlineDownload, AiOutlineCopy } from "react-icons/ai";

export default function SupervisorReportCard({
  supervisorReport,
  updateSupervisorReportGroup, // (employeeId, report)
  updateSupervisorReportSingle, // (report)
  employeeId, // for group cache
  selfChange
}) {

  const { currentUser } = useSelector((state) => state.user)
  const { isController, isManager } = useRoles()
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [toModifyReport, setToModifyReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editingReport, setEditingReport] = useState(false)

  const handleSetReportOnZero = async (reportId) => {
    try {
      setLoading(true)
      setToModifyReport(reportId)
      const newReport = { ...supervisorReport, balance: 0 }
      if (updateSupervisorReportGroup && employeeId) updateSupervisorReportGroup(employeeId, newReport)
      if (updateSupervisorReportSingle) updateSupervisorReportSingle(newReport)
      if (selfChange) selfChange(newReport)
      await setSupervisorReportOnZero(reportId)
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
      if (updateSupervisorReportGroup && employeeId) updateSupervisorReportGroup(employeeId, updatedReport)
      if (updateSupervisorReportSingle) updateSupervisorReportSingle(updatedReport)
      if (selfChange) selfChange({ ...supervisorReport, balance: updatedReport.balance })
      setToModifyReport(null)
      setLoading(false)
    } catch (error) {
      console.error(error)
      if (updateSupervisorReportGroup && employeeId) updateSupervisorReportGroup(employeeId, supervisorReport)
      if (updateSupervisorReportSingle) updateSupervisorReportSingle(supervisorReport)
      if (selfChange) selfChange(supervisorReport)
      setToModifyReport(null)
      setLoading(false)
      ToastDanger('Hubo un error al recalcular el reporte')
    }
  }

  const handleDownloadImage = async () => {
    try {
      const node = document.getElementById(`supervisor-report-card-${supervisorReport._id}`);
      const toolsDiv = document.querySelector(`#supervisor-report-card-${supervisorReport._id} [name='tools']`);
      toolsDiv.style.display = "none"; // Hide tools
      const dataUrl = await toPng(node);
      toolsDiv.style.display = ""; // Restore tools
      const link = document.createElement("a");
      link.download = `${supervisorReport.supervisor.name}_${supervisorReport.createdAt.toLocaleString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error downloading image:", error);
      ToastDanger("Hubo un error al descargar la imagen");
    }
  };

  const handleCopyImage = async () => {
    try {
      const node = document.getElementById(`supervisor-report-card-${supervisorReport._id}`);
      const toolsDiv = document.querySelector(`#supervisor-report-card-${supervisorReport._id} [name='tools']`);
      toolsDiv.style.display = "none"; // Hide tools
      const clonedNode = node.cloneNode(true);
      clonedNode.style.paddingBottom = "10px";
      clonedNode.style.width = "400px";
      document.body.appendChild(clonedNode);
      const dataUrl = await toPng(clonedNode);
      document.body.removeChild(clonedNode);
      toolsDiv.style.display = ""; // Restore tools
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob
        }),
      ]);
      ToastSuccess("Imagen copiada al portapapeles");
    } catch (error) {
      console.error("Error copying image:", error);
      ToastDanger("Hubo un error al copiar la imagen");
    }
  };

  return (
    <div
      id={`supervisor-report-container-${supervisorReport._id}`}
      className={`text-base w-full p-1 rounded-lg border border-black shadow-md transition-all duration-200 ${supervisorReport.balance < 0 ? 'bg-pastel-pink' : supervisorReport.onZero ? 'bg-yellow-100' : 'bg-white'}`}
      key={supervisorReport._id}>
      <div id={`supervisor-report-card-${supervisorReport._id}`} className={`${supervisorReport.balance < 0 ? 'bg-pastel-pink' : supervisorReport.onZero ? 'bg-yellow-100' : 'bg-white'}`}>
        <EmployeeInfo employee={selectedEmployee} toggleInfo={() => setSelectedEmployee(null)} />
        {editingReport && (
          <Modal
            closeModal={() => setEditingReport(false)}
            content={
              <RegistrarDineroReportado
                supervisorReport={supervisorReport}
                updateSupervisorReportGroup={updateSupervisorReportGroup}
                updateSupervisorReportSingle={updateSupervisorReportSingle}
                selfChange={selfChange}
              />
            }
          />
        )}
        <div className="flex justify-between items-center px-2 pt-1 mb-2">
          <button onClick={() => setSelectedEmployee(supervisorReport.supervisor)} className="font-bold text-md flex gap-1 items-center"><span><CgProfile /></span>{getEmployeeFullName(supervisorReport.supervisor)}</button>
          <div className="flex items-center gap-1">
            <p className="text-lg font-semibold text-red-500">
              {formatInformationDate(new Date(supervisorReport.createdAt))}
            </p>
          </div>
        </div>
        <div name='tools' className="w-full flex flex-row-reverse text-3xl gap-3 pr-2">
          <button className="border border-black rounded-lg" onClick={() => handleReloadReport()}>
            <TbReload />
          </button>
          <button onClick={() => { setEditingReport(true) }} className="border border-black rounded-lg">
            <MdEdit />
          </button>
          <button className={`border border-black rounded-lg ${!isController(currentUser.role) ? blockedButton : ''}`} disabled={!isController(currentUser.role)} onClick={() => handleSetReportOnZero(supervisorReport._id)}>
            <PiNumberZeroBold />
          </button>
          <button className="border border-black rounded-lg" onClick={handleDownloadImage}>
            <AiOutlineDownload />
          </button>
          <button className="border border-black rounded-lg" onClick={handleCopyImage}>
            <AiOutlineCopy />
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
    </div>
  )
}
