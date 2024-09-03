import express from 'express'
import { getBranchIncomes, getIncomes, newIncomeType, getIncomeTypes, newIncomeQuery, deleteIncomeQuery } from '../controllers/income.controller.js'

const router = express.Router()

router.post('/create', newIncomeQuery)
router.post('/types/create', newIncomeType)
router.get('/types/get', getIncomeTypes)
router.get('/branch-incomes/:branchId/:date', getBranchIncomes)
router.delete('/delete/:incomeId', deleteIncomeQuery)
router.get('/get/:companyId/:date', getIncomes)

export default router