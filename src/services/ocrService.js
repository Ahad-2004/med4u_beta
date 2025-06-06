import { PDFDocumentProxy, getDocument } from 'pdfjs-dist';

const OCR_SPACE_API_KEY = process.env.REACT_APP_OCR_SPACE_API_KEY || '';
const OCR_SPACE_API_URL = 'https://api.ocr.space/parse/image';

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

export const extractTextFromPDF = async (pdfUrl) => {
  try {
    console.log('Starting PDF split and OCR (per page)...');
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
    let allText = '';

    for (let i = 1; i <= numPages; i++) {
      console.log(`Processing page ${i} of ${numPages}`);
      const imageBlob = await renderPageToImage(pdf, i);
      // Prepare form data for OCR.Space
      const formData = new FormData();
      formData.append('file', imageBlob, `page${i}.png`);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('OCREngine', '2');
      // Send to OCR.Space
      const ocrResponse = await fetch(OCR_SPACE_API_URL, {
        method: 'POST',
        headers: {
          'apikey': OCR_SPACE_API_KEY
        },
        body: formData
      });
      if (!ocrResponse.ok) {
        throw new Error(`OCR.Space API error: ${ocrResponse.status} ${ocrResponse.statusText}`);
      }
      const ocrResult = await ocrResponse.json();
      if (ocrResult.IsErroredOnProcessing) {
        throw new Error(`OCR.Space error (page ${i}): ${ocrResult.ErrorMessage?.join(' ') || 'Unknown error'}`);
      }
      const parsedResults = ocrResult.ParsedResults;
      if (parsedResults && parsedResults.length && parsedResults[0].ParsedText) {
        allText += parsedResults[0].ParsedText + '\n';
      }
    }
    console.log('All pages processed. Returning combined text.');
    return allText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`OCR failed: ${error.message}`);
  }
}; 