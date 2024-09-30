import express from 'express'
import { createProviderInput, deleteInput, deleteProviderInput, getBranchInputs, getBranchInputsAvg, getBranchProviderInputs, getBranchProviderInputsAvg, getInputs, getNetDifference, getProviderProductInputs, newBranchInput, newCustomerInput } from '../controllers/input.output.controller.js'


const router = express.Router()

router.post('/customer/create', newCustomerInput)
router.post('/branch/create', newBranchInput)
router.post('/create-provider-input', createProviderInput)
router.get('/get-net-difference/:companyId/:date', getNetDifference)
router.get('/get-branch-provider-inputs/:branchId/:date', getBranchProviderInputs)
router.get('/get-provider-inputs/:companyId/:productId/:date', getProviderProductInputs)
router.get('/get-branch-provider-inputs-avg/:branchId', getBranchProviderInputsAvg)
router.get('/get-branch-inputs/:branchId/:date', getBranchInputs)
router.get('/get-branch-inputs-avg/:branchId', getBranchInputsAvg)
router.get('/get-inputs/:companyId/:date', getInputs)
router.delete('/delete-input/:inputId', deleteInput)
router.delete('/delete-provider-input/:providerInputId', deleteProviderInput)

export default router