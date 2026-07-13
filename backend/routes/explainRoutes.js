import express from 'express'
import { explainCode } from '../controllers/explainController.js'
import { validateReviewInput } from '../middlewares/validateReviewInput.js'

const router = express.Router()

router.post('/explain', validateReviewInput, explainCode)

export default router
