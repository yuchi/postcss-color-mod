
const Core = require('css-modules-loader-core');

const Operator = require('./operator');

let COUNTER = 0;

class Operation {

  static getSourceFromNode({ type, value, nodes }) {
    if (type === 'function' && value === 'var') {
      const inner = nodes[0];
      if (inner.type === 'word') {
        return {
          constant: false,
          value: inner.value
        };
      }
      else {
        throw new Error(
          "Unsupported var! " + JSON.stringify(inner)
        );
      }
    }
    else if (type === 'word') {
      return {
        constant: true,
        value
      };
    }
    else {
      throw new Error(
        "Unsupported source! " + JSON.stringify({ type, value })
      );
    }
  }

  static fromNodes(nodes, ...rest) {
    const source = this.getSourceFromNode(nodes[0]);
    const operators = Operator.fromNodes(nodes.slice(1));

    return new this(source, operators, ...rest);
  }

  constructor(source, operators, from, content) {
    this.id = COUNTER++;
    this.source = source;
    this.operators = operators;

    if (this.source.constant) {
      this.name = 'constant_' + this.id;
    }
    else {
      const variableName = this.source.value.slice(2);
      const operatorNames = operators.map(op => op.getVariableNamePart());

      this.name = Core.scope.generateScopedName(
        [ variableName, ...operatorNames ].join('_'),
        from,
        content
      );
    }
  }

  getNode() {
    if (this.source.constant) {
      return {
        type: 'word',
        value: this.computeConstant().toString()
      };
    }
    else {
      return {
        type: 'function',
        value: 'var',
        nodes: [
          {
            type: 'word',
            value: '--' + this.name
          }
        ]
      }
    }
  }

  computeConstant() {
    if (!this.source.constant) {
      throw new Error("Cannot .computeConstant a dynamic operation");
    }

    return this.compute(this.source.value);
  }

  compute(value) {
    return this.operators.reduce((memo, op) => op.compute(memo), value);
  }
}

// Exporting

module.exports = Operation;
