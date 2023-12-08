import express from 'express'
import { getRoles, newRole } from '../controllers/role.controller.js'

const router = express()

router.post('/new-role', newRole)
router.get('/roles', getRoles)

export default router