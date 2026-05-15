# React TypeScript Dashboard

A modern, responsive dashboard layout built with React, TypeScript, and Tailwind CSS featuring a sidebar navigation, top navbar, and complete dark mode support.

## Features

✨ **Key Features:**
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode Support** - Toggle between light and dark themes with persistent storage
- **Sidebar Navigation** - Collapsible sidebar with smooth animations
- **Top Navbar** - Includes search bar, notifications, theme toggle, and user profile
- **Dashboard Content** - Stats cards, charts placeholder, recent activity, and transactions table
- **TypeScript** - Full type safety across the application
- **Tailwind CSS** - Utility-first styling with custom dark mode colors
- **Lucide React Icons** - Beautiful and consistent icon library

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

The application will open automatically at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx       # Top navigation bar
│   ├── Sidebar.tsx      # Side navigation panel
│   └── Dashboard.tsx    # Main dashboard content
├── context/
│   └── DarkModeContext.tsx  # Dark mode state management
├── App.tsx              # Main app component
├── main.tsx             # React entry point
└── index.css            # Global styles

Configuration Files:
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── index.html           # HTML entry point
```

## Customization

### Dark Mode

Dark mode is controlled by the `DarkModeContext`. It:
- Automatically detects system preference on first visit
- Saves user preference to localStorage
- Applies the `dark` class to the root element for Tailwind's dark mode

### Colors

Customize colors in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      // Add custom colors here
    }
  }
}
```

### Sidebar Navigation

Edit the `menuItems` array in `src/components/Sidebar.tsx` to add or modify navigation links.

### Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px (lg breakpoint)

## Available Icons

The project uses Lucide React for icons. Common icons used:
- `LayoutDashboard` - Dashboard icon
- `BarChart3` - Analytics icon
- `Users` - Users icon
- `FileText` - Reports icon
- `Settings` - Settings icon
- `LogOut` - Logout icon
- `Bell` - Notifications icon
- `Moon` / `Sun` - Theme toggle icons
- `Search` - Search icon
- `Menu` / `X` - Mobile menu icons

Browse more at: https://lucide.dev/

## Component API

### Navbar

```tsx
<Navbar onMenuClick={() => setIsOpen(!isOpen)} />
```

Displays top navigation with search, notifications, theme toggle, and user profile.

### Sidebar

```tsx
<Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
```

Displays navigation menu with collapsible mobile drawer.

### Dark Mode Hook

```tsx
const { isDarkMode, toggleDarkMode } = useDarkMode()
```

Use this hook in any component to access dark mode state.

## Styling Classes

### Component Classes (in index.css)

- `.sidebar-link` - Sidebar navigation items
- `.sidebar-link.active` - Active navigation state
- `.card` - Reusable card component
- `.btn` - Button base styles
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button

### Tailwind Dark Mode

All components use Tailwind's `dark:` prefix for dark mode styles:
```tsx
<div className="bg-white dark:bg-dark-900">
```

## Performance Tips

1. Use React.memo() for frequently rendered components
2. Implement code splitting for large chart libraries
3. Consider virtualizing long tables with react-window
4. Optimize images and use lazy loading

## Future Enhancements

- [ ] Add chart library (Recharts, Chart.js)
- [ ] Implement user authentication
- [ ] Add API integration
- [ ] Create reusable form components
- [ ] Add unit and integration tests
- [ ] Implement state management (Redux/Zustand)
- [ ] Add notifications system
- [ ] Create more dashboard pages

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to fork this project and submit pull requests with improvements!
