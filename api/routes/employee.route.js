import express from 'express'
import { getEmployees, deleteEmployee, getEmployeesDailyBalances, updateEmployeeDailyBalance, getEmployee, getEmployeeReports, getEmployeeDayInfo, getEmployeePayroll, deleteDuplicatedEmployeeDailyBalances, newEmployeePaymentQuery, getEmployeesPaymentsQuery, deleteEmployeePaymentQuery, getEmployeePayments } from '../controllers/employee.controller.js'

const router = express.Router()

router.put('/update-daily-balance/:balanceId', updateEmployeeDailyBalance)
router.post('/employee-payment/create', newEmployeePaymentQuery)
router.get('/get-employees-payments/:companyId/:date', getEmployeesPaymentsQuery)
router.get('/get-employee-payments/:employeeId/:date', getEmployeePayments)
router.get('/get/:companyId', getEmployees)
router.get('/get-employee/:employeeId', getEmployee)
router.get('/get-employees-payroll/:companyId/:date', getEmployeePayroll)
router.put('/get-duplicated-employee-balances', deleteDuplicatedEmployeeDailyBalances)
router.get('/get-employee-day-information/:employeeId', getEmployeeDayInfo)
router.get('/get-employee-reports/:employeeId', getEmployeeReports)
router.get('/get-employees-daily-balances/:companyId/:date', getEmployeesDailyBalances)
router.delete('/delete/:employeeId', deleteEmployee)
router.delete('/delete-employee-payment/:paymentId/:incomeId/:extraOutgoingId', deleteEmployeePaymentQuery)
// router.post('/update/:id', verifyToken, update)

export default router