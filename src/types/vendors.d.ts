// Type stubs for packages that lack bundler-compatible exports maps.
// These are intentionally loose — runtime behaviour is all that matters.

declare module '@xenova/transformers' {
  type FeatureExtractionResult = { data: Float32Array }
  type FeaturePipeline = (text: string, opts: Record<string, unknown>) => Promise<FeatureExtractionResult>

  export function pipeline(
    task: 'feature-extraction',
    model?: string,
    options?: Record<string, unknown>
  ): Promise<FeaturePipeline>

  export const env: {
    allowRemoteModels: boolean
    useBrowserCache: boolean
    [key: string]: unknown
  }
}
