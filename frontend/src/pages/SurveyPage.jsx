import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ORANGE = "#ff7300";
const LIGHT_BG = "#fff6ef";
const CARD_BG = "#fff";
const BORDER = "#e4e4e4";
const LABEL_BG = "#fff";
const LABEL_FLOAT = {
  position: "absolute",
  left: 24,
  fontWeight: 700,
  color: ORANGE,
  zIndex: 2,
  fontSize: 15,
  letterSpacing: 0.1,
  borderRadius: 5,
  transition: "top 0.18s ease, font-size 0.16s ease, color 0.16s ease",
  pointerEvents: "none",
  background: LABEL_BG,
  padding: "0 8px",
};

const SurveyPage = () => {
  const [formData, setFormData] = useState({
    cleanliness: "",
    sleepSchedule: "",
    diet: "",
    noiseTolerance: "",
    goal: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("auth_token") || "";
  const navigate = useNavigate();

  useEffect(() => {
    const scriptId = "omnidimension-web-widget";
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.src = `https://backend.omnidim.io/web_widget.js?secret_key=${import.meta.env.VITE_OMNIDIM_SECRET_KEY}`;
      document.body.appendChild(script);
    }
    window.Omnidim = window.Omnidim || {};
    let collectedAnswers = {};
    window.Omnidim.onSurveyComplete = async (jsonData) => {
      if (jsonData.command && jsonData.command.toLowerCase() === "submit") {
        const normalizedAnswers = {
          cleanliness: Number(collectedAnswers.cleanliness) || "",
          sleepSchedule: collectedAnswers.sleepSchedule || "",
          diet: collectedAnswers.diet || "",
          noiseTolerance: collectedAnswers.noiseTolerance || "",
          goal: collectedAnswers.goal || "",
        };
        setFormData(normalizedAnswers);
        try {
          setLoading(true);
          setError("");
          if (!token) {
            alert("Please log in to submit the survey.");
            setLoading(false);
            return;
          }
          const response = await fetch(
            import.meta.env.VITE_API_URL || "http://localhost:5000/api",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ answers: normalizedAnswers }),
            }
          );
          const data = await response.json();
          if (!response.ok)
            throw new Error(data.message || "Failed to submit survey.");
          setSubmitted(true);
        } catch (err) {
          setError(err.message || "Error submitting the survey.");
        } finally {
          setLoading(false);
          collectedAnswers = {};
        }
      } else {
        collectedAnswers = {
          ...collectedAnswers,
          ...jsonData,
        };
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitSurvey = async (answers) => {
    if (!token) {
      alert("Please log in to submit the survey.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(import.meta.env.VITE_API_URL || "http://localhost:5000/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to submit survey.");
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Error submitting the survey.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const allFilled = Object.values(formData).every(
      (val) => val !== null && val !== undefined && val.toString().trim() !== ""
    );
    if (!allFilled) {
      setError("Please fill out all fields.");
      return;
    }
    const normalizedAnswers = {
      cleanliness: Number(formData.cleanliness),
      sleepSchedule: formData.sleepSchedule.trim(),
      diet: formData.diet.trim(),
      noiseTolerance: formData.noiseTolerance.trim(),
      goal: formData.goal.trim(),
    };
    setError("");
    submitSurvey(normalizedAnswers);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  if (submitted) {
    navigate("/dashboard");
  }

  // Form field component with label outside the select box
  function Field({ label, name, children, value }) {
    return (
      <div style={{ marginBottom: 36 }}>
        {/* Label placed above the select */}
        <label
          htmlFor={name}
          style={{
            display: "block",
            marginBottom: 8,
            fontWeight: 700,
            fontSize: 16,
            color: ORANGE,
            letterSpacing: 0.2,
            userSelect: "none",
          }}
        >
          {label}
        </label>
        {children}
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: LIGHT_BG,
        minHeight: "100vh",
        fontFamily: "Inter, Arial, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 10px",
      }}
    >
      <form
        onSubmit={handleManualSubmit}
        noValidate
        style={{
          width: "100%",
          maxWidth: 620,
          background: CARD_BG,
          borderRadius: 28,
          margin: "32px auto",
          boxShadow:
            "0 8px 36px 0 rgba(255,115,0,0.14), 0 2px 12px rgba(40,30,5,0.07)",
          padding: "50px 44px 34px 44px",
          position: "relative",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1
            style={{
              color: ORANGE,
              fontWeight: 900,
              fontSize: 36,
              margin: "0 0 10px 0",
              letterSpacing: -0.7,
            }}
          >
            Roommate Survey
          </h1>
          <div style={{ color: "#555", fontSize: 17, margin: "8px 0 0" }}>
            🎙 You can speak to the{" "}
            <span style={{ color: ORANGE, fontWeight: "bold" }}>
              voice assistant
            </span>{" "}
            or fill this form manually.
          </div>
        </div>

        {/* Cleanliness */}
        <Field
          label="Cleanliness (1-5)"
          name="cleanliness"
          value={formData.cleanliness}
        >
          <select
            name="cleanliness"
            id="cleanliness"
            value={formData.cleanliness}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: `1.4px solid ${BORDER}`,
              fontSize: 18,
              background: CARD_BG,
              color: "#363636",
              appearance: "none",
              outline: "none",
              boxShadow: "0 2px 12px rgba(255,115,0,0.05)",
              height: 54, // restored original comfortable height
              cursor: "pointer",
            }}
          >
            <option value="">Select cleanliness level</option>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </Field>

        {/* Sleep Schedule */}
        <Field
          label="Sleep Schedule"
          name="sleepSchedule"
          value={formData.sleepSchedule}
        >
          <select
            name="sleepSchedule"
            id="sleepSchedule"
            value={formData.sleepSchedule}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: `1.4px solid ${BORDER}`,
              fontSize: 18,
              background: CARD_BG,
              color: "#363636",
              appearance: "none",
              outline: "none",
              boxShadow: "0 2px 12px rgba(255,115,0,0.05)",
              height: 54,
              cursor: "pointer",
            }}
          >
            <option value="" disabled>
              Select your sleep schedule
            </option>
            <option value="early">Early Riser</option>
            <option value="late">Night Owl</option>
            <option value="flexible">Flexible</option>
          </select>
        </Field>

        {/* Diet */}
        <Field label="Diet" name="diet" value={formData.diet}>
          <select
            name="diet"
            id="diet"
            value={formData.diet}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: `1.4px solid ${BORDER}`,
              fontSize: 18,
              background: CARD_BG,
              color: "#363636",
              appearance: "none",
              outline: "none",
              boxShadow: "0 2px 12px rgba(255,115,0,0.05)",
              height: 54,
              cursor: "pointer",
            }}
          >
            <option value="" disabled>
              Select your diet preference
            </option>
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-Vegetarian</option>
          </select>
        </Field>

        {/* Noise Tolerance */}
        <Field
          label="Noise Tolerance"
          name="noiseTolerance"
          value={formData.noiseTolerance}
        >
          <select
            name="noiseTolerance"
            id="noiseTolerance"
            value={formData.noiseTolerance}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: `1.4px solid ${BORDER}`,
              fontSize: 18,
              background: CARD_BG,
              color: "#363636",
              appearance: "none",
              outline: "none",
              boxShadow: "0 2px 12px rgba(255,115,0,0.05)",
              height: 54,
              cursor: "pointer",
            }}
          >
            <option value="" disabled>
              Select your noise tolerance
            </option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>

        {/* Goal */}
        <Field label="Goal" name="goal" value={formData.goal}>
          <select
            name="goal"
            id="goal"
            value={formData.goal}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: `1.4px solid ${BORDER}`,
              fontSize: 18,
              background: CARD_BG,
              color: "#363636",
              appearance: "none",
              outline: "none",
              boxShadow: "0 2px 12px rgba(255,115,0,0.05)",
              height: 54,
              cursor: "pointer",
            }}
          >
            <option value="" disabled>
              Select your goal
            </option>
            <option value="entrance-exam">Entrance Exam</option>
            <option value="college">College</option>
            <option value="job">Job</option>
          </select>
        </Field>

        {error && (
          <div
            style={{
              color: "#c20c34",
              background: "rgba(255, 68, 68, 0.12)",
              marginBottom: 20,
              fontWeight: 700,
              fontSize: 16,
              lineHeight: 1.4,
              padding: "13px 14px",
              borderRadius: 10,
              textAlign: "center",
              border: "1.2px solid #ffb6a3",
              boxShadow: "0 1px 6px rgba(242,98,90,0.08)",
              transition: "background 0.18s",
              userSelect: "none",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: loading
              ? "linear-gradient(90deg, #ffac54, #ff7300 95%)"
              : "linear-gradient(90deg, #ff7300, #ffac54 95%)",
            color: "#fff",
            padding: "20px",
            fontSize: 20,
            fontWeight: 900,
            border: "none",
            borderRadius: 14,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition:
              "background 0.22s cubic-bezier(.31,.71,.3,1), opacity 0.19s",
            boxShadow: "0 4.5px 22px rgba(255, 115, 0, 0.17)",
            fontFamily: "inherit",
            letterSpacing: 0.6,
            marginTop: 2,
          }}
        >
          {loading ? "Submitting..." : "Submit Survey"}
        </button>
      </form>
    </div>
  );
};

export default SurveyPage;
