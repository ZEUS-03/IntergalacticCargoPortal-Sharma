"use strict";

function isPrime(n) {
  if (typeof n !== "number" || !Number.isInteger(n) || n <= 1) {
    return false;
  }

  if (n === 2) {
    return true;
  }

  if (n % 2 === 0) {
    return false;
  }

  const limit = Math.floor(Math.sqrt(n));
  for (let candidate = 3; candidate <= limit; candidate += 2) {
    if (n % candidate === 0) {
      return false;
    }
  }

  return true;
}

module.exports = isPrime;
