const OpenAI = require('openai');
const { getNearbyVenues } = require('../helpers/venueFinder');
const { getVenueKeywordsForPreferences } = require('../helpers/venueMapper');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateDateIdea = async (preferences) => {
  const city = Array.isArray(preferences.location)
    ? preferences.location[0]
    : preferences.location || "your city";

  const hobbies = preferences.hobbies || [];
  const food = preferences.favoriteFood || [];
  const relationshipStage = preferences.relationshipStage || "dating";
  const budget = preferences.budget || "moderate";
  const dateFrequency = preferences.dateFrequency || "occasionally";
  const specialOccasion = preferences.specialOccasion || null;

  const venueKeywords = [...new Set(getVenueKeywordsForPreferences(preferences))];
  let realVenueSuggestions = [];
  let uniqueVenues = new Set();

  for (const keyword of venueKeywords.slice(0, 5)) {
    try {
      const venues = await getNearbyVenues(city, keyword);
      for (const place of venues) {
        if (!uniqueVenues.has(place)) {
          uniqueVenues.add(place);
          realVenueSuggestions.push(`${place} (${keyword})`);
        }
      }
    } catch (err) {
      console.error(`Error fetching venues for ${keyword}:`, err);
    }
  }

  const prompt = `
You're a witty, playful AI date planner. You're helping a couple plan an exciting, creative date in ${city} based on what they love.

Keep the tone upbeat, natural, and fun — like you're talking to a best friend. Use emojis, storytelling, and real venues if available.

Their preferences:
- Relationship: ${relationshipStage}
- City: ${city}
- Hobbies: ${hobbies.join(", ") || "open to anything"}
- Favorite Foods: ${food.join(", ") || "good food"}
- Budget: ${budget}
- Date frequency: ${dateFrequency}
${specialOccasion ? `- Special Occasion: ${specialOccasion}` : ""}

Real venue ideas to optionally use:
${realVenueSuggestions.length ? realVenueSuggestions.join("\n") : "No specific venues found – be creative."}

💡 Guidelines:
- Structure the day naturally: start chill, build energy, end romantic.
- Keep it casual, flirty, and visually fun with emojis.
- Include surprises, sensory moments (taste, scent, views), and interactions.
- DO NOT mention you're an AI or that this is a generated plan.
- Respond with only the plan (no intros or explanations).

Now generate a full date experience that feels real and exciting!
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You're a playful, creative Gen Z-friendly AI date planner." },
        { role: "user", content: prompt },
      ],
      temperature: 0.95,
      max_tokens: 800,
    });

    let dateIdea = response.choices[0].message.content;
    return dateIdea.trim();
  } catch (error) {
    console.error("❌ OpenAI API error:", error);
    return generateFallbackDateIdea(preferences);
  }
};

// ✅ Fallback if GPT fails
function generateFallbackDateIdea(preferences) {
  const hobbies = preferences.hobbies || [];
  const food = preferences.favoriteFood || [];
  const city = preferences.location || "your city";

  return `
✨ Your Backup Date Plan ✨

Start with a cozy breakfast at a local café in ${city}, maybe something known for amazing ${food.length ? food[0] : "pastries"} ☕🥐

Then explore a local spot that aligns with your interests — like a ${hobbies.length ? hobbies[0] : "museum or park"}.

For dinner, find a chill restaurant that serves ${food.slice(0, 2).join(" and ") || "something tasty"} and offers a romantic vibe 🍝🍣

Cap the night off with a scenic walk or rooftop hangout. Bring something meaningful like a question jar or mini photo book to spark deeper convos. 💬💖
`.trim();
}

module.exports = { generateDateIdea };
