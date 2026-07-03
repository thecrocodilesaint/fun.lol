const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const dataDir = process.env.FUNLOL_DATA_DIR ? path.resolve(process.env.FUNLOL_DATA_DIR) : path.join(root, "data");
const profilesPath = path.join(dataDir, "profiles.json");
const usersPath = path.join(dataDir, "users.json");
const port = Number(process.env.PORT) || 4174;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasSupabase = Boolean(supabaseUrl && supabaseServiceKey);
const mediaBucket = "profile-media";
let mediaBucketReady = false;
const passwordResetTtlMs = 30 * 60 * 1000;
const forgotPasswordCooldownMs = 60 * 1000;
const forgotPasswordAttempts = new Map();
const resetPasswordSuccessMessage = "If an account exists for this email, a password reset link has been sent.";
const resendApiKey = process.env.RESEND_API_KEY;
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const passwordResetEmailFrom = process.env.PASSWORD_RESET_FROM || process.env.EMAIL_FROM || "";
const configuredSiteOrigin = normalizeSiteOrigin(process.env.SITE_URL || process.env.PUBLIC_SITE_URL || process.env.APP_URL || "");
const allowedSiteHosts = new Set(
  String(process.env.ALLOWED_HOSTS || "slapz.lol,www.slapz.lol,fun-lol.onrender.com")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean)
);
const adminEmails = new Set(
  String(process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || process.env.OWNER_EMAIL || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);
const sessionTtlMs = Number(process.env.SESSION_TTL_MS || 7 * 24 * 60 * 60 * 1000);
const rateLimitBuckets = new Map();
const maxFriendCount = 150;
const dashboardAppearanceOptions = new Set(["dark", "light"]);
const dashboardThemeOptions = new Set(["black", "violet", "aqua", "ember"]);
const dashboardCursorModes = new Set(["normal", "dot"]);
const dashboardCursorColors = new Set(["white", "blue", "pink"]);
const accountStatusOptions = new Set(["active", "suspended", "banned"]);
const defaultSeoTitle = "slapz.lol - Custom Bio Pages with Music, Tribes, Games and Slappers";
const defaultSeoDescription =
  "Create a custom Gen Z bio profile with music, backgrounds, themes, effects, Slappers, Tribes, chats, games and leaderboards. Build your online vibe on slapz.lol.";
const defaultOgImagePath = "/assets/slapz-og-image.png";
const seoPageDefinitions = {
  "/features": {
    title: "slapz.lol Features - Bio Pages, Slappers, Tribes, Chats and Games",
    description:
      "Explore slapz.lol features including custom bio pages, media backgrounds, profile music, Slappers, Tribes, tribe chats, mini-games and leaderboards.",
    kicker: "Features",
    h1: "Everything you need to build your online vibe.",
    intro:
      "slapz.lol combines a custom public bio page with friends, Tribes, chats, games, leaderboards, profile effects and a private dashboard for managing it all.",
    sections: [
      ["Custom profiles", "Build a public profile with a handle, bio, avatar, social icons, themes, sparkle effects, music and image or video backgrounds."],
      ["Social features", "Add Slappers, manage friend requests, receive notifications, and show your circle through dashboard widgets."],
      ["Tribes and games", "Create Tribes, chat with members, browse game cards, play mini-games, and compete on leaderboards."],
    ],
    related: ["/custom-bio-pages", "/slappers", "/tribes", "/games"],
  },
  "/custom-bio-pages": {
    title: "Custom Bio Pages on slapz.lol - Music, Backgrounds, Themes and Effects",
    description:
      "Create a custom slapz.lol bio page with profile music, avatars, background images or videos, themes, custom cursors, sparkle effects and social links.",
    kicker: "Custom Bio Pages",
    h1: "Make a bio page that actually feels like you.",
    intro:
      "Your slapz.lol bio page is a shareable public profile built for music, motion, personal style and quick social discovery.",
    sections: [
      ["Profile identity", "Edit your display name, handle, bio, location, avatar, featured section, badges and social icons."],
      ["Media and music", "Upload background images or videos, add background music, and use a clean entry screen before visitors enter your profile."],
      ["Visual customization", "Choose themes, profile templates, cursor styles, sparkle effects and transparent glass profile cards."],
    ],
    related: ["/features", "/slappers", "/about", "/help"],
  },
  "/slappers": {
    title: "Slappers on slapz.lol - Friends, Requests and Notifications",
    description:
      "Use Slappers on slapz.lol to add friends, send requests, receive notifications, manage friend lists and stay connected from your dashboard.",
    kicker: "Slappers",
    h1: "Add your people and keep your circle close.",
    intro:
      "Slappers are the friend layer of slapz.lol, giving users a simple way to send requests, accept connections and see friend activity.",
    sections: [
      ["Friend requests", "Search by name, handle or profile link, send requests, and accept or decline them from notifications."],
      ["Friend widgets", "See friends from the dashboard and keep the list refreshed without reloading the whole site."],
      ["Controls", "Remove a friend with confirmation and keep social actions tied to signed-in accounts."],
    ],
    related: ["/features", "/tribes", "/custom-bio-pages"],
  },
  "/tribes": {
    title: "Tribes on slapz.lol - Communities, Invites, Roles and Tribe Chats",
    description:
      "Create and join slapz.lol Tribes, invite Slappers, manage members, approve join requests, customize tribe themes and open tribe chats.",
    kicker: "Tribes",
    h1: "Build small communities around your vibe.",
    intro:
      "Tribes give friend groups and communities a place to organize, invite members, approve join requests and chat together.",
    sections: [
      ["Create and manage", "Tribe owners can create Tribes, rename them, change colors, add members, remove members and delete Tribes."],
      ["Join requests", "Users can search public Tribes and request to join while owners approve or decline requests."],
      ["Tribe chats", "Members get access to tribe-scoped chats with message history and timestamps."],
    ],
    related: ["/slappers", "/games", "/features"],
  },
  "/games": {
    title: "Games on slapz.lol - Snake, Click Rush, Wordle, Crossy and Leaderboards",
    description:
      "Play mini-games on slapz.lol including Snake, Click Rush, Wordle and a Crossy-style game with saved scores, leaderboards and achievements.",
    kicker: "Games",
    h1: "Play quick games without leaving your dashboard.",
    intro:
      "The slapz.lol games dashboard turns profile building into a social game loop with mini-games, saved scores, achievements and leaderboards.",
    sections: [
      ["Mini-games", "Play Snake, Click Rush, Wordle and a Crossy-style game from compact expandable game cards."],
      ["Scores", "Save scores and compare against global, friend and Tribe leaderboards where available."],
      ["Challenges", "Use daily challenges and achievements to give users reasons to return."],
    ],
    related: ["/features", "/tribes", "/custom-bio-pages"],
  },
  "/about": {
    title: "About slapz.lol - A Custom Profile Platform for Creators and Friend Groups",
    description:
      "Learn about slapz.lol, a dark neon profile platform for creators, gamers and friend groups to share bios, music, Tribes, chats and games.",
    kicker: "About",
    h1: "A profile platform for people who want more than a link page.",
    intro:
      "slapz.lol is built for creators, gamers and friend groups who want a public profile that feels expressive, social and playful.",
    sections: [
      ["Why it exists", "Most profile pages feel static. slapz.lol adds music, motion, friends, Tribes, chats and games to make profiles feel alive."],
      ["Who it is for", "The platform is designed for creators, gamers, social users, friend groups and visitors discovering public profiles."],
      ["How it works", "Users sign up, customize a Bio, publish a public handle, add Slappers, join Tribes and play games from the dashboard."],
    ],
    related: ["/features", "/custom-bio-pages", "/help"],
  },
  "/help": {
    title: "slapz.lol Help - Profiles, Slappers, Tribes, Games and Account Support",
    description:
      "Get help with slapz.lol accounts, public profiles, profile music, background uploads, Slappers, Tribes, tribe chats and mini-games.",
    kicker: "Help",
    h1: "Get started with your slapz.lol profile.",
    intro:
      "This help page explains the main slapz.lol areas so new users can understand the dashboard, publish a profile and use social features safely.",
    sections: [
      ["Create a profile", "Sign up, open Bio, add a display name and handle, customize your page, then publish your public profile."],
      ["Use social features", "Add Slappers from the Tribes area, review notifications, create or join Tribes, and open tribe chats as a member."],
      ["Account and media tips", "Use reasonable file sizes for uploads, keep your password private, and use forgot password if you need to reset access."],
    ],
    related: ["/features", "/about", "/custom-bio-pages"],
  },
};
const seoPagePaths = Object.keys(seoPageDefinitions);
const noindexAppPaths = new Set(["/dashboard", "/settings", "/admin", "/owner", "/login", "/signup", "/reset-password"]);

function normalizeSiteOrigin(value) {
  try {
    const url = new URL(String(value || "").trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
}

const rateLimits = {
  auth: { limit: 12, windowMs: 10 * 60 * 1000 },
  forgotPassword: { limit: 6, windowMs: 10 * 60 * 1000 },
  resetPassword: { limit: 8, windowMs: 10 * 60 * 1000 },
  profileWrite: { limit: 30, windowMs: 10 * 60 * 1000 },
  tribeAction: { limit: 80, windowMs: 10 * 60 * 1000 },
  chatSend: { limit: 60, windowMs: 60 * 1000 },
  admin: { limit: 30, windowMs: 10 * 60 * 1000 },
};

const mediaLimits = {
  avatar: { maxBytes: 2 * 1024 * 1024, mimes: new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]) },
  background: {
    maxBytes: 12 * 1024 * 1024,
    mimes: new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "video/mp4", "video/webm", "video/ogg"]),
  },
  music: { maxBytes: 8 * 1024 * 1024, mimes: new Set(["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4"]) },
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(profilesPath)) fs.writeFileSync(profilesPath, "{}", "utf8");
  if (!fs.existsSync(usersPath)) fs.writeFileSync(usersPath, '{"users":{},"sessions":{}}', "utf8");
}

function readProfilesFile() {
  ensureStore();
  return JSON.parse(fs.readFileSync(profilesPath, "utf8"));
}

function writeProfilesFile(profiles) {
  ensureStore();
  fs.writeFileSync(profilesPath, JSON.stringify(profiles, null, 2), "utf8");
}

function readUsersFile() {
  ensureStore();
  const store = JSON.parse(fs.readFileSync(usersPath, "utf8"));
  store.users = store.users || {};
  store.sessions = store.sessions || {};
  store.passwordResets = store.passwordResets || {};
  return store;
}

function writeUsersFile(users) {
  ensureStore();
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf8");
}

function defaultDashboardSettings() {
  return {
    dashboardAppearance: "dark",
    dashboardTheme: "black",
    dashboardMusicMutedOutsideBio: false,
    cursorMode: "normal",
    cursorColor: "white",
  };
}

function parseDashboardSettings(value) {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return typeof value === "object" ? value : {};
}

function sanitizeDashboardSettings(settings = {}, previous = {}) {
  const incoming = parseDashboardSettings(settings);
  const base = {
    ...defaultDashboardSettings(),
    ...parseDashboardSettings(previous),
  };

  if (dashboardAppearanceOptions.has(incoming.dashboardAppearance)) {
    base.dashboardAppearance = incoming.dashboardAppearance;
  }
  if (dashboardThemeOptions.has(incoming.dashboardTheme)) {
    base.dashboardTheme = incoming.dashboardTheme;
  }
  if (typeof incoming.dashboardMusicMutedOutsideBio === "boolean") {
    base.dashboardMusicMutedOutsideBio = incoming.dashboardMusicMutedOutsideBio;
  }
  if (dashboardCursorModes.has(incoming.cursorMode)) {
    base.cursorMode = incoming.cursorMode;
  }
  if (dashboardCursorColors.has(incoming.cursorColor)) {
    base.cursorColor = incoming.cursorColor;
  }

  return base;
}

function sanitizeAccountStatus(value) {
  const status = String(value || "").trim().toLowerCase();
  return accountStatusOptions.has(status) ? status : "active";
}

function accountAccessError(status) {
  if (status === "banned") return "This account has been banned.";
  if (status === "suspended") return "This account is suspended.";
  return "";
}

function isRestrictedAccountStatus(status) {
  return status === "banned" || status === "suspended";
}

function logSecurity(event, req, details = {}) {
  const safeDetails = Object.entries(details)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${String(value).slice(0, 160)}`)
    .join(" ");
  console.warn(`[security] ${event} ip=${getRequestIp(req) || "unknown"} ${safeDetails}`.trim());
}

function isHttpsRequest(req) {
  const host = req.headers.host || "";
  return !host.includes("localhost") && !host.startsWith("127.") && (req.headers["x-forwarded-proto"] || "https") === "https";
}

function setSecurityHeaders(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
    ].join("; ")
  );
  if (isHttpsRequest(req)) res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
}

function setNoStore(res) {
  res.setHeader("Cache-Control", "no-store");
}

function isTrustedOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === String(req.headers.host || "");
  } catch {
    return false;
  }
}

function rateLimit(req, res, name, { limit, windowMs }) {
  const now = Date.now();
  const key = `${name}:${getRequestIp(req) || "unknown"}`;
  const bucket = rateLimitBuckets.get(key) || { count: 0, resetAt: now + windowMs };
  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }
  bucket.count += 1;
  rateLimitBuckets.set(key, bucket);
  if (bucket.count <= limit) return false;

  logSecurity("rate_limit_hit", req, { route: name, limit });
  res.setHeader("Retry-After", Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)));
  sendJson(res, 429, { error: "Too many requests. Try again soon." });
  return true;
}

function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, bucket] of rateLimitBuckets) {
    if (bucket.resetAt <= now) rateLimitBuckets.delete(key);
  }
}

async function supabaseRequest(table, { method = "GET", query = "", body, prefer } = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Supabase request failed with ${response.status}`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function supabaseStorageRequest(pathname, { method = "GET", body, contentType, extraHeaders = {} } = {}) {
  const response = await fetch(`${supabaseUrl}/storage/v1${pathname}`, {
    method,
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      ...(contentType ? { "Content-Type": contentType } : {}),
      ...extraHeaders,
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Supabase storage request failed with ${response.status}`);
  }

  return response;
}

async function ensureMediaBucket() {
  if (!hasSupabase || mediaBucketReady) return;

  const response = await fetch(`${supabaseUrl}/storage/v1/bucket/${mediaBucket}`, {
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
    },
  });

  if (response.status === 404) {
    await supabaseStorageRequest("/bucket", {
      method: "POST",
      contentType: "application/json",
      body: JSON.stringify({
        id: mediaBucket,
        name: mediaBucket,
        public: false,
      }),
    });
  } else if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Could not check Supabase media bucket");
  }

  mediaBucketReady = true;
}

function extensionFromMime(mime) {
  const map = {
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "audio/mp4": "m4a",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/ogg": "ogv",
  };
  return map[mime] || "bin";
}

async function uploadMediaDataUrl({ ownerUserId, handle, field, dataUrl }) {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return "";
  validateMediaUpload(field, parsed);

  await ensureMediaBucket();
  const ext = extensionFromMime(parsed.mime);
  const objectPath = `${ownerUserId}/${handle}/${field}.${ext}`;
  await supabaseStorageRequest(`/object/${mediaBucket}/${objectPath}`, {
    method: "POST",
    contentType: parsed.mime,
    body: parsed.buffer,
    extraHeaders: {
      "x-upsert": "true",
      "cache-control": "3600",
    },
  });
  return objectPath;
}

function validateMediaUpload(field, parsed) {
  const rules = mediaLimits[field];
  if (!rules || !parsed) return;
  if (!rules.mimes.has(parsed.mime)) throw new Error(`Unsupported ${field} file type`);
  if (parsed.buffer.length > rules.maxBytes) throw new Error(`${field} file is too large`);
}

function safeMediaMime(field, mime, fallback) {
  const rules = mediaLimits[field];
  const value = String(mime || "").split(";")[0].trim().toLowerCase();
  return rules?.mimes.has(value) ? value : fallback;
}

function validateProfileMedia(profile) {
  const fields = [
    { key: "avatarData", field: "avatar" },
    { key: "backgroundData", field: "background" },
    { key: "musicData", field: "music" },
  ];

  for (const item of fields) {
    const value = profile[item.key];
    if (typeof value === "string" && value.startsWith("data:")) {
      const parsed = parseDataUrl(value);
      if (!parsed) throw new Error(`Invalid ${item.field} file`);
      validateMediaUpload(item.field, parsed);
    }
  }
}

function rowToProfile(row) {
  if (!row) return null;
  return {
    ...(row.data || {}),
    handle: row.handle,
    ownerUserId: row.owner_user_id,
    views: Number(row.views || 0),
    updatedAt: row.updated_at,
  };
}

function profileToRow(profile) {
  const { ownerToken, ownerUserId, views, updatedAt, ...data } = profile;
  return {
    handle: profile.handle,
    owner_user_id: ownerUserId,
    views: Number(views || 0),
    updated_at: updatedAt || new Date().toISOString(),
    data,
  };
}

function publicProfilePayload(profile) {
  const {
    ownerToken,
    ownerUserId,
    friendRequests,
    sentFriendRequests,
    adminNotifications,
    tribes,
    tribeInvites,
    tribeJoinRequests,
    badgeOptOuts,
    unlockedBadges,
    ...publicProfile
  } = profile;
  return {
    ...publicProfile,
    entryAnimation: sanitizeEntryAnimation(publicProfile.entryAnimation),
    profilePrivacy: sanitizeProfilePrivacy(publicProfile.profilePrivacy),
  };
}

function handleFromFriendTarget(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const targetUrl = raw.startsWith("http") ? new URL(raw) : new URL(raw, "https://slapz.lol");
    const match = targetUrl.pathname.match(/^\/u\/([^/]+)/);
    if (match) return sanitizeHandle(decodeURIComponent(match[1]));
  } catch {
    // Fall through to plain handle cleanup.
  }

  return sanitizeHandle(raw.replace(/^\/u\//i, ""));
}

function requestDisplayName(profile) {
  return String(profile?.name || profile?.handle || "friend").trim().slice(0, 32);
}

function requestLinkFor(handle) {
  return handle ? `/u/${handle}` : "";
}

function friendFromRequest(request) {
  const handle = sanitizeHandle(request?.fromHandle);
  const link = request?.fromLink || requestLinkFor(handle);
  if (!handle && !link) return null;
  return {
    id: handle || crypto.randomUUID(),
    name: String(request?.fromName || handle || "Friend").trim().slice(0, 32),
    handle,
    link,
  };
}

function ownFriendFromProfile(profile) {
  const handle = sanitizeHandle(profile?.handle);
  if (!handle) return null;
  return {
    id: handle,
    name: requestDisplayName(profile),
    handle,
    link: requestLinkFor(handle),
  };
}

function profileHasFriend(profile, friendHandle, friendUserId) {
  const handle = sanitizeHandle(friendHandle);
  const userId = String(friendUserId || "");
  return (Array.isArray(profile?.friends) ? profile.friends : []).some((friend) => {
    const linkedHandle = sanitizeHandle(friend?.handle) || handleFromFriendTarget(friend?.link);
    return (handle && linkedHandle === handle) || (userId && String(friend?.userId || friend?.id || "") === userId);
  });
}

async function canViewProfile(profile, req) {
  const privacy = sanitizeProfilePrivacy(profile?.profilePrivacy);
  if (privacy === "public") return { allowed: true, privacy };

  const authed = await getAuthedUser(req);
  if (!authed) return { allowed: false, privacy };
  if (profile?.ownerUserId && profile.ownerUserId === authed.userId) return { allowed: true, privacy, authed };
  if (privacy === "hidden") return { allowed: false, privacy, authed };

  const viewerProfile = await getProfileByOwner(authed.userId);
  const ownerHandle = sanitizeHandle(profile?.handle);
  const viewerHandle = sanitizeHandle(viewerProfile?.handle);
  const allowed =
    profileHasFriend(profile, viewerHandle, authed.userId) ||
    profileHasFriend(viewerProfile, ownerHandle, profile?.ownerUserId);

  return { allowed, privacy, authed };
}

function sentRequestFromTarget(profile, request) {
  const handle = sanitizeHandle(profile?.handle);
  if (!handle) return null;
  return {
    id: request.id,
    targetName: requestDisplayName(profile),
    targetHandle: handle,
    targetLink: requestLinkFor(handle),
    createdAt: request.createdAt,
  };
}

function mergeFriend(list, friend) {
  if (!friend) return Array.isArray(list) ? list : [];
  const current = Array.isArray(list) ? list : [];
  const friendKey = friend.handle || friend.link;
  if (current.some((item) => (item.handle || item.link) === friendKey)) return current;
  return [...current, friend].slice(0, maxFriendCount);
}

function friendMatchesKey(friend, key) {
  const rawKey = String(key || "");
  const handleKey = handleFromFriendTarget(rawKey);
  return (
    String(friend?.id || "") === rawKey ||
    (handleKey && sanitizeHandle(friend?.handle) === handleKey) ||
    (handleKey && handleFromFriendTarget(friend?.link) === handleKey) ||
    String(friend?.link || "") === rawKey
  );
}

function sanitizeTribeName(name) {
  return String(name || "").trim().replace(/\s+/g, " ").slice(0, 36);
}

function sanitizeThemeColor(color) {
  const value = String(color || "").trim();
  return /^#[0-9a-f]{6}$/i.test(value) ? value : "#f5f7fb";
}

function sanitizeChatText(text) {
  return String(text || "").trim().replace(/\s+/g, " ").slice(0, 500);
}

function sanitizeTribeVisibility(value) {
  return ["public", "private", "invite-only"].includes(String(value || "")) ? String(value) : "public";
}

function sanitizeTribeIcon(value) {
  return String(value || "T").trim().slice(0, 4) || "T";
}

function sanitizeShortText(value, max = 140) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, max);
}

function sanitizeProfileTemplate(value) {
  return ["dark", "gamer", "neon", "cute", "anime", "music", "creator", "retro"].includes(String(value || ""))
    ? String(value)
    : "dark";
}

function sanitizeEntryAnimation(value) {
  return ["none", "fade-in", "neon-pulse", "glitch", "portal", "pixel-load"].includes(String(value || ""))
    ? String(value)
    : "none";
}

function sanitizeProfilePrivacy(value) {
  return ["public", "friends", "hidden"].includes(String(value || "")) ? String(value) : "public";
}

function sanitizeProfileStatus(value) {
  const status = sanitizeShortText(value || "Online", 32);
  return ["Online", "Chilling", "Gaming", "Busy", "Listening to music"].includes(status) ? status : "Online";
}

function sanitizeProfileBadges(items = []) {
  const allowed = new Set(["Early User", "Verified Profile", "Tribe Owner", "Game Champion", "Top Friend", "Profile Creator"]);
  return [...new Set((Array.isArray(items) ? items : []).map((item) => sanitizeShortText(item, 32)).filter((item) => allowed.has(item)))].slice(0, 6);
}

function sanitizeFeaturedProfileItem(item = {}) {
  const type = ["status", "game", "song", "tribe", "friend"].includes(String(item.type || "")) ? String(item.type) : "status";
  return { type, text: sanitizeShortText(item.text, 80) };
}

function sanitizeImageDataUrl(value, maxBytes = 1024 * 1024) {
  const dataUrl = String(value || "");
  if (!dataUrl) return "";
  const parsed = parseDataUrl(dataUrl);
  if (!parsed || !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(parsed.mime)) return "";
  if (parsed.buffer.length > maxBytes) return "";
  return dataUrl;
}

function sanitizeChatAttachment(attachment) {
  if (!attachment?.data) return null;
  const data = sanitizeImageDataUrl(attachment.data, 1024 * 1024);
  if (!data) return null;
  return {
    name: sanitizeShortText(attachment.name || "attachment", 80),
    type: String(attachment.type || "").slice(0, 48),
    data,
  };
}

function cleanIdList(items) {
  return [...new Set((Array.isArray(items) ? items : []).map((item) => String(item || "").trim()).filter(Boolean))];
}

function tribeMemberFromProfile(profile) {
  const handle = sanitizeHandle(profile?.handle);
  return {
    userId: String(profile?.ownerUserId || ""),
    displayName: requestDisplayName(profile),
    handle,
    link: requestLinkFor(handle),
    role: "member",
  };
}

function normalizeTribe(tribe, ownerProfile) {
  const now = new Date().toISOString();
  const ownerId = String(tribe?.ownerId || ownerProfile?.ownerUserId || "");
  const rawMemberIds = Array.isArray(tribe?.memberIds)
    ? tribe.memberIds
    : Array.isArray(tribe?.members)
      ? tribe.members.map((member) => member?.userId || member?.id)
      : [];
  const memberIds = cleanIdList(rawMemberIds);
  if (ownerId && !memberIds.includes(ownerId)) memberIds.unshift(ownerId);
  const adminIds = cleanIdList(tribe?.adminIds).filter((id) => id && id !== ownerId && memberIds.includes(id));

  return {
    tribeId: String(tribe?.tribeId || crypto.randomUUID()),
    name: sanitizeTribeName(tribe?.name) || "Untitled tribe",
    ownerId,
    ownerDisplayName: requestDisplayName(ownerProfile) || String(tribe?.ownerDisplayName || "Owner").slice(0, 32),
    ownerHandle: sanitizeHandle(ownerProfile?.handle || tribe?.ownerHandle),
    memberIds,
    adminIds,
    pendingInviteIds: cleanIdList(tribe?.pendingInviteIds),
    pendingJoinIds: cleanIdList(tribe?.pendingJoinIds),
    messages: (Array.isArray(tribe?.messages) ? tribe.messages : [])
      .map((message) => ({
        id: String(message?.id || crypto.randomUUID()),
        senderId: String(message?.senderId || ""),
        senderDisplayName: String(message?.senderDisplayName || "Member").trim().slice(0, 32),
        senderHandle: sanitizeHandle(message?.senderHandle),
        text: sanitizeChatText(message?.text),
        attachment: sanitizeChatAttachment(message?.attachment),
        reactions: Object.fromEntries(
          Object.entries(message?.reactions || {})
            .map(([emoji, userIds]) => [String(emoji).slice(0, 4), cleanIdList(userIds).slice(0, 60)])
            .filter(([emoji]) => emoji)
        ),
        pinned: Boolean(message?.pinned),
        createdAt: message?.createdAt || now,
      }))
      .filter((message) => message.senderId && (message.text || message.attachment))
      .slice(-300),
    themeColor: sanitizeThemeColor(tribe?.themeColor),
    visibility: sanitizeTribeVisibility(tribe?.visibility),
    icon: sanitizeTribeIcon(tribe?.icon),
    bannerData: sanitizeImageDataUrl(tribe?.bannerData, 1024 * 1024),
    announcement: sanitizeShortText(tribe?.announcement, 140),
    createdAt: tribe?.createdAt || now,
    updatedAt: tribe?.updatedAt || now,
  };
}

function normalizeTribesForProfile(profile) {
  return (Array.isArray(profile?.tribes) ? profile.tribes : []).map((tribe) => normalizeTribe(tribe, profile));
}

function profileFriendHandles(profile) {
  return new Set(
    (Array.isArray(profile?.friends) ? profile.friends : [])
      .map((friend) => sanitizeHandle(friend?.handle) || handleFromFriendTarget(friend?.link))
      .filter(Boolean)
  );
}

function serializeTribe(tribe, ownerProfile, viewerProfile, profiles = []) {
  const profileByOwnerId = new Map(profiles.map((profile) => [String(profile.ownerUserId || ""), profile]));
  const members = tribe.memberIds.map((memberId) => {
    const memberProfile = profileByOwnerId.get(String(memberId)) || (String(memberId) === String(ownerProfile?.ownerUserId) ? ownerProfile : null);
    const role = String(memberId) === String(tribe.ownerId) ? "owner" : tribe.adminIds.includes(String(memberId)) ? "admin" : "member";
    if (memberProfile) return { ...tribeMemberFromProfile(memberProfile), role };
    return {
      userId: String(memberId),
      displayName: "Unknown member",
      handle: "",
      link: "",
      role,
    };
  });
  const viewerId = String(viewerProfile?.ownerUserId || "");
  const { messages, ...safeTribe } = tribe;

  return {
    ...safeTribe,
    ownerDisplayName: requestDisplayName(ownerProfile),
    ownerHandle: sanitizeHandle(ownerProfile?.handle || tribe.ownerHandle),
    members,
    isOwner: Boolean(viewerId && viewerId === tribe.ownerId),
    isAdmin: Boolean(viewerId && tribe.adminIds.includes(viewerId)),
    isMember: Boolean(viewerId && tribe.memberIds.includes(viewerId)),
    hasPendingJoin: Boolean(viewerId && tribe.pendingJoinIds.includes(viewerId)),
  };
}

function canAccessTribe(tribe, userId) {
  const viewerId = String(userId || "");
  return Boolean(viewerId && (tribe.ownerId === viewerId || tribe.memberIds.includes(viewerId)));
}

function canManageTribe(tribe, userId) {
  const viewerId = String(userId || "");
  return Boolean(viewerId && (tribe.ownerId === viewerId || tribe.adminIds.includes(viewerId)));
}

async function listTribeSummaries(viewerProfile) {
  const profiles = await listProfiles();
  return profiles
    .flatMap((profile) => normalizeTribesForProfile(profile).map((tribe) => serializeTribe(tribe, profile, viewerProfile, profiles)))
    .filter((tribe) => tribe.visibility === "public" || tribe.isOwner || tribe.isMember || tribe.hasPendingJoin)
    .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
}

async function findTribeById(tribeId) {
  const profiles = await listProfiles();
  const cleanTribeId = String(tribeId || "");
  for (const ownerProfile of profiles) {
    const tribes = normalizeTribesForProfile(ownerProfile);
    const tribeIndex = tribes.findIndex((tribe) => tribe.tribeId === cleanTribeId);
    if (tribeIndex >= 0) {
      return {
        ownerProfile,
        tribe: tribes[tribeIndex],
        tribeIndex,
        tribes,
      };
    }
  }
  return null;
}

async function tribeStateFor(profile) {
  return {
    tribes: await listTribeSummaries(profile),
    tribeInvites: Array.isArray(profile?.tribeInvites) ? profile.tribeInvites : [],
    tribeJoinRequests: Array.isArray(profile?.tribeJoinRequests) ? profile.tribeJoinRequests : [],
  };
}

async function prepareProfileForSave(profile, existingProfile) {
  if (!hasSupabase) return profile;

  const next = { ...profile };
  const mediaFields = [
    { data: "avatarData", path: "avatarPath", name: "avatarName", field: "avatar" },
    { data: "backgroundData", path: "backgroundPath", name: "backgroundName", field: "background" },
    { data: "musicData", path: "musicPath", name: "musicName", field: "music" },
  ];

  for (const item of mediaFields) {
    const value = next[item.data];
    if (typeof value === "string" && value.startsWith("data:")) {
      next[item.path] = await uploadMediaDataUrl({
        ownerUserId: next.ownerUserId,
        handle: next.handle,
        field: item.field,
        dataUrl: value,
      });
      delete next[item.data];
      continue;
    }

    if (next[item.path] && existingProfile?.[item.path] && next[item.path] === existingProfile[item.path]) {
      delete next[item.data];
      continue;
    }

    delete next[item.path];

    if (value === "") {
      delete next[item.data];
      continue;
    }

    if (existingProfile?.[item.path]) {
      next[item.path] = existingProfile[item.path];
      delete next[item.data];
    }
  }

  return next;
}

async function listProfiles() {
  if (hasSupabase) {
    const rows = await supabaseRequest("app_profiles", { query: "?select=*" });
    return rows.map(rowToProfile);
  }
  return Object.values(readProfilesFile());
}

async function getProfile(handle) {
  if (hasSupabase) {
    const rows = await supabaseRequest("app_profiles", {
      query: `?handle=eq.${encodeURIComponent(handle)}&select=*&limit=1`,
    });
    return rowToProfile(rows[0]);
  }
  return readProfilesFile()[handle] || null;
}

async function getProfileByOwner(userId) {
  if (hasSupabase) {
    const rows = await supabaseRequest("app_profiles", {
      query: `?owner_user_id=eq.${encodeURIComponent(userId)}&select=*&order=updated_at.desc&limit=1`,
    });
    return rowToProfile(rows[0]);
  }

  return (
    Object.values(readProfilesFile())
      .filter((profile) => profile.ownerUserId === userId)
      .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))[0] || null
  );
}

async function saveProfile(profile) {
  if (hasSupabase) {
    await supabaseRequest("app_profiles", {
      method: "POST",
      query: "?on_conflict=handle",
      body: profileToRow(profile),
      prefer: "resolution=merge-duplicates,return=representation",
    });
    return;
  }

  const profiles = readProfilesFile();
  profiles[profile.handle] = profile;
  writeProfilesFile(profiles);
}

function isAdminUser(authed) {
  return Boolean(authed?.role === "admin" || adminEmails.has(cleanEmail(authed?.email)));
}

function isOwnerUser(authed) {
  return isAdminUser(authed);
}

async function requireOwner(req, res) {
  const authed = await getAuthedUser(req);
  if (!authed) {
    logSecurity("admin_access_unauthenticated", req, { path: req.url });
    sendJson(res, 401, { error: "Sign in before opening owner tools" });
    return null;
  }
  if (!isOwnerUser(authed)) {
    logSecurity("admin_access_forbidden", req, { userId: authed.userId, path: req.url });
    sendJson(res, 403, { error: "Forbidden" });
    return null;
  }
  return authed;
}

async function findUserById(userId) {
  const cleanUserId = String(userId || "").trim();
  if (!cleanUserId) return null;

  if (hasSupabase) {
    const rows = await supabaseRequest("app_users", {
      query: `?id=eq.${encodeURIComponent(cleanUserId)}&select=*&limit=1`,
    });
    const user = rows[0];
    return user
      ? {
          userId: user.id,
          email: user.email,
          createdAt: user.created_at,
          profileHandle: user.profile_handle,
          profilePath: user.profile_path,
          profileUrl: user.profile_url,
          role: user.role || "user",
          accountStatus: sanitizeAccountStatus(user.account_status),
          accountStatusUpdatedAt: user.account_status_updated_at || "",
        }
      : null;
  }

  const user = readUsersFile().users[cleanUserId];
  return user
    ? {
        userId: cleanUserId,
        email: user.email,
        createdAt: user.createdAt,
        profileHandle: user.profileHandle,
        profilePath: user.profilePath,
        profileUrl: user.profileUrl,
        role: user.role || "user",
        accountStatus: sanitizeAccountStatus(user.accountStatus),
        accountStatusUpdatedAt: user.accountStatusUpdatedAt || "",
      }
    : null;
}

function profileSummaryForAdmin(user, profile) {
  const handle = sanitizeHandle(profile?.handle || user.profileHandle);
  return {
    userId: user.userId,
    email: user.email,
    createdAt: user.createdAt,
    profileHandle: handle,
    profilePath: user.profilePath || (handle ? `/u/${handle}` : ""),
    profileUrl: user.profileUrl || "",
    displayName: profile?.handle ? requestDisplayName(profile) : "No profile",
    handle,
    views: Number(profile?.views || 0),
    updatedAt: profile?.updatedAt || "",
    hasProfile: Boolean(profile?.handle),
    isOwner: isAdminUser(user),
    accountStatus: sanitizeAccountStatus(user.accountStatus),
    accountStatusUpdatedAt: user.accountStatusUpdatedAt || "",
  };
}

async function listUsersForAdmin() {
  const profiles = await listProfiles();
  const profileByOwner = new Map();
  profiles.forEach((profile) => {
    if (!profile?.ownerUserId) return;
    const current = profileByOwner.get(profile.ownerUserId);
    if (!current || String(profile.updatedAt || "").localeCompare(String(current.updatedAt || "")) > 0) {
      profileByOwner.set(profile.ownerUserId, profile);
    }
  });

  let users;
  if (hasSupabase) {
    const rows = await supabaseRequest("app_users", {
      query: "?select=*&order=created_at.desc",
    });
    users = rows.map((user) => ({
      userId: user.id,
      email: user.email,
      createdAt: user.created_at,
      profileHandle: user.profile_handle,
      profilePath: user.profile_path,
      profileUrl: user.profile_url,
      role: user.role || "user",
      accountStatus: sanitizeAccountStatus(user.account_status),
      accountStatusUpdatedAt: user.account_status_updated_at || "",
    }));
  } else {
    users = Object.entries(readUsersFile().users).map(([userId, user]) => ({
      userId,
      email: user.email,
      createdAt: user.createdAt,
      profileHandle: user.profileHandle,
      profilePath: user.profilePath,
      profileUrl: user.profileUrl,
      role: user.role || "user",
      accountStatus: sanitizeAccountStatus(user.accountStatus),
      accountStatusUpdatedAt: user.accountStatusUpdatedAt || "",
    }));
    users.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  }

  return users.map((user) => profileSummaryForAdmin(user, profileByOwner.get(user.userId)));
}

function sanitizeAdminMessage(message) {
  return String(message || "").trim().replace(/\s+/g, " ").slice(0, 220);
}

async function adminSendNotification(targetUserId, message) {
  const target = await findUserById(targetUserId);
  if (!target) throw new Error("User was not found");

  const targetProfile = await getProfileByOwner(targetUserId);
  if (!targetProfile?.handle) throw new Error("That user needs a published profile before dashboard notices can be shown");

  const notice = {
    id: crypto.randomUUID(),
    type: "owner",
    title: "Owner notice",
    message: sanitizeAdminMessage(message),
    createdAt: new Date().toISOString(),
  };
  if (!notice.message) throw new Error("Enter a notification message");

  targetProfile.adminNotifications = [notice, ...(Array.isArray(targetProfile.adminNotifications) ? targetProfile.adminNotifications : [])].slice(0, 40);
  targetProfile.updatedAt = notice.createdAt;
  await saveProfile(targetProfile);
  return notice;
}

async function adminAddFriend(owner, targetUserId) {
  if (owner.userId === targetUserId) throw new Error("The owner account is already itself");

  const target = await findUserById(targetUserId);
  if (!target) throw new Error("User was not found");

  const ownerProfile = await getProfileByOwner(owner.userId);
  const targetProfile = await getProfileByOwner(targetUserId);
  if (!ownerProfile?.handle || !targetProfile?.handle) {
    throw new Error("Both accounts need published profiles before adding friends");
  }

  ownerProfile.friends = mergeFriend(ownerProfile.friends, ownFriendFromProfile(targetProfile));
  ownerProfile.sentFriendRequests = (Array.isArray(ownerProfile.sentFriendRequests) ? ownerProfile.sentFriendRequests : []).filter(
    (request) => request.targetHandle !== targetProfile.handle
  );
  ownerProfile.friendRequests = (Array.isArray(ownerProfile.friendRequests) ? ownerProfile.friendRequests : []).filter(
    (request) => request.fromHandle !== targetProfile.handle
  );
  ownerProfile.updatedAt = new Date().toISOString();

  targetProfile.friends = mergeFriend(targetProfile.friends, ownFriendFromProfile(ownerProfile));
  targetProfile.sentFriendRequests = (Array.isArray(targetProfile.sentFriendRequests) ? targetProfile.sentFriendRequests : []).filter(
    (request) => request.targetHandle !== ownerProfile.handle
  );
  targetProfile.friendRequests = (Array.isArray(targetProfile.friendRequests) ? targetProfile.friendRequests : []).filter(
    (request) => request.fromHandle !== ownerProfile.handle
  );
  targetProfile.updatedAt = ownerProfile.updatedAt;

  await saveProfile(ownerProfile);
  await saveProfile(targetProfile);
  return { friends: ownerProfile.friends || [] };
}

async function updateUserAccountStatus(owner, targetUserId, status) {
  const accountStatus = String(status || "").trim().toLowerCase();
  if (!accountStatusOptions.has(accountStatus)) throw new Error("Choose active, suspended, or banned");
  const target = await findUserById(targetUserId);
  if (!target) throw new Error("User was not found");
  if (owner.userId === targetUserId) throw new Error("You cannot change your own owner account status");
  if (isAdminUser(target)) throw new Error("Owner/admin accounts cannot be suspended or banned");

  const accountStatusUpdatedAt = new Date().toISOString();

  if (hasSupabase) {
    await supabaseRequest("app_users", {
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(targetUserId)}`,
      body: {
        account_status: accountStatus,
        account_status_updated_at: accountStatusUpdatedAt,
      },
      prefer: "return=minimal",
    });
  } else {
    const store = readUsersFile();
    if (!store.users[targetUserId]) throw new Error("User was not found");
    store.users[targetUserId].accountStatus = accountStatus;
    store.users[targetUserId].accountStatusUpdatedAt = accountStatusUpdatedAt;
    writeUsersFile(store);
  }

  if (accountStatus !== "active") await invalidateUserSessions(targetUserId);

  const updated = await findUserById(targetUserId);
  const profile = await getProfileByOwner(targetUserId);
  return profileSummaryForAdmin(updated || target, profile);
}

async function removeDeletedUserReferences(userId, deletedHandle = "") {
  const cleanHandleValue = sanitizeHandle(deletedHandle);
  const profiles = await listProfiles();

  for (const profile of profiles) {
    if (!profile?.handle || profile.ownerUserId === userId) continue;

    let changed = false;
    const filterByHandle = (items, key) => {
      const current = Array.isArray(items) ? items : [];
      const next = current.filter((item) => sanitizeHandle(item?.[key] || item?.handle) !== cleanHandleValue);
      if (next.length !== current.length) changed = true;
      return next;
    };

    if (cleanHandleValue) {
      profile.friends = filterByHandle(profile.friends, "handle");
      profile.friendRequests = filterByHandle(profile.friendRequests, "fromHandle");
      profile.sentFriendRequests = filterByHandle(profile.sentFriendRequests, "targetHandle");
    }

    const tribes = normalizeTribesForProfile(profile);
    const nextTribes = tribes.map((tribe) => ({
      ...tribe,
      memberIds: tribe.memberIds.filter((id) => id !== userId),
      pendingInviteIds: tribe.pendingInviteIds.filter((id) => id !== userId),
      pendingJoinIds: tribe.pendingJoinIds.filter((id) => id !== userId),
    }));
    if (JSON.stringify(nextTribes) !== JSON.stringify(tribes)) {
      profile.tribes = nextTribes;
      changed = true;
    }

    const currentJoinRequests = Array.isArray(profile.tribeJoinRequests) ? profile.tribeJoinRequests : [];
    const nextJoinRequests = currentJoinRequests.filter((request) => request.requesterId !== userId);
    if (nextJoinRequests.length !== currentJoinRequests.length) {
      profile.tribeJoinRequests = nextJoinRequests;
      changed = true;
    }

    const currentInvites = Array.isArray(profile.tribeInvites) ? profile.tribeInvites : [];
    const nextInvites = currentInvites.filter((invite) => invite.ownerId !== userId);
    if (nextInvites.length !== currentInvites.length) {
      profile.tribeInvites = nextInvites;
      changed = true;
    }

    if (changed) {
      profile.updatedAt = new Date().toISOString();
      await saveProfile(profile);
    }
  }
}

async function deleteUserAccount(userId) {
  const user = await findUserById(userId);
  if (!user) throw new Error("User was not found");
  if (isAdminUser(user)) throw new Error("Admin accounts cannot be deleted");

  const profile = await getProfileByOwner(userId);
  await removeDeletedUserReferences(userId, profile?.handle || user.profileHandle);

  if (hasSupabase) {
    await supabaseRequest("app_profiles", {
      method: "DELETE",
      query: `?owner_user_id=eq.${encodeURIComponent(userId)}`,
      prefer: "return=minimal",
    });
    await supabaseRequest("app_sessions", {
      method: "DELETE",
      query: `?user_id=eq.${encodeURIComponent(userId)}`,
      prefer: "return=minimal",
    });
    try {
      await supabaseRequest("app_password_resets", {
        method: "DELETE",
        query: `?user_id=eq.${encodeURIComponent(userId)}`,
        prefer: "return=minimal",
      });
    } catch (error) {
      console.warn("Could not clear password reset rows during account delete:", error.message);
    }
    await supabaseRequest("app_users", {
      method: "DELETE",
      query: `?id=eq.${encodeURIComponent(userId)}`,
      prefer: "return=minimal",
    });
    return user;
  }

  const profiles = readProfilesFile();
  Object.entries(profiles).forEach(([handle, storedProfile]) => {
    if (storedProfile?.ownerUserId === userId) delete profiles[handle];
  });
  writeProfilesFile(profiles);

  const store = readUsersFile();
  delete store.users[userId];
  Object.entries(store.sessions).forEach(([token, session]) => {
    if (session.userId === userId) delete store.sessions[token];
  });
  Object.entries(store.passwordResets).forEach(([tokenHash, reset]) => {
    if (reset.userId === userId) delete store.passwordResets[tokenHash];
  });
  writeUsersFile(store);
  return user;
}

function onboardingStateForUser(user, profile) {
  const hasPublishedProfile = Boolean(profile?.handle || user?.profileHandle || user?.profile_handle);
  const completed = Boolean(user?.onboardingCompleted || user?.onboarding_completed || hasPublishedProfile);
  const skipped = Boolean(user?.onboardingSkipped || user?.onboarding_skipped);
  return {
    onboardingCompleted: completed,
    onboardingSkipped: skipped,
    onboardingUpdatedAt: user?.onboardingUpdatedAt || user?.onboarding_updated_at || "",
    needsOnboarding: !completed && !skipped,
  };
}

async function saveUserOnboardingStatus(userId, { completed = false, skipped = false } = {}) {
  const onboardingCompleted = Boolean(completed);
  const onboardingSkipped = onboardingCompleted ? false : Boolean(skipped);
  const onboardingUpdatedAt = new Date().toISOString();

  if (hasSupabase) {
    await supabaseRequest("app_users", {
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(userId)}`,
      body: {
        onboarding_completed: onboardingCompleted,
        onboarding_skipped: onboardingSkipped,
        onboarding_updated_at: onboardingUpdatedAt,
      },
      prefer: "return=minimal",
    });
    return { onboardingCompleted, onboardingSkipped, onboardingUpdatedAt };
  }

  const store = readUsersFile();
  if (!store.users[userId]) throw new Error("User not found");
  store.users[userId].onboardingCompleted = onboardingCompleted;
  store.users[userId].onboardingSkipped = onboardingSkipped;
  store.users[userId].onboardingUpdatedAt = onboardingUpdatedAt;
  writeUsersFile(store);
  return { onboardingCompleted, onboardingSkipped, onboardingUpdatedAt };
}

async function saveUserDashboardSettings(userId, settings) {
  if (hasSupabase) {
    const rows = await supabaseRequest("app_users", {
      query: `?id=eq.${encodeURIComponent(userId)}&select=dashboard_settings&limit=1`,
    });
    if (!rows[0]) throw new Error("User not found");
    const dashboardSettings = sanitizeDashboardSettings(settings, rows[0].dashboard_settings);
    await supabaseRequest("app_users", {
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(userId)}`,
      body: { dashboard_settings: dashboardSettings },
      prefer: "return=minimal",
    });
    return dashboardSettings;
  }

  const store = readUsersFile();
  if (!store.users[userId]) throw new Error("User not found");
  const dashboardSettings = sanitizeDashboardSettings(settings, store.users[userId].dashboardSettings);
  store.users[userId].dashboardSettings = dashboardSettings;
  writeUsersFile(store);
  return dashboardSettings;
}

async function saveUserProfileLink(userId, { handle, origin }) {
  const profilePath = `/u/${handle}`;
  const profileUrl = `${origin}${profilePath}`;

  if (hasSupabase) {
    try {
      await supabaseRequest("app_users", {
        method: "PATCH",
        query: `?id=eq.${encodeURIComponent(userId)}`,
        body: {
          profile_handle: handle,
          profile_path: profilePath,
          profile_url: profileUrl,
        },
        prefer: "return=minimal",
      });
    } catch (error) {
      console.warn("Could not save profile link on app_users. Run the latest supabase-schema.sql.", error.message);
    }
    try {
      await saveUserOnboardingStatus(userId, { completed: true });
    } catch (error) {
      console.warn("Could not mark onboarding completed. Run the latest supabase-schema.sql.", error.message);
    }
    return;
  }

  const store = readUsersFile();
  if (store.users[userId]) {
    store.users[userId].profileHandle = handle;
    store.users[userId].profilePath = profilePath;
    store.users[userId].profileUrl = profileUrl;
    store.users[userId].onboardingCompleted = true;
    store.users[userId].onboardingSkipped = false;
    store.users[userId].onboardingUpdatedAt = new Date().toISOString();
    writeUsersFile(store);
  }
}

async function getSnakeHighScore(userId) {
  if (hasSupabase) {
    try {
      const rows = await supabaseRequest("app_users", {
        query: `?id=eq.${encodeURIComponent(userId)}&select=snake_high_score&limit=1`,
      });
      return Number(rows[0]?.snake_high_score || 0);
    } catch (error) {
      console.warn("Could not read snake_high_score. Run the latest supabase-schema.sql.", error.message);
      return 0;
    }
  }

  const user = readUsersFile().users[userId];
  return Number(user?.snakeHighScore || 0);
}

async function saveSnakeHighScore(userId, score) {
  const safeScore = Math.max(0, Math.min(999999, Number.parseInt(score, 10) || 0));
  const currentScore = await getSnakeHighScore(userId);
  const highScore = Math.max(currentScore, safeScore);

  if (hasSupabase) {
    try {
      await supabaseRequest("app_users", {
        method: "PATCH",
        query: `?id=eq.${encodeURIComponent(userId)}`,
        body: { snake_high_score: highScore },
        prefer: "return=minimal",
      });
    } catch (error) {
      console.warn("Could not save snake_high_score. Run the latest supabase-schema.sql.", error.message);
    }
    return highScore;
  }

  const store = readUsersFile();
  if (store.users[userId]) {
    store.users[userId].snakeHighScore = highScore;
    writeUsersFile(store);
  }
  return highScore;
}

async function listUserScores() {
  const profiles = await listProfiles();
  const profileByOwner = new Map(profiles.map((profile) => [String(profile.ownerUserId || ""), profile]));

  if (hasSupabase) {
    try {
      const rows = await supabaseRequest("app_users", { query: "?select=*" });
      return rows.map((user) => {
        const profile = profileByOwner.get(String(user.id));
        return {
          userId: String(user.id),
          displayName: requestDisplayName(profile),
          handle: sanitizeHandle(profile?.handle || user.profile_handle),
          score: Number(user.snake_high_score || 0),
        };
      });
    } catch {
      return [];
    }
  }

  const users = readUsersFile().users;
  return Object.entries(users).map(([userId, user]) => {
    const profile = profileByOwner.get(String(userId));
    return {
      userId,
      displayName: requestDisplayName(profile),
      handle: sanitizeHandle(profile?.handle || user.profileHandle),
      score: Number(user.snakeHighScore || 0),
    };
  });
}

async function listUserCreationFacts() {
  if (hasSupabase) {
    try {
      const rows = await supabaseRequest("app_users", { query: "?select=id,created_at&order=created_at.asc" });
      return rows.map((user) => ({
        userId: String(user.id),
        createdAt: user.created_at || "",
      }));
    } catch {
      return [];
    }
  }

  return Object.entries(readUsersFile().users)
    .map(([userId, user]) => ({
      userId,
      createdAt: user.createdAt || "",
    }))
    .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
}

async function isEarlyUser(userId) {
  const users = await listUserCreationFacts();
  const index = users.findIndex((user) => user.userId === String(userId || ""));
  return index >= 0 && index < 1000;
}

async function isGameChampion(userId) {
  const scores = (await listUserScores())
    .filter((row) => Number(row.score || 0) > 0)
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  const index = scores.findIndex((row) => row.userId === String(userId || ""));
  return index >= 0 && index < 25;
}

async function unlockedProfileBadges(profile, user) {
  const userId = String(user?.userId || user?.id || profile?.ownerUserId || "");
  const unlocked = new Set();
  const hasPublishedProfile = Boolean(profile?.handle && profile?.ownerUserId);
  const hasBasicProfile = Boolean(hasPublishedProfile && sanitizeShortText(profile?.name, 32) && sanitizeHandle(profile?.handle));

  if (userId && (await isEarlyUser(userId))) unlocked.add("Early User");
  if (hasPublishedProfile) unlocked.add("Verified Profile");
  if (hasBasicProfile) unlocked.add("Profile Creator");
  if (normalizeTribesForProfile(profile).some((tribe) => tribe.ownerId === userId)) unlocked.add("Tribe Owner");
  if ((Array.isArray(profile?.friends) ? profile.friends : []).length > 100) unlocked.add("Top Friend");
  if (userId && (await isGameChampion(userId))) unlocked.add("Game Champion");

  return sanitizeProfileBadges([...unlocked]);
}

async function applyProfileBadgeRules(profile, user) {
  const unlocked = new Set(await unlockedProfileBadges(profile, user));
  const optOuts = sanitizeProfileBadges(profile.badgeOptOuts).filter((badge) => unlocked.has(badge));
  const optedOut = new Set(optOuts);
  const badges = sanitizeProfileBadges([...sanitizeProfileBadges(profile.badges), ...unlocked]).filter(
    (badge) => unlocked.has(badge) && !optedOut.has(badge)
  );
  return {
    ...profile,
    badges,
    badgeOptOuts: optOuts,
  };
}

async function publicUserSearch(viewerProfile, query = "", { suggestions = false } = {}) {
  const profiles = await listProfiles();
  const viewerHandle = sanitizeHandle(viewerProfile?.handle);
  const friendHandles = profileFriendHandles(viewerProfile);
  const viewerTribeIds = new Set(normalizeTribesForProfile(viewerProfile).map((tribe) => tribe.tribeId));
  const search = String(query || "").trim().toLowerCase();
  const targetHandle = handleFromFriendTarget(search);

  return profiles
    .filter((profile) => profile?.handle && profile.handle !== viewerHandle)
    .map((profile) => {
      const profileTribeIds = new Set(normalizeTribesForProfile(profile).map((tribe) => tribe.tribeId));
      const sharedTribeCount = [...profileTribeIds].filter((id) => viewerTribeIds.has(id)).length;
      return {
        displayName: requestDisplayName(profile),
        handle: sanitizeHandle(profile.handle),
        profilePath: `/u/${sanitizeHandle(profile.handle)}`,
        views: Number(profile.views || 0),
        friendCount: Array.isArray(profile.friends) ? profile.friends.length : 0,
        sharedTribeCount,
        alreadyFriend: friendHandles.has(sanitizeHandle(profile.handle)),
      };
    })
    .filter((user) => {
      if (suggestions) return !user.alreadyFriend;
      if (!search) return false;
      return (
        user.handle.includes(targetHandle || search) ||
        user.displayName.toLowerCase().includes(search) ||
        user.profilePath.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      if (suggestions) return (b.sharedTribeCount - a.sharedTribeCount) || (b.friendCount - a.friendCount) || (b.views - a.views);
      return b.views - a.views;
    })
    .slice(0, suggestions ? 8 : 12)
    .map(({ alreadyFriend, ...user }) => user);
}

async function incrementProfileViews(profile) {
  const views = Number(profile.views || 0) + 1;
  profile.views = views;
  profile.recentVisitors = [
    { label: "Anonymous visitor", viewedAt: new Date().toISOString() },
    ...(Array.isArray(profile.recentVisitors) ? profile.recentVisitors : []),
  ].slice(0, 8);
  await saveProfile(profile);
}

async function findUserByEmail(email) {
  if (hasSupabase) {
    const rows = await supabaseRequest("app_users", {
      query: `?email=eq.${encodeURIComponent(email)}&select=*&limit=1`,
    });
    const user = rows[0];
    return user
      ? [
          user.id,
          {
            email: user.email,
            passwordHash: user.password_hash,
            createdAt: user.created_at,
            profileHandle: user.profile_handle,
            profilePath: user.profile_path,
            profileUrl: user.profile_url,
            role: user.role || "user",
            accountStatus: sanitizeAccountStatus(user.account_status),
            accountStatusUpdatedAt: user.account_status_updated_at || "",
            onboardingCompleted: Boolean(user.onboarding_completed),
            onboardingSkipped: Boolean(user.onboarding_skipped),
            onboardingUpdatedAt: user.onboarding_updated_at,
            dashboardSettings: sanitizeDashboardSettings(user.dashboard_settings),
          },
        ]
      : null;
  }

  return Object.entries(readUsersFile().users).find(([, user]) => user.email === email) || null;
}

async function createUser(email, passwordHash) {
  const userId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  if (hasSupabase) {
    await supabaseRequest("app_users", {
      method: "POST",
      body: {
        id: userId,
        email,
        password_hash: passwordHash,
        account_status: "active",
        dashboard_settings: defaultDashboardSettings(),
        created_at: createdAt,
      },
      prefer: "return=representation",
    });
    return userId;
  }

  const store = readUsersFile();
  store.users[userId] = {
    email,
    passwordHash,
    role: "user",
    accountStatus: "active",
    accountStatusUpdatedAt: "",
    createdAt,
    onboardingCompleted: false,
    onboardingSkipped: false,
    onboardingUpdatedAt: "",
    dashboardSettings: defaultDashboardSettings(),
  };
  writeUsersFile(store);
  return userId;
}

async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const createdAt = new Date().toISOString();

  if (hasSupabase) {
    await supabaseRequest("app_sessions", {
      method: "POST",
      body: {
        token,
        user_id: userId,
        created_at: createdAt,
      },
      prefer: "return=representation",
    });
    return token;
  }

  const store = readUsersFile();
  store.sessions[token] = { userId, createdAt };
  writeUsersFile(store);
  return token;
}

function isSessionExpired(session) {
  const created = Date.parse(session?.createdAt || session?.created_at || "");
  return Number.isFinite(created) && Date.now() - created > sessionTtlMs;
}

async function deleteSessionToken(token) {
  if (!token) return;
  if (hasSupabase) {
    await supabaseRequest("app_sessions", {
      method: "DELETE",
      query: `?token=eq.${encodeURIComponent(token)}`,
      prefer: "return=minimal",
    });
    return;
  }

  const store = readUsersFile();
  if (store.sessions[token]) {
    delete store.sessions[token];
    writeUsersFile(store);
  }
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(String(token || "")).digest("hex");
}

function getRequestIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "")
    .split(",")[0]
    .trim();
}

function shouldThrottleForgotPassword(req, email) {
  const key = `${getRequestIp(req)}:${email || "unknown"}`;
  const now = Date.now();
  const lastAttempt = forgotPasswordAttempts.get(key) || 0;
  forgotPasswordAttempts.set(key, now);
  return now - lastAttempt < forgotPasswordCooldownMs;
}

function cleanupForgotPasswordAttempts() {
  const cutoff = Date.now() - 5 * forgotPasswordCooldownMs;
  for (const [key, timestamp] of forgotPasswordAttempts) {
    if (timestamp < cutoff) forgotPasswordAttempts.delete(key);
  }
}

function maskEmail(email) {
  const [name = "", domain = ""] = String(email || "").split("@");
  if (!domain) return "invalid-email";
  const visibleName = name.length <= 2 ? `${name.slice(0, 1)}*` : `${name.slice(0, 2)}***`;
  return `${visibleName}@${domain}`;
}

function isLocalResetLink(resetLink) {
  try {
    const { hostname } = new URL(resetLink);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function passwordResetEmailContent(resetLink) {
  const safeResetLink = escapeHtml(resetLink);
  return {
    subject: "Reset your slapz.lol password",
    text: [
      "Reset your slapz.lol password",
      "",
      "Use this link to choose a new password. It expires in 30 minutes and can only be used once:",
      resetLink,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family:Inter,Arial,sans-serif;background:#050508;color:#f5f7fb;padding:24px;border-radius:8px">
        <h1 style="margin:0 0 12px;font-size:28px">Reset your slapz.lol password</h1>
        <p style="color:#b8bbc8;line-height:1.5">Use this link to choose a new password. It expires in 30 minutes and can only be used once.</p>
        <p><a href="${safeResetLink}" style="display:inline-block;padding:12px 16px;border-radius:8px;background:#f5f7fb;color:#050508;font-weight:800;text-decoration:none">Reset password</a></p>
        <p style="color:#8f95a8;font-size:13px;line-height:1.5">If you did not request this, you can ignore this email.</p>
      </div>
    `,
  };
}

function emailAddressFrom(value) {
  const text = String(value || "").trim();
  const match = text.match(/<([^>]+)>/);
  return match ? match[1].trim() : text;
}

async function sendWithResend(email, content) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: passwordResetEmailFrom,
      to: email,
      subject: content.subject,
      html: content.html,
      text: content.text,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Resend failed with ${response.status}`);
  }
}

async function sendWithSendGrid(email, content) {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sendgridApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }] }],
      from: { email: emailAddressFrom(passwordResetEmailFrom) },
      subject: content.subject,
      content: [
        { type: "text/plain", value: content.text },
        { type: "text/html", value: content.html },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `SendGrid failed with ${response.status}`);
  }
}

async function createPasswordResetToken(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashResetToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + passwordResetTtlMs).toISOString();
  const createdAt = now.toISOString();

  if (hasSupabase) {
    try {
      await supabaseRequest("app_password_resets", {
        method: "PATCH",
        query: `?user_id=eq.${encodeURIComponent(userId)}&used_at=is.null`,
        body: { used_at: createdAt },
        prefer: "return=minimal",
      });
      await supabaseRequest("app_password_resets", {
        method: "POST",
        body: {
          id: crypto.randomUUID(),
          user_id: userId,
          token_hash: tokenHash,
          expires_at: expiresAt,
          created_at: createdAt,
        },
        prefer: "return=minimal",
      });
    } catch (error) {
      console.warn("Could not create Supabase reset token. Run the latest supabase-schema.sql.", error.message);
      throw new Error("Password reset is not configured yet.");
    }
    return token;
  }

  const store = readUsersFile();
  for (const reset of Object.values(store.passwordResets)) {
    if (reset.userId === userId && !reset.usedAt) reset.usedAt = createdAt;
  }
  store.passwordResets[tokenHash] = {
    userId,
    tokenHash,
    createdAt,
    expiresAt,
    usedAt: "",
  };
  writeUsersFile(store);
  return token;
}

async function findPasswordResetByToken(token) {
  const tokenHash = hashResetToken(token);
  const now = Date.now();

  if (hasSupabase) {
    const rows = await supabaseRequest("app_password_resets", {
      query: `?token_hash=eq.${encodeURIComponent(tokenHash)}&select=*&limit=1`,
    });
    const reset = rows[0];
    if (!reset || reset.used_at || new Date(reset.expires_at).getTime() <= now) return null;
    return {
      id: reset.id,
      tokenHash,
      userId: reset.user_id,
    };
  }

  const reset = readUsersFile().passwordResets[tokenHash];
  if (!reset || reset.usedAt || new Date(reset.expiresAt).getTime() <= now) return null;
  return reset;
}

async function markPasswordResetUsed(reset) {
  const usedAt = new Date().toISOString();
  if (hasSupabase) {
    await supabaseRequest("app_password_resets", {
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(reset.id)}`,
      body: { used_at: usedAt },
      prefer: "return=minimal",
    });
    return;
  }

  const store = readUsersFile();
  if (store.passwordResets[reset.tokenHash]) {
    store.passwordResets[reset.tokenHash].usedAt = usedAt;
    writeUsersFile(store);
  }
}

async function updateUserPassword(userId, passwordHash) {
  if (hasSupabase) {
    await supabaseRequest("app_users", {
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(userId)}`,
      body: { password_hash: passwordHash },
      prefer: "return=minimal",
    });
    return;
  }

  const store = readUsersFile();
  if (!store.users[userId]) throw new Error("User not found");
  store.users[userId].passwordHash = passwordHash;
  writeUsersFile(store);
}

async function invalidateUserSessions(userId) {
  if (hasSupabase) {
    await supabaseRequest("app_sessions", {
      method: "DELETE",
      query: `?user_id=eq.${encodeURIComponent(userId)}`,
      prefer: "return=minimal",
    });
    return;
  }

  const store = readUsersFile();
  for (const [token, session] of Object.entries(store.sessions)) {
    if (session.userId === userId) delete store.sessions[token];
  }
  writeUsersFile(store);
}

// Password reset delivery:
// - Uses RESEND_API_KEY or SENDGRID_API_KEY plus PASSWORD_RESET_FROM/EMAIL_FROM when configured.
// - Logs the one-time reset link only for localhost development fallback.
// - Never returns reset tokens from API responses, especially in production.
async function sendPasswordResetLink(email, resetLink) {
  const content = passwordResetEmailContent(resetLink);

  if (resendApiKey && passwordResetEmailFrom) {
    await sendWithResend(email, content);
    console.info(`[password reset] email sent with Resend to ${maskEmail(email)}`);
    return true;
  }

  if (sendgridApiKey && passwordResetEmailFrom) {
    await sendWithSendGrid(email, content);
    console.info(`[password reset] email sent with SendGrid to ${maskEmail(email)}`);
    return true;
  }

  if ((resendApiKey || sendgridApiKey) && !passwordResetEmailFrom) {
    console.warn("[password reset] email provider key exists, but PASSWORD_RESET_FROM or EMAIL_FROM is missing.");
  }

  if (isLocalResetLink(resetLink)) {
    console.log(`[dev password reset] ${email}: ${resetLink}`);
    return true;
  }

  console.warn(
    "[password reset] email provider missing. Configure RESEND_API_KEY or SENDGRID_API_KEY plus PASSWORD_RESET_FROM/EMAIL_FROM."
  );
  return false;
}

async function getAuthedUser(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return null;

  if (hasSupabase) {
    const sessions = await supabaseRequest("app_sessions", {
      query: `?token=eq.${encodeURIComponent(token)}&select=*&limit=1`,
    });
    const session = sessions[0];
    if (!session) return null;
    if (isSessionExpired(session)) {
      await deleteSessionToken(token);
      return null;
    }

    const users = await supabaseRequest("app_users", {
      query: `?id=eq.${encodeURIComponent(session.user_id)}&select=*&limit=1`,
    });
    const user = users[0];
    if (!user) return null;
    const accountStatus = sanitizeAccountStatus(user.account_status);
    if (isRestrictedAccountStatus(accountStatus)) {
      await deleteSessionToken(token);
      return null;
    }
    return {
      token,
      userId: user.id,
      email: user.email,
      createdAt: user.created_at,
      profileHandle: user.profile_handle,
      profilePath: user.profile_path,
      profileUrl: user.profile_url,
      role: user.role || "user",
      accountStatus,
      accountStatusUpdatedAt: user.account_status_updated_at || "",
      onboardingCompleted: Boolean(user.onboarding_completed),
      onboardingSkipped: Boolean(user.onboarding_skipped),
      onboardingUpdatedAt: user.onboarding_updated_at,
      dashboardSettings: sanitizeDashboardSettings(user.dashboard_settings),
    };
  }

  const store = readUsersFile();
  const session = store.sessions[token];
  if (!session) return null;
  if (isSessionExpired(session)) {
    delete store.sessions[token];
    writeUsersFile(store);
    return null;
  }

  const user = store.users[session.userId];
  if (!user) return null;
  const accountStatus = sanitizeAccountStatus(user.accountStatus);
  if (isRestrictedAccountStatus(accountStatus)) {
    delete store.sessions[token];
    writeUsersFile(store);
    return null;
  }
  return {
    token,
    userId: session.userId,
    email: user.email,
    createdAt: user.createdAt,
    profileHandle: user.profileHandle,
    profilePath: user.profilePath,
    profileUrl: user.profileUrl,
    role: user.role || "user",
    accountStatus,
    accountStatusUpdatedAt: user.accountStatusUpdatedAt || "",
    onboardingCompleted: Boolean(user.onboardingCompleted),
    onboardingSkipped: Boolean(user.onboardingSkipped),
    onboardingUpdatedAt: user.onboardingUpdatedAt || "",
    dashboardSettings: sanitizeDashboardSettings(user.dashboardSettings),
  };
}

function cleanEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash || "").split(":");
  if (!salt || !hash) return false;
  const testHash = hashPassword(password, salt).split(":")[1];
  if (hash.length !== testHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(testHash, "hex"));
}

function sanitizeHandle(handle) {
  return String(handle || "")
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 24);
}

function sendJson(res, status, payload) {
  if (!res.hasHeader("Cache-Control")) res.setHeader("Cache-Control", "no-store");
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function safeRequestHost(req) {
  const host = String(req.headers.host || "").trim();
  if (/^(localhost|127\.0\.0\.1)(:\d{1,5})?$/i.test(host)) return host;
  if (/^[a-z0-9.-]+(:\d{1,5})?$/i.test(host)) return host;
  return `localhost:${port}`;
}

function siteOrigin(req) {
  if (configuredSiteOrigin) return configuredSiteOrigin;
  const host = safeRequestHost(req);
  if (!host.includes("localhost") && !host.startsWith("127.")) {
    const hostname = host.split(":")[0].toLowerCase();
    if (!allowedSiteHosts.has(hostname)) return "https://slapz.lol";
  }
  const protocol = host.includes("localhost") || host.startsWith("127.") ? "http" : req.headers["x-forwarded-proto"] || "https";
  return `${protocol}://${host}`;
}

function absoluteUrl(req, value = "/") {
  const raw = String(value || "/");
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${siteOrigin(req)}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

function escapeXml(value) {
  return escapeHtml(value);
}

function plainText(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateSeoText(value, max = 155) {
  const text = plainText(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}...`;
}

function structuredDataScript(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function defaultStructuredData(req) {
  const origin = siteOrigin(req);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "slapz.lol",
        url: origin,
        description: defaultSeoDescription,
        applicationCategory: "SocialNetworkingApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "Organization",
        name: "slapz.lol",
        url: origin,
        logo: absoluteUrl(req, "/assets/slapz-mark.svg"),
        sameAs: [],
      },
    ],
  };
}

function replaceHeadTag(html, pattern, tag) {
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function applySeoMeta(html, req, meta = {}) {
  const title = truncateSeoText(meta.title || defaultSeoTitle, 90);
  const description = truncateSeoText(meta.description || defaultSeoDescription, 180);
  const canonical = absoluteUrl(req, meta.canonical || "/");
  const robots = meta.robots || "index,follow";
  const ogType = meta.ogType || "website";
  const ogImage = absoluteUrl(req, meta.ogImage || defaultOgImagePath);
  const structuredData = meta.structuredData || defaultStructuredData(req);

  html = replaceHeadTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = replaceHeadTag(
    html,
    /<meta\s+name=["']description["'][\s\S]*?>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );
  html = replaceHeadTag(html, /<meta\s+name=["']robots["'][\s\S]*?>/i, `<meta name="robots" content="${escapeHtml(robots)}" />`);
  html = replaceHeadTag(html, /<link\s+rel=["']canonical["'][\s\S]*?>/i, `<link rel="canonical" href="${escapeHtml(canonical)}" />`);
  html = replaceHeadTag(html, /<meta\s+property=["']og:site_name["'][\s\S]*?>/i, `<meta property="og:site_name" content="slapz.lol" />`);
  html = replaceHeadTag(html, /<meta\s+property=["']og:type["'][\s\S]*?>/i, `<meta property="og:type" content="${escapeHtml(ogType)}" />`);
  html = replaceHeadTag(html, /<meta\s+property=["']og:title["'][\s\S]*?>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  html = replaceHeadTag(
    html,
    /<meta\s+property=["']og:description["'][\s\S]*?>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  html = replaceHeadTag(html, /<meta\s+property=["']og:url["'][\s\S]*?>/i, `<meta property="og:url" content="${escapeHtml(canonical)}" />`);
  html = replaceHeadTag(html, /<meta\s+property=["']og:image["'][\s\S]*?>/i, `<meta property="og:image" content="${escapeHtml(ogImage)}" />`);
  html = replaceHeadTag(html, /<meta\s+name=["']twitter:card["'][\s\S]*?>/i, `<meta name="twitter:card" content="summary_large_image" />`);
  html = replaceHeadTag(html, /<meta\s+name=["']twitter:title["'][\s\S]*?>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
  html = replaceHeadTag(
    html,
    /<meta\s+name=["']twitter:description["'][\s\S]*?>/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );
  html = replaceHeadTag(html, /<meta\s+name=["']twitter:image["'][\s\S]*?>/i, `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`);
  html = replaceHeadTag(
    html,
    /<script\s+type=["']application\/ld\+json["']\s+id=["']structuredData["'][\s\S]*?<\/script>/i,
    `<script type="application/ld+json" id="structuredData">${structuredDataScript(structuredData)}</script>`
  );

  return html;
}

function sendIndexPage(req, res, meta = {}) {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  sendText(res, 200, "text/html; charset=utf-8", applySeoMeta(html, req, meta));
}

function renderSeoPage(req, res, pagePath) {
  const page = seoPageDefinitions[pagePath];
  const origin = siteOrigin(req);
  const pageLinks = ["/", ...seoPagePaths].map((href) => {
    const label = href === "/" ? "Home" : seoPageDefinitions[href].kicker;
    return `<a href="${href}">${escapeHtml(label)}</a>`;
  });
  const relatedLinks = (page.related || [])
    .map((href) => `<a href="${href}">${escapeHtml(seoPageDefinitions[href]?.kicker || href)}</a>`)
    .join("");
  const sections = page.sections
    .map(
      ([heading, body]) => `
        <article class="seo-card glass">
          <h2>${escapeHtml(heading)}</h2>
          <p>${escapeHtml(body)}</p>
        </article>`
    )
    .join("");
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${escapeHtml(`${origin}${pagePath}`)}" />
    <meta property="og:site_name" content="slapz.lol" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:url" content="${escapeHtml(`${origin}${pagePath}`)}" />
    <meta property="og:image" content="${escapeHtml(absoluteUrl(req, defaultOgImagePath))}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(page.title)}" />
    <meta name="twitter:description" content="${escapeHtml(page.description)}" />
    <meta name="twitter:image" content="${escapeHtml(absoluteUrl(req, defaultOgImagePath))}" />
    <link rel="icon" type="image/svg+xml" href="/assets/slapz-mark.svg" />
    <link rel="stylesheet" href="/styles.css" />
    <script type="application/ld+json" id="structuredData">${structuredDataScript(defaultStructuredData(req))}</script>
  </head>
  <body class="seo-page-body" data-theme="black">
    <div class="background-image" aria-hidden="true"></div>
    <div class="backdrop-shade" aria-hidden="true"></div>
    <main class="seo-page">
      <nav class="seo-nav glass" aria-label="Public pages">
        <a class="seo-brand" href="/">slapz.lol</a>
        <div>${pageLinks.join("")}</div>
      </nav>
      <section class="seo-hero glass">
        <p class="landing-kicker">${escapeHtml(page.kicker)}</p>
        <h1>${escapeHtml(page.h1)}</h1>
        <p>${escapeHtml(page.intro)}</p>
        <div class="seo-hero-actions">
          <a class="save-button" href="/">Create your profile</a>
          <a class="preview-button" href="/features">Explore features</a>
        </div>
      </section>
      <section class="seo-card-grid" aria-label="${escapeHtml(page.kicker)} details">${sections}</section>
      <section class="seo-related glass" aria-label="Related pages">
        <h2>Keep exploring slapz.lol</h2>
        <div>${relatedLinks || pageLinks.join("")}</div>
      </section>
    </main>
  </body>
</html>`;
  sendText(res, 200, "text/html; charset=utf-8", html);
}

async function profileSeoMeta(req, handle) {
  const canonical = absoluteUrl(req, `/u/${handle}`);
  const profile = await getProfile(handle);
  if (!profile) {
    return {
      title: "Profile not found | slapz.lol",
      description: "This slapz.lol profile could not be found.",
      canonical,
      robots: "noindex,nofollow",
      ogType: "website",
    };
  }

  const privacy = sanitizeProfilePrivacy(profile.profilePrivacy);
  const access = await canViewProfile(profile, req);
  if (privacy !== "public" || !access.allowed) {
    return {
      title: "Private profile | slapz.lol",
      description: "This slapz.lol profile is private.",
      canonical,
      robots: "noindex,nofollow",
      ogType: "website",
    };
  }

  const publicProfile = publicProfilePayload(profile);
  const displayName = sanitizeShortText(publicProfile.name || publicProfile.displayName || `@${handle}`, 60);
  const bio = truncateSeoText(publicProfile.bio || `${displayName} is building a custom Gen Z bio profile on slapz.lol.`, 150);
  const description = bio || `View ${displayName}'s custom slapz.lol profile with music, themes, Slappers, Tribes and games.`;
  const hasAvatar = Boolean(publicProfile.avatarPath || publicProfile.avatarData);
  return {
    title: `${displayName} (@${handle}) on slapz.lol`,
    description,
    canonical,
    robots: "index,follow",
    ogType: "profile",
    ogImage: hasAvatar ? `/api/profiles/${handle}/avatar` : defaultOgImagePath,
  };
}

function sendText(res, status, contentType, text) {
  if (!res.hasHeader("Cache-Control") && status >= 400) res.setHeader("Cache-Control", "no-store");
  res.writeHead(status, { "Content-Type": contentType });
  res.end(text);
}

function parseDataUrl(dataUrl) {
  const match = String(dataUrl || "").match(/^data:([^;,]+);base64,(.*)$/);
  if (!match) return null;
  return {
    mime: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

async function sendProfileMedia(req, res, profile, mediaType) {
  const fieldMap = {
    music: { data: "musicData", path: "musicPath", fallbackMime: "audio/mpeg", field: "music" },
    avatar: { data: "avatarData", path: "avatarPath", fallbackMime: "image/jpeg", field: "avatar" },
    background: { data: "backgroundData", path: "backgroundPath", fallbackMime: "image/jpeg", field: "background" },
  };
  const fields = fieldMap[mediaType];
  if (!profile || !fields) {
    sendJson(res, 404, { error: "Media not found" });
    return;
  }

  const access = await canViewProfile(profile, req);
  if (!access.allowed) {
    sendJson(res, 403, { error: "This profile is private." });
    return;
  }
  const cacheControl = access.privacy === "public" ? "public, max-age=300" : "no-store";

  if (hasSupabase && profile[fields.path]) {
    const response = await supabaseStorageRequest(`/object/${mediaBucket}/${profile[fields.path]}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    res.writeHead(200, {
      "Content-Type": safeMediaMime(fields.field, response.headers.get("content-type"), fields.fallbackMime),
      "Content-Length": buffer.length,
      "Cache-Control": cacheControl,
    });
    res.end(buffer);
    return;
  }

  const media = parseDataUrl(profile[fields.data]);
  if (!media) {
    sendJson(res, 404, { error: "Media not found" });
    return;
  }

  res.writeHead(200, {
    "Content-Type": safeMediaMime(fields.field, media.mime, fields.fallbackMime),
    "Content-Length": media.buffer.length,
    "Cache-Control": cacheControl,
  });
  res.end(media.buffer);
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(content);
  });
}

const publicStaticFiles = new Set(["index.html", "styles.css", "script.js", "words-5.txt", "google8bc067013314ffaf.html"]);

function isPublicStaticPath(safePath) {
  const normalized = String(safePath || "").replace(/\\/g, "/");
  if (!normalized || normalized.includes("\0")) return false;
  if (normalized.startsWith(".") || normalized.includes("/.")) return false;
  if (normalized.startsWith("assets/")) return true;
  if (/^google[a-z0-9]+\.html$/i.test(normalized)) return true;
  return publicStaticFiles.has(normalized);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 25 * 1024 * 1024) {
        reject(new Error("Profile is too large. Use smaller media files for this demo."));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  setSecurityHeaders(req, res);
  cleanupRateLimits();

  if (url.pathname.startsWith("/api/admin") || url.pathname.startsWith("/api/me") || url.pathname === "/api/my-profile") {
    setNoStore(res);
  }

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (url.pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(req.method) && !isTrustedOrigin(req)) {
    logSecurity("cross_origin_api_blocked", req, { origin: req.headers.origin, path: url.pathname });
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/signup") {
    try {
      if (rateLimit(req, res, "signup", rateLimits.auth)) return;
      const body = JSON.parse((await readBody(req)) || "{}");
      const email = cleanEmail(body.email);
      const password = String(body.password || "");
      if (!email.includes("@") || password.length < 6) {
        sendJson(res, 400, { error: "Enter a valid email and a password with at least 6 characters" });
        return;
      }

      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        sendJson(res, 409, { error: "That email already has an account. Use Log in instead." });
        return;
      }

      const userId = await createUser(email, hashPassword(password));
      const token = await createSession(userId);
      sendJson(res, 201, { token, email });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/login") {
    try {
      if (rateLimit(req, res, "login", rateLimits.auth)) return;
      const body = JSON.parse((await readBody(req)) || "{}");
      const email = cleanEmail(body.email);
      const password = String(body.password || "");
      const entry = await findUserByEmail(email);
      if (!entry || !verifyPassword(password, entry[1].passwordHash)) {
        logSecurity("login_failed", req, { email: maskEmail(email) });
        sendJson(res, 401, { error: "Email or password is incorrect" });
        return;
      }

      const accountStatus = sanitizeAccountStatus(entry[1].accountStatus);
      if (isRestrictedAccountStatus(accountStatus)) {
        logSecurity("restricted_login_blocked", req, { email: maskEmail(email), accountStatus });
        sendJson(res, 403, { error: accountAccessError(accountStatus) });
        return;
      }

      const token = await createSession(entry[0]);
      sendJson(res, 200, { token, email });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/forgot-password") {
    try {
      if (rateLimit(req, res, "forgot_password", rateLimits.forgotPassword)) return;
      cleanupForgotPasswordAttempts();
      const body = JSON.parse((await readBody(req)) || "{}");
      const email = cleanEmail(body.email);
      const maskedEmail = maskEmail(email);
      const isValidEmail = email.includes("@");

      if (!email || !isValidEmail) {
        console.info(`[password reset] ignored invalid email request: ${maskedEmail}`);
      } else if (shouldThrottleForgotPassword(req, email)) {
        console.info(`[password reset] cooldown active for ${maskedEmail}`);
      } else {
        const entry = await findUserByEmail(email);
        if (entry) {
          console.info(`[password reset] account found for ${maskedEmail}; generating reset token`);
          const token = await createPasswordResetToken(entry[0]);
          const resetLink = `${siteOrigin(req)}/reset-password?token=${encodeURIComponent(token)}`;
          console.info(`[password reset] reset token stored for ${maskedEmail}; sending reset link`);
          await sendPasswordResetLink(entry[1].email, resetLink);
        } else {
          console.info(`[password reset] no account found for ${maskedEmail}; generic response returned`);
        }
      }
      sendJson(res, 200, { message: resetPasswordSuccessMessage });
    } catch (error) {
      console.warn("Forgot password request failed:", error.message);
      sendJson(res, 200, { message: resetPasswordSuccessMessage });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/reset-password") {
    try {
      if (rateLimit(req, res, "reset_password", rateLimits.resetPassword)) return;
      const body = JSON.parse((await readBody(req)) || "{}");
      const token = String(body.token || "").trim();
      const newPassword = String(body.newPassword || "");

      if (!token || newPassword.length < 6) {
        sendJson(res, 400, { error: "Use a valid reset link and a password with at least 6 characters." });
        return;
      }

      const reset = await findPasswordResetByToken(token);
      if (!reset) {
        logSecurity("invalid_reset_token", req);
        sendJson(res, 400, { error: "This reset link is invalid or expired. Request a new one." });
        return;
      }

      await updateUserPassword(reset.userId, hashPassword(newPassword));
      await invalidateUserSessions(reset.userId);
      await markPasswordResetUsed(reset);
      sendJson(res, 200, { message: "Password reset. You can log in with your new password." });
    } catch (error) {
      console.warn("Reset password request failed:", error.message);
      sendJson(res, 400, { error: "Could not reset password. Request a new reset link and try again." });
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/me") {
    const authed = await getAuthedUser(req);
    if (!authed) {
      sendJson(res, 401, { error: "Not signed in" });
      return;
    }
    const profileForOnboarding = authed.profileHandle ? null : await getProfileByOwner(authed.userId);
    const onboarding = onboardingStateForUser(authed, profileForOnboarding);
    sendJson(res, 200, {
      email: authed.email,
      userId: authed.userId,
      createdAt: authed.createdAt,
      profileHandle: authed.profileHandle || profileForOnboarding?.handle || "",
      profilePath: authed.profilePath || (profileForOnboarding?.handle ? `/u/${profileForOnboarding.handle}` : ""),
      profileUrl: authed.profileUrl,
      isOwner: isOwnerUser(authed),
      dashboardSettings: sanitizeDashboardSettings(authed.dashboardSettings),
      ...onboarding,
    });
    return;
  }

  if (req.method === "PATCH" && url.pathname === "/api/me/settings") {
    try {
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before updating settings" });
        return;
      }

      const body = JSON.parse((await readBody(req)) || "{}");
      const dashboardSettings = await saveUserDashboardSettings(authed.userId, body.dashboardSettings || body);
      sendJson(res, 200, { dashboardSettings });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "PATCH" && url.pathname === "/api/me/onboarding") {
    try {
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before updating onboarding" });
        return;
      }

      const body = JSON.parse((await readBody(req)) || "{}");
      const action = String(body.action || "").trim().toLowerCase();
      const completed = action === "complete" || action === "completed" || body.onboardingCompleted === true;
      const skipped = action === "skip" || action === "skipped" || body.onboardingSkipped === true;
      if (!completed && !skipped) {
        sendJson(res, 400, { error: "Choose complete or skip" });
        return;
      }

      const onboarding = await saveUserOnboardingStatus(authed.userId, { completed, skipped });
      sendJson(res, 200, {
        ...onboarding,
        needsOnboarding: !onboarding.onboardingCompleted && !onboarding.onboardingSkipped,
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (url.pathname === "/api/admin/users" && req.method === "GET") {
    try {
      if (rateLimit(req, res, "admin", rateLimits.admin)) return;
      const owner = await requireOwner(req, res);
      if (!owner) return;
      sendJson(res, 200, { users: await listUsersForAdmin() });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (url.pathname.startsWith("/api/admin/users/")) {
    try {
      if (rateLimit(req, res, "admin", rateLimits.admin)) return;
      const owner = await requireOwner(req, res);
      if (!owner) return;

      const parts = url.pathname.split("/").map(decodeURIComponent);
      const targetUserId = String(parts[4] || "").trim();
      const action = String(parts[5] || "").trim();
      if (!targetUserId) {
        sendJson(res, 400, { error: "User id is required" });
        return;
      }

      if (req.method === "POST" && action === "friend") {
        const result = await adminAddFriend(owner, targetUserId);
        sendJson(res, 200, result);
        return;
      }

      if (req.method === "POST" && action === "notifications") {
        const body = JSON.parse((await readBody(req)) || "{}");
        const notice = await adminSendNotification(targetUserId, body.message);
        sendJson(res, 201, { notice });
        return;
      }

      if (req.method === "POST" && action === "status") {
        const body = JSON.parse((await readBody(req)) || "{}");
        const user = await updateUserAccountStatus(owner, targetUserId, body.status);
        sendJson(res, 200, { user });
        return;
      }

      if (req.method === "DELETE" && !action) {
        const deleted = await deleteUserAccount(targetUserId);
        sendJson(res, 200, { deletedUserId: deleted.userId });
        return;
      }

      sendJson(res, 404, { error: "Owner action was not found" });
    } catch (error) {
      const status = /not found/i.test(error.message) ? 404 : 400;
      sendJson(res, status, { error: error.message });
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/my-profile") {
    const authed = await getAuthedUser(req);
    if (!authed) {
      sendJson(res, 401, { error: "Not signed in" });
      return;
    }

    const profile = await getProfileByOwner(authed.userId);
    if (!profile) {
      sendJson(res, 404, { error: "No profile yet" });
      return;
    }

    const filteredProfile = await applyProfileBadgeRules(profile, authed);
    const { ownerToken, ownerUserId, ...safeProfile } = filteredProfile;
    safeProfile.unlockedBadges = await unlockedProfileBadges(filteredProfile, authed);
    sendJson(res, 200, safeProfile);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/users/search") {
    try {
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before searching users" });
        return;
      }
      const viewerProfile = await getProfileByOwner(authed.userId);
      if (!viewerProfile) {
        sendJson(res, 404, { error: "Publish your profile before searching users" });
        return;
      }
      const users = await publicUserSearch(viewerProfile, url.searchParams.get("q") || "", {
        suggestions: url.searchParams.get("mode") === "suggestions",
      });
      sendJson(res, 200, { users });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/games/snake-score") {
    const authed = await getAuthedUser(req);
    if (!authed) {
      sendJson(res, 401, { error: "Not signed in" });
      return;
    }

    const highScore = await getSnakeHighScore(authed.userId);
    sendJson(res, 200, { highScore });
    return;
  }

  if (req.method === "PUT" && url.pathname === "/api/games/snake-score") {
    try {
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Not signed in" });
        return;
      }

      const body = JSON.parse((await readBody(req)) || "{}");
      const highScore = await saveSnakeHighScore(authed.userId, body.score);
      sendJson(res, 200, { highScore });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/games/leaderboards") {
    try {
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before opening leaderboards" });
        return;
      }
      const viewerProfile = await getProfileByOwner(authed.userId);
      if (!viewerProfile) {
        sendJson(res, 404, { error: "Publish your profile before opening leaderboards" });
        return;
      }
      const scores = (await listUserScores()).filter((row) => row.handle);
      const friendHandles = profileFriendHandles(viewerProfile);
      const tribeId = String(url.searchParams.get("tribeId") || "");
      let tribeMemberIds = new Set();
      if (tribeId) {
        const found = await findTribeById(tribeId);
        if (found && canAccessTribe(found.tribe, authed.userId)) tribeMemberIds = new Set(found.tribe.memberIds);
      }
      const byScore = (rows) => rows.filter((row) => row.score > 0).sort((a, b) => b.score - a.score).slice(0, 8);
      sendJson(res, 200, {
        global: byScore(scores),
        friends: byScore(scores.filter((row) => friendHandles.has(row.handle) || row.userId === authed.userId)),
        tribe: byScore(scores.filter((row) => tribeMemberIds.has(row.userId))),
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/friend-requests") {
    try {
      if (rateLimit(req, res, "friend_requests", rateLimits.tribeAction)) return;
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before sending friend requests" });
        return;
      }

      const body = JSON.parse((await readBody(req)) || "{}");
      const targetHandle = handleFromFriendTarget(body.target || body.handle || body.targetName);
      if (!targetHandle) {
        sendJson(res, 400, { error: "Enter a valid profile handle or link" });
        return;
      }

      const senderProfile = await getProfileByOwner(authed.userId);
      if (!senderProfile?.handle) {
        sendJson(res, 400, { error: "Publish your profile before sending friend requests" });
        return;
      }

      if (senderProfile.handle === targetHandle) {
        sendJson(res, 400, { error: "You cannot send a friend request to yourself" });
        return;
      }

      const targetProfile = await getProfile(targetHandle);
      if (!targetProfile) {
        sendJson(res, 404, { error: "That profile was not found" });
        return;
      }

      const existingRequests = Array.isArray(targetProfile.friendRequests) ? targetProfile.friendRequests : [];
      let request = existingRequests.find((item) => item.fromHandle === senderProfile.handle);
      const alreadyRequested = Boolean(request);
      const alreadyFriends = (Array.isArray(targetProfile.friends) ? targetProfile.friends : []).some(
        (friend) => friend.handle === senderProfile.handle || friend.link === requestLinkFor(senderProfile.handle)
      );

      let senderChanged = false;
      if (alreadyFriends) {
        const sentRequests = Array.isArray(senderProfile.sentFriendRequests) ? senderProfile.sentFriendRequests : [];
        const nextSentRequests = sentRequests.filter((item) => item.targetHandle !== targetHandle);
        senderChanged = nextSentRequests.length !== sentRequests.length;
        senderProfile.sentFriendRequests = nextSentRequests;
      }

      if (!alreadyRequested && !alreadyFriends) {
        request = {
          id: crypto.randomUUID(),
          fromName: requestDisplayName(senderProfile),
          fromHandle: senderProfile.handle,
          fromLink: requestLinkFor(senderProfile.handle),
          createdAt: new Date().toISOString(),
        };
        targetProfile.friendRequests = [
          ...existingRequests,
          request,
        ].slice(-40);
        targetProfile.updatedAt = new Date().toISOString();
        await saveProfile(targetProfile);
      }

      if (!alreadyFriends && request) {
        const sentRequest = sentRequestFromTarget(targetProfile, request);
        const sentRequests = Array.isArray(senderProfile.sentFriendRequests) ? senderProfile.sentFriendRequests : [];
        const hasSentRequest = sentRequests.some((item) => item.targetHandle === targetHandle || item.id === request.id);
        if (!hasSentRequest && sentRequest) {
          senderProfile.sentFriendRequests = [...sentRequests, sentRequest].slice(-40);
          senderChanged = true;
        }
      }

      if (senderChanged) {
        senderProfile.updatedAt = new Date().toISOString();
        await saveProfile(senderProfile);
      }

      sendJson(res, 200, {
        targetHandle,
        status: alreadyFriends ? "friends" : "sent",
        sentFriendRequests: senderProfile.sentFriendRequests || [],
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/friend-requests/") && url.pathname.endsWith("/accept")) {
    try {
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before accepting friend requests" });
        return;
      }

      const requestId = decodeURIComponent(url.pathname.split("/")[3] || "");
      const ownerProfile = await getProfileByOwner(authed.userId);
      if (!ownerProfile) {
        sendJson(res, 404, { error: "Publish your profile before accepting requests" });
        return;
      }

      const requests = Array.isArray(ownerProfile.friendRequests) ? ownerProfile.friendRequests : [];
      const request = requests.find((item) => String(item.id) === requestId);
      if (!request) {
        sendJson(res, 404, { error: "Friend request was not found" });
        return;
      }

      ownerProfile.friends = mergeFriend(ownerProfile.friends, friendFromRequest(request));
      ownerProfile.friendRequests = requests.filter((item) => String(item.id) !== requestId);
      ownerProfile.updatedAt = new Date().toISOString();
      await saveProfile(ownerProfile);

      const senderHandle = sanitizeHandle(request.fromHandle);
      const senderProfile = senderHandle ? await getProfile(senderHandle) : null;
      if (senderProfile) {
        senderProfile.friends = mergeFriend(senderProfile.friends, ownFriendFromProfile(ownerProfile));
        senderProfile.sentFriendRequests = (Array.isArray(senderProfile.sentFriendRequests) ? senderProfile.sentFriendRequests : []).filter(
          (item) => item.id !== request.id && item.targetHandle !== ownerProfile.handle
        );
        senderProfile.updatedAt = new Date().toISOString();
        await saveProfile(senderProfile);
      }

      sendJson(res, 200, {
        friends: ownerProfile.friends || [],
        friendRequests: ownerProfile.friendRequests || [],
        sentFriendRequests: ownerProfile.sentFriendRequests || [],
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/friends/")) {
    try {
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before removing friends" });
        return;
      }

      const friendKey = decodeURIComponent(url.pathname.split("/")[3] || "");
      const ownerProfile = await getProfileByOwner(authed.userId);
      if (!ownerProfile) {
        sendJson(res, 404, { error: "Publish your profile before removing friends" });
        return;
      }

      const currentFriends = Array.isArray(ownerProfile.friends) ? ownerProfile.friends : [];
      const removedFriend = currentFriends.find((friend) => friendMatchesKey(friend, friendKey));
      if (!removedFriend) {
        sendJson(res, 404, { error: "Friend was not found" });
        return;
      }

      ownerProfile.friends = currentFriends.filter((friend) => !friendMatchesKey(friend, friendKey));
      ownerProfile.updatedAt = new Date().toISOString();
      await saveProfile(ownerProfile);

      const removedHandle = sanitizeHandle(removedFriend.handle) || handleFromFriendTarget(removedFriend.link);
      const otherProfile = removedHandle ? await getProfile(removedHandle) : null;
      if (otherProfile) {
        const ownerHandle = sanitizeHandle(ownerProfile.handle);
        otherProfile.friends = (Array.isArray(otherProfile.friends) ? otherProfile.friends : []).filter(
          (friend) => !friendMatchesKey(friend, ownerHandle)
        );
        otherProfile.updatedAt = new Date().toISOString();
        await saveProfile(otherProfile);
      }

      sendJson(res, 200, {
        friends: ownerProfile.friends || [],
        friendRequests: ownerProfile.friendRequests || [],
        sentFriendRequests: ownerProfile.sentFriendRequests || [],
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/tribes") {
    try {
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before viewing tribes" });
        return;
      }

      const viewerProfile = await getProfileByOwner(authed.userId);
      if (!viewerProfile) {
        sendJson(res, 404, { error: "Publish your profile before using tribes" });
        return;
      }

      const state = await tribeStateFor(viewerProfile);
      const search = String(url.searchParams.get("search") || "").trim().toLowerCase();
      sendJson(res, 200, {
        ...state,
        tribes: search ? state.tribes.filter((tribe) => tribe.name.toLowerCase().includes(search)) : state.tribes,
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/tribes") {
    try {
      if (rateLimit(req, res, "tribes", rateLimits.tribeAction)) return;
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before creating tribes" });
        return;
      }

      const body = JSON.parse((await readBody(req)) || "{}");
      const ownerProfile = await getProfileByOwner(authed.userId);
      if (!ownerProfile?.handle) {
        sendJson(res, 400, { error: "Publish your profile before creating tribes" });
        return;
      }

      const name = sanitizeTribeName(body.name);
      if (!name) {
        sendJson(res, 400, { error: "Enter a tribe name" });
        return;
      }

      const now = new Date().toISOString();
      const tribeId = crypto.randomUUID();
      const tribe = normalizeTribe(
        {
          tribeId,
          name,
          ownerId: authed.userId,
          ownerDisplayName: requestDisplayName(ownerProfile),
          ownerHandle: ownerProfile.handle,
          memberIds: [authed.userId],
          adminIds: [],
          pendingInviteIds: [],
          pendingJoinIds: [],
          themeColor: sanitizeThemeColor(body.themeColor),
          visibility: sanitizeTribeVisibility(body.visibility),
          icon: sanitizeTribeIcon(body.icon),
          bannerData: sanitizeImageDataUrl(body.bannerData, 1024 * 1024),
          announcement: sanitizeShortText(body.announcement, 140),
          createdAt: now,
          updatedAt: now,
        },
        ownerProfile
      );

      const friendHandles = profileFriendHandles(ownerProfile);
      const inviteHandles = [...new Set((Array.isArray(body.inviteHandles) ? body.inviteHandles : []).map(sanitizeHandle).filter(Boolean))]
        .filter((handle) => handle !== ownerProfile.handle && friendHandles.has(handle))
        .slice(0, 24);

      for (const inviteHandle of inviteHandles) {
        const targetProfile = await getProfile(inviteHandle);
        if (!targetProfile?.ownerUserId || tribe.memberIds.includes(targetProfile.ownerUserId)) continue;
        if (!tribe.pendingInviteIds.includes(targetProfile.ownerUserId)) tribe.pendingInviteIds.push(targetProfile.ownerUserId);

        const currentInvites = Array.isArray(targetProfile.tribeInvites) ? targetProfile.tribeInvites : [];
        const hasInvite = currentInvites.some((invite) => invite.tribeId === tribeId && invite.ownerId === authed.userId);
        if (hasInvite) continue;

        targetProfile.tribeInvites = [
          ...currentInvites,
          {
            id: crypto.randomUUID(),
            tribeId,
            tribeName: tribe.name,
            ownerId: authed.userId,
            ownerDisplayName: requestDisplayName(ownerProfile),
            ownerHandle: ownerProfile.handle,
            createdAt: now,
          },
        ].slice(-40);
        targetProfile.updatedAt = now;
        await saveProfile(targetProfile);
      }

      ownerProfile.tribes = [...normalizeTribesForProfile(ownerProfile), tribe].slice(-50);
      ownerProfile.updatedAt = now;
      await saveProfile(ownerProfile);

      sendJson(res, 201, await tribeStateFor(ownerProfile));
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if ((req.method === "GET" || req.method === "POST") && url.pathname.startsWith("/api/tribes/") && url.pathname.endsWith("/messages")) {
    try {
      if (req.method === "POST" && rateLimit(req, res, "tribe_chat", rateLimits.chatSend)) return;
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before opening tribe chats" });
        return;
      }

      const viewerProfile = await getProfileByOwner(authed.userId);
      if (!viewerProfile) {
        sendJson(res, 404, { error: "Publish your profile before opening tribe chats" });
        return;
      }

      const tribeId = decodeURIComponent(url.pathname.split("/")[3] || "");
      const found = await findTribeById(tribeId);
      if (!found) {
        sendJson(res, 404, { error: "Tribe was not found" });
        return;
      }

      const { ownerProfile, tribe, tribeIndex, tribes } = found;
      if (!canAccessTribe(tribe, authed.userId)) {
        sendJson(res, 403, { error: "Only tribe members can open this chat" });
        return;
      }

      if (req.method === "GET") {
        sendJson(res, 200, { messages: tribe.messages || [] });
        return;
      }

      const body = JSON.parse((await readBody(req)) || "{}");
      const text = sanitizeChatText(body.text);
      const attachment = sanitizeChatAttachment(body.attachment);
      if (!text && !attachment) {
        sendJson(res, 400, { error: "Write a message first" });
        return;
      }

      const now = new Date().toISOString();
      const message = {
        id: crypto.randomUUID(),
        senderId: authed.userId,
        senderDisplayName: requestDisplayName(viewerProfile),
        senderHandle: sanitizeHandle(viewerProfile.handle),
        text,
        attachment,
        reactions: {},
        pinned: false,
        createdAt: now,
      };

      tribe.messages = [...(Array.isArray(tribe.messages) ? tribe.messages : []), message].slice(-300);
      tribe.updatedAt = now;
      tribes[tribeIndex] = tribe;
      ownerProfile.tribes = tribes;
      ownerProfile.updatedAt = now;
      await saveProfile(ownerProfile);

      sendJson(res, 201, { messages: tribe.messages });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/tribes/") && url.pathname.includes("/messages/")) {
    try {
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before managing messages" });
        return;
      }

      const parts = url.pathname.split("/");
      const tribeId = decodeURIComponent(parts[3] || "");
      const messageId = decodeURIComponent(parts[5] || "");
      const action = parts[6] || "";
      const found = await findTribeById(tribeId);
      if (!found) {
        sendJson(res, 404, { error: "Tribe was not found" });
        return;
      }
      const { ownerProfile, tribe, tribeIndex, tribes } = found;
      if (!canAccessTribe(tribe, authed.userId)) {
        sendJson(res, 403, { error: "Only tribe members can use this chat" });
        return;
      }
      const messages = Array.isArray(tribe.messages) ? tribe.messages : [];
      const message = messages.find((item) => item.id === messageId);
      if (!message) {
        sendJson(res, 404, { error: "Message was not found" });
        return;
      }

      const body = JSON.parse((await readBody(req)) || "{}");
      if (action === "reactions") {
        const emoji = sanitizeShortText(body.emoji, 4);
        if (!emoji) {
          sendJson(res, 400, { error: "Choose a reaction" });
          return;
        }
        const current = new Set(Array.isArray(message.reactions?.[emoji]) ? message.reactions[emoji] : []);
        if (current.has(authed.userId)) current.delete(authed.userId);
        else current.add(authed.userId);
        message.reactions = { ...(message.reactions || {}), [emoji]: [...current] };
      } else if (action === "pin") {
        if (!canManageTribe(tribe, authed.userId)) {
          sendJson(res, 403, { error: "Only tribe managers can pin messages" });
          return;
        }
        message.pinned = Boolean(body.pinned);
      } else {
        sendJson(res, 404, { error: "Not found" });
        return;
      }

      tribe.messages = messages;
      tribe.updatedAt = new Date().toISOString();
      tribes[tribeIndex] = tribe;
      ownerProfile.tribes = tribes;
      ownerProfile.updatedAt = tribe.updatedAt;
      await saveProfile(ownerProfile);
      sendJson(res, 200, { messages: tribe.messages });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/tribe-invites/")) {
    try {
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before answering tribe invites" });
        return;
      }

      const parts = url.pathname.split("/");
      const inviteId = decodeURIComponent(parts[3] || "");
      const action = parts[4] || "";
      if (!["accept", "decline"].includes(action)) {
        sendJson(res, 404, { error: "Not found" });
        return;
      }

      const viewerProfile = await getProfileByOwner(authed.userId);
      if (!viewerProfile) {
        sendJson(res, 404, { error: "Publish your profile before answering tribe invites" });
        return;
      }

      const invites = Array.isArray(viewerProfile.tribeInvites) ? viewerProfile.tribeInvites : [];
      const invite = invites.find((item) => String(item.id) === inviteId);
      if (!invite) {
        sendJson(res, 404, { error: "Tribe invite was not found" });
        return;
      }

      const found = await findTribeById(invite.tribeId);
      if (found) {
        const { ownerProfile, tribe, tribeIndex, tribes } = found;
        tribe.pendingInviteIds = tribe.pendingInviteIds.filter((id) => id !== authed.userId);
        if (action === "accept" && !tribe.memberIds.includes(authed.userId)) {
          tribe.memberIds.push(authed.userId);
        }
        tribe.updatedAt = new Date().toISOString();
        tribes[tribeIndex] = tribe;
        ownerProfile.tribes = tribes;
        ownerProfile.updatedAt = tribe.updatedAt;
        await saveProfile(ownerProfile);
      }

      viewerProfile.tribeInvites = invites.filter((item) => String(item.id) !== inviteId);
      viewerProfile.updatedAt = new Date().toISOString();
      await saveProfile(viewerProfile);

      sendJson(res, 200, await tribeStateFor(viewerProfile));
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/tribes/") && url.pathname.endsWith("/join")) {
    try {
      if (rateLimit(req, res, "tribe_join", rateLimits.tribeAction)) return;
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before joining tribes" });
        return;
      }

      const requesterProfile = await getProfileByOwner(authed.userId);
      if (!requesterProfile?.handle) {
        sendJson(res, 400, { error: "Publish your profile before joining tribes" });
        return;
      }

      const tribeId = decodeURIComponent(url.pathname.split("/")[3] || "");
      const found = await findTribeById(tribeId);
      if (!found) {
        sendJson(res, 404, { error: "Tribe was not found" });
        return;
      }

      const { ownerProfile, tribe, tribeIndex, tribes } = found;
      if (tribe.ownerId === authed.userId || tribe.memberIds.includes(authed.userId)) {
        sendJson(res, 200, { ...(await tribeStateFor(requesterProfile)), status: "joined" });
        return;
      }
      if (tribe.visibility !== "public") {
        sendJson(res, 403, { error: "This tribe is invite-only or private" });
        return;
      }

      if (!tribe.pendingJoinIds.includes(authed.userId)) {
        tribe.pendingJoinIds.push(authed.userId);
        tribe.updatedAt = new Date().toISOString();
        tribes[tribeIndex] = tribe;
        ownerProfile.tribes = tribes;

        const currentRequests = Array.isArray(ownerProfile.tribeJoinRequests) ? ownerProfile.tribeJoinRequests : [];
        const hasRequest = currentRequests.some((request) => request.tribeId === tribe.tribeId && request.requesterId === authed.userId);
        if (!hasRequest) {
          ownerProfile.tribeJoinRequests = [
            ...currentRequests,
            {
              id: crypto.randomUUID(),
              tribeId: tribe.tribeId,
              tribeName: tribe.name,
              requesterId: authed.userId,
              requesterDisplayName: requestDisplayName(requesterProfile),
              requesterHandle: requesterProfile.handle,
              createdAt: tribe.updatedAt,
            },
          ].slice(-40);
        }
        ownerProfile.updatedAt = tribe.updatedAt;
        await saveProfile(ownerProfile);
      }

      sendJson(res, 200, { ...(await tribeStateFor(requesterProfile)), status: "requested" });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/tribes/") && url.pathname.endsWith("/members")) {
    try {
      if (rateLimit(req, res, "tribe_members", rateLimits.tribeAction)) return;
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before adding tribe members" });
        return;
      }

      const tribeId = decodeURIComponent(url.pathname.split("/")[3] || "");
      const body = JSON.parse((await readBody(req)) || "{}");
      const requestedIds = cleanIdList(body.memberIds || body.userIds);
      const requestedHandles = [
        ...new Set(cleanIdList(body.friendHandles || body.handles).map(sanitizeHandle).filter(Boolean)),
      ];
      if (!requestedIds.length && !requestedHandles.length) {
        sendJson(res, 400, { error: "Select at least one friend to add" });
        return;
      }

      const found = await findTribeById(tribeId);
      if (!found) {
        sendJson(res, 404, { error: "Tribe was not found" });
        return;
      }

      const { ownerProfile, tribe, tribeIndex, tribes } = found;
      if (!canManageTribe(tribe, authed.userId)) {
        sendJson(res, 403, { error: "Only tribe managers can add members directly" });
        return;
      }

      const managerProfile = await getProfileByOwner(authed.userId);
      const friendHandles = profileFriendHandles(managerProfile);
      const profiles = await listProfiles();
      const profilesById = new Map(profiles.map((profile) => [String(profile.ownerUserId || ""), profile]));
      const profilesByHandle = new Map(profiles.map((profile) => [sanitizeHandle(profile.handle), profile]));
      const addedIds = [];

      const tryAddProfile = (profile) => {
        const memberId = String(profile?.ownerUserId || "");
        const handle = sanitizeHandle(profile?.handle);
        if (!memberId || memberId === authed.userId || !handle || !friendHandles.has(handle)) return;
        if (tribe.memberIds.includes(memberId) || addedIds.includes(memberId)) return;
        addedIds.push(memberId);
      };

      requestedHandles.forEach((handle) => tryAddProfile(profilesByHandle.get(handle)));
      requestedIds.forEach((memberId) => tryAddProfile(profilesById.get(String(memberId))));

      if (addedIds.length) {
        const now = new Date().toISOString();
        tribe.memberIds = cleanIdList([...tribe.memberIds, ...addedIds]);
        tribe.pendingInviteIds = tribe.pendingInviteIds.filter((id) => !addedIds.includes(id));
        tribe.pendingJoinIds = tribe.pendingJoinIds.filter((id) => !addedIds.includes(id));
        tribe.updatedAt = now;
        tribes[tribeIndex] = tribe;
        ownerProfile.tribes = tribes;
        ownerProfile.tribeJoinRequests = (Array.isArray(ownerProfile.tribeJoinRequests) ? ownerProfile.tribeJoinRequests : []).filter(
          (request) => request.tribeId !== tribe.tribeId || !addedIds.includes(request.requesterId)
        );
        ownerProfile.updatedAt = now;
        await saveProfile(ownerProfile);

        for (const memberId of addedIds) {
          const targetProfile = profilesById.get(memberId);
          if (!targetProfile) continue;
          const invites = Array.isArray(targetProfile.tribeInvites) ? targetProfile.tribeInvites : [];
          const nextInvites = invites.filter((invite) => invite.tribeId !== tribe.tribeId);
          if (nextInvites.length !== invites.length) {
            targetProfile.tribeInvites = nextInvites;
            targetProfile.updatedAt = now;
            await saveProfile(targetProfile);
          }
        }
      }

      sendJson(res, 200, {
        ...(await tribeStateFor(ownerProfile)),
        addedCount: addedIds.length,
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/tribe-join-requests/")) {
    try {
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before answering tribe requests" });
        return;
      }

      const parts = url.pathname.split("/");
      const requestId = decodeURIComponent(parts[3] || "");
      const action = parts[4] || "";
      if (!["accept", "decline"].includes(action)) {
        sendJson(res, 404, { error: "Not found" });
        return;
      }

      const ownerProfile = await getProfileByOwner(authed.userId);
      if (!ownerProfile) {
        sendJson(res, 404, { error: "Publish your profile before answering tribe requests" });
        return;
      }

      const requests = Array.isArray(ownerProfile.tribeJoinRequests) ? ownerProfile.tribeJoinRequests : [];
      const request = requests.find((item) => String(item.id) === requestId);
      if (!request) {
        sendJson(res, 404, { error: "Tribe request was not found" });
        return;
      }

      const tribes = normalizeTribesForProfile(ownerProfile);
      const tribeIndex = tribes.findIndex((tribe) => tribe.tribeId === request.tribeId);
      if (tribeIndex >= 0) {
        const tribe = tribes[tribeIndex];
        tribe.pendingJoinIds = tribe.pendingJoinIds.filter((id) => id !== request.requesterId);
        if (action === "accept" && !tribe.memberIds.includes(request.requesterId)) {
          tribe.memberIds.push(request.requesterId);
        }
        tribe.updatedAt = new Date().toISOString();
        tribes[tribeIndex] = tribe;
        ownerProfile.tribes = tribes;
      }

      ownerProfile.tribeJoinRequests = requests.filter((item) => String(item.id) !== requestId);
      ownerProfile.updatedAt = new Date().toISOString();
      await saveProfile(ownerProfile);

      sendJson(res, 200, await tribeStateFor(ownerProfile));
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "PATCH" && url.pathname.startsWith("/api/tribes/")) {
    try {
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before editing tribes" });
        return;
      }

      const tribeId = decodeURIComponent(url.pathname.split("/")[3] || "");
      const body = JSON.parse((await readBody(req)) || "{}");
      const found = await findTribeById(tribeId);
      if (!found) {
        sendJson(res, 404, { error: "Tribe was not found" });
        return;
      }

      const { ownerProfile, tribe, tribeIndex, tribes } = found;
      if (!canManageTribe(tribe, authed.userId)) {
        sendJson(res, 403, { error: "Only tribe managers can edit this tribe" });
        return;
      }

      const nextName = sanitizeTribeName(body.name);
      if (!nextName) {
        sendJson(res, 400, { error: "Enter a tribe name" });
        return;
      }

      tribe.name = nextName;
      tribe.themeColor = sanitizeThemeColor(body.themeColor);
      tribe.visibility = sanitizeTribeVisibility(body.visibility);
      tribe.icon = sanitizeTribeIcon(body.icon);
      tribe.announcement = sanitizeShortText(body.announcement, 140);
      if (body.bannerData) tribe.bannerData = sanitizeImageDataUrl(body.bannerData, 1024 * 1024);
      tribe.updatedAt = new Date().toISOString();
      tribes[tribeIndex] = tribe;
      ownerProfile.tribes = tribes;
      ownerProfile.tribeJoinRequests = (Array.isArray(ownerProfile.tribeJoinRequests) ? ownerProfile.tribeJoinRequests : []).map((request) =>
        request.tribeId === tribe.tribeId ? { ...request, tribeName: tribe.name } : request
      );
      ownerProfile.updatedAt = tribe.updatedAt;
      await saveProfile(ownerProfile);

      sendJson(res, 200, await tribeStateFor(ownerProfile));
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/tribes/") && url.pathname.includes("/members/") && url.pathname.endsWith("/role")) {
    try {
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before changing tribe roles" });
        return;
      }

      const parts = url.pathname.split("/");
      const tribeId = decodeURIComponent(parts[3] || "");
      const memberId = decodeURIComponent(parts[5] || "");
      const body = JSON.parse((await readBody(req)) || "{}");
      const role = String(body.role || "").toLowerCase() === "admin" ? "admin" : "member";
      const found = await findTribeById(tribeId);
      if (!found) {
        sendJson(res, 404, { error: "Tribe was not found" });
        return;
      }

      const { ownerProfile, tribe, tribeIndex, tribes } = found;
      if (tribe.ownerId !== authed.userId) {
        sendJson(res, 403, { error: "Only the tribe owner can change roles" });
        return;
      }
      if (!memberId || memberId === tribe.ownerId || !tribe.memberIds.includes(memberId)) {
        sendJson(res, 400, { error: "Choose a valid tribe member" });
        return;
      }

      tribe.adminIds = role === "admin"
        ? cleanIdList([...tribe.adminIds, memberId])
        : tribe.adminIds.filter((id) => id !== memberId);
      tribe.updatedAt = new Date().toISOString();
      tribes[tribeIndex] = tribe;
      ownerProfile.tribes = tribes;
      ownerProfile.updatedAt = tribe.updatedAt;
      await saveProfile(ownerProfile);
      sendJson(res, 200, await tribeStateFor(ownerProfile));
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/tribes/") && url.pathname.includes("/members/")) {
    try {
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before removing tribe members" });
        return;
      }

      const parts = url.pathname.split("/");
      const tribeId = decodeURIComponent(parts[3] || "");
      const memberId = decodeURIComponent(parts[5] || "");
      const found = await findTribeById(tribeId);
      if (!found) {
        sendJson(res, 404, { error: "Tribe was not found" });
        return;
      }

      const { ownerProfile, tribe, tribeIndex, tribes } = found;
      if (!canManageTribe(tribe, authed.userId)) {
        sendJson(res, 403, { error: "Only tribe managers can remove members" });
        return;
      }

      if (!memberId || memberId === tribe.ownerId) {
        sendJson(res, 400, { error: "The tribe owner cannot be removed" });
        return;
      }
      if (tribe.adminIds.includes(memberId) && tribe.ownerId !== authed.userId) {
        sendJson(res, 403, { error: "Only the owner can remove admins" });
        return;
      }

      tribe.memberIds = tribe.memberIds.filter((id) => id !== memberId);
      tribe.adminIds = tribe.adminIds.filter((id) => id !== memberId);
      tribe.updatedAt = new Date().toISOString();
      tribes[tribeIndex] = tribe;
      ownerProfile.tribes = tribes;
      ownerProfile.updatedAt = tribe.updatedAt;
      await saveProfile(ownerProfile);

      sendJson(res, 200, await tribeStateFor(ownerProfile));
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/tribes/")) {
    try {
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before deleting tribes" });
        return;
      }

      const tribeId = decodeURIComponent(url.pathname.split("/")[3] || "");
      const ownerProfile = await getProfileByOwner(authed.userId);
      if (!ownerProfile) {
        sendJson(res, 404, { error: "Publish your profile before deleting tribes" });
        return;
      }

      const tribes = normalizeTribesForProfile(ownerProfile);
      const tribe = tribes.find((item) => item.tribeId === tribeId && item.ownerId === authed.userId);
      if (!tribe) {
        sendJson(res, 403, { error: "Only the tribe owner can delete this tribe" });
        return;
      }

      ownerProfile.tribes = tribes.filter((item) => item.tribeId !== tribeId);
      ownerProfile.tribeJoinRequests = (Array.isArray(ownerProfile.tribeJoinRequests) ? ownerProfile.tribeJoinRequests : []).filter(
        (request) => request.tribeId !== tribeId
      );
      ownerProfile.updatedAt = new Date().toISOString();
      await saveProfile(ownerProfile);

      const profiles = await listProfiles();
      for (const profile of profiles) {
        if (profile.ownerUserId === ownerProfile.ownerUserId) continue;
        const invites = Array.isArray(profile.tribeInvites) ? profile.tribeInvites : [];
        const nextInvites = invites.filter((invite) => invite.tribeId !== tribeId);
        if (nextInvites.length !== invites.length) {
          profile.tribeInvites = nextInvites;
          profile.updatedAt = new Date().toISOString();
          await saveProfile(profile);
        }
      }

      sendJson(res, 200, await tribeStateFor(ownerProfile));
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "GET" && seoPageDefinitions[url.pathname]) {
    renderSeoPage(req, res, url.pathname);
    return;
  }

  if (req.method === "GET" && noindexAppPaths.has(url.pathname)) {
    sendIndexPage(req, res, {
      title: "Sign in to slapz.lol",
      description: "Sign in to manage your slapz.lol profile, Slappers, Tribes, chats, games and settings.",
      canonical: url.pathname,
      robots: "noindex,nofollow",
      ogType: "website",
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/robots.txt") {
    sendText(
      res,
      200,
      "text/plain; charset=utf-8",
      [
        "User-agent: *",
        "Allow: /",
        "Disallow: /api/",
        "Disallow: /dashboard",
        "Disallow: /settings",
        "Disallow: /admin",
        "Disallow: /owner",
        "Disallow: /login",
        "Disallow: /signup",
        "Disallow: /reset-password",
        `Sitemap: ${siteOrigin(req)}/sitemap.xml`,
        "",
      ].join("\n")
    );
    return;
  }

  if (req.method === "GET" && url.pathname === "/sitemap.xml") {
    const origin = siteOrigin(req);
    const profiles = await listProfiles();
    const now = new Date().toISOString();
    const urls = [
      { loc: origin, lastmod: now },
      ...seoPagePaths.map((pagePath) => ({ loc: `${origin}${pagePath}`, lastmod: now })),
      ...profiles
        .filter((profile) => sanitizeProfilePrivacy(profile.profilePrivacy) === "public" && sanitizeHandle(profile.handle))
        .map((profile) => ({
          loc: `${origin}/u/${profile.handle}`,
          lastmod: profile.updatedAt || now,
        })),
    ];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((item) => `  <url>\n    <loc>${escapeXml(item.loc)}</loc>\n    <lastmod>${escapeXml(item.lastmod)}</lastmod>\n  </url>`)
      .join("\n")}\n</urlset>\n`;
    sendText(res, 200, "application/xml; charset=utf-8", body);
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/profiles/") && /\/(music|avatar|background)$/.test(url.pathname)) {
    const parts = url.pathname.split("/");
    const handle = sanitizeHandle(decodeURIComponent(parts[3] || ""));
    const mediaType = parts[4];
    const profile = await getProfile(handle);
    await sendProfileMedia(req, res, profile, mediaType);
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/profiles/")) {
    const handle = sanitizeHandle(decodeURIComponent(url.pathname.split("/").pop()));
    const profile = await getProfile(handle);
    if (!profile) {
      sendJson(res, 404, { error: "Profile not found" });
      return;
    }
    const access = await canViewProfile(profile, req);
    if (!access.allowed) {
      sendJson(res, 403, { error: "This profile is private." });
      return;
    }
    if (url.searchParams.get("view") === "1") {
      await incrementProfileViews(profile);
    }
    const publicProfile = publicProfilePayload(profile);
    const ownerUser = profile.ownerUserId ? await findUserById(profile.ownerUserId) : null;
    const unlockedBadges = new Set(ownerUser ? await unlockedProfileBadges(profile, ownerUser) : []);
    publicProfile.badges = sanitizeProfileBadges(publicProfile.badges).filter((badge) => unlockedBadges.has(badge));
    if (url.searchParams.get("view") === "1") {
      publicProfile.hasAvatar = Boolean(publicProfile.avatarPath || publicProfile.avatarData);
      publicProfile.hasBackground = Boolean(publicProfile.backgroundPath || publicProfile.backgroundData);
      publicProfile.hasMusic = Boolean(publicProfile.musicPath || publicProfile.musicData);
      delete publicProfile.avatarData;
      delete publicProfile.avatarPath;
      delete publicProfile.backgroundData;
      delete publicProfile.backgroundPath;
      delete publicProfile.musicData;
      delete publicProfile.musicPath;
    }
    sendJson(res, 200, publicProfile);
    return;
  }

  if (req.method === "PUT" && url.pathname.startsWith("/api/profiles/")) {
    try {
      if (rateLimit(req, res, "profile_publish", rateLimits.profileWrite)) return;
      const body = await readBody(req);
      const incoming = JSON.parse(body || "{}");
      const handle = sanitizeHandle(incoming.handle || url.pathname.split("/").pop());
      if (!handle) {
        sendJson(res, 400, { error: "Handle is required" });
        return;
      }

      const existingProfile = await getProfile(handle);
      const authed = await getAuthedUser(req);
      if (!authed) {
        sendJson(res, 401, { error: "Sign in before publishing a profile" });
        return;
      }

      if (existingProfile && !existingProfile.ownerUserId && !existingProfile.ownerToken) {
        sendJson(res, 403, {
          error: "This profile was created before edit protection. Create a new handle or reset it on the server.",
        });
        return;
      }

      if (existingProfile?.ownerUserId && existingProfile.ownerUserId !== authed.userId) {
        sendJson(res, 403, { error: "You can only edit profiles created by your account" });
        return;
      }

      const origin = siteOrigin(req);
      const profilePath = `/u/${handle}`;
      const profileUrl = `${origin}${profilePath}`;
      validateProfileMedia(incoming);
      incoming.status = sanitizeProfileStatus(incoming.status);
      incoming.profileTemplate = sanitizeProfileTemplate(incoming.profileTemplate || incoming.template);
      incoming.profilePrivacy = sanitizeProfilePrivacy(incoming.profilePrivacy);
      incoming.entryAnimation = sanitizeEntryAnimation(incoming.entryAnimation);
      incoming.featured = sanitizeFeaturedProfileItem(incoming.featured);
      incoming.badges = sanitizeProfileBadges(incoming.badges);
      incoming.badgeOptOuts = sanitizeProfileBadges(incoming.badgeOptOuts);
      incoming.bestFriendHandles = cleanIdList(incoming.bestFriendHandles).map(sanitizeHandle).filter(Boolean).slice(0, 8);
      let profile = await prepareProfileForSave({
        ...incoming,
        handle,
        profileHandle: handle,
        profilePath,
        profileUrl,
        friends: existingProfile ? existingProfile.friends || [] : Array.isArray(incoming.friends) ? incoming.friends : [],
        friendRequests: existingProfile ? existingProfile.friendRequests || [] : [],
        sentFriendRequests: existingProfile ? existingProfile.sentFriendRequests || [] : [],
        adminNotifications: existingProfile ? existingProfile.adminNotifications || [] : [],
        tribes: existingProfile ? existingProfile.tribes || [] : Array.isArray(incoming.tribes) ? incoming.tribes : [],
        tribeInvites: existingProfile ? existingProfile.tribeInvites || [] : [],
        tribeJoinRequests: existingProfile ? existingProfile.tribeJoinRequests || [] : [],
        ownerUserId: authed.userId,
        views: Number(existingProfile?.views || incoming.views || 0),
        updatedAt: new Date().toISOString(),
      }, existingProfile);
      profile = await applyProfileBadgeRules(profile, authed);
      await saveProfile(profile);
      await saveUserProfileLink(authed.userId, { handle, origin });
      sendJson(res, 200, {
        handle,
        url: profilePath,
        fullUrl: profileUrl,
        badges: profile.badges,
        badgeOptOuts: profile.badgeOptOuts,
        unlockedBadges: await unlockedProfileBadges(profile, authed),
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/u/")) {
    const handle = sanitizeHandle(decodeURIComponent(url.pathname.split("/")[2] || ""));
    if (!handle) {
      sendIndexPage(req, res, {
        title: "Profile not found | slapz.lol",
        description: "This slapz.lol profile could not be found.",
        canonical: url.pathname,
        robots: "noindex,nofollow",
      });
      return;
    }
    sendIndexPage(req, res, await profileSeoMeta(req, handle));
    return;
  }

  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = path.normalize(decodeURIComponent(requestedPath)).replace(/^[/\\]+/, "");
  const filePath = path.resolve(root, safePath);

  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    logSecurity("path_traversal_blocked", req, { path: url.pathname });
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }

  if (!isPublicStaticPath(safePath)) {
    logSecurity("static_file_blocked", req, { path: url.pathname });
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  sendFile(res, filePath);
});

server.listen(port, () => {
  const storage = hasSupabase ? "Supabase" : "local JSON";
  console.log(`slapz.lol running at http://localhost:${port} using ${storage}`);
});
