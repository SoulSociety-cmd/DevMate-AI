import express from 'express'
import { optimizeCode } from '../controllers/optimizeController.js'
import { validateReviewInput } from '../middlewares/validateReviewInput.js'

const router = express.Router()

router.post('/optimize', validateReviewInput, optimizeCode)

export default router
