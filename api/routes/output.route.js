import express from 'express'
import { deleteOutput, getBranchOutputsAvg, getBranchOutputsRequest, getOutputs, newBranchOutput, newCustomerOutput } from '../controllers/input.output.controller.js'


const router = express.Router()

router.post('/customer/create', newCustomerOutput)
router.post('/branch/create', newBranchOutput)
router.get('/get-branch-outputs/:branchId/:date', getBranchOutputsRequest)
router.get('/get-branch-outputs-avg/:branchId', getBranchOutputsAvg)
router.get('/get-outputs/:companyId/:date', getOutputs)
router.delete('/delete-output/:outputId', deleteOutput)

export default router