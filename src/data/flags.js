// Emoji flag for each team in the WC26 draw.
// Scotland and England use UK regional indicators (render on macOS/iOS Chrome;
// may fall back to a placeholder on Windows — acceptable trade-off vs. shipping image assets).
export const FLAGS = {
  // Group A
  'Mexico': '🇲🇽',
  'South Africa': '🇿🇦',
  'Korea Republic': '🇰🇷',
  'Czechia': '🇨🇿',
  // Group B
  'Canada': '🇨🇦',
  'Bosnia and Herzegovina': '🇧🇦',
  'Qatar': '🇶🇦',
  'Switzerland': '🇨🇭',
  // Group C
  'Haiti': '🇭🇹',
  'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Brazil': '🇧🇷',
  'Morocco': '🇲🇦',
  // Group D
  'USA': '🇺🇸',
  'Paraguay': '🇵🇾',
  'Australia': '🇦🇺',
  'Türkiye': '🇹🇷',
  // Group E
  "Côte d'Ivoire": '🇨🇮',
  'Ecuador': '🇪🇨',
  'Germany': '🇩🇪',
  'Curaçao': '🇨🇼',
  // Group F
  'Netherlands': '🇳🇱',
  'Japan': '🇯🇵',
  'Sweden': '🇸🇪',
  'Tunisia': '🇹🇳',
  // Group G
  'IR Iran': '🇮🇷',
  'New Zealand': '🇳🇿',
  'Belgium': '🇧🇪',
  'Egypt': '🇪🇬',
  // Group H
  'Saudi Arabia': '🇸🇦',
  'Uruguay': '🇺🇾',
  'Spain': '🇪🇸',
  'Cabo Verde': '🇨🇻',
  // Group I
  'France': '🇫🇷',
  'Senegal': '🇸🇳',
  'Iraq': '🇮🇶',
  'Norway': '🇳🇴',
  // Group J
  'Argentina': '🇦🇷',
  'Algeria': '🇩🇿',
  'Austria': '🇦🇹',
  'Jordan': '🇯🇴',
  // Group K
  'Portugal': '🇵🇹',
  'Congo DR': '🇨🇩',
  'Uzbekistan': '🇺🇿',
  'Colombia': '🇨🇴',
  // Group L
  'Ghana': '🇬🇭',
  'Panama': '🇵🇦',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Croatia': '🇭🇷',
}

export function flagFor(team) {
  return FLAGS[team] || '🏳️'
}
