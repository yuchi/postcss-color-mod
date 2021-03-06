
const postcss = require('postcss');
const valueParser = require('postcss-value-parser');

const Operation = require('./operation');

module.exports = postcss.plugin('postcss-color-mod', (options = {}) => {
  return css => {

    // Color Mods -- parsing and deps graph building

    css.walkRules(rule => {
      rule.walkDecls((decl, i) => {
        const parsed = valueParser(decl.value).walk(node => {
          const { type, value, nodes } = node;

          if (type === 'function' && value === 'color-mod') {
            const operation = Operation.fromNodes(
              nodes,
              css.source.input.from,
              css.source.input.css
            );

            Object.assign(node, operation.getNode());
          }
        });

        decl.value = parsed.toString();
      });
    });
  };
});
