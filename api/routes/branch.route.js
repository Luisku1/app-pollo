import express from 'express'
import { getBranches, newBranch, deleteBranch, getBranchesLastPosition, getMonthBranchesIncomesQuery, getBranch } from '../controllers/branch.controller.js'

const router = express()

router.post('/new-branch/', newBranch)
router.get('/get-branch/:branchId', getBranch)
router.get('/get-branches/:companyId', getBranches)
router.get('/get-branches-last-position/:companyId', getBranchesLastPosition)
router.get('/get-month-branches-incomes/:companyId/:date', getMonthBranchesIncomesQuery)
router.delete('/delete/:branchId', deleteBranch)

export default router