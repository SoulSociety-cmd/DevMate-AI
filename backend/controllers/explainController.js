import { explainCodeWithGemini } from '../services/geminiService.js'

export const explainCode = async (req, res, next) => {
  try {
    const { code, language } = req.body
    const explanationData = await explainCodeWithGemini({ code, language })

    res.status(200).json({
      success: true,
      data: explanationData,
    })
  } catch (error) {
    next(error)
  }
}
