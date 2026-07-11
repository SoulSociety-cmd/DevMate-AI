import express from 'express'
import { reviewCode } from '../controllers/reviewController.js'
import { validateReviewInput } from '../middlewares/validateReviewInput.js'

const router = express.Router()

router.post('/review', validateReviewInput, reviewCode)

export default router
