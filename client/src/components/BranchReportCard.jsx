/* eslint-disable react/prop-types */
import { MdEdit } from "react-icons/md"
import { useRoles } from "../context/RolesContext"
import { PiNumberZeroBold } from "react-icons/pi"
import { MdPersonAdd } from "react-icons/md";
import { formatInformationDate, isToday } from "../helpers/DatePickerFunctions"
import { useSelector } from "react-redux"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { setBalanceOnZero } from "../services/BranchReports/setBalanceOnZero"
import { ToastDanger, ToastSuccess } from "../helpers/toastify"
import { TbReload } from "react-icons/tb"
import { FaSpinner } from "react-icons/fa"
import ShowListModal from "./Modals/ShowListModal"
import IncomesList from "./Incomes/IncomesList"
import StockList from "./Stock/StockList"
import OutgoingsList from "./Outgoings/OutgoingsList"
import ListaSalidas from "./Movimientos/Salidas/ListaSalidas"
import ListaEntradas from "./Movimientos/Entradas/ListaEntradas"
import { MdPriceChange } from "react-icons/md";
import ChangeBranchPrices from "./Prices/ChangeBranchPrices"
import EmployeeInfo from "./EmployeeInfo"
import { CgProfile } from "react-icons/cg"
import { toPng } from "html-to-image";
import { AiOutlineDownload, AiOutlineCopy, AiOutlineLink } from "react-icons/ai";
import { recalculateBranchReport } from "../services/BranchReports/updateBranchReport"
import { SelectReportEmployees } from "./SelectReportEmployees"
import Modal from "./Modals/Modal"
import { useEmployees } from "../hooks/Employees/useEmployees"
import { updateReportEmployees } from "../services/BranchReports/updateReportsEmployee"
import { areArraysEqual } from "../../../common/arraysOps";
import { formatDateYYYYMMDD } from "../../../common/dateOps";
import EmployeeName from "./Names/EmployeeName";
import BranchName from "./Names/BranchName";

export default function BranchReportCard({
  reportData = {},
  updateBranchReportGroup, // (employeeId, report)
  updateBranchReportSingle, // (report)
  employeeId, // for group cache
  selfChange
}) {

  const { currentUser, company } = useSelector((state) => state.user)
  const companyId = company?._id || company
  const { isController, isManager } = useRoles()
  const [toModifyReport, setToModifyReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showSelectReportEmployees, setShowSelectReportEmployees] = useState(false)
  const { activeEmployees: employees } = useEmployees({ companyId })
  const navigate = useNavigate()
  const assistants = reportData.assistants || []

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

  const onPricesChange = (newReport) => {

    updateBranchReportSingle && updateBranchReportSingle(newReport)
    updateBranchReportGroup && employeeId && updateBranchReportGroup(employeeId, newReport)
    selfChange && selfChange(newReport)
  }

  const onRegisterEmployees = async (selectedEmployee, selectedAssistants) => {

    let employeeChanged = false;
    let assistantsChanged = false;
    setShowSelectReportEmployees(false);

    if (selectedEmployee?._id !== reportData?.employee?._id) {
      employeeChanged = true;
    }
    if ((selectedAssistants.length > 0 && assistants.length === 0) || (!areArraysEqual(selectedAssistants, assistants))) {
      assistantsChanged = true;
    }

    if (!(assistantsChanged || employeeChanged)) {
      ToastInfo('No se han realizado cambios en los empleados del reporte');
      return;
    }

    let newReport = {
      ...reportData
    }

    if (assistantsChanged)
      newReport.assistant = selectedAssistants.map(assistant => assistant)
    if (employeeChanged)
      newReport.employee = selectedEmployee

    if (updateBranchReportGroup && employeeId) updateBranchReportGroup(employeeId, newReport)

    if (updateBranchReportSingle) updateBranchReportSingle(newReport)

    if (selfChange) selfChange(newReport);

    await updateReportEmployees({ reportId: reportData._id, employeeId: selectedEmployee._id, assistants: selectedAssistants });
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
    navigate(`/formato/${reportData.branch._id}/${formatDateYYYYMMDD(new Date(reportData.createdAt))}`)
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


  // Copiar solo el link
  const handleCopyLink = async () => {
    try {
      const text = `${window.location.origin}/formato/${reportData.createdAt}/${reportData.branch._id}`;
      await navigator.clipboard.writeText(text);
      ToastSuccess("Link copiado al portapapeles");
    } catch (error) {
      ToastDanger("Hubo un error al copiar el link");
    }
  };

  // Copiar solo la imagen
  const handleCopyImage = async () => {
    try {
      const node = document.getElementById(`report-container-${reportData._id}`);
      const toolsDiv = document.querySelector(`#report-card-${reportData._id} [name='tools']`);
      toolsDiv.style.display = "none";
      const clonedNode = node.cloneNode(true);
      clonedNode.style.paddingBottom = "10px";
      clonedNode.style.width = "400px";
      document.body.appendChild(clonedNode);
      const dataUrl = await toPng(clonedNode);
      document.body.removeChild(clonedNode);
      toolsDiv.style.display = "";
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob
        })
      ]);
      ToastSuccess("Imagen copiada al portapapeles");
    } catch (error) {
      console.error("Error copying image:", error);
      ToastDanger("Hubo un error al copiar la imagen");
    }
  };

  console.log(currentUser.companyData?.[0].role)
  return (
    <div
      id={`report-container-${reportData._id}`}
      className={`w-full border border-black shadow-md transition-all duration-200 bg-white rounded-lg`} // fondo neutro, barra arriba
      key={reportData._id}>
      {/* Franja de estado visual arriba */}
      <div
        className={`w-full h-2 rounded-t-lg
          ${reportData.balance < 0 ? 'bg-red-500' : reportData.onZero ? 'bg-yellow-100' : 'bg-green-200'}`}
      />
      <div id={`report-card-${reportData._id}`} className={`bg-white rounded-b-lg p-2`}>

        <div className="flex justify-between items-center px-2 mb-2">
          <BranchName branch={reportData.branch} />
          <div className="flex items-center gap-1">
            <p className="text-lg font-semibold text-red-500">
              {formatInformationDate(new Date(reportData.createdAt))}
            </p>
          </div>
        </div>
        <div name='tools' className="w-full flex flex-row-reverse flex-wrap text-3xl gap-3 pr-2">
          <button className="border h-fit border-black rounded-lg" onClick={() => handleReloadReport(reportData)}>
            <TbReload />
          </button>
          <button onClick={() => { navToEditReport(reportData) }} className="border h-fit border-black rounded-lg">
            <MdEdit />
          </button>
          {isController(currentUser.companyData?.[0].role) &&
            <button className={`border h-fit border-black rounded-lg`} disabled={!isController(currentUser.companyData?.[0].role)} onClick={() => handleSetReportOnZero(reportData)}>
              <PiNumberZeroBold />
            </button>
          }
          {showSelectReportEmployees && (
            <Modal
              content={
                <SelectReportEmployees
                  branch={reportData.branch}
                  employees={employees}
                  currentAssistants={reportData.assistant}
                  currentReportEmployee={reportData.employee}
                  onRegisterEmployees={onRegisterEmployees}
                />
              }
              closeModal={() => setShowSelectReportEmployees(false)}
            />
          )}
          {(currentUser.companyData?.[0].role) && (
            <ChangeBranchPrices
              branch={reportData.branch._id}
              date={reportData.createdAt}
              pricesDate={reportData.pricesDate}
              onUpdateBranchReport={onPricesChange}
            >
              <MdPriceChange />
            </ChangeBranchPrices>
          )}
          <button className="border h-fit border-black rounded-lg" onClick={handleDownloadImage}>
            <AiOutlineDownload />
          </button>
          <button className="border h-fit border-black rounded-lg" onClick={handleCopyLink} title="Copiar link">
            <AiOutlineLink />
          </button>
          <button className="border h-fit border-black rounded-lg" onClick={handleCopyImage} title="Copiar imagen">
            <AiOutlineCopy />
          </button>
          <button
            className="border h-fit border-black rounded-lg flex items-center justify-center"
            title="Asignar empleados"
            onClick={() => setShowSelectReportEmployees(true)}
          >
            <MdPersonAdd />
          </button>
        </div>
        <div className="relative">
          {loading && toModifyReport == reportData._id && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
              <FaSpinner className="text-4xl animate-spin" />
            </div>
          )}
          <div id={`card-info-${reportData._id}`} className={`${loading && toModifyReport == reportData._id ? 'blur-sm' : ''} px-3`}>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm text-left">
                <div className="flex gap-2 flex-wrap items-center">
                  {reportData.employee ? (
                    <EmployeeName employee={reportData.employee} />
                  ) :
                    <p className="text-gray-500">Personal no asignado</p>
                  }
                </div>
                {assistants && assistants.length > 0 && (
                  <div className='flex gap-2 py-2 items-center'>
                    <p className='flex-shrink-0'>Auxiliares:</p>
                    <div className='flex flex-wrap gap-2'>
                      {assistants.map((assistant) => (
                        <EmployeeName employee={assistant} assistant={true} />
                      ))}
                    </div>
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
            {/* Faltante compacto y menos invasivo */}
            {(!isToday(reportData.createdAt) || isManager(currentUser.companyData?.[0].role) || reportData.balance < 0) && (
              <div className="flex justify-end items-center">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm transition
                    ${reportData.balance < 0
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'}
                  `}
                  title={reportData.balance < 0 ? 'Faltante detectado en el balance' : 'Balance del reporte'}
                >
                  {reportData.balance < 0 ? 'Faltante' : 'Balance'}:&nbsp;
                  {isManager(currentUser.companyData?.[0].role) || reportData.balance < 0
                    ? parseFloat(reportData.balance).toLocaleString('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                    })
                    : '$0.00'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
