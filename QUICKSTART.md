# Quick Start Guide

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to `http://localhost:3000`

## Key Features Quick Reference

### 🌙 Dark Mode
- Click the sun/moon icon in the navbar to toggle dark mode
- Preference is saved to localStorage
- System preference is detected on first visit

### 📱 Responsive Design
- **Desktop (lg+):** Full sidebar visible
- **Tablet/Mobile:** Sidebar hidden, toggle with menu button
- All components adapt to screen size

### 🗂️ Navigation
- Click menu items in sidebar to navigate
- Active item is highlighted
- Mobile menu closes after selection

### 📊 Dashboard Content
- **Stats Cards:** Display KPIs with trends
- **Period Selector:** Filter data by time range
- **Charts:** Placeholder ready for chart library integration
- **Activity Feed:** Recent activity list
- **Transactions Table:** Data table with status badges

## Customization Quick Tips

### Change Brand Colors
Edit `tailwind.config.js` and update the theme colors, especially the blue-600 buttons and blue-500 accents.

### Add New Menu Items
In `src/components/Sidebar.tsx`, modify the `menuItems` array:
```tsx
{ id: 'custom', label: 'Custom Page', icon: IconName }
```

### Modify Layout Spacing
- Sidebar width: Change `'sidebar': '256px'` in tailwind.config.js
- Padding: Adjust `pt-16` (navbar height) and `lg:pl-64` (sidebar space) in App.tsx

### Update Navbar Items
Edit `src/components/Navbar.tsx` to add/remove buttons and functionality

## File Structure Overview

```
src/
├── App.tsx                 # Main app wrapper
├── components/
│   ├── Dashboard.tsx       # Main content area
│   ├── Navbar.tsx          # Top bar
│   └── Sidebar.tsx         # Side menu
├── context/
│   └── DarkModeContext.tsx # Theme management
├── index.css               # Global & component styles
└── main.tsx                # React entry

Config:
├── tailwind.config.js      # Style configuration
├── vite.config.ts          # Build config
└── tsconfig.json           # TypeScript config
```

## Common Tasks

### Adding a New Page
1. Create component in `src/components/Pages/`
2. Update Sidebar.tsx with new menu item
3. Add routing logic (consider React Router)

### Using Dark Mode in Components
```tsx
import { useDarkMode } from '../context/DarkModeContext'

function MyComponent() {
  const { isDarkMode } = useDarkMode()
  return <div>{isDarkMode ? 'Dark' : 'Light'}</div>
}
```

### Adding Icons
Use icons from Lucide React:
```tsx
import { IconName } from 'lucide-react'

<IconName size={24} />
```

### Creating Reusable Components
Place shared components in `src/components/` and import where needed.

## Troubleshooting

**Dark mode not persisting?**
- Check browser localStorage is enabled
- Clear cache and reload

**Sidebar not responsive?**
- Ensure Tailwind lg breakpoint is configured (1024px)
- Check mobile viewport meta tag in index.html

**Styles not applying?**
- Rebuild with `npm run build`
- Clear Vite cache with `rm -rf .vite`

## Next Steps

1. **Add Routing:** Install `react-router-dom` for page navigation
2. **Add Charts:** Install `recharts` or `chart.js` for data visualization
3. **State Management:** Add Redux/Zustand for complex state
4. **API Integration:** Connect to backend services
5. **Testing:** Add Jest and React Testing Library

For more info, see README.md
