
const chroma = require('chroma-js');
const valueParser = require('postcss-value-parser');

const ADJUST_OPERATOR = [ '+', '-', '*' ];

const error = (type, msg = 'Uninmplemented') => (...args) => {
  throw new Error(`Error on operator '${type}' with args (${args.join(', ')}): ${msg}`);
};

const set = (prop) => (col, operand) => col.set(prop, operand);
const call = (prop) => (col, operand) => col[prop](operand);

const parseNumber = (arg, percentages, degrees) => {
  const { unit, number } = valueParser.unit(arg);

  if (!unit) {
    return parseFloat(number, 10);
  }
  else if (percentages && (unit === '%')) {
    return parseFloat(number, 10) / 100;
  }
  else if (degrees && (unit === 'deg')) {
    return parseFloat(number, 10) / 360;
  }
  else {
    throw new Error("Unsupported unit: " + unit);
  }
};

const parseNumberWithOperator = (percentages, degrees) => (col, ...args) => {
  if (
    ADJUST_OPERATOR.includes(args[0]) &&
    (args[1].space) &&
    (typeof args[2] === 'string')
  ) {
    const [ operator, space, value ] = args;
    const number = parseNumber(value, percentages, degrees);

    if (operator === '-' && number > 0) {
      return String(-number);
    }

    if (operator === '+' && number < 0) {
      return String(number);
    }

    return operator + number;
  }
  else {
    const [ value ] = args;

    const operator = value.charAt(0);

    if (operator === '*') {
      return parseNumberWithOperator(col, '*', { space: true }, value.slice(1));
    }
    else if (operator === '-') {
      throw new Error("Unsupported '-XX' form. Use '- XX' (with a space)");
    }
    else if (operator === '+') {
      return String(parseNumber(value.slice(1), percentages, degrees));
    }
    else {
      return String(parseNumber(value, percentages, degrees));
    }
  }
};

const compose = (...fns) => (...args) => fns.reduce(([col, ...args], fn) => [col, fn(col, ...args)], args)[0];

const ADJUSTERS = {

  // HSL

  hue: compose(parseNumberWithOperator(true, true), set('hsl.h')),
  saturation: compose(parseNumberWithOperator(true, false), set('hsl.s')),
  lightness: compose(parseNumberWithOperator(true, false), set('hsl.l')),

  // RGB(A)

  red: compose(parseNumberWithOperator(true, false), set('rgb.r')),
  green: compose(parseNumberWithOperator(true, false), set('rgb.g')),
  blue: compose(parseNumberWithOperator(true, false), set('rgb.b')),

  alpha: compose(parseNumberWithOperator(true, false), call('alpha')),

  // Whiteness/Blackness

  whiteness: error('whiteness', 'HWB is not implemented'),
  blackness: error('blackness', 'HWB is not implemented'),

  // Tint/Shade

  tint: (col, operand) => chroma.mix(col, 'white', operand),
  shade: (col, operand) => chroma.mix(col, 'black', operand),

  // Blends

};

const alias = (from, to) => ADJUSTERS[from] = ADJUSTERS[to];

alias('h', 'hue');
alias('s', 'saturation');
alias('l', 'lightness');

alias('a', 'alpha');

alias('w', 'whiteness');
alias('b', 'blackness');

module.exports = (value, type, ...operands) => (ADJUSTERS[type] || error(type))(chroma(value), ...operands);
