const sharp = require('sharp');
const fs = require('fs');

/**
 * Convert an image to ASCII art using Sharp
 * @param {string} input - URL or file path to image
 * @param {object} options - Options for ASCII conversion
 * @param {function} callback - Callback function (err, ascii)
 */
async function imageToAscii(input, options = {}, callback) {
  try {
    const chars = options.chars || ' .:-=+*#%@';
    const width = options.width || 80;
    const height = options.height || null;
    
    let imageBuffer;
    
    // Handle URL input
    if (input.startsWith('http')) {
      const fetch = require('node-fetch');
      const response = await fetch(input);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      imageBuffer = await response.buffer();
    } else {
      // Handle file path
      imageBuffer = fs.readFileSync(input);
    }
    
    // Process image with Sharp
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    // Calculate dimensions
    const aspectRatio = metadata.width / metadata.height;
    const targetHeight = height || Math.round(width / aspectRatio / 2); // /2 because terminal chars are taller than wide
    
    // Resize and convert to grayscale
    const resizedBuffer = await image
      .resize(width, targetHeight)
      .grayscale()
      .raw()
      .toBuffer();
    
    // Convert to ASCII
    let ascii = '';
    for (let i = 0; i < resizedBuffer.length; i++) {
      const pixel = resizedBuffer[i];
      const charIndex = Math.floor((pixel / 255) * (chars.length - 1));
      ascii += chars[charIndex];
      
      if ((i + 1) % width === 0) {
        ascii += '\n';
      }
    }
    
    if (callback) {
      callback(null, ascii);
    }
    return ascii;
    
  } catch (error) {
    if (callback) {
      callback(error);
    } else {
      throw error;
    }
  }
}

module.exports = imageToAscii;