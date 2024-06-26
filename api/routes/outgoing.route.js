import express from 'express'
import { deleteOutgoing, getBranchOutgoings, newOutgoing, getExtraOutgoings, deleteExtraOutgoing, newExtraOutgoing, createLoan, getLoans, deleteLoan, getOutgoings } from '../controllers/outgoing.controller.js'

const router = express.Router()

router.post('/create', newOutgoing)
router.put('/reject-outgoing/:outgoingId/:employeeId/:date')
router.post('/extra-outgoing/create', newExtraOutgoing)
router.put('/extra-outgoing/reject-extra-outgoing/:extraOutgoingId/:employeeId/:date')
router.post('/loan/create', createLoan)
router.put('/loan/reject-loan/:loanId/:employeeId/:date')
router.get('/loan/get-loans/:companyId/:date', getLoans)
router.get('/branch-outgoings/:branchId/:date', getBranchOutgoings)
router.get('/get-outgoings/:companyId/:date', getOutgoings)
router.get('/get-extra-outgoings/:companyId/:date', getExtraOutgoings)
router.delete('/extra-outgoing/delete/:extraOutgoingId', deleteExtraOutgoing)
router.delete('/delete/:outgoingId', deleteOutgoing)
router.delete('/loan/delete/:loanId', deleteLoan)

export default router