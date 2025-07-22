import express from 'express'
import { ownerSignUp, signIn, signOut, registerEmployee } from '../controllers/auth.controller.js'

const router = express.Router()

router.post('/sign-up', registerEmployee)
router.post('/sign-in', signIn)
router.post('/owner-sign-up', ownerSignUp)
router.get('/sign-out', signOut)

export default router