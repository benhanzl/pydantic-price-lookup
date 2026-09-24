import { TieredPrices } from '@pydantic/genai-prices'
import { describe, expect, it } from 'vitest'
import {
  describeConstraint,
  describeMatch,
  describePriceKey,
  describeTierStart,
  formatUsd,
  isTiered,
} from './format'

describe('describePriceKey', () => {
  it.each([
    ['input_mtok', 'Input', 'per 1M tokens'],
    ['cache_write_1h_mtok', 'Cache write (1h)', 'per 1M tokens'],
    ['input_audio_mtok', 'Input audio', 'per 1M tokens'],
    ['web_searches_kcount', 'Web searches', 'per 1K'],
    ['input_document_kpages', 'Input document', 'per 1K pages'],
    ['audio_hours', 'Audio', 'per hour'],
  ])('%s → %s, %s', (key, label, unit) => {
    expect(describePriceKey(key)).toEqual({ label, unit })
  })

  it('shows unknown keys raw', () => {
    expect(describePriceKey('something_new')).toEqual({ label: 'something_new', unit: '' })
  })
})

describe('formatUsd', () => {
  it('always shows at least two decimals', () => {
    expect(formatUsd(10)).toBe('$10.00')
    expect(formatUsd(2.5)).toBe('$2.50')
  })

  it('keeps precision for small values', () => {
    expect(formatUsd(0.035)).toBe('$0.035')
    expect(formatUsd(0.0000125)).toBe('$0.0000125')
  })
})

describe('tiered prices', () => {
  it('distinguishes tiered from flat prices', () => {
    expect(isTiered(3)).toBe(false)
    expect(isTiered(new TieredPrices({ base: 3, tiers: [{ start: 200000, price: 6 }] }))).toBe(true)
  })

  it('describes the tier threshold', () => {
    expect(describeTierStart(200000)).toBe('Input > 200,000 tokens')
  })
})

describe('describeMatch', () => {
  it('describes each leaf rule', () => {
    expect(describeMatch({ equals: 'a' })).toBe('equals "a"')
    expect(describeMatch({ starts_with: 'a' })).toBe('starts with "a"')
    expect(describeMatch({ ends_with: 'a' })).toBe('ends with "a"')
    expect(describeMatch({ contains: 'a' })).toBe('contains "a"')
    expect(describeMatch({ regex: '^a$' })).toBe('matches regex /^a$/')
  })

  it('joins top-level clauses without parentheses', () => {
    expect(describeMatch({ or: [{ equals: 'a' }, { equals: 'b' }] })).toBe('equals "a" OR equals "b"')
  })

  it('parenthesizes nested groups', () => {
    expect(
      describeMatch({
        and: [{ starts_with: 'gemini' }, { or: [{ contains: 'pro' }, { contains: 'flash' }] }],
      }),
    ).toBe('starts with "gemini" AND (contains "pro" OR contains "flash")')
  })
})

describe('describeConstraint', () => {
  it('labels unconstrained prices as the default', () => {
    expect(describeConstraint(undefined)).toBe('Default (when no other period applies)')
  })

  it('describes a start date', () => {
    expect(describeConstraint({ type: 'start_date', start_date: '2026-03-13' })).toBe('From 2026-03-13')
  })

  it('describes a time-of-day window in UTC', () => {
    expect(
      describeConstraint({ type: 'time_of_date', start_time: '00:30:00Z', end_time: '16:30:00Z' }),
    ).toBe('00:30–16:30 UTC')
  })
})
