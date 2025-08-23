import { useSelector } from "react-redux";
import { isToday } from "../../helpers/DatePickerFunctions";
import { useEmployeesPayments } from "../../hooks/Employees/useEmployeesPayments";
import Select from "react-select";
import ShowListModal from "../Modals/ShowListModal";
import SectionHeader from "../SectionHeader";
import EmployeesSelect from "../Select/EmployeesSelect";
import { useEffect, useState } from "react";
import EmployeePaymentsList from "../EmployeePaymentsList";
import { currency, getArrayForSelects, getElementForSelect } from "../../helpers/Functions";
import { useEmployees } from "../../hooks/Employees/useEmployees";
import { useDateNavigation } from "../../hooks/useDateNavigation";
import { customSelectStyles } from "../../helpers/Constants";
import { useBranches } from "../../hooks/Branches/useBranches";
import RegisterDateSwitch from "../RegisterDateSwitch";
import { useRef } from "react"

export default function Payments({ spliceExtraOutgoingById, showDateSwitch = true, useToday: useTodayProp }) {

  const { currentUser, company } = useSelector((state) => state.user)
  const { currentDate: date, dateFromYYYYMMDD, today } = useDateNavigation();
  const { branches } = useBranches({ companyId: company._id, date })
  const { payments, total: totalEmployeesPayments, onAddEmployeePayment, onDeleteEmployeePayment } = useEmployeesPayments({ companyId: company._id, date })
  const { activeEmployees: employees } = useEmployees({ companyId: company._id })
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [isDirectFromBranch, setIsDirectFromBranch] = useState(false);
  const [useTodayLocal, setUseTodayLocal] = useState(false);
  const effectiveUseToday = useTodayProp !== undefined ? useTodayProp : useTodayLocal;

  const paymentsButtonControl = () => {

    const amountInput = document.getElementById('paymentAmount')
    const button = document.getElementById('paymentButton')

    let filledInputs = true

    if (amountInput.value == '') {

      filledInputs = false

    }

    if (filledInputs && selectedEmployee != null) {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  // Encapsulated reset for optimistic UI and reuse on error
  const resetPaymentForm = () => {
    try {
      setIsDirectFromBranch(false)
      setSelectedEmployee(null)
      setSelectedBranch(null)
      const amountEl = document.getElementById('paymentAmount')
      const detailEl = document.getElementById('paymentDetail')
      if (amountEl) amountEl.value = ''
      if (detailEl) detailEl.value = ''
      const btn = document.getElementById('paymentButton')
      if (btn) btn.disabled = true
    } finally {
      // Re-run control to ensure UI state is coherent
      paymentsButtonControl()
    }
  }

  const addEmployeePaymentSubmit = async (e) => {

    const amount = document.getElementById('paymentAmount')
    const detail = document.getElementById('paymentDetail')
    const createdAt = effectiveUseToday || today ? new Date().toISOString() : dateFromYYYYMMDD.toISOString()

    e.preventDefault()

    try {
      const employeePayment = {
        amount: parseFloat(amount.value),
        detail: detail.value,
        company: company._id,
        branch: selectedBranch,
        employee: selectedEmployee,
        supervisor: currentUser,
        createdAt
      }

      // Optimistic UI: clear form immediately
      resetPaymentForm()

      await onAddEmployeePayment(employeePayment)

    } catch (error) {
      console.log(error)
      // Ensure form is reset even on error (idempotent)
      resetPaymentForm()
    }
  }

  const handleEmployeeSelectChange = (employee) => {

    setSelectedEmployee(employee)
  }

  // 🔹 Referencia al Select
  const branchSelectRef = useRef(null)

  const handleCheckboxChange = (e) => {
    setIsDirectFromBranch(e.target.checked);
    if (!e.target.checked) {
      setSelectedBranch(null);
    }
  };

  // 🔹 Manejar Enter cuando el checkbox está enfocado
  const handleCheckboxKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // evitar que se dispare el click por defecto del checkbox
      setIsDirectFromBranch((prev) => {
        const newValue = !prev;
        if (!prev) {
          // Si se está activando, enfocar Select después de un pequeño delay
          setTimeout(() => {
            if (branchSelectRef.current) {
              branchSelectRef.current.focus();
            }
          }, 0);
        }
        return newValue;
      });
    }
  };

  useEffect(paymentsButtonControl, [selectedEmployee, selectedBranch])

  return (
    <div className="border p-4 sm:p-8 mt-4 rounded-2xl bg-white shadow-lg max-w-2xl mx-auto animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 items-center mb-4">
        <SectionHeader label={'Pago a Empleados y Rentas'} />
        <div className="flex items-center gap-4 justify-self-end sm:mr-12 mt-2 sm:mt-0">
          <ShowListModal
            title={'Pagos a empleados'}
            ListComponent={EmployeePaymentsList}
            ListComponentProps={{ payments, total: totalEmployeesPayments, onDelete: onDeleteEmployeePayment, spliceExtraOutgoing: spliceExtraOutgoingById }}
            clickableComponent={<p className="font-bold text-lg text-center">{currency({ amount: totalEmployeesPayments })}</p>}
          />
        </div>
      </div>
      <form onSubmit={addEmployeePaymentSubmit} className="flex flex-col gap-5 bg-white rounded-xl shadow-sm p-4">
        {!today && showDateSwitch && (
          <RegisterDateSwitch useToday={effectiveUseToday} setUseToday={setUseTodayLocal} />
        )}
        <div>
          <label className="font-semibold text-gray-700 mb-1 block">¿A quién le pagas?</label>
          <EmployeesSelect defaultLabel={'Selecciona un empleado'} employees={employees} handleEmployeeSelectChange={handleEmployeeSelectChange} selectedEmployee={selectedEmployee} />
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isDirectFromBranch}
              onChange={handleCheckboxChange}
              onKeyDown={handleCheckboxKeyDown}  // 🔹 aquí el handler
              className="h-5 w-5 accent-blue-600"
            />
            <span className="text-gray-700">¿El dinero viene directo de una sucursal?</span>
          </label>
        </div>
        {isDirectFromBranch && (
          <div>
            <p className="text-xs text-blue-700 mb-1">Si ya tenías el dinero deja vacío el campo de sucursal</p>
            <Select
              ref={branchSelectRef}  // 🔹 aquí asignamos la ref
              id='branchSelect'
              styles={customSelectStyles}
              value={getElementForSelect(selectedBranch, (branch) => branch.branch)}
              onChange={setSelectedBranch}
              options={getArrayForSelects(branches, (branch) => branch.branch)}
              isClearable={true}
              placeholder='¿De qué sucursal salió el dinero?'
              isSearchable={true}
            />
          </div>
        )}
        <div className="relative">
          <input type="number" name="paymentAmount" id="paymentAmount" placeholder='$0.00' step={0.01} className='w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none text-base transition' required onInput={paymentsButtonControl} />
          <label htmlFor="paymentAmount" className="absolute left-3 top-1/2 -translate-y-7 bg-white px-1 text-blue-700 text-sm font-semibold pointer-events-none">Monto entregado al empleado <span>*</span></label>
        </div>
        <div>
          <label htmlFor="paymentDetail" className="text-gray-700 font-semibold mb-1 block">Motivo del pago</label>
          <input type="text" name="paymentDetail" id="paymentDetail" placeholder='Pago de Nómina, Préstamo, Pollo, etc...' className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none text-base transition' required onInput={paymentsButtonControl} />
        </div>
        <button type='submit' id='paymentButton' disabled className='bg-blue-600 text-white font-semibold p-3 rounded-lg transition disabled:opacity-60 mt-2 shadow-sm'>Agregar</button>
      </form>
    </div>
  )
}