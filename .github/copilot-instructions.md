# Copilot Instructions for YE

## Project Overview

This is a Next.js-based expense and equipment tracking application with mobile support via Capacitor.

## Tech Stack

- **Framework**: Next.js 16+ with App Router
- **React**: Version 19.2.0
- **Mobile**: Capacitor 7 (Android & iOS)
- **Styling**: Tailwind CSS v4
- **Language**: JavaScript (with JSDoc types support)
- **Linting**: ESLint with Next.js config
- **Build**: Static export (`output: 'export'`)

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── _features/    # Feature-specific pages
│   ├── equipment/    # Equipment management
│   ├── expenses/     # Expense tracking
│   ├── settings/     # Settings pages
│   └── trips/        # Trip management
├── components/       # React components
│   ├── shared/       # Shared components
│   └── ui/           # UI components
├── constants/        # App constants
├── context/          # React contexts
├── hooks/            # Custom React hooks
├── services/         # Business logic and API services
└── utils/            # Utility functions
```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production (static export)
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run deploy:android` - Build and deploy to Android

## Coding Guidelines

### General

- Use functional components with hooks
- Follow the existing file structure and naming conventions
- Keep components small and focused on a single responsibility
- Use the App Router pattern (not Pages Router)

### File Naming

- Components: Use PascalCase for component files (e.g., `UserProfile.js`)
- Pages: Use lowercase with hyphens or App Router conventions
- Utilities: Use camelCase (e.g., `formatDate.js`)
- Constants: Use UPPER_SNAKE_CASE for constant values

### React Best Practices

- Use React 19 features appropriately
- Prefer hooks over class components
- Use context for global state management
- Keep state as local as possible
- Use custom hooks for reusable logic

### Styling

- Use Tailwind CSS v4 utility classes
- Follow mobile-first responsive design
- Ensure styles work on both web and mobile (Capacitor)
- Use the `main.css` file for global styles

### Capacitor/Mobile

- Test features on both web and mobile platforms when applicable
- Use Capacitor plugins for native features (Camera, Filesystem, Share, etc.)
- Be aware of platform differences (iOS/Android/Web)
- Handle permissions appropriately

### Performance

- Use Next.js Image component for images
- Implement code splitting where appropriate
- Optimize bundle size (static export mode)
- Consider offline functionality for mobile

### Code Quality

- Run `npm run lint` before committing
- Write self-documenting code
- Add JSDoc comments for complex functions
- Handle errors gracefully
- Validate user input

## Important Notes

- This project uses static export mode (`output: 'export'`)
- Canvas is aliased to false for webpack (required for react-pdf)
- React Compiler is available via babel plugin
- The app supports PDF viewing via Capacitor plugin
- JSZip is used for file compression

## Common Patterns

### Creating a New Feature

1. Add feature page in `src/app/_features/` or dedicated folder
2. Create components in `src/components/`
3. Add services in `src/services/` for business logic
4. Define constants in `src/constants/`
5. Create custom hooks in `src/hooks/` if needed

### State Management

- Use React Context for global state
- Keep context files in `src/context/`
- Use hooks to consume context

### Adding Dependencies

- Verify compatibility with Next.js 16+, React 19, and Capacitor
- Update package.json via npm
- Test on both web and mobile platforms

## Testing

Currently, there is no formal testing infrastructure. When adding tests:
- **Unit/Integration**: Consider Jest with React Testing Library for component and hook testing
- **E2E**: Consider Playwright or Cypress for end-to-end testing of critical user flows
- Ensure compatibility with Next.js 16+ App Router
- Test components, hooks, and utilities
- Include mobile-specific tests for Capacitor features

## Mobile Deployment

- Android: Use `npm run deploy:android`
- Ensure JAVA_HOME is set correctly
- Run `npx cap sync` after npm build to sync web assets
