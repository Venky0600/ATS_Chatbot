const mammoth = require('mammoth');

const parseDocx = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (error) {
    console.error('DOCX parsing error:', error.message);
    throw new Error('Failed to parse DOCX file text content.');
  }
};

module.exports = { parseDocx };
