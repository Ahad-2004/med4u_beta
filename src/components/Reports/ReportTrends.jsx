import React, { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Card from '../UI/Card';
import Loader from '../UI/Loader';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ReportTrends = ({ reports = [], userId }) => {
  const [loading, setLoading] = useState(true);
  const [trendsData, setTrendsData] = useState({});
  const [selectedMetric, setSelectedMetric] = useState('');
  const [availableMetrics, setAvailableMetrics] = useState([]);
  const [allDates, setAllDates] = useState([]);
  const [visibleMetrics, setVisibleMetrics] = useState([]);

  useEffect(() => {
    if (!reports || reports.length === 0) {
      setLoading(false);
      return;
    }

    // Process reports to extract findings and organize by date
    const processReports = () => {
      try {
        setLoading(true);
        
        // Get all lab reports that have findings
        const labReports = reports.filter(report => 
          report.type === 'Lab Results' && 
          report.summary && 
          report.summary.findings && 
          report.summary.findings.length > 0
        );
        
        if (labReports.length === 0) {
          setLoading(false);
          return;
        }
        
        // Extract all metrics from findings
        const allMetrics = new Set();
        const metricsData = {};
        const allDates = new Set();
        
        labReports.forEach(report => {
          // Sort reports by date
          const reportDate = report.uploadedAt ? new Date(report.uploadedAt) : new Date();
          const dateStr = reportDate.toLocaleDateString();
          allDates.add(dateStr);
          
          report.summary.findings.forEach(finding => {
            const metricName = finding.name;
            allMetrics.add(metricName);
            
            if (!metricsData[metricName]) {
              metricsData[metricName] = [];
            }
            
            // Extract numeric value from finding
            let value = parseFloat(finding.value);
            if (isNaN(value)) {
              // Try to extract a number if it's a string with units
              const match = finding.value.match(/(\d+\.?\d*)/);
              value = match ? parseFloat(match[1]) : null;
            }
            
            if (value !== null) {
              metricsData[metricName].push({
                date: dateStr,
                value,
                unit: finding.unit || '',
                normalRange: finding.normal || ''
              });
            }
          });
        });
        
        // Sort each metric's data by date
        Object.keys(metricsData).forEach(metric => {
          metricsData[metric].sort((a, b) => new Date(a.date) - new Date(b.date));
        });
        
        setTrendsData(metricsData);
        setAvailableMetrics(Array.from(allMetrics));
        setAllDates(Array.from(allDates).sort((a, b) => new Date(a) - new Date(b)));
      } catch (error) {
        console.error('Error processing report trends:', error);
      } finally {
        setLoading(false);
      }
    };
    
    processReports();
  }, [reports]);

  // Set all metrics visible by default when availableMetrics changes
  useEffect(() => {
    setVisibleMetrics(availableMetrics);
  }, [availableMetrics.length]);

  // Generate a color for each metric
  const getColor = (idx) => {
    const palette = [
      '#4dc9f6', '#f67019', '#f53794', '#537bc4', '#acc236',
      '#166a8f', '#00a950', '#58595b', '#8549ba', '#e6194b',
      '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4',
      '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080'
    ];
    return palette[idx % palette.length];
  };

  // Memoize visible datasets for chart
  const getChartData = useMemo(() => {
    if (!availableMetrics.length || !allDates.length) return null;
    const datasets = availableMetrics
      .filter(metric => visibleMetrics.includes(metric))
      .map((metric, idx) => {
        const metricData = trendsData[metric] || [];
        const unit = metricData[0]?.unit || '';
        const valueByDate = {};
        metricData.forEach(item => { valueByDate[item.date] = item.value; });
        return {
          label: `${metric}${unit ? ` (${unit})` : ''}`,
          data: allDates.map(date => valueByDate[date] ?? null),
          fill: false,
          backgroundColor: getColor(idx),
          borderColor: getColor(idx),
          tension: 0.1,
          spanGaps: true,
        };
      });
    return {
      labels: allDates,
      datasets
    };
  }, [availableMetrics, allDates, trendsData, visibleMetrics]);

  // Table data for all metrics by date
  const tableData = useMemo(() => {
    if (!availableMetrics.length || !allDates.length) return [];
    return allDates.map(date => {
      const row = { date };
      availableMetrics.forEach(metric => {
        const metricData = trendsData[metric] || [];
        const found = metricData.find(item => item.date === date);
        row[metric] = found ? `${found.value} ${found.unit}` : '-';
      });
      return row;
    });
  }, [availableMetrics, allDates, trendsData]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Lab Metrics Trends Over Time`,
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const metric = availableMetrics[context.datasetIndex];
            const idx = context.dataIndex;
            const metricData = trendsData[metric] || [];
            const date = allDates[idx];
            const found = metricData.find(item => item.date === date);
            return found ? `Normal Range: ${found.normalRange || 'Not specified'}` : '';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
      }
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <Loader size="large" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Analyzing your lab trends...
          </p>
        </div>
      </Card>
    );
  }

  if (!availableMetrics.length || !allDates.length) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <p>No trend data available. Upload multiple lab reports to track changes over time.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Lab Result Trends
      </h3>
      {/* Toggleable legend */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        {availableMetrics.map((metric, idx) => (
          <label key={metric} className="flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={visibleMetrics.includes(metric)}
              onChange={() => setVisibleMetrics(v => v.includes(metric) ? v.filter(m => m !== metric) : [...v, metric])}
              className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span
              className="inline-block w-3 h-3 rounded-full ml-2 mr-2"
              style={{ backgroundColor: getColor(idx) }}
            ></span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{metric}</span>
          </label>
        ))}
      </div>
      <div className="mb-8">
        {getChartData && <Line data={getChartData} options={chartOptions} />}
      </div>
      {/* Table of values */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">Date</th>
              {availableMetrics.map((metric, idx) => (
                <th
                  key={metric}
                  className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: getColor(idx) }}
                >
                  {metric}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {tableData.map((row, i) => (
              <tr key={i}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 font-semibold">{row.date}</td>
                {availableMetrics.map((metric, idx) => (
                  <td key={metric} className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: getColor(idx) }}>
                    {row[metric]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ReportTrends; 