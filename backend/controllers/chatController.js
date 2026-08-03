import { chatWithGemini } from '../services/chatService.js'

export const postChat = async (req, res, next) => {
  try {
    const { messages } = req.body

    if (!Array.isArray(messages) || !messages.length) {
      const error = new Error('messages array is required')
      error.statusCode = 400
      throw error
    }

    const replyText = await chatWithGemini({ messages })

    res.json({ reply: replyText })
  } catch (err) {
    next(err)
  }
}
