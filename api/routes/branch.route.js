import express from 'express'
import { getBranches, newBranch, deleteBranch, getBranchesLastPosition } from '../controllers/branch.controller.js'

const router = express()

router.post('/new-branch/', newBranch)
router.get('/get-branches/:companyId', getBranches)
router.get('/get-branches-last-position/:companyId', getBranchesLastPosition)
router.delete('/delete/:branchId', deleteBranch)

export default router