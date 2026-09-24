import { useState } from 'react'
import './App.css'
import { LookupForm } from './components/LookupForm'
import { ResultPanel } from './components/ResultPanel'
import { lookupPrice, type LookupResult } from './lookup'

interface Submitted {
  provider: string
  model: string
  result: LookupResult
}

const version = __GENAI_PRICES_VERSION__

export default function App() {
  const [provider, setProvider] = useState('')
  const [model, setModel] = useState('')
  const [submitted, setSubmitted] = useState<Submitted | null>(null)

  return (
    <main>
      <header>
        <h1>GenAI price lookup</h1>
        <p className="muted">
          Check whether a provider and model string is recognized by{' '}
          <a href="https://github.com/pydantic/genai-prices" target="_blank" rel="noreferrer">
            genai-prices
          </a>
          , and what it's priced at. All matching is done by the library.
        </p>
      </header>

      <LookupForm
        provider={provider}
        model={model}
        onProviderChange={setProvider}
        onModelChange={setModel}
        onSubmit={() => setSubmitted({ provider, model, result: lookupPrice(provider, model) })}
      />

      {submitted && (
        <ResultPanel
          result={submitted.result}
          providerInput={submitted.provider}
          modelInput={submitted.model}
        />
      )}

      <footer>
        Using{' '}
        <a
          href={`https://www.npmjs.com/package/@pydantic/genai-prices/v/${version}`}
          target="_blank"
          rel="noreferrer"
        >
          @pydantic/genai-prices v{version}
        </a>{' '}
        (bundled price data)
      </footer>
    </main>
  )
}
