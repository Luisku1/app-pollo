import express from 'express'
import { deleteInput, getBranchInitialInput, getBranchInputs, getInitialInputs, getInputs, newInput, updateInitialInputs } from '../controllers/input.output.controller.js'


const router = express.Router()

router.post('/create', newInput)
router.post('/update-initial-inputs', updateInitialInputs)
router.get('/get-branch-initial-input/:branchId', getBranchInitialInput)
router.get('/get-branch-inputs/:branchId/:date', getBranchInputs)
router.get('/get-inputs/:companyId/:date', getInputs)
router.get('/get-initial-inputs/:companyId/:date', getInitialInputs)
router.delete('/delete-input/:inputId', deleteInput)

export default router