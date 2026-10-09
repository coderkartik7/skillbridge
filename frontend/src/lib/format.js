/**
 * Format helper utilities for SkillBridge
 */

/**
 * Capitalizes string or converts kebab/snake/space separated words to Title Case
 * @param {string} str
 * @returns {string}
 */
export function toTitleCase(str) {
  if (!str) return '';
  return str
    .replace(/[_-]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formats file size in bytes to human readable string
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return '';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Maps risk label to corresponding palette theme colors
 * @param {'Low'|'Medium'|'High'|string} riskLabel
 * @returns {{ badgeBg: string, text: string, colorHex: string, border: string }}
 */
export function getRiskTheme(riskLabel) {
  const normalized = (riskLabel || '').toLowerCase();
  if (normalized === 'low') {
    return {
      name: 'Low',
      colorHex: '#FFCB56', // amber
      badgeBg: 'bg-amber/20',
      text: 'text-ink',
      border: 'border-amber/40',
      pillClass: 'bg-cream text-ink border-amber/50',
    };
  }
  if (normalized === 'medium') {
    return {
      name: 'Medium',
      colorHex: '#FFA259', // orange
      badgeBg: 'bg-orange/20',
      text: 'text-ink',
      border: 'border-orange/40',
      pillClass: 'bg-orange/20 text-ink border-orange/50',
    };
  }
  // High default
  return {
    name: 'High',
    colorHex: '#FF7E7E', // coral
    badgeBg: 'bg-coral/20',
    text: 'text-ink',
    border: 'border-coral/40',
    pillClass: 'bg-coral/20 text-ink border-coral/50',
  };
}

/**
 * Maps role option label type to friendly text and styling
 * @param {'step_up'|'lateral'|'emerging'|string} label
 */
export function getRoleOptionMeta(label) {
  switch (label) {
    case 'step_up':
      return {
        text: 'Step up',
        badgeBg: 'bg-amber text-ink',
        border: 'border-amber/60',
        colorHex: '#FFCB56',
      };
    case 'lateral':
      return {
        text: 'Lateral pivot',
        badgeBg: 'bg-orange text-ink',
        border: 'border-orange/60',
        colorHex: '#FFA259',
      };
    case 'emerging':
      return {
        text: 'Emerging',
        badgeBg: 'bg-coral text-ink',
        border: 'border-coral/60',
        colorHex: '#FF7E7E',
      };
    default:
      return {
        text: toTitleCase(label || 'Pivot'),
        badgeBg: 'bg-cream text-ink',
        border: 'border-surface-border',
        colorHex: '#FFEDB9',
      };
  }
}
