interface Props {
  provider: string
  model: string
  onProviderChange: (value: string) => void
  onModelChange: (value: string) => void
  onSubmit: () => void
}

// Browser autocomplete, autocapitalize and spellcheck are off so the strings
// reaching genai-prices are exactly what was typed.
const inputProps = {
  autoComplete: 'off',
  autoCapitalize: 'off',
  autoCorrect: 'off',
  spellCheck: false,
} as const

export function LookupForm({ provider, model, onProviderChange, onModelChange, onSubmit }: Props) {
  return (
    <form
      className="lookup-form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <label>
        <span>
          Provider <span className="muted">(optional)</span>
        </span>
        <input
          {...inputProps}
          name="provider"
          value={provider}
          placeholder="e.g. openai, or leave blank"
          onChange={(e) => onProviderChange(e.target.value)}
        />
      </label>
      <label>
        <span>Model</span>
        <input
          {...inputProps}
          name="model"
          value={model}
          placeholder="e.g. gpt-4o-2024-08-06"
          required
          onChange={(e) => onModelChange(e.target.value)}
        />
      </label>
      <button type="submit" disabled={model === ''}>
        Look up
      </button>
    </form>
  )
}
