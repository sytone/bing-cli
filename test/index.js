const assert = require('assert');
const bingCli = require('..');

describe('bing-cli', function() {
  it('should export a function', function() {
    assert.strictEqual(typeof bingCli, 'function');
  });
  
  it('should handle basic functionality', function() {
    // Basic test to ensure the module loads
    assert.ok(bingCli);
  });
});
