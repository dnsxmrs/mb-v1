# Student Session Auto-Refresh Implementation

## Overview

This implementation automatically refreshes student session expiration times every time a student interacts with the web application. This ensures that active students won't lose their session unexpectedly.

## How It Works

### 1. Server Action for Session Refresh

**File**: `src/actions/student.ts`

Added `refreshStudentSession()` function that:

- Reads existing student session cookies
- Resets the cookies with a new 30-day expiration
- Handles errors gracefully

### 2. Custom Hook for Client-Side Refresh

**File**: `src/hooks/useStudentSession.ts`

Created `useStudentSessionRefresh()` hook that:

- Automatically refreshes session when component mounts
- Provides a `refreshSession()` function for manual triggers
- Includes a `withSessionRefresh()` wrapper for event handlers

### 3. Middleware Auto-Refresh

**File**: `src/middleware.ts`

Enhanced middleware to:

- Detect student route requests (`/student/*`)
- Automatically refresh session cookies on every student page request
- Extend cookie expiration without user interaction

### 4. Session Wrapper Component

**File**: `src/components/StudentSessionWrapper.tsx`

Created a wrapper component that:

- Automatically triggers session refresh when mounted
- Can wrap any student page for automatic session management

### 5. Updated Student Components

#### StudentInfoForm

- Added session refresh before form submission
- Uses the custom hook for automatic refresh

#### InteractiveQuiz  

- Refreshes session on each answer selection
- Refreshes session before final quiz submission
- Ensures session stays active during quiz taking

#### Student Pages

Updated the following pages to use `StudentSessionWrapper`:

- `/student/info` - Student information form
- `/student/story/[code]` - Story viewing page  
- `/student/quiz/[code]` - Quiz taking page

## Benefits

1. **Automatic Extension**: Sessions extend automatically without user intervention
2. **Multiple Layers**: Both middleware and client-side refresh ensure reliability
3. **Silent Operation**: Refresh happens in background without affecting UX
4. **Granular Control**: Can refresh on specific interactions (quiz answers, form submissions)
5. **Graceful Handling**: Errors in refresh don't break the user experience

## Technical Details

### Session Duration

- Cookies are refreshed with 30-day expiration
- Refresh happens on every student route request (middleware level)
- Additional refresh on specific interactions (component level)

### Cookie Management

- Maintains existing `student_info` and `privacy_consent` cookies
- Uses same security settings (httpOnly, secure in production, sameSite)
- Preserves all existing student data during refresh

### Error Handling

- Silent failures to avoid disrupting user experience
- Console logging for debugging
- Fallback to existing session if refresh fails

## Usage Examples

### Automatic (Recommended)

Just wrap student pages with `StudentSessionWrapper`:

```tsx
return (
  <StudentSessionWrapper>
    <YourStudentPageContent />
  </StudentSessionWrapper>
);
```

### Manual Refresh

```tsx
const { refreshSession } = useStudentSessionRefresh();

const handleImportantAction = async () => {
  await refreshSession(); // Refresh before important action
  // ... rest of your logic
};
```

### Event Handler Wrapper

```tsx
const handleClick = withSessionRefresh(() => {
  // Your click handler logic
  // Session will be refreshed automatically before this runs
});
```

## Monitoring

The implementation includes console logging for debugging:

- Session refresh attempts
- Errors during refresh
- Middleware refresh operations

Monitor browser console in development to see refresh operations.

## Security Considerations

- Maintains all existing security measures
- No sensitive data exposed in client-side code
- Server-side validation of existing sessions before refresh
- Graceful degradation if refresh fails

This implementation ensures students can work uninterrupted while maintaining session security and proper expiration management.
