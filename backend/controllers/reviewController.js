import { analyzeCodeWithGemini } from '../services/geminiService.js'

export const reviewCode = async (req, res, next) => {
  try {
    const { code, language, model, provider } = req.body
    const reviewData = await analyzeCodeWithGemini({ code, language, provider, model })

    res.status(200).json({
      success: true,
      data: reviewData,
    })
  } catch (error) {
    next(error)
  }
}
