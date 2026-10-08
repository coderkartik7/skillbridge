/**
 * Computes radial positions for N target cards around a central node.
 * React Flow nodes have their origin at top-left, so we offset by card dimensions.
 *
 * @param {Array} options - Array of target role options (length 0-4)
 * @param {number} centerX - X coordinate of center node center (default: 450)
 * @param {number} centerY - Y coordinate of center node center (default: 280)
 * @param {number} radius - Distance from center to option cards (default: 340)
 * @returns {Array<{ ...option, x: number, y: number }>}
 */
export function calculateRadialPositions(options = [], centerX = 450, centerY = 280, radius = 330) {
  if (!options || options.length === 0) return [];

  const count = options.length;

  // Cardinal or aesthetic distribution angles (in radians)
  // For 1 item: to the right (0 deg)
  // For 2 items: left (-Math.PI) and right (0) or top & bottom
  // For 3 items: -Math.PI / 4, Math.PI / 4, -3 * Math.PI / 4, etc.
  // For 4 items: 4 quadrants evenly spaced
  let angles = [];

  if (count === 1) {
    angles = [0]; // right
  } else if (count === 2) {
    angles = [-Math.PI * 0.15, Math.PI * 0.85]; // upper right and lower left
  } else if (count === 3) {
    // 3 evenly distributed on the right & left arc
    angles = [-Math.PI * 0.25, Math.PI * 0.25, Math.PI];
  } else if (count === 4) {
    // 4 quadrants nicely distributed avoiding pure top/bottom overlap
    angles = [
      -Math.PI * 0.22, // top-right
      Math.PI * 0.22,  // bottom-right
      Math.PI * 0.78,  // bottom-left
      -Math.PI * 0.78, // top-left
    ];
  } else {
    // General N-gon
    const step = (2 * Math.PI) / count;
    angles = options.map((_, i) => -Math.PI / 2 + i * step);
  }

  // Node dimensions to compute top-left from center point
  const CARD_WIDTH = 280;
  const CARD_HEIGHT = 170;

  return options.map((option, idx) => {
    const angle = angles[idx];
    const x = Math.round(centerX + radius * Math.cos(angle) - CARD_WIDTH / 2);
    const y = Math.round(centerY + radius * Math.sin(angle) - CARD_HEIGHT / 2);

    return {
      ...option,
      position: { x, y },
    };
  });
}
