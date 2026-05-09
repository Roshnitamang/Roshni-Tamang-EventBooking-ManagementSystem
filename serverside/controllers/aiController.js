import https from 'https';

export const chatWithAI = async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.json({ success: false, message: "No message provided" });
    }

    try {
        const rawApiKey = process.env.GEMINI_API_KEY;
        const apiKey = rawApiKey ? rawApiKey.trim() : null;

        if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            return res.json({ 
                success: true, 
                reply: "Hello! I am the Planora Assistant. It seems my Gemini API key hasn't been configured yet. Please enter a valid API key in the serverside/.env file to start chatting with me!" 
            });
        }

        // System prompt
        const systemInstruction = `You are the Planora AI Assistant, a helpful and professional guide for the Planora event management platform. 
Your goal is to help users discover events, manage their bookings, and answer questions about the platform. 
Be concise, friendly, and always stay in character as a helpful representative of Planora. 
If you don't know something about a specific event, suggest they check the event details page.`;

        // Build contents array for the API call
        const contents = [];

        // Add any history
        if (history && Array.isArray(history) && history.length > 0) {
            for (const h of history) {
                contents.push(h);
            }
        }

        // Add the new user message
        contents.push({
            role: "user",
            parts: [{ text: message }]
        });

        // Try multiple model names, starting with the most reliable ones
        const modelsToTry = [
            "gemini-2.0-flash",
            "gemini-flash-latest",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-pro"
        ];

        for (const modelName of modelsToTry) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
                
                const body = JSON.stringify({
                    system_instruction: {
                        parts: [{ text: systemInstruction }]
                    },
                    contents: contents,
                    generationConfig: {
                        maxOutputTokens: 800,
                    }
                });

                const result = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: body
                });

                const data = await result.json();
                
                console.log(`Model ${modelName} response status:`, result.status);

                if (result.status === 404) {
                    console.log(`Model ${modelName} not found, trying next...`);
                    continue; // Try the next model
                }

                if (!result.ok) {
                    console.error(`Model ${modelName} error:`, JSON.stringify(data));
                    continue;
                }

                // Extract the text from the response
                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    const text = data.candidates[0].content.parts[0].text;
                    return res.json({ success: true, reply: text });
                } else {
                    console.error(`Model ${modelName} unexpected response:`, JSON.stringify(data));
                    continue;
                }

            } catch (err) {
                console.error(`Failed with model ${modelName}:`, err.message);
                continue;
            }
        }

        // If we reach here, all models failed
        return res.json({ 
            success: false, 
            message: "All AI models failed. Please verify your Gemini API key is valid and has the Generative Language API enabled in Google Cloud Console."
        });

    } catch (error) {
        console.error("Gemini AI Error:", error);
        return res.json({ 
            success: false, 
            message: "Something went wrong with the AI assistant. Please try again later.",
            error: error.message 
        });
    }
}

export const getAISuggestions = async (req, res) => {
    const { bookings, events } = req.body;

    if (!bookings || !events) {
        return res.json({ success: false, message: "Missing data" });
    }

    try {
        const rawApiKey = process.env.GEMINI_API_KEY;
        const apiKey = rawApiKey ? rawApiKey.trim() : null;

        if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            return res.json({ 
                success: false, 
                message: "API Key not configured"
            });
        }

        // Build the prompt
        const historyText = bookings.length > 0 
            ? bookings.map(b => `${b.eventId?.title} (${b.eventId?.category})`).join(', ')
            : "No past bookings yet.";
            
        const availableEventsText = events.map(e => `ID: ${e._id}, Title: ${e.title}, Category: ${e.category}, Date: ${e.date}`).join(' | ');

        const prompt = `User's past booking history: ${historyText}.
Available upcoming events: ${availableEventsText}.

Based on their history, suggest the top 3 events they might like from the available upcoming events. 
Return only a JSON array of event IDs, nothing else. Example: ["id1", "id2", "id3"]. 
If no history, suggest the most popular looking ones. 
If no events match well, suggest the ones with the soonest dates.`;

        const modelsToTry = [
            "gemini-2.0-flash",
            "gemini-flash-latest",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-pro"
        ];

        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
                
                const body = JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 200,
                    }
                });

                const result = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: body
                });

                const data = await result.json();

                if (result.ok && data.candidates && data.candidates[0] && data.candidates[0].content) {
                    const text = data.candidates[0].content.parts[0].text;
                    console.log(`Gemini Suggestion Raw Text (${modelName}):`, text);
                    
                    // Clean the text to extract JSON array
                    const jsonMatch = text.match(/\[.*\]/s);
                    if (jsonMatch) {
                        try {
                            const suggestedIds = JSON.parse(jsonMatch[0]);
                            return res.json({ success: true, suggestedIds });
                        } catch (parseError) {
                            console.error(`JSON Parse Error for AI response (${modelName}):`, parseError);
                        }
                    }
                } else if (!result.ok) {
                    console.error(`Gemini API Error Response (${modelName}):`, JSON.stringify(data));
                    lastError = data;
                }
            } catch (err) {
                console.error(`Model ${modelName} failed:`, err.message);
            }
        }

        console.warn("All Gemini models failed for suggestions");
        res.json({ success: false, message: "Failed to generate AI suggestions", details: lastError });

    } catch (error) {
        console.error("Gemini Suggestion Exception:", error);
        res.json({ success: false, message: error.message });
    }
}

