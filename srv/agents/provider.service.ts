import * as mockProvider from "./providers/mock.provider";
import type { GenerateRequest, GenerateResponse } from "./types/provider.types";

/**
 * Resolves ModelConfigurations.provider to an implementation.
 *
 * To add a real model: create providers/<name>.provider.ts exporting
 * `generate(request: GenerateRequest): Promise<GenerateResponse>`, add a case
 * here, and point the Agents' modelConfig at a ModelConfiguration with that
 * provider. Nothing else in the runtime changes.
 */
export async function generate(
  provider: string,
  request: GenerateRequest,
): Promise<GenerateResponse> {
  switch (provider) {
    case "MOCK":
      return mockProvider.generate(request);

    default:
      throw new Error(
        `Model provider "${provider}" is not implemented. ` +
          `Add agents/providers/${provider.toLowerCase()}.provider.ts and register it in provider.service.ts.`,
      );
  }
}
