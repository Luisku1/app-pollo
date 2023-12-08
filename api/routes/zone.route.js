import express from 'express'
import { getZones, newZone } from '../controllers/zone.controller.js'

const router = express()

router.post('/new-zone', newZone)
router.get('/zones/:id', getZones)

export default router