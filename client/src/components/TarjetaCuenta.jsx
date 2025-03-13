import { MdEdit } from "react-icons/md";
import { formatInformationDate, isToday } from "../helpers/DatePickerFunctions"
import { useRoles } from "../context/RolesContext"
import Modal from "./Modals/Modal"
import { useState } from 'react'
import RegistroCuentaDiaria from '../pages/RegistroCuentaDiaria'
import { recalculateBranchReport } from "../services/BranchReports/updateBranchReport"
import { ToastDanger } from "../helpers/toastify"
import { TbReload } from "react-icons/tb";
import { PiNumberZeroBold } from "react-icons/pi";
import { setBalanceOnZero } from "../services/BranchReports/setBalanceOnZero";
import { FaSpinner } from "react-icons/fa"; // Import loading icon
import { useSelector } from "react-redux";
import { blockedButton } from "../helpers/Constants";
import { useNavigate } from "react-router-dom";

/* eslint-disable react/prop-types */
export default function TarjetaCuenta({ reportArray, replaceReport, defaultDetailsShowed = null, payrollIndex = null }) {

  const { currentUser } = useSelector((state) => state.user)
  const { roles, isController } = useRoles()
  const [showModal, setShowModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [toModifyReport, setToModifyReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSetReportOnZero = async (reportId) => {

    try {

      setLoading(true)
      setToModifyReport(reportId)
      replaceReport(await setBalanceOnZero(reportId), payrollIndex)
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
      replaceReport(updatedReport, payrollIndex)
      setToModifyReport(null)
      setLoading(false)

    } catch (error) {

      console.error(error)
      setToModifyReport(null)
      setLoading(false)
      ToastDanger('Hubo un error al recalcular el reporte')
    }
  }

  const handleShowReport = (reportData) => {

    setSelectedReport(reportData)
    setShowModal(true)
  }

  const navToEditReport = (reportData) => {

    navigate(`/formato/${reportData.createdAt}/${reportData.branch._id}`)
  }

  return (

    <div className="w-full relative">
      <div>
        {roles && reportArray.map((reportData) => (
          <div
            className={`w-full p-1 mb-4 mt-4 rounded-3xl border border-black shadow-md transition-all duration-200 ${reportData.balance < 0 ? 'bg-pastel-pink' : reportData.onZero ? 'bg-yellow-100' : 'bg-white'}`}
            key={reportData._id}>
            <div className="flex justify-between items-center px-2 pt-1 mb-4">
              <p className="text-lg font-semibold text-red-500">{reportData.branch.branch}</p>
              <div className="flex items-center gap-1">
                <p className="text-lg font-semibold text-red-500">
                  {formatInformationDate(new Date(reportData.createdAt))}
                </p>
              </div>
            </div>
            <div className="w-full flex flex-row-reverse text-3xl gap-3">
              <button className="border border-black rounded-lg" onClick={() => handleReloadReport(reportData)}>
                <TbReload />
              </button>
              <button onClick={() => { navToEditReport(reportData) }} className="border border-black rounded-lg">
                <MdEdit />
              </button>
              <button className={`border border-black rounded-lg ${!isController(currentUser.role) ? blockedButton : ''}`} disabled={!isController(currentUser.role)} onClick={() => handleSetReportOnZero(reportData._id)}>
                <PiNumberZeroBold />
              </button>
            </div>
            <button
              className={`block w-full rounded-xl transition-all duration-200 border my-1 ${reportData.balance < 0 ? 'bg-pastel-pink hover:shadow-red-400/30' : 'bg-white hover:shadow-gray-200'
                } hover:scale-[1.01] hover:border-pink-300`}
              onClick={() => handleShowReport(reportData)}
            >
              <div className="relative">
                {loading && toModifyReport == reportData._id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
                    <FaSpinner className="text-4xl animate-spin" />
                  </div>
                )}
                <div className={`${loading && toModifyReport == reportData._id ? 'blur-sm' : ''} px-3`}>
                  <div className="space-y-4">
                    {/* Encargado y Auxiliar */}
                    <div className="grid grid-cols-2 gap-4 text-sm text-left">
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
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 text-left">
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
                  {(!isToday(reportData.createdAt) || roles.manager?._id === currentUser.role || reportData.balance < 0) && (
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
                          {roles.manager?._id === currentUser.role || reportData.balance < 0 // Mostrar siempre si es manager o el balance es negativo
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
            </button>
          </div>
        ))}
        {(showModal || defaultDetailsShowed) && (
          <div className="fixed bottom-0 left-0 w-full z-50">
            <Modal
              closeModal={() => setShowModal(false)}
              content={<RegistroCuentaDiaria edit={false} _branchReport={selectedReport} _branch={selectedReport.branch} />}
              lowerZIndex={true}
            />
          </div>
        )}
      </div>
    </div>
  )
}
