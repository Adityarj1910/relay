/**
 * API Service Usage Examples
 * 
 * This file demonstrates how to use the api.js service layer
 * in your components and services.
 */

import api, { apiService } from './api';

// ============================================
// Example 1: Using the default api instance
// ============================================

// GET request
export const getSubscriptions = async () => {
    try {
        const response = await api.get('/subscriptions');
        return response.data; // Returns the data from response
    } catch (error) {
        console.error('Failed to fetch subscriptions:', error.message);
        throw error;
    }
};

// POST request
export const createSubscription = async (subscriptionData) => {
    try {
        const response = await api.post('/subscriptions', subscriptionData);
        return response.data;
    } catch (error) {
        console.error('Failed to create subscription:', error.message);
        throw error;
    }
};

// PUT request
export const updateSubscription = async (id, subscriptionData) => {
    try {
        const response = await api.put(`/subscriptions/${id}`, subscriptionData);
        return response.data;
    } catch (error) {
        console.error('Failed to update subscription:', error.message);
        throw error;
    }
};

// DELETE request
export const deleteSubscription = async (id) => {
    try {
        const response = await api.delete(`/subscriptions/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete subscription:', error.message);
        throw error;
    }
};

// ============================================
// Example 2: Using the apiService helper
// ============================================

export const getUserProfile = async () => {
    try {
        const response = await apiService.get('/users/profile');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ============================================
// Example 3: In a React Component
// ============================================

/*
import { useState, useEffect } from 'react';
import api from '../services/api';

function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/subscriptions');
        setSubscriptions(response.data.data); // Adjust based on your API response structure
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {subscriptions.map(sub => (
        <div key={sub._id}>{sub.name}</div>
      ))}
    </div>
  );
}
*/

// ============================================
// Example 4: With Custom Headers
// ============================================

export const uploadFile = async (formData) => {
    try {
        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ============================================
// Example 5: With Query Parameters
// ============================================

export const searchSubscriptions = async (searchTerm, filters = {}) => {
    try {
        const response = await api.get('/subscriptions/search', {
            params: {
                q: searchTerm,
                ...filters,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ============================================
// Benefits of using this API service:
// ============================================
// 1. Automatic JWT token attachment - no need to manually add headers
// 2. Centralized error handling - consistent error messages
// 3. Automatic redirect on 401 (unauthorized)
// 4. Base URL configuration - no need to repeat the full URL
// 5. Timeout handling - prevents hanging requests
// 6. Easy to mock for testing
