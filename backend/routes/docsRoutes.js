import express from 'express'
import { generateDocs } from '../controllers/docsController.js'
import { validateReviewInput } from '../middlewares/validateReviewInput.js'

const router = express.Router()

router.post('/generate-docs', validateReviewInput, generateDocs)

export default router
