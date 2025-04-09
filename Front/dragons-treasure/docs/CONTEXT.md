# Login and Dashboard Application Specification

## Overview

We're developing a modern, responsive web application with a login system and comprehensive dashboard using React, JSX, and Tailwind CSS. The design aesthetic follows a glass-morphism style inspired by Apple's UI design language, featuring translucent elements with subtle blur effects, clean typography, and a professional yet engaging user experience.

> **Note:** Authentication functionality will be provided by an external service endpoint. The current focus is on implementing the visual interface and frontend components. The actual authentication logic will be integrated later.

## Tech Stack

- **Frontend Framework**: React with JSX
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Context API / Redux (optional)
- **Authentication**: External service (integration to be added later)
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## Application Structure

### 1. Login Page

The login page serves as the entry point to the application with a clean, minimalist design featuring glass-morphism effects.

#### Components:

- **Container**: A centered, glass-effect card on a white/light background
- **Header**: "Login." with a decorative dot at the end
- **Form Inputs**:
  - Email/Username field ("Correo/Usuario") with placeholder
  - Password field ("Contraseña") with placeholder
  - Password visibility toggle button with eye icon
- **Additional Elements**: 
  - "Remember me" checkbox ("Recuérdame")
  - "Forgot password?" link in yellow text ("¿Olvidaste tu contraseña?")
  - Login button with a soft yellow background
  - New user registration prompt ("¿Eres Nuevo? Crear una Cuenta")
- **Decorative Elements**: Abstract shapes using blue, yellow, and red accents (circles, wavy lines, dots pattern)

#### Interactions:

- Form validation with helpful error messages
- Password toggle visibility
- Smooth transitions between input states
- Responsive design that adapts to all screen sizes

### 2. Dashboard

Once logged in, users are directed to the main dashboard that presents user data, statistics, and navigation options.

#### Layout:

- **Sidebar**: Left-positioned navigation panel with logo and menu items
- **Main Content Area**: Central area displaying various data widgets and cards
- **Top Bar**: Optional header with user info and quick actions

#### Components:

##### Sidebar:
- Logo area with application name ("aulify.")
- User welcome section showing username and avatar
- Navigation items:
  - Dashboard (active by default)
  - Statistics ("Estadísticas")
  - Configuration ("Configuración")
  - Dark Mode toggle
  - Logout button ("Salir")

##### Main Dashboard Content:
- **User Level Widget**: 
  - Current level with star icon (Level 1)
  - Progress indicator to next level (Level 2)
  - Points needed to level up ("5 puntos para subir")

- **Time Stats Graph**: 
  - Line chart showing "Tiempo de Juego" (Game Time)
  - X-axis: Days of week (Lunes through Domingo)
  - Y-axis: Hours played (0-7)
  - Interactive points showing daily values

- **Recent Games Widget**:
  - Header "Últimas 5 partidas" (Last 5 games)
  - List of game records showing:
    - Game duration (e.g., 1:44:10)
    - Performance indicator (medal icons or X for failed/missed games)

- **Leaderboard Widget**:
  - Header "Leaderboard"
  - List of top players with:
    - Username (Luan, Sofí, Diana, Santiago, Hugo)
    - Time/score (e.g., 1:44:10)
    - Medal/ranking indicator

#### Interactions:

- Clickable navigation items with active state indicators
- Hoverable cards with subtle elevation effects
- Interactive charts with tooltip data on hover
- Dark/Light mode toggle affecting the entire UI

## Detailed Style Guide

### Colors

- **Primary Blue**: #2563EB (for buttons, active states)
- **Secondary Yellow**: #F59E0B (for accents, highlights, links)
- **Error Red**: #EF4444 (for errors, negative indicators)
- **Success Green**: #10B981 (for success states)
- **Background**: 
  - Light mode: #FFFFFF with subtle patterns
  - Dark mode: #121212 with subtle patterns
- **Glass Effect Colors**:
  - Light background: rgba(255, 255, 255, 0.7) with backdrop-filter: blur(10px)
  - Dark background: rgba(30, 30, 30, 0.7) with backdrop-filter: blur(10px)
- **Text**:
  - Primary: #1F2937 (light mode), #F9FAFB (dark mode)
  - Secondary: #6B7280 (light mode), #9CA3AF (dark mode)

### Typography

- **Primary Font**: Inter or SF Pro Display
- **Heading Sizes**:
  - Large (Login, Dashboard): text-3xl font-bold
  - Medium (Widget Headers): text-xl font-semibold
  - Small (Labels): text-sm font-medium
- **Body Text**: text-base font-normal

### Component Styles

#### Glass Effect
```css
.glass {
  @apply bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg;
}
```

#### Buttons
```css
.button-primary {
  @apply bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium py-2 px-4 rounded-full transition-all duration-300;
}

.button-secondary {
  @apply bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-full transition-all duration-300;
}
```

#### Form Inputs
```css
.input {
  @apply bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all;
}
```

## Responsive Design

The application will be fully responsive with these breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Adaptations:

- Sidebar collapses to bottom navigation or hamburger menu
- Widgets stack vertically
- Form inputs take full width
- Typography sizes decrease slightly
- Decorative elements may be reduced or repositioned

## Animation and Micro-interactions

- Subtle hover effects on all interactive elements
- Page transitions between login and dashboard
- Loading states with animated indicators
- Success/error animations for form submissions
- Micro-animations for:
  - Level progress
  - Chart data loading
  - Menu transitions

## User Flows

### 1. Authentication Flow

> **Note:** The actual authentication will be handled by an external service. For now, we'll implement a mockup flow with frontend validation only.

1. User arrives at login page
2. User enters credentials (visual validation occurs in real-time)
3. On submit:
   - Display a loading animation
   - Simulate success and redirect to dashboard
4. For testing failed login:
   - Provide a toggle or specific test credentials
   - Show appropriate error UI
5. Alternative paths:
   - User clicks "Forgot Password" → Password recovery UI (non-functional)
   - User clicks "Create Account" → Registration UI (non-functional)

### 2. Dashboard Interaction Flow

1. User arrives at dashboard after login
2. User can:
   - View their stats and level
   - Check game history
   - View leaderboard
   - Navigate to other sections
   - Toggle dark/light mode
   - Log out

## Implementation Notes

### Authentication Integration (Future)

- The login functionality will be provided by an external service endpoint
- For now, implement only the visual components without actual authentication logic
- Create service placeholder files and mock data structures for future integration
- Design the auth context/provider to be easily connected to the external service later

### Performance Considerations

- Implement code-splitting for faster initial load
- Lazy load components that aren't immediately visible
- Optimize images and decorative elements
- Use memoization for expensive calculations
- Implement skeleton loaders for data-dependent components

### Accessibility Requirements

- All interactive elements must be keyboard navigable
- Proper ARIA labels for custom components
- Sufficient color contrast for all text
- Dark mode should enhance readability
- Form validation messages should be screen reader friendly

### Security Considerations

- Prepare for CSRF protection (to be implemented when connecting to real endpoint)
- Design secure storage strategy for authentication tokens
- Plan for auto-logout after period of inactivity
- Input sanitization to prevent XSS
- Design for rate limiting for login attempts (server-side implementation will come later)

## Development Phases

### Phase 1: Setup and Basic Structure
- Project initialization with Vite and React
- Tailwind CSS configuration with custom theme
- Basic routing setup
- Create placeholder authentication context/provider

### Phase 2: Login Page Implementation
- Build the login form components with visual validation
- Add decorative elements and glass effects
- Create mock authentication for testing
- Implement form UI states (default, error, loading)

### Phase 3: Dashboard Layout and Navigation
- Create responsive layout structure
- Implement sidebar/navigation
- Add dark/light mode toggle
- Setup protected routes with mock authentication

### Phase 4: Dashboard Widgets
- Implement level progress component
- Create time stats chart
- Build recent games list
- Develop leaderboard component

### Phase 5: Polish and Optimization
- Add animations and transitions
- Optimize for performance
- Test across devices and browsers
- Implement loading states and error handling

## Additional Features for Future Consideration

- User profile customization
- Achievements system
- Social features (friend invites, challenges)
- Push notifications
- Game integration
- Tutorial/onboarding flow for new users

## Project Folder Structure

Based on the provided screenshot, the project follows a standard Vite React application structure:

```
dragons-treasure/
├── docs/
│   └── CONTEXT.md           # Project context documentation
├── node_modules/            # Node.js dependencies
├── public/                  # Static files served as-is
│   └── vite.svg             # Vite logo
├── src/                     # Source code
├── .gitignore               # Git ignore configuration
├── eslint.config.js         # ESLint configuration
├── index.html               # Entry HTML file
├── package-lock.json        # Dependency lock file
├── package.json             # Project manifest
├── README.md                # Project documentation
└── vite.config.js           # Vite configuration
```

### Recommended Extended Structure

For better organization as the project grows, we recommend expanding the structure as follows:

```
dragons-treasure/
├── docs/
│   ├── CONTEXT.md           # Project context documentation
│   ├── API.md               # API documentation
│   └── DEPLOYMENT.md        # Deployment instructions
├── node_modules/            # Node.js dependencies
├── public/
│   ├── assets/              # Static assets (images, fonts)
│   │   ├── images/
│   │   └── fonts/
│   └── vite.svg             # Vite logo
├── src/
│   ├── assets/              # Assets imported by the application
│   │   ├── decorative/      # Decorative elements (waves, shapes)
│   │   ├── icons/           # Custom icons
│   │   └── images/          # App-specific images
│   ├── components/          # Reusable components
│   │   ├── common/          # Shared UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   └── Card.jsx
│   │   ├── auth/            # Authentication components
│   │   │   ├── LoginForm.jsx
│   │   │   └── ForgotPassword.jsx
│   │   └── dashboard/       # Dashboard components
│   │       ├── Sidebar.jsx
│   │       ├── LevelWidget.jsx
│   │       ├── GameTimeChart.jsx
│   │       ├── RecentGames.jsx
│   │       └── Leaderboard.jsx
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.jsx  # Placeholder for future auth integration
│   │   └── ThemeContext.jsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js       # Mock auth hooks for now
│   │   └── useDarkMode.js
│   ├── layouts/             # Page layout components
│   │   ├── AuthLayout.jsx   # Layout for auth pages
│   │   └── DashboardLayout.jsx
│   ├── pages/               # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Statistics.jsx
│   │   └── Settings.jsx
│   ├── services/            # API services
│   │   ├── api.js           # API client setup (placeholder)
│   │   ├── authService.js   # Will connect to external auth service
│   │   └── userService.js   # Mock data service for now
│   ├── styles/              # Global styles
│   │   ├── tailwind.css     # Tailwind imports
│   │   └── globals.css      # Custom global styles
│   ├── utils/               # Utility functions
│   │   ├── formatters.js    # Date/number formatters
│   │   └── validators.js    # Form validation
│   ├── App.jsx              # Main App component
│   ├── main.jsx             # Application entry point
│   └── Router.jsx           # Application routes
├── .gitignore               # Git ignore configuration
├── eslint.config.js         # ESLint configuration
├── index.html               # Entry HTML file
├── package-lock.json        # Dependency lock file
├── package.json             # Project manifest
├── README.md                # Project documentation
├── tailwind.config.js       # Tailwind CSS configuration
└── vite.config.js           # Vite configuration
```
