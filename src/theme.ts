export const colors = {
  background: '#040805',
  surface: '#102013',
  card: 'rgba(17, 32, 19, 0.68)',
  border: 'rgba(218, 230, 209, 0.14)',
  text: '#F2F1EC',
  mutedText: '#B3BCAA',
  gold: '#C2A96D',
  brass: '#B79A63',
  moss: '#4E5F3E',
  pine: '#4D9249',
  sage: '#7AA46D',
  leaf: '#6E8F43',
  amber: '#A8772A',
  mist: 'rgba(205, 208, 207, 0.08)',

  // --- Semantic tokens (shared across cards, badges, buttons) ---
  // Translucent card surfaces over the smoke background.
  surface1: 'rgba(255,255,255,0.024)',
  surface2: 'rgba(255,255,255,0.03)',
  surface3: 'rgba(255,255,255,0.05)',
  // Hairline borders.
  hairline: 'rgba(242,241,236,0.08)',
  hairlineSoft: 'rgba(242,241,236,0.06)',
  hairlineStrong: 'rgba(242,241,236,0.12)',
  // Green accent system (badges, active pills).
  accentSoft: 'rgba(122,164,109,0.16)',
  accentBorder: 'rgba(190,215,178,0.18)',
  // Gold-glass system (image frames, premium accents).
  goldSurface: 'rgba(194,169,109,0.12)',
  goldBorder: 'rgba(194,169,109,0.22)',
  // Primary action button.
  primaryFill: 'rgba(77,146,73,0.28)',
  primaryBorder: 'rgba(190,215,178,0.26)',
  // Muted text tiers.
  textSubtle: '#C4CCBC',
  textBadge: '#DDE3D6',
  textBody: '#B7C0AF',
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;
