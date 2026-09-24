import type { ConditionalPrice, MatchLogic, TieredPrices } from '@pydantic/genai-prices'

// Display helpers only. Nothing in here decides whether a model matches; that
// is entirely up to genai-prices.

const UNIT_SUFFIXES: [suffix: string, unit: string][] = [
  ['_mtok', 'per 1M tokens'],
  ['_kcount', 'per 1K'],
  ['_kpages', 'per 1K pages'],
  ['_hours', 'per hour'],
]

/** Turn a genai-prices price key like `cache_write_1h_mtok` into a label and unit. */
export function describePriceKey(key: string): { label: string; unit: string } {
  for (const [suffix, unit] of UNIT_SUFFIXES) {
    if (key.endsWith(suffix) && key.length > suffix.length) {
      return { label: humanize(key.slice(0, -suffix.length)), unit }
    }
  }
  // Unknown unit: show the raw key rather than guess.
  return { label: key, unit: '' }
}

function humanize(snake: string): string {
  const words = snake
    .split('_')
    .map((word) => (/^\d+[a-z]$/.test(word) ? `(${word})` : word))
    .join(' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 10,
})

export function formatUsd(value: number): string {
  return usd.format(value)
}

export function isTiered(value: number | TieredPrices): value is TieredPrices {
  return typeof value === 'object'
}

/** Human-readable threshold for a tier. The library applies a tier when input tokens exceed `start`. */
export function describeTierStart(start: number): string {
  return `Input > ${start.toLocaleString('en-US')} tokens`
}

/** Render the library's own match rule as text, e.g. `starts with "gpt-4o" OR equals "x"`. */
export function describeMatch(logic: MatchLogic): string {
  return describeMatchInner(logic, false)
}

function describeMatchInner(logic: MatchLogic, nested: boolean): string {
  if ('and' in logic || 'or' in logic) {
    const [op, clauses] = 'and' in logic ? ['AND', logic.and] : ['OR', logic.or]
    const text = clauses.map((clause) => describeMatchInner(clause, true)).join(` ${op} `)
    return nested && clauses.length > 1 ? `(${text})` : text
  }
  if ('equals' in logic) return `equals "${logic.equals}"`
  if ('starts_with' in logic) return `starts with "${logic.starts_with}"`
  if ('ends_with' in logic) return `ends with "${logic.ends_with}"`
  if ('contains' in logic) return `contains "${logic.contains}"`
  return `matches regex /${logic.regex}/`
}

/** Describe when a conditional price applies. */
export function describeConstraint(constraint: ConditionalPrice['constraint']): string {
  if (!constraint) return 'Default (when no other period applies)'
  if (constraint.type === 'start_date') return `From ${constraint.start_date}`
  return `${formatUtcTime(constraint.start_time)}–${formatUtcTime(constraint.end_time)} UTC`
}

function formatUtcTime(time: string): string {
  // Data uses `HH:MM:SSZ`; drop zero seconds and the Z since we label it UTC.
  const m = /^(\d{2}:\d{2})(?::(\d{2}))?Z$/.exec(time)
  if (!m) return time
  return m[2] && m[2] !== '00' ? `${m[1]}:${m[2]}` : m[1]
}
