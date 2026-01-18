# Macro Tracker App - Development TODO

## Phase 1: Core Infrastructure & Database
- [x] Design visual style system (colors, typography, components)
- [x] Create database schema (users, profiles, meals, daily_tracking, coaching_logs)
- [x] Set up Supabase integration and environment variables
- [x] Implement database migrations

## Phase 2: Authentication
- [x] Create sign-up page with email/password validation
- [x] Create login page with email/password authentication
- [x] Implement Supabase Auth integration
- [x] Add logout functionality
- [x] Create auth context and hooks
- [x] Add protected routes

## Phase 3: User Onboarding
- [x] Create goal selection UI (Bulk, Lose, Lean)
- [x] Create body details form (age, gender, height, weight, activity level)
- [x] Implement TDEE and macro calculation logic
- [x] Create custom macro target input option
- [x] Store user profile and targets in database
- [x] Create onboarding completion flow

## Phase 4: Meal Logging - Manual Entry
- [x] Create meal logging form UI
- [x] Implement macro input fields (calories, protein, carbs, fat)
- [x] Add meal time/date picker
- [x] Add meal category/type selector
- [x] Implement meal save to database
- [x] Add success feedback
- [x] Add subtle manual entry toggle to AI meal logging page

## Phase 5: AI-Powered Meal Analysis
- [x] Redesign meal logging UI to be AI-first (remove manual macro entry)
- [x] Create image upload and text description UI
- [x] Implement OpenRouter LLM integration for macro estimation
- [x] Build serverless function for secure AI calls
- [x] Create meal confirmation flow with AI-estimated macros
- [x] Add ability to adjust AI-estimated macros before saving
- [x] Implement portion size detection and estimation

## Phase 6: Real-Time Dashboard
- [x] Create main dashboard layout
- [x] Implement daily macro progress visualization
- [x] Add macro cards showing (Calories, Protein, Carbs, Fat) with progress bars
- [x] Display remaining macros for the day
- [x] Add visual indicators (on-track, over, under)
- [x] Implement real-time updates
- [x] Redesign dashboard to focus on daily summary + Add Meal button
- [x] Improve macro breakdown chart colors and convert to single bars
- [x] Create separate analytics page for detailed charts
- [x] Move coaching tips below daily summary

## Phase 7: Daily Reset Mechanism
- [ ] Implement daily reset logic (midnight user local time)
- [ ] Create backend job or trigger for daily reset
- [ ] Handle timezone conversion
- [ ] Ensure data persistence before reset
- [ ] Add reset confirmation/logging

## Phase 8: Meal History & Management
- [ ] Create meal history view
- [ ] Implement meal list with date filtering
- [ ] Add edit meal functionality
- [ ] Add delete meal functionality
- [ ] Show meal details modal
- [ ] Add search/filter by meal type

## Phase 9: AI Coaching Features
- [x] Create coaching tips generation logic
- [x] Implement context-aware recommendations
- [x] Add coaching tips display on dashboard
- [ ] Create coaching history view
- [ ] Implement personalized advice based on trends
- [ ] Add motivational messages

## Phase 10: Mobile Optimization & Polish
- [ ] Test responsive design on mobile devices
- [ ] Optimize touch interactions
- [ ] Implement mobile-friendly navigation
- [ ] Test performance on slower networks
- [ ] Add loading states and skeletons
- [ ] Polish animations and transitions
- [ ] Fix any layout issues on small screens

## Phase 11: Testing & Deployment
- [ ] Write vitest tests for critical functions
- [ ] Test authentication flow
- [ ] Test meal logging and calculations
- [ ] Test daily reset mechanism
- [ ] Prepare Vercel deployment configuration
- [ ] Test on production environment

## Completed Features
(Items will be moved here as they're completed)
