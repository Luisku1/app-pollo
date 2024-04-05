import express from 'express'
import { getCompanyById, getCompanyByOwnerId, newCompany } from '../controllers/company.controller.js'

const router = express()

router.post('/create', newCompany)
router.get('/get-by-owner-id/:ownerId', getCompanyByOwnerId)
router.get('/get-by-id/:companyId', getCompanyById)

export default router