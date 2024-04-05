import express from 'express'
import { deleteOutput, getBranchOutputs, getOutputs, newOutput } from '../controllers/input.output.controller.js'


const router = express.Router()

router.post('/create', newOutput)
router.get('/get-branch-outputs/:branchId/:date', getBranchOutputs)
router.get('/get-outputs/:companyId/:date', getOutputs)
router.delete('/delete-output/:outputId', deleteOutput)

export default router