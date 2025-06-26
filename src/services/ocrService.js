import { PDFDocumentProxy, getDocument } from 'pdfjs-dist';

// Helper: Render a PDF page to an image (PNG data URL)
async function renderPageToImage(pdf, pageNum) {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: 2 });
  // Create an offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext('2d');
  await page.render({ canvasContext: context, viewport }).promise;
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
}

// Helper: POST an image blob to the backend OCR API
const OCR_API_URL = "https://med4u.onrender.com/ocr"; // <-- Update this to your Render backend URL
async function ocrImageWithBackend(imageBlob) {
  const formData = new FormData();
  formData.append('file', imageBlob, 'page.png');
  const response = await fetch(OCR_API_URL, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) {
    throw new Error(`Backend OCR error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(`Backend OCR error: ${data.error}`);
  }
  return data.text || '';
}

export const extractTextFromPDF = async (pdfUrl) => {
  try {
    console.log('Starting PDF split and OCR (per page, backend, parallel)...');
    // Fetch the PDF as an ArrayBuffer
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    const pdfArrayBuffer = await response.arrayBuffer();

    // Load PDF with pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist/build/pdf');
    const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    const pdf = await pdfjsLib.getDocument({ data: pdfArrayBuffer }).promise;
    const numPages = pdf.numPages;

    // Process all pages in parallel
    const pagePromises = [];
    for (let i = 1; i <= numPages; i++) {
      pagePromises.push(
        (async () => {
          console.log(`Processing page ${i} of ${numPages}`);
          const imageBlob = await renderPageToImage(pdf, i);
          // Send to backend OCR
          const pageText = await ocrImageWithBackend(imageBlob);
          return pageText;
        })()
      );
    }
    const allTexts = await Promise.all(pagePromises);
    console.log('All pages processed (parallel). Returning combined text.');
    return allTexts.join('\n').trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`OCR failed: ${error.message}`);
  }
};