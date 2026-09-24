import type { ModelPrice } from '@pydantic/genai-prices'
import { describePriceKey, describeTierStart, formatUsd, isTiered } from '../format'

export function PriceTable({ prices, caption }: { prices: ModelPrice; caption?: string }) {
  const rows = Object.entries(prices).filter(
    (entry): entry is [string, NonNullable<(typeof entry)[1]>] => entry[1] !== undefined,
  )
  if (rows.length === 0) {
    return <p className="muted">No prices listed.</p>
  }
  return (
    <table className="price-table">
      {caption && <caption>{caption}</caption>}
      <thead>
        <tr>
          <th scope="col">Component</th>
          <th scope="col">Price (USD)</th>
          <th scope="col">Unit</th>
          <th scope="col">Key</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([key, value]) => {
          const { label, unit } = describePriceKey(key)
          return (
            <tr key={key}>
              <th scope="row">{label}</th>
              <td className="price">
                {isTiered(value) ? (
                  <>
                    {formatUsd(value.base)}
                    <ul className="tiers">
                      {value.tiers.map((tier) => (
                        <li key={tier.start}>
                          {describeTierStart(tier.start)}: {formatUsd(tier.price)}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  formatUsd(value)
                )}
              </td>
              <td>{unit}</td>
              <td>
                <code>{key}</code>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
