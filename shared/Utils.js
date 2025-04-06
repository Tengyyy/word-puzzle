export function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

// Utility function to get random rgb color, if a reference color is passed then it is guaranteed that the returned random color is not too similar
export function getRandomColor(lastColor = null, opacity = 1) {
  const minRGB = 50 // Minimum RGB value to avoid very dark colors
  const maxRGB = 200 // Maximum RGB value to avoid very bright colors
  const minDifference = 100 // Minimum difference between consecutive colors (sum of RGB differences)

  let r, g, b

  let i = 0
  do {
    r = Math.floor(Math.random() * (maxRGB - minRGB + 1)) + minRGB
    g = Math.floor(Math.random() * (maxRGB - minRGB + 1)) + minRGB
    b = Math.floor(Math.random() * (maxRGB - minRGB + 1)) + minRGB

    // If there's no last color, accept the first generated color
    if (!lastColor) break

    // Calculate the difference between the new color and the last color
    const diff =
      Math.abs(r - lastColor.r) +
      Math.abs(g - lastColor.g) +
      Math.abs(b - lastColor.b)
    if (diff >= minDifference) break // Ensure the difference is significant enough
    i++
  } while (i < 5)

  return { r, g, b, opacity }
}

export function isOnlyLetters(str) {
  if (typeof str !== "string") return false;

  return /^\p{L}+$/u.test(str);
}

export function calculateWordItemWidth(wordList, font = '16px Roboto') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;

  let maxWidth = 0;

  for (const word of wordList) {
    const width = context.measureText(word.hint).width;
    if (width > maxWidth) {
      maxWidth = width;
    }
  }

  return Math.max(50, Math.ceil(maxWidth) + 65);
}
