import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Generates HTML content for the learning path PDF
 * @param {Object} pathData - The learning path data object
 * @returns {string} HTML string for PDF generation
 */
const generateLearningPathHTML = (pathData) => {
  const title = pathData.title || `${pathData.topic} Learning Path`;
  const description = pathData.description || '';
  const totalHours = pathData.total_hours || 0;
  const durationWeeks = pathData.duration_weeks || 0;
  const expertiseLevel = pathData.expertise_level || 'Beginner';
  const milestones = pathData.milestones || [];
  // Support both job_market and job_market_data field names
  const jobMarket = pathData.job_market || pathData.job_market_data || null;

  // Generate milestones HTML
  const milestonesHTML = milestones.map((milestone, index) => {
    const resources = milestone.resources || [];
    const resourcesHTML = resources.length > 0
      ? `
        <div class="resources">
          <h4>📚 Resources</h4>
          <ul>
            ${resources.map(resource => `
              <li>
                <span class="resource-type">${getResourceIcon(resource.type)}</span>
                <span class="resource-title">${resource.title || resource.description || 'Resource'}</span>
                ${resource.url ? `<br/><a href="${resource.url}" class="resource-link">${resource.url}</a>` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      `
      : '';

    return `
      <div class="milestone">
        <div class="milestone-header">
          <div class="milestone-number">${index + 1}</div>
          <div class="milestone-info">
            <h3>${milestone.title || milestone.milestone}</h3>
            <span class="milestone-duration">⏱ ${milestone.estimated_hours || Math.ceil(totalHours / milestones.length)} hours</span>
          </div>
        </div>
        ${milestone.description ? `<p class="milestone-description">${milestone.description}</p>` : ''}
        ${resourcesHTML}
      </div>
    `;
  }).join('');

  // Generate study tips HTML
  const hoursPerWeek = Math.ceil((totalHours || 10) / (durationWeeks || 4));

  const studyTipsHTML = `
    <div class="section study-tips">
      <h2>💡 Study Tips</h2>
      <div class="tips-list">
        <div class="tip-item">
          <span class="tip-icon">✓</span>
          <span class="tip-text">Complete milestones in order for best results</span>
        </div>
        <div class="tip-item">
          <span class="tip-icon">⏰</span>
          <span class="tip-text">Dedicate ${hoursPerWeek} hours per week to stay on track</span>
        </div>
        <div class="tip-item">
          <span class="tip-icon">📚</span>
          <span class="tip-text">Practice with hands-on projects after each milestone</span>
        </div>
        <div class="tip-item">
          <span class="tip-icon">🔄</span>
          <span class="tip-text">Review previous topics regularly to reinforce learning</span>
        </div>
      </div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 40px;
          background: #fff;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 3px solid #6366f1;
        }
        
        .header h1 {
          color: #6366f1;
          font-size: 28px;
          margin-bottom: 10px;
        }
        
        .header .description {
          color: #666;
          font-size: 14px;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .stats-grid {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-top: 25px;
          flex-wrap: wrap;
        }
        
        .stat-item {
          text-align: center;
          padding: 15px 25px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 12px;
          color: white;
          min-width: 100px;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          display: block;
        }
        
        .stat-label {
          font-size: 12px;
          opacity: 0.9;
          text-transform: uppercase;
        }
        
        .section {
          margin-bottom: 30px;
        }
        
        .section h2 {
          color: #6366f1;
          font-size: 20px;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .study-tips {
          background: #f0fdf4;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 30px;
          border: 1px solid #bbf7d0;
        }
        
        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .tip-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: white;
          padding: 12px 15px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .tip-icon {
          font-size: 16px;
          flex-shrink: 0;
        }
        
        .tip-text {
          font-size: 14px;
          color: #374151;
          line-height: 1.5;
        }
        
        .milestones-title {
          color: #6366f1;
          font-size: 20px;
          margin-bottom: 20px;
        }
        
        .milestone {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          border-left: 4px solid #6366f1;
          page-break-inside: avoid;
        }
        
        .milestone-header {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .milestone-number {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
          flex-shrink: 0;
        }
        
        .milestone-info h3 {
          color: #333;
          font-size: 16px;
          margin-bottom: 5px;
        }
        
        .milestone-duration {
          color: #666;
          font-size: 13px;
        }
        
        .milestone-description {
          color: #555;
          font-size: 14px;
          margin-bottom: 15px;
          line-height: 1.7;
        }
        
        .resources {
          background: white;
          border-radius: 8px;
          padding: 15px;
        }
        
        .resources h4 {
          color: #6366f1;
          font-size: 14px;
          margin-bottom: 10px;
        }
        
        .resources ul {
          list-style: none;
        }
        
        .resources li {
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 13px;
        }
        
        .resources li:last-child {
          border-bottom: none;
        }
        
        .resource-type {
          margin-right: 8px;
        }
        
        .resource-title {
          color: #333;
        }
        
        .resource-link {
          color: #6366f1;
          font-size: 12px;
          word-break: break-all;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #999;
          font-size: 12px;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          
          .milestone {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎯 ${title}</h1>
        ${description ? `<p class="description">${description}</p>` : ''}
        
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">${totalHours}</span>
            <span class="stat-label">Hours</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${durationWeeks}</span>
            <span class="stat-label">Weeks</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${expertiseLevel}</span>
            <span class="stat-label">Level</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${milestones.length}</span>
            <span class="stat-label">Milestones</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2 class="milestones-title">🚀 Learning Milestones</h2>
        ${milestonesHTML}
      </div>
      
      ${studyTipsHTML}
      
      <div class="footer">
        <p>Generated by AI Learning Path Generator</p>
        <p>Created on ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Get icon for resource type
 */
const getResourceIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'video':
      return '🎬';
    case 'article':
      return '📄';
    case 'course':
      return '📚';
    case 'book':
      return '📖';
    case 'tutorial':
      return '💡';
    case 'documentation':
      return '📋';
    case 'practice':
      return '🏋️';
    default:
      return '🔗';
  }
};

/**
 * Generate and download/share a PDF of the learning path
 * @param {Object} pathData - The learning path data
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const downloadLearningPathPDF = async (pathData) => {
  try {
    // Generate HTML content
    const html = generateLearningPathHTML(pathData);

    // Create PDF file
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // Create a proper filename
    const fileName = `${(pathData.title || pathData.topic || 'learning-path')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()}_${Date.now()}.pdf`;

    if (Platform.OS === 'web') {
      // For web, trigger download
      const link = document.createElement('a');
      link.href = uri;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, message: 'PDF downloaded successfully!' };
    }

    // For mobile, move to a proper location and share
    const newUri = FileSystem.documentDirectory + fileName;
    await FileSystem.moveAsync({
      from: uri,
      to: newUri,
    });

    // Check if sharing is available
    const isSharingAvailable = await Sharing.isAvailableAsync();

    if (isSharingAvailable) {
      await Sharing.shareAsync(newUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save Learning Path PDF',
        UTI: 'com.adobe.pdf',
      });
      return { success: true, message: 'PDF ready to share!' };
    } else {
      return { success: true, message: `PDF saved to: ${newUri}` };
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, message: `Failed to generate PDF: ${error.message}` };
  }
};

/**
 * Print the learning path directly
 * @param {Object} pathData - The learning path data
 */
export const printLearningPath = async (pathData) => {
  try {
    const html = generateLearningPathHTML(pathData);
    await Print.printAsync({ html });
    return { success: true, message: 'Print dialog opened' };
  } catch (error) {
    console.error('Error printing:', error);
    return { success: false, message: `Failed to print: ${error.message}` };
  }
};

export default {
  downloadLearningPathPDF,
  printLearningPath,
};
