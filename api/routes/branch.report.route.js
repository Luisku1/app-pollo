import express from 'express'
import { createBranchReport, deleteReport } from '../controllers/branch.report.controller.js'

const router = express.Router()

router.post('/create/:companyId', createBranchReport)
router.delete('/delete/:reportId', deleteReport)

export default router