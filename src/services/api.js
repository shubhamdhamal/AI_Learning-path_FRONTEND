import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for API - reads from environment variable (EXPO_PUBLIC_ prefix required for Expo)
// For local development: http://localhost:7860 or http://<your-ip>:7860
// For production: https://your-deployed-backend.com
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:7860';

console.log('API Base URL:', API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: false for mobile app (uses token-based auth instead of cookies)
  withCredentials: false,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could trigger logout
      console.log('Unauthorized request');
    }
    return Promise.reject(error);
  }
);

// ============ Learning Path API ============

export const learningPathService = {
  /**
   * Generate a new learning path with retry logic for cold starts
   * @param {Object} data - { topic, expertise_level, duration_weeks, time_commitment, goals? }
   * @returns {Promise<{ task_id: string, status: string, message: string }>}
   */
  generate: async (data, retryCount = 0) => {
    const maxRetries = 2;
    const timeout = 300000; // 5 minutes

    try {
      const response = await api.post('/api/generate', data, { timeout });
      return response.data;
    } catch (error) {
      // Retry on timeout or network error (cold start scenario)
      if (retryCount < maxRetries && (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.message?.includes('Network Error'))) {
        console.log(`Request timed out, retrying (${retryCount + 1}/${maxRetries})...`);
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        return learningPathService.generate(data, retryCount + 1);
      }
      throw error;
    }
  },

  /**
   * Check the status of a generation task
   * @param {string} taskId 
   * @returns {Promise<{ task_id: string, status: string, result?: Object, error?: string }>}
   */
  checkStatus: async (taskId) => {
    const response = await api.get(`/api/status/${taskId}`);
    return response.data;
  },

  /**
   * Get the result of a completed task
   * @param {string} taskId 
   * @returns {Promise<Object>} Learning path data
   */
  getResult: async (taskId) => {
    const response = await api.get(`/api/result/${taskId}`);
    return response.data;
  },

  /**
   * Save a learning path for the authenticated user
   * @param {Object} path 
   * @returns {Promise<{ success: boolean, path_id: string }>}
   */
  savePath: async (path) => {
    const response = await api.post('/api/save-path', { path });
    return response.data;
  },

  /**
   * Get all saved learning paths for the user
   * @returns {Promise<Array>}
   */
  getSavedPaths: async () => {
    const response = await api.get('/api/paths');
    return response.data;
  },

  /**
   * Get a specific learning path by ID
   * @param {string} pathId 
   * @returns {Promise<Object>}
   */
  getPath: async (pathId) => {
    const response = await api.get(`/api/paths/${pathId}`);
    return response.data;
  },

  /**
   * Delete a learning path
   * @param {string} pathId 
   * @returns {Promise<{ success: boolean }>}
   */
  deletePath: async (pathId) => {
    const response = await api.delete(`/api/paths/${pathId}`);
    return response.data;
  },

  /**
   * Update milestone completion status
   * @param {string} pathId 
   * @param {number} milestoneIndex 
   * @param {boolean} completed 
   * @returns {Promise<{ success: boolean }>}
   */
  updateMilestone: async (pathId, milestoneIndex, completed) => {
    const response = await api.post(`/api/paths/${pathId}/milestone`, {
      milestone_index: milestoneIndex,
      completed,
    });
    return response.data;
  },
};

// ============ Auth API ============

export const authService = {
  /**
   * Login user
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{ success: boolean, token?: string, user?: Object, error?: string }>}
   */
  login: async (email, password) => {
    const response = await api.post('/auth/api/login', { email, password });
    return response.data;
  },

  /**
   * Register new user
   * @param {string} name 
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{ success: boolean, token?: string, user?: Object, error?: string }>}
   */
  register: async (name, email, password) => {
    const response = await api.post('/auth/api/register', { name, email, password });
    return response.data;
  },

  /**
   * Logout user
   * @returns {Promise<{ success: boolean }>}
   */
  logout: async () => {
    const response = await api.post('/auth/api/logout');
    return response.data;
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>}
   */
  getProfile: async () => {
    const response = await api.get('/auth/user');
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} data 
   * @returns {Promise<{ success: boolean, user?: Object }>}
   */
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};

// ============ Health Check ============

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'error', error: error.message };
  }
};

// ============ Assessment API ============

export const assessmentService = {
  /**
   * Generate MCQ questions for skill assessment
   * @param {Object} data - { topic, expertise_level, milestones, skills, num_questions }
   * @returns {Promise<{ questions: Array }>}
   */
  generateQuestions: async (data) => {
    try {
      const response = await api.post('/api/assessment/generate', data, { timeout: 120000 });
      return response.data;
    } catch (error) {
      // If API fails, generate mock questions locally as fallback
      console.log('Assessment API failed, using local generation');
      return generateLocalQuestions(data);
    }
  },

  /**
   * Save assessment result
   * @param {Object} data - { path_id, score, correct_answers, total_questions, answers }
   * @returns {Promise<{ success: boolean }>}
   */
  saveResult: async (data) => {
    try {
      const response = await api.post('/api/assessment/result', data);
      return response.data;
    } catch (error) {
      console.log('Could not save assessment result to API');
      return { success: false };
    }
  },

  /**
   * Get assessment history for a path
   * @param {string} pathId
   * @returns {Promise<Array>}
   */
  getHistory: async (pathId) => {
    try {
      const response = await api.get(`/api/assessment/history/${pathId}`);
      return response.data;
    } catch (error) {
      return { attempts: [] };
    }
  },
};

/**
 * Generate questions locally when API is unavailable
 * Creates topic-relevant MCQ questions based on the learning path
 */
function generateLocalQuestions(data) {
  const { topic, expertise_level, milestones = [], skills = [], num_questions = 25 } = data;

  const questions = [];
  const allSkills = skills.length > 0 ? skills : milestones;

  // Question templates based on expertise level
  const templates = {
    beginner: [
      { q: 'What is the primary purpose of {concept}?', type: 'definition' },
      { q: 'Which of the following best describes {concept}?', type: 'description' },
      { q: 'What is the first step when learning {concept}?', type: 'process' },
      { q: 'Which tool is commonly used for {concept}?', type: 'tool' },
      { q: 'What does {concept} help you achieve?', type: 'benefit' },
    ],
    intermediate: [
      { q: 'How does {concept} differ from similar approaches?', type: 'comparison' },
      { q: 'What is a common challenge when implementing {concept}?', type: 'challenge' },
      { q: 'Which best practice should be followed with {concept}?', type: 'practice' },
      { q: 'In what scenario would you use {concept}?', type: 'application' },
      { q: 'What is the relationship between {concept} and related techniques?', type: 'relationship' },
    ],
    advanced: [
      { q: 'What is an advanced optimization technique for {concept}?', type: 'optimization' },
      { q: 'How would you troubleshoot issues with {concept}?', type: 'debugging' },
      { q: 'What architectural consideration is important for {concept}?', type: 'architecture' },
      { q: 'How does {concept} scale in production environments?', type: 'scaling' },
      { q: 'What security considerations apply to {concept}?', type: 'security' },
    ],
  };

  const levelTemplates = templates[expertise_level?.toLowerCase()] || templates.beginner;

  for (let i = 0; i < num_questions; i++) {
    const concept = allSkills[i % allSkills.length] || topic;
    const template = levelTemplates[i % levelTemplates.length];

    const question = {
      id: i + 1,
      question: template.q.replace('{concept}', concept),
      options: generateOptions(concept, template.type, expertise_level),
      correctAnswer: 0, // First option is always correct in our generation
      topic: concept,
      difficulty: expertise_level,
    };

    // Shuffle options and update correct answer
    const shuffled = shuffleWithAnswer(question.options);
    question.options = shuffled.options;
    question.correctAnswer = shuffled.correctIndex;

    questions.push(question);
  }

  return { questions };
}

function generateOptions(concept, type, level) {
  // Generate plausible options based on question type
  const optionSets = {
    definition: [
      `A fundamental technique in ${concept} that enables efficient learning and application`,
      `A deprecated method no longer used in modern ${concept}`,
      `An unrelated concept from a different field`,
      `A theoretical framework without practical application`,
    ],
    description: [
      `It provides a structured approach to understanding and applying ${concept} effectively`,
      `It is only useful for advanced practitioners`,
      `It has been replaced by newer methodologies`,
      `It requires specialized hardware to implement`,
    ],
    process: [
      `Understanding the core fundamentals and basic principles`,
      `Jumping directly to advanced topics`,
      `Memorizing all possible variations`,
      `Avoiding any practical exercises`,
    ],
    tool: [
      `Industry-standard tools specifically designed for this purpose`,
      `Generic text editors without any features`,
      `Outdated software from the 1990s`,
      `Tools designed for completely different purposes`,
    ],
    benefit: [
      `Improved efficiency, better outcomes, and deeper understanding`,
      `No measurable benefits have been documented`,
      `Benefits only apply to large organizations`,
      `The benefits are purely theoretical`,
    ],
    comparison: [
      `It offers unique advantages in specific use cases while sharing some principles`,
      `There are no differences whatsoever`,
      `It is universally inferior to all alternatives`,
      `Comparisons cannot be made between them`,
    ],
    challenge: [
      `Managing complexity while maintaining code quality and performance`,
      `There are no known challenges`,
      `It only works on specific operating systems`,
      `Documentation is the only challenge`,
    ],
    practice: [
      `Following established patterns and continuously refactoring for improvement`,
      `Avoiding all standard conventions`,
      `Writing as little documentation as possible`,
      `Ignoring community guidelines`,
    ],
    application: [
      `When dealing with complex problems that require structured solutions`,
      `Only in academic research settings`,
      `Never in production environments`,
      `Exclusively for small personal projects`,
    ],
    relationship: [
      `They complement each other and can be combined for better results`,
      `They are mutually exclusive and cannot be used together`,
      `There is no relationship between them`,
      `One completely replaces the other`,
    ],
    optimization: [
      `Implementing caching, parallel processing, and efficient algorithms`,
      `Adding more hardware without code changes`,
      `Removing all error handling`,
      `Using deprecated methods`,
    ],
    debugging: [
      `Using systematic logging, profiling tools, and step-by-step analysis`,
      `Randomly changing code until it works`,
      `Ignoring error messages completely`,
      `Rewriting everything from scratch`,
    ],
    architecture: [
      `Designing for scalability, maintainability, and separation of concerns`,
      `Putting all code in a single file`,
      `Avoiding any design patterns`,
      `Ignoring performance implications`,
    ],
    scaling: [
      `Through horizontal scaling, load balancing, and efficient resource management`,
      `Scaling is not possible`,
      `Only vertical scaling with bigger servers`,
      `By reducing functionality`,
    ],
    security: [
      `Input validation, encryption, and following security best practices`,
      `Security is not a concern`,
      `Only network firewalls are needed`,
      `Obscuring code is sufficient protection`,
    ],
  };

  return optionSets[type] || optionSets.definition;
}

function shuffleWithAnswer(options) {
  const indices = options.map((_, i) => i);
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const shuffledOptions = indices.map(i => options[i]);
  const correctIndex = indices.indexOf(0);

  return { options: shuffledOptions, correctIndex };
}

// ============ Trending Technologies API (Stack Overflow) ============

// Technology tag mappings for better display names and icons
const TECH_TAG_CONFIG = {
  'python': { name: 'Python', icon: 'logo-python', color: '#3776AB' },
  'javascript': { name: 'JavaScript', icon: 'logo-javascript', color: '#F7DF1E' },
  'java': { name: 'Java', icon: 'cafe', color: '#ED8B00' },
  'c#': { name: 'C#', icon: 'code-slash', color: '#239120' },
  'php': { name: 'PHP', icon: 'server', color: '#777BB4' },
  'android': { name: 'Android', icon: 'logo-android', color: '#3DDC84' },
  'html': { name: 'HTML', icon: 'logo-html5', color: '#E34F26' },
  'css': { name: 'CSS', icon: 'logo-css3', color: '#1572B6' },
  'jquery': { name: 'jQuery', icon: 'code', color: '#0769AD' },
  'c++': { name: 'C++', icon: 'hardware-chip', color: '#00599C' },
  'ios': { name: 'iOS', icon: 'logo-apple', color: '#000000' },
  'mysql': { name: 'MySQL', icon: 'server', color: '#4479A1' },
  'sql': { name: 'SQL', icon: 'server', color: '#CC2927' },
  'r': { name: 'R', icon: 'stats-chart', color: '#276DC3' },
  'node.js': { name: 'Node.js', icon: 'logo-nodejs', color: '#339933' },
  'reactjs': { name: 'React', icon: 'logo-react', color: '#61DAFB' },
  'react-native': { name: 'React Native', icon: 'phone-portrait', color: '#61DAFB' },
  'angular': { name: 'Angular', icon: 'logo-angular', color: '#DD0031' },
  'vue.js': { name: 'Vue.js', icon: 'logo-vue', color: '#4FC08D' },
  'typescript': { name: 'TypeScript', icon: 'code', color: '#3178C6' },
  'swift': { name: 'Swift', icon: 'logo-apple', color: '#FA7343' },
  'kotlin': { name: 'Kotlin', icon: 'logo-android', color: '#7F52FF' },
  'go': { name: 'Go', icon: 'terminal', color: '#00ADD8' },
  'rust': { name: 'Rust', icon: 'cog', color: '#000000' },
  'ruby': { name: 'Ruby', icon: 'diamond', color: '#CC342D' },
  'scala': { name: 'Scala', icon: 'code', color: '#DC322F' },
  'docker': { name: 'Docker', icon: 'cube', color: '#2496ED' },
  'kubernetes': { name: 'Kubernetes', icon: 'git-network', color: '#326CE5' },
  'aws': { name: 'AWS', icon: 'cloud', color: '#FF9900' },
  'azure': { name: 'Azure', icon: 'cloud', color: '#0078D4' },
  'firebase': { name: 'Firebase', icon: 'flame', color: '#FFCA28' },
  'mongodb': { name: 'MongoDB', icon: 'leaf', color: '#47A248' },
  'postgresql': { name: 'PostgreSQL', icon: 'server', color: '#4169E1' },
  'redis': { name: 'Redis', icon: 'flash', color: '#DC382D' },
  'graphql': { name: 'GraphQL', icon: 'git-branch', color: '#E10098' },
  'tensorflow': { name: 'TensorFlow', icon: 'hardware-chip', color: '#FF6F00' },
  'pytorch': { name: 'PyTorch', icon: 'flame', color: '#EE4C2C' },
  'machine-learning': { name: 'Machine Learning', icon: 'hardware-chip', color: '#8B5CF6' },
  'deep-learning': { name: 'Deep Learning', icon: 'git-network', color: '#6366F1' },
  'data-science': { name: 'Data Science', icon: 'analytics', color: '#F59E0B' },
  'artificial-intelligence': { name: 'AI', icon: 'sparkles', color: '#8B5CF6' },
  'blockchain': { name: 'Blockchain', icon: 'link', color: '#121D33' },
  'flutter': { name: 'Flutter', icon: 'phone-portrait', color: '#02569B' },
  'next.js': { name: 'Next.js', icon: 'globe', color: '#000000' },
  'django': { name: 'Django', icon: 'server', color: '#092E20' },
  'spring-boot': { name: 'Spring Boot', icon: 'leaf', color: '#6DB33F' },
  'laravel': { name: 'Laravel', icon: 'code', color: '#FF2D20' },
  '.net': { name: '.NET', icon: 'code-slash', color: '#512BD4' },
  'linux': { name: 'Linux', icon: 'terminal', color: '#FCC624' },
  'git': { name: 'Git', icon: 'git-branch', color: '#F05032' },
  'elasticsearch': { name: 'Elasticsearch', icon: 'search', color: '#005571' },
  'apache-spark': { name: 'Apache Spark', icon: 'flash', color: '#E25A1C' },
};

// Cache for trending data
let trendingCache = {
  data: null,
  timestamp: 0,
  ttl: 3600000, // 1 hour cache
};

export const trendingService = {
  /**
   * Fetch trending technologies from Stack Overflow API
   * @param {number} limit - Number of technologies to return
   * @returns {Promise<Array>} Array of trending technologies with growth data
   */
  getTrendingTechnologies: async (limit = 15) => {
    try {
      // Check cache first
      const now = Date.now();
      if (trendingCache.data && (now - trendingCache.timestamp) < trendingCache.ttl) {
        console.log('Using cached trending data');
        return trendingCache.data.slice(0, limit);
      }

      console.log('Fetching fresh trending data from Stack Overflow...');

      // Fetch popular tags from Stack Overflow
      const response = await axios.get(
        'https://api.stackexchange.com/2.3/tags',
        {
          params: {
            order: 'desc',
            sort: 'popular',
            site: 'stackoverflow',
            pagesize: 50,
            filter: '!nNPvSNPI7A', // Include count field
          },
          timeout: 10000,
        }
      );

      if (!response.data?.items) {
        throw new Error('Invalid response from Stack Overflow API');
      }

      const tags = response.data.items;

      // Filter to technology-related tags first
      const techKeywords = ['python', 'javascript', 'java', 'react', 'node', 'android',
        'ios', 'sql', 'html', 'css', 'c#', 'c++', 'php', 'ruby', 'go', 'rust',
        'swift', 'kotlin', 'typescript', 'angular', 'vue', 'docker', 'kubernetes',
        'aws', 'azure', 'firebase', 'mongodb', 'postgresql', 'redis', 'graphql',
        'tensorflow', 'pytorch', 'machine-learning', 'deep-learning', 'flutter',
        'next', 'django', 'spring', 'laravel', '.net', 'linux', 'git', 'blockchain',
        'data-science', 'artificial-intelligence', 'elasticsearch', 'spark'];

      const filteredTags = tags
        .filter(tag => techKeywords.some(keyword => tag.name.toLowerCase().includes(keyword)))
        .sort((a, b) => b.count - a.count) // Sort by count descending
        .slice(0, limit);

      // Get max and min counts for better percentage distribution
      const maxCount = filteredTags[0]?.count || 1;
      const minCount = filteredTags[filteredTags.length - 1]?.count || 0;
      const countRange = maxCount - minCount || 1;

      const trendingTechs = filteredTags.map((tag, index) => {
        const config = TECH_TAG_CONFIG[tag.name.toLowerCase()] || {
          name: tag.name.charAt(0).toUpperCase() + tag.name.slice(1),
          icon: 'code',
          color: getColorForIndex(index),
        };

        // Calculate popularity with better distribution (100% to 40% range)
        // This ensures visible difference between rankings
        const normalizedScore = (tag.count - minCount) / countRange; // 0 to 1
        const popularity = Math.round(40 + (normalizedScore * 60)); // 40% to 100%

        return {
          name: config.name,
          tag: tag.name,
          icon: config.icon,
          color: config.color,
          count: tag.count,
          growth: popularity,
        };
      });

      // Update cache
      trendingCache = {
        data: trendingTechs,
        timestamp: now,
        ttl: 3600000,
      };

      return trendingTechs;
    } catch (error) {
      console.error('Error fetching trending technologies:', error.message);
      // Return fallback static data
      return getFallbackTrendingData(limit);
    }
  },

  /**
   * Clear the trending cache
   */
  clearCache: () => {
    trendingCache = { data: null, timestamp: 0, ttl: 3600000 };
  },
};

// Helper function to get colors for tags without config
function getColorForIndex(index) {
  const colors = [
    '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899',
    '#6366F1', '#14B8A6', '#F97316', '#84CC16', '#EF4444',
  ];
  return colors[index % colors.length];
}

// Fallback data when API is unavailable
function getFallbackTrendingData(limit) {
  const fallbackData = [
    { name: 'Python', tag: 'python', icon: 'logo-python', color: '#3776AB', growth: 100 },
    { name: 'JavaScript', tag: 'javascript', icon: 'logo-javascript', color: '#F7DF1E', growth: 95 },
    { name: 'Java', tag: 'java', icon: 'cafe', color: '#ED8B00', growth: 72 },
    { name: 'TypeScript', tag: 'typescript', icon: 'code', color: '#3178C6', growth: 68 },
    { name: 'React', tag: 'reactjs', icon: 'logo-react', color: '#61DAFB', growth: 65 },
    { name: 'Node.js', tag: 'node.js', icon: 'logo-nodejs', color: '#339933', growth: 58 },
    { name: 'AWS', tag: 'aws', icon: 'cloud', color: '#FF9900', growth: 52 },
    { name: 'Docker', tag: 'docker', icon: 'cube', color: '#2496ED', growth: 48 },
    { name: 'Machine Learning', tag: 'machine-learning', icon: 'hardware-chip', color: '#8B5CF6', growth: 45 },
    { name: 'PostgreSQL', tag: 'postgresql', icon: 'server', color: '#4169E1', growth: 42 },
    { name: 'MongoDB', tag: 'mongodb', icon: 'leaf', color: '#47A248', growth: 38 },
    { name: 'Kubernetes', tag: 'kubernetes', icon: 'git-network', color: '#326CE5', growth: 35 },
    { name: 'Flutter', tag: 'flutter', icon: 'phone-portrait', color: '#02569B', growth: 32 },
    { name: 'Go', tag: 'go', icon: 'terminal', color: '#00ADD8', growth: 28 },
    { name: 'Rust', tag: 'rust', icon: 'cog', color: '#DEA584', growth: 25 },
  ];
  return fallbackData.slice(0, limit);
}

export default api;
