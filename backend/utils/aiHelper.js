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
  // If no API key, manifest a simulated cognitive synthesis for testing
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_KEY_HERE") {
    const topics = [...new Set(messages.map(m => m.text.split(' ')[0]))].slice(0, 3).join(', ');
    return `[SIMULATED NEURAL SYNTHESIS]\n• Manifested signals from ${messages.length} peers detected.\n• Frequent data points observed: ${topics}...\n• Cognitive summary enabled once GEMINI_API_KEY is active.`;
  }

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
    return `[NEURAL STALL]\n• The void is distorting the signal.\n• Observed ${messages.length} messages, but synthesis failed.`;
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
