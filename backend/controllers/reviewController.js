import { generateMockReview } from '../services/reviewService.js'

export const reviewCode = (req, res, next) => {
  try {
    const { code, language } = req.body
    const reviewData = generateMockReview({ code, language })

    res.status(200).json({
      success: true,
      data: reviewData,
    })
  } catch (error) {
    next(error)
  }
}
