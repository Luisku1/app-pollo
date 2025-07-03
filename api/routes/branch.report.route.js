import express from 'express'
import { deleteReport, getBranchReport, recalculateBranchReportRequest, refactorBranchReports, setBalanceOnZero, updateBranchReportEmployees } from '../controllers/branch.report.controller.js'

const router = express.Router()

router.put('/update-report-employees/:reportId', updateBranchReportEmployees)
router.put('/recalculate', recalculateBranchReportRequest)
router.put('/set-balance-on-zero/:reportId', setBalanceOnZero)
router.get('/get-branch-report/:branchId/:date', getBranchReport)
router.put('/refactorize-branch-reports', refactorBranchReports)
router.delete('/delete/:reportId', deleteReport)

export default router