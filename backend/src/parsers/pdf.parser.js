const pdfParse = require('pdf-parse');

const parsePdf = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (error) {
    console.error('PDF parsing error:', error.message);
    throw new Error('Failed to parse PDF file text content.');
  }
};

module.exports = { parsePdf };
