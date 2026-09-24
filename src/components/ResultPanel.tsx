import type { PriceCalculation } from '@pydantic/genai-prices'
import { Fragment, type ReactNode } from 'react'
import { describeConstraint, describeMatch } from '../format'
import type { LookupResult } from '../lookup'
import { PriceTable } from './PriceTable'

interface Props {
  result: LookupResult
  /** The strings that were submitted, exactly as typed. */
  providerInput: string
  modelInput: string
}

export function ResultPanel({ result, providerInput, modelInput }: Props) {
  switch (result.status) {
    case 'found':
      return <FoundResult calc={result.calc} providerInput={providerInput} modelInput={modelInput} />
    case 'provider-not-found':
      return (
        <NotFound>
          Provider <code>{providerInput}</code> is not recognized by genai-prices.
        </NotFound>
      )
    case 'model-not-found':
      return (
        <NotFound>
          Provider <code>{providerInput}</code>{' '}
          {providerInput === result.provider.id ? (
            <>({result.provider.name}) was recognized</>
          ) : (
            <>
              was recognized as <code>{result.provider.id}</code> ({result.provider.name})
            </>
          )}
          , but none of its models match <code>{modelInput}</code>.
        </NotFound>
      )
    case 'no-match':
      return (
        <NotFound>
          No provider given, and genai-prices found no provider with a model matching{' '}
          <code>{modelInput}</code>.
        </NotFound>
      )
  }
}

function NotFound({ children }: { children: ReactNode }) {
  return (
    <section className="result not-found" aria-live="polite">
      <p className="status">Not supported</p>
      <p>{children}</p>
    </section>
  )
}

function FoundResult({
  calc,
  providerInput,
  modelInput,
}: {
  calc: PriceCalculation
  providerInput: string
  modelInput: string
}) {
  const { provider, model } = calc
  const periods = Array.isArray(model.prices) ? model.prices : null
  const priceComments = [
    { label: 'Model price notes', text: model.price_comments },
    { label: 'Provider price notes', text: provider.price_comments },
  ].filter((c) => c.text)

  return (
    <section className="result found" aria-live="polite">
      <p className="status">Supported</p>

      <dl className="resolution">
        <dt>You entered</dt>
        <dd>
          {providerInput.trim() === '' ? (
            <span className="muted">(no provider)</span>
          ) : (
            <code>{providerInput}</code>
          )}{' '}
          / <code>{modelInput}</code>
        </dd>
        <dt>Matched provider</dt>
        <dd>
          <code>{provider.id}</code> {provider.name}
        </dd>
        <dt>Matched model</dt>
        <dd>
          <code>{model.id}</code> {model.name}
          {model.deprecated && <span className="badge">Deprecated</span>}
        </dd>
      </dl>

      <h2>Current prices</h2>
      <PriceTable prices={calc.model_price} />

      {periods && (
        <>
          <h2>All price periods</h2>
          <p className="muted">
            This model's price depends on the date or time of day. The current prices above are one of
            these.
          </p>
          {periods.map((period, i) => (
            <PriceTable
              key={i}
              prices={period.prices}
              caption={
                describeConstraint(period.constraint) +
                (period.prices === calc.model_price ? ' — current' : '')
              }
            />
          ))}
        </>
      )}

      <h2>Details</h2>
      <dl className="details">
        <dt>Match rule</dt>
        <dd>
          <code>{describeMatch(model.match)}</code>
        </dd>
        {model.context_window !== undefined && (
          <>
            <dt>Context window</dt>
            <dd>{model.context_window.toLocaleString('en-US')} tokens</dd>
          </>
        )}
        {model.description && (
          <>
            <dt>Description</dt>
            <dd>{model.description}</dd>
          </>
        )}
        {priceComments.map((c) => (
          <Fragment key={c.label}>
            <dt>{c.label}</dt>
            <dd>{c.text}</dd>
          </Fragment>
        ))}
        {provider.pricing_urls && provider.pricing_urls.length > 0 && (
          <>
            <dt>Provider pricing pages</dt>
            <dd>
              <ul className="links">
                {provider.pricing_urls.map((url) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noreferrer">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </dd>
          </>
        )}
      </dl>
    </section>
  )
}
