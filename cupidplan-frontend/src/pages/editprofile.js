document.addEventListener("DOMContentLoaded", function () {
    // profile about me text box
    const textarea = document.getElementById("aboutMeTextarea");
    const textDisplay = document.getElementById("aboutMeText");
    const editBioBtn = document.getElementById("editBioBtn");
    const saveBioBtn = document.getElementById("saveBioBtn");
    const savedMessage = document.getElementById("bioSavedMessage");
    const charCounter = document.getElementById("charCounter");
    const charLimit = 200;

    // this loads user saved bio
    const savedBio = localStorage.getItem("userBio");
    if (savedBio) {
        textDisplay.textContent = savedBio;
        textarea.value = savedBio;
        toggleViewMode(true); 
    } else {
        toggleViewMode(false); 
    }

    // toggle between edit and save modes
    editBioBtn.addEventListener("click", () => toggleViewMode(false));

    // this saves a users bio to profile
    saveBioBtn.addEventListener("click", () => {
        const bioText = textarea.value.trim();
        if (bioText.length <= charLimit) {
            localStorage.setItem("userBio", bioText);
            textDisplay.textContent = bioText;
            toggleViewMode(true);

            savedMessage.style.display = "block";
            setTimeout(() => savedMessage.style.display = "none", 2000);
        }
    });

    // counts characters in bio
    textarea.addEventListener("input", () => {
        const remaining = charLimit - textarea.value.length;
        charCounter.textContent = `${textarea.value.length} / ${charLimit}`;
        charCounter.style.color = remaining < 0 ? "red" : "black";
    });

    // toggle between save and viewing modes
    function toggleViewMode(isViewMode) {
        textDisplay.style.display = isViewMode ? "block" : "none";
        textarea.style.display = isViewMode ? "none" : "block";
        charCounter.style.display = isViewMode ? "none" : "block";
        saveBioBtn.style.display = isViewMode ? "none" : "inline-block";
        editBioBtn.style.display = isViewMode ? "inline-block" : "none";
    }

    // profile pic section
    const cameraButton = document.getElementById("cameraButton");
    const profilePicInput = document.getElementById("profilePicInput");
    const profilePic = document.getElementById("profilePic");

    cameraButton.addEventListener("click", () => profilePicInput.click());

    profilePicInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePic.src = e.target.result;
                localStorage.setItem("profilePic", e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // interest tags secton
    const addTagButton = document.querySelector(".add-interest-btn");
    const tagInput = document.getElementById("tagInput");
    const tagsContainer = document.getElementById("tagsContainer");
    const savedTags = JSON.parse(localStorage.getItem("userTags")) || [];

    savedTags.forEach(tag => createTag(tag));

    addTagButton.addEventListener("click", () => {
        tagInput.style.display = "inline-block";
        tagInput.focus();
        addTagButton.style.display = "none";
    });

    tagInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            const newTag = tagInput.value.trim();
            if (newTag && !savedTags.includes(newTag)) {
                savedTags.push(newTag);
                localStorage.setItem("userTags", JSON.stringify(savedTags));
                createTag(newTag);
                tagInput.value = "";
                tagInput.style.display = "none";
                addTagButton.style.display = "inline-block";
            }
        }
    });

    // creates new interest tags
    function createTag(tagText) {
        const tagElement = document.createElement("span");
        tagElement.classList.add("interest-tag");
        tagElement.textContent = tagText;

        const removeIcon = document.createElement("i");
        removeIcon.classList.add("fa-regular", "fa-trash-can");
        removeIcon.style.marginLeft = "10px";
        removeIcon.style.cursor = "pointer";

        removeIcon.addEventListener("click", () => {
            tagsContainer.removeChild(tagElement);
            savedTags.splice(savedTags.indexOf(tagText), 1);
            localStorage.setItem("userTags", JSON.stringify(savedTags));
        });

        tagElement.appendChild(removeIcon);
        tagsContainer.appendChild(tagElement);
    }

    // age range section
    const minAgeInput = document.getElementById("minAgeInput");
    const maxAgeInput = document.getElementById("maxAgeInput");

    const savedMinAge = localStorage.getItem("userMinAge");
    const savedMaxAge = localStorage.getItem("userMaxAge");

    if (savedMinAge) minAgeInput.value = savedMinAge;
    if (savedMaxAge) maxAgeInput.value = savedMaxAge;

    minAgeInput.min = 18;
    maxAgeInput.min = 18;

    minAgeInput.addEventListener("input", () => {
        if (parseInt(minAgeInput.value) < 18) minAgeInput.value = 18;
        localStorage.setItem("userMinAge", minAgeInput.value);
    });

    maxAgeInput.addEventListener("input", () => {
        if (parseInt(maxAgeInput.value) < 18) maxAgeInput.value = 18;
        localStorage.setItem("userMaxAge", maxAgeInput.value);
    });

    // distance slider section
    const distanceSlider = document.getElementById("distanceSlider");
    const distanceValue = document.getElementById("distanceValue");

    const savedDistance = localStorage.getItem("userDistance");
    if (savedDistance) {
        distanceSlider.value = savedDistance;
        distanceValue.textContent = `${savedDistance} miles`;
    }

    distanceSlider.addEventListener("input", () => {
        const miles = distanceSlider.value;
        distanceValue.textContent = `${miles} miles`;
        localStorage.setItem("userDistance", miles);
    });

    // date type checklist section
    const dateTypeContainer = document.getElementById("dateTypeCheck");
    const checkboxes = dateTypeContainer.querySelectorAll("input[type='checkbox']");

    checkboxes.forEach((checkbox) => {
        const savedState = localStorage.getItem(checkbox.value);
        if (savedState === "true") checkbox.checked = true;

        checkbox.addEventListener("change", () => {
            localStorage.setItem(checkbox.value, checkbox.checked);
        });
    });

    // makes setting section toggleable
    function setupToggleSwitch(toggleId) {
        const toggleSwitch = document.getElementById(toggleId);
        const savedState = localStorage.getItem(toggleId);

        if (savedState === "on") toggleSwitch.classList.add("active");

        toggleSwitch.addEventListener("click", () => {
            toggleSwitch.classList.toggle("active");
            const isActive = toggleSwitch.classList.contains("active");
            localStorage.setItem(toggleId, isActive ? "on" : "off");
        });
    }

    // setting toggle switches 
    setupToggleSwitch("toggleProfile");
    setupToggleSwitch("toggleAI");
    setupToggleSwitch("toggleDarkMode");

    // edit name, age and location section
    const profileName = document.getElementById("profileName");
    const profileLocationAge = document.getElementById("profileLocationAge");
    const editProfileBtn = document.getElementById("editProfileBtn");
    const saveProfileBtn = document.getElementById("saveProfileBtn");
    const cancelProfileBtn = document.getElementById("cancelProfileBtn");
    const editProfilePopup = document.getElementById("editProfilePopup");
    const newLocationInput = document.getElementById("newLocation");
    const newAgeInput = document.getElementById("newAge");
    const newNameInput = document.getElementById("newName");

    const savedName = localStorage.getItem("profileName");
    const savedLocation = localStorage.getItem("profileLocation");
    const savedAge = localStorage.getItem("profileAge");

    if (savedName) {
        profileName.textContent = savedName;
    }
    if (savedLocation && savedAge) {
        profileLocationAge.textContent = `${savedLocation} • ${savedAge} years old`;
    }

    // opens popup to edit profile
    editProfileBtn.addEventListener("click", function () {
        newNameInput.value = savedName || '';
        newLocationInput.value = savedLocation || ''; 
        newAgeInput.value = savedAge || ''; 
        editProfilePopup.style.display = "flex";
    });

    // Save profile changes
    saveProfileBtn.addEventListener("click", function () {
        const updatedName = newNameInput.value.trim()
        const updatedLocation = newLocationInput.value.trim();
        const updatedAge = newAgeInput.value.trim();

        // updates name, location and age
        if (updatedName) {
            profileName.textContent = updatedName;
        }

        if (updatedLocation && updatedAge) {
            profileLocationAge.textContent = `${updatedLocation} • ${updatedAge} years old`;

            localStorage.setItem("profileName", updatedName);
            localStorage.setItem("profileLocation", updatedLocation);
            localStorage.setItem("profileAge", updatedAge);

            editProfilePopup.style.display = "none";
        }
    });

    // close popup without saving
    cancelProfileBtn.addEventListener("click", function () {
        editProfilePopup.style.display = "none";
    });
});