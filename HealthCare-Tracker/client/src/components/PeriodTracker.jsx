import React, { useState, useEffect } from 'react';
import { Calendar, Plus, TrendingUp, Heart, Zap, Brain, Droplets, Moon, Sun, Bell, Settings, Activity, Thermometer, Droplet, Coffee, BookOpen, HelpCircle, Download, Upload, Baby, Users, AlertTriangle, CheckCircle } from 'lucide-react';

const Womenhealth = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cycles, setCycles] = useState([]);
  const [dailyLogs, setDailyLogs] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('calendar');
  const [showLogModal, setShowLogModal] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [userSettings, setUserSettings] = useState({
    cycleLength: 28,
    periodLength: 5,
    notifyPeriod: true,
    notifyOvulation: true,
    notifyFertile: false,
    theme: 'dark',
    pregnancyMode: false,
    partnerSharing: false,
    irregularCycleAlert: true,
    medicationReminders: false
  });
  const [showCycleStartModal, setShowCycleStartModal] = useState(false);
  const [showCycleEndModal, setShowCycleEndModal] = useState(false);
  const [tempCycleStart, setTempCycleStart] = useState('');
  const [tempCycleEnd, setTempCycleEnd] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [irregularCycleDetected, setIrregularCycleDetected] = useState(false);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedCycles = localStorage.getItem('periodTrackerCycles');
    const savedLogs = localStorage.getItem('periodTrackerLogs');
    const savedSettings = localStorage.getItem('periodTrackerSettings');
    
    if (savedCycles) setCycles(JSON.parse(savedCycles));
    if (savedLogs) setDailyLogs(JSON.parse(savedLogs));
    if (savedSettings) setUserSettings(JSON.parse(savedSettings));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('periodTrackerCycles', JSON.stringify(cycles));
    calculatePredictions(cycles);
  }, [cycles]);

  useEffect(() => {
    localStorage.setItem('periodTrackerLogs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem('periodTrackerSettings', JSON.stringify(userSettings));
    checkForNotifications();
  }, [userSettings, predictions]);

  // Initialize with sample data if no data exists
  useEffect(() => {
    if (cycles.length === 0 && Object.keys(dailyLogs).length === 0) {
      const sampleCycles = [
        { startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], 
          endDate: new Date(new Date().setDate(new Date().getDate() - 25)).toISOString().split('T')[0], 
          length: 28 },
        { startDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0], 
          endDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0], 
          length: 28 },
      ];
      setCycles(sampleCycles);
      
      const sampleLogs = {
        [new Date().toISOString().split('T')[0]]: { 
          symptoms: ['cramps', 'headache'], 
          mood: 'irritable', 
          energy: 3, 
          flow: 'heavy',
          notes: 'Had a tough day with strong cramps',
          temperature: 36.8,
          weight: 62.5
        },
        [new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]]: { 
          symptoms: ['bloating'], 
          mood: 'sad', 
          energy: 2, 
          flow: 'medium',
          notes: 'Felt very bloated today',
          temperature: 36.6,
          weight: 62.7
        },
      };
      setDailyLogs(sampleLogs);
    }
  }, []);

  const detectIrregularCycles = (cycleData) => {
    if (cycleData.length < 3) return false;
    
    const cycleLengths = cycleData.map(cycle => cycle.length);
    const avgLength = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((sum, length) => sum + Math.pow(length - avgLength, 2), 0) / cycleLengths.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Consider irregular if standard deviation is more than 3 days
    return standardDeviation > 3;
  };

  const calculatePredictions = (cycleData) => {
    let avgCycleLength = userSettings.cycleLength;
    let avgPeriodLength = userSettings.periodLength;
    
    if (cycleData.length >= 2) {
      avgCycleLength = cycleData.reduce((sum, cycle) => sum + cycle.length, 0) / cycleData.length;
      avgPeriodLength = cycleData.reduce((sum, cycle) => {
        const start = new Date(cycle.startDate);
        const end = new Date(cycle.endDate);
        return sum + (end - start) / (1000 * 60 * 60 * 24) + 1;
      }, 0) / cycleData.length;
      
      // Check for irregular cycles
      const isIrregular = detectIrregularCycles(cycleData);
      setIrregularCycleDetected(isIrregular);
      
      if (isIrregular && userSettings.irregularCycleAlert) {
        setNotifications(prev => [...prev, {
          message: "Irregular cycle pattern detected. Consider consulting a healthcare provider.",
          date: new Date()
        }]);
      }
    }
    
    const lastCycle = cycleData[cycleData.length - 1] || { 
      startDate: new Date(new Date().setDate(new Date().getDate() - avgCycleLength)).toISOString().split('T')[0],
      endDate: new Date(new Date().setDate(new Date().getDate() - avgCycleLength + avgPeriodLength - 1)).toISOString().split('T')[0]
    };
    
    const lastPeriodStart = new Date(lastCycle.startDate);
    const lastPeriodEnd = new Date(lastCycle.endDate);
    
    // If current period is active
    const isPeriodActive = new Date() >= lastPeriodStart && new Date() <= lastPeriodEnd;
    
    const nextPeriodStart = isPeriodActive 
      ? lastPeriodStart 
      : new Date(lastPeriodStart);
    nextPeriodStart.setDate(nextPeriodStart.getDate() + Math.round(avgCycleLength));
    
    const ovulationDate = new Date(nextPeriodStart);
    ovulationDate.setDate(ovulationDate.getDate() - 14);
    
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 5);
    
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1);
    
    setPredictions({
      nextPeriod: nextPeriodStart,
      ovulation: ovulationDate,
      fertileStart,
      fertileEnd,
      cycleLength: Math.round(avgCycleLength),
      periodLength: Math.round(avgPeriodLength),
      isPeriodActive
    });
  };

  const checkForNotifications = () => {
    if (!predictions || !userSettings) return;
    
    const newNotifications = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Period notification
    if (userSettings.notifyPeriod) {
      const daysUntilPeriod = Math.ceil((predictions.nextPeriod - today) / (1000 * 60 * 60 * 24));
      if (daysUntilPeriod === 3) {
        newNotifications.push({
          id: 'period-reminder-3',
          type: 'period',
          message: 'Your period is expected in 3 days',
          date: new Date().toISOString()
        });
      } else if (daysUntilPeriod === 1) {
        newNotifications.push({
          id: 'period-reminder-1',
          type: 'period',
          message: 'Your period is expected tomorrow',
          date: new Date().toISOString()
        });
      }
    }
    
    // Ovulation notification
    if (userSettings.notifyOvulation) {
      const ovulationDate = new Date(predictions.ovulation);
      ovulationDate.setHours(0, 0, 0, 0);
      
      if (today.getTime() === ovulationDate.getTime()) {
        newNotifications.push({
          id: 'ovulation-today',
          type: 'ovulation',
          message: 'Today is your predicted ovulation day',
          date: new Date().toISOString()
        });
      }
    }
    
    // Fertile window notification
    if (userSettings.notifyFertile) {
      const fertileStart = new Date(predictions.fertileStart);
      fertileStart.setHours(0, 0, 0, 0);
      
      if (today.getTime() === fertileStart.getTime()) {
        newNotifications.push({
          id: 'fertile-start',
          type: 'fertile',
          message: 'Your fertile window starts today',
          date: new Date().toISOString()
        });
      }
    }
    
    setNotifications(prev => [...newNotifications, ...prev].slice(0, 10));
  };

  const getDayType = (date) => {
    if (!predictions) return 'normal';
    
    const dateStr = date.toISOString().split('T')[0];
    const nextPeriodStr = predictions.nextPeriod.toISOString().split('T')[0];
    const ovulationStr = predictions.ovulation.toISOString().split('T')[0];
    
    // Check if it's a period day
    for (let cycle of cycles) {
      const start = new Date(cycle.startDate);
      const end = new Date(cycle.endDate);
      if (date >= start && date <= end) return 'period';
    }
    
    // Check predictions
    if (dateStr === nextPeriodStr) return 'predicted-period';
    if (dateStr === ovulationStr) return 'ovulation';
    if (date >= predictions.fertileStart && date <= predictions.fertileEnd) return 'fertile';
    
    return 'normal';
  };

  const getDayColor = (dayType) => {
    switch (dayType) {
      case 'period': return 'bg-red-500';
      case 'predicted-period': return 'bg-red-400 border-2 border-red-300';
      case 'ovulation': return 'bg-pink-500';
      case 'fertile': return 'bg-purple-400';
      default: return 'bg-gray-700 hover:bg-gray-600';
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayType = getDayType(current);
      const isCurrentMonth = current.getMonth() === month;
      const isToday = current.toDateString() === new Date().toDateString();
      const hasLog = dailyLogs[current.toISOString().split('T')[0]];
      const dateKey = current.toISOString().split('T')[0];
      
      days.push(
        <button
          key={dateKey}
          onClick={() => setSelectedDate(new Date(current))}
          className={`
            w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200
            ${getDayColor(dayType)}
            ${!isCurrentMonth ? 'opacity-30' : ''}
            ${isToday ? 'ring-2 ring-blue-400' : ''}
            ${hasLog ? 'ring-1 ring-yellow-400' : ''}
          `}
          title={hasLog ? `Logged: ${dailyLogs[dateKey].symptoms?.join(', ') || 'No symptoms'}` : ''}
        >
          {current.getDate()}
        </button>
      );
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getPhaseInfo = () => {
    // Default fallback object
    const defaultPhaseInfo = { 
      phase: 'Unknown', 
      description: 'Track more cycles for predictions',
      color: 'text-gray-400',
      icon: <HelpCircle className="w-5 h-5" />
    };

    if (!predictions) return defaultPhaseInfo;
    
    try {
      const today = new Date();
      const dayType = getDayType(today);
      
      // Pregnancy mode override
      if (userSettings.pregnancyMode) {
        return {
          phase: 'Pregnancy Mode',
          description: 'Specialized tracking for pregnancy. Focus on prenatal care and health monitoring.',
          color: 'text-pink-400',
          icon: <Baby className="w-5 h-5" />
        };
      }
      
      switch (dayType) {
        case 'period':
          return { 
            phase: 'Menstrual Phase', 
            description: 'Focus on rest and gentle movement. Iron-rich foods recommended.',
            color: 'text-red-400',
            icon: <Droplets className="w-5 h-5" />
          };
        case 'fertile':
          return { 
            phase: 'Fertile Window', 
            description: 'Peak fertility time. Stay hydrated and consider prenatal vitamins.',
            color: 'text-purple-400',
            icon: <Activity className="w-5 h-5" />
          };
        case 'ovulation':
          return { 
            phase: 'Ovulation Day', 
            description: 'Highest fertility. Your body temperature may be slightly elevated.',
            color: 'text-pink-400',
            icon: <Zap className="w-5 h-5" />
          };
        default:
          const daysUntilPeriod = Math.ceil((predictions.nextPeriod - today) / (1000 * 60 * 60 * 24));
          if (daysUntilPeriod <= 7) {
            return { 
              phase: 'Luteal Phase', 
              description: 'PMS symptoms may appear. Magnesium and B6 can help with mood.',
              color: 'text-yellow-400',
              icon: <Thermometer className="w-5 h-5" />
            };
          }
          return { 
            phase: 'Follicular Phase', 
            description: 'Energy levels rising. Great time for new workouts and challenges.',
            color: 'text-green-400',
            icon: <Sun className="w-5 h-5" />
          };
      }
    } catch (error) {
      console.error('Error in getPhaseInfo:', error);
      return defaultPhaseInfo;
    }
  };

  const getSymptomInsights = () => {
    const symptoms = {};
    const moods = {};
    const energyLevels = [];
    
    Object.values(dailyLogs).forEach(log => {
      log.symptoms?.forEach(symptom => {
        symptoms[symptom] = (symptoms[symptom] || 0) + 1;
      });
      
      if (log.mood) {
        moods[log.mood] = (moods[log.mood] || 0) + 1;
      }
      
      if (log.energy) {
        energyLevels.push(log.energy);
      }
    });
    
    const insights = [];
    
    // Symptom insights
    if (symptoms.cramps >= 3) {
      insights.push({
        type: 'symptom',
        title: "Frequent Cramps",
        content: "You experience cramps frequently. Try heat therapy, magnesium supplements (400mg/day), and anti-inflammatory foods like ginger and turmeric.",
        severity: symptoms.cramps / Object.keys(dailyLogs).length * 100
      });
    }
    
    if (symptoms.headache >= 2) {
      insights.push({
        type: 'symptom',
        title: "Recurring Headaches",
        content: "Headaches appear to be a pattern. Stay hydrated, maintain stable blood sugar, and consider magnesium or riboflavin supplements.",
        severity: symptoms.headache / Object.keys(dailyLogs).length * 100
      });
    }
    
    if (symptoms.bloating >= 2) {
      insights.push({
        type: 'symptom',
        title: "Bloating Patterns",
        content: "Bloating is common for you. Reduce sodium, increase water intake, and try peppermint tea or probiotics.",
        severity: symptoms.bloating / Object.keys(dailyLogs).length * 100
      });
    }
    
    // Mood insights
    const mostCommonMood = Object.keys(moods).reduce((a, b) => moods[a] > moods[b] ? a : b, '');
    if (mostCommonMood && moods[mostCommonMood] >= 3) {
      insights.push({
        type: 'mood',
        title: `Most Common Mood: ${mostCommonMood}`,
        content: `You frequently feel ${mostCommonMood} during your cycle. Consider tracking what triggers this mood.`,
        severity: moods[mostCommonMood] / Object.keys(dailyLogs).length * 100
      });
    }
    
    // Energy insights
    if (energyLevels.length > 0) {
      const avgEnergy = energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length;
      if (avgEnergy < 2.5) {
        insights.push({
          type: 'energy',
          title: "Low Energy Levels",
          content: "Your average energy is low. Consider iron-rich foods, B vitamins, and ensuring adequate sleep.",
          severity: 100 - (avgEnergy / 5 * 100)
        });
      }
    }
    
    return insights.length ? insights : [{
      type: 'general',
      title: "Keep Tracking",
      content: "Continue logging symptoms and moods to see personalized insights and patterns.",
      severity: 0
    }];
  };

  const LogModal = () => {
    console.log('LogModal rendered, showLogModal:', showLogModal);
    
    const [formData, setFormData] = useState({
      symptoms: [],
      mood: '',
      energy: 3,
      flow: '',
      notes: '',
      temperature: '',
      weight: '',
      medication: '',
      sexualActivity: false,
      sleepHours: 7
    });

    // Reset form data when modal opens
    useEffect(() => {
      const dateKey = selectedDate.toISOString().split('T')[0];
      if (dailyLogs[dateKey]) {
        setFormData(dailyLogs[dateKey]);
      } else {
        setFormData({
          symptoms: [],
          mood: '',
          energy: 3,
          flow: '',
          notes: '',
          temperature: '',
          weight: '',
          medication: '',
          sexualActivity: false,
          sleepHours: 7
        });
      }
    }, [selectedDate, dailyLogs, showLogModal]);
    
    const symptomOptions = ['cramps', 'headache', 'bloating', 'nausea', 'backache', 'breast_tenderness', 'acne', 'fatigue', 'mood_swings', 'food_cravings'];
    const moodOptions = ['happy', 'sad', 'irritable', 'anxious', 'calm', 'energetic', 'focused', 'emotional'];
    const flowOptions = ['spotting', 'light', 'medium', 'heavy', 'very_heavy'];
    const medicationOptions = ['pain_reliever', 'birth_control', 'antidepressant', 'iron_supplement', 'none'];
    
    const handleSave = () => {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const updatedLogs = {
        ...dailyLogs,
        [dateKey]: formData
      };
      
      setDailyLogs(updatedLogs);
      setShowLogModal(false);
      
      // Check if this log indicates period start
      if (formData.flow && ['medium', 'heavy', 'very_heavy'].includes(formData.flow) && 
          !cycles.some(cycle => cycle.startDate === dateKey)) {
        setTempCycleStart(dateKey);
        setShowCycleStartModal(true);
      }
    };
    
    const handleChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4 text-white">
            Log for {selectedDate.toLocaleDateString()}
          </h3>
          
          <div className="space-y-4">
            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Symptoms</label>
              <div className="grid grid-cols-2 gap-2">
                {symptomOptions.map(symptom => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => handleChange('symptoms', 
                      formData.symptoms.includes(symptom) 
                        ? formData.symptoms.filter(s => s !== symptom)
                        : [...formData.symptoms, symptom]
                    )}
                    className={`p-2 rounded-lg text-sm ${
                      formData.symptoms.includes(symptom) 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {symptom.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Mood */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mood</label>
              <select 
                value={formData.mood} 
                onChange={(e) => handleChange('mood', e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Select mood</option>
                {moodOptions.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            
            {/* Energy */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Energy Level: {formData.energy}/5
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.energy}
                onChange={(e) => handleChange('energy', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            {/* Flow */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Flow</label>
              <select 
                value={formData.flow} 
                onChange={(e) => handleChange('flow', e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Select flow</option>
                {flowOptions.map(f => (
                  <option key={f} value={f}>{f.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            
            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Basal Body Temperature (°C)
              </label>
              <input
                type="number"
                step="0.1"
                min="35"
                max="40"
                value={formData.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="36.5"
              />
            </div>
            
            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="200"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="62.5"
              />
            </div>
            
            {/* Medication */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Medication</label>
              <select 
                value={formData.medication} 
                onChange={(e) => handleChange('medication', e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Select medication</option>
                {medicationOptions.map(m => (
                  <option key={m} value={m}>{m.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            
            {/* Sexual Activity */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sexualActivity"
                checked={formData.sexualActivity}
                onChange={(e) => handleChange('sexualActivity', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="sexualActivity" className="ml-2 text-sm text-gray-300">
                Sexual Activity Today
              </label>
            </div>
            
            {/* Sleep Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sleep Hours: {formData.sleepHours}h
              </label>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={formData.sleepHours}
                onChange={(e) => handleChange('sleepHours', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                rows="3"
                placeholder="Any additional notes about your day..."
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium"
            >
              Save
            </button>
            <button
              onClick={() => setShowLogModal(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ExportModal = () => {
    const exportData = () => {
      const data = {
        cycles,
        dailyLogs,
        userSettings,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `period-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowExportModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
          <h3 className="text-xl font-bold mb-4 text-white">Export Data</h3>
          <p className="text-gray-300 mb-6">
            Export all your cycle data, logs, and settings to a JSON file for backup or transfer.
          </p>
          <div className="flex gap-3">
            <button
              onClick={exportData}
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white font-medium"
            >
              Export
            </button>
            <button
              onClick={() => setShowExportModal(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg text-white font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ImportModal = () => {
    const [importData, setImportData] = useState(null);
    const [error, setError] = useState('');

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.cycles && data.dailyLogs && data.userSettings) {
            setImportData(data);
            setError('');
          } else {
            setError('Invalid data format');
          }
        } catch (err) {
          setError('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    };

    const handleImport = () => {
      if (!importData) return;
      
      setCycles(importData.cycles);
      setDailyLogs(importData.dailyLogs);
      setUserSettings(importData.userSettings);
      setShowImportModal(false);
      setImportData(null);
      setError('');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
          <h3 className="text-xl font-bold mb-4 text-white">Import Data</h3>
          <p className="text-gray-300 mb-4">
            Import cycle data from a previously exported JSON file.
          </p>
          
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="w-full mb-4 text-gray-300"
          />
          
          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}
          
          {importData && (
            <div className="mb-4 p-3 bg-green-600 bg-opacity-20 rounded-lg">
              <p className="text-green-400 text-sm">
                Data loaded successfully! {importData.cycles.length} cycles, {Object.keys(importData.dailyLogs).length} logs
              </p>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={!importData}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-2 rounded-lg text-white font-medium"
            >
              Import
            </button>
            <button
              onClick={() => {
                setShowImportModal(false);
                setImportData(null);
                setError('');
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg text-white font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CycleStartModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-96">
        <h3 className="text-xl font-bold mb-4 text-white">Period Started?</h3>
        <p className="text-gray-300 mb-6">
          You logged heavy flow today. Would you like to mark this as the start of your period?
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              const newCycle = {
                startDate: tempCycleStart,
                endDate: new Date(new Date(tempCycleStart).setDate(new Date(tempCycleStart).getDate() + userSettings.periodLength - 1)).toISOString().split('T')[0],
                length: cycles.length > 0 ? cycles[cycles.length - 1].length : userSettings.cycleLength
              };
              setCycles([...cycles, newCycle]);
              setShowCycleStartModal(false);
              setTempCycleStart('');
            }}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium"
          >
            Yes, Start New Cycle
          </button>
          <button
            onClick={() => setShowCycleStartModal(false)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium"
          >
            No, Not Yet
          </button>
        </div>
      </div>
    </div>
  );

  const CycleEndModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-96">
        <h3 className="text-xl font-bold mb-4 text-white">Period Ended?</h3>
        <p className="text-gray-300 mb-6">
          You logged light flow or no flow today. Would you like to mark the end of your period?
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              const updatedCycles = [...cycles];
              const lastCycle = updatedCycles[updatedCycles.length - 1];
              lastCycle.endDate = tempCycleEnd;
              
              // Calculate actual cycle length
              const startDate = new Date(lastCycle.startDate);
              const endDate = new Date(tempCycleEnd);
              const nextStartDate = new Date(startDate);
              nextStartDate.setDate(startDate.getDate() + Math.round(userSettings.cycleLength));
              
              lastCycle.length = Math.round((nextStartDate - startDate) / (1000 * 60 * 60 * 24));
              
              setCycles(updatedCycles);
              setShowCycleEndModal(false);
              setTempCycleEnd('');
            }}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium"
          >
            Yes, End Cycle
          </button>
          <button
            onClick={() => setShowCycleEndModal(false)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium"
          >
            No, Not Yet
          </button>
        </div>
      </div>
    </div>
  );

  const SettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 text-white">Settings</h3>
        
        <div className="space-y-6">
          {/* Cycle Settings */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-300">Cycle Settings</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Average Cycle Length: {userSettings.cycleLength} days
                </label>
                <input
                  type="range"
                  min="21"
                  max="45"
                  value={userSettings.cycleLength}
                  onChange={(e) => setUserSettings({...userSettings, cycleLength: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Average Period Length: {userSettings.periodLength} days
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={userSettings.periodLength}
                  onChange={(e) => setUserSettings({...userSettings, periodLength: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
          
          {/* Advanced Features */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-300">Advanced Features</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Pregnancy Mode</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userSettings.pregnancyMode}
                    onChange={() => setUserSettings({...userSettings, pregnancyMode: !userSettings.pregnancyMode})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Partner Sharing</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userSettings.partnerSharing}
                    onChange={() => setUserSettings({...userSettings, partnerSharing: !userSettings.partnerSharing})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Irregular Cycle Alerts</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userSettings.irregularCycleAlert}
                    onChange={() => setUserSettings({...userSettings, irregularCycleAlert: !userSettings.irregularCycleAlert})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Medication Reminders</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userSettings.medicationReminders}
                    onChange={() => setUserSettings({...userSettings, medicationReminders: !userSettings.medicationReminders})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Notification Settings */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-300">Notifications</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Period Reminders</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userSettings.notifyPeriod}
                    onChange={() => setUserSettings({...userSettings, notifyPeriod: !userSettings.notifyPeriod})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Ovulation Reminders</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userSettings.notifyOvulation}
                    onChange={() => setUserSettings({...userSettings, notifyOvulation: !userSettings.notifyOvulation})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Fertile Window Reminders</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userSettings.notifyFertile}
                    onChange={() => setUserSettings({...userSettings, notifyFertile: !userSettings.notifyFertile})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Data Management */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-300">Data Management</h4>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import Data
              </button>
            </div>
          </div>
          
          {/* Theme Settings */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-300">Appearance</h4>
            
            <div className="flex gap-3">
              <button
                onClick={() => setUserSettings({...userSettings, theme: 'dark'})}
                className={`p-3 rounded-lg flex-1 ${userSettings.theme === 'dark' ? 'bg-purple-600' : 'bg-gray-700'}`}
              >
                Dark Mode
              </button>
              <button
                onClick={() => setUserSettings({...userSettings, theme: 'light'})}
                className={`p-3 rounded-lg flex-1 ${userSettings.theme === 'light' ? 'bg-purple-600' : 'bg-gray-700'}`}
              >
                Light Mode
              </button>
            </div>
          </div>
          
          {/* Data Management */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-300">Data</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const data = {
                    cycles,
                    dailyLogs,
                    settings: userSettings
                  };
                  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `period-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Export Data
              </button>
              
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.json';
                  input.onchange = (e) => {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target.result);
                        if (data.cycles) setCycles(data.cycles);
                        if (data.dailyLogs) setDailyLogs(data.dailyLogs);
                        if (data.settings) setUserSettings(data.settings);
                      } catch (err) {
                        alert('Error importing data');
                      }
                    };
                    reader.readAsText(file);
                  };
                  input.click();
                }}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Import Data
              </button>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowSettings(false)}
          className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium"
        >
          Close Settings
        </button>
      </div>
    </div>
  );

  // Main component logic
  const phaseInfo = getPhaseInfo();

  return (
    <div className={`min-h-screen ${userSettings.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} text-white`}>
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Women's Health Tracker</h1>
              <p className="text-gray-400">Smart menstrual & fertility tracker</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-full hover:bg-gray-700"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            {notifications.length > 0 && (
              <div className="relative">
                <button 
                  onClick={() => setNotifications([])}
                  className="p-2 rounded-full hover:bg-gray-700"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                </button>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
            )}
            
            <button
              onClick={() => {
                console.log('Log Day button clicked');
                setShowLogModal(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Log Day
            </button>
          </div>
        </div>

        {/* Irregular Cycle Alert */}
        {irregularCycleDetected && userSettings.irregularCycleAlert && (
          <div className="mb-6 p-4 bg-yellow-600 bg-opacity-20 border border-yellow-500 rounded-2xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <div>
              <h4 className="font-semibold text-yellow-400">Irregular Cycle Detected</h4>
              <p className="text-sm text-yellow-300">Your cycle pattern shows irregularity. Consider consulting a healthcare provider.</p>
            </div>
          </div>
        )}

        {/* Current Phase Card */}
        <div className={`rounded-2xl p-6 mb-8 ${userSettings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-700'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${phaseInfo?.color?.replace('text', 'bg') || 'bg-gray-600'} bg-opacity-20`}>
                {phaseInfo?.icon}
              </div>
              <div>
                <h2 className={`text-xl font-bold ${phaseInfo?.color || 'text-gray-400'}`}>{phaseInfo?.phase || 'Unknown'}</h2>
                <p className="text-gray-300 mt-1">{phaseInfo?.description || 'Track more cycles for predictions'}</p>
              </div>
            </div>
            {predictions && (
              <div className="text-right">
                <div className="text-sm text-gray-400">Next period in</div>
                <div className="text-2xl font-bold text-purple-400">
                  {Math.ceil((predictions.nextPeriod - new Date()) / (1000 * 60 * 60 * 24))} days
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex rounded-2xl p-1 mb-6 ${userSettings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-700'}`}>
          {[
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'insights', label: 'Insights', icon: TrendingUp },
            { id: 'recommendations', label: 'Tips', icon: Heart },
            { id: 'journal', label: 'Journal', icon: BookOpen }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className={`rounded-2xl p-6 ${userSettings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-700'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                      className="p-2 hover:bg-gray-700 rounded-lg"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                      className="p-2 hover:bg-gray-700 rounded-lg"
                    >
                      →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-gray-400 text-sm font-medium py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {renderCalendar()}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Legend */}
              <div className={`rounded-2xl p-6 ${userSettings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-700'}`}>
                <h3 className="text-lg font-bold mb-4">Legend</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm text-gray-300">Period</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-400 border-2 border-red-300 rounded"></div>
                    <span className="text-sm text-gray-300">Predicted Period</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-pink-500 rounded"></div>
                    <span className="text-sm text-gray-300">Ovulation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-400 rounded"></div>
                    <span className="text-sm text-gray-300">Fertile Window</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-700 ring-1 ring-yellow-400 rounded"></div>
                    <span className="text-sm text-gray-300">Logged Day</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              {predictions && (
                <div className={`rounded-2xl p-6 ${userSettings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-700'}`}>
                  <h3 className="text-lg font-bold mb-4">Cycle Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Cycle Length</span>
                      <span className="font-medium">{predictions.cycleLength} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Period Length</span>
                      <span className="font-medium">{predictions.periodLength} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Next Ovulation</span>
                      <span className="font-medium">{predictions.ovulation.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Fertile Window</span>
                      <span className="font-medium text-sm">
                        {predictions.fertileStart.toLocaleDateString()} - {predictions.fertileEnd.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`rounded-2xl p-6 ${userSettings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-700'}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Symptom Patterns
              </h3>
              <div className="space-y-3">
                {getSymptomInsights().map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg ${userSettings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-600'}`}>
                    <h4 className="font-medium mb-1">{insight.title}</h4>
                    <p className="text-gray-300 text-sm">{insight.content}</p>
                    {insight.severity > 0 && (
                      <div className="mt-2 w-full bg-gray-600 rounded-full h-1.5">
                        <div 
                          className="bg-purple-600 h-1.5 rounded-full" 
                          style={{ width: `${insight.severity}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-2xl p-6 ${userSettings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-700'}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Cycle Trends
              </h3>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${userSettings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-600'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Average Cycle</span>
                    <span className="font-bold text-green-400">
                      {predictions ? predictions.cycleLength : '—'} days
                    </span>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${userSettings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-600'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Average Period</span>
                    <span className="font-bold text-red-400">
                      {predictions ? predictions.periodLength : '—'} days
                    </span>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${userSettings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-600'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Cycles Tracked</span>
                    <span className="font-bold text-blue-400">{cycles.length}</span>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${userSettings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-600'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Days Logged</span>
                    <span className="font-bold text-purple-400">{Object.keys(dailyLogs).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`rounded-2xl p-6 ${userSettings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-700'}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Nutrition Tips
              </h3>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${userSettings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-600'}`}>
                  <h4 className="font-medium text-purple-400 mb-2">Menstrual Phase</h4>
                  <p className="text-gray-300 text-sm">Focus on iron-rich foods like spinach, lentils, and lean meats to replenish lost iron. Include vitamin C to enhance iron absorption.</p>
                </div>
                <div className={`p-4 rounded-lg ${userSettings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-600'}`}>
                  <h4 className="font-medium text-green-400 mb-2">Follicular Phase</h4>
                  <p className="text-gray-300 text-sm">Eat fresh fruits and vegetables. Your body can handle more intense flavors during this time. Include lean proteins for muscle repair.</p>
                </div>
                <div className={`p-4 rounded-lg ${userSettings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-600'}`}>
                  <h4 className="font-medium text-pink-400 mb-2">Ovulation</h4>
                  <p className="text-gray-300 text-sm">Stay hydrated and consider foods rich in antioxidants like berries and dark leafy greens. Omega-3s can help with inflammation.</p>
                </div>
                <div className={`p-4 rounded-lg ${userSettings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-600'}`}>
                  <h4 className="font-medium text-yellow-400 mb-2">Luteal Phase</h4>
                  <p className="text-gray-300 text-sm">Increase magnesium and B6 intake to help with PMS symptoms. Try dark chocolate, avocados, bananas, and whole grains.</p>
                </div>
              </div>
            </div>

            <div className={`rounded-2xl p-6 ${userSettings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-700'}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                Exercise & Wellness
              </h3>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${userSettings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-600'}`}>
                  <h4 className="font-medium text-purple-400 mb-2">During Period</h4>
                  <p className="text-gray-300 text-sm">Light yoga, walking, or gentle stretching. Listen to your body and rest when needed. Pelvic floor exercises may help with cramps.</p>
                </div>
                <div className={`p-4 rounded-lg ${userSettings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-600'}`}>
                  <h4 className="font-medium text-green-400 mb-2">Follicular Phase</h4>
                  <p className="text-gray-300 text-sm">Perfect time for new workout routines! Try strength training or high-intensity workouts. Your endurance is highest now.</p>
                </div>
                <div className={`p-4 rounded-lg ${userSettings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-600'}`}>
                  <h4 className="font-medium text-pink-400 mb-2">Ovulation</h4>
                  <p className="text-gray-300 text-sm">Peak energy levels! Great for group fitness classes or challenging workouts. Your pain tolerance is highest now.</p>
                </div>
                <div className={`p-4 rounded-lg ${userSettings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-600'}`}>
                  <h4 className="font-medium text-yellow-400 mb-2">Pre-Menstrual</h4>
                  <p className="text-gray-300 text-sm">Focus on stress-reducing activities like meditation, gentle yoga, or nature walks. Reduce intense workouts if fatigued.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'journal' && (
          <div className={`rounded-2xl p-6 ${userSettings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-700'}`}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Daily Journal
            </h3>
            
            {Object.entries(dailyLogs)
              .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
              .map(([date, log]) => (
                <div key={date} className={`mb-6 rounded-lg ${userSettings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-600'} p-4`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{new Date(date).toLocaleDateString()}</h4>
                    <button 
                      onClick={() => {
                        setSelectedDate(new Date(date));
                        setShowLogModal(true);
                      }}
                      className="text-sm text-purple-400 hover:text-purple-300"
                    >
                      Edit
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Symptoms */}
                    {log.symptoms?.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-400 mb-1">Symptoms</h5>
                        <div className="flex flex-wrap gap-1">
                          {log.symptoms.map(symptom => (
                            <span key={symptom} className="text-xs bg-purple-600 bg-opacity-30 text-purple-200 px-2 py-1 rounded">
                              {symptom.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Mood & Energy */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-400 mb-1">Mood & Energy</h5>
                      <div className="space-y-1">
                        {log.mood && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs">Mood:</span>
                            <span className="text-sm capitalize">{log.mood}</span>
                          </div>
                        )}
                        {log.energy && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs">Energy:</span>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`w-3 h-3 rounded-full ${i < log.energy ? 'bg-yellow-400' : 'bg-gray-500 bg-opacity-30'}`}
                                ></div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Flow & Temp */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-400 mb-1">Details</h5>
                      <div className="space-y-1">
                        {log.flow && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs">Flow:</span>
                            <span className="text-sm capitalize">{log.flow.replace('_', ' ')}</span>
                          </div>
                        )}
                        {log.temperature && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs">BBT:</span>
                            <span className="text-sm">{log.temperature}°C</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Notes */}
                  {log.notes && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-400 mb-1">Notes</h5>
                      <p className="text-sm text-gray-300 whitespace-pre-line">{log.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            
            {Object.keys(dailyLogs).length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p>No journal entries yet. Start logging your days to see them here.</p>
                <button
                  onClick={() => setShowLogModal(true)}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add First Entry
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showLogModal && <LogModal />}
      {showCycleStartModal && <CycleStartModal />}
      {showCycleEndModal && <CycleEndModal />}
      {showSettings && <SettingsModal />}
      {showExportModal && <ExportModal />}
      {showImportModal && <ImportModal />}

      {/* Notifications Popup */}
      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`rounded-xl overflow-hidden shadow-xl ${userSettings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-700'}`}>
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
              <h4 className="font-bold">Notifications</h4>
              <button 
                onClick={() => setNotifications([])}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {notifications.map((note, index) => (
                <div key={index} className="p-3 border-b border-gray-700 last:border-b-0">
                  <p className="text-sm">{note.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(note.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Womenhealth;