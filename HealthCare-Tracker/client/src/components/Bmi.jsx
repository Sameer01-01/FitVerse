import React, { useState, useEffect } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const Bmi = () => {
  const [weight, setWeight] = useState(0);
  const [height, setHeight] = useState(0);
  const [age, setAge] = useState(0);
  const [gender, setGender] = useState("male");
  const [bmi, setBmi] = useState(null);
  const [message, setMessage] = useState("");
  const [idealWeight, setIdealWeight] = useState("");
  const [bmiHistory, setBmiHistory] = useState([]);
  const [tip, setTip] = useState("");

  const tips = [
    "Drink more water.",
    "Incorporate strength training.",
    "Get at least 7 hours of sleep.",
    "Increase daily step count."
  ];

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem("bmiHistory")) || [];
    setBmiHistory(storedHistory);
    setTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  const calculateBMI = () => {
    if (weight > 0 && height > 0) {
      const heightInMeters = height / 100;
      const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      setBmi(bmiValue);
      generateMessage(bmiValue);
      calculateIdealWeight(height);
      saveBmiHistory(bmiValue);
      speakResult(bmiValue);
    } else {
      setMessage("Please enter valid height and weight.");
    }
  };

  const calculateIdealWeight = (height) => {
    const minWeight = (18.5 * ((height / 100) ** 2)).toFixed(1);
    const maxWeight = (24.9 * ((height / 100) ** 2)).toFixed(1);
    setIdealWeight(`${minWeight} kg - ${maxWeight} kg`);
  };

  const generateMessage = (bmi) => {
    if (bmi < 18.5) {
      setMessage("Underweight - Consider a balanced diet.");
    } else if (bmi >= 18.5 && bmi < 24.9) {
      setMessage("Normal weight - Keep up the good work!");
    } else if (bmi >= 25 && bmi < 29.9) {
      setMessage("Overweight - Try incorporating exercise.");
    } else {
      setMessage("Obese - Consult a healthcare provider.");
    }
  };

  const saveBmiHistory = (newBmi) => {
    const newEntry = { date: new Date().toLocaleDateString(), bmi: newBmi };
    const updatedHistory = [...bmiHistory, newEntry];
    setBmiHistory(updatedHistory);
    localStorage.setItem("bmiHistory", JSON.stringify(updatedHistory));
  };

  const speakResult = (bmi) => {
    const speech = new SpeechSynthesisUtterance(`Your BMI is ${bmi}. ${message}`);
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="bg-black min-h-screen p-6 flex items-center justify-center">
      <div className="bg-gray-900  text-white max-w-md w-full p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center">BMI Calculator</h2>

        <div className="space-y-4 mt-4">
          <input type="number" placeholder="Enter weight (kg)" className="w-full p-2 border border-gray-700 rounded-xl bg-gray-800 text-white" onChange={(e) => setWeight(e.target.value)} />
          <input type="number" placeholder="Enter height (cm)" className="w-full p-2 border border-gray-700 rounded-xl bg-gray-800 text-white" onChange={(e) => setHeight(e.target.value)} />
          <input type="number" placeholder="Enter age" className="w-full p-2 border border-gray-700 rounded-xl bg-gray-800 text-white" onChange={(e) => setAge(e.target.value)} />
          <select onChange={(e) => setGender(e.target.value)} className="w-full p-2 border border-gray-700 rounded-xl bg-gray-800 text-white">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <button onClick={calculateBMI} className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600">Calculate BMI</button>
        </div>

        {bmi && (
          <div className="mt-6 text-center">
            <p className="text-xl font-semibold">Your BMI: {bmi}</p>
            <p className="mt-2">{message}</p>
            <p className="mt-2">Ideal Weight Range: {idealWeight}</p>
            <p className="mt-2 italic text-green-400">Tip: {tip}</p>
          </div>
        )}

        {bmiHistory.length > 0 && (
          <div className="pt-6">
            <h3 className="text-lg font-bold">BMI History</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={bmiHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#fff" />
                <YAxis domain={[0, 40]} stroke="#fff" />
                <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555' }} />
                <Line type="monotone" dataKey="bmi" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bmi;