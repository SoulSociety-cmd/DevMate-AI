import { generateDocsWithGemini } from '../services/geminiService.js'

export const generateDocs = async (req, res, next) => {
  try {
    const { code, language } = req.body
    const documentation = await generateDocsWithGemini({ code, language })

    res.status(200).json({ documentation })
  } catch (error) {
    next(error)
  }
}
