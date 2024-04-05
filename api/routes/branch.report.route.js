import express from 'express'
import { createBranchReport } from '../controllers/branch.report.controller.js'

const router = express.Router()

router.post('/create', createBranchReport)

export default router