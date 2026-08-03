import express from 'express'
import { generateTests } from '../controllers/generateTestsController.js'
import { validateReviewInput } from '../middlewares/validateReviewInput.js'

const router = express.Router()

router.post('/generate-tests', validateReviewInput, generateTests)

export default router
