const { GoogleGenerativeAI } = require('@google/generative-ai');
const chroma = require('../services/chromaClient');

const MAX_QUESTION_LENGTH = 500;
const MAX_COMPANYNAME_LENGTH = 100;

const geminiApiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

exports.chatWithBot = async (req, res, respondDirectly = false) => {
  try {
    // Log the incoming request body
    console.log('[chatWithBot] Received body:', req.body);

    const { companyName, question } = req.body;

    // Log the extracted fields
    console.log('[chatWithBot] companyName:', companyName, '| question:', question);

    if (!companyName || !question || typeof companyName !== 'string' || typeof question !== 'string') {
      const error = { error: 'companyName and question are required and must be non-empty strings.' };
      console.log('[chatWithBot] Validation failed:', error);
      if (respondDirectly) return error;
      return res.status(400).json(error);
    }

    const sanitizedCompany = companyName.trim().substring(0, MAX_COMPANYNAME_LENGTH);
    const sanitizedQuestion = question.trim().substring(0, MAX_QUESTION_LENGTH);

    let chromaResults;
    try {
      console.log('[chatWithBot] Querying Chroma with:', sanitizedCompany, sanitizedQuestion);
      chromaResults = await chroma.queryCompanyDocuments(
        sanitizedCompany,
        sanitizedQuestion,
        3
      );
      console.log('[chatWithBot] Chroma results:', chromaResults);
    } catch (dbError) {
      console.log('[chatWithBot] Chroma error:', dbError.message);
      if (respondDirectly) return { error: dbError.message };
      return res.status(404).json({ error: dbError.message });
    }

    const contextChunks = chromaResults.documents?.[0]?.filter(Boolean) || [];
    if (contextChunks.length === 0) {
      const answer = "I couldn't find relevant information to answer that question. Please try rephrasing or ask something else.";
      console.log('[chatWithBot] No context found, returning fallback answer.');
      if (respondDirectly) return { answer };
      return res.json({ answer });
    }

    const context = contextChunks
      .slice(0, 2)
      .map((chunk) => chunk.replace(/[\x00-\x1F\x7F-\x9F]/g, ''))
      .join('\n\n')
      .substring(0, 3000);

    const prompt = `You are a helpful and concise customer support assistant for "${sanitizedCompany}".
Answer the question below using ONLY the information in the provided context.
Extract or paraphrase only the relevant sentence(s) that address the question.
Do NOT copy or repeat the entire context or FAQ.
If the answer is not found in the context, reply: "Sorry, I don't have that information."

CONTEXT:
${context}

QUESTION: ${sanitizedQuestion}

ANSWER:`;

    let answer = '';
    try {
      console.log('[chatWithBot] Sending prompt to Gemini...');
      const result = await model.generateContent(prompt);
      answer = result?.response?.text() || '';
      console.log('[chatWithBot] Gemini answer:', answer);
    } catch (llmError) {
      console.log('[chatWithBot] Gemini error:', llmError);
      answer = "I'm having trouble generating a response. Please try again.";
    }

    if (respondDirectly) return { answer };
    res.json({ answer });
  } catch (error) {
    console.log('[chatWithBot] Fatal error:', error);
    if (respondDirectly) return { error: error.message };
    res.status(500).json({
      error: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Failed to generate chatbot answer.',
    });
  }
};
