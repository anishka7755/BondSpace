import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ORANGE = "#ff7300";

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

  // Load old Omnidim voice widget with normalized data submission
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

    // Temporary object to hold answers during conversation
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

        // Send answers to backend API
        try {
          setLoading(true);
          setError("");

          if (!token) {
            alert("Please log in to submit the survey.");
            setLoading(false);
            return;
          }

          const response = await fetch("http://localhost:5000/api/survey/submit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ answers: normalizedAnswers }),
          });

          const data = await response.json();

          if (!response.ok) throw new Error(data.message || "Failed to submit survey.");

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
      const response = await fetch("http://localhost:5000/api/survey/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to submit survey.");

      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Error submitting the survey.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    // Validate all fields filled
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
    if (error) setError(""); // clear error on change
  };

  if (submitted) {
    return (
      <div
        style={{
          padding: 30,
          fontFamily: "Arial, sans-serif",
          textAlign: "center",
          backgroundColor: "#fff6ef",
          minHeight: "100vh",
          color: ORANGE,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <h1>Thank you for submitting your survey!</h1>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            backgroundColor: ORANGE,
            color: "#fff",
            padding: "14px 40px",
            border: "none",
            borderRadius: 6,
            fontSize: 22,
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: 20,
            width: "fit-content",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Find Roommates
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#fff6ef",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        padding: "40px 20px",
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      <h1 style={{ color: ORANGE, textAlign: "center", marginBottom: 10 }}>
        Roommate Survey
      </h1>

      <p style={{ color: "#555", textAlign: "center", marginBottom: 24 }}>
        🎙 You can speak to the <b style={{ color: ORANGE }}>voice assistant</b> or fill this form manually.
      </p>

      <form onSubmit={handleManualSubmit} noValidate>
        {/* Cleanliness */}
        <label
          htmlFor="cleanliness"
          style={{ color: ORANGE, fontWeight: "bold", marginBottom: 6, display: "block" }}
        >
          Cleanliness (1-5)
        </label>
        <select
          name="cleanliness"
          id="cleanliness"
          value={formData.cleanliness}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 20,
            borderRadius: 6,
            border: `2px solid ${ORANGE}`,
            fontSize: 16,
            backgroundColor: "white",
          }}
        >
          <option value="">Select cleanliness level</option>
          {[1, 2, 3, 4, 5].map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>

        {/* Sleep Schedule */}
        <label
          htmlFor="sleepSchedule"
          style={{ color: ORANGE, fontWeight: "bold", marginBottom: 6, display: "block" }}
        >
          Sleep Schedule
        </label>
        <select
          name="sleepSchedule"
          id="sleepSchedule"
          value={formData.sleepSchedule}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 20,
            borderRadius: 6,
            border: `2px solid ${ORANGE}`,
            fontSize: 16,
            backgroundColor: "white",
          }}
        >
          <option value="" disabled>
            Select your sleep schedule
          </option>
          <option value="early">Early Riser</option>
          <option value="late">Night Owl</option>
          <option value="flexible">Flexible</option>
        </select>

        {/* Diet */}
        <label
          htmlFor="diet"
          style={{ color: ORANGE, fontWeight: "bold", marginBottom: 6, display: "block" }}
        >
          Diet
        </label>
        <select
          name="diet"
          id="diet"
          value={formData.diet}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 20,
            borderRadius: 6,
            border: `2px solid ${ORANGE}`,
            fontSize: 16,
            backgroundColor: "white",
          }}
        >
          <option value="" disabled>
            Select your diet preference
          </option>
          <option value="veg">Vegetarian</option>
          <option value="non-veg">Non-Vegetarian</option>
        </select>

        {/* Noise Tolerance */}
        <label
          htmlFor="noiseTolerance"
          style={{ color: ORANGE, fontWeight: "bold", marginBottom: 6, display: "block" }}
        >
          Noise Tolerance
        </label>
        <select
          name="noiseTolerance"
          id="noiseTolerance"
          value={formData.noiseTolerance}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 20,
            borderRadius: 6,
            border: `2px solid ${ORANGE}`,
            fontSize: 16,
            backgroundColor: "white",
          }}
        >
          <option value="" disabled>
            Select your noise tolerance
          </option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Goal */}
        <label
          htmlFor="goal"
          style={{ color: ORANGE, fontWeight: "bold", marginBottom: 6, display: "block" }}
        >
          Goal
        </label>
        <select
          name="goal"
          id="goal"
          value={formData.goal}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 20,
            borderRadius: 6,
            border: `2px solid ${ORANGE}`,
            fontSize: 16,
            backgroundColor: "white",
          }}
        >
          <option value="" disabled>
            Select your goal
          </option>
          <option value="entrance-exam">Entrance Exam</option>
          <option value="college">College</option>
          <option value="job">Job</option>
        </select>

        {error && (
          <div style={{ color: "red", marginBottom: 12, fontWeight: "bold", fontSize: 14 }} role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: ORANGE,
            color: "#fff",
            padding: "14px",
            fontSize: 18,
            fontWeight: "bold",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = "#e56500")}
          onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = ORANGE)}
        >
          {loading ? "Submitting..." : "Submit Survey"}
        </button>
      </form>
    </div>
  );
};

export default SurveyPage;
