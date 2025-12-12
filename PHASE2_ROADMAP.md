# 🚀 Relay Phase 2 — Shared Subscriptions (Subscription-Centric)

**Goal**: Enable users to share subscription costs with friends/family directly from their subscriptions, with automatic group creation and settle-up tracking.

---

## 📋 Phase 1 Completion Status

✅ **Completed Features**:
- User authentication (phone-number-based)
- JWT token system (access & refresh tokens)
- Subscription CRUD operations
- User profile management
- Basic API structure

---

## 🎯 Phase 2 Overview - NEW LOGIC

**Subscription-Centric Approach**:
- Users create personal subscriptions (Phase 1)
- **Host can share any subscription** by inviting friends/family
- **Subscription Group is auto-created** when first member is invited
- Only **2 roles**: Host (creator) and Members
- Each member's share **automatically appears in their monthly subscriptions**
- **Settle Up feature** shows who owes what across all shared subscriptions

### Key Differences from Original Plan:
❌ No standalone group creation  
❌ No group-first approach  
✅ Subscription-first, group auto-created  
✅ Simpler role system (Host/Member only)  
✅ Settle-up tracking integrated  

---

## 🗂️ Phase 2 Breakdown

### **Step 1: Design Updated Models** ⏱️ 1 hour

#### 1.1 Update Subscription Model
**File**: `server/models/Subscription.js`

**Add fields**:
```javascript
{
  // Existing fields...
  
  // New fields for sharing
  isShared: { type: Boolean, default: false },
  hostUserId: { type: Schema.Types.ObjectId, ref: 'User' }, // Original creator
  sharedWith: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['host', 'member'], default: 'member' },
    shareAmount: { type: Number }, // Individual's share
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    joinedAt: { type: Date, default: Date.now },
    invitationStatus: { 
      type: String, 
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  splitType: { 
    type: String, 
    enum: ['equal', 'custom', 'percentage'], 
    default: 'equal' 
  },
  totalParticipants: { type: Number, default: 1 }
}
```

**Key Concept**:
- When subscription is created, `isShared: false`
- When host invites first person, `isShared: true` and `sharedWith` array is populated
- No separate "Group" collection needed!

#### 1.2 Create Subscription Invitation Model
**File**: `server/models/SubscriptionInvitation.js`

**Schema Fields**:
```javascript
{
  subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
  hostUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  invitedUserPhone: { type: String, required: true },
  invitedUserId: { type: Schema.Types.ObjectId, ref: 'User' }, // Filled when phone matches
  shareAmount: { type: Number, required: true }, // Their assigned share
  message: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined', 'expired'], 
    default: 'pending' 
  },
  expiresAt: { type: Date, required: true },
  sentAt: { type: Date, default: Date.now },
  respondedAt: { type: Date }
}
```

#### 1.3 Create Settle Up Model (for tracking balances)
**File**: `server/models/SettleUp.js`

**Schema Fields**:
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
  amount: { type: Number, required: true }, // Their share
  isPaid: { type: Boolean, default: false },
  dueDate: { type: Date }, // Next billing date
  paidAt: { type: Date },
  hostUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Who they owe to
  billingCycle: { type: String },
  createdAt: { type: Date, default: Date.now }
}
```

**Purpose**: Track individual debt/credit across all shared subscriptions

---

### **Step 2: Build Share Subscription APIs** ⏱️ 3 hours

#### 2.1 Update Subscription Controller
**File**: `server/controllers/subscriptionController.js`

**New Functions**:

**`shareSubscription`** (Host only):
```javascript
// POST /api/v1/subscriptions/:id/share
// Body: { phoneNumbers: [...], splitType, customSplits }

- Verify user owns the subscription
- If first share, set isShared: true
- Calculate shares based on splitType
- Create invitations for each phone number
- Update subscription.sharedWith array
- Return invitation details
```

**`getSharedSubscriptionDetails`**:
```javascript
// GET /api/v1/subscriptions/:id/shared-details

- Get subscription with populated sharedWith
- Show all members and their payment status
- Show host details
- Calculate total paid vs unpaid
- Return detailed breakdown
```

**`updateMemberShare`** (Host only):
```javascript
// PUT /api/v1/subscriptions/:id/members/:userId/share
// Body: { shareAmount }

- Verify requester is host
- Update specific member's shareAmount
- Recalculate if needed
- Return updated subscription
```

**`removeMemberFromSubscription`** (Host only):
```javascript
// DELETE /api/v1/subscriptions/:id/members/:userId

- Verify requester is host
- Remove member from sharedWith array
- Recalculate shares if using equal split
- Notify removed member
- Return success message
```

**`markMyShareAsPaid`** (Member or Host):
```javascript
// PUT /api/v1/subscriptions/:id/mark-paid
// Body: { userId } (optional, defaults to req.user._id)

- Find user in sharedWith array
- Update isPaid: true, paidAt: Date.now()
- Create/update SettleUp record
- Return success message
```

#### 2.2 Add New Routes
**File**: `server/routes/subscription.routes.js`

```javascript
// Share subscription routes
subscriptionRouter.route("/:id/share").post(verifyJWT, shareSubscription);
subscriptionRouter.route("/:id/shared-details").get(verifyJWT, getSharedSubscriptionDetails);
subscriptionRouter.route("/:id/members/:userId/share").put(verifyJWT, updateMemberShare);
subscriptionRouter.route("/:id/members/:userId").delete(verifyJWT, removeMemberFromSubscription);
subscriptionRouter.route("/:id/mark-paid").put(verifyJWT, markMyShareAsPaid);
```

---

### **Step 3: Build Invitation System** ⏱️ 2 hours

#### 3.1 Create Invitation Controller
**File**: `server/controllers/invitationController.js`

**Functions**:

**`getMyInvitations`**:
```javascript
// GET /api/v1/invitations/my

- Find all invitations where invitedUserPhone matches req.user.phoneNumber
- Or invitedUserId matches req.user._id
- Filter status: 'pending'
- Populate subscription details
- Return invitations array
```

**`acceptInvitation`**:
```javascript
// PUT /api/v1/invitations/:id/accept

- Find invitation
- Verify it's for the authenticated user
- Update invitation status: 'accepted'
- Add user to subscription.sharedWith array
- Update invitedUserId if not set
- Create SettleUp record for this user
- Add to user's personal subscriptions view
- Return success message
```

**`declineInvitation`**:
```javascript
// PUT /api/v1/invitations/:id/decline

- Find invitation
- Verify it's for the authenticated user
- Update status: 'declined'
- Notify host
- Return success message
```

**`cancelInvitation`** (Host only):
```javascript
// DELETE /api/v1/invitations/:id

- Verify requester is the host
- Delete or mark as cancelled
- Return success message
```

#### 3.2 Create Invitation Routes
**File**: `server/routes/invitationRoutes.js`

```javascript
invitationRouter.route("/my").get(verifyJWT, getMyInvitations);
invitationRouter.route("/:id/accept").put(verifyJWT, acceptInvitation);
invitationRouter.route("/:id/decline").put(verifyJWT, declineInvitation);
invitationRouter.route("/:id").delete(verifyJWT, cancelInvitation);
```

---

### **Step 4: Build Settle Up Feature** ⏱️ 2.5 hours

#### 4.1 Create Settle Up Controller
**File**: `server/controllers/settleUpController.js`

**Functions**:

**`getMySettleUpSummary`**:
```javascript
// GET /api/v1/settle-up/summary

Goal: Show what user owes and what they're owed

Response format:
{
  totalOwed: 1200,        // What you owe to others
  totalOwedToYou: 800,    // What others owe to you
  netBalance: -400,       // Negative = you owe, Positive = owed to you
  
  owedByYou: [
    {
      hostUser: { name, phone },
      subscriptionName: "Netflix Premium",
      amount: 300,
      dueDate: "2024-02-15",
      isPaid: false
    }
  ],
  
  owedToYou: [  // Only if you're a host
    {
      memberUser: { name, phone },
      subscriptionName: "Spotify Family",
      amount: 200,
      dueDate: "2024-02-10",
      isPaid: false
    }
  ]
}

Implementation:
- Find all subscriptions where user is a member (not host)
- Calculate unpaid amounts → owedByYou
- Find all subscriptions where user is host
- Get all unpaid members → owedToYou
- Calculate totals and net balance
```

**`getSubscriptionSettlement`**:
```javascript
// GET /api/v1/settle-up/subscription/:id

- Get specific subscription's settlement details
- Show all members and their payment status
- Show who paid, who didn't
- Calculate totals
- Return detailed breakdown
```

**`settleUpWithHost`**:
```javascript
// POST /api/v1/settle-up/subscription/:id/settle
// Body: { paymentMethod, transactionId }

- Mark user's share as paid
- Update SettleUp record
- Update subscription.sharedWith isPaid status
- Notify host
- Return success message
```

**`remindMember`** (Host only):
```javascript
// POST /api/v1/settle-up/subscription/:id/remind/:userId

- Verify requester is host
- Send reminder notification to member
- Log reminder sent
- Return success message
```

#### 4.2 Create Settle Up Routes
**File**: `server/routes/settleUpRoutes.js`

```javascript
settleUpRouter.route("/summary").get(verifyJWT, getMySettleUpSummary);
settleUpRouter.route("/subscription/:id").get(verifyJWT, getSubscriptionSettlement);
settleUpRouter.route("/subscription/:id/settle").post(verifyJWT, settleUpWithHost);
settleUpRouter.route("/subscription/:id/remind/:userId").post(verifyJWT, remindMember);
```

---

### **Step 5: Build Split Calculation Utilities** ⏱️ 1 hour

#### 5.1 Create Split Calculator
**File**: `server/utils/splitCalculator.js`

**Functions**:

```javascript
// Calculate equal split
export const calculateEqualSplit = (totalAmount, memberCount) => {
  const sharePerPerson = totalAmount / memberCount;
  return sharePerPerson;
};

// Validate custom splits
export const validateCustomSplits = (customSplits, totalAmount) => {
  const sum = customSplits.reduce((acc, split) => acc + split.amount, 0);
  if (sum !== totalAmount) {
    throw new Error(`Splits (${sum}) don't add up to total (${totalAmount})`);
  }
  return true;
};

// Calculate percentage splits
export const calculatePercentageSplits = (totalAmount, percentages) => {
  const totalPercent = percentages.reduce((acc, p) => acc + p.percentage, 0);
  if (totalPercent !== 100) {
    throw new Error(`Percentages (${totalPercent}%) don't add up to 100%`);
  }
  
  return percentages.map(p => ({
    userId: p.userId,
    amount: (totalAmount * p.percentage) / 100,
    percentage: p.percentage
  }));
};

// Recalculate splits when member leaves (equal split only)
export const recalculateAfterMemberRemoved = (totalAmount, remainingMembers) => {
  return calculateEqualSplit(totalAmount, remainingMembers);
};
```

---

### **Step 6: Update User's Personal Subscription View** ⏱️ 1.5 hours

#### 6.1 Update Get All Subscriptions
**File**: `server/controllers/subscriptionController.js`

**Modify `getAllSubscription`**:

```javascript
const getAllSubscription = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Get user's own subscriptions
  const ownSubscriptions = await Subscription.find({ 
    userId,
    isShared: false 
  }).sort({ createdAt: -1 });
  
  // Get subscriptions where user is the host
  const hostedSharedSubscriptions = await Subscription.find({ 
    userId,
    isShared: true 
  }).sort({ createdAt: -1 });
  
  // Get subscriptions where user is a member
  const memberSubscriptions = await Subscription.find({
    isShared: true,
    'sharedWith.userId': userId,
    'sharedWith.invitationStatus': 'accepted'
  }).sort({ createdAt: -1 });
  
  // Extract member's share amount for each
  const memberSubsWithShare = memberSubscriptions.map(sub => {
    const memberData = sub.sharedWith.find(
      m => m.userId.toString() === userId.toString()
    );
    
    return {
      ...sub.toObject(),
      myShare: memberData.shareAmount,
      myPaymentStatus: memberData.isPaid,
      role: 'member'
    };
  });
  
  // Calculate total monthly cost
  const totalOwn = ownSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const totalHosted = hostedSharedSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const totalMember = memberSubsWithShare.reduce((sum, sub) => sum + sub.myShare, 0);
  
  return res.status(200).json(new ApiResponse(200, {
    ownSubscriptions,
    hostedSharedSubscriptions,
    memberSubscriptions: memberSubsWithShare,
    summary: {
      totalOwnCost: totalOwn,
      totalHostedCost: totalHosted,
      totalMemberCost: totalMember,
      grandTotal: totalOwn + totalHosted + totalMember
    }
  }, "Subscriptions fetched successfully"));
});
```

**Key Point**: Member subscriptions now show up in user's personal list with their share amount!

---

### **Step 7: Frontend Components (Optional)** ⏱️ 5 hours

#### 7.1 Subscription Card Enhancement
**File**: `client/src/components/SubscriptionCard.jsx`

**Add features**:
- Show "Shared" badge if `isShared: true`
- Show member count
- Show "Host" or "Member" badge
- Click to open Subscription Details modal

#### 7.2 Subscription Details Modal
**File**: `client/src/components/SubscriptionDetailsModal.jsx`

**For Host**:
- Show subscription info
- **"Add Members" button** → Opens invite modal
- List all members with their:
  - Name, phone
  - Share amount
  - Payment status (Paid ✅ / Unpaid ❌)
  - Edit share button
  - Remove member button
- Total paid vs unpaid summary

**For Member**:
- Show subscription info (read-only)
- Show your share amount
- **"Mark as Paid" button**
- Show all other members (names only)
- Show host info

#### 7.3 Invite Members Modal
**File**: `client/src/components/InviteMembersModal.jsx`

**Features**:
- Input phone numbers (comma-separated or multi-input)
- Select split type: Equal / Custom / Percentage
- If custom: Show input for each member's amount
- If percentage: Show percentage slider for each
- Preview split calculation
- Send invitations button

#### 7.4 Invitations Page
**File**: `client/src/pages/Invitations.jsx`

**Show**:
- List of pending invitations
- Each card shows:
  - Subscription name, amount
  - Host name, phone
  - Your share amount
  - Accept / Decline buttons

#### 7.5 Settle Up Page
**File**: `client/src/pages/SettleUp.jsx`

**Layout**:

```
┌─────────────────────────────────────┐
│         Settle Up Summary           │
├─────────────────────────────────────┤
│  Net Balance: -₹400                 │
│  (You owe ₹400)                     │
├─────────────────────────────────────┤
│  Owed by You: ₹1,200               │
│  • Netflix Premium - ₹300 (Host: John)│
│  • Spotify Family - ₹200 (Host: Sarah)│
│    [Mark as Paid]                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Owed to You: ₹800                 │
│  • Disney+ - ₹400 (Member: Mike)   │
│    Status: Unpaid [Send Reminder]   │
│  • Prime Video - ₹400 (Member: Emma)│
│    Status: Paid ✅                  │
└─────────────────────────────────────┘
```

---

### **Step 8: Testing & Edge Cases** ⏱️ 2 hours

#### Test Scenarios:

**Subscription Sharing**:
- [ ] Host shares subscription with valid phone numbers
- [ ] Host shares with invalid/non-existent phone numbers
- [ ] Equal split calculation is correct
- [ ] Custom splits validation works
- [ ] Percentage splits validation works
- [ ] Can't share if not the host

**Invitations**:
- [ ] User receives invitations for their phone number
- [ ] Accept invitation adds to their subscriptions
- [ ] Decline invitation removes it
- [ ] Expired invitations are handled
- [ ] Can't accept invitation twice

**Member Management**:
- [ ] Host can remove members
- [ ] Host can update member shares
- [ ] Non-host can't manage members
- [ ] Removing member recalculates equal split

**Payment Tracking**:
- [ ] Member can mark their share as paid
- [ ] Host can see who paid
- [ ] Settle-up summary is accurate
- [ ] Net balance calculation is correct

**Edge Cases**:
- [ ] What if host deletes subscription? (Remove for all members)
- [ ] What if member leaves? (Recalculate splits)
- [ ] Subscription renewal creates new SettleUp records
- [ ] Member's share appears in their monthly total

---

## 📊 Updated Data Flow

### **Subscription Sharing Flow**:
```
1. Host creates subscription (Phase 1) → isShared: false
2. Host clicks "Share" → Opens invite modal
3. Host enters phone numbers + split type
4. System creates invitations
5. System updates subscription: isShared: true
6. Invited users see invitations in app
7. User accepts → Added to subscription.sharedWith
8. Member's share appears in their subscription list
9. SettleUp record created for tracking
```

### **Settle Up Flow**:
```
1. Member views Settle Up page
2. Sees all subscriptions they owe on
3. Clicks "Mark as Paid" on a subscription
4. Host sees updated payment status
5. Net balance recalculates
```

---

## 📋 Complete Checklist

### Models ✅
- [ ] Updated `Subscription` model with sharing fields
- [ ] Created `SubscriptionInvitation` model
- [ ] Created `SettleUp` model

### Controllers ✅
- [ ] `shareSubscription` function
- [ ] `getSharedSubscriptionDetails` function
- [ ] `updateMemberShare` function
- [ ] `removeMemberFromSubscription` function
- [ ] `markMyShareAsPaid` function
- [ ] `getMyInvitations` function
- [ ] `acceptInvitation` function
- [ ] `declineInvitation` function
- [ ] `cancelInvitation` function
- [ ] `getMySettleUpSummary` function
- [ ] `getSubscriptionSettlement` function
- [ ] `settleUpWithHost` function
- [ ] `remindMember` function

### Routes ✅
- [ ] Subscription sharing routes
- [ ] Invitation routes
- [ ] Settle-up routes

### Utilities ✅
- [ ] Split calculator functions
- [ ] Validation functions

### Frontend (Optional) ✅
- [ ] Enhanced Subscription Card
- [ ] Subscription Details Modal
- [ ] Invite Members Modal
- [ ] Invitations Page
- [ ] Settle Up Page

### Testing ✅
- [ ] All sharing flows tested
- [ ] Invitation flow tested
- [ ] Payment tracking tested
- [ ] Split calculations verified
- [ ] Edge cases handled

---

## ⏱️ Estimated Timeline

| Task | Time |
|------|------|
| Design Updated Models | 1 hour |
| Share Subscription APIs | 3 hours |
| Invitation System | 2 hours |
| Settle Up Feature | 2.5 hours |
| Split Calculator Utils | 1 hour |
| Update Personal Subscriptions View | 1.5 hours |
| Frontend Components (Optional) | 5 hours |
| Testing & Edge Cases | 2 hours |
| **Total (Backend Only)** | **~13 hours** |
| **Total (With Frontend)** | **~18 hours** |

---

## 🎯 Success Criteria

Phase 2 is complete when:

1. ✅ Host can share any subscription with friends/family
2. ✅ Subscription groups auto-created (no manual group creation)
3. ✅ Only 2 roles: Host and Member
4. ✅ Invitations sent via phone number
5. ✅ Members can accept/decline invitations
6. ✅ Split calculation works (equal/custom/percentage)
7. ✅ Host can manage members and their shares
8. ✅ Each member's share appears in their personal subscriptions
9. ✅ Settle Up page shows owed/owed-to breakdown
10. ✅ Payment tracking works correctly

---

## 💡 Key Implementation Notes

### Example: Sharing a Netflix Subscription

**Step 1: Original Subscription**
```javascript
{
  _id: "sub123",
  userId: "host456",
  serviceName: "Netflix Premium",
  amount: 649,
  isShared: false,
  // ... other fields
}
```

**Step 2: Host Shares with 3 Friends (Equal Split)**
```javascript
{
  _id: "sub123",
  userId: "host456",
  serviceName: "Netflix Premium",
  amount: 649,
  isShared: true,
  hostUserId: "host456",
  splitType: "equal",
  totalParticipants: 4, // Host + 3 friends
  sharedWith: [
    {
      userId: "host456",
      role: "host",
      shareAmount: 162.25, // 649 / 4
      isPaid: false,
      invitationStatus: "accepted"
    },
    {
      userId: "friend1",
      role: "member",
      shareAmount: 162.25,
      isPaid: false,
      invitationStatus: "accepted"
    },
    {
      userId: "friend2",
      role: "member",
      shareAmount: 162.25,
      isPaid: true,
      paidAt: "2024-01-20",
      invitationStatus: "accepted"
    },
    {
      userId: "friend3",
      role: "member",
      shareAmount: 162.25,
      isPaid: false,
      invitationStatus: "pending" // Still waiting for acceptance
    }
  ]
}
```

**Step 3: Member's View**
Friend1 sees in their subscriptions:
```javascript
{
  serviceName: "Netflix Premium (Shared)",
  myShare: 162.25,
  role: "member",
  host: "John Doe",
  myPaymentStatus: false
}
```

**Step 4: Settle Up View for Friend1**
```javascript
owedByYou: [
  {
    subscriptionName: "Netflix Premium",
    host: "John Doe",
    amount: 162.25,
    dueDate: "2024-02-01",
    isPaid: false
  }
]
```

---

## 🚀 Next Steps After Phase 2

Once Phase 2 is complete:
- **Phase 3**: Notifications & Reminders Engine
- **Phase 4**: Analytics Dashboard
- **Phase 5**: Payment Integration & Auto-tracking

---

**Ready to build Phase 2! 🎉**
