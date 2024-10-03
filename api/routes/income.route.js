import express from 'express'
import { getIncomes, newIncomeType, getIncomeTypes, deleteIncomeQuery, newBranchIncomeQuery, newCustomerIncomeQuery, getBranchIncomesRequest } from '../controllers/income.controller.js'

const router = express.Router()

router.post('/branch/create', newBranchIncomeQuery)
router.post('/customer/create', newCustomerIncomeQuery)
router.post('/types/create', newIncomeType)
router.get('/types/get', getIncomeTypes)
router.get('/branch-incomes/:branchId/:date', getBranchIncomesRequest)
router.delete('/delete/:incomeId', deleteIncomeQuery)
router.get('/get/:companyId/:date', getIncomes)

export default router