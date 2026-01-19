/**
 * Utility functions for the AI Learning Path mobile app
 */

/**
 * Format duration in weeks to a readable string
 * @param {number} weeks 
 * @returns {string}
 */
export function formatDuration(weeks) {
  if (weeks === 1) return '1 week';
  if (weeks < 4) return `${weeks} weeks`;
  const months = Math.floor(weeks / 4);
  const remainingWeeks = weeks % 4;
  if (remainingWeeks === 0) {
    return months === 1 ? '1 month' : `${months} months`;
  }
  return `${months} month${months > 1 ? 's' : ''}, ${remainingWeeks} week${remainingWeeks > 1 ? 's' : ''}`;
}

/**
 * Calculate completion percentage
 * @param {Object} path 
 * @returns {number}
 */
export function calculateCompletion(path) {
  if (!path?.milestones || !path?.completedMilestones) return 0;
  const completed = Object.values(path.completedMilestones).filter(Boolean).length;
  return Math.round((completed / path.milestones.length) * 100);
}

/**
 * Format time commitment to hours per week
 * @param {string} commitment 
 * @returns {string}
 */
export function formatTimeCommitment(commitment) {
  const commitmentMap = {
    minimal: '2-4 hours/week',
    moderate: '5-10 hours/week',
    intensive: '15+ hours/week',
  };
  return commitmentMap[commitment] || commitment;
}

/**
 * Format expertise level to display string
 * @param {string} level 
 * @returns {string}
 */
export function formatExpertiseLevel(level) {
  const levelMap = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };
  return levelMap[level] || level;
}

/**
 * Generate a unique ID
 * @returns {string}
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Truncate text to a specified length
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format date to a readable string
 * @param {string|Date} date 
 * @returns {string}
 */
export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date 
 * @returns {string}
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const d = new Date(date);
  const diff = now - d;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return formatDate(date);
}

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Deep clone an object
 * @param {Object} obj 
 * @returns {Object}
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
