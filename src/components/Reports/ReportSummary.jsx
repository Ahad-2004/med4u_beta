import React, { useState, useEffect } from 'react';
import { summarizePDF } from '../../services/summarizer';
import Card from '../UI/Card';
import Loader from '../UI/Loader';
import { FiDownload } from 'react-icons/fi';
import html2pdf from 'html2pdf.js';
import ProgressBar from '../UI/ProgressBar';

// Simple in-memory cache for summaries
const summaryCache = new Map();

const ReportSummary = ({ report }) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const generateSummary = async () => {
      if (!report || !report.downloadURL) {
        return;
      }

      try {
        // Check if we have a cached summary for this report
        if (report.id && summaryCache.has(report.id)) {
          const cachedSummary = summaryCache.get(report.id);
          setSummary(cachedSummary);
          return;
        }

        setLoading(true);
        setError(null);
        setProgress(10);

        // Simulate progress for user feedback
        let fakeProgress = 10;
        const progressInterval = setInterval(() => {
          fakeProgress += Math.floor(Math.random() * 10) + 5;
          if (fakeProgress < 80) setProgress(fakeProgress);
        }, 400);

        console.log("Starting summary generation for report:", report.id);
        const summaryText = await summarizePDF(report.downloadURL);
        setSummary(summaryText);
        setProgress(100);
        clearInterval(progressInterval);

        // Cache the summary if we have a report ID
        if (report.id) {
          summaryCache.set(report.id, summaryText);
        }
      } catch (err) {
        console.error('Error generating summary:', err);
        setError(err.message || 'Unable to generate summary. Please try again later.');
        setProgress(0);
      } finally {
        setLoading(false);
      }
    };

    generateSummary();
  }, [report]);

  const exportToPDF = () => {
    const element = document.getElementById('report-summary-content');
    const opt = {
      margin: 1,
      filename: `${report.name || 'medical-report'}-summary.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-8 w-full">
          <Loader size="large" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Analyzing your medical report...
          </p>
          <div className="w-full mt-6">
            <ProgressBar progress={progress} label="Analyzing..." />
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-500 dark:text-red-400">
          <h3 className="text-lg font-medium mb-2">Error</h3>
          <p>{error}</p>
          <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300 list-disc list-inside">
            <li>Check if the PDF is clear and contains readable text.</li>
            <li>Ensure your API key is set and valid.</li>
            <li>If you hit a rate limit, wait a few minutes and try again.</li>
            <li>See the browser console for technical details.</li>
          </ul>
        </div>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="p-6">
        <p className="text-gray-500 dark:text-gray-400">
          No summary available. Select a report to generate a summary.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Report Summary
        </h3>
        {summary && (
          <button
            onClick={exportToPDF}
            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiDownload className="mr-2" />
            Export PDF
          </button>
        )}
      </div>
      <div id="report-summary-content" className="prose dark:prose-invert max-w-none">
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{summary}</pre>
      </div>
    </Card>
  );
};

export default ReportSummary;