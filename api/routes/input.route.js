import express from 'express'
import { createBranchProviderInput, createCustomerProviderInput, deleteInput, deleteProviderInput, getBranchInputsAvg, getBranchInputsRequest, getBranchProviderInputsAvg, getBranchProviderInputsRequest, getInputs, getNetDifference, getProviderProductInputs, newBranchInput, newCustomerInput } from '../controllers/input.output.controller.js'


const router = express.Router()

router.post('/customer/create', newCustomerInput)
router.post('/branch/create', newBranchInput)
router.post('/branch/create-provider-input', createBranchProviderInput)
router.post('/customer/create-provider-input', createCustomerProviderInput)
router.get('/get-net-difference/:companyId/:date', getNetDifference)
router.get('/get-branch-provider-inputs/:branchId/:date', getBranchProviderInputsRequest)
router.get('/get-provider-inputs/:companyId/:productId/:date', getProviderProductInputs)
router.get('/get-branch-provider-inputs-avg/:branchId', getBranchProviderInputsAvg)
router.get('/get-branch-inputs/:branchId/:date', getBranchInputsRequest)
router.get('/get-branch-inputs-avg/:branchId', getBranchInputsAvg)
router.get('/get-inputs/:companyId/:date', getInputs)
router.delete('/delete-input/:inputId', deleteInput)
router.delete('/delete-provider-input/:providerInputId', deleteProviderInput)

export default router