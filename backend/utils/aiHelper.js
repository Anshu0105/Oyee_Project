const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_KEY_HERE");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * AI Content Moderation Layer
 */
async function aiModerate(text) {
  try {
    const prompt = `Analyze this chat message for toxicity, identity exposure (real names/phones), or suspicious intent. 
    Respond ONLY with a JSON object: {"safe": boolean, "reason": "concise explanation"}.
    Message: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("AI Moderation failed:", err);
    return { safe: true, reason: "AI bypass (error)" };
  }
}

/**
 * AI Chat Summary
 */
async function summarizeMessages(messages, maxBullets = 4) {
  try {
    const textToSummarize = messages.map(m => `${m.user}: ${m.text}`).join('\n');
    const prompt = `Summarize these unread chat messages in max ${maxBullets} short bullet points. 
    Focus on key events or topics. Keep it anonymous and concise.
    Messages:\n${textToSummarize}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("AI Summary failed:", err);
    return "You missed some conversations in the void.";
  }
}

/**
 * Nearby Room Summary (Concise)
 */
async function summarizeNearbyRooms(roomsData) {
    try {
      const textToSummarize = roomsData.map(r => `Room [${r.name}] Activity:\n${r.messages.join('\n')}`).join('\n\n');
      const prompt = `Summarize the overall activity in these nearby anonymous chat rooms in 1-2 short sentences. 
      Total summary must be ≤20 words.
      Context:\n${textToSummarize}`;
  
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (err) {
      console.error("Nearby Summary failed:", err);
      return "Local rooms are active with anonymous chatter.";
    }
  }

module.exports = { aiModerate, summarizeMessages, summarizeNearbyRooms };
