export type Work = {
  id: string
  title: string
  artist: string
  cover: string
  bpm: number
  key: string
  tags: string[]
  plays: number
  likes: number
  comments: number
  description: string
  createdAt: string
  stems: string[]
  status: 'published' | 'draft'
}

export type Activity = {
  id: string
  user: string
  action: string
  target: string
  time: string
}

export type SocialPost = {
  id: string
  user: string
  avatar: string
  content: string
  likes: number
  comments: number
  createdAt: string
}

export const mockWorks: Work[] = [
  {
    id: 'wk-001',
    title: 'Midnight Skyline',
    artist: 'Nova Hertz',
    cover:
      'https://images.unsplash.com/photo-1507878866276-a947ef722fee?auto=format&fit=crop&w=800&q=80',
    bpm: 122,
    key: 'A minor',
    tags: ['Synthwave', 'Chill', 'Retro'],
    plays: 18420,
    likes: 2400,
    comments: 183,
    description:
      'City-pop inspired groove with airy pads and a punchy bassline. Built for late-night drives.',
    createdAt: '2025-12-01',
    stems: ['Drums', 'Bass', 'Lead', 'Pads', 'FX'],
    status: 'published',
  },
  {
    id: 'wk-002',
    title: 'Aurora Bloom',
    artist: 'Lumen Fields',
    cover:
      'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?auto=format&fit=crop&w=800&q=80',
    bpm: 98,
    key: 'D major',
    tags: ['Ambient', 'Cinematic', 'Organic'],
    plays: 9400,
    likes: 1103,
    comments: 72,
    description:
      'Evolving textures with organic foley and string swells. Great for trailers and storytelling.',
    createdAt: '2025-11-27',
    stems: ['Strings', 'Percussion', 'Atmos', 'Piano'],
    status: 'draft',
  },
  {
    id: 'wk-003',
    title: 'Pulse Runner',
    artist: 'Binary Bloom',
    cover:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    bpm: 128,
    key: 'F# minor',
    tags: ['Techno', 'Club', 'Dark'],
    plays: 25400,
    likes: 3104,
    comments: 201,
    description:
      'Driving kick, metallic percussion, and evolving arp lines designed for peak-time energy.',
    createdAt: '2025-11-14',
    stems: ['Kick', 'Perc', 'Arp', 'FX'],
    status: 'published',
  },
]

export const mockActivities: Activity[] = [
  { id: 'ac-001', user: 'EchoRae', action: '点赞了', target: 'Midnight Skyline', time: '5分钟前' },
  { id: 'ac-002', user: 'OrbitKid', action: '评论了', target: 'Aurora Bloom', time: '18分钟前' },
  { id: 'ac-003', user: 'Vega', action: '收藏了', target: 'Pulse Runner', time: '1小时前' },
]
