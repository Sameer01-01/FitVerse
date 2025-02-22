import React, { useState, useEffect } from "react";
import exercisesData from "../Data/exercise";

const Exercise = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [plannedWorkouts, setPlannedWorkouts] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState("");
  const [aiWorkoutPlan, setAiWorkoutPlan] = useState("");

  const categories = ["All", "Strength", "Cardio", "Flexibility", "HIIT", "Yoga"];
  const challenges = [
    "Complete 50 squats today!",
    "Run for 20 minutes without stopping!",
    "Try a 10-minute yoga stretch session.",
    "Do 3 sets of push-ups to failure."
  ];

  useEffect(() => {
    setDailyChallenge(challenges[Math.floor(Math.random() * challenges.length)]);
    fetchAIWorkoutPlan();
  }, []);

  const fetchAIWorkoutPlan = async () => {
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=AIzaSyCBbgV5eH6taAcX7hZFVhf-7XMMn8YEAzU", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "Generate a detailed 3-day workout plan including strength, cardio, and flexibility exercises with clear formatting and practical tips. Present it in a structured list format." }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.candidates[0].content.parts[0].text || "Failed to fetch workout plan.";
      setAiWorkoutPlan(aiText.replace(/\n/g, "<br />"));
    } catch (error) {
      console.error("Error fetching AI workout plan:", error);
    }
  };

  const handlePlanWorkout = (exercise) => {
    setPlannedWorkouts([...plannedWorkouts, exercise]);
  };

  const filteredExercises = exercisesData.filter((exercise) => {
    return (
      (selectedCategory === "All" || exercise.category === selectedCategory) &&
      exercise.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <>
      <div className="bg-black">
        <div className="bg-black text-white min-h-screen max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-4">Exercise Page</h1>

          
          <div className="bg-gray-800 p-4 rounded-xl mb-6 shadow-lg">
            <h2 className="text-xl font-semibold">🏆 Daily Challenge</h2>
            <p>{dailyChallenge}</p>
          </div>

          
          <div className="bg-gray-800 p-4 rounded-xl mb-6 shadow-lg">
            <h2 className="text-xl font-semibold">🤖 AI-Generated Workout Plan</h2>
            {aiWorkoutPlan ? (
              <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: aiWorkoutPlan }} />
            ) : (
              <p className="italic text-gray-400">Fetching workout plan...</p>
            )}
          </div>

          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-2 border border-gray-700 bg-gray-800 text-white rounded-xl"
            />
            <select
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border border-gray-700 bg-gray-800 text-white rounded-xl"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExercises.map((exercise) => (
              <div key={exercise.name} className="border border-gray-700 bg-gray-800 p-4 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold">{exercise.name}</h3>
                <p className="italic text-gray-400">Category: {exercise.category}</p>
                <iframe
                  src={exercise.video}
                  title={exercise.name}
                  className="w-full h-48 rounded-xl mt-2"
                  allowFullScreen
                ></iframe>
                <button
                  onClick={() => handlePlanWorkout(exercise)}
                  className="mt-2 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
                >
                  Add to Workout Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Exercise;
