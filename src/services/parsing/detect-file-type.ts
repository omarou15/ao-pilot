export type FileType = 'cctp' | 'dpgf' | 'rc' | 'plan' | 'other';

// ─── Filename patterns ──────────────────────────────────────────────────────

const FILENAME_PATTERNS: [FileType, RegExp][] = [
  ['cctp', /cctp/i],
  ['dpgf', /dpgf/i],
  ['rc', /r[eè]glement|rc/i],
  ['plan', /plan|coupe|fa[cç]ade/i],
];

// ─── Content keyword sets ───────────────────────────────────────────────────

const CONTENT_KEYWORDS: [FileType, RegExp[]][] = [
  [
    'cctp',
    [
      /cahier\s+des\s+clauses\s+techniques/i,
      /prescriptions\s+techniques/i,
      /article/i,
    ],
  ],
  [
    'dpgf',
    [
      /prix\s+unitaire/i,
      /d[eé]composition\s+du\s+prix/i,
      /bordereau/i,
      /quantit[eé]/i,
    ],
  ],
  [
    'rc',
    [
      /crit[eè]res\s+de\s+jugement/i,
      /r[eè]glement\s+de\s+consultation/i,
      /date\s+limite/i,
      /remise\s+des\s+offres/i,
    ],
  ],
  [
    'plan',
    [/[eé]chelle/i, /coupe/i, /fa[cç]ade/i, /plan\s+de\s+masse/i],
  ],
];

/**
 * Detect the type of a DCE document using filename and text heuristics.
 *
 * Priority:
 *  1. Filename match (strongest signal)
 *  2. Text content keyword scoring (most keyword hits wins)
 */
export function detectDocumentType(
  fileName: string,
  textContent: string
): FileType {
  // 1. Filename-based detection
  const nameLower = fileName.toLowerCase();
  for (const [type, pattern] of FILENAME_PATTERNS) {
    if (pattern.test(nameLower)) {
      return type;
    }
  }

  // 2. Content-based detection — score each type by keyword hits
  let bestType: FileType = 'other';
  let bestScore = 0;

  for (const [type, patterns] of CONTENT_KEYWORDS) {
    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(textContent)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestType = type;
    }
  }

  // Require at least 2 keyword matches to be confident
  return bestScore >= 2 ? bestType : 'other';
}
