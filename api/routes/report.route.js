import express from 'express'
import { getBranchReports, getDaysReportsData, getSupervisorInfo, getSupervisorsInfo, updateReportDatasInfo } from '../controllers/report.controller.js'

const router = express.Router()

router.get('/get-supervisors-info/:companyId/:date', getSupervisorsInfo)
router.get('/get-supervisor-info/:employeeId', getSupervisorInfo)
router.get('/get-days-reports-data/:companyId/:date', getDaysReportsData)
router.get('/get-branches-reports/:companyId/:date', getBranchReports)
router.put('/update-report-datas-info/:companyId', updateReportDatasInfo)

export default router