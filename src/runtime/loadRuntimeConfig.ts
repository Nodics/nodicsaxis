import { parseRuntimeConfig, type AxisRuntimeConfig } from './runtimeConfig';

const RUNTIME_CONFIG_PATH = '/axis-config.json';

export async function loadRuntimeConfig(
  fetchImplementation: typeof fetch = fetch,
): Promise<AxisRuntimeConfig> {
  let response: Response;
  try {
    response = await fetchImplementation(RUNTIME_CONFIG_PATH, {
      cache: 'no-store',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    });
  } catch {
    throw new Error('Axis runtime configuration could not be reached');
  }

  if (!response.ok) {
    throw new Error(
      `Axis runtime configuration returned HTTP ${String(response.status)}`,
    );
  }

  let document: unknown;
  try {
    document = await response.json();
  } catch {
    throw new Error('Axis runtime configuration is not valid JSON');
  }

  return parseRuntimeConfig(document);
}
