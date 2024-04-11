import express from 'express'
import { deleteInput, getBranchInputs, getBranchProviderInputs, getInputs, getProviderProductInputs, newInput, updateProviderInputs } from '../controllers/input.output.controller.js'


const router = express.Router()

router.post('/create', newInput)
router.post('/update-provider-inputs', updateProviderInputs)
router.get('/get-branch-provider-inputs/:branchId/:date', getBranchProviderInputs)
router.get('/get-provider-inputs/:companyId/:productId/:date', getProviderProductInputs)
router.get('/get-branch-inputs/:branchId/:date', getBranchInputs)
router.get('/get-inputs/:companyId/:date', getInputs)
router.delete('/delete-input/:inputId', deleteInput)

export default router