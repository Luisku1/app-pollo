import express from 'express'
import { getZones, newZone } from '../controllers/zone.controller.js'

const router = express()

router.post('/new-zone', newZone)
router.get('/zones/:companyId', getZones)

export default router