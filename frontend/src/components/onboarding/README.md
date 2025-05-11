# Role-Based Onboarding Flow

This directory contains a complete post-signup onboarding flow for a multi-role event platform. The flow allows users to select how they'll participate in the platform and collect relevant information based on their role selection.

## Components Overview

1. **OnboardingFlow.jsx** - Main controller component that manages the state and navigation between steps
2. **WelcomeScreen.jsx** - Initial welcome screen
3. **RoleSelection.jsx** - Allows users to select their role (Organizer, Vendor, Both, or Attendee)
4. **OrganizerSetup.jsx** - Profile setup for organizers (profile image, type, name, description)
5. **VendorSetup.jsx** - Profile setup for vendors (type, name, address, location)
6. **CompletionScreen.jsx** - Confirmation screen with action buttons
7. **OnboardingGuard.jsx** - Route guard to ensure only authenticated users access the flow
8. **onboarding.css** - Shared CSS styles for the onboarding components

## Flow Structure

The onboarding flow follows this sequence:

1. Welcome Screen → Introduction to the platform
2. Role Selection → Users choose how they'll use the platform:
   - Organizing Events
   - Offering Services (as Vendor)
   - Both
   - Just Joining Events
3. Based on role:
   - If Organizer/Both: Show organizer profile setup form
   - If Vendor/Both: Show vendor profile setup form
   - If Just Joining Events: Skip to completion
4. Completion screen with options to browse events or go to dashboard

## Integration

The onboarding flow is integrated into the app routing in `App.jsx` and protected by an authentication guard. After registration, users are redirected to this flow automatically.

## State Management

The `OnboardingFlow` component manages the state for the entire flow, passing relevant data to child components and receiving updates. This ensures all user input is collected and can be submitted to the backend once the flow is complete.

## Usage

To use this onboarding flow:

1. Register a new user account
2. You'll be automatically redirected to the onboarding flow
3. Complete each step based on your intended use of the platform
4. After completion, you'll be redirected to the home page

## Styling

The components use a combination of Material UI styling system and custom CSS classes defined in `onboarding.css`. The UI is fully responsive and works well on mobile, tablet, and desktop devices.

## Backend Integration Notes

This implementation focuses on the frontend UI flow only. For a complete integration:

1. Connect the collected data to your user profile API endpoints
2. Add validation in the backend for the submitted data
3. Create authorization rules based on the selected roles
4. Implement conditional UI elements throughout the app based on user roles
