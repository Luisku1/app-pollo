import express from 'express'
import { getEmployees } from '../controllers/employee.controller.js'

const router = express.Router()

router.get('/get-employees/:id', getEmployees)
// router.post('/update/:id', verifyToken, update)

export default router