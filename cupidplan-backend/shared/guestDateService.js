const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateGuestDateIdea = async (info) => {
  const {
    gender,
    setting,
    occasion,
    timing,
    vibe = [],
    activities = [],
    city,
    preferences = "",
    budget,
  } = info;

  const prompt = `
You're a witty and thoughtful AI date planner. Create a one-of-a-kind, exciting, romantic date idea for a user who filled out a short quiz. Use a fun, upbeat tone like you're helping a friend find the perfect plan.

Here’s the info:
- Planning for: ${gender}
- Setting: ${setting}
- Occasion: ${occasion}
- Time of day: ${timing}
- Vibe: ${vibe.join(", ") || "any"}
- Activities: ${activities.join(", ") || "anything fun"}
- City: ${city}
- Preferences: ${preferences || "none"}
- Budget: ${budget}

Use real activity ideas if possible. Make it sound personalized and exciting but also natural. Keep it Gen Z-friendly, a little flirty, and make it visually fun with emojis.
Use the users input to make the plans out based on what they choose. Never give options for locations that are Permanently closed or not available.
ONLY respond with the plan. No intro, no explanation.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You're a playful, thoughtful AI date expert." },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 700,
    });

    let idea = response.choices[0].message.content;

    return idea.trim();
  } catch (err) {
    console.error("❌ Error in generateGuestDateIdea:", err);
    return "Sorry, Cupid had a moment 😅 — couldn't create your date idea.";
  }
};

module.exports = { generateGuestDateIdea };
