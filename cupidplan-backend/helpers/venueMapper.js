// helpers/venueMapper.js

const hobbyToVenueMap = {
    gaming: "gaming cafe",
    cooking: "cooking class",
    photography: "photo walk",
    anime: "anime movie theater",
    hiking: "hiking trail",
    dancing: "dance studio",
    painting: "art workshop",
    bowling: "bowling alley",
    skating: "roller rink",
    music: "live music venue",
    reading: "bookstore café",
    movies: "cinema",
    food: "restaurant",
    biking: "bike rental",
    comedy: "comedy club"
  };
  
  const getVenueKeywordsForPreferences = (preferences) => {
    const hobbies = preferences.hobbies || [];
  
    const keywords = hobbies
      .map(hobby => hobbyToVenueMap[hobby.toLowerCase()])
      .filter(Boolean); // Remove any undefined matches
  
    return [...new Set(keywords)]; // Ensure uniqueness
  };
  
  module.exports = { getVenueKeywordsForPreferences };
  