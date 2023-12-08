import express from 'express'
import { getCompanyById, getCompanyByOwnerId, newCompany } from '../controllers/company.controller.js'

const router = express()

router.post('/new-company', newCompany)
router.get('/get-by-owner-id/:id', getCompanyByOwnerId)
router.get('/get-by-id/:id', getCompanyById)

export default router