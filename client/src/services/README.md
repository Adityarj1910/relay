# API Service Layer Documentation

## Overview

The API service layer provides a centralized, configured axios instance for making HTTP requests to the backend API. It includes automatic JWT token attachment and global error handling.

---

## File Structure

```
client/src/services/
├── api.js              # Main axios instance with interceptors
└── api.examples.js     # Usage examples and patterns
```

---

## Features

### ✅ Automatic JWT Token Attachment
- Reads token from `localStorage`
- Automatically adds `Authorization: Bearer <token>` header to all requests
- No need to manually add headers in every API call

### ✅ Global Error Handling
- **401 Unauthorized**: Automatically clears token and redirects to login
- **403 Forbidden**: Logs access denied errors
- **404 Not Found**: Logs resource not found errors
- **500 Server Error**: Logs server errors
- **Network Errors**: Handles no response scenarios

### ✅ Base URL Configuration
- Uses `VITE_API_URL` from environment variables
- Falls back to `http://localhost:5001/api/v1`
- No need to repeat full URLs in every request

### ✅ Request Timeout
- 10-second timeout prevents hanging requests
- Configurable per request if needed

---

## Usage

### Basic Import

```javascript
import api from '../services/api';
```

### GET Request

```javascript
const response = await api.get('/subscriptions');
const subscriptions = response.data.data;
```

### POST Request

```javascript
const response = await api.post('/subscriptions', {
  name: 'Netflix',
  price: 15.99,
  billingCycle: 'monthly'
});
```

### PUT Request

```javascript
const response = await api.put(`/subscriptions/${id}`, updatedData);
```

### DELETE Request

```javascript
const response = await api.delete(`/subscriptions/${id}`);
```

---

## Updated Files

The following files have been updated to use the API service:

### ✅ AuthContext.jsx
- `login()` - Uses `api.post('/users/login')`
- `register()` - Uses `api.post('/users/register')`
- `logout()` - Uses `api.post('/users/logout')`
- `fetchUserData()` - Uses `api.get('/users/profile')`

### ✅ AddSubscription.jsx
- `handleSubmit()` - Uses `api.post('/subscriptions')`

### ✅ EditSubscription.jsx
- `fetchSubscription()` - Uses `api.get('/subscriptions/:id')`
- `handleSubmit()` - Uses `api.put('/subscriptions/:id')`

---

## Benefits

| Before (fetch) | After (axios + api service) |
|----------------|----------------------------|
| Manual headers every time | Automatic token attachment |
| Repeat API URL everywhere | Centralized base URL |
| Manual error handling | Global error handling |
| Verbose code | Clean, concise code |
| No timeout handling | Built-in timeout |
| Manual JSON parsing | Automatic JSON parsing |

---

## Code Comparison

### Before (using fetch):
```javascript
const response = await fetch(`${API_URL}/subscriptions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(formData),
});

const data = await response.json();

if (!response.ok) {
  throw new Error(data.message || 'Failed');
}
```

### After (using api service):
```javascript
const response = await api.post('/subscriptions', formData);
// That's it! ✨
```

---

## Error Handling

Errors are automatically handled by the response interceptor:

```javascript
try {
  const response = await api.get('/subscriptions');
  // Handle success
} catch (error) {
  // error.message contains user-friendly message
  // error.status contains HTTP status code
  console.error(error.message);
}
```

---

## Configuration

### Environment Variables

Create `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:5001/api/v1
```

### Custom Headers (if needed)

```javascript
const response = await api.post('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

### Query Parameters

```javascript
const response = await api.get('/subscriptions', {
  params: {
    category: 'streaming',
    limit: 10,
  },
});
// Calls: /subscriptions?category=streaming&limit=10
```

---

## Next Steps

1. ✅ API service created and configured
2. ✅ All authentication calls updated
3. ✅ Subscription CRUD operations updated
4. 🔄 Future: Add more specific API service functions as needed

---

## Dependencies

- **axios**: `^1.7.9` (installed)

---

## Security Notes

- Token is stored in `localStorage` (consider `httpOnly` cookies for production)
- Automatic logout on 401 prevents unauthorized access
- HTTPS should be used in production
- Token expiry is handled by backend and interceptor
