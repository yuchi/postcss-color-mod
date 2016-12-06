const fs = require('fs');
const path = require('path');

const assert = require('assert');
const postcss = require('postcss');

describe("Fixtures", () => {

  it("works with simple expressions", () => {
    return process('./simple');
  });

});

function process(file) {
  const from = file + '.pre.css';
  const to = file + '.post.css';
  const src = fs.readFileSync(path.resolve(__dirname, from), 'utf8');
  const out = fs.readFileSync(path.resolve(__dirname, to), 'utf8');

  return postcss([
      require('postcss-modules'),
      require('..')
    ])
    .process(src, { from, to })
    .then(result => {
      assert.equal(result.css, out);
    });
}
