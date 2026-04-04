import sanitizeHtml from 'sanitize-html';

function sanitizeInput(input) {
  // Só sanitiza strings — outros tipos (boolean, number, null) passam sem alteração
  if (typeof input !== 'string') return input;
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

export default sanitizeInput;