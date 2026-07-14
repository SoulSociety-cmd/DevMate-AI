import { convertCodeWithGemini } from '../services/geminiService.js'

export const convertCode = async (req, res, next) => {
  try {
    const { code, language, targetLanguage } = req.body
    const conversionData = await convertCodeWithGemini({ code, language, targetLanguage })

    res.status(200).json({
      success: true,
      data: conversionData,
    })
  } catch (error) {
    next(error)
  }
}
