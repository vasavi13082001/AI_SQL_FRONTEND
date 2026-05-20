# SQL Editor Component

A powerful, feature-rich SQL editor component built with React and TypeScript. Includes syntax highlighting, formatting, validation, and editable query preview.

## Features

### 🎨 Syntax Highlighting
- Color-coded SQL keywords (blue)
- String literals in green
- Numbers in orange
- Comments in gray
- Real-time highlighting in preview pane

### 🔧 Query Formatting
- Intelligent SQL formatting with automatic indentation
- Uppercase keywords for consistency
- Proper line breaks before major SQL clauses
- One-click format button
- Auto-format toggle for real-time formatting

### 👁️ Multiple View Modes
- **Editor Only** - Focus on writing
- **Preview Only** - Focus on formatted output
- **Split View** - See editor and preview side-by-side (default)

### 🛠️ Query Tools
| Tool | Description |
|------|-------------|
| **Copy** | Copy formatted query to clipboard |
| **Format** | Format query with proper indentation |
| **Minify** | Remove unnecessary whitespace |
| **Export** | Download query as `.sql` file |
| **Clear** | Clear the editor |
| **Execute** | Submit query (with callback) |

### 📊 Query Statistics
- Line count
- Keyword count
- Table count
- Function count
- Query validation status

### ✅ Query Validation
- Basic validation (checks if query starts with valid SQL command)
- Visual indicator: Valid (green) / Invalid (amber)

### 🌙 Dark Mode Support
- Full Tailwind dark mode integration
- Automatic theme switching
- Accessible color contrasts

## Installation

1. Copy the component files to your project:
   ```
   src/components/SQLEditor.tsx
   src/components/SQLEditor.css
   src/utils/sqlFormatter.ts
   ```

2. Make sure you have required dependencies:
   ```json
   {
     "dependencies": {
       "react": "^18.2.0",
       "lucide-react": "^0.294.0"
     }
   }
   ```

## Usage

### Basic Usage
```typescript
import SQLEditor from './components/SQLEditor'

export function MyComponent() {
  return <SQLEditor height="500px" />
}
```

### With Callbacks
```typescript
import { useState } from 'react'
import SQLEditor from './components/SQLEditor'

export function QueryBuilder() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState('')

  const handleSubmit = async (sql: string) => {
    const response = await fetch('/api/query', {
      method: 'POST',
      body: JSON.stringify({ sql })
    })
    const data = await response.json()
    setResult(data)
  }

  return (
    <>
      <SQLEditor
        initialQuery="SELECT * FROM users LIMIT 10"
        onQueryChange={(q) => setQuery(q)}
        onQuerySubmit={handleSubmit}
        height="500px"
      />
      {result && <div>Results: {JSON.stringify(result)}</div>}
    </>
  )
}
```

### Advanced Usage
```typescript
import SQLEditor from './components/SQLEditor'

export function AdvancedEditor() {
  return (
    <SQLEditor
      initialQuery={`SELECT
  id,
  name,
  email,
  created_at
FROM users
WHERE status = 'active'
ORDER BY created_at DESC`}
      onQueryChange={(query) => {
        // Save to localStorage or state
        console.log('Query changed:', query)
      }}
      onQuerySubmit={(query) => {
        // Execute query
        console.log('Executing:', query)
      }}
      readOnly={false}
      height="600px"
    />
  )
}
```

## API Reference

### SQLEditor Props

```typescript
interface SQLEditorProps {
  /**
   * Initial SQL query to display in the editor
   * @default ''
   */
  initialQuery?: string

  /**
   * Callback fired when the query text changes
   */
  onQueryChange?: (query: string) => void

  /**
   * Callback fired when the Execute button is clicked
   */
  onQuerySubmit?: (query: string) => void

  /**
   * Make the editor read-only (disables formatting and clear buttons)
   * @default false
   */
  readOnly?: boolean

  /**
   * Height of the editor container (CSS value)
   * @default '400px'
   */
  height?: string
}
```

### Formatter Utilities

#### `formatSQL(sql, options)`
Format SQL query with proper indentation and line breaks.

```typescript
import { formatSQL } from './utils/sqlFormatter'

const formatted = formatSQL('select * from users where id = 1', {
  indent: 2,      // Spaces per indent level
  uppercase: true // Uppercase keywords
})
```

#### `minifySQL(sql)`
Remove unnecessary whitespace and minimize query.

```typescript
import { minifySQL } from './utils/sqlFormatter'

const minified = minifySQL('SELECT * FROM users WHERE id = 1')
// Output: "SELECT*FROM users WHERE id=1"
```

#### `isValidSQL(sql)`
Validate if text is a valid SQL query.

```typescript
import { isValidSQL } from './utils/sqlFormatter'

isValidSQL('SELECT * FROM users')     // true
isValidSQL('INVALID SQL')             // false
isValidSQL('Hello world')             // false
```

#### `getSQLStats(sql)`
Get statistics about the SQL query.

```typescript
import { getSQLStats } from './utils/sqlFormatter'

const stats = getSQLStats('SELECT u.*, o.* FROM users u JOIN orders o...')
// Output: { keywords: 5, tables: 2, functions: 0, lines: 1 }
```

## Supported SQL Keywords

### Query Types
SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, WITH, DECLARE, BEGIN, GRANT, REVOKE

### Clauses
FROM, WHERE, AND, OR, NOT, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET, DISTINCT

### Joins
JOIN, INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN, CROSS JOIN, ON, USING

### Functions
COUNT, SUM, AVG, MIN, MAX, ROW_NUMBER, PARTITION, OVER, CAST, COALESCE, and 30+ more

### Other
CASE, WHEN, THEN, ELSE, END, UNION, EXCEPT, INTERSECT, IN, LIKE, BETWEEN, IS, NULL

## Styling

The component uses Tailwind CSS for styling and includes dark mode support. All classes are namespaced with the component to avoid conflicts.

### CSS Classes
- `.sql-editor-container` - Main container
- `.sql-preview` - Preview pane with syntax highlighting
- `.sql-keyword` - Keyword highlighting
- `.sql-string` - String highlighting
- `.sql-number` - Number highlighting
- `.sql-comment` - Comment highlighting

### Customization

To customize colors, edit the CSS in `SQLEditor.css`:

```css
.sql-keyword {
  color: #2563eb; /* Change keyword color */
  font-weight: 600;
}

.dark .sql-keyword {
  color: #60a5fa; /* Dark mode keyword color */
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Insert 2 spaces (in textarea) |
| `Ctrl/Cmd + A` | Select all text |
| `Ctrl/Cmd + C` | Copy selected text |

## Responsive Design

The component is responsive and works well on mobile, tablet, and desktop:
- On mobile: View modes stack vertically
- On tablet: Single column layout with horizontal scroll
- On desktop: Full split-view mode

## Performance

- Efficient regex-based syntax highlighting
- Memoized formatted query to prevent unnecessary recalculations
- Debounced stats calculation
- Lazy highlighting for large queries (no lag with 5000+ line queries)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- Full keyboard navigation
- ARIA labels on buttons
- High contrast colors in dark mode
- Focus indicators on interactive elements
- Semantic HTML structure

## Examples

### Demo Component
See `SQLEditorDemo.tsx` for a complete working example with:
- Query execution simulation
- Results display
- Feature overview

### Integration with Dashboard
```typescript
// In Dashboard.tsx
import SQLEditor from './SQLEditor'

export function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SQLEditor height="500px" />
      </div>
      <div className="card">
        {/* Results panel */}
      </div>
    </div>
  )
}
```

## Troubleshooting

### Syntax highlighting not working
- Ensure `SQLEditor.css` is imported
- Check that Tailwind dark mode is properly configured

### Copy button not working
- Ensure browser has `navigator.clipboard` API support
- Check for HTTPS (required on production)

### Format button not applying changes
- Component must not be in `readOnly` mode
- Query must be non-empty

### Theme not switching
- Ensure the html element has `dark` class for dark mode
- Check Tailwind dark mode configuration in `tailwind.config.js`

## Contributing

To extend the formatter:

1. Add new keywords to `SQL_KEYWORDS` array in `sqlFormatter.ts`
2. Update regex patterns in the component as needed
3. Test with various SQL dialects

## License

Part of the AI SQL Frontend project.

## Related Components

- `MetadataExplorer` - Browse database schema
- `Dashboard` - Main dashboard component
- `AIQueryInput` - AI-powered query suggestions
