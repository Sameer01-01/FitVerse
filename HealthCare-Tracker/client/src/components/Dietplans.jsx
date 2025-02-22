import React, { useState, useEffect } from "react";
import mealData from "../Data/diet";

const Dietplans = () => {
  const [selectedType, setSelectedType] = useState("All");
  const [search, setSearch] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState([]);

  const mealTypes = ["All", "Breakfast", "Lunch", "Dinner", "Snack"];

  const filteredMeals = mealData.filter(
    (meal) =>
      (selectedType === "All" || meal.type === selectedType) &&
      meal.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetchAISuggestions();
  }, []);

  const fetchAISuggestions = async () => {
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCBbgV5eH6taAcX7hZFVhf-7XMMn8YEAzU",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Suggest 3 healthy meals focusing on balanced diets with high protein and low carbs."
                  }
                ]
              }
            ]
          })
        }
      );
      const data = await response.json();
      const aiText = data.candidates[0]?.content?.parts[0]?.text || "";
      const formattedSuggestions = aiText
        .split("Meal ")
        .slice(1)
        .map((meal) => {
          const lines = meal.split("\n").filter((line) => line.trim() !== "");
          const title = lines[0].replace(/\*\*/g, "").trim();
          const ingredients = lines.slice(1).map((line) => line.replace(/\*|\*/g, "").trim());
          return { title, ingredients };
        });
      setAiSuggestions(formattedSuggestions);
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Diet Plan Suggestions</h1>

      
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search meals..."
          className="flex-1 p-2 rounded-xl bg-gray-800 border border-gray-700 text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="p-2 rounded-xl bg-gray-800 border border-gray-700 text-white"
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {mealTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-center">AI-Generated Meal Suggestions</h2>
      {aiSuggestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {aiSuggestions.map((meal, index) => (
            <div key={index} className="bg-gray-800 text-white p-4 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold mb-2">{meal.title}</h3>
              <ul className="space-y-1">
                {meal.ingredients.map((ingredient, i) => (
                  <li key={i}>• {ingredient}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center italic text-gray-400">Fetching AI meal suggestions...</p>
      )}

      <h2 className="text-2xl font-semibold mb-4 text-center">PreDefined Meal Suggestions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMeals.map((meal, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded-2xl shadow-lg text-white">
            <h3 className="text-xl font-bold">{meal.name}</h3>
            <p className="italic text-gray-400">Type: {meal.type}</p>
            <p className="mt-2">{meal.description}</p>
            <div className="mt-4 space-y-1">
              <p>Calories: {meal.calories} kcal</p>
              <p>Protein: {meal.protein}</p>
              <p>Carbs: {meal.carbs}</p>
              <p>Fats: {meal.fats}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dietplans;