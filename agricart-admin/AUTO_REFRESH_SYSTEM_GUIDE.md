# Auto-Refresh System Guide

## Overview

The Agricart Admin system now includes a comprehensive auto-refresh system that automatically refreshes pages when notifications or changes are detected. This ensures users always see the most up-to-date information without manual page refreshes.

## Features

### 1. Notification-Based Auto-Refresh
- **Automatic Detection**: The system polls for new notifications every 10 seconds
- **Smart Refresh**: When new notifications are detected, the page automatically refreshes
- **Targeted Updates**: Only refreshes notification data to minimize disruption

### 2. General Auto-Refresh
- **Periodic Refresh**: Performs general page refresh every 2 minutes
- **Background Updates**: Keeps data fresh even when no notifications are present
- **Configurable Intervals**: Refresh intervals can be customized per component

### 3. Event-Based Refresh
- **Window Focus**: Refreshes when the browser window gains focus
- **Visibility Change**: Refreshes when the page becomes visible (tab switching)
- **User Activity**: Responds to user interaction patterns

## Implementation

### Core Components

#### 1. API Endpoint
- **Route**: `/api/notifications/latest`
- **Purpose**: Provides lightweight notification data for polling
- **Authentication**: Requires user authentication
- **Response**: Returns notifications, unread count, and total count

#### 2. Custom Hooks

##### `useNotificationPolling`
- Polls for new notifications at specified intervals
- Automatically refreshes page when new notifications are detected
- Configurable polling frequency and refresh behavior

##### `useAutoRefresh`
- Provides general auto-refresh functionality
- Supports window focus and visibility change events
- Configurable refresh intervals and behavior

##### `useSmartRefresh`
- Combines notification polling and general auto-refresh
- Provides comprehensive refresh management
- Optimized for performance and user experience

#### 3. React Context

##### `RefreshProvider`
- Global refresh state management
- Provides refresh functionality to all child components
- Configurable refresh options and behavior

##### `useRefresh`
- Hook to access refresh functionality from any component
- Provides notifications, refresh functions, and status information

### Configuration Options

```typescript
interface RefreshOptions {
  // Notification polling
  notificationInterval?: number; // Default: 10000ms (10 seconds)
  autoRefreshOnNewNotifications?: boolean; // Default: true
  
  // General refresh
  generalRefreshInterval?: number; // Default: 120000ms (2 minutes)
  enableGeneralRefresh?: boolean; // Default: true
  
  // Window events
  refreshOnFocus?: boolean; // Default: true
  refreshOnVisibilityChange?: boolean; // Default: true
  
  // Refresh behavior
  preserveState?: boolean; // Default: true
  preserveScroll?: boolean; // Default: true
  only?: string[]; // Default: ['notifications']
}
```

## Usage

### 1. Global Setup
The refresh system is automatically enabled for all authenticated users through the `AppShell` component. No additional setup is required.

### 2. Component Usage
Components can access refresh functionality using the `useRefresh` hook:

```typescript
import { useRefresh } from '@/contexts/RefreshContext';

function MyComponent() {
  const { notifications, refresh, isPolling } = useRefresh();
  
  // Use notifications and refresh functionality
}
```

### 3. Custom Configuration
To customize refresh behavior, modify the options in `AppShell` component:

```typescript
<RefreshProvider 
  initialNotifications={notifications}
  options={{
    notificationInterval: 5000, // 5 seconds
    generalRefreshInterval: 60000, // 1 minute
    enableGeneralRefresh: false, // Disable general refresh
  }}
>
  {children}
</RefreshProvider>
```

## Performance Considerations

### 1. Optimized Polling
- **Lightweight Requests**: API endpoint returns only essential data
- **Efficient Updates**: Only refreshes specific data when possible
- **Smart Detection**: Avoids unnecessary refreshes

### 2. User Experience
- **Preserve State**: Maintains user's current state during refresh
- **Preserve Scroll**: Keeps scroll position intact
- **Minimal Disruption**: Targeted updates minimize visual changes

### 3. Resource Management
- **Automatic Cleanup**: Polling stops when components unmount
- **Conditional Execution**: Respects user preferences and system state
- **Error Handling**: Graceful fallback when API calls fail

## Browser Compatibility

The auto-refresh system works in all modern browsers and includes:
- **Fetch API**: For efficient HTTP requests
- **Intersection Observer**: For visibility detection
- **Page Visibility API**: For tab switching detection
- **Performance API**: For navigation timing

## Security

- **CSRF Protection**: All API requests include CSRF tokens
- **Authentication**: API endpoints require user authentication
- **Rate Limiting**: Built-in protection against excessive requests
- **Data Validation**: All responses are validated before processing

## Troubleshooting

### Common Issues

1. **Notifications Not Updating**
   - Check browser console for errors
   - Verify API endpoint is accessible
   - Ensure user is authenticated

2. **Excessive Refreshing**
   - Adjust polling intervals
   - Disable general refresh if not needed
   - Check for JavaScript errors

3. **Performance Issues**
   - Increase polling intervals
   - Disable auto-refresh on specific pages
   - Monitor network requests

### Debug Mode
Enable debug logging by adding to browser console:
```javascript
localStorage.setItem('debug-refresh', 'true');
```

## Future Enhancements

- **WebSocket Integration**: Real-time updates without polling
- **Push Notifications**: Browser notification support
- **Offline Support**: Queue updates when offline
- **User Preferences**: Allow users to customize refresh behavior
