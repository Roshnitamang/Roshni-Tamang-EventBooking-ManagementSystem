import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Call Gemini AI to get structured output or recommendations
 * @param {string} systemInstruction - The system prompt
 * @param {string} prompt - The user prompt
 * @returns {Promise<string>} - The AI response
 */
export const getAIResponse = async (systemInstruction, prompt) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            throw new Error("Gemini API key not configured");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        const modelsToTry = [
            "gemini-1.5-flash",
            "gemini-1.5-pro"
        ];

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ 
                    model: modelName,
                    systemInstruction: systemInstruction 
                });

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                
                if (text) {
                    return text;
                }
            } catch (err) {
                console.error(`Failed with model ${modelName}:`, err.message);
                continue;
            }
        }
        throw new Error("All Gemini models failed");
    } catch (error) {
        console.error("Gemini Service Error:", error.message);
        throw error;
    }
};
