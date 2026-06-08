import { useState, useRef, useEffect } from 'react'

/**
 * Searchable dropdown select.
 * Props:
 *   value        - current selected value (string)
 *   onChange     - callback(value)
 *   options      - array of { value, label, sub? } or strings
 *   placeholder  - input placeholder
 *   className    - extra classes
 */
export default function SearchableSelect({ value, onChange, options, placeholder = 'Search...', className = '' }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Normalise options to { value, label, sub }
  const normalised = options.map(o =>
    typeof o === 'string' ? { value: o, label: o } : o
  )

  const filtered = query.trim()
    ? normalised.filter(o =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        (o.sub && o.sub.toLowerCase().includes(query.toLowerCase()))
      )
    : normalised

  const selectedLabel = normalised.find(o => o.value === value)?.label || ''

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function select(val) {
    onChange(val)
    setQuery('')
    setOpen(false)
  }

  function clear(e) {
    e.stopPropagation()
    onChange('')
    setQuery('')
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger / search input */}
      <div
        className="w-full bg-pitch border border-grass rounded-lg px-3 py-2 flex items-center gap-2 cursor-pointer focus-within:border-lime transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        {open ? (
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
            onClick={e => e.stopPropagation()}
            className="flex-1 bg-transparent text-sm outline-none text-white placeholder-muted"
          />
        ) : (
          <span className={`flex-1 text-sm truncate ${value ? 'text-white' : 'text-muted'}`}>
            {value ? selectedLabel : <span className="text-muted">{placeholder}</span>}
          </span>
        )}
        {value && !open && (
          <button onClick={clear} className="text-muted hover:text-red-400 text-xs shrink-0">✕</button>
        )}
        <span className="text-muted text-xs shrink-0">{open ? '▲' : '▼'}</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-pitch border border-grass rounded-lg shadow-xl max-h-56 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-xs text-muted font-mono">No results for "{query}"</div>
          ) : (
            filtered.map(o => (
              <button
                key={o.value}
                onClick={() => select(o.value)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-grass/30 transition-colors flex items-center justify-between gap-2
                  ${o.value === value ? 'bg-lime/10 text-lime font-bold' : 'text-white'}`}
              >
                <span className="truncate">{o.label}</span>
                {o.sub && <span className="text-xs text-white/60 font-mono shrink-0">{o.sub}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
