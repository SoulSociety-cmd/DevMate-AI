import { optimizeCodeWithGemini } from '../services/geminiService.js'

export const optimizeCode = async (req, res, next) => {
  try {
    const { code, language } = req.body
    const optimizeData = await optimizeCodeWithGemini({ code, language })

    res.status(200).json({
      success: true,
      data: optimizeData,
    })
  } catch (error) {
    next(error)
  }
}
