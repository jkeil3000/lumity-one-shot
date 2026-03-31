import type { ContentItem, User } from '../data/mock';

type Raw = Record<string, unknown>;

function isRec(v: unknown): v is Raw {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function normalizeId(v: unknown): string {
  if (typeof v === 'string' && v.trim()) return v.trim();
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return '';
}

function pickStr(o: Raw, keys: string[]): string {
  for (const k of keys) {
    if (typeof o[k] === 'string' && (o[k] as string).trim()) return o[k] as string;
  }
  return '';
}

function getNum(o: Raw, keys: string[]): number {
  for (const k of keys) {
    if (typeof o[k] === 'number') return o[k] as number;
    if (typeof o[k] === 'string') return parseInt(o[k] as string, 10) || 0;
  }
  return 0;
}

function fmtTime(v: unknown): string {
  if (!v) return '';
  let ts: number | string = v as number | string;
  if (typeof ts === 'string' && /^\d+$/.test(ts)) ts = parseInt(ts, 10);
  if (typeof ts === 'number' && ts < 10_000_000_000) ts *= 1000;
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '';
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const days = Math.floor(s / 86400);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function extractUrlFromText(text: string): string {
  const match = text.match(/(https?:\/\/[^\s]+)|([a-zA-Z0-9-]+\.(com|net|org|tv|edu|gov|io)[^\s]*)/i);
  return match ? match[0].replace(/[)\].,!?]+$/, '') : '';
}

function resolveUrl(raw: string): string {
  if (!raw) return '';
  const url = raw.trim();
  if (/^http:/i.test(url)) return url.replace(/^http:/i, 'https:');
  return /^https:/i.test(url) ? url : `https://${url}`;
}

function inferType(url: string): ContentItem['type'] {
  if (!url) return 'thought';
  if (/youtube|youtu\.be|vimeo/i.test(url)) return 'video';
  if (/spotify|podcast|anchor\.fm/i.test(url)) return 'podcast';
  if (/books\.google/i.test(url)) return 'book';
  return 'article';
}

export function normalizePost(raw: Raw): ContentItem {
  const id = normalizeId(raw.id ?? raw._id ?? raw.slug) || `post-${Math.random().toString(36).slice(2)}`;
  const rawUser = isRec(raw.user) ? raw.user : ({} as Raw);
  const authorId = normalizeId(rawUser.id ?? rawUser._id ?? rawUser.userId ?? id);
  const firstName = typeof rawUser.firstName === 'string' ? rawUser.firstName : '';
  const lastName = typeof rawUser.lastName === 'string' ? rawUser.lastName : '';
  const displayName = `${firstName} ${lastName}`.trim() || pickStr(rawUser, ['name', 'username']) || 'User';

  const author: User = {
    id: authorId,
    username: pickStr(rawUser, ['username', 'handle']) || authorId,
    displayName,
    bio: pickStr(rawUser, ['bio', 'about']),
    avatar: pickStr(rawUser, ['avatar', 'profilePic', 'avatarUrl']) || `https://i.pravatar.cc/150?u=${authorId}`,
    interests: [],
    followersCount: getNum(rawUser, ['followersCount', 'followers']),
    savesSharedCount: 0,
  };

  const bodyText = pickStr(raw, ['body', 'caption', 'description', 'content']);
  const rawLinkUrl = pickStr(raw, ['url', 'link']) || extractUrlFromText(bodyText);
  const linkUrl = resolveUrl(rawLinkUrl) || undefined;
  const contentType = inferType(linkUrl ?? '');

  // linkTitle is the title of the shared article/video; fall back to headline
  const title = pickStr(raw, ['linkTitle', 'headline', 'title']);

  // Derive thumbnail: use explicit media field, or YouTube thumbnail from URL
  let thumbnail = pickStr(raw, ['mediaUrl', 'image', 'imageUrl', 'thumbnail']) || undefined;
  if (!thumbnail && linkUrl && contentType === 'video' && /youtube|youtu\.be/i.test(linkUrl)) {
    const ytMatch = linkUrl.match(/(?:v=|v\/|embed\/|youtu\.be\/)([^"&?/\s]{11})/i);
    if (ytMatch) thumbnail = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }

  return {
    id,
    type: contentType,
    title,
    source: pickStr(raw, ['source', 'sourceName', 'sourceTitle']),
    sourceUrl: linkUrl,
    thumbnail,
    caption: bodyText,
    author,
    interests: [],
    visibility: 'public',
    state: 'saved',
    collections: [],
    likes: getNum(raw, ['totalLikes', 'likes']),
    comments: [],
    createdAt: fmtTime(raw.createdAt ?? raw.created_at ?? raw.timestamp),
  };
}

export function unwrapList(payload: unknown): Raw[] {
  const data = isRec(payload) && 'data' in payload ? payload.data : payload;
  if (Array.isArray(data)) return data.filter(isRec) as Raw[];
  if (isRec(data)) {
    const inner = data.posts ?? data.items ?? data.results ?? data.content;
    if (Array.isArray(inner)) return inner.filter(isRec) as Raw[];
  }
  return [];
}

export function getCurrentUserFromStorage(): User | null {
  try {
    const raw = window.localStorage.getItem('user');
    if (!raw) return null;
    const u = JSON.parse(raw) as Record<string, unknown>;
    const id = normalizeId(u.id ?? u._id ?? '');
    if (!id) return null;
    return {
      id,
      username: typeof u.username === 'string' ? u.username : id,
      displayName: typeof u.name === 'string' && u.name ? u.name : id,
      bio: typeof u.bio === 'string' ? u.bio : '',
      avatar: typeof u.avatar === 'string' ? u.avatar : `https://i.pravatar.cc/150?u=${id}`,
      interests: [],
      followersCount: 0,
      savesSharedCount: 0,
    };
  } catch {
    return null;
  }
}
