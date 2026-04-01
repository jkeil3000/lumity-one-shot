export interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  banner?: string;
  location?: string;
  website?: string;
  interests: string[];
  followersCount: number;
  savesSharedCount: number;
}

export interface ContentItem {
  id: string;
  type: 'article' | 'book' | 'podcast' | 'video' | 'thought';
  title: string;
  source?: string;
  sourceUrl?: string;
  thumbnail?: string;
  caption: string;
  author: User;
  interests: string[];
  visibility: 'public' | 'private';
  state: 'saved' | 'in-progress' | 'completed';
  isFavorite?: boolean;
  collections: string[];
  likes: number;
  comments: Comment[];
  createdAt: string;
  isPinned?: boolean;
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  count: number;
  description?: string;
  visibility: 'private' | 'public';
}

export interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  interest: string;
}

export interface ConsumptionStats {
  itemsThisWeek: number;
  topInterests: { name: string; count: number }[];
  streak: number;
  recentTypes: { type: string; count: number }[];
}

export interface QuietPrompt {
  id: string;
  text: string;
}

export interface ActivityEvent {
  id: string;
  type:
    | 'save_item'
    | 'share_item'
    | 'create_thought'
    | 'open_item'
    | 'comment_post'
    | 'grace_restore';
  timestamp: string;
  effectiveDateKey?: string;
}

// --- Users ---

const _mockCurrentUser: User = {
  id: 'u0',
  username: 'you',
  displayName: 'You',
  bio: 'Exploring ideas at the intersection of design, technology, and philosophy.',
  avatar: 'https://i.pravatar.cc/150?u=you',
  banner: 'https://picsum.photos/seed/banner-you/1200/400',
  location: 'San Francisco, CA',
  website: 'https://lumity.app',
  interests: ['Design Thinking', 'AI Ethics', 'Philosophy', 'Climate Tech', 'Neuroscience', 'Product Design'],
  followersCount: 142,
  savesSharedCount: 87,
};

export function getCurrentUser(): User {
  try {
    const raw = window.localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw) as Record<string, unknown>;
      const id = String(u.id ?? u._id ?? '').trim();
      if (id) {
        return {
          id,
          username: typeof u.username === 'string' ? u.username : id,
          displayName: typeof u.name === 'string' && u.name ? u.name : id,
          bio: typeof u.bio === 'string' ? u.bio : '',
          avatar: typeof u.avatar === 'string' && u.avatar ? u.avatar : `https://i.pravatar.cc/150?u=${id}`,
          interests: [],
          followersCount: 0,
          savesSharedCount: 0,
        };
      }
    }
  } catch {
    // ignore
  }
  return _mockCurrentUser;
}

export const currentUser: User = _mockCurrentUser;

const users: User[] = [
  {
    id: 'u1',
    username: 'mara',
    displayName: 'Mara Chen',
    bio: 'AI researcher. Thinking about alignment and cognition.',
    avatar: 'https://i.pravatar.cc/150?u=mara',
    interests: ['AI Ethics', 'Neuroscience', 'Philosophy'],
    followersCount: 891,
    savesSharedCount: 234,
  },
  {
    id: 'u2',
    username: 'jk',
    displayName: 'Jakob Reyes',
    bio: 'Product designer. Building tools for thought.',
    avatar: 'https://i.pravatar.cc/150?u=jk',
    interests: ['Product Design', 'Design Thinking', 'Indie Software'],
    followersCount: 1203,
    savesSharedCount: 456,
  },
  {
    id: 'u3',
    username: 'lina',
    displayName: 'Lina Park',
    bio: 'Writer. Reader. Collecting ideas slowly.',
    avatar: 'https://i.pravatar.cc/150?u=lina',
    interests: ['Literature', 'Philosophy', 'Neuroscience'],
    followersCount: 567,
    savesSharedCount: 312,
  },
  {
    id: 'u4',
    username: 'deepwork',
    displayName: 'Deep Work Studio',
    bio: 'A studio for focused thinking and making.',
    avatar: 'https://i.pravatar.cc/150?u=deepwork',
    interests: ['Productivity', 'Design Thinking', 'Climate Tech'],
    followersCount: 2104,
    savesSharedCount: 189,
  },
  {
    id: 'u5',
    username: 'soph',
    displayName: 'Sophie Kwon',
    bio: 'Climate scientist turned science communicator.',
    avatar: 'https://i.pravatar.cc/150?u=soph',
    interests: ['Climate Tech', 'Science Communication', 'Philosophy'],
    followersCount: 743,
    savesSharedCount: 167,
  },
  {
    id: 'u6',
    username: 'ravi',
    displayName: 'Ravi Mehta',
    bio: 'Former PM at Tidal. Writing about product craft and creative process.',
    avatar: 'https://i.pravatar.cc/150?u=ravi',
    location: 'Brooklyn, NY',
    interests: ['Product Design', 'Indie Software', 'Philosophy'],
    followersCount: 1847,
    savesSharedCount: 298,
  },
  {
    id: 'u7',
    username: 'elena',
    displayName: 'Elena Voss',
    bio: 'Neuroscientist. Exploring the edges of consciousness and memory.',
    avatar: 'https://i.pravatar.cc/150?u=elena',
    location: 'Berlin, DE',
    interests: ['Neuroscience', 'Philosophy', 'Literature'],
    followersCount: 632,
    savesSharedCount: 189,
  },
  {
    id: 'u8',
    username: 'tomás',
    displayName: 'Tomás Herrera',
    bio: 'Architect turned systems thinker. Cities, climate, complexity.',
    avatar: 'https://i.pravatar.cc/150?u=tomas',
    location: 'Mexico City, MX',
    interests: ['Climate Tech', 'Design Thinking', 'Philosophy'],
    followersCount: 1102,
    savesSharedCount: 341,
  },
  {
    id: 'u9',
    username: 'amara',
    displayName: 'Amara Osei',
    bio: 'Independent researcher. AI governance and digital rights.',
    avatar: 'https://i.pravatar.cc/150?u=amara',
    location: 'London, UK',
    interests: ['AI Ethics', 'Philosophy', 'Science Communication'],
    followersCount: 956,
    savesSharedCount: 214,
  },
  {
    id: 'u10',
    username: 'kai',
    displayName: 'Kai Nakamura',
    bio: 'Designer and letterpress printer. Slow tools, careful work.',
    avatar: 'https://i.pravatar.cc/150?u=kai',
    location: 'Portland, OR',
    interests: ['Design Thinking', 'Literature', 'Indie Software'],
    followersCount: 478,
    savesSharedCount: 156,
  },
];

// --- Content ---

export const feedItems: ContentItem[] = [
  {
    id: 'c1',
    type: 'article',
    title: 'On the Limits of LLM Reasoning',
    source: 'arXiv',
    sourceUrl: 'https://arxiv.org',
    thumbnail: 'https://picsum.photos/seed/c1/600/400',
    caption: 'This paper finally articulates something I\'ve been feeling — that fluency isn\'t reasoning. The gap between generating plausible text and actual understanding is wider than most people realize.',
    author: users[0],
    interests: ['AI Ethics'],
    visibility: 'public',
    state: 'saved',
    collections: [],
    likes: 42,
    comments: [
      { id: 'cm1', author: users[2], text: 'The section on chain-of-thought prompting really stood out to me. It feels like we\'re teaching systems to perform reasoning rather than actually reason.', createdAt: '2h ago' },
      { id: 'cm2', author: users[1], text: 'I think the distinction matters less than people think. What matters is the output quality and reliability.', createdAt: '1h ago' },
    ],
    createdAt: '3h ago',
  },
  {
    id: 'c2',
    type: 'article',
    title: 'Why I Stopped Using Notion',
    source: 'Medium',
    sourceUrl: 'https://medium.com',
    thumbnail: 'https://picsum.photos/seed/c2/600/400',
    caption: 'The paradox of flexible tools: the more you can customize, the more time you spend organizing instead of thinking. Sometimes constraints are a gift.',
    author: users[1],
    interests: ['Product Design', 'Design Thinking'],
    visibility: 'public',
    state: 'saved',
    collections: [],
    likes: 156,
    comments: [
      { id: 'cm3', author: users[3], text: 'This resonates. I moved to plain text files and haven\'t looked back.', createdAt: '5h ago' },
    ],
    createdAt: '6h ago',
  },
  {
    id: 'c3',
    type: 'book',
    title: 'The Body Keeps the Score',
    source: 'Bessel van der Kolk',
    thumbnail: 'https://picsum.photos/seed/c3/600/400',
    caption: 'Reading this changed how I think about memory. The body isn\'t separate from the mind — it\'s where experience actually lives. Chapter 7 on the neuroscience of trauma is extraordinary.',
    author: users[2],
    interests: ['Neuroscience', 'Philosophy'],
    visibility: 'public',
    state: 'completed',
    collections: [],
    likes: 89,
    comments: [],
    createdAt: '1d ago',
  },
  {
    id: 'c4',
    type: 'podcast',
    title: 'Naval on Leverage and Judgment',
    source: 'The Tim Ferriss Show',
    thumbnail: 'https://picsum.photos/seed/c4/600/400',
    caption: 'The distinction between labor leverage and capital leverage vs. media and code leverage is one of the most important mental models for anyone building today.',
    author: users[3],
    interests: ['Design Thinking', 'Productivity'],
    visibility: 'public',
    state: 'saved',
    collections: [],
    likes: 67,
    comments: [
      { id: 'cm4', author: users[0], text: 'The part about specific knowledge being found by pursuing genuine curiosity — that landed differently this time.', createdAt: '12h ago' },
    ],
    createdAt: '1d ago',
  },
  {
    id: 'c5',
    type: 'video',
    title: 'The Art of Noticing',
    source: 'YouTube',
    sourceUrl: 'https://youtube.com',
    thumbnail: 'https://picsum.photos/seed/c5/600/400',
    caption: 'Rob Walker\'s practice of intentional observation as a creative method. The exercise of photographing something you\'ve never noticed on your daily route is so simple and so profound.',
    author: users[4],
    interests: ['Design Thinking', 'Philosophy'],
    visibility: 'public',
    state: 'saved',
    collections: [],
    likes: 34,
    comments: [],
    createdAt: '2d ago',
  },
  {
    id: 'c6',
    type: 'thought',
    title: '',
    caption: 'The best tools for thought don\'t organize your thinking — they create the conditions for thinking to happen. The difference is subtle but everything.',
    author: users[1],
    interests: ['Product Design'],
    visibility: 'public',
    state: 'saved',
    collections: [],
    likes: 213,
    comments: [
      { id: 'cm5', author: users[2], text: 'This is why I keep coming back to paper notebooks. Zero features, maximum thinking.', createdAt: '3d ago' },
      { id: 'cm6', author: users[4], text: 'Reminds me of the concept of "shearing layers" — the tool should match the pace of the thought.', createdAt: '2d ago' },
    ],
    createdAt: '3d ago',
  },
  {
    id: 'c7',
    type: 'article',
    title: 'Designing for Slowness',
    source: 'Aeon',
    sourceUrl: 'https://aeon.co',
    thumbnail: 'https://picsum.photos/seed/c7/600/400',
    caption: 'A counterintuitive argument: the most valuable digital products will be the ones that deliberately slow you down. Attention is the new luxury.',
    author: users[4],
    interests: ['Design Thinking', 'Philosophy'],
    visibility: 'public',
    state: 'saved',
    collections: [],
    likes: 78,
    comments: [],
    createdAt: '3d ago',
  },
  {
    id: 'c8',
    type: 'book',
    title: 'Thinking, Fast and Slow',
    source: 'Daniel Kahneman',
    thumbnail: 'https://picsum.photos/seed/c8/600/400',
    caption: 'Re-reading this for the third time. System 1 and System 2 thinking maps perfectly onto how I experience creative work — the effortless flow vs. the deliberate craft.',
    author: users[0],
    interests: ['Neuroscience', 'Philosophy'],
    visibility: 'public',
    state: 'in-progress',
    collections: [],
    likes: 124,
    comments: [],
    createdAt: '4d ago',
  },
];

// Library items (personal saves)
export const libraryItems: ContentItem[] = [
  ...feedItems.slice(0, 3).map(item => ({ ...item, visibility: 'private' as const })),
  {
    id: 'l1',
    type: 'article' as const,
    title: 'The Garden and the Stream',
    source: 'Hapgood',
    sourceUrl: 'https://hapgood.us',
    thumbnail: 'https://picsum.photos/seed/l1/600/400',
    caption: 'Mike Caulfield\'s original piece on digital gardens vs. the stream. Still the best articulation of two fundamentally different ways of organizing knowledge online.',
    author: currentUser,
    interests: ['Design Thinking', 'Product Design'],
    visibility: 'public',
    state: 'completed' as const,
    isFavorite: true,
    collections: ['Design Thinking'],
    likes: 31,
    comments: [],
    createdAt: '1w ago',
    isPinned: true,
  },
  {
    id: 'l2',
    type: 'podcast' as const,
    title: 'Ezra Klein on the Abundance Agenda',
    source: 'The Ezra Klein Show',
    thumbnail: 'https://picsum.photos/seed/l2/600/400',
    caption: 'The tension between wanting progress and the systems that slow it down. Applies directly to how we think about building software too.',
    author: currentUser,
    interests: ['Climate Tech', 'Philosophy'],
    visibility: 'public',
    state: 'completed' as const,
    collections: ['Climate Tech'],
    likes: 18,
    comments: [],
    createdAt: '2w ago',
  },
  {
    id: 'l3',
    type: 'book' as const,
    title: 'How Buildings Learn',
    source: 'Stewart Brand',
    thumbnail: 'https://picsum.photos/seed/l3/600/400',
    caption: 'The idea that buildings (and by extension, all designed things) should be built to adapt over time. Shearing layers as a design principle.',
    author: currentUser,
    interests: ['Design Thinking'],
    visibility: 'public',
    state: 'completed' as const,
    collections: ['Design Thinking', 'Books 2026'],
    likes: 27,
    comments: [],
    createdAt: '3w ago',
    isPinned: true,
  },
  {
    id: 'l4',
    type: 'video' as const,
    title: 'Bret Victor — Inventing on Principle',
    source: 'Vimeo',
    thumbnail: 'https://picsum.photos/seed/l4/600/400',
    caption: 'Every creator needs a principle. The immediacy of feedback as the foundation of understanding. This talk rewired how I think about tools.',
    author: currentUser,
    interests: ['Product Design', 'Design Thinking'],
    visibility: 'public',
    state: 'completed' as const,
    isFavorite: true,
    collections: ['Design Thinking'],
    likes: 52,
    comments: [],
    createdAt: '1m ago',
    isPinned: true,
  },
  {
    id: 'l7',
    type: 'book' as const,
    title: 'The Art of Noticing',
    source: 'Rob Walker',
    thumbnail: 'https://picsum.photos/seed/l7/600/400',
    caption: 'A practical guide to paying attention in a distracted world. 131 exercises for rediscovering what matters.',
    author: currentUser,
    interests: ['Philosophy', 'Design Thinking'],
    visibility: 'public',
    state: 'in-progress' as const,
    collections: ['Books 2026'],
    likes: 14,
    comments: [],
    createdAt: '3d ago',
  },
  {
    id: 'l5',
    type: 'thought' as const,
    title: '',
    caption: 'What if the feed and the archive were the same thing? Every post you make is also a save. Every save can become a post. The distinction is artificial.',
    author: currentUser,
    interests: ['Product Design'],
    visibility: 'private',
    state: 'saved' as const,
    collections: [],
    likes: 0,
    comments: [],
    createdAt: '1m ago',
  },
  {
    id: 'l6',
    type: 'article' as const,
    title: 'Against Productivity',
    source: 'The New Yorker',
    thumbnail: 'https://picsum.photos/seed/l6/600/400',
    caption: 'Cal Newport making the case that personal productivity is a trap when the system itself is broken.',
    author: currentUser,
    interests: ['Philosophy', 'Productivity'],
    visibility: 'public',
    state: 'saved' as const,
    collections: [],
    likes: 45,
    comments: [],
    createdAt: '2m ago',
  },
];

export const collections: Collection[] = [
  { id: 'col1', name: 'Design Thinking', count: 12, visibility: 'public', description: 'How great things get made. Process, craft, and the space between intention and execution.' },
  { id: 'col2', name: 'AI Ethics', count: 8, visibility: 'private', description: 'The questions we should be asking before the decisions get made for us.' },
  { id: 'col3', name: 'Books 2026', count: 15, visibility: 'public', description: 'Everything I\'m reading this year. Slow, deliberate, cover to cover.' },
  { id: 'col4', name: 'Climate Tech', count: 6, visibility: 'private', description: 'Optimism with receipts. Technology and policy that might actually move the needle.' },
];

export const allInterests = [
  'AI Ethics', 'Climate Tech', 'Design Thinking', 'Indie Software',
  'Literature', 'Neuroscience', 'Philosophy', 'Product Design',
  'Productivity', 'Science Communication',
];

export const communities: Community[] = [
  { id: 'com1', name: 'Deep Readers Club', description: 'Slow reading, deep thinking. Books that change how you see.', memberCount: 342, interest: 'Literature' },
  { id: 'com2', name: 'Tools for Thought', description: 'Building and discussing the future of knowledge tools.', memberCount: 1204, interest: 'Product Design' },
  { id: 'com3', name: 'Climate Futures', description: 'Optimistic climate tech and policy discussion.', memberCount: 567, interest: 'Climate Tech' },
];

// --- Home page data ---

export const consumptionStats: ConsumptionStats = {
  itemsThisWeek: 12,
  topInterests: [
    { name: 'Design Thinking', count: 5 },
    { name: 'Philosophy', count: 4 },
    { name: 'AI Ethics', count: 3 },
  ],
  streak: 7,
  recentTypes: [
    { type: 'article', count: 5 },
    { type: 'podcast', count: 3 },
    { type: 'book', count: 2 },
    { type: 'video', count: 2 },
  ],
};

export const quietPrompts: QuietPrompt[] = [
  { id: 'qp1', text: 'What changed your mind recently?' },
  { id: 'qp2', text: 'Which idea keeps resurfacing this month?' },
  { id: 'qp3', text: 'What did this piece clarify for you?' },
  { id: 'qp4', text: 'What would you tell a friend about this?' },
];

export const themeCards = allInterests.slice(0, 8).map((name, i) => ({
  id: `theme-${i}`,
  name,
  itemCount: Math.floor(Math.random() * 20) + 5,
  thumbnail: `https://picsum.photos/seed/theme-${i}/400/300`,
}));

function formatLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function atLocalNoon(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}

function shiftLocalDays(date: Date, amount: number) {
  const next = atLocalNoon(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function seedActivityEvents(): ActivityEvent[] {
  const now = atLocalNoon(new Date());
  const offsets = [0, -1, -2, -3, -4, -5, -6, -8, -9, -10, -12, -15, -18, -21];

  return offsets.map((offset, index) => {
    const date = shiftLocalDays(now, offset);
    const typeCycle: ActivityEvent['type'][] = ['open_item', 'save_item', 'share_item', 'create_thought'];

    return {
      id: `ae-${index + 1}`,
      type: typeCycle[index % typeCycle.length],
      timestamp: date.toISOString(),
      effectiveDateKey: formatLocalDateKey(date),
    };
  });
}

export const activityEventsSeed = seedActivityEvents();

// --- Helper functions ---

export function getFriendActivity(): ContentItem[] {
  return feedItems.filter(item => item.author.id !== currentUser.id).slice(0, 8);
}

export function getRecommendations(): ContentItem[] {
  // Items from users matching current user's interests
  return [...feedItems].sort((a, b) => b.likes - a.likes).slice(0, 6);
}

export function getRecentlySaved(): ContentItem[] {
  return libraryItems.filter(i => i.state === 'saved' || i.state === 'in-progress').slice(0, 6);
}

export function getEditorialPicks(): ContentItem[] {
  return [...feedItems].sort((a, b) => b.likes - a.likes).slice(0, 6);
}

export function getTypeIcon(type: ContentItem['type']): string {
  switch (type) {
    case 'article': return '📄';
    case 'book': return '📖';
    case 'podcast': return '🎙';
    case 'video': return '▶';
    case 'thought': return '💭';
    default: return '📄';
  }
}

export function getTypeLabel(type: ContentItem['type']): string {
  switch (type) {
    case 'article': return 'article';
    case 'book': return 'book';
    case 'podcast': return 'podcast';
    case 'video': return 'video';
    case 'thought': return 'thought';
    default: return 'article';
  }
}

// --- Profile helpers ---

export function getItemsByInterest(interest: string): ContentItem[] {
  const all = [...libraryItems, ...feedItems];
  const seen = new Set<string>();
  return all.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return item.interests.includes(interest);
  });
}

export function getCollectionThumbnail(collectionName: string): string | undefined {
  const item = libraryItems.find(i => i.collections.includes(collectionName));
  return item?.thumbnail;
}

export function getCollectionMosaicThumbnails(collectionName: string, max = 4): string[] {
  return libraryItems
    .filter(i => i.collections.includes(collectionName) && i.thumbnail)
    .slice(0, max)
    .map(i => i.thumbnail!);
}

export function getProfileFavorites(): ContentItem[] {
  return libraryItems.filter(i => i.isFavorite);
}

// Pinned: user-curated items flagged with isPinned, shown near top of profile
export function getProfilePinned(): ContentItem[] {
  return libraryItems.filter(i => i.isPinned);
}

// Lately: only the current user's publicly shared posts, chronological
// Does NOT include private saves, general activity, or other users' content
export function getProfileLately(): ContentItem[] {
  return [...libraryItems, ...feedItems]
    .filter(i => i.author.id === currentUser.id && i.visibility === 'public')
    .filter((item, idx, arr) => arr.findIndex(x => x.id === item.id) === idx);
}

export function getProfileShared(): ContentItem[] {
  return libraryItems.filter(i => i.visibility === 'public');
}

// --- Explore page helpers ---

export interface InterestTopic {
  name: string;
  description: string;
  itemCount: number;
  followerCount: number;
  thumbnail: string;
}

export const exploreInterests: InterestTopic[] = [
  { name: 'Design Thinking', description: 'Process, craft, and the space between intention and execution.', itemCount: 284, followerCount: 1420, thumbnail: 'https://picsum.photos/seed/int-design/400/300' },
  { name: 'AI Ethics', description: 'The questions we should be asking before the answers are automated.', itemCount: 196, followerCount: 2310, thumbnail: 'https://picsum.photos/seed/int-ai/400/300' },
  { name: 'Philosophy', description: 'How to think, why it matters, and what changes when you do.', itemCount: 341, followerCount: 1870, thumbnail: 'https://picsum.photos/seed/int-phil/400/300' },
  { name: 'Neuroscience', description: 'The brain, the body, and the strange loops between them.', itemCount: 152, followerCount: 980, thumbnail: 'https://picsum.photos/seed/int-neuro/400/300' },
  { name: 'Climate Tech', description: 'Optimism with receipts. Technology that might move the needle.', itemCount: 118, followerCount: 1540, thumbnail: 'https://picsum.photos/seed/int-climate/400/300' },
  { name: 'Product Design', description: 'Building things people actually want to use, and why that\'s hard.', itemCount: 267, followerCount: 1680, thumbnail: 'https://picsum.photos/seed/int-product/400/300' },
  { name: 'Literature', description: 'Books, essays, and the art of reading deeply.', itemCount: 203, followerCount: 1120, thumbnail: 'https://picsum.photos/seed/int-lit/400/300' },
  { name: 'Indie Software', description: 'Small tools, independent makers, and software with a soul.', itemCount: 89, followerCount: 720, thumbnail: 'https://picsum.photos/seed/int-indie/400/300' },
  { name: 'Productivity', description: 'Systems, habits, and the pursuit of doing less but better.', itemCount: 174, followerCount: 940, thumbnail: 'https://picsum.photos/seed/int-prod/400/300' },
  { name: 'Science Communication', description: 'Making complex ideas accessible without making them simple.', itemCount: 96, followerCount: 560, thumbnail: 'https://picsum.photos/seed/int-scicomm/400/300' },
];

export function getExploreSuggestedPeople(): User[] {
  // Returns users that share interests with the current user, excluding self
  return users.filter(u => u.id !== currentUser.id)
    .sort((a, b) => {
      const aOverlap = a.interests.filter(i => currentUser.interests.includes(i)).length;
      const bOverlap = b.interests.filter(i => currentUser.interests.includes(i)).length;
      return bOverlap - aOverlap;
    });
}

export function getExploreForYouContent(): ContentItem[] {
  // Content from outside user's library, matching their interests
  const userInterests = new Set(currentUser.interests);
  return [...feedItems]
    .filter(item => item.interests.some(i => userInterests.has(i)))
    .sort((a, b) => b.likes - a.likes);
}

export function getExploreTrendingContent(): ContentItem[] {
  return [...feedItems].sort((a, b) => b.likes - a.likes).slice(0, 6);
}
