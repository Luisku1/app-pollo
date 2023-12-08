import express from 'express'
import { getBranches, newBranch } from '../controllers/branch.controller.js'

const router = express()

router.post('/new-branch/:id', newBranch)
router.get('/branches/:id', getBranches)

export default router