import express from 'express'
import { deleteInput, getBranchInputs, getInputs, newInput } from '../controllers/input.output.controller.js'


const router = express.Router()

router.post('/create', newInput)
router.get('/get-branch-inputs/:branchId/:date', getBranchInputs)
router.get('/get-inputs/:companyId/:date', getInputs)
router.delete('/delete-input/:inputId', deleteInput)

export default router