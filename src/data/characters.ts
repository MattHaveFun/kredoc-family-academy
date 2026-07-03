// The rotating cast for lesson scenarios. Names are deliberately on-the-nose:
// you should know who made the right call before you finish the sentence.
// Rules enforced by the content, not code: ~50/50 male/female rotation, never
// the same character in consecutive lessons, funny but never mean.
export interface Character {
  name: string
  gender: 'm' | 'f'
  disposition: 'wise' | 'reckless'
}

export const CHARACTERS: Character[] = [
  { name: 'Barry Brokemore', gender: 'm', disposition: 'reckless' },
  { name: 'Chad Yolo', gender: 'm', disposition: 'reckless' },
  { name: 'Donnie Dumpster-Fire', gender: 'm', disposition: 'reckless' },
  { name: 'Hank Hoardcash', gender: 'm', disposition: 'reckless' },
  { name: 'Ricky Regret', gender: 'm', disposition: 'reckless' },
  { name: 'Max Momentum', gender: 'm', disposition: 'reckless' },
  { name: 'Terry Trendchaser', gender: 'm', disposition: 'reckless' },
  { name: 'Penny Wiseman', gender: 'f', disposition: 'wise' },
  { name: 'Rita Reinvest', gender: 'f', disposition: 'wise' },
  { name: 'Prudence Longview', gender: 'f', disposition: 'wise' },
  { name: 'Wendy Wealthbuilder', gender: 'f', disposition: 'wise' },
  { name: 'Sandra Steadfast', gender: 'f', disposition: 'wise' },
  { name: 'Fiona Forward', gender: 'f', disposition: 'wise' },
  { name: 'Grace Compoundsworth', gender: 'f', disposition: 'wise' },
]
