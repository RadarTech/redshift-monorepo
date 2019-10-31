import BigNumber from 'bignumber.js';

const hex = 16;
const ten = 10;

/**
 * Convert a hex string to BigNumber
 * @param hexString The hex representation of the number to convert
 */
export function hexToBigNumber(hexString: string): BigNumber {
  return new BigNumber(parseInt(hexString, hex));
}

/**
 * Convert a number to its hex representation
 * @param number The number to convert to hex
 */
export function toHexString(number: BigNumber): string {
  return number.toString(hex);
}

/**
 * A baseUnit is defined as the smallest denomination of a token. An amount expressed in baseUnits
 * is the amount expressed in the smallest denomination.
 * E.g: 1 unit of a token with 18 decimal places is expressed in baseUnits as 1000000000000000000
 * @param unitAmount The amount of units that you would like converted to baseUnits.
 * @param decimals The number of decimal places the unit amount has.
 */
export function toBaseUnitAmount(
  unitAmount: BigNumber,
  decimals: BigNumber,
): BigNumber {
  const baseUnitAmount = unitAmount.times(new BigNumber(ten).pow(decimals));
  if (baseUnitAmount.decimalPlaces() !== 0) {
    throw new Error(
      `Invalid unit amount: ${unitAmount.toString()} - Too many decimal places`,
    );
  }
  return baseUnitAmount;
}

/**
 * A unit amount is defined as the amount of a token above the specified decimal places (integer part).
 * E.g: If a currency has 18 decimal places, 1e18 is equivalent to 1 unit.
 * @param baseUnits The amount in baseUnits that you would like converted to units.
 * @param decimals The number of decimal places the unit amount has.
 */
export function toUnitAmount(
  baseUnits: BigNumber,
  decimals: BigNumber,
): BigNumber {
  return baseUnits.div(new BigNumber(ten).pow(decimals));
}

/**
 * Determine if two numbers are within a certain percentage of each other
 * NOTE: percentage >= abs((n1-n2) / ( (n1+n2)/2 ))
 * @param n1 The first number to consider
 * @param n2 The second number to consider
 * @param percentThreshold The percentage multiple threshold eg. 10% = 0.1
 */
export function isWithinPercentThreshold(
  n1: BigNumber,
  n2: BigNumber,
  percentThreshold: BigNumber,
) {
  return percentThreshold.gte(
    n1
      .minus(n2)
      .div(n1.plus(n2).div(2))
      .abs(),
  );
}
