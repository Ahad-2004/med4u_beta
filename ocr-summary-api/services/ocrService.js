const Tesseract = require("tesseract.js");

const extractText = (imagePath) => {
  return new Promise((resolve, reject) => {
    Tesseract.recognize(imagePath, "eng", {
      logger: (m) => console.log(m),
    })
      .then(({ data: { text } }) => resolve(text))
      .catch((err) => reject(err));
  });
};

module.exports = { extractText };