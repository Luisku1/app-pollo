import express from 'express'
import { createBranchReport, deleteReport, getBranchReport, recalculateBranchReportRequest, refactorBranchReports, updateBranchReport } from '../controllers/branch.report.controller.js'

const router = express.Router()

router.post('/create/:companyId', createBranchReport)
router.put('/update', updateBranchReport)
router.put('/recalculate', recalculateBranchReportRequest)
router.get('/get-branch-report/:branchId/:date', getBranchReport)
router.put('/refactorize-branch-reports', refactorBranchReports)
router.delete('/delete/:reportId', deleteReport)

export default router