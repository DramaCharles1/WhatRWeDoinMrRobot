export type StageName = "create" | "retrieve/list" | "delete";

export async function withStage<T>(stage: StageName, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    throw new Error(formatStageError(stage, error));
  }
}

export function formatStageError(stage: StageName, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return `[E2E stage: ${stage}] ${message}`;
}
