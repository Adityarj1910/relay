# Shared Components Usage Guide

This guide demonstrates how to use the reusable components in your Relay MVP application.

---

## 📦 Available Components

1. **Input** - Reusable input field with label, error handling, and validation states
2. **Button** - Reusable button with variants, loading states, and hover effects
3. **FormError** - Consistent error/success/warning message display

---

## 🔤 Input Component

### Basic Usage

```jsx
import Input from '../components/Input';

<Input
  type="text"
  name="username"
  value={formData.username}
  onChange={handleChange}
  label="Username"
  placeholder="Enter your username"
  required
/>
```

### With Error

```jsx
<Input
  type="email"
  name="email"
  value={formData.email}
  onChange={handleChange}
  label="Email"
  placeholder="your.email@example.com"
  error={errors.email}
  required
/>
```

### Phone Number Input

```jsx
<Input
  type="tel"
  name="phoneNumber"
  value={formData.phoneNumber}
  onChange={handleChange}
  label="Phone Number"
  placeholder="10-digit phone number"
  maxLength={10}
  error={errors.phoneNumber}
  required
/>
```

### Password with Autocomplete

```jsx
<Input
  type="password"
  name="password"
  value={formData.password}
  onChange={handleChange}
  label="Password"
  placeholder="At least 6 characters"
  autoComplete="current-password"
  error={errors.password}
  required
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | "text" | Input type (text, email, tel, password, etc.) |
| `name` | string | required | Input name attribute |
| `value` | string | required | Input value |
| `onChange` | function | required | Change handler |
| `placeholder` | string | "" | Placeholder text |
| `label` | string | "" | Label text |
| `error` | string | "" | Error message to display |
| `required` | boolean | false | Whether field is required |
| `maxLength` | number | - | Maximum length |
| `autoComplete` | string | - | Autocomplete attribute |
| `disabled` | boolean | false | Whether input is disabled |

---

## 🔘 Button Component

### Primary Button (Default)

```jsx
import Button from '../components/Button';

<Button type="submit" fullWidth>
  Login
</Button>
```

### With Loading State

```jsx
<Button 
  type="submit" 
  loading={isLoading}
  disabled={isLoading}
  fullWidth
>
  {isLoading ? "Creating Account..." : "Register"}
</Button>
```

### Button Variants

```jsx
{/* Primary */}
<Button variant="primary" onClick={handleSave}>
  Save
</Button>

{/* Secondary */}
<Button variant="secondary" onClick={handleCancel}>
  Cancel
</Button>

{/* Danger */}
<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>

{/* Success */}
<Button variant="success" onClick={handleSubmit}>
  Submit
</Button>

{/* Outline */}
<Button variant="outline" onClick={handleAction}>
  Learn More
</Button>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | "button" | Button type (button, submit, reset) |
| `variant` | string | "primary" | Style variant (primary, secondary, danger, success, outline) |
| `onClick` | function | - | Click handler |
| `disabled` | boolean | false | Whether button is disabled |
| `loading` | boolean | false | Whether button shows loading state |
| `fullWidth` | boolean | false | Whether button takes full width |
| `children` | node | required | Button content |

---

## ⚠️ FormError Component

### Error Message

```jsx
import FormError from '../components/FormError';

<FormError 
  message={apiError} 
  type="error"
/>
```

### Success Message

```jsx
<FormError 
  message="Registration successful! Please login."
  type="success"
/>
```

### Warning Message

```jsx
<FormError 
  message="Your session will expire in 5 minutes."
  type="warning"
/>
```

### Info Message

```jsx
<FormError 
  message="Please verify your email address."
  type="info"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | string | - | Message to display (returns null if empty) |
| `type` | string | "error" | Message type (error, success, warning, info) |

---

## 📝 Complete Form Example

### Before (without shared components)

```jsx
<form onSubmit={handleSubmit}>
  <div style={{ marginBottom: "1.5rem" }}>
    <label style={{ display: "block", marginBottom: "0.5rem" }}>
      Username <span style={{ color: "red" }}>*</span>
    </label>
    <input
      type="text"
      name="username"
      value={formData.username}
      onChange={handleChange}
      style={{
        width: "100%",
        padding: "0.75rem",
        border: errors.username ? "1px solid #c33" : "1px solid #ddd",
        borderRadius: "4px",
      }}
    />
    {errors.username && (
      <span style={{ color: "#c33", fontSize: "0.875rem" }}>
        {errors.username}
      </span>
    )}
  </div>

  <button
    type="submit"
    disabled={loading}
    style={{
      width: "100%",
      padding: "0.75rem",
      backgroundColor: loading ? "#ccc" : "#007bff",
      color: "white",
      border: "none",
      borderRadius: "4px",
    }}
  >
    {loading ? "Loading..." : "Submit"}
  </button>
</form>
```

### After (with shared components)

```jsx
import Input from '../components/Input';
import Button from '../components/Button';
import FormError from '../components/FormError';

<form onSubmit={handleSubmit}>
  <FormError message={apiError} type="error" />
  
  <Input
    type="text"
    name="username"
    value={formData.username}
    onChange={handleChange}
    label="Username"
    error={errors.username}
    required
  />

  <Button type="submit" loading={loading} fullWidth>
    Submit
  </Button>
</form>
```

**Benefits:**
- ✅ 70% less code
- ✅ Consistent styling
- ✅ Easy to maintain
- ✅ Reusable across all forms

---

## 🎨 Component Features

### Input
- ✅ Label with required indicator
- ✅ Error state with red border
- ✅ Focus/blur effects (blue border on focus)
- ✅ Disabled state styling
- ✅ Consistent error message display

### Button
- ✅ 5 variants with different colors
- ✅ Loading spinner animation
- ✅ Hover effects
- ✅ Disabled state
- ✅ Full-width option

### FormError
- ✅ 4 message types with distinct colors
- ✅ Icons for visual clarity
- ✅ ARIA role for accessibility
- ✅ Auto-hides when message is empty

---

## 🚀 Next Steps

You can now refactor existing forms to use these components:
1. Update Login page
2. Update Register page  
3. Update AddSubscription page
4. Update EditSubscription page

This will make your codebase cleaner and more maintainable!
