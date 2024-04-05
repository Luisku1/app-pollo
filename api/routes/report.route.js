import express from 'express'
import { getBranchReports, getSupervisorsInfo } from '../controllers/report.controller.js'

const router = express.Router()

router.get('/get-supervisors-info/:companyId/:date', getSupervisorsInfo)
router.get('/get-branch-reports/:companyId/:date', getBranchReports)

export default router