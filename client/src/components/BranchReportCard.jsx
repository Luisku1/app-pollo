/* eslint-disable react/prop-types */
import { MdEdit } from "react-icons/md"
import { useRoles } from "../context/RolesContext"
import { PiNumberZeroBold } from "react-icons/pi"
import { formatInformationDate, isToday } from "../helpers/DatePickerFunctions"
import { useSelector } from "react-redux"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { setBalanceOnZero } from "../services/BranchReports/setBalanceOnZero"
import { ToastDanger, ToastSuccess } from "../helpers/toastify"
import { TbReload } from "react-icons/tb"
import { blockedButton } from "../helpers/Constants"
import { FaSpinner } from "react-icons/fa"
import ShowListModal from "./Modals/ShowListModal"
import IncomesList from "./Incomes/IncomesList"
import StockList from "./Stock/StockList"
import OutgoingsList from "./Outgoings/OutgoingsList"
import ListaSalidas from "./EntradasYSalidas/Salidas/ListaSalidas"
import ListaEntradas from "./EntradasYSalidas/Entradas/ListaEntradas"
import { MdPriceChange } from "react-icons/md";
import ChangeBranchPrices from "./Prices/ChangeBranchPrices"
import EmployeeInfo from "./EmployeeInfo"
import { CgProfile } from "react-icons/cg"
import { toPng } from "html-to-image";
import { AiOutlineDownload, AiOutlineCopy } from "react-icons/ai";
import { recalculateBranchReport } from "../services/BranchReports/updateBranchReport"

export default function BranchReportCard({
  reportData = {},
  updateBranchReportGroup, // (employeeId, report)
  updateBranchReportSingle, // (report)
  employeeId, // for group cache
  selfChange
}) {

  const { currentUser } = useSelector((state) => state.user)
  const { isController, isManager } = useRoles()
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [toModifyReport, setToModifyReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // On set to zero, update both caches
  const handleSetReportOnZero = async (report) => {

    try {
      setToModifyReport(report._id)
      const newReport = { ...report, balance: 0 }
      if (selfChange) selfChange(newReport)
      if (updateBranchReportGroup && employeeId) updateBranchReportGroup(employeeId, newReport)
      if (updateBranchReportSingle) updateBranchReportSingle(newReport)
      await setBalanceOnZero(report._id)
      setToModifyReport(null)

    } catch (error) {

      console.log(error)
      selfChange && selfChange()
      setToModifyReport(null)
      setLoading(false)
      ToastDanger('Hubo un error al establecer el balance en cero')
    }
  }

  // On reload, update both caches
  const handleReloadReport = async (report) => {

    try {

      setLoading(true)
      setToModifyReport(report._id)
      const updatedReport = await recalculateBranchReport(report)
      if (updateBranchReportGroup && employeeId) updateBranchReportGroup(employeeId, updatedReport)
      if (updateBranchReportSingle) updateBranchReportSingle(updatedReport)
      if (selfChange) selfChange({ ...report, balance: updatedReport.balance })
      setToModifyReport(null)
      setLoading(false)

    } catch (error) {

      console.error(error)
      if (updateBranchReportGroup && employeeId) updateBranchReportGroup(employeeId, report)
      if (updateBranchReportSingle) updateBranchReportSingle(report)
      if (selfChange) selfChange(report)
      setToModifyReport(null)
      setLoading(false)
      ToastDanger('Hubo un error al recalcular el reporte')
    }
  }

  const navToEditReport = (reportData) => {

    navigate(`/formato/${reportData.createdAt}/${reportData.branch._id}`)
  }

  const handleDownloadImage = async () => {
    try {
      const node = document.getElementById(`report-card-${reportData._id}`);
      const toolsDiv = document.querySelector(`#report-card-${reportData._id} [name='tools']`);
      toolsDiv.style.display = "none"; // Hide tools
      const dataUrl = await toPng(node);
      toolsDiv.style.display = ""; // Restore tools
      const link = document.createElement("a");
      link.download = `${reportData.branch.branch}_${reportData.createdAt.toLocaleString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error downloading image:", error);
      ToastDanger("Hubo un error al descargar la imagen");
    }
  };

  const handleCopyImage = async () => {
    try {
      const node = document.getElementById(`report-card-${reportData._id}`);
      const toolsDiv = document.querySelector(`#report-card-${reportData._id} [name='tools']`);
      toolsDiv.style.display = "none"; // Hide tools
      const clonedNode = node.cloneNode(true);
      clonedNode.style.paddingBottom = "10px";
      clonedNode.style.width = "400px";
      document.body.appendChild(clonedNode);
      const dataUrl = await toPng(clonedNode);
      document.body.removeChild(clonedNode);
      toolsDiv.style.display = ""; // Restore tools
      const blob = await (await fetch(dataUrl)).blob();
      const text = `Link de la cuenta: ${window.location.origin}/formato/${reportData.createdAt}/${reportData.branch._id}`;
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
          "text/plain": new Blob([text], { type: "text/plain" }),
        }),
      ]); -
        ToastSuccess("Imagen copiada al portapapeles");
    } catch (error) {
      console.error("Error copying image:", error);
      ToastDanger("Hubo un error al copiar la imagen");
    }
  };

  return (
    <div
      id={`report-container-${reportData._id}`}
      className={`w-full p-1 border border-black rounded-lg shadow-md transition-all duration-200 ${reportData.balance < 0 ? 'bg-pastel-pink' : reportData.onZero ? 'bg-yellow-100' : 'bg-white'}`}
      key={reportData._id}>
      <div id={`report-card-${reportData._id}`} className={`${reportData.balance < 0 ? 'bg-pastel-pink' : reportData.onZero ? 'bg-yellow-100' : 'bg-white'}`}>

        <div className="flex justify-between items-center px-2 pt-1 mb-4">
          <p className="text-lg font-semibold text-red-500">{reportData.branch.branch}</p>
          <div className="flex items-center gap-1">
            <p className="text-lg font-semibold text-red-500">
              {formatInformationDate(new Date(reportData.createdAt))}
            </p>
          </div>
        </div>
        <div name='tools' className="w-full flex flex-row-reverse text-3xl gap-3 pr-2">
          <button className="border h-fit border-black rounded-lg" onClick={() => handleReloadReport(reportData)}>
            <TbReload />
          </button>
          <button onClick={() => { navToEditReport(reportData) }} className="border h-fit border-black rounded-lg">
            <MdEdit />
          </button>
          <button className={`border h-fit border-black rounded-lg ${!isController(currentUser.role) ? blockedButton : ''}`} disabled={!isController(currentUser.role)} onClick={() => handleSetReportOnZero(reportData)}>
            <PiNumberZeroBold />
          </button>
          {isManager(currentUser.role) && (
            <ChangeBranchPrices onUpdateBranchReport={replaceReport} branch={reportData.branch._id} date={reportData.createdAt} pricesDate={reportData.pricesDate}>
              <MdPriceChange />
            </ChangeBranchPrices>
          )}
          <button className="border h-fit border-black rounded-lg" onClick={handleDownloadImage}>
            <AiOutlineDownload />
          </button>
          <button className="border h-fit border-black rounded-lg" onClick={handleCopyImage}>
            <AiOutlineCopy />
          </button>
          <EmployeeInfo employee={selectedEmployee} toggleInfo={() => setSelectedEmployee(null)} />
        </div>
        <div className="relative">
          {loading && toModifyReport == reportData._id && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
              <FaSpinner className="text-4xl animate-spin" />
            </div>
          )}
          <div id={`card-info-${reportData._id}`} className={`${reportData.balance < 0 ? 'bg-pastel-pink' : reportData.onZero ? 'bg-yellow-100' : 'bg-white'} ${loading && toModifyReport == reportData._id ? 'blur-sm' : ''} px-3`}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm text-left">
                <div className="flex gap-2 flex-wrap">
                  <p className="font-bold text-lg text-gray-600">Encargado:</p>
                  <button onClick={() => setSelectedEmployee(reportData.employee)} className="font-bold text-lg flex gap-1 truncate items-center"><span><CgProfile /></span>{reportData?.employee?.name ?? 'Sin Encargado'}</button>
                </div>
                {reportData.assistant?.name && (
                  <div>
                    <p className="font-bold text-lg text-gray-600">Auxiliar:</p>
                    <button onClick={() => setSelectedEmployee(reportData.assistant)} className="font-bold text-md flex gap-1 truncate items-center"><span><CgProfile /></span>{reportData.assistant.name}</button>
                  </div>
                )}
              </div>
              {/* Resumen financiero */}
              <div className="overflow-x-auto">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 text-left">
                  {/* Primer grupo: Efectivo, Sobrante, Gastos, Salidas */}
                  <ShowListModal
                    title={'Efectivo'}
                    ListComponent={IncomesList}
                    ListComponentProps={{ incomes: reportData.incomesArray, amount: reportData.incomes }}
                    className={'w-full'}
                    clickableComponent={
                      <p className="font-semibold text-lg bg-green-400 rounded-lg bg-opacity-50 text-center text-gray-800">
                        Efectivo: {reportData.incomes.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                      </p>
                    }
                  />
                  <ShowListModal
                    title={'Sobrante'}
                    ListComponent={StockList}
                    ListComponentProps={{ stock: reportData.finalStockArray, amount: reportData.finalStock }}
                    className={'w-full'}
                    clickableComponent={
                      <p className="font-semibold text-lg bg-green-400 rounded-lg bg-opacity-50 text-center text-gray-800">
                        Sobrante: {reportData.finalStock.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                      </p>
                    }
                  />
                  <ShowListModal
                    title={'Gastos'}
                    ListComponent={OutgoingsList}
                    ListComponentProps={{ outgoings: reportData.outgoingsArray, amount: reportData.outgoings }}
                    className={'w-full'}
                    clickableComponent={
                      <p className="font-semibold text-lg bg-green-400 rounded-lg bg-opacity-50 text-center text-gray-800">
                        Gastos: {reportData.outgoings.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                      </p>
                    }
                  />
                  <ShowListModal
                    title={'Salidas'}
                    ListComponent={ListaSalidas}
                    ListComponentProps={{ outputs: reportData.outputsArray, totalAmount: reportData.outputs }}
                    className={'w-full'}
                    clickableComponent={
                      <p className="font-semibold text-lg bg-green-400 rounded-lg bg-opacity-50 text-center text-gray-800">
                        Salidas: {reportData.outputs.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                      </p>
                    }
                  />
                  {/* Segundo grupo: Entradas, Inicial */}
                  <ShowListModal
                    title={'Entradas'}
                    ListComponent={ListaEntradas}
                    ListComponentProps={{ inputs: [...reportData.inputsArray, ...reportData.providerInputsArray], amount: Math.abs((reportData.inputs) + Math.abs(reportData.providerInputs)) }}
                    className={'w-full'}
                    clickableComponent={
                      <p className="font-semibold text-lg bg-red-500 bg-opacity-40 rounded-lg text-center text-black">
                        Entradas: {Math.abs((reportData.inputs) + Math.abs(reportData.providerInputs)).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                      </p>
                    }
                  />
                  <ShowListModal
                    title={'Inicial'}
                    ListComponent={StockList}
                    ListComponentProps={{ stock: reportData.initialStockArray, amount: reportData.initialStock }}
                    className={'w-full'}
                    clickableComponent={
                      <p className="font-semibold text-lg bg-red-500 bg-opacity-40 rounded-lg text-center text-black">
                        Inicial: {reportData.initialStock.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                      </p>
                    }
                  />
                </div>
              </div>
            </div>
            {/* Faltante */}
            {(!isToday(reportData.createdAt) || isManager(currentUser.role) || reportData.balance < 0) && (
              <div className="mt-4 border-t-2 border-black pt-4">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-600 text-lg">Faltante:</p>
                  <p
                    className={`text-lg font-bold ${reportData.balance < 0
                      ? 'text-red-700' // Si el balance es negativo, mostrar en rojo
                      // Si es manager, mostrar en gris oscuro
                      : 'text-green-600' // Si no es manager, mostrar en verde si el balance es positivo
                      }`}
                  >
                    {isManager(currentUser.role) || reportData.balance < 0 // Mostrar siempre si es manager o el balance es negativo
                      ? parseFloat(reportData.balance).toLocaleString('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                      })
                      : (reportData.balance > 0 ? '$0.00' : '$0.00') // Para el resto de los usuarios, mostrar $0.00 solo si el balance es positivo
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
