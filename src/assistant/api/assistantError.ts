import { assistantRecord } from './assistantContractParsers';

export class AssistantApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly traceId?: string | undefined;

  constructor(
    message: string,
    status: number,
    code = 'ERR_AXIS_ASSISTANT_REQUEST',
    traceId?: string,
  ) {
    super(message);
    this.name = 'AssistantApiError';
    this.status = status;
    this.code = code;
    this.traceId = traceId;
  }
}

export async function assistantApiError(
  response: Response,
): Promise<AssistantApiError> {
  let body: Record<string, unknown> = {};
  try {
    body = assistantRecord(await response.json(), 'Assistant error response');
  } catch {
    // A bounded generic fallback is required when no backend message is available.
  }
  const message =
    typeof body.message === 'string' && body.message.trim() !== ''
      ? body.message
      : `Assistant request returned HTTP ${String(response.status)}`;
  return new AssistantApiError(
    message,
    response.status,
    typeof body.code === 'string' ? body.code : undefined,
    typeof body.traceId === 'string' ? body.traceId : undefined,
  );
}
