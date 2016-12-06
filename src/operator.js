
const colorModToChroma = require('./color-mod-to-chroma');

module.exports = class Operator {

  static getOperandsFromNodes(nodes) {
    return nodes
      .map(({ type, value }) => {
        if (type === 'space') {
          return { space: true };
        }
        else if (type === 'word') {
          return value;
        }
        else {
          throw new Error(
            "Unsupported operand: " + JSON.stringify({ type, value })
          );
        }
      });
  }

  static fromNode({ type, value, nodes }) {
    if (type === 'function') {
      return new this(value, this.getOperandsFromNodes(nodes));
    }
    else {
      throw new Error(
        "Unsupported operator! " + JSON.stringify({ type, value })
      );
    }
  }

  static fromNodes(nodes) {
    return nodes
      .filter(({ type }) => type !== 'space')
      .map(this.fromNode, this);
  }

  constructor(type, operands) {
    this.type = type;
    this.operand = operands;
  }

  getVariableNamePart() {
    // TODO
    return this.type;
  }

  compute(value) {
    return colorModToChroma(value, this.type, ...this.operand);
  }

}
