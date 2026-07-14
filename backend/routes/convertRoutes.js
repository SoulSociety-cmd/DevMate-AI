import express from 'express'
import { convertCode } from '../controllers/convertController.js'
import { validateReviewInput } from '../middlewares/validateReviewInput.js'

const router = express.Router()

router.post('/convert', validateReviewInput, (req, res, next) => {
  const { targetLanguage } = req.body || {}

  if (typeof targetLanguage !== 'string' || targetLanguage.trim() === '') {
    return res.status(400).json({ message: 'Target language is required' })
  }

  req.body.targetLanguage = targetLanguage.trim()
  next()
}, convertCode)

export default router
