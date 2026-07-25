const preservedTerms = new Map<string, string>([
  ['ai', 'AI'],
  ['api', 'API'],
  ['cms', 'CMS'],
  ['id', 'ID'],
  ['ui', 'UI'],
]);

/**
 * Converts a stable backend identifier into readable fallback copy.
 *
 * Backend identifiers remain authoritative for requests. This formatter is
 * presentation-only and may be replaced by a backend-provided display name
 * when the corresponding contract supplies one.
 */
export function contextDisplayName(identifier: string): string {
  return identifier
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => {
      const normalized = term.toLowerCase();
      return (
        preservedTerms.get(normalized) ??
        `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`
      );
    })
    .join(' ');
}
