import express from 'express'
import { deleteOutgoing, getDailyOutgoings, newOutgoing } from '../controllers/outgoing.controller.js'

const router = express.Router()

router.post('/outgoing', newOutgoing)
router.get('/daily-outgoings/:branchId/:date', getDailyOutgoings)
router.delete('/delete/:id', deleteOutgoing)

export default router