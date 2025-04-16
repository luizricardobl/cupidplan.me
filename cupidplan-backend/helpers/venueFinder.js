const axios = require('axios');
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

const getNearbyVenues = async (city, keyword) => {
  const query = `${keyword} in ${city}`;
  const encodedQuery = encodeURIComponent(query);

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&key=${GOOGLE_API_KEY}`;

  try {
    const res = await axios.get(url);
    const places = res.data.results.slice(0, 3).map(place => place.name);
    return places;
  } catch (error) {
    console.error("❌ Google Places API error:", error.response?.data || error.message);
    return [];
  }
};

module.exports = { getNearbyVenues };
