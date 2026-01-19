import { useState, useEffect, useCallback } from 'react';
import useLearningPathStore from '../store/learningPathStore';

/**
 * Custom hook for polling task status during path generation
 */
export function useTaskPolling(taskId, pollInterval = 3000) {
  const { pollStatus, taskStatus, currentPath, error } = useLearningPathStore();
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!taskId) return;

    setIsPolling(true);
    
    const interval = setInterval(async () => {
      const result = await pollStatus();
      
      if (result.status === 'finished' || result.status === 'failed' || result.status === 'error') {
        setIsPolling(false);
        clearInterval(interval);
      }
    }, pollInterval);

    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [taskId, pollInterval]);

  return {
    isPolling,
    taskStatus,
    currentPath,
    error,
  };
}

/**
 * Custom hook for form validation
 */
export function useFormValidation(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback(() => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach((field) => {
      const rules = validationRules[field];
      const value = values[field];
      
      if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        newErrors[field] = rules.requiredMessage || `${field} is required`;
      } else if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[field] = rules.minLengthMessage || `Minimum ${rules.minLength} characters required`;
      } else if (rules.maxLength && value && value.length > rules.maxLength) {
        newErrors[field] = rules.maxLengthMessage || `Maximum ${rules.maxLength} characters allowed`;
      } else if (rules.pattern && value && !rules.pattern.test(value)) {
        newErrors[field] = rules.patternMessage || `Invalid format`;
      } else if (rules.custom) {
        const customError = rules.custom(value, values);
        if (customError) {
          newErrors[field] = customError;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);

  const setValue = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldTouched = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validate,
    reset,
    setValues,
  };
}

/**
 * Custom hook for debounced values
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for async operations with loading state
 */
export function useAsync(asyncFunction) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message || 'An error occurred');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  return {
    loading,
    error,
    data,
    execute,
  };
}
