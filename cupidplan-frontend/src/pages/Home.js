import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import "../styles/Home.css"; 

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: "", name: "" });


  useEffect(() => {
    const darkModeStored = localStorage.getItem("darkMode") === "true";
  
    if (darkModeStored) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, []);
  
  
  
  useEffect(() => {
    const storedEmail = localStorage.getItem("rememberedUser") || sessionStorage.getItem("loggedInUser");
    const token = localStorage.getItem("token");
  
    if (!storedEmail || !token) {
      navigate("/");
      return;
    }
  
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({ email: storedEmail, name: res.data.name });
      } catch (err) {
        console.error("❌ Failed to fetch user profile:", err);
      }
    };
  
    fetchUserProfile();
  }, [navigate]);
  

  //  Logout Function (Clears Login Data & Redirects)
  const handleLogout = () => {
    localStorage.removeItem("rememberedUser"); 
    sessionStorage.removeItem("loggedInUser"); 
    navigate("/"); 
  };

  return (
    <div className="home-container">
  <button className="logout-btn" onClick={handleLogout}>Logout</button>

  {/* ✅ Welcome Text + Button */}
  <div className="header-glow-bg"></div>

  <div className="welcome-text">
    <h1>Welcome, {user.name || user.email}!</h1>
    
    <button className="find-match-btn" onClick={() => navigate("/discover")}>
      Find Your Match
    </button>

  <div className="about-cupid-wrapper">
  <div className="side-labels-container">
    <div className="side-label left-label">
      <div className="side-arrow">🔻</div>
      <div className="side-text">Popular<br />Monthly Dates</div>
    </div>
    <div className="side-label right-label">
      <div className="side-arrow">🔻</div>
      <div className="side-text">Popular<br />Monthly Dates</div>
    </div>
  </div>

  <div className="about-cupid-section">
    <h2>💘 What is CupidPlan.me?</h2>
    <p>
      CupidPlan.me is the final capstone project created by students at UMass Boston, built to 
      reimagine the modern dating experience. But it’s more than just a school project — it’s a real platform 
      designed to help people build genuine connections and plan unforgettable dates.
    </p>

    <h3>🧩 What problem are we solving?</h3>
    <p>
      Most dating apps stop at the match. After that, it’s awkward texting and guessing what to do next.
      CupidPlan.me bridges that gap by helping you not only find a match, but actually plan fun, customized
      date experiences that match your shared vibe.
    </p>

    <h3>🚀 How does it work?</h3>
    <p>
      Our platform learns what you like — from interest-preferences to your dealbreakers — and matches you with compatible users
      based on personality, preferences, and proximity. Once matched, we help you plan the perfect date using AI-powered 
      suggestions, real venues, and shared interests.
    </p>

    <h3>🎓 Why it matters?</h3>
    <p>
      This project represents months of collaboration, coding, and creativity. It's not just built to get a grade — 
      it's built to make real-world dating better.
    </p>

    <h3>🌟 Give it a try</h3>
    <p>
      Start exploring your matches, check out date ideas, and help us shape the future of dating.
      This is just the beginning ❤️
    </p>
  </div>
</div>
</div>
<div className="slideshow-footer">
  <div className="slideshow-row scroll-left">
  <div className="slide-track">
    {[...Array(2)].flatMap(() => [
      { title: "Cooking Class", img: "https://media.istockphoto.com/id/1268900953/photo/cooking-master-class-pasta-preparing-hands.webp?a=1&b=1&s=612x612&w=0&k=20&c=dGpYyn-ou0pMNaTv29CHke2gP7PJVLE_KRLQnSoUn_4=" },
      { title: "Museum Tour", img: "https://images.unsplash.com/photo-1506845347893-bc5faede1eec?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8TXVzZXVtJTIwVG91cnxlbnwwfHwwfHx8MA%3D%3D" },
      { title: "Pottery Workshop", img: "https://media.istockphoto.com/id/1884847089/photo/senior-woman-on-pottery-class-at-a-ceramics-workshop.webp?a=1&b=1&s=612x612&w=0&k=20&c=u84_AEtVWlVt66ipC_jDO2QHJTla7_KVJmZ_acY5INM=" },
      { title: "Picnic at the Park", img: "https://plus.unsplash.com/premium_photo-1678914045690-8fc66bb2d896?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8UGljbmljJTIwYXQlMjB0aGUlMjBQYXJrJTIwZGF0ZXxlbnwwfHwwfHx8MA%3D%3D" },
      { title: "Bowling Night", img: "https://media.istockphoto.com/id/1979956166/photo/friends-holding-bowling-balls-at-a-bowling-club.webp?a=1&b=1&s=612x612&w=0&k=20&c=FYPNEfjm620T1ROHvuAmlmiLAWjBeZFjUE06dfYoin4=" },
      { title: "Botanical Garden Visit", img: "https://media.istockphoto.com/id/1280322480/photo/male-visitor-with-female-guide-taking-photo-of-giant-cactuses.webp?a=1&b=1&s=612x612&w=0&k=20&c=8p0FF3aBpv02TlBdPR_YJWGao-amXNa3loRuRfkfPZE=" },
      { title: "Mini Golf Date", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPXkwgna22CikEOwRcNjURovi3k_okTrdn6w&s" },
      { title: "Farmers Market Trip", img: "https://plus.unsplash.com/premium_photo-1686285540093-0613f74311dd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8RmFybWVycyUyME1hcmtldHxlbnwwfHwwfHx8MA%3D%3D" },
      { title: "Ice Cream Crawl", img: "https://images.unsplash.com/photo-1614387726083-c445e799102b?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      { title: "Board Game Café", img: "https://media.istockphoto.com/id/500174914/photo/happy-friends-playing-cross-and-section-game-in-a-cafe.webp?a=1&b=1&s=612x612&w=0&k=20&c=U-i7ejdDXHIsbQ3WSHQKrjxwDm1FOB7YZNoFePYC_iU=" },
      { title: "Sushi Making Night", img: "https://media.istockphoto.com/id/1383018025/photo/couple-made-sushi-for-lunch.webp?a=1&b=1&s=612x612&w=0&k=20&c=2zaBr60Wu3Ykd8FwIPIkm_Nl9la5RVDW6V4l3Fe6pLI=" },
      { title: "Indoor Rock Climbing", img: "https://plus.unsplash.com/premium_photo-1672280940910-ef13d1fd0daf?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8SW5kb29yJTIwUm9jayUyMENsaW1iaW5nJTIwZGF0ZXxlbnwwfHwwfHx8MA%3D%3D" },
      { title: "Poetry Bookstore Date", img: "https://media.istockphoto.com/id/1037604048/photo/smiling-couple-reading-books.webp?a=1&b=1&s=612x612&w=0&k=20&c=CKSj4wq7fORy6mQvECT99_UpEuCP9NgFOos_KQCUfAQ=" },
      { title: "Drive-In Movie", img: "https://media.istockphoto.com/id/1293456007/photo/silhouetted-view-of-attractive-young-couple-boy-and-girl-embracing-spending-time-together.webp?a=1&b=1&s=612x612&w=0&k=20&c=4dfWgBjObBrnfN505ESPgJknVbEk1Cadj8OYIDqKjGY=" },
      { title: "Trivia Night Out", img: "https://www.shutterstock.com/image-photo/pub-trivia-night-group-people-260nw-2563181367.jpg" },
      { title: "Skate Park Hangout", img: "https://media.istockphoto.com/id/948602116/photo/female-skaters-using-smart-phone-at-skate-park.webp?a=1&b=1&s=612x612&w=0&k=20&c=3JlAN2sV09_YZHzz7yxKm0q3i1vu3YGkUwaiND2bfJA=" },
      { title: "Tea Tasting", img: "https://image.kkday.com/v2/image/get/w_960%2Cc_fit%2Cq_55%2Ct_webp/s1.kkday.com/product_157080/20231124121121_nQL7C/png" },
      { title: "Vinyl Shop Vibes", img: "https://cdn.prod.website-files.com/621ce1736f293c5bb7029149/64c3892d5e7e936176d47747_pexels-cottonbro-studio-6865921.jpg" },
      { title: "Sunset Hilltop Photos", img: "https://images.unsplash.com/photo-1603638779610-9c28e3e3d980?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fFN1bnNldCUyMEhpbGx0b3AlMjBkYXRlfGVufDB8fDB8fHww" },
      { title: "Comedy Show Night", img: "https://media.istockphoto.com/id/1450588520/photo/young-couple-watching-a-movie-at-the-outdoors-cinema.webp?a=1&b=1&s=612x612&w=0&k=20&c=H9PrPEdZBWhObFKIHvQue1HmQaPCv49UH--Gh3wiF9Y=" },
    ]).map((idea, i) => (
      <div className="slide-card" key={`left-${i}`}>
        <img src={idea.img} alt={idea.title} />
        <p>{idea.title}</p>
      </div>
    ))}
  </div>
</div>
<div className="slideshow-row scroll-right">
<div className="slide-track">
{[...Array(2)].flatMap(() => [
      { title: "Karaoke Night", img: "https://media.istockphoto.com/id/1205639672/photo/girls-are-at-karaoke-party.webp?a=1&b=1&s=612x612&w=0&k=20&c=nk7DBrqJURkQrASzh44Czq1HNKJfhAVKWZRg1X_gdnM=" },
      { title: "Sunset Beach Walk", img: "https://images.unsplash.com/photo-1578264691760-5564958a2db2?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8U3Vuc2V0JTIwQmVhY2glMjBXYWxrfGVufDB8fDB8fHww" },
      { title: "Couples Painting Class", img: "https://media.istockphoto.com/id/1291806780/photo/oh-i-like-it.webp?a=1&b=1&s=612x612&w=0&k=20&c=myZMeXjNOgNwHe8SFAp3SIF7_whbEXfsFk3A_McPCBA=" },
      { title: "Arcade Showdown", img: "https://images.unsplash.com/photo-1656880659173-360b8151f7fc?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fEFyY2FkZSUyMFNob3dkb3dufGVufDB8fDB8fHww" },
      { title: "Go-Kart Racing", img: "https://i.pinimg.com/236x/b7/b1/65/b7b1653257a58679f8943981998cc517.jpg" },
      { title: "Bookstore + Café Hop", img: "https://images.stockcake.com/public/b/9/6/b96ac6eb-a9d0-406c-9188-820726a6b413_large/cozy-coffee-date-stockcake.jpg" },
      { title: "Stargazing at a Hilltop", img: "https://plus.unsplash.com/premium_photo-1665203478513-719b7a2cd851?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8U3RhcmdhemluZyUyMGF0JTIwYSUyMEhpbGx0b3AlMjBkYXRlfGVufDB8fDB8fHww" },
      { title: "Themed Costume Date", img: "https://img.ctykit.com/cdn/az-phoenix/images/tr:w-1800/halloween-party.png" },
      { title: "Dessert Tasting Tour", img: "https://media.istockphoto.com/id/2175692144/photo/desserts-at-a-family-reunion-in-canada.webp?a=1&b=1&s=612x612&w=0&k=20&c=lKAktkR3pXvpKypwfjCtnEwSJ3zrAc0zLVuZk_tWx-E=" },
      { title: "Thrift Store", img: "https://media.istockphoto.com/id/2208805901/photo/young-couple-choosing-clothes-in-a-vintage-second-hand-shop.webp?a=1&b=1&s=612x612&w=0&k=20&c=lESjLdNGlH3Y4JgB6LlM1ihmNGZkI9qAunef_hAYwss=" },
      { title: "Roller Skating Night", img: "https://media.istockphoto.com/id/1385530248/photo/retro-roller-skating-disco-couple.jpg?s=612x612&w=0&k=20&c=WtCqay-eyAjmb2bRNzWpOSKpTstWjAkluCo8ooSnasQ=" },
      { title: "Zoo or Aquarium Visit", img: "https://images.unsplash.com/photo-1663870614381-12660a0eba10?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fFpvbyUyMG9yJTIwQXF1YXJpdW0lMjBkYXRlfGVufDB8fDB8fHww" },
      { title: "Boardwalk Bike Ride", img: "https://media.istockphoto.com/id/1563537911/photo/selfie-bike-and-date-with-a-couple-cycling-on-a-promenade-during-summer-with-love-romance-and.webp?a=1&b=1&s=612x612&w=0&k=20&c=ihps6yU7Lv2ETI2yeUgGXOWsxASyjfIRB_0rWqw65Ds=" },
      { title: "Outdoor Movie Screening", img: "https://media.istockphoto.com/id/1167517599/photo/couple-in-love-watching-a-movie-in-twilight-outside-on-the-lawn-in-a-courtyard.jpg?s=612x612&w=0&k=20&c=SPyk-M9lleGUf7MZvmeUqaX2R6-g8GHyykKFb7L9ysQ=" },
      { title: "Poetry Slam Night", img: "https://img.apmcdn.org/4cc4bb746cf8866576c2905c3628ba72e7b5e699/uncropped/fc3b2b-20130305-slam-poetry.jpg" },
      { title: "Sunrise Donut Run", img: "https://media.istockphoto.com/id/1327334309/photo/food-and-drinks.webp?a=1&b=1&s=612x612&w=0&k=20&c=PXAvLZLZIk-XHEo9FJCuXCK9pOGrhJDvlCSY984y_70=" },
      { title: "Hot Air Balloon Date", img: "https://media.istockphoto.com/id/1283679278/photo/aerial-view-from-a-hot-air-balloon-with-loving-couple.webp?a=1&b=1&s=612x612&w=0&k=20&c=ytNprEIrxXLOVM3ZlhVmzPsLG1fdlnmm03swKCo1U1c=" },
      { title: "City Rooftop Picnic", img: "https://media.istockphoto.com/id/1424402199/photo/rooftop-open-air-cinema-experience.webp?a=1&b=1&s=612x612&w=0&k=20&c=0xr1AWgIx_FaI6iH075dQ7LjzPyPts6IXp4DSz82sW0=" },
      { title: "Jazz Club Night", img: "https://res.cloudinary.com/the-infatuation/image/upload/c_scale,w_1200,q_auto,f_auto/images/Birdland_Orrin_Evans_xmi235" },
      { title: "Dog Park Double Date", img: "https://media.istockphoto.com/id/1008299076/photo/best-time-ever.jpg?s=612x612&w=0&k=20&c=7HmzKKtk0phfcBh0BKX3l1xB4eqHlJzcZ0KXU4CT_Zk=" },
    ]).map((idea, i) => (
      <div className="slide-card" key={`right-${i}`}>
        <img src={idea.img} alt={idea.title} />
        <p>{idea.title}</p>
      </div>
    ))}
  </div>
</div>
</div>
</div>
  );
};

export default Home;
