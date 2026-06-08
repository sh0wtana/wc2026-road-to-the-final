export const R32_MATCHES = [
  { id: 'm1', home: '1E', away: '3ABCDF' },
  { id: 'm2', home: '1I', away: '3CDFGH' },
  { id: 'm3', home: '2A', away: '2B' },
  { id: 'm4', home: '1F', away: '2C' },
  { id: 'm5', home: '2K', away: '2L' },
  { id: 'm6', home: '1H', away: '2J' },
  { id: 'm7', home: '1D', away: '3BEFIJ' },
  { id: 'm8', home: '1G', away: '3AEHIJ' },
  { id: 'm9', home: '1C', away: '2F' },
  { id: 'm10', home: '2E', away: '2I' },
  { id: 'm11', home: '1A', away: '3CEFHI' },
  { id: 'm12', home: '1L', away: '3EHIJK' },
  { id: 'm13', home: '1J', away: '2H' },
  { id: 'm14', home: '2D', away: '2G' },
  { id: 'm15', home: '1B', away: '3EFGIJ' },
  { id: 'm16', home: '1K', away: '3DEIJL' },
]

export const R16_FEED = {
  'l-r16-m1': ['m1', 'm2'],
  'l-r16-m2': ['m3', 'm4'],
  'l-r16-m3': ['m5', 'm6'],
  'l-r16-m4': ['m7', 'm8'],
  'r-r16-m1': ['m9', 'm10'],
  'r-r16-m2': ['m11', 'm12'],
  'r-r16-m3': ['m13', 'm14'],
  'r-r16-m4': ['m15', 'm16'],
}

export const QF_FEED = {
  'l-qf-m1': ['l-r16-m1', 'l-r16-m2'],
  'l-qf-m2': ['l-r16-m3', 'l-r16-m4'],
  'r-qf-m1': ['r-r16-m1', 'r-r16-m2'],
  'r-qf-m2': ['r-r16-m3', 'r-r16-m4'],
}

export const SF_FEED = {
  'l-sf': ['l-qf-m1', 'l-qf-m2'],
  'r-sf': ['r-qf-m1', 'r-qf-m2'],
}

export const FINAL_FEED = ['l-sf', 'r-sf']

export const THIRD_PLACE_SLOTS = [
  '3ABCDF',
  '3CDFGH',
  '3BEFIJ',
  '3AEHIJ',
  '3CEFHI',
  '3EHIJK',
  '3EFGIJ',
  '3DEIJL',
]
