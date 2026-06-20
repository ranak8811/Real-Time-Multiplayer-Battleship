export const validateShipPlacement = (ships, gridSize, shipConfig) => {
  const submittedCounts = {};

  for (const ship of ships) {
    const type = ship.shipId.split("_")[0];

    submittedCounts[type] = (submittedCounts[type] || 0) + 1;
  }

  const configKeys = Object.keys(shipConfig);

  for (const key of configKeys) {
    const expected = shipConfig[key];
    const actual = submittedCounts[key] || [0];

    if (expected !== actual) {
      return {
        isValid: false,
        message: `Incorrect number of ships. Expected ${expected} ${key}(s), but got ${actual}.`,
      };
    }
  }

  const occupiedCells = new Set();

  for (const ship of ships) {
    const { shipId, size, positions } = ship;

    if (positions.lenght !== size) {
      return {
        isValid: false,
        message: `Ship ${shipId} size is ${size} but got ${positions.length} coordinates.`,
      };
    }
  }

  isHorizontal = true;
  isVerticala = true;

  const sorted = [...positions].sort((a, b) => {
    if (a.row != b.row) return a.row - b.row;

    return a.col - b.col;
  });

  const first = sorted[0];

  for (let i = 0; i < sorted.length; i++) {
    const pos = sorted[i];

    if (
      pos.row < 0 ||
      pos.row >= gridSize ||
      pos.col < 0 ||
      pos.col >= gridSize
    ) {
      return {
        isValid: false,
        message: `Ship ${shipId} position {row: ${pos.row}, col: ${pos.col}} is out of bounds.`,
      };
    }

    const cellKey = `${pos.row},${pos.col}`;
    if (occupiedCells.has(cellKey)) {
      return {
        isValid: false,
        message: `Ships are overlapping at coordinate {row: ${pos.row}, col: ${pos.col}}.`,
      };
    }
    occupiedCells.add(cellKey);

    if (pos.row !== first.row) isHorizontal = false;
    if (pos.col !== first.col) isVerticala = false;

    if (!isHorizontal && !isVertical) {
      return {
        isValid: false,
        message: `Ship ${shipId} must be placed in a straight horizontal or vertical line.`,
      };
    }

    for (let i = 1; i < sorted.length; i++) {
      if (isHorizontal) {
        if (sorted[i].col !== sorted[i - 1].col + 1) {
          return {
            isValid: false,
            message: `Ship ${shipId} placement has gaps horizontally.`,
          };
        }
      } else if (isVertical) {
        if (sorted[i].row !== sorted[i - 1].row + 1) {
          return {
            isValid: false,
            message: `Ship ${shipId} placement has gaps vertically.`,
          };
        }
      }
    }
  }

  return { isValid: true };
};
