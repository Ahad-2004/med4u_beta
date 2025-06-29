// This service connects to an external AI API to generate summaries of medical reports
// We'll use the HuggingFace Inference API which has a generous free tier

import { extractTextFromPDF } from './ocrService';

// Function to summarize text using a local extractive summarizer
export const summarizeText = async (text, maxLength = 250) => {
  try {
    if (!text || !text.trim()) {
      throw new Error("No text provided for summarization");
    }
    // Use the fallback summary logic (extractive)
    return createSimpleSummary(text, maxLength);
  } catch (error) {
    console.error("[Med4U] Error summarizing text:", error);
    return `Summarization error: ${error.message}`;
  }
};

// Improved fallback function to create a simple extractive summary
const createSimpleSummary = (text, maxLength = 250) => {
  try {
    // Split text into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    // Score sentences by word frequency
    const wordFreq = {};
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    words.forEach(w => { if (w.length > 2) wordFreq[w] = (wordFreq[w] || 0) + 1; });
    const scored = sentences.map(s => ({
      sentence: s,
      score: s.toLowerCase().split(/\s+/).reduce((a, w) => a + (wordFreq[w] || 0), 0)
    }));
    // Sort by score, take top N sentences
    const top = scored.sort((a, b) => b.score - a.score).slice(0, 3).map(s => s.sentence);
    if (top.length > 0) {
      return top.join(' ');
    } else {
      return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
    }
  } catch (error) {
    console.error("Error creating simple summary:", error);
    return "Unable to generate summary at this time.";
  }
};

// Function to detect test categories
const detectTestCategory = (testName) => {
  const lowerName = testName.toLowerCase();
  
  // Blood Counts
  if (lowerName.includes('hemoglobin') || lowerName.includes('hgb') || 
      lowerName.includes('wbc') || lowerName.includes('rbc') || 
      lowerName.includes('platelet') || lowerName.includes('hct') || 
      lowerName.includes('hematocrit') || lowerName.includes('mcv') || 
      lowerName.includes('mch') || lowerName.includes('mchc')) {
    return 'Blood Counts';
  }
  
  // Lipid Profile
  if (lowerName.includes('cholesterol') || lowerName.includes('hdl') || 
      lowerName.includes('ldl') || lowerName.includes('triglyceride') || 
      lowerName.includes('vldl') || lowerName.includes('non-hdl')) {
    return 'Lipid Profile';
  }
  
  // Blood Sugar & HbA1c
  if (lowerName.includes('glucose') || lowerName.includes('a1c') || 
      lowerName.includes('hba1c') || lowerName.includes('blood sugar') || 
      lowerName.includes('fasting glucose')) {
    return 'Blood Sugar';
  }
  
  // Thyroid Profile
  if (lowerName.includes('thyroid') || lowerName.includes('tsh') || 
      lowerName.includes('t3') || lowerName.includes('t4') || 
      lowerName.includes('free t3') || lowerName.includes('free t4')) {
    return 'Thyroid Profile';
  }
  
  // Liver Function
  if (lowerName.includes('liver') || lowerName.includes('alt') || 
      lowerName.includes('ast') || lowerName.includes('bilirubin') || 
      lowerName.includes('alp') || lowerName.includes('ggt') || 
      lowerName.includes('protein') || lowerName.includes('albumin')) {
    return 'Liver Function';
  }
  
  // Kidney Function
  if (lowerName.includes('kidney') || lowerName.includes('creatinine') || 
      lowerName.includes('egfr') || lowerName.includes('bun') || 
      lowerName.includes('urea') || lowerName.includes('gfr')) {
    return 'Kidney Function';
  }
  
  // Vitamins & Minerals
  if (lowerName.includes('vitamin') || lowerName.includes('calcium') || 
      lowerName.includes('magnesium') || lowerName.includes('zinc') || 
      lowerName.includes('iron') || lowerName.includes('ferritin') || 
      lowerName.includes('b12') || lowerName.includes('folate') || 
      lowerName.includes('d3') || lowerName.includes('d25')) {
    return 'Vitamins & Minerals';
  }
  
  // Hormonal Assays
  if (lowerName.includes('hormone') || lowerName.includes('estrogen') || 
      lowerName.includes('progesterone') || lowerName.includes('testosterone') || 
      lowerName.includes('cortisol') || lowerName.includes('insulin') || 
      lowerName.includes('fsh') || lowerName.includes('lh')) {
    return 'Hormonal Assays';
  }
  
  // Infectious Disease Markers
  if (lowerName.includes('hiv') || lowerName.includes('hbsag') || 
      lowerName.includes('hcv') || lowerName.includes('vdrl') || 
      lowerName.includes('syphilis') || lowerName.includes('hepatitis')) {
    return 'Infectious Disease Markers';
  }
  
  // Urinalysis
  if (lowerName.includes('urine') || lowerName.includes('protein') || 
      lowerName.includes('glucose') || lowerName.includes('ketones') || 
      lowerName.includes('ph') || lowerName.includes('specific gravity')) {
    return 'Urinalysis';
  }
  
  // Special Panels
  if (lowerName.includes('allergy') || lowerName.includes('cancer') || 
      lowerName.includes('marker') || lowerName.includes('tumor') || 
      lowerName.includes('cea') || lowerName.includes('psa')) {
    return 'Special Panels';
  }
  
  return 'Other Tests';
};

// Function to interpret test results
const interpretTestResult = (testName, value, unit, normalRange) => {
  const [min, max] = normalRange.split('-').map(v => parseFloat(v.trim()));
  const numValue = parseFloat(value);
  
  let status = 'Normal';
  let interpretation = '';
  
  if (numValue < min) {
    status = 'Low';
    switch(testName.toLowerCase()) {
      case 'hemoglobin':
        interpretation = '– may indicate anemia';
        break;
      case 'vitamin d':
        interpretation = '– may require supplementation';
        break;
      case 'b12':
        interpretation = '– may require supplementation';
        break;
      case 'ferritin':
        interpretation = '– suggests iron deficiency';
        break;
      case 'calcium':
        interpretation = '– may indicate hypocalcemia';
        break;
      case 'magnesium':
        interpretation = '– may require supplementation';
        break;
      case 'albumin':
        interpretation = '– may indicate malnutrition';
        break;
      default:
        interpretation = '– below normal range';
    }
  } else if (numValue > max) {
    status = 'High';
    switch(testName.toLowerCase()) {
      case 'glucose':
        interpretation = '– may indicate diabetes or prediabetes';
        break;
      case 'hba1c':
        interpretation = '– indicates poor long-term glucose control';
        break;
      case 'cholesterol':
        interpretation = '– may indicate cardiovascular risk';
        break;
      case 'triglycerides':
        interpretation = '– may indicate metabolic syndrome';
        break;
      case 'wbc':
        interpretation = '– may suggest infection';
        break;
      case 'alt':
      case 'ast':
        interpretation = '– may indicate liver stress';
        break;
      case 'creatinine':
        interpretation = '– may indicate kidney dysfunction';
        break;
      case 'tsh':
        interpretation = '– may indicate hypothyroidism';
        break;
      case 'calcium':
        interpretation = '– may indicate hypercalcemia';
        break;
      default:
        interpretation = '– above normal range';
    }
  }
  
  return { status, interpretation };
};

// --- Robust Section-Aware Lab Report Parser and Summarizer ---

// Helper: Detect if a line is a section header
const isSectionHeader = (line) => {
  const lower = line.toLowerCase();
  return (
    lower.includes('complete blood count') ||
    lower.includes('immunoassay') ||
    lower.includes('thyroid') ||
    lower.includes('lipid') ||
    lower.includes('renal') ||
    lower.includes('liver') ||
    lower.includes('urine') ||
    lower.includes('serum') ||
    lower.includes('profile')
  );
};

// Helper: Detect if a line is a table header
const isTableHeader = (line) => {
  const lower = line.toLowerCase();
  return (
    lower.includes('test') && lower.includes('result') && lower.includes('unit') && lower.includes('ref')
  );
};

// Helper: Detect if a line is a doctor/authentication/footer
const isFooter = (line) => {
  return (
    line.includes('Dr.') ||
    line.includes('Electronically Authenticated Report') ||
    line.includes('Page') ||
    line.includes('Sterling Accuris')
  );
};

// Enhanced: Parse a table row with flexible reference intervals and tab/multi-space separation
const parseTableRow = (line) => {
  // Split by tab or 2+ spaces
  const cols = line.split(/\t| {2,}/).map(s => s.trim()).filter(Boolean);
  if (cols.length >= 4) {
    // e.g. Hemoglobin  14.5  g/dL  13.0 - 16.5
    return {
      name: cols[0],
      value: cols[1],
      unit: cols[2],
      normal: cols.slice(3).join(' '),
    };
  }
  // Try to match flexible reference intervals
  const match = line.match(/^([A-Za-z0-9\-\(\)\/\s]+?)\s+([H|L]?\d+[.,]?\d*)\s*([a-zA-Z%\/]+)\s+(.+)$/);
  if (match) {
    return {
      name: match[1].replace(/\s+/g, ' ').trim(),
      value: match[2].replace(/[HL]/g, '').trim(),
      flag: match[2].includes('H') ? 'High' : match[2].includes('L') ? 'Low' : '',
      unit: match[3].trim(),
      normal: match[4].trim(),
    };
  }
  return null;
};

// --- DEBUG LOGGING ---

// Wrap extractTextFromPDF to log the full extracted text
const extractTextFromPDFWithDebug = async (pdfUrl) => {
  const text = await extractTextFromPDF(pdfUrl);
  console.log('--- OCR/PDF Extracted Text Start ---');
  console.log(text);
  console.log('--- OCR/PDF Extracted Text End ---');
  return text;
};

// --- Improved parser: split long lines using known test names ---

const KNOWN_TEST_NAMES = [
  'Hemoglobin', 'RBC Count', 'Hematocrit', 'MCV', 'MCH', 'MCHC', 'RDW CV',
  'WBC Count', 'Neutrophils', 'Lymphocytes', 'Eosinophils', 'Monocytes', 'Basophils',
  'Platelet Count', 'MPV', 'ESR', 'Cholesterol', 'Triglyceride', 'HDL Cholesterol',
  'Direct LDL', 'VLDL', 'CHOL/HDL Ratio', 'LDL/HDL Ratio', 'Fasting Blood Sugar',
  'HbA1c', 'Mean Blood Glucose', 'T3 - Triiodothyronine', 'T4 - Thyroxine', 'TSH - Thyroid Stimulating Hormone',
  'Microalbumin', 'Total Protein', 'Albumin', 'Globulin', 'A/G Ratio', 'Bilirubin',
  'Conjugated Bilirubin', 'Unconjugated Bilirubin', 'Delta Bilirubin', 'Iron', 'Total Iron Binding Capacity',
  'Transferrin Saturation', 'Homocysteine', 'Creatinine', 'Urea', 'Blood Urea Nitrogen', 'Uric Acid',
  'Calcium', 'SGPT', 'SGOT', 'Sodium', 'Potassium', 'Chloride', '25(OH) Vitamin D', 'Vitamin B12',
  'PSA-Prostate Specific Antigen', 'IgE', 'HIV I & II Ab/Ag', 'HBsAg', 'Hb A', 'Hb A2', 'Foetal Hb',
  'P2 Peak', 'P3 Peak', 'Physical & Chemical (Dip strip) examination', 'Urine Glucose', 'Urine Protein',
  'Bilirubin', 'Urobilinogen', 'Urine Ketone', 'Nitrite', 'Pus Cells', 'Red Cells', 'Epithelial Cells',
  'Casts', 'Crystals', 'Amorphous Material'
];

const splitByKnownTestNames = (line) => {
  // Build a regex that matches any known test name at the start of a word
  const regex = new RegExp('(?=(' + KNOWN_TEST_NAMES.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + '))', 'g');
  return line.split(regex).map(chunk => chunk.trim()).filter(Boolean);
};

const parseLabResults = (text) => {
  const results = [];
  const lines = text.split('\n');
  let currentSection = '';
  let i = 0;
  while (i < lines.length) {
    let line = lines[i].trim();
    if (!line) { i++; continue; }
    if (isFooter(line)) { i++; continue; }
    if (isSectionHeader(line)) {
      currentSection = line.replace(/:|\s+Test Result.*/i, '').trim();
      i++;
      continue;
    }
    // Detect block column format for each table
    if (line.toLowerCase() === 'test' &&
        lines[i+1]?.trim().toLowerCase() === 'result' &&
        lines[i+2]?.trim().toLowerCase() === 'unit') {
      // Find where each block starts
      let testStart = i + 3;
      let resultStart = -1, unitStart = -1, refStart = -1;
      // Find next header positions
      for (let j = testStart; j < lines.length; j++) {
        if (lines[j].trim().toLowerCase() === 'result' && resultStart === -1) {
          resultStart = j + 1;
        } else if (lines[j].trim().toLowerCase() === 'unit' && unitStart === -1) {
          unitStart = j + 1;
        } else if (lines[j].trim().toLowerCase().startsWith('reference')) {
          refStart = j + 1;
          break;
        }
      }
      // If all blocks found
      if (resultStart > 0 && unitStart > 0 && refStart > 0) {
        // Collect test names
        const testNames = lines.slice(testStart, resultStart - 1).map(l => l.trim()).filter(Boolean);
        const resultsArr = lines.slice(resultStart, unitStart - 1).map(l => l.trim()).filter(Boolean);
        const unitsArr = lines.slice(unitStart, refStart - 1).map(l => l.trim()).filter(Boolean);
        // Reference range may go until next blank, section, or next block
        let refEnd = refStart;
        while (refEnd < lines.length && lines[refEnd].trim() && !isSectionHeader(lines[refEnd]) && !isFooter(lines[refEnd]) && !['test','result','unit'].includes(lines[refEnd].trim().toLowerCase())) {
          refEnd++;
        }
        const refsArr = lines.slice(refStart, refEnd).map(l => l.trim()).filter(Boolean);
        // Zip arrays
        const numRows = Math.min(testNames.length, resultsArr.length, unitsArr.length, refsArr.length);
        for (let r = 0; r < numRows; r++) {
          results.push({
            name: testNames[r],
            value: resultsArr[r],
            unit: unitsArr[r],
            normal: refsArr[r],
            category: currentSection || detectTestCategory(testNames[r])
          });
        }
        i = refEnd;
        continue;
      }
    }
    // --- NEW: Fallback line-by-line parser for inline test results ---
    // Match lines like: TestName Value Unit ReferenceRange
    const fallbackMatch = line.match(/^([A-Za-z0-9\-\/\(\)\s]+?)\s+([0-9.,]+)\s*([a-zA-Z%\/]+)?\s+([<>]?[0-9.,\-\s]+[a-zA-Z%\/]*)$/);
    if (fallbackMatch) {
      results.push({
        name: fallbackMatch[1].trim(),
        value: fallbackMatch[2].trim(),
        unit: fallbackMatch[3] ? fallbackMatch[3].trim() : '',
        normal: fallbackMatch[4].trim(),
        category: currentSection || detectTestCategory(fallbackMatch[1])
      });
    }
    i++;
  }
  return results;
};

// --- Human-friendly summary generator ---
function generateHumanSummary(testResults, patientInfo = {}) {
  const name = patientInfo.Name || patientInfo['Patient Name'] || '';
  let summary = name ? `${name}’s lab report` : `This lab report`;

  if (!testResults || testResults.length === 0) {
    summary += ' contains no test results.';
    return summary;
  }

  let abnormal = [];
  let normalCount = 0;
  let totalCount = 0;
  let recommendations = [];

  testResults.forEach(test => {
    let status = test.flag;
    // Try to determine status from reference range if not present
    if (!status && test.normal && test.normal.match(/\d/)) {
      const minMaxMatch = test.normal.match(/([\d.]+)\s*-\s*([\d.]+)/);
      if (minMaxMatch) {
        const min = parseFloat(minMaxMatch[1]);
        const max = parseFloat(minMaxMatch[2]);
        const val = parseFloat(test.value);
        if (!isNaN(val) && !isNaN(min) && !isNaN(max)) {
          if (val < min) status = 'Low';
          else if (val > max) status = 'High';
          else status = 'Normal';
        }
      } else {
        // Handle < or > style reference
        if (/</.test(test.normal)) {
          const match = test.normal.match(/<\s*([\d.]+)/);
          if (match && parseFloat(test.value) >= parseFloat(match[1])) status = 'High';
        } else if (/>/.test(test.normal)) {
          const match = test.normal.match(/>\s*([\d.]+)/);
          if (match && parseFloat(test.value) <= parseFloat(match[1])) status = 'Low';
        }
      }
    }
    if (!status) status = 'Normal';
    totalCount++;
    if (status === 'High' || status === 'Low') {
      abnormal.push({
        name: test.name,
        value: test.value,
        unit: test.unit,
        status,
        normal: test.normal
      });
      // Add to recommendations
      if (status === 'High') {
        recommendations.push(`Follow up for elevated ${test.name.toLowerCase()}`);
      } else if (status === 'Low') {
        recommendations.push(`Follow up for low ${test.name.toLowerCase()}`);
      }
    } else {
      normalCount++;
    }
  });

  if (abnormal.length === 0) {
    summary += ' shows all results within normal limits.';
  } else {
    // Summarize abnormal findings
    const highTests = abnormal.filter(a => a.status === 'High').map(a => `${a.name} (${a.value} ${a.unit})`);
    const lowTests = abnormal.filter(a => a.status === 'Low').map(a => `${a.name} (${a.value} ${a.unit})`);
    if (highTests.length) {
      summary += ` shows elevated ${highTests.join(', ')}.`;
    }
    if (lowTests.length) {
      summary += ` shows low ${lowTests.join(', ')}.`;
    }
  }

  // Add recommendations if any
  if (recommendations.length) {
    // Remove duplicates
    const uniqueRecs = [...new Set(recommendations)];
    summary += ' Recommendations: ' + uniqueRecs.join('; ') + '.';
  }

  return summary;
}

// --- Summary Logic ---
const formatMedicalSummary = (testResults, patientInfo = {}) => {
  let summary = '';
  // Add human summary if patient info is available
  const humanSummary = generateHumanSummary(testResults, patientInfo);
  if (humanSummary && humanSummary.length > 20) {
    summary += humanSummary + '\n\n';
  }
  summary += '🩺 Medical Report Summary\n\n';
  let findings = [];
  let recommendations = [];

  testResults.forEach(test => {
    let status = test.flag;
    let interpretation = '';
    if (!status && test.normal && test.normal.match(/\d/)) {
      // Only try to parse min-max if there are digits
      const minMaxMatch = test.normal.match(/([\d.]+)\s*-\s*([\d.]+)/);
      if (minMaxMatch) {
        const min = parseFloat(minMaxMatch[1]);
        const max = parseFloat(minMaxMatch[2]);
        const val = parseFloat(test.value);
        if (!isNaN(val) && !isNaN(min) && !isNaN(max)) {
          if (val < min) status = 'Low';
          else if (val > max) status = 'High';
          else status = 'Normal';
        }
      }
    }
    if (!status) status = 'Normal';
    // Use interpretTestResult for concerning notes
    let concern = '';
    if (test.normal && test.normal.match(/\d/)) {
      const minMaxMatch = test.normal.match(/([\d.]+)\s*-\s*([\d.]+)/);
      if (minMaxMatch) {
        const { status: interpretedStatus, interpretation: interpretedNote } = interpretTestResult(test.name, test.value, test.unit, `${minMaxMatch[1]}-${minMaxMatch[2]}`);
        if ((interpretedStatus === 'High' || interpretedStatus === 'Low') && interpretedNote) {
          concern = `[Concerning: ${interpretedNote.replace(/^– /, '')}]`;
          if (!recommendations.includes(interpretedNote)) {
            recommendations.push(interpretedNote);
          }
        }
      }
    }
    findings.push(`- ${test.name}: ${test.value} ${test.unit} (Range: ${test.normal}) — ${status}${concern ? ' ' + concern : ''}`);
  });

  if (findings.length) {
    summary += findings.join('\n') + '\n';
  } else {
    summary += 'No test results found.\n';
  }

  if (recommendations.length) {
    summary += '\n📌 Recommendations:';
    recommendations.forEach(rec => {
      summary += `\n- ${rec.replace(/^– /, '')}`;
    });
  } else {
    summary += '\n\nNo concerning findings detected.';
  }

  return summary;
};

// --- Exported summarizer ---
export const summarizePDF = async (pdfUrl) => {
  let pdfText = '';
  try {
    // Extract text from PDF
    pdfText = await extractTextFromPDF(pdfUrl);
    if (!pdfText) {
      throw new Error('No text could be extracted from the PDF. The file might be empty or corrupted.');
    }
    // Parse the medical report data
    const testResults = parseLabResults(pdfText);
    // Format the summary with our medical report structure
    const formattedSummary = formatMedicalSummary(testResults);
    // Combine a simple extractive summary with our structured medical summary
    const simpleSummary = createSimpleSummary(pdfText);
    return `${simpleSummary}\n\n${formattedSummary}`;
  } catch (error) {
    console.error('PDF summarization error:', error);
    // If all else fails, return a basic error message
    return `Failed to summarize PDF: ${error.message}\nPossible causes: PDF is empty, OCR failed, or file is not supported.`;
  }
};

// Function to detect lab test type
const detectLabTestType = (text) => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('blood') || lowerText.includes('cbc')) return 'Complete Blood Count';
  if (lowerText.includes('lipid')) return 'Lipid Panel';
  if (lowerText.includes('metabolic')) return 'Comprehensive Metabolic Panel';
  if (lowerText.includes('thyroid')) return 'Thyroid Function Test';
  return 'General Lab Test';
};

// Enhanced report summary that includes detected values
export const createEnhancedSummary = async (text, reportType) => {
  try {
    if (!text || !text.trim()) {
      throw new Error("No text provided for summary");
    }

    // Get a general text summary
    const summary = await summarizeText(text);
    
    // If it's a lab test, add detected values
    if (reportType === "Blood Test" || text.toLowerCase().includes("lab") || text.toLowerCase().includes("test")) {
      const testType = detectLabTestType(text);
      const findings = parseLabResults(text);
      
      if (findings.length > 0) {
        // Create a formatted findings section
        const findingsText = findings.map(f => 
          `${f.name}: ${f.value} ${f.unit} (normal range: ${f.normal})`
        ).join("\n");
        
        return {
          testType,
          summary,
          findings,
          enhancedSummary: `Test Type: ${testType}\n\n${summary}\n\nKey Findings:\n${findingsText}`
        };
      }
    }
    
    // Default return for non-lab reports
    return {
      summary,
      enhancedSummary: summary
    };
  } catch (error) {
    console.error("Error creating enhanced summary:", error);
    // Return a simple summary as fallback
    const simpleSummary = createSimpleSummary(text);
    return {
      summary: simpleSummary,
      enhancedSummary: simpleSummary
    };
  }
};

// Function to generate recommendations
const generateRecommendations = (testResults) => {
  const recommendations = [];
  const criticalTests = testResults.filter(test => {
    const { status } = interpretTestResult(test.name, test.value, test.unit, test.normal);
    return status !== 'Normal';
  });
  
  // Track if we've added certain types of recommendations
  const addedRecommendations = new Set();
  
  criticalTests.forEach(test => {
    const { status, interpretation } = interpretTestResult(test.name, test.value, test.unit, test.normal);
    
    if (status === 'High') {
      if (test.name.toLowerCase().includes('glucose') && !addedRecommendations.has('diabetes')) {
        recommendations.push('Begin diabetes management plan (lifestyle + monitoring)');
        recommendations.push('Re-test fasting blood sugar and HbA1c in 3 months');
        addedRecommendations.add('diabetes');
      }
      if (test.name.toLowerCase().includes('wbc') && !addedRecommendations.has('infection')) {
        recommendations.push('Monitor for signs of infection');
        addedRecommendations.add('infection');
      }
      if (test.name.toLowerCase().includes('homocysteine') && !addedRecommendations.has('homocysteine')) {
        recommendations.push('Consider B-vitamin supplementation for elevated homocysteine');
        addedRecommendations.add('homocysteine');
      }
    }
    
    if (status === 'Low') {
      if (test.name.toLowerCase().includes('vitamin d') && !addedRecommendations.has('vitamin_d')) {
        recommendations.push('Start Vitamin D supplementation');
        addedRecommendations.add('vitamin_d');
      }
      if (test.name.toLowerCase().includes('b12') && !addedRecommendations.has('b12')) {
        recommendations.push('Consider B12 supplementation');
        addedRecommendations.add('b12');
      }
      if (test.name.toLowerCase().includes('hemoglobin') && !addedRecommendations.has('iron')) {
        recommendations.push('Consider iron-rich diet or supplements');
        addedRecommendations.add('iron');
      }
    }
  });
  
  return recommendations;
};
