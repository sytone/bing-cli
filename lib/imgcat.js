'use strict'
/* eslint no-unused-expressions: [2, { allowShortCircuit: true }] */

const fs = require('fs')
const tempFile = require('tempfile')
const isUrl = require('is-url')
const fetch = require('node-fetch')

const termImg = require('./iterm.js')


module.exports = async function (file, options, events) {
  // Handler function used in pre-rendering for the imgcat() function below. Implements image scaling as an option.
  const preImgCatRenderHandler = function(ctx, cb) {
    let newOpts = Object.assign({}, ctx.opts);
    if (newOpts.scale && ctx.imagePath) {
      // Use sharp for image info instead of deprecated image-info
      try {
        const sharp = require('sharp');
        sharp(ctx.imagePath)
          .metadata()
          .then(info => {
            newOpts.width = Math.round(info.width * newOpts.scale, 0) + 'px';
            newOpts.height = Math.round(info.height * newOpts.scale, 0) + 'px';
            cb && cb(null, ctx.img, newOpts);
          })
          .catch(err => {
            cb && cb(err, ctx.img, newOpts);
          });
      } catch {
        cb && cb(null, ctx.img, newOpts);
      }
    }
    else {
      cb && cb(null, ctx.img, newOpts);
    }
  }

  const on = events || {}
  options.preRender = preImgCatRenderHandler
  on.before && on.before()
  let tempPath
  let image
  if (isUrl(file)) {
    tempPath = tempFile()
    on.beforeDownload && on.beforeDownload()
    
    // Replace pget with fetch
    try {
      const response = await fetch(file);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const buffer = await response.buffer();
      fs.writeFileSync(tempPath, buffer);
    } catch (_error) {
      console.error('Error downloading image:', _error.message);
      return null;
    }
    
    on.afterDownload && on.afterDownload()
    image = termImg(tempPath, options)
  } else {
    image = termImg(file, options)
  }
  on.after && on.after()
  return image
}
