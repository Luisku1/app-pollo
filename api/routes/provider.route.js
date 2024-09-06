import express from 'express'
import { newProvider } from '../controllers/provider.controller.js'
const router = express.Router()

router.post('/create', newProvider)

export default router