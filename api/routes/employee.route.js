import express from 'express'
import { getEmployees, deleteEmployee, getEmployeesDailyBalances, updateEmployeeDailyBalance, getEmployee, getEmployeeReports, getEmployeeDayInfo, getEmployeePayroll, deleteDuplicatedEmployeeDailyBalances, newEmployeePaymentQuery, getEmployeesPaymentsQuery, deleteEmployeePaymentQuery, getEmployeePayments, getAllEmployees, changeEmployeeActiveStatus, createEmployeeRest, getPendingEmployeesRests, deleteEmployeeRest, updateEmployee, getEmployeePayment, getSignedUser, getEmployeeBranchReports, getEmployeeSupervisorReports } from '../controllers/employee.controller.js'
import { getSupervisorReport, getSupervisorReports, recalculateSupervisorReport, setBalanceOnZero } from '../controllers/supervisor.report.js'

const router = express.Router()

router.put('/update-daily-balance/:balanceId', updateEmployeeDailyBalance)
router.put('/change-active-status/:employeeId', changeEmployeeActiveStatus)
router.put('/:employeeId', updateEmployee)
router.post('/create-employee-rest', createEmployeeRest)
router.post('/employee-payment/create', newEmployeePaymentQuery)
router.get('/:employeeId', getSignedUser)
router.get('/get-employee-branch-reports/:employeeId', getEmployeeBranchReports)
router.get('/get-employee-supervisor-reports/:employeeId', getEmployeeSupervisorReports)
router.get('/get-pending-employees-rests/:companyId', getPendingEmployeesRests)
router.get('/get-supervisor-report/:supervisorId/:date', getSupervisorReport)
router.patch('/supervisor-report-recalculate/:reportId', recalculateSupervisorReport)
router.patch('/set-supervisor-report-on-zero/:reportId', setBalanceOnZero)
router.get('/:incomeId/payment', getEmployeePayment)
router.get('/get-supervisor-reports/:supervisorId', getSupervisorReports)
router.get('/get-employees-payments/:companyId/:date', getEmployeesPaymentsQuery)
router.get('/get-employee-payments/:employeeId/:date', getEmployeePayments)
router.get('/get/:companyId', getEmployees)
router.get('/get-all-employees/:companyId', getAllEmployees)
router.get('/get-employee/:employeeId', getEmployee)
router.get('/get-employees-payroll/:companyId/:date', getEmployeePayroll)
router.put('/get-duplicated-employee-balances', deleteDuplicatedEmployeeDailyBalances)
router.get('/get-employee-day-information/:employeeId', getEmployeeDayInfo)
router.get('/get-employee-reports/:employeeId/:consultantRole?', getEmployeeReports)
router.get('/get-employees-daily-balances/:companyId/:date', getEmployeesDailyBalances)
router.delete('/delete/:employeeId', deleteEmployee)
router.delete('/delete-employee-payment/:paymentId/:incomeId/:extraOutgoingId', deleteEmployeePaymentQuery)
router.delete('/delete-employee-rest/:employeeRestId', deleteEmployeeRest)
// router.post('/update/:id', verifyToken, update)

export default router