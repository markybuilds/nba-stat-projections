# Mobile & PWA Testing Guide

This guide provides instructions for testing the NBA Stat Projections application's mobile experience and Progressive Web App (PWA) functionality.

## Testing Tools

We've created several tools to assist with testing:

1. **PWA Tester Page**: Access at `/pwa-tester.html` to run tests on PWA functionality
2. **Test Plan**: Refer to `mobile-pwa-test-plan.md` for the comprehensive test plan
3. **Browser Dev Tools**: Use Chrome/Safari/Firefox dev tools for device simulation and network testing

## Test Environment Setup

### Required Devices

For comprehensive testing, we recommend the following devices:

- **Small phones** (320px-375px width): iPhone SE, iPhone 8, Galaxy S5
- **Medium phones** (376px-428px width): iPhone 12/13, iPhone 14 Pro, Pixel 7
- **Large phones** (429px-576px width): Galaxy S20 Ultra, Galaxy Fold
- **Tablets** (577px-768px width): iPad Mini, Galaxy Tab S7

If you don't have access to all these physical devices, use Chrome DevTools Device Mode or BrowserStack.

### Browser Coverage

Test on the following browsers:
- Chrome for Android (latest)
- Safari for iOS (latest)
- Firefox for Android (latest)
- Samsung Internet (latest)

### Network Conditions

Test under various network conditions:
- Fast WiFi (50+ Mbps)
- Slow WiFi (2-5 Mbps)
- 4G (5-12 Mbps)
- 3G (1-4 Mbps)
- Offline

You can simulate network conditions using:
- Chrome DevTools Network tab
- The Network Simulator in our PWA Tester page
- Actually disconnecting from the network on your device

## Testing Process

### 1. Mobile Responsive Layout Testing

1. Open the application on various devices/screen sizes
2. Test each major section:
   - Header & Navigation
   - Player Listings
   - Game Listings
   - Player Details
   - Player Comparison
   - Dashboard
3. For each section, verify:
   - Components display correctly without overflow
   - Touch targets are large enough (minimum 44px)
   - Content is readable without zooming
   - Interactions work as expected

### 2. PWA Functionality Testing

#### Using the PWA Tester Page

1. Navigate to `/pwa-tester.html` on your test device
2. Run the appropriate tests:
   - Service Worker Status
   - Cache Inspection
   - Offline Capability
   - Network Detection
   - Installation Status

#### Manual PWA Testing

1. **Installation Testing**:
   - Visit the site on a mobile device
   - Add to home screen (iOS) or wait for install prompt (Android)
   - Verify app installs correctly with proper icon
   - Launch from home screen and verify startup experience

2. **Offline Testing**:
   - Visit the site while online to cache resources
   - Put device in airplane mode or disconnect from network
   - Attempt to navigate to previously visited pages
   - Verify offline fallback page appears for uncached routes
   - Check offline indicator displays correctly

3. **Service Worker Testing**:
   - Use browser devtools to inspect service worker
   - Check Registration, Activation, and Update flows
   - Verify caching strategies work as expected

### 3. Performance Testing

1. **Loading Performance**:
   - Use Chrome Lighthouse to measure performance metrics
   - Test initial load time on various networks
   - Verify skeleton loaders appear appropriately

2. **Interaction Performance**:
   - Test scrolling smoothness in lists
   - Verify animations run at 60fps
   - Check for input lag on touch interfaces

### 4. Issue Reporting

When you find issues, document the following:
- Device/OS/browser version
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots or recordings
- Severity (Critical/High/Medium/Low)

Submit issues through the project tracking system with the tag `mobile-pwa-testing`.

## Key Areas to Focus On

### High Priority

1. **Critical User Flows**:
   - Viewing games and player statistics
   - Searching and filtering players
   - Navigating between pages
   - Using player comparison tools
   - Pull-to-refresh functionality

2. **PWA Core Functionality**:
   - Installation on Android and iOS
   - Offline fallback experience
   - Network status detection
   - Cache update mechanism

### Medium Priority

1. **Edge Cases**:
   - Very small screens (320px width)
   - Rotating between portrait and landscape
   - Very large data sets in virtualized lists
   - Slow network transitions

2. **Visual Consistency**:
   - Design consistency across screen sizes
   - Animation and transition smoothness
   - Theme consistency (light/dark mode)

## Acceptance Criteria

The mobile experience and PWA functionality are considered acceptable when:

1. All critical user flows work on all target devices
2. PWA Lighthouse score is > 90
3. Offline functionality works correctly
4. Installation flow is successful on iOS and Android
5. Performance metrics meet or exceed targets:
   - First Contentful Paint (FCP) < 1.8s
   - Largest Contentful Paint (LCP) < 2.5s
   - Time to Interactive (TTI) < 3.8s
   - Cumulative Layout Shift (CLS) < 0.1

## Getting Started

1. Clone the repository and set up the development environment
2. Run the application locally or access the staging environment
3. Access the PWA Tester page at `/pwa-tester.html`
4. Follow the test plan in `mobile-pwa-test-plan.md`
5. Report any issues found

## Contact

If you have any questions about the testing process, contact:
- Mobile Team Lead: [mobile-lead@example.com](mailto:mobile-lead@example.com)
- PWA Implementation Lead: [pwa-lead@example.com](mailto:pwa-lead@example.com) 