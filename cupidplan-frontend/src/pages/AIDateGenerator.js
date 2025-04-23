import React, { useState } from "react";
import "../styles/AIDateGenerator.css";
import axios from "axios";

const AIDateGenerator = () => {
  const [formData, setFormData] = useState({
    gender: "",
    setting: "",
    occasion: "",
    timing: "",
    vibe: [],
    activities: [],
    city: "",
    preferences: "",
    budget: "",
  });

  const [generatedIdea, setGeneratedIdea] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleInput = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleArrayField = (field, value) => {
    const arr = formData[field];
    if (arr.includes(value)) {
      setFormData({ ...formData, [field]: arr.filter((v) => v !== value) });
    } else {
      setFormData({ ...formData, [field]: [...arr, value] });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/date-generator", formData);
      setGeneratedIdea(res.data.idea);
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const SelectableButton = ({ field, value, isArray = false }) => {
    const isSelected = isArray
      ? formData[field].includes(value)
      : formData[field] === value;

    return (
      <button
        className={`selectable-option ${isSelected ? "selected" : ""}`}
        onClick={() =>
          isArray ? toggleArrayField(field, value) : handleInput(field, value)
        }
      >
        {value}
      </button>
    );
  };

  return (
    <div className="ai-date-generator">
      <h2>AI Date Generator 💘</h2>

      {generatedIdea ? (
        <div className="result">
          <h3>Your Custom Date Idea:</h3>
          <p>✨ {generatedIdea}</p>
        </div>
      ) : (
        <>
          {step === 1 && (
            <div>
              <p>What gender are you planning for?</p>
              {["Male", "Female", "Other"].map((g) => (
                <SelectableButton key={g} field="gender" value={g} />
              ))}
              <p>Preferred Setting:</p>
              {["Staying In", "Staying Out", "Virtual"].map((s) => (
                <SelectableButton key={s} field="setting" value={s} />
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <p>What’s the occasion?</p>
              <input
                type="text"
                value={formData.occasion}
                onChange={(e) => handleInput("occasion", e.target.value)}
                placeholder="e.g., First Date, Anniversary"
              />
              <p>Preferred time of day?</p>
              {["Morning", "Afternoon", "Evening"].map((t) => (
                <SelectableButton key={t} field="timing" value={t} />
              ))}
            </div>
          )}

          {step === 3 && (
            <div>
              <p>Select the vibe:</p>
              {["Romantic", "Adventurous", "Chill", "Creative", "Funny", "Relaxing"].map((v) => (
                <SelectableButton key={v} field="vibe" value={v} isArray />
              ))}
            </div>
          )}

          {step === 4 && (
            <div>
              <p>Select preferred activities:</p>
              {[
                "Food & Drink Experiences",
                "Outdoor Adventures",
                "Museums & Culture",
                "Live Performances",
                "Games & Entertainment",
                "DIY & Creative",
              ].map((a) => (
                <SelectableButton key={a} field="activities" value={a} isArray />
              ))}
            </div>
          )}

          {step === 5 && (
            <div>
              <p>Which city are you in?</p>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInput("city", e.target.value)}
                placeholder="e.g., Boston"
              />
            </div>
          )}

          {step === 6 && (
            <div>
              <p>Any preferences we should know? (optional)</p>
              <input
                type="text"
                value={formData.preferences}
                onChange={(e) => handleInput("preferences", e.target.value)}
                placeholder="e.g., Vegan, wheelchair accessible, dog-friendly"
              />
            </div>
          )}

          {step === 7 && (
            <div>
              <p>What’s your budget?</p>
              {["Low", "Moderate", "High"].map((b) => (
                <SelectableButton key={b} field="budget" value={b} />
              ))}
            </div>
          )}

          <div className="nav-btns">
            {step > 1 && (
              <button className="nav-btn" onClick={back}>
                ← Back
              </button>
            )}
            {step < 7 && (
              <button className="nav-btn" onClick={next}>
                Next →
              </button>
            )}
            {step === 7 && (
              <button
                className="nav-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Date Idea 💡"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AIDateGenerator;
