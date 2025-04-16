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
  const dateFrequency = preferences.dateFrequency || "occasional";
  const specialOccasion = preferences.specialOccasion || false;

  const venueKeywords = [...new Set(getVenueKeywordsForPreferences(preferences))];

  let realVenueSuggestions = [];
  let uniqueVenues = new Set();

  for (const keyword of venueKeywords.slice(0, 5)) {
    try {
      const venues = await getNearbyVenues(city, keyword);
      for (const place of venues) {
        if (!uniqueVenues.has(place)) {
          uniqueVenues.add(place);
          realVenueSuggestions.push(`- ${place} (${keyword})`);
        }
      }
    } catch (err) {
      console.error(`Error fetching venues for ${keyword}:`, err);
    }
  }

  const realVenueText = realVenueSuggestions.length
    ? realVenueSuggestions.join("\n")
    : "";

  const prompt = `
You're a creative date planner helping ${relationshipStage} couples create magical experiences together. 
Create a personalized, romantic full-day date idea based on these details:

### Couple's Profile:
- Shared passions: ${hobbies.join(", ") || "exploring new experiences"}
- Favorite foods: ${food.join(", ") || "delicious cuisine"}
- Location: ${city}
- Budget: ${budget}
- Date frequency: ${dateFrequency}
${specialOccasion ? `- Special occasion: ${specialOccasion}\n` : ""}

### Available Venues/Activities:
${realVenueText || "Use creative local options that match their interests"}

### Guidelines:
1. PERSONALIZATION:
   - Weave their hobbies naturally into multiple activities
   - Include at least one surprise element they wouldn't expect
   - For ${relationshipStage} couples, make it ${relationshipStage === "married" ? "rekindle the spark" : "help them connect deeper"}

2. STRUCTURE:
   - Create a narrative flow throughout the day
   - Alternate between active and relaxed moments
   - Include at least one unique activity they've likely never done

3. ROMANCE BOOSTERS:
   - Add subtle romantic touches in unexpected places
   - Include sensory elements (taste, touch, scent, etc.)
   - Create opportunities for meaningful connection

4. FORMAT:
Morning: [Start with something energizing but not too early]
...
Afternoon: [Mix of activity and relaxation]
...
Dinner: [Make this special - consider their food preferences]
...
Evening: [Build toward romantic climax]
...
Secret Sauce: [One unexpected twist that makes it unforgettable]

Respond ONLY with the date plan in the specified format - no introductions or explanations. Make it feel tailor-made for them, using a warm, excited tone that builds anticipation.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 700,
    });

    let dateIdea = response.choices[0].message.content;

    dateIdea = dateIdea
      .replace(/\*/g, "")
      .replace(/\\/g, "")
      .replace(/\n{2,}/g, "\n\n")
      .trim();

    return dateIdea;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return generateFallbackDateIdea(preferences);
  }
};

// ✅ Fallback date idea
function generateFallbackDateIdea(preferences) {
  const hobbies = preferences.hobbies || [];
  const food = preferences.favoriteFood || [];
  const city = preferences.location || "your city";

  return `
Morning: Start with a cozy breakfast at a local café known for ${food.length ? food[0] : "great pastries"}.

Afternoon: Explore ${hobbies.length ? `a ${hobbies[0]} exhibit` : "a museum"} in ${city}, followed by a chill walk in a scenic park.

Dinner: Enjoy ${food.length ? food.slice(0, 2).join(" and ") : "something delicious"} at a romantic spot with a relaxed vibe.

Evening: Cap it off with a private activity like stargazing or a mini game night.

Secret Sauce: Leave each other hand-written notes to discover at different points in the date.
`.trim();
}

module.exports = { generateDateIdea };
