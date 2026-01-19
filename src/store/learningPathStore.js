import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { learningPathService } from '../services/api';

const SAVED_PATHS_KEY_PREFIX = '@saved_learning_paths_';
const GUEST_USER_ID = 'guest';

// Helper to get storage key for a user
const getStorageKey = (userId) => `${SAVED_PATHS_KEY_PREFIX}${userId || GUEST_USER_ID}`;

const useLearningPathStore = create((set, get) => ({
  // State
  savedPaths: [],
  currentPath: null,
  taskId: null,
  taskStatus: null,
  isGenerating: false,
  error: null,
  isLoading: false,
  currentUserId: null,

  // Set current user (called when user logs in/out)
  setCurrentUser: (userId) => {
    set({ currentUserId: userId });
  },

  // Set current path directly
  setCurrentPath: (path) => set({ currentPath: path }),

  // Load saved paths from storage for a specific user
  loadSavedPaths: async (userId) => {
    try {
      set({ isLoading: true, currentUserId: userId });

      // Try to get from API first (for logged-in users)
      if (userId && userId !== GUEST_USER_ID) {
        try {
          const response = await learningPathService.getSavedPaths();
          if (response.paths) {
            set({ savedPaths: response.paths, isLoading: false });
            // Also persist to local storage as backup
            await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(response.paths));
            return;
          }
        } catch (apiError) {
          console.log('Could not load paths from API, using local storage');
        }
      }

      // Fallback to local storage (or primary for guest users)
      const storageKey = getStorageKey(userId);
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        set({ savedPaths: JSON.parse(stored), isLoading: false });
      } else {
        set({ savedPaths: [], isLoading: false });
      }
    } catch (error) {
      console.error('Error loading saved paths:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Save paths to local storage (as backup)
  persistPaths: async () => {
    try {
      const { savedPaths, currentUserId } = get();
      const storageKey = getStorageKey(currentUserId);
      await AsyncStorage.setItem(storageKey, JSON.stringify(savedPaths));
    } catch (error) {
      console.error('Error persisting paths:', error);
    }
  },

  // Generate a new learning path
  generatePath: async (formData) => {
    try {
      set({ isGenerating: true, error: null, taskId: null, taskStatus: null });

      const response = await learningPathService.generate(formData);

      // Check if the result was returned immediately (sync mode without Redis)
      if (response.status === 'finished' && response.result) {
        set({
          currentPath: response.result,
          taskId: response.task_id,
          taskStatus: 'finished',
          isGenerating: false
        });
        return { success: true, taskId: response.task_id, immediate: true, result: response.result };
      }

      // Async mode - need to poll for status
      set({ taskId: response.task_id, taskStatus: response.status });
      return { success: true, taskId: response.task_id, immediate: false };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to start generation';
      set({ error: errorMessage, isGenerating: false });
      return { success: false, error: errorMessage };
    }
  },

  // Poll for task status
  pollStatus: async () => {
    const { taskId } = get();
    if (!taskId) return { status: 'no_task' };

    try {
      const statusData = await learningPathService.checkStatus(taskId);
      set({ taskStatus: statusData.status });

      if (statusData.status === 'finished') {
        // Fetch the result
        const result = await learningPathService.getResult(taskId);
        set({
          currentPath: result,
          isGenerating: false,
          taskStatus: 'finished'
        });
        return { status: 'finished', result };
      } else if (statusData.status === 'failed') {
        set({
          error: statusData.error || 'Generation failed',
          isGenerating: false,
          taskStatus: 'failed'
        });
        return { status: 'failed', error: statusData.error };
      }

      return { status: statusData.status };
    } catch (error) {
      set({ error: error.message, isGenerating: false });
      return { status: 'error', error: error.message };
    }
  },

  // Save current path
  savePath: async () => {
    const { currentPath, savedPaths } = get();
    if (!currentPath) return { success: false, error: 'No path to save' };

    try {
      // Try to save to API
      let pathId = currentPath.id;
      try {
        const response = await learningPathService.savePath(currentPath);
        if (response.success) {
          pathId = response.path_id;
        }
      } catch (apiError) {
        console.log('Could not save to API, saving locally');
      }

      // Save locally
      const pathWithId = { ...currentPath, id: pathId, savedAt: new Date().toISOString() };
      const existingIndex = savedPaths.findIndex(p => p.id === pathId);

      let newPaths;
      if (existingIndex >= 0) {
        newPaths = [...savedPaths];
        newPaths[existingIndex] = pathWithId;
      } else {
        newPaths = [pathWithId, ...savedPaths];
      }

      set({ savedPaths: newPaths, currentPath: pathWithId });
      get().persistPaths();

      return { success: true, pathId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete a path
  deletePath: async (pathId) => {
    try {
      const { savedPaths } = get();

      // Try to delete from API
      try {
        await learningPathService.deletePath(pathId);
      } catch (apiError) {
        console.log('Could not delete from API');
      }

      // Delete locally
      const newPaths = savedPaths.filter(p => p.id !== pathId);
      set({ savedPaths: newPaths });
      get().persistPaths();

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Set current path
  setCurrentPath: (path) => {
    set({ currentPath: path });
  },

  // Update milestone completion
  updateMilestoneCompletion: async (pathId, milestoneIndex, completed) => {
    const { savedPaths } = get();
    const pathIndex = savedPaths.findIndex(p => p.id === pathId);

    if (pathIndex < 0) return { success: false, error: 'Path not found' };

    try {
      // Update in API
      try {
        await learningPathService.updateMilestone(pathId, milestoneIndex, completed);
      } catch (apiError) {
        console.log('Could not update milestone in API');
      }

      // Update locally
      const newPaths = [...savedPaths];
      if (!newPaths[pathIndex].completedMilestones) {
        newPaths[pathIndex].completedMilestones = {};
      }
      newPaths[pathIndex].completedMilestones[milestoneIndex] = completed;

      set({ savedPaths: newPaths });
      get().persistPaths();

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Reset generation state
  resetGeneration: () => {
    set({
      taskId: null,
      taskStatus: null,
      isGenerating: false,
      error: null,
      currentPath: null,
    });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset state when switching users (doesn't delete stored data)
  resetForUserSwitch: () => {
    set({
      savedPaths: [],
      currentPath: null,
      taskId: null,
      taskStatus: null,
      isGenerating: false,
      error: null,
      isLoading: false,
      currentUserId: null,
    });
  },
}));

export default useLearningPathStore;
