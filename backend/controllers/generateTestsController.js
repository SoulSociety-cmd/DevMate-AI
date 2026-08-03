import { generateUnitTestsWithGemini } from '../services/geminiService.js'

export const generateTests = async (req, res, next) => {
  try {
    const { code, language, testFramework } = req.body
    const generatedTests = await generateUnitTestsWithGemini({ code, language, testFramework })

    res.status(200).json(generatedTests)
  } catch (error) {
    next(error)
  }
}
