const Message = require('../models/Message');
const Room = require('../models/Room');

/**
 * Summarizes the last 1 hour of messages in a room.
 * Enhanced with "Bot Feeding" context to simulate AI growth.
 */
exports.summarizeRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Fetch messages from the last hour SPECIFIC to this room
    const messages = await Message.find({ 
      roomId: roomId,
      timestamp: { $gte: oneHourAgo } 
    }).sort({ timestamp: 1 }).limit(100);

    // Total messages ever processed (Simulating bot "feeding")
    const totalProcessed = await Message.countDocuments();

    if (!messages || messages.length === 0) {
      return res.json({ 
        success: true,
        summary: "The void is silent in this room for now. I'm hungry for more data to analyze!",
        botStats: { totalProcessed }
      });
    }

    const summary = generateHackathonSummary(messages, totalProcessed);
    
    // Simulate thinking time
    setTimeout(() => {
      res.json({ 
        success: true, 
        summary,
        count: messages.length,
        botStats: { totalProcessed }
      });
    }, 1000);

  } catch (error) {
    console.error('AI Summary Error:', error);
    res.status(500).json({ error: 'Failed to generate AI summary' });
  }
};

/**
 * Recommends trending/popular rooms based on member counts.
 */
exports.getRecommendations = async (req, res) => {
  try {
    // Fetch top 5 active rooms (nearby, university, wifi)
    const topRooms = await Room.find({ 
      active: true,
      type: { $in: ['nearby', 'university', 'wifi'] }
    })
    .sort({ 'members.length': -1 })
    .limit(5)
    .select('name type members description');

    const totalProcessed = await Message.countDocuments();

    let suggestionText = `📍 ANALYZING THE VOID...\n\nI've indexed ${totalProcessed} messages today. Here are the most active dimensions you should explore:\n\n`;
    
    if (topRooms.length === 0) {
      suggestionText += "• Global Void (The most popular entry point)\n• Your Private Link (Create a room and invite peers!)";
    } else {
      topRooms.forEach(room => {
        const typeEmoji = room.type === 'wifi' ? '📶' : room.type === 'university' ? '🎓' : '📍';
        suggestionText += `${typeEmoji} ${room.name.toUpperCase()} (${room.members.length} entities present)\n`;
      });
    }

    suggestionText += "\n🔥 TIP: High activity rooms generate more Aura!";

    res.json({
      success: true,
      summary: suggestionText,
      botStats: { totalProcessed }
    });

  } catch (error) {
    console.error('AI Recommendation Error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};

/**
 * Generates a structured summary with "Bot Growth" context.
 */
function generateHackathonSummary(messages, totalProcessed) {
  const users = [...new Set(messages.map(m => m.user))];
  const totalMsgs = messages.length;
  
  const keyPoints = messages
    .filter(m => m.text && m.text.length > 15)
    .slice(-3)
    .map(m => m.text);

  let summary = `📍 VOID LOG [INDEXED: ${totalProcessed} MSGS]\n\n`;
  summary += `I've analyzed ${totalMsgs} recent pulses from ${users.length} unique entities in this room.\n\n`;
  
  if (keyPoints.length > 0) {
    summary += `✨ RECENT CONSCIOUSNESS:\n`;
    keyPoints.forEach(point => {
        summary += `• ${point.substring(0, 70)}${point.length > 70 ? '...' : ''}\n`;
    });
  } else {
    summary += `✨ CURRENT VIBE: The data flow is steady but brief. The room is maintaining a high-frequency baseline.`;
  }

  summary += `\n🔥 HOTTEST ENTITIES: ${users[0]}${users[1] ? ' & ' + users[1] : ''}`;

  return summary;
}
