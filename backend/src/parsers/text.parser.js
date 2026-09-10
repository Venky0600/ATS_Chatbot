const parseText = (bufferOrString) => {
  if (typeof bufferOrString === 'string') {
    return bufferOrString;
  }
  return bufferOrString.toString('utf-8');
};

module.exports = { parseText };
