import express from 'express'
import { getBranches, newBranch, deleteBranch, getBranchesLastPosition, getMonthBranchesIncomesQuery, getBranch, getBranchSalesAverage, changeBranchrResidualPricesUse, updateBranch, toggleBranchActive } from '../controllers/branch.controller.js'

const router = express()

router.post('/new-branch/', newBranch)
router.put('/update/:branchId', updateBranch)
router.patch('/toggle-active/:branchId', toggleBranchActive)
router.put('/change-prices-use/', changeBranchrResidualPricesUse)
router.get('/get-branch/:branchId', getBranch)
router.get('/get-branch-avg/:branchId', getBranchSalesAverage)
router.get('/get-branches/:companyId', getBranches)
router.get('/get-branches-last-position/:companyId', getBranchesLastPosition)
router.get('/get-month-branches-incomes/:companyId/:date', getMonthBranchesIncomesQuery)
router.delete('/delete/:branchId', deleteBranch)

export default router