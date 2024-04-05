import express from 'express'
import { getRoles, newRole } from '../controllers/role.controller.js'

const router = express()

router.post('/create', newRole)
router.get('/get', getRoles)

export default router