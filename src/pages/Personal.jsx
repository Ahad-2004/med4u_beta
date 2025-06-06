import React, { useState } from 'react';
import Card from '../components/UI/Card';

const Personal = () => {
  // BMI Calculator State
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');

  // Period Tracker State (simple placeholder)
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [nextPeriod, setNextPeriod] = useState('');

  // Calculate BMI
  const handleBmiCalc = (e) => {
    e.preventDefault();
    if (!height || !weight) return;
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    const bmiValue = w / (h * h);
    setBmi(bmiValue.toFixed(1));
    if (bmiValue < 18.5) setBmiCategory('Underweight');
    else if (bmiValue < 25) setBmiCategory('Normal weight');
    else if (bmiValue < 30) setBmiCategory('Overweight');
    else setBmiCategory('Obese');
  };

  // Calculate next period (simple estimate)
  const handlePeriodCalc = (e) => {
    e.preventDefault();
    if (!lastPeriod || !cycleLength) return;
    const last = new Date(lastPeriod);
    const next = new Date(last);
    next.setDate(last.getDate() + parseInt(cycleLength));
    setNextPeriod(next.toISOString().split('T')[0]);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Personal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* BMI Calculator */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">BMI Calculator</h2>
          <form onSubmit={handleBmiCalc} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Height (cm)</label>
              <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight (kg)</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
            </div>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Calculate BMI</button>
          </form>
          {bmi && (
            <div className="mt-4">
              <p className="text-lg">Your BMI: <span className="font-bold">{bmi}</span></p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Category: {bmiCategory}</p>
            </div>
          )}
        </Card>
        {/* Period Tracker */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Period Tracker</h2>
          <form onSubmit={handlePeriodCalc} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Last Period Start Date</label>
              <input type="date" value={lastPeriod} onChange={e => setLastPeriod(e.target.value)} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cycle Length (days)</label>
              <input type="number" value={cycleLength} onChange={e => setCycleLength(e.target.value)} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required min="20" max="40" />
            </div>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Estimate Next Period</button>
          </form>
          {nextPeriod && (
            <div className="mt-4">
              <p className="text-lg">Estimated Next Period: <span className="font-bold">{nextPeriod}</span></p>
            </div>
          )}
        </Card>
      </div>
      {/* Placeholder for future features */}
      <div className="mt-8">
        <Card>
          <h2 className="text-lg font-semibold mb-2">More Personal Health Tools Coming Soon...</h2>
          <p className="text-gray-600 dark:text-gray-300">Track your sleep, hydration, exercise, and more in future updates.</p>
        </Card>
      </div>
    </div>
  );
};

export default Personal; 