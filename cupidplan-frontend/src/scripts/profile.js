document.addEventListener("DOMContentLoaded", () => {
    // Popup handling
    const editProfileBtn = document.getElementById("editProfileBtn");
    const editProfilePopup = document.getElementById("editProfilePopup");
    const saveProfileBtn = document.getElementById("saveProfileBtn");
    const cancelProfileBtn = document.getElementById("cancelProfileBtn");
  
    const nameEl = document.getElementById("profileName");
    const locationAgeEl = document.getElementById("profileLocationAge");
  
    editProfileBtn.addEventListener("click", () => {
      editProfilePopup.style.display = "block";
    });
  
    cancelProfileBtn.addEventListener("click", () => {
      editProfilePopup.style.display = "none";
    });
  
    saveProfileBtn.addEventListener("click", () => {
      const newName = document.getElementById("newName").value;
      const newLocation = document.getElementById("newLocation").value;
      const newAge = document.getElementById("newAge").value;
  
      if (newName) nameEl.textContent = newName;
      if (newLocation && newAge) locationAgeEl.textContent = `${newLocation} • ${newAge} years old`;
  
      editProfilePopup.style.display = "none";
    });
  
    // About Me Section
    const editBioBtn = document.getElementById("editBioBtn");
    const aboutMeText = document.getElementById("aboutMeText");
    const aboutMeTextarea = document.getElementById("aboutMeTextarea");
    const saveBioBtn = document.getElementById("saveBioBtn");
    const charCounter = document.getElementById("charCounter");
    const bioSavedMessage = document.getElementById("bioSavedMessage");
  
    editBioBtn.addEventListener("click", () => {
      aboutMeText.style.display = "none";
      aboutMeTextarea.style.display = "block";
      saveBioBtn.style.display = "inline-block";
      aboutMeTextarea.value = aboutMeText.textContent;
    });
  
    aboutMeTextarea.addEventListener("input", () => {
      charCounter.textContent = `${aboutMeTextarea.value.length} / 200`;
    });
  
    saveBioBtn.addEventListener("click", () => {
      aboutMeText.textContent = aboutMeTextarea.value;
      aboutMeText.style.display = "block";
      aboutMeTextarea.style.display = "none";
      saveBioBtn.style.display = "none";
      bioSavedMessage.style.display = "inline";
      setTimeout(() => (bioSavedMessage.style.display = "none"), 2000);
    });
  
    // Interest Tags
    const tagsContainer = document.getElementById("tagsContainer");
    const tagInput = document.getElementById("tagInput");
    const addInterestBtn = document.querySelector(".add-interest-btn");
  
    addInterestBtn.addEventListener("click", () => {
      tagInput.style.display = "block";
      tagInput.focus();
    });
  
    tagInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && tagInput.value.trim() !== "") {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = tagInput.value;
        tagsContainer.appendChild(tag);
        tagInput.value = "";
        tagInput.style.display = "none";
      }
    });
  
    // Dating Preferences
    const distanceSlider = document.getElementById("distanceSlider");
    const distanceValue = document.getElementById("distanceValue");
  
    distanceSlider.addEventListener("input", () => {
      distanceValue.textContent = `Within ${distanceSlider.value} miles`;
    });
  
    // Toggle Switches
    const toggles = document.querySelectorAll(".toggle-switch");
  
    toggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        toggle.classList.toggle("active");
      });
    });
  });
  