import { fixBugsWithGemini } from '../services/geminiService.js'

export const fixBugs = async (req, res, next) => {
  try {
    const { code, language } = req.body
    const fixBugsData = await fixBugsWithGemini({ code, language })

    res.status(200).json({
      success: true,
      data: fixBugsData,
    })
  } catch (error) {
    next(error)
  }
}
