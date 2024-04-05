import express from 'express'
import { getEmployees, deleteEmployee, getEmployeesDailyBalances, updateEmployeeDailyBalance } from '../controllers/employee.controller.js'

const router = express.Router()

router.get('/get/:companyId', getEmployees)
router.get('/get-employees-daily-balances/:companyId/:date', getEmployeesDailyBalances)
router.put('/update-daily-balance/:balanceId', updateEmployeeDailyBalance)
router.delete('/delete/:employeeId', deleteEmployee)
// router.post('/update/:id', verifyToken, update)

export default router