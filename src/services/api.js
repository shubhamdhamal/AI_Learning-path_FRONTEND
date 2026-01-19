import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for API - reads from environment variable (EXPO_PUBLIC_ prefix required for Expo)
// For Codespaces: https://automatic-garbanzo-g9j56jwqw5w3ppq6-5000.app.github.dev
// For local: http://localhost:5000
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

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

export default api;
