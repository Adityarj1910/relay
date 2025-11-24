# 🚀 Relay Phase 1 — Detailed Roadmap

**Goal**: Build the minimum functional version of Relay with secure phone-number-based authentication and complete subscription management.

---

## 📋 Current Status

✅ **Completed**:
- MERN environment initialized
- Project structure created (client + server)
- User model created with phone number authentication
- Subscription model skeleton created
- Database connection setup
- Basic server configuration with Express, CORS, and dotenv
- Dependencies installed (bcryptjs, jsonwebtoken, mongoose, express, cors)

🔄 **In Progress**:
- Phase 1 implementation

---

## 🎯 Phase 1 Breakdown

### **Step 1: Complete Backend Models** ⏱️ 30 mins

#### 1.1 Finalize Subscription Model
**File**: `server/models/Subscription.js`

Add the following fields:
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  serviceName: { type: String, required: true },
  category: { 
    type: String, 
    enum: [
                "entertainment",
                "education",
                "utilities",
                "software",
                "health",
                "other",
            ],
    default: 'Other'
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  billingCycle: { 
    type: String, 
    enum: ['Monthly', 'Quarterly', 'Yearly'],
    required: true 
  },
  startDate: { type: Date, required: true },
  nextBillingDate: { type: Date },
  isActive: { type: Boolean, default: true },
  notes: { type: String },
  paymentMethod: { 
    type: String, 
    enum: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Other'],
    default: 'Other'
  }
}
```

**Timestamps**: Already enabled via `{ timestamps: true }`

---

### **Step 2: Build Authentication System** ⏱️ 2 hours

#### 2.1 Create Auth Middleware
**File**: `server/middleware/auth.js`

- JWT verification middleware
- Extract and verify token from `Authorization` header
- Attach user info to `req.user`
- Handle token expiration and invalid tokens

#### 2.2 Create Auth Controller
**File**: `server/controllers/authController.js`

Implement the following functions:

**`register`**:
- Validate input (name, username, phoneNumber, password)
- Check if phone number or username already exists
- Hash password using bcryptjs
- Create new user
- Generate JWT token
- Return user data (without password) + token

**`login`**:
- Validate input (phoneNumber, password)
- Find user by phone number
- Compare password using bcryptjs
- Generate JWT token
- Return user data (without password) + token

**`getProfile`**:
- Protected route (requires auth middleware)
- Return current user's profile

#### 2.3 Create Auth Routes
**File**: `server/routes/authRoutes.js`

- `POST /api/auth/register` → register
- `POST /api/auth/login` → login
- `GET /api/auth/profile` → getProfile (protected)

#### 2.4 Add Password Hashing to User Model
**File**: `server/models/user.js`

- Add pre-save hook to hash password before saving
- Add method to compare passwords

---

### **Step 3: Build Subscription CRUD APIs** ⏱️ 2 hours

#### 3.1 Create Subscription Controller
**File**: `server/controllers/subscriptionController.js`

Implement the following functions:

**`createSubscription`**:
- Validate input
- Calculate nextRenewalDate based on startDate and billingCycle
- Create subscription linked to authenticated user
- Return created subscription

**`getAllSubscriptions`**:
- Get all subscriptions for authenticated user
- Support filtering by category, isActive
- Sort by nextRenewalDate (ascending)
- Return subscriptions array

**`getSubscriptionById`**:
- Get single subscription by ID
- Verify subscription belongs to authenticated user
- Return subscription or 404

**`updateSubscription`**:
- Find subscription by ID
- Verify ownership
- Update fields
- Recalculate nextRenewalDate if startDate or billingCycle changed
- Return updated subscription

**`deleteSubscription`**:
- Find subscription by ID
- Verify ownership
- Delete subscription
- Return success message

#### 3.2 Create Subscription Routes
**File**: `server/routes/subscriptionRoutes.js`

All routes require authentication middleware:
- `POST /api/subscriptions` → createSubscription
- `GET /api/subscriptions` → getAllSubscriptions
- `GET /api/subscriptions/:id` → getSubscriptionById
- `PUT /api/subscriptions/:id` → updateSubscription
- `DELETE /api/subscriptions/:id` → deleteSubscription

#### 3.3 Update Server with Routes
**File**: `server/server.js`

- Import and use authRoutes
- Import and use subscriptionRoutes

---

### **Step 4: Build Frontend Foundation** ⏱️ 3 hours

#### 4.1 Setup React Router & Context
**Files**: 
- `client/src/App.jsx`
- `client/src/context/AuthContext.jsx`

**AuthContext** should provide:
- `user` state
- `token` state
- `login(phoneNumber, password)` function
- `register(userData)` function
- `logout()` function
- `isAuthenticated` boolean
- Persist token in localStorage
- Auto-load user on app mount if token exists

**App.jsx** routing:
- `/` → Home/Landing page
- `/register` → Register page
- `/login` → Login page
- `/dashboard` → Dashboard (protected)
- `/subscriptions/add` → Add Subscription (protected)
- `/subscriptions/edit/:id` → Edit Subscription (protected)

#### 4.2 Create API Service Layer
**File**: `client/src/services/api.js`

Create axios instance with:
- Base URL pointing to backend
- Interceptor to attach JWT token to requests
- Error handling interceptor

**Auth API functions**:
- `registerUser(userData)`
- `loginUser(phoneNumber, password)`
- `getUserProfile()`

**Subscription API functions**:
- `createSubscription(data)`
- `getAllSubscriptions()`
- `getSubscriptionById(id)`
- `updateSubscription(id, data)`
- `deleteSubscription(id)`

#### 4.3 Create Protected Route Component
**File**: `client/src/components/ProtectedRoute.jsx`

- Check if user is authenticated
- Redirect to `/login` if not authenticated
- Render children if authenticated

---

### **Step 5: Build Authentication UI** ⏱️ 2.5 hours

#### 5.1 Register Page
**File**: `client/src/pages/Register.jsx`

**Form fields**:
- Name (text input)
- Username (text input)
- Phone Number (10-digit validation)
- Email (optional)
- Password (min 6 chars, show/hide toggle)
- Confirm Password

**Features**:
- Form validation
- Error display
- Loading state during registration
- Redirect to dashboard on success
- Link to login page

#### 5.2 Login Page
**File**: `client/src/pages/Login.jsx`

**Form fields**:
- Phone Number (10-digit validation)
- Password (show/hide toggle)

**Features**:
- Form validation
- Error display
- Loading state during login
- Redirect to dashboard on success
- Link to register page

#### 5.3 Shared Components
**Files**:
- `client/src/components/Input.jsx` - Reusable input component
- `client/src/components/Button.jsx` - Reusable button component
- `client/src/components/FormError.jsx` - Error message display

---

### **Step 6: Build Subscription Management UI** ⏱️ 4 hours

#### 6.1 Dashboard Page
**File**: `client/src/pages/Dashboard.jsx`

**Features**:
- Welcome message with user's name
- Quick stats cards:
  - Total active subscriptions
  - Monthly spending
  - Upcoming renewals (next 7 days)
- "Add Subscription" button
- Subscription list component
- Logout button

#### 6.2 Subscription List Component
**File**: `client/src/components/SubscriptionList.jsx`

**Features**:
- Display all subscriptions in cards/table
- Show: service name, category, amount, billing cycle, next renewal date
- Filter by category
- Filter by active/inactive
- Sort options (by date, by amount)
- Edit button for each subscription
- Delete button with confirmation modal
- Empty state when no subscriptions
- Loading state while fetching

#### 6.3 Add Subscription Page
**File**: `client/src/pages/AddSubscription.jsx`

**Form fields**:
- Service Name (text input)
- Category (dropdown)
- Amount (number input)
- Currency (default INR, can be dropdown)
- Billing Cycle (dropdown: Monthly, Quarterly, Half-Yearly, Yearly)
- Start Date (date picker)
- Payment Method (dropdown)
- Notes (textarea, optional)

**Features**:
- Form validation
- Auto-calculate next renewal date preview
- Submit button with loading state
- Cancel button
- Success message and redirect to dashboard

#### 6.4 Edit Subscription Page
**File**: `client/src/pages/EditSubscription.jsx`

**Features**:
- Pre-populate form with existing subscription data
- Same form fields as Add Subscription
- Update button with loading state
- Cancel button
- Delete button with confirmation
- Success message and redirect to dashboard

#### 6.5 Subscription Card Component
**File**: `client/src/components/SubscriptionCard.jsx`

**Display**:
- Service name (prominent)
- Category badge
- Amount with currency
- Billing cycle
- Next renewal date (highlight if within 7 days)
- Days until renewal
- Edit and Delete icons/buttons

---

### **Step 7: Styling & UX Polish** ⏱️ 2 hours

#### 7.1 Design System Setup
**File**: `client/src/index.css`

Create design tokens:
- Color palette (primary, secondary, success, warning, danger, neutral shades)
- Typography scale
- Spacing scale
- Border radius values
- Shadow definitions
- Responsive breakpoints

#### 7.2 Component Styling

**Approach**: Choose one:
- **Option A**: Vanilla CSS with CSS modules
- **Option B**: Styled-components
- **Option C**: Tailwind CSS (if preferred)

**Key UI Elements**:
- Consistent button styles (primary, secondary, danger)
- Input field styles with focus states
- Card components with shadows
- Responsive navigation
- Loading spinners
- Toast notifications for success/error messages
- Modal for delete confirmation
- Mobile-responsive layout

#### 7.3 UX Enhancements
- Smooth transitions and animations
- Form field auto-focus
- Keyboard navigation support
- Accessible color contrast
- Loading states for all async operations
- Error boundaries for graceful error handling

---

### **Step 8: Testing & Validation** ⏱️ 1.5 hours

#### 8.1 Backend Testing

**Manual API Testing** (using Postman/Thunder Client):
- Test registration with valid/invalid data
- Test login with correct/incorrect credentials
- Test protected routes without token
- Test CRUD operations for subscriptions
- Test edge cases (duplicate phone numbers, invalid IDs, etc.)

#### 8.2 Frontend Testing

**Manual Testing Checklist**:
- [ ] Register new user successfully
- [ ] Login with registered user
- [ ] Token persists on page refresh
- [ ] Cannot access dashboard without login
- [ ] Add new subscription with all fields
- [ ] View subscription list
- [ ] Edit existing subscription
- [ ] Delete subscription with confirmation
- [ ] Filter and sort subscriptions
- [ ] Logout functionality
- [ ] Form validations work correctly
- [ ] Error messages display properly
- [ ] Responsive design on mobile/tablet/desktop

#### 8.3 Bug Fixes & Refinements
- Fix any bugs discovered during testing
- Improve error messages
- Optimize API calls
- Add loading states where missing

---

### **Step 9: Documentation & Deployment Prep** ⏱️ 1 hour

#### 9.1 Code Documentation
- Add comments to complex logic
- Document API endpoints in README
- Document environment variables needed

#### 9.2 README Updates
**File**: `README.md`

Include:
- Project description
- Features implemented in Phase 1
- Tech stack
- Installation instructions
- Environment variables setup
- How to run locally (client + server)
- API endpoints documentation
- Screenshots (optional but recommended)

#### 9.3 Environment Setup Documentation
**Files**: 
- `server/.env.example`
- `client/.env.example`

Document required environment variables:
- Backend: `MONGO_URI`, `JWT_SECRET`, `PORT`
- Frontend: `VITE_API_URL`

---

## 📊 Phase 1 Summary Checklist

### Backend ✅
- [ ] Subscription model completed
- [ ] User model with password hashing
- [ ] Auth middleware (JWT verification)
- [ ] Auth controller (register, login, getProfile)
- [ ] Auth routes
- [ ] Subscription controller (CRUD)
- [ ] Subscription routes
- [ ] Routes integrated in server.js

### Frontend ✅
- [ ] React Router setup
- [ ] AuthContext for state management
- [ ] API service layer with axios
- [ ] Protected route component
- [ ] Register page
- [ ] Login page
- [ ] Dashboard page
- [ ] Add Subscription page
- [ ] Edit Subscription page
- [ ] Subscription List component
- [ ] Subscription Card component
- [ ] Reusable UI components (Input, Button, etc.)
- [ ] Responsive styling
- [ ] Error handling & loading states

### Testing & Documentation ✅
- [ ] API endpoints tested
- [ ] Frontend user flows tested
- [ ] README updated
- [ ] Environment variables documented
- [ ] Code commented

---

## 🎯 Success Criteria

Phase 1 is complete when:

1. ✅ A user can register with phone number, username, and password
2. ✅ A user can login and receive a JWT token
3. ✅ Token persists across page refreshes
4. ✅ Authenticated users can create subscriptions
5. ✅ Authenticated users can view all their subscriptions
6. ✅ Authenticated users can edit their subscriptions
7. ✅ Authenticated users can delete their subscriptions
8. ✅ UI is clean, responsive, and user-friendly
9. ✅ All forms have proper validation
10. ✅ Error messages are clear and helpful

---

## ⏱️ Estimated Timeline

| Task | Time |
|------|------|
| Complete Backend Models | 30 mins |
| Build Authentication System | 2 hours |
| Build Subscription CRUD APIs | 2 hours |
| Build Frontend Foundation | 3 hours |
| Build Authentication UI | 2.5 hours |
| Build Subscription Management UI | 4 hours |
| Styling & UX Polish | 2 hours |
| Testing & Validation | 1.5 hours |
| Documentation & Deployment Prep | 1 hour |
| **Total** | **~18.5 hours** |

*This is focused development time. Actual time may vary based on debugging and learning.*

---

## 🚦 Next Steps After Phase 1

Once Phase 1 is complete, you'll have a solid MVP. You can then move to:

- **Phase 2**: Shared Subscriptions & Group System
- **Phase 3**: Reminder & Notification Engine
- **Phase 4**: Analytics & Dashboard Enhancements
- **Phase 5**: Smart Features & Final Polish

---

## 💡 Pro Tips

1. **Start with Backend**: Complete all backend APIs before moving to frontend
2. **Test as You Go**: Test each API endpoint immediately after creating it
3. **Reusable Components**: Build reusable UI components early to speed up development
4. **Git Commits**: Commit after completing each major step
5. **Environment Variables**: Never commit `.env` files to Git
6. **Error Handling**: Implement proper error handling from the start
7. **Mobile First**: Design for mobile first, then scale up to desktop
8. **User Feedback**: Add loading states and success/error messages for better UX

---

## 🔗 Useful Resources

- [JWT Authentication Best Practices](https://jwt.io/introduction)
- [Mongoose Schema Documentation](https://mongoosejs.com/docs/guide.html)
- [React Context API](https://react.dev/reference/react/useContext)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [React Router v6](https://reactrouter.com/en/main)

---

**Good luck building Relay! 🚀**
