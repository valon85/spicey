export function getLightModeTextColor(darkColor = 'white', lightColor = '#1a1a1a') {
  return document.documentElement.classList.contains('light-mode') ? lightColor : darkColor;
}

export function getLightModeSubtextColor(darkColor = 'rgba(255,255,255,0.65)', lightColor = '#666666') {
  return document.documentElement.classList.contains('light-mode') ? lightColor : darkColor;
}

export function getLightModeAccentColor(darkColor = '#ff7700', lightColor = '#ff5500') {
  return document.documentElement.classList.contains('light-mode') ? lightColor : darkColor;
}

export function getLightModeNeutralColor(darkColor = 'rgba(255,255,255,0.4)', lightColor = '#999') {
  return document.documentElement.classList.contains('light-mode') ? lightColor : darkColor;
}