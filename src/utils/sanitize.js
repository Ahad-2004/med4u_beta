// Simple input sanitization utility
// Removes dangerous characters and trims whitespace
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  // Remove script tags, angle brackets, and trim
  return input
    .replace(/<.*?>/g, '')
    .replace(/["'`;]/g, '')
    .replace(/[\\/]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// For file names: remove path traversal and double extensions
export function sanitizeFileName(fileName) {
  if (typeof fileName !== 'string') return '';
  // Remove ../, ..\\, and only allow alphanum, dash, underscore, dot
  return fileName
    .replace(/\.+[\\/]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+/, '')
    .replace(/\s+/g, '_')
    .trim();
}
