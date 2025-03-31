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
      Math.abs(r - lastColor.value.r) +
      Math.abs(g - lastColor.value.g) +
      Math.abs(b - lastColor.value.b)
    if (diff >= minDifference) break // Ensure the difference is significant enough
    i++
  } while (i < 5)

  return { r, g, b, opacity }
}
