
import { GoogleGenAI } from "@google/genai";

// IMPORTANT: This check is for the browser environment. 
// In a real application, the API key should be handled securely and not exposed on the client-side.
// We are assuming process.env.API_KEY is populated by the build environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using mocked Gemini service.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const generateWithMock = async (prompt: string): Promise<string> => {
    console.log(`Mock Gemini Call with prompt: ${prompt}`);
    if (prompt.includes("winner")) {
        const winnerName = prompt.split("'")[1] || "Người chiến thắng";
        return `Xin chúc mừng ${winnerName}! Bạn là người may mắn nhất hôm nay. Một phần quà đặc biệt đang chờ bạn!`;
    }
    return "Chào mừng các bạn đến với sự kiện đặc biệt của chúng tôi! Hãy đăng ký ngay để có cơ hội nhận những phần quà hấp dẫn.";
}

export const generateWelcomeMessage = async (): Promise<string> => {
  if (!ai) return generateWithMock("Generate a warm, exciting welcome message for a lucky draw event for real estate customers in Vietnamese.");

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Write a short, exciting, and welcoming message for a real estate lucky draw event. Be motivational and encouraging. The language must be Vietnamese.",
        config: {
            temperature: 0.8,
            topP: 0.9,
            thinkingConfig: { thinkingBudget: 0 } // For faster response
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating welcome message:", error);
    return "Chào mừng đến với sự kiện quay số may mắn! Chúc bạn may mắn.";
  }
};

export const generateWinnerAnnouncement = async (winnerName: string): Promise<string> => {
    if (!ai) return generateWithMock(`Generate announcement for winner '${winnerName}'`);
  
    try {
        const prompt = `Generate a very cheerful and celebratory announcement for the winner of a lucky draw. The winner's name is "${winnerName}". Make it sound grand and exciting. The language must be Vietnamese.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
                 thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating winner announcement:", error);
        return `Xin chúc mừng ${winnerName}! Bạn đã trở thành người chiến thắng!`;
    }
};
