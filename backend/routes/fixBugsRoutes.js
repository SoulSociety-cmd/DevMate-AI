import express from 'express'
import { fixBugs } from '../controllers/fixBugsController.js'
import { validateReviewInput } from '../middlewares/validateReviewInput.js'

const router = express.Router()

router.post('/fix-bugs', validateReviewInput, fixBugs)

export default router
