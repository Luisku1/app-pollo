import express from 'express'
import { getBranchReports, getDaysReportsData, getSupervisorInfo, getSupervisorsInfo, updateReportDatasInfo } from '../controllers/report.controller.js'
import { refactorSupervisorReports, updateReportEmployees } from '../controllers/branch.report.controller.js'
import { verifySupervisorCash, verifySupervisorDeposits } from '../controllers/employee.controller.js'

const router = express.Router()

router.get('/get-supervisors-info/:companyId/:date', getSupervisorsInfo)
router.get('/refactor-supervisor-reports/:companyId', refactorSupervisorReports)
router.put('/supervisor-report/verify-cash', verifySupervisorCash)
router.put('/update-report-employees/:reportId', updateReportEmployees)
router.put('/supervisor-report/verify-deposits', verifySupervisorDeposits)
router.get('/get-supervisor-info/:employeeId', getSupervisorInfo)
router.get('/get-days-reports-data/:companyId', getDaysReportsData)
router.get('/get-branches-reports/:companyId/:date', getBranchReports)
router.put('/update-report-datas-info/:companyId', updateReportDatasInfo)

export default router