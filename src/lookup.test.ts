import { calcPrice } from '@pydantic/genai-prices'
import { describe, expect, it, vi } from 'vitest'
import { lookupPrice } from './lookup'

// Wrap the real implementation so calls can be inspected without changing behaviour.
vi.mock('@pydantic/genai-prices', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@pydantic/genai-prices')>()
  return { ...actual, calcPrice: vi.fn(actual.calcPrice) }
})

// These run against the real bundled price data, so they double as a check
// that the library still resolves the strings we expect.
describe('lookupPrice', () => {
  it('finds a model under an explicit provider', () => {
    const result = lookupPrice('openai', 'gpt-4o')
    expect(result.status).toBe('found')
    if (result.status !== 'found') return
    expect(result.calc.provider.id).toBe('openai')
    expect(result.calc.model.id).toBe('gpt-4o')
    expect(result.calc.model_price.input_mtok).toBeTypeOf('number')
  })

  it("reports the library's resolved model, not the input", () => {
    const result = lookupPrice('openai', 'gpt-4o-2024-08-06')
    expect(result.status === 'found' && result.calc.model.id).toBe('gpt-4o')
  })

  it('lets the library infer the provider when none is given', () => {
    const result = lookupPrice('', 'claude-sonnet-4-5-20250929')
    expect(result.status === 'found' && result.calc.provider.id).toBe('anthropic')
  })

  it('treats a whitespace-only provider as no provider', () => {
    const result = lookupPrice('   ', 'claude-sonnet-4-5-20250929')
    expect(result.status === 'found' && result.calc.provider.id).toBe('anthropic')
  })

  it('reports an unrecognized provider', () => {
    expect(lookupPrice('nonexistent', 'gpt-4o')).toEqual({ status: 'provider-not-found' })
  })

  it('reports a recognized provider with no matching model', () => {
    const result = lookupPrice('openai', 'totally-fake-model')
    expect(result.status).toBe('model-not-found')
    expect(result.status === 'model-not-found' && result.provider.id).toBe('openai')
  })

  it('reports no match when no provider is given and nothing matches', () => {
    expect(lookupPrice('', 'totally-fake-model')).toEqual({ status: 'no-match' })
  })

  it('passes both strings to the library unmodified', () => {
    lookupPrice('  OpenAI ', ' GPT-4O  ')
    expect(calcPrice).toHaveBeenCalledWith({}, ' GPT-4O  ', { providerId: '  OpenAI ' })
  })
})
