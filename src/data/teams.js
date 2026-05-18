export const GROUPS = {
  A: ['USA', 'Panama', 'Honduras', 'Algeria'],
  B: ['Argentina', 'Chile', 'Peru', 'Albania'],
  C: ['Mexico', 'New Zealand', 'Jamaica', 'Iraq'],
  D: ['England', 'Serbia', 'Czechia', 'South Korea'],
  E: ['Spain', 'Turkey', 'Belgium', 'Uzbekistan'],
  F: ['Brazil', 'Morocco', 'Japan', 'Senegal'],
  G: ['France', 'Croatia', 'Ukraine', 'Thailand'],
  H: ['Portugal', 'Romania', 'DR Congo', 'Sudan'],
  I: ['Germany', 'Netherlands', 'Hungary', 'Costa Rica'],
  J: ['Colombia', 'Ecuador', 'Bolivia', 'Indonesia'],
  K: ['Uruguay', 'Austria', 'Egypt', 'Kenya'],
  L: ['Canada', 'Bosnia', 'Switzerland', 'Qatar'],
}

export const GROUP_LABELS = Object.keys(GROUPS)

export const ALL_TEAMS = Object.values(GROUPS).flat()

export const KNOCKOUT_ROUNDS = ['R32', 'R16', 'QF', 'SF', 'Final']

export const SCORING = {
  group_first: 2,
  group_second: 1,
  group_perfect_bonus: 1,
  third_place_advance: 1,
  R32: 1,
  R16: 2,
  QF: 3,
  SF: 5,
  Final: 8,
  golden_boot: 3,
  golden_glove: 3,
  golden_ball: 3,
  dark_horse: 3,
}
