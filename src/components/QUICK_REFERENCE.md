# SQL Editor - Quick Reference Guide

## 🚀 Quick Start (30 seconds)

```typescript
import { SQLEditor } from '@/components'

export function App() {
  return <SQLEditor height="500px" />
}
```

## 📋 Basic Props

```typescript
<SQLEditor
  initialQuery="SELECT * FROM users"          // Initial SQL
  onQueryChange={(q) => console.log(q)}       // On edit
  onQuerySubmit={(q) => executeQuery(q)}      // On execute
  readOnly={false}                            // Make read-only
  height="500px"                              // Container height
/>
```

## 🛠️ Utilities Quick Reference

```typescript
import {
  formatSQL,      // Format query with indentation
  minifySQL,      // Remove whitespace
  isValidSQL,     // Validate query
  getSQLStats,    // Get query statistics
  useSQLQuery     // Query state management hook
} from '@/components'

// Format
const formatted = formatSQL('select * from users')

// Minify
const minified = minifySQL('SELECT   *   FROM   users')

// Validate
if (isValidSQL(sql)) { /* valid */ }

// Stats
const { keywords, tables, functions, lines } = getSQLStats(sql)

// Hook
const { query, setQuery, history, favorites } = useSQLQuery()
```

## 🎨 Features at a Glance

| Feature | Button | Shortcut | Keyboard |
|---------|--------|----------|----------|
| Copy | ✓ | - | Ctrl+C |
| Format | ✓ | - | Tab for indent |
| Minify | ✓ | - | - |
| Export | ✓ | - | - |
| Clear | ✓ | - | - |
| Execute | ✓ | - | - |
| View Mode | Toggle | - | - |
| Auto-format | Toggle | - | - |

## 📊 View Modes

```
[Editor]  -> Editor only (focus on writing)
[Split]   -> Split view (default - see both)
[Preview] -> Preview only (see formatted)
```

## 💾 Hook: useSQLQuery

```typescript
const {
  // Current state
  query,
  setQuery,
  formatted,
  
  // History
  history,
  addToHistory,
  getFromHistory,
  clearHistory,
  searchHistory,
  
  // Favorites
  favorites,
  addFavorite,
  removeFavorite,
  isFavorited,
  searchFavorites,
  
  // Utils
  exportQuery,
  importQuery
} = useSQLQuery({
  maxHistory: 20,
  storageKey: 'sql-history',
  persistToLocalStorage: true
})
```

## 🎯 Common Patterns

### Pattern 1: Simple Query Display (Read-only)
```typescript
<SQLEditor
  initialQuery="SELECT * FROM table"
  readOnly={true}
  height="300px"
/>
```

### Pattern 2: With Execution
```typescript
<SQLEditor
  onQuerySubmit={async (sql) => {
    const res = await fetch('/api/query', {
      method: 'POST',
      body: JSON.stringify({ query: sql })
    })
    setResults(await res.json())
  }}
/>
```

### Pattern 3: With History
```typescript
const { query, setQuery, history, addToHistory } = useSQLQuery()

return (
  <>
    <SQLEditor
      initialQuery={query}
      onQueryChange={setQuery}
      onQuerySubmit={(sql) => addToHistory(sql)}
    />
    <div>
      {history.map(item => (
        <button onClick={() => setQuery(item.query)}>
          {item.query.substring(0, 40)}...
        </button>
      ))}
    </div>
  </>
)
```

### Pattern 4: Modal Editor
```typescript
const [showEditor, setShowEditor] = useState(false)

return (
  <>
    <button onClick={() => setShowEditor(true)}>Edit</button>
    {showEditor && (
      <Modal onClose={() => setShowEditor(false)}>
        <SQLEditor height="600px" />
      </Modal>
    )}
  </>
)
```

## 🎨 Syntax Highlighting Colors

```css
Keywords  → Blue (#2563eb)
Strings   → Green (#059669)
Numbers   → Orange (#d97706)
Comments  → Gray (#6b7280)
```

Dark mode automatically adjusts colors.

## 📚 Examples Location

```
src/components/SQLEditorDemo.tsx        // Full demo
src/utils/INTEGRATION_EXAMPLES.ts       // 6+ patterns
src/components/SQL_EDITOR_README.md     // Full docs
```

## 🔍 File Structure

```
src/
├── components/
│   ├── SQLEditor.tsx                   // Main component
│   ├── SQLEditor.css                   // Styles
│   ├── SQLEditorDemo.tsx               // Demo
│   ├── SQL_EDITOR_README.md            // Documentation
│   └── index.ts                        // Exports
│
└── utils/
    ├── sqlFormatter.ts                 // Formatting
    ├── useSQLQuery.ts                  // State hook
    └── INTEGRATION_EXAMPLES.ts         // Code examples
```

## ⚙️ Customization

### Change Highlight Colors
Edit `SQLEditor.css`:
```css
.sql-keyword { color: #YOUR_COLOR; }
.sql-string { color: #YOUR_COLOR; }
```

### Add More Keywords
Edit `sqlFormatter.ts`:
```typescript
const SQL_KEYWORDS = [
  'YOUR_KEYWORD',
  ...existing
]
```

### Change Default Height
```typescript
<SQLEditor height="600px" />  // Default 400px
```

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Highlighting not working | Import `SQLEditor.css` |
| Copy button failing | Ensure HTTPS or localhost |
| Dark mode not working | Check Tailwind dark mode config |
| Formatting not working | Query must be non-empty |
| History not persisting | Enable `persistToLocalStorage` |

## 📱 Responsive Behavior

```
Mobile (< 768px)    → Vertical layout
Tablet (768-1024px) → Single column
Desktop (> 1024px)  → Full split view
```

## ♿ Accessibility

- ✅ Keyboard navigation fully supported
- ✅ ARIA labels on all buttons
- ✅ Focus indicators on interactive elements
- ✅ High contrast in dark mode
- ✅ Semantic HTML structure

## 🔑 Keyboard Shortcuts

```
Tab         → Indent code
Shift+Tab   → Outdent code
Ctrl+A      → Select all
Ctrl+C      → Copy
Ctrl+Z      → Undo (browser default)
```

## 💡 Pro Tips

1. **Use Split View** - See editor and preview side-by-side
2. **Enable Auto-format** - Automatic formatting as you type
3. **Use History** - Reuse queries with click
4. **Export Queries** - Save as SQL files for backup
5. **Search History** - Quick find previous queries

## 📞 Support

- Full docs: `SQL_EDITOR_README.md`
- Examples: `INTEGRATION_EXAMPLES.ts`
- Demo: `SQLEditorDemo.tsx`
- Memory: `/memories/repo/sql-editor-docs.md`

---

**Last Updated**: May 2026  
**Version**: 1.0.0  
**Status**: Production Ready
