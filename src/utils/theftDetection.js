/**
 * Theft Detection Utility
 * Compares current values at multiple levels with a configurable tolerance.
 */

const TOLERANCE = 0.3; // ±0.3 Amps

/**
 * Check if two values are within tolerance of each other.
 */
export const isWithinTolerance = (a, b, tol = TOLERANCE) =>
  Math.abs(a - b) <= tol;

/**
 * Perform multi-level theft detection.
 *
 * Wiring:
 *   Pole 1 → House 1 (CS1)           [1 house]
 *   Pole 2 → House 2 (CS2) + House 3 (CS3) [2 houses]
 *
 * @param {{ CS1: number, CS2: number, CS3: number, CS4: number, PCS1: number, PCS2: number }} sensors
 * @returns {{ mainTheft: boolean, pole1Theft: boolean, pole2Theft: boolean, anyTheft: boolean, details: string[] }}
 */
export const detectTheft = ({ CS1 = 0, CS2 = 0, CS3 = 0, CS4 = 0, PCS1 = 0, PCS2 = 0 }, tolerance = TOLERANCE) => {
  const mainTheft = !isWithinTolerance(CS4, PCS1 + PCS2, tolerance);
  const pole1Theft = !isWithinTolerance(PCS1, CS1, tolerance);           // Pole 1: 1 house
  const pole2Theft = !isWithinTolerance(PCS2, CS2 + CS3, tolerance);     // Pole 2: 2 houses

  const details = [];
  if (mainTheft) details.push('Theft Detected — Main Input ≠ (Pole 1 + Pole 2)');
  if (pole1Theft) details.push('Theft at Pole 1 — Pole 1 Total ≠ House 1');
  if (pole2Theft) details.push('Theft at Pole 2 — Pole 2 Total ≠ (House 2 + House 3)');

  return {
    mainTheft,
    pole1Theft,
    pole2Theft,
    anyTheft: mainTheft || pole1Theft || pole2Theft,
    details,
  };
};

export default detectTheft;
