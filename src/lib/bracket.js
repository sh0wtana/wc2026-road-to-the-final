export function getTeamForSlot(slot, groups) {
  if (slot.startsWith('3')) return null
  const rank = slot[0] === '1' ? 0 : 1
  return groups[slot[1]]?.[rank] ?? null
}

export function getEligibleThirdPlaceTeams(slotKey, groups) {
  return slotKey
    .slice(1)
    .split('')
    .map((g) => {
      const team = groups[g]?.[2]
      return team ? { ...team, group: g } : null
    })
    .filter(Boolean)
}

export function findTeamById(id, groups) {
  if (!id) return null
  for (const [key, group] of Object.entries(groups)) {
    const t = group.find((t) => t.id === id)
    if (t) return { ...t, group: key }
  }
  return null
}

export function getR32Teams(match, groups, thirdPlaceAssignments) {
  const resolve = (slot) => {
    if (!slot.startsWith('3')) return getTeamForSlot(slot, groups)
    const id = thirdPlaceAssignments[slot]
    return id ? findTeamById(id, groups) : null
  }
  return { home: resolve(match.home), away: resolve(match.away) }
}

export function getPostR32Teams(
  matchId,
  matchWinners,
  R16_FEED,
  QF_FEED,
  SF_FEED,
  groups
) {
  const feedMap = { ...R16_FEED, ...QF_FEED, ...SF_FEED }
  const [feedA, feedB] = feedMap[matchId] ?? []
  if (!feedA || !feedB) return { home: null, away: null }
  const resolve = (id) => {
    const winnerId = matchWinners[id]
    return winnerId ? findTeamById(winnerId, groups) : null
  }
  return { home: resolve(feedA), away: resolve(feedB) }
}
