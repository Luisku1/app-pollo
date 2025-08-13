/* eslint-disable react/prop-types */
import { MdEdit } from "react-icons/md"
import { useRoles } from "../context/RolesContext"
import { PiNumberZeroBold } from "react-icons/pi"
import { formatInformationDate, isToday } from "../helpers/DatePickerFunctions"
import { useSelector } from "react-redux"
import { useState } from "react"
import { ToastDanger, ToastSuccess } from "../helpers/toastify"
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
import EmployeeName from "./Names/EmployeeName.jsx"

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

  // Barra superior de color según balance
  const getBarColor = () => {
    if (supervisorReport.balance < 0) return 'bg-red-500';
    if (supervisorReport.onZero) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div
      id={`supervisor-report-container-${supervisorReport._id}`}
      className={
        `relative w-full max-w-xl mx-auto rounded-2xl shadow-lg border border-gray-200 bg-white transition-all duration-200`
      }
      key={supervisorReport._id}
    >
      {/* Barra superior de color */}
      <div className={`h-2 w-full rounded-t-2xl ${getBarColor()}`}></div>
      <div id={`supervisor-report-card-${supervisorReport._id}`} className="p-4">
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
        <div className="flex justify-between items-center mb-2">
          <EmployeeName employee={supervisorReport.supervisor} />
          <div className="flex items-center gap-1">
            <p className="text-base font-semibold text-red-500">
              {formatInformationDate(new Date(supervisorReport.createdAt))}
            </p>
          </div>
        </div>
        {/* Balance visual destacado */}
        <div className="flex items-center gap-3 mb-3">
          <span className={`inline-block w-3 h-3 rounded-full ${supervisorReport.balance < 0 ? 'bg-red-500' : supervisorReport.onZero ? 'bg-yellow-400' : 'bg-green-500'}`}></span>
          <span className={`font-bold text-lg ${supervisorReport.balance < 0 ? 'text-red-700' : supervisorReport.onZero ? 'text-yellow-700' : 'text-green-700'}`}>
            {parseFloat(supervisorReport.balance).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
          </span>
          <span className="text-gray-500 text-sm">Balance</span>
        </div>
        {/* Herramientas */}
        <div name='tools' className="w-full flex flex-row-reverse text-2xl gap-2 pr-1 mb-2">
          <button className="border border-gray-300 rounded-lg p-1 bg-white hover:bg-gray-100" onClick={() => handleReloadReport()} title="Recalcular">
            <TbReload />
          </button>
          <button onClick={() => { setEditingReport(true) }} className="border border-gray-300 rounded-lg p-1 bg-white hover:bg-gray-100" title="Editar">
            <MdEdit />
          </button>
          <button className={`border border-gray-300 rounded-lg p-1 bg-white hover:bg-gray-100 ${!isController(currentUser.companyData?.[0].role) ? blockedButton : ''}`} disabled={!isController(currentUser.companyData?.[0].role)} onClick={() => handleSetReportOnZero(supervisorReport._id)} title="Poner en cero">
            <PiNumberZeroBold />
          </button>
          <button className="border border-gray-300 rounded-lg p-1 bg-white hover:bg-gray-100" onClick={handleDownloadImage} title="Descargar imagen">
            <AiOutlineDownload />
          </button>
          <button className="border border-gray-300 rounded-lg p-1 bg-white hover:bg-gray-100" onClick={handleCopyImage} title="Copiar imagen">
            <AiOutlineCopy />
          </button>
        </div>
        {/* Loader */}
        <div className="relative">
          {loading && toModifyReport == supervisorReport._id && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
              <FaSpinner className="text-4xl animate-spin" />
            </div>
          )}
          <div className={`${loading && toModifyReport == supervisorReport._id ? 'blur-sm' : ''}`}>
            {/* Resumen financiero */}
            <div className="space-y-2 mt-2">
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <ShowListModal
                  title={`Gastos de ${supervisorReport.supervisor.name}`}
                  ListComponent={ExtraOutgoingsList}
                  ListComponentProps={{ extraOutgoings: supervisorReport.extraOutgoingsArray ?? [], totalExtraOutgoings: supervisorReport.extraOutgoings }}
                  className={'w-full h-full border border-gray-200 rounded-lg'}
                  clickableComponent={
                    <p className="font-semibold text-base border border-black bg-green-100 rounded-lg bg-opacity-50 text-center text-gray-800">
                      Gastos: {currency({ amount: supervisorReport.extraOutgoings })}
                    </p>
                  }
                  data={supervisorReport.extraOutgoingsArray ?? []}
                />
                <ShowIncomesModal
                  title={`Depósitos de ${supervisorReport.supervisor.name}`}
                  clickableComponent={
                    <p className="font-semibold text-base bg-green-100 rounded-lg bg-opacity-50 text-center text-gray-800">
                      Depósitos: {currency({ amount: supervisorReport.deposits + supervisorReport.terminalIncomes })}
                    </p>
                  }
                  incomes={[...supervisorReport.terminalIncomesArray ?? [], ...supervisorReport.depositsArray ?? []]}
                />
                <ShowIncomesModal
                  title={`Efectivo de ${supervisorReport.supervisor.name}`}
                  clickableComponent={
                    <p className="font-semibold text-base bg-green-100 items-center rounded-lg bg-opacity-50 text-center text-gray-800">
                      Efectivo bruto: {currency({ amount: supervisorReport.cash })}
                    </p>
                  }
                  incomes={supervisorReport.cashArray ?? []}
                />
                <div className="flex flex-wrap gap-1 justify-center font-semibold border border-black text-base bg-red-200 bg-opacity-40 rounded-lg text-center text-black items-center">
                  <p>Efectivo final:</p>
                  <p>{(supervisorReport.cash - supervisorReport.extraOutgoings).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                </div>
              </div>
            </div>
            {/* Faltante */}
            {(!isToday(supervisorReport.createdAt) || isManager(currentUser.companyData?.[0].role) || supervisorReport.balance < 0) && (
              <div className="mt-3 border-t border-gray-300 pt-3">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-600 text-base">Faltante:</p>
                  <p
                    className={`text-base font-bold ${supervisorReport.balance < 0
                      ? 'text-red-700'
                      : 'text-green-600'
                      }`}
                  >
                    {isManager(currentUser.companyData?.[0].role) || supervisorReport.balance < 0
                      ? parseFloat(supervisorReport.balance).toLocaleString('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                      })
                      : (supervisorReport.balance > 0 ? '$0.00' : '$0.00')
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
