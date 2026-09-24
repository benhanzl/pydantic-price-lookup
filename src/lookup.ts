import {
  calcPrice,
  findProvider,
  type PriceCalculation,
  type Provider,
} from '@pydantic/genai-prices'

export type LookupResult =
  | { status: 'found'; calc: PriceCalculation }
  | { status: 'provider-not-found' }
  /** The provider was recognised, but none of its models matched. */
  | { status: 'model-not-found'; provider: Provider }
  /** No provider was given, and the library couldn't infer one from the model. */
  | { status: 'no-match' }

/**
 * Look up a provider/model pair using only genai-prices' own matching.
 *
 * Both strings are passed to the library exactly as typed; this app does no
 * trimming, case-folding or matching of its own. The one exception is a blank
 * provider field, which means "no provider given" and lets the library infer it.
 */
export function lookupPrice(providerInput: string, modelInput: string): LookupResult {
  const hasProvider = providerInput.trim() !== ''
  const calc = calcPrice({}, modelInput, hasProvider ? { providerId: providerInput } : {})
  if (calc) {
    return { status: 'found', calc }
  }
  if (!hasProvider) {
    return { status: 'no-match' }
  }
  const provider = findProvider({ providerId: providerInput })
  return provider ? { status: 'model-not-found', provider } : { status: 'provider-not-found' }
}
