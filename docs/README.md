# Fleet-Steuer Documentation

Comprehensive documentation for the Fleet-Steuer tax deduction tracking application.

## 📂 Directory Structure

### `/diagrams` - Visual Documentation
Flow diagrams, architecture diagrams, and visual guides for features and implementations.

- `ANDROID_BACK_BUTTON_FLOW_DIAGRAM.md` - Android back button navigation flow
- `SWIPE_GESTURES_VISUAL_GUIDE.md` - Bi-directional swipe gesture patterns

### `/implementations` - Implementation Details
Detailed implementation documentation for features and bug fixes.

- `ANDROID_BACK_BUTTON_SCHEDULE_CARD.md` - Back button integration for schedule card
- `CORRECTION_RECEIPT_PREVIEW.md` - Receipt preview bug fix
- `EQUIPMENT_SWIPE_ACTIONS_IMPLEMENTATION.md` - Equipment swipe actions
- `IMPLEMENTATION_COMPLETE.md` - Overall implementation completion summary
- `IMPLEMENTATION_SUMMARY_BACK_BUTTON.md` - Android back button implementation
- `SPESEN_IMPLEMENTATION_SUMMARY.md` - Monthly expense tracking implementation
- `SWIPE_GESTURES_IMPLEMENTATION.md` - Bi-directional swipe gestures

### `/reviews` - Module Reviews
Comprehensive reviews of each module's implementation, functionality, and code quality.

- `dashboard-module-review.md` - Dashboard KPI module (Grade: A, 92/100)
- `equipment-module-review.md` - Equipment/Arbeitsmittel module (Grade: A+, 96/100)
- `expenses-module-review.md` - Expenses tracking module (Grade: A, 94/100)
- `file-size-validation-implementation.md` - File upload validation
- `loading-button-replacement.md` - Loading state improvements
- `loading-states-implementation.md` - Loading states across modules
- `settings-module-review.md` - Settings module (Grade: A+, 98/100)
- `tax-settings-validation-implementation.md` - Tax settings validation
- `trips-module-review.md` - Trips module (Grade: A+, 98/100)

### `/summaries` - Quick Summaries
High-level summaries and status updates for major features and implementations.

- `EQUIPMENT_REVIEW_SUMMARY.md` - Equipment module review summary
- `EXPENSES_REVIEW_SUMMARY.md` - Expenses module review summary
- `FILE_SIZE_VALIDATION_SUMMARY.md` - File validation implementation summary
- `LOADING_STATES_SUMMARY.md` - Loading states implementation summary

## 🎯 Project Overview

**Fleet-Steuer** is a German tax deduction tracker designed for vehicle couriers (Kurier-Fahrer). Built with Next.js and Capacitor for cross-platform deployment (Web, iOS, Android).

### Core Modules
- **Dashboard** - KPI cards with tax deduction summaries
- **Trips** - Mileage tracking and trip management
- **Expenses** - Daily expense tracking (€14/€28 allowances)
- **Equipment** - Depreciation schedule management (GWG €952 limit)
- **Settings** - Tax year configuration and preferences

### Average Module Grade: **A+ (95.2/100)**

## 📖 Additional Resources

- **Project README**: See root `/README.md`
- **GitHub Issues**: [lucascarvalhodasilva/ye](https://github.com/lucascarvalhodasilva/ye)
- **Copilot Instructions**: `.github/copilot-instructions.md`

## 🔗 Quick Links

### Recent Implementations
- [Android Back Button Handler](implementations/IMPLEMENTATION_SUMMARY_BACK_BUTTON.md)
- [Bi-directional Swipe Gestures](implementations/SWIPE_GESTURES_IMPLEMENTATION.md)
- [Monthly Expense Tracking](implementations/SPESEN_IMPLEMENTATION_SUMMARY.md)

### Visual Guides
- [Swipe Gestures Flow](diagrams/SWIPE_GESTURES_VISUAL_GUIDE.md)
- [Back Button Navigation](diagrams/ANDROID_BACK_BUTTON_FLOW_DIAGRAM.md)

### Module Reviews
- [Dashboard Review](reviews/dashboard-module-review.md) - Grade: A (92/100)
- [Trips Review](reviews/trips-module-review.md) - Grade: A+ (98/100)
- [Expenses Review](reviews/expenses-module-review.md) - Grade: A (94/100)
- [Equipment Review](reviews/equipment-module-review.md) - Grade: A+ (96/100)
- [Settings Review](reviews/settings-module-review.md) - Grade: A+ (98/100)

---

**Last Updated**: January 28, 2026
