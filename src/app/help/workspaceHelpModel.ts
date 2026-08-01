export interface AxisHelpMetadata {
  readonly summary?: string | undefined;
  readonly documentationRoute?: string | undefined;
  readonly documentationFragment?: string | undefined;
}

export function documentationHref(
  help: AxisHelpMetadata | undefined,
): string | undefined {
  if (!help?.documentationRoute) return undefined;
  return help.documentationFragment
    ? `${help.documentationRoute}#${help.documentationFragment}`
    : help.documentationRoute;
}
