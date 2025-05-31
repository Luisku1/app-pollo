import { useSelector } from "react-redux";
import { isToday } from "../../helpers/DatePickerFunctions";
import { useEmployeesPayments } from "../../hooks/Employees/useEmployeesPayments";
import ShowListModal from "../Modals/ShowListModal";
import SectionHeader from "../SectionHeader";
import EmployeesSelect from "../Select/EmployeesSelect";
import { useEffect, useState } from "react";
import EmployeePaymentsList from "../EmployeePaymentsList";
import { currency } from "../../helpers/Functions";
import { useEmployees } from "../../hooks/Employees/useEmployees";

export default function Payments({ spliceExtraOutgoingById, pushExtraOutgoing, spliceIncomeById, pushIncome }) {

  const { currentUser, company } = useSelector((state) => state.user)
  const { payments, total: totalEmployeesPayments, onAddEmployeePayment, onDeleteEmployeePayment } = useEmployeesPayments({ companyId: company._id, date })
  const { activeEmployees: employees } = useEmployees({ companyId: company._id })
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [isDirectFromBranch, setIsDirectFromBranch] = useState(false);

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

  const addEmployeePaymentSubmit = async (e) => {

    const amount = document.getElementById('paymentAmount')
    const detail = document.getElementById('paymentDetail')
    const createdAt = isToday(date) ? new Date().toISOString() : new Date(date).toISOString()

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

      onAddEmployeePayment(employeePayment, pushIncome, spliceIncomeById, pushExtraOutgoing, spliceExtraOutgoingById)

      setIsDirectFromBranch(false)
      setSelectedEmployee(null)
      setSelectedBranch(null)
      amount.value = ''
      detail.value = ''

    } catch (error) {

      console.log(error)

    }
  }

  const handleEmployeeSelectChange = (employee) => {

    setSelectedEmployee(employee)
  }

  const handleBranchSelectChange = (branch) => {

    setSelectedBranch(branch)
  }

  const handleCheckboxChange = (e) => {
    setIsDirectFromBranch(e.target.checked);
    if (!e.target.checked) {
      setSelectedBranch(null);
    }
  };

  useEffect(paymentsButtonControl, [selectedEmployee, selectedBranch])

  return (
    <div className='border bg-white p-3 mt-4'>
      <div className='grid grid-cols-2 items-center'>
        <SectionHeader label={'Pago a Empleados y Rentas'} />
        <div className='flex items-center gap-4 justify-self-end mr-12'>
          <ShowListModal
            title={'Pagos a empleados'}
            ListComponent={EmployeePaymentsList}
            ListComponentProps={{ payments, total: totalEmployeesPayments, onDelete: onDeleteEmployeePayment, spliceIncome: spliceIncomeById, spliceExtraOutgoing: spliceExtraOutgoingById }}
            clickableComponent={<p className='font-bold text-lg text-center'>{currency({ amount: totalEmployeesPayments })}</p>}
          />
        </div>
      </div>
      <form onSubmit={addEmployeePaymentSubmit} className="grid grid-cols-1 items-center justify-between gap-3">
        <div className=''>
          <EmployeesSelect defaultLabel={'¿A quién le pagas?'} employees={employees} handleEmployeeSelectChange={handleEmployeeSelectChange} selectedEmployee={selectedEmployee}></EmployeesSelect>
        </div>
        <div>
          <label className="flex items-center gap-2 ml-3">
            <input
              type="checkbox"
              checked={isDirectFromBranch}
              onChange={handleCheckboxChange}
              className="h-5 w-5"
            />
            ¿El dinero viene directo de una sucursal?
          </label>
        </div>
        <div>
          {isDirectFromBranch && (
            <div>
              <p className='text-xs text-red-700'>Si ya tenías el dinero deja vacío el campo de sucursal</p>
              <Select
                id='branchSelect'
                styles={customSelectStyles}
                value={getElementForSelect(selectedBranch, (branch) => branch.branch)}
                onChange={handleBranchSelectChange}
                options={getArrayForSelects(branches, (branch) => branch.branch)}
                isClearable={true}
                placeholder='¿De qué sucursal salió el dinero?'
                isSearchable={true}
              />
            </div>
          )}
        </div>
        <div className='relative'>
          <input type="number" name="paymentAmount" id="paymentAmount" placeholder='$0.00' step={0.01} className='w-full col-span-1 border p-3 rounded-lg border-black' required onInput={paymentsButtonControl} />
          <label htmlFor="compact-input" className=" -translate-y-full px-1 absolute top-1/4 left-2 rounded-sm bg-white text-red-700 text-sm font-semibold">
            Monto entregado al empleado <span>*</span>
          </label>
        </div>
        <div className='col-span-1 grid grid-cols-1'>
          <p className='text-xs text-red-700'>Especifíca el motivo del pago</p>
          <input type="text" name="paymentDetail" id="paymentDetail" placeholder='Pago de Nómina, Préstamo, Pollo, etc...' className='col-span-1 p-3 border border-black rounded-lg' required onInput={paymentsButtonControl} />
        </div>
        <button type='submit' id='paymentButton' disabled className='bg-button text-white p-3 rounded-lg col-span-1 mt-4'>Agregar</button>
      </form>
    </div>
  )
}