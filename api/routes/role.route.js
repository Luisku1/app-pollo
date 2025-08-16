import express from 'express'
import { getRoles, newRole, seedRolesEndpoint } from '../controllers/role.controller.js'

const router = express()

router.post('/create', newRole)
router.get('/get', getRoles)
router.post('/seed', seedRolesEndpoint)

export default router