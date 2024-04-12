import express from 'express'
import { createProviderInput, deleteInput, deleteProviderInput, getBranchInputs, getBranchProviderInputs, getInputs, getProviderProductInputs, newInput } from '../controllers/input.output.controller.js'


const router = express.Router()

router.post('/create', newInput)
router.post('/create-provider-input', createProviderInput)
router.get('/get-branch-provider-inputs/:branchId/:date', getBranchProviderInputs)
router.get('/get-provider-inputs/:companyId/:productId/:date', getProviderProductInputs)
router.get('/get-branch-inputs/:branchId/:date', getBranchInputs)
router.get('/get-inputs/:companyId/:date', getInputs)
router.delete('/delete-input/:inputId', deleteInput)
router.delete('/delete-provider-input/:providerInputId', deleteProviderInput)

export default router