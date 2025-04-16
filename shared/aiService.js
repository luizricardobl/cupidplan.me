const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateDateIdea = async (preferences) => {
  const prompt = `
  Generate a **well-structured, human-readable, and detailed** date plan based on these preferences:
  - Activities: ${preferences.activities?.join(", ") || "surprise me"}
  - Food: ${preferences.food?.join(", ") || "surprise me"}
  - Location: ${preferences.location || "anywhere exciting"}

  🎯 **Date Plan Instructions**
  - **Write in clear, natural sentences (NO markdown, NO special characters, NO asterisks, NO \n new lines).**
  - **Use paragraphs and bullet points instead of formatting symbols.**
  - **Make the response friendly, engaging, and easy to read.**
  - **Do NOT repeat 'Date Plan' at the beginning.**
  - **Format the response in a way that can be displayed directly on a website or app.**

  🚀 **Structure:**
  - **Introduction**: Set the mood for the date.
  - **Morning (if applicable)**: Describe a great way to start the day.
  - **Afternoon**: Fun and engaging activities.
  - **Dinner**: Ideal restaurant or meal recommendations.
  - **Evening/Night**: A unique way to end the date.
  - **Extras**: What to bring, dress code, weather tips.
  - **Special Touch**: A surprise or final memorable moment.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500, // Keep enough tokens for a full plan
    });

    // ✅ Ensure the response is clean and free from unnecessary symbols
    let dateIdea = response.choices[0].message.content;
    dateIdea = dateIdea.replace(/\*/g, ""); // Remove asterisks
    dateIdea = dateIdea.replace(/\\/g, ""); // Remove backslashes
    dateIdea = dateIdea.replace(/\n+/g, " "); // Replace multiple new lines with a space

    return dateIdea.trim(); // Trim extra spaces
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};

module.exports = { generateDateIdea };
