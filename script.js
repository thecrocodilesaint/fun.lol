const $ = (selector) => document.querySelector(selector);
const maxFriendCount = 150;

const profile = {
  name: $("#name"),
  handle: $("#handle"),
  bio: $("#bio"),
  location: $("#location"),
  views: $("#views"),
  status: $("#profileStatus"),
  badges: $("#profileBadges"),
  visitors: $("#profileVisitors"),
};

const inputs = {
  name: $("#nameInput"),
  handle: $("#handleInput"),
  bio: $("#bioInput"),
  location: $("#locationInput"),
  status: $("#statusInput"),
  template: $("#templateInput"),
  profilePrivacy: $("#profilePrivacyInput"),
  entryAnimation: $("#entryAnimationInput"),
  featuredType: $("#featuredTypeInput"),
  featuredText: $("#featuredTextInput"),
  cursorTrail: $("#cursorTrailInput"),
  sparkleEffect: $("#sparkleEffectInput"),
};

const socialInputs = {
  discord: $("#discordInput"),
  instagram: $("#instagramInput"),
  tiktok: $("#tiktokInput"),
  youtube: $("#youtubeInput"),
  x: $("#xInput"),
  github: $("#githubInput"),
};

const friendInputs = {
  name: $("#friendNameInput"),
  link: $("#friendLinkInput"),
};

const auth = {
  screen: $("#authScreen"),
  title: $("#authTitle"),
  form: $("#authForm"),
  forgotForm: $("#forgotPasswordForm"),
  resetForm: $("#resetPasswordForm"),
  email: $("#authEmail"),
  password: $("#authPassword"),
  forgotEmail: $("#forgotPasswordEmail"),
  forgotMessage: $("#forgotPasswordMessage"),
  resetNewPassword: $("#resetNewPassword"),
  resetConfirmPassword: $("#resetConfirmPassword"),
  resetMessage: $("#resetPasswordMessage"),
  signupButton: $("#signupButton"),
  loginButton: $("#loginButton"),
  forgotButton: $("#forgotPasswordButton"),
  sendResetButton: $("#sendResetLinkButton"),
  forgotBackButton: $("#backToLoginFromForgot"),
  resetButton: $("#resetPasswordButton"),
  resetBackButton: $("#backToLoginFromReset"),
  message: $("#authMessage"),
  logoutButton: $("#logoutButton"),
  accountLogoutButton: $("#accountLogoutButton"),
};

const landingAuthButtons = document.querySelectorAll("[data-landing-auth]");
const landingRevealItems = document.querySelectorAll("[data-reveal]");

const onboarding = {
  screen: $("#onboardingScreen"),
  progress: $("#onboardingProgress"),
  stepText: $("#onboardingStepText"),
  title: $("#onboardingTitle"),
  body: $("#onboardingBody"),
  list: $("#onboardingList"),
  fields: $("#onboardingPublishFields"),
  nameInput: $("#onboardingNameInput"),
  handleInput: $("#onboardingHandleInput"),
  backButton: $("#onboardingBackButton"),
  nextButton: $("#onboardingNextButton"),
  publishButton: $("#onboardingPublishButton"),
  skipButton: $("#onboardingSkipButton"),
};

const settings = {
  email: $("#settingsEmail"),
  displayName: $("#settingsDisplayName"),
  handle: $("#settingsHandle"),
  profileLink: $("#settingsProfileLink"),
  views: $("#settingsViews"),
  created: $("#settingsCreated"),
  userId: $("#settingsUserId"),
};

const ownerPanel = {
  button: $("#ownerPanelButton"),
  list: $("#ownerUserList"),
  count: $("#ownerUserCount"),
  notice: $("#ownerNoticeInput"),
  refreshButton: $("#refreshOwnerUsersButton"),
};

const sidebarProfile = {
  avatar: $("#sidebarProfileAvatar"),
  name: $("#sidebarProfileName"),
  handle: $("#sidebarProfileHandle"),
  status: $("#sidebarStatusBadge"),
};

const leaderboardView = {
  grid: $("#leaderboardGameGrid"),
  detail: $("#leaderboardDetail"),
  backButton: $("#leaderboardBackButton"),
  title: $("#leaderboardTitle"),
  global: $("#leaderboardGlobalList"),
  friends: $("#leaderboardFriendList"),
  ownScore: $("#leaderboardOwnScore"),
  status: $("#leaderboardStatus"),
};

const dashboardButtons = document.querySelectorAll("[data-dashboard-target]");
const dashboardPanels = document.querySelectorAll("[data-dashboard-panel]");
const dashboardAppearanceButtons = document.querySelectorAll("[data-dashboard-appearance]");
const dashboardThemeButtons = document.querySelectorAll("[data-dashboard-theme]");
const dashboardCursorButtons = document.querySelectorAll("[data-dashboard-cursor]");
const cursorColorButtons = document.querySelectorAll("[data-cursor-color]");

const sessionKey = "nightcard-session-token";
const dashboardAppearanceKey = "funlol-dashboard-appearance";
const dashboardThemeKey = "funlol-dashboard-theme";
const dashboardMuteKey = "funlol-dashboard-mute-outside-bio";
const sidebarCollapsedKey = "funlol-sidebar-collapsed";
const dashboardCursorModeKey = "funlol-dashboard-cursor-mode";
const cursorColorKey = "funlol-cursor-color";
const dashboardAppearanceValues = new Set(["dark", "light"]);
const dashboardThemeValues = new Set(["black", "violet", "aqua", "ember"]);
const cursorModeValues = new Set(["normal", "dot"]);
const cursorColors = new Set(["white", "blue", "pink"]);
const finePointerQuery = window.matchMedia ? window.matchMedia("(hover: hover) and (pointer: fine)") : null;
const canUsePointerEffects = () => (finePointerQuery ? finePointerQuery.matches : true);
const resetPasswordToken = new URLSearchParams(window.location.search).get("token") || "";
let sessionToken = localStorage.getItem(sessionKey) || "";
let loadingTimer = null;
let loadingPercent = 8;
let profileTheme = document.body.dataset.theme || "black";
let dashboardAppearance = localStorage.getItem(dashboardAppearanceKey) === "light" ? "light" : "dark";
let dashboardTheme = dashboardThemeValues.has(localStorage.getItem(dashboardThemeKey)) ? localStorage.getItem(dashboardThemeKey) : "black";
let dashboardMusicMutedOutsideBio = localStorage.getItem(dashboardMuteKey) === "true";
let sidebarCollapsed = localStorage.getItem(sidebarCollapsedKey) === "true";
let cursorColor = cursorColors.has(localStorage.getItem(cursorColorKey)) ? localStorage.getItem(cursorColorKey) : "white";
let dashboardSettingsSaveTimer = null;
let applyingDashboardSettings = false;
let activeEntryAnimation = "none";
let accountState = {
  email: "",
  userId: "",
  createdAt: "",
  profileHandle: "",
  profilePath: "",
  profileUrl: "",
  isOwner: false,
  onboardingCompleted: false,
  onboardingSkipped: false,
  needsOnboarding: false,
  dashboardSettings: {},
};
let friends = [];
let friendRequests = [];
let sentFriendRequests = [];
let adminNotifications = [];
let friendSearchResults = [];
let friendSuggestions = [];
let bestFriendHandles = [];
let friendActivity = [];
let unlockedBadges = new Set();
let friendRefreshTimer = 0;
let pendingFriendRemoval = null;
let pendingConfirmAction = null;
let tribes = [];
let tribeInvites = [];
let tribeJoinRequests = [];
let selectedTribeId = "";
let addMembersTribeId = "";
let activeTribeChatId = "";
let tribeChatMessages = {};
let tribeChatAttachment = null;
let leaderboards = { global: [], friends: [], tribe: [] };
let ownerUsers = [];
let ownerUsersLoading = false;
let onboardingStep = 0;
let onboardingPublishPrompted = false;

const onboardingSteps = [
  {
    title: "Welcome to slapz.lol",
    body: "slapz.lol is your private dashboard for building a public bio page with music, media, friends, tribes, chats, and games.",
    items: ["Customize your profile", "Share one public link", "Keep your dashboard private"],
  },
  {
    title: "Create your public profile",
    body: "Your Bio is where your official public slapz.lol profile is made. Publish from Bio when you are ready for people to see it.",
    items: ["Choose a display name", "Pick a clean handle", "Add your bio, location, and social icons"],
  },
  {
    title: "Make it feel like you",
    body: "Use avatar, background image or video, music, themes, cursor style, and sparkle effects to build your vibe.",
    items: ["Upload media", "Add background music", "Pick themes, cursor, and effects"],
  },
  {
    title: "Connect with people",
    body: "Friends and notifications help you manage requests, see updates, and keep your circle close from the dashboard.",
    items: ["Send friend requests", "Accept notifications", "View friends from Home and Tribes"],
  },
  {
    title: "Join tribes and chats",
    body: "Tribes are small groups where members can join, owners can manage people, and tribe chats stay scoped to each tribe.",
    items: ["Create or join tribes", "Approve join requests", "Chat with tribe members"],
  },
  {
    title: "Publish and share",
    body: "To create your official public slapz.lol profile, you need to publish your profile in Bio.",
    items: ["Play mini-games from the dashboard", "Share your /u/handle link", "Publish your Bio to finish onboarding"],
    publish: true,
  },
];

const profileTemplates = {
  dark: { theme: "black", sparkle: "none", cursor: "normal" },
  gamer: { theme: "aqua", sparkle: "aqua", cursor: "dot" },
  neon: { theme: "violet", sparkle: "purple", cursor: "dot" },
  cute: { theme: "ember", sparkle: "pink", cursor: "normal" },
  anime: { theme: "violet", sparkle: "pink", cursor: "dot" },
  music: { theme: "black", sparkle: "gold", cursor: "dot" },
  creator: { theme: "ember", sparkle: "gold", cursor: "normal" },
  retro: { theme: "black", sparkle: "white", cursor: "normal" },
};

const entryAnimationOptions = new Set(["none", "fade-in", "neon-pulse", "glitch", "portal", "pixel-load"]);
const profilePrivacyOptions = new Set(["public", "friends", "hidden"]);

const sanitizeEntryAnimation = (value) => (entryAnimationOptions.has(String(value || "")) ? String(value) : "none");
const sanitizeProfilePrivacy = (value) => (profilePrivacyOptions.has(String(value || "")) ? String(value) : "public");

const badgeOptions = ["Early User", "Verified Profile", "Tribe Owner", "Game Champion", "Top Friend", "Profile Creator"];
const profileBadgeIconMap = {
  "Early User": {
    className: "badge-seal",
    svg: '<path d="M12 3.2 14.1 6l3.5-.3.6 3.5 2.6 2.3-2.1 2.8.3 3.5-3.5.6-2.3 2.6-2.8-2.1-3.5.3-.6-3.5-2.6-2.3 2.1-2.8-.3-3.5 3.5-.6L12 3.2Z"/><path d="m8.7 12.2 2.1 2.1 4.6-4.9"/>',
  },
  "Verified Profile": {
    className: "badge-gem",
    svg: '<path d="M5.2 8.1 8.4 4.5h7.2l3.2 3.6L12 20.1 5.2 8.1Z"/><path d="M5.8 8.1h12.4M8.4 4.5 12 20.1l3.6-15.6M8.4 4.5l3.6 3.6 3.6-3.6"/>',
  },
  "Tribe Owner": {
    className: "badge-tribe",
    svg: '<path d="M7 19V8.2C7 5.9 9 4 11.4 4h1.2C15 4 17 5.9 17 8.2V19"/><path d="M7 11.2 4.8 8.8M17 11.2l2.2-2.4M9.2 7.6h.01M14.8 7.6h.01M9.1 13.4c1.9 1.4 3.9 1.4 5.8 0"/>',
  },
  "Game Champion": {
    className: "badge-champ",
    svg: '<path d="M12 3.5 19.4 8 12 20.5 4.6 8 12 3.5Z"/><path d="M8.2 8h7.6M12 3.5V20.5M7.2 10.8 12 15.2l4.8-4.4"/>',
  },
  "Top Friend": {
    className: "badge-friend",
    svg: '<path d="M12 20s-7-4.4-7-10.1C5 7 6.9 5 9.3 5c1.4 0 2.4.7 2.7 1.6C12.3 5.7 13.3 5 14.7 5 17.1 5 19 7 19 9.9 19 15.6 12 20 12 20Z"/><path d="M9 11.5h6"/>',
  },
  "Profile Creator": {
    className: "badge-creator",
    svg: '<circle cx="12" cy="12" r="8.2"/><path d="M9 15.2 15.2 9l1.4 1.4-6.2 6.2H9v-1.4Z"/><path d="M14.4 9.8 15.2 9l1.4 1.4-.8.8"/>',
  },
};
const dailyChallenges = [
  { title: "Play Wordle today", text: "Finish one Wordle round to keep your brain warm." },
  { title: "Beat 25 in Click Rush", text: "A fast but realistic target for a clean 15 second round." },
  { title: "Get a new Snake score", text: "Play Snake and try to beat your saved high score." },
];

const mediaState = {
  avatarData: "",
  avatarName: "",
  avatarPath: "",
  backgroundData: "",
  backgroundName: "",
  backgroundType: "",
  backgroundPath: "",
  musicData: "",
  musicName: "",
  musicPath: "",
  musicObjectUrl: "",
  privateMediaUrls: {},
};

const snake = {
  canvas: $("#snakeCanvas"),
  score: $("#snakeScore"),
  best: $("#snakeBestScore"),
  finalScore: $("#snakeFinalScore"),
  gameOverScreen: $("#snakeGameOver"),
  status: $("#snakeStatus"),
  startButton: $("#snakeStartButton"),
  pauseButton: $("#snakePauseButton"),
  gridSize: 18,
  snake: [{ x: 9, y: 9 }],
  apple: { x: 13, y: 9 },
  direction: { x: 1, y: 0 },
  nextDirection: { x: 1, y: 0 },
  scoreValue: 0,
  bestValue: 0,
  timer: null,
  running: false,
  paused: false,
  gameOver: false,
};

const clickRush = {
  board: $("#clickRushBoard"),
  target: $("#clickRushTarget"),
  score: $("#clickRushScore"),
  best: $("#clickRushBest"),
  time: $("#clickRushTime"),
  finalScore: $("#clickRushFinalScore"),
  gameOverScreen: $("#clickRushGameOver"),
  status: $("#clickRushStatus"),
  startButton: $("#clickRushStartButton"),
  resetButton: $("#clickRushResetButton"),
  scoreValue: 0,
  bestValue: 0,
  timeValue: 15,
  timer: null,
  running: false,
};

const wordleWords = [
  "BLAZE",
  "CRISP",
  "FROST",
  "GHOST",
  "GLARE",
  "NIGHT",
  "PIXEL",
  "PLAZA",
  "SHINE",
  "SOUND",
  "VIVID",
];

const wordleValidWords = new Set([
  ...wordleWords,
  "ABOUT",
  "ABOVE",
  "ACTOR",
  "ACUTE",
  "ADMIT",
  "ADOPT",
  "ADULT",
  "AFTER",
  "AGAIN",
  "AGENT",
  "AGREE",
  "AHEAD",
  "ALARM",
  "ALBUM",
  "ALERT",
  "ALIEN",
  "ALIVE",
  "ALLOW",
  "ALONE",
  "ALTER",
  "AMONG",
  "ANGER",
  "APPLE",
  "APPLY",
  "ARENA",
  "ARGUE",
  "ARISE",
  "ARROW",
  "AUDIO",
  "AVOID",
  "AWARD",
  "AWARE",
  "BADGE",
  "BASIC",
  "BEACH",
  "BEGAN",
  "BEGIN",
  "BEING",
  "BELOW",
  "BENCH",
  "BIRTH",
  "BLACK",
  "BLAME",
  "BLANK",
  "BLIND",
  "BLOCK",
  "BLOOD",
  "BOARD",
  "BOOST",
  "BOUND",
  "BRAIN",
  "BRAND",
  "BREAD",
  "BREAK",
  "BRICK",
  "BRING",
  "BROWN",
  "BUILD",
  "BUILT",
  "BUYER",
  "CABLE",
  "CARRY",
  "CATCH",
  "CAUSE",
  "CHAIN",
  "CHAIR",
  "CHART",
  "CHASE",
  "CHEAP",
  "CHECK",
  "CHEST",
  "CHILD",
  "CHOIR",
  "CIVIL",
  "CLAIM",
  "CLASS",
  "CLEAN",
  "CLEAR",
  "CLICK",
  "CLOCK",
  "CLOSE",
  "CLOUD",
  "COACH",
  "COAST",
  "COUNT",
  "COURT",
  "COVER",
  "CRAFT",
  "CRASH",
  "CREAM",
  "CRIME",
  "CROSS",
  "CROWD",
  "CROWN",
  "DAILY",
  "DANCE",
  "DEALT",
  "DEATH",
  "DEBUT",
  "DELAY",
  "DEPTH",
  "DIRTY",
  "DOUBT",
  "DRAFT",
  "DRAMA",
  "DREAM",
  "DRESS",
  "DRIVE",
  "EARLY",
  "EARTH",
  "EIGHT",
  "EMPTY",
  "ENEMY",
  "ENJOY",
  "ENTER",
  "ENTRY",
  "EQUAL",
  "ERROR",
  "EVENT",
  "EVERY",
  "EXACT",
  "EXIST",
  "EXTRA",
  "FAITH",
  "FALSE",
  "FAULT",
  "FIBER",
  "FIELD",
  "FIFTH",
  "FIGHT",
  "FINAL",
  "FIRST",
  "FIXED",
  "FLASH",
  "FLOOR",
  "FOCUS",
  "FORCE",
  "FRAME",
  "FRESH",
  "FRONT",
  "FRUIT",
  "GIANT",
  "GIVEN",
  "GLASS",
  "GRACE",
  "GRADE",
  "GRAND",
  "GRANT",
  "GRASS",
  "GREAT",
  "GREEN",
  "GROUP",
  "GUARD",
  "GUESS",
  "GUEST",
  "GUIDE",
  "HAPPY",
  "HEART",
  "HEAVY",
  "HONOR",
  "HORSE",
  "HOTEL",
  "HOUSE",
  "HUMAN",
  "IMAGE",
  "INDEX",
  "INNER",
  "INPUT",
  "ISSUE",
  "JOINT",
  "JUDGE",
  "KNOWN",
  "LABEL",
  "LARGE",
  "LASER",
  "LATER",
  "LAUGH",
  "LAYER",
  "LEARN",
  "LEAST",
  "LEAVE",
  "LEVEL",
  "LIGHT",
  "LIMIT",
  "LOCAL",
  "LOGIC",
  "LOOSE",
  "LOWER",
  "LUCKY",
  "MAGIC",
  "MAJOR",
  "MARCH",
  "MATCH",
  "MAYBE",
  "METAL",
  "MIGHT",
  "MINOR",
  "MODEL",
  "MONEY",
  "MONTH",
  "MOTOR",
  "MOUSE",
  "MOUTH",
  "MUSIC",
  "NEVER",
  "NOISE",
  "NORTH",
  "NOVEL",
  "NURSE",
  "OCEAN",
  "OFFER",
  "ORDER",
  "OTHER",
  "OUTER",
  "OWNER",
  "PANEL",
  "PAPER",
  "PARTY",
  "PAUSE",
  "PEACE",
  "PHASE",
  "PHONE",
  "PHOTO",
  "PIANO",
  "PIECE",
  "PILOT",
  "PLACE",
  "PLAIN",
  "PLANE",
  "PLANT",
  "PLATE",
  "POINT",
  "POWER",
  "PRESS",
  "PRICE",
  "PRIDE",
  "PRIME",
  "PRINT",
  "PRIZE",
  "PROOF",
  "PROUD",
  "QUEEN",
  "QUICK",
  "QUIET",
  "RADIO",
  "RAISE",
  "RANGE",
  "RAPID",
  "RATIO",
  "REACH",
  "REACT",
  "READY",
  "RIGHT",
  "RIVER",
  "ROBOT",
  "ROUGH",
  "ROUND",
  "ROUTE",
  "ROYAL",
  "RURAL",
  "SCALE",
  "SCENE",
  "SCOPE",
  "SCORE",
  "SENSE",
  "SERVE",
  "SHADE",
  "SHARE",
  "SHEET",
  "SHIFT",
  "SHIRT",
  "SHOCK",
  "SHORT",
  "SHOWN",
  "SIGHT",
  "SKILL",
  "SLEEP",
  "SLICE",
  "SMALL",
  "SMART",
  "SMILE",
  "SMOKE",
  "SOLID",
  "SOLVE",
  "SORRY",
  "SOUTH",
  "SPACE",
  "SPARE",
  "SPEAK",
  "SPEED",
  "SPEND",
  "SPICE",
  "SPORT",
  "SQUAD",
  "STAFF",
  "STAGE",
  "STAIR",
  "STAND",
  "START",
  "STATE",
  "STEAM",
  "STICK",
  "STILL",
  "STONE",
  "STORE",
  "STORM",
  "STORY",
  "STRIP",
  "STUDY",
  "STYLE",
  "SUGAR",
  "SUPER",
  "SWEET",
  "TABLE",
  "TAKEN",
  "TASTE",
  "TEACH",
  "THANK",
  "THEME",
  "THERE",
  "THICK",
  "THING",
  "THINK",
  "THIRD",
  "THOSE",
  "THREE",
  "THROW",
  "TIGHT",
  "TIMER",
  "TITLE",
  "TODAY",
  "TOPIC",
  "TOTAL",
  "TOUCH",
  "TOWER",
  "TRACK",
  "TRADE",
  "TRAIN",
  "TRIAL",
  "TRUCK",
  "TRULY",
  "TRUST",
  "UNDER",
  "UNION",
  "UNITY",
  "UPPER",
  "URBAN",
  "USAGE",
  "USUAL",
  "VALID",
  "VALUE",
  "VIDEO",
  "VIRAL",
  "VISIT",
  "VOICE",
  "WASTE",
  "WATCH",
  "WATER",
  "WHEEL",
  "WHERE",
  "WHILE",
  "WHITE",
  "WHOLE",
  "WOMAN",
  "WORLD",
  "WORRY",
  "WORTH",
  "WOULD",
  "WRITE",
  "WRONG",
  "YOUNG",
]);

let wordleDictionaryWords = [...wordleWords];
let wordleDictionarySet = new Set(wordleValidWords);
let wordleDictionaryLoaded = false;

const wordle = {
  board: $("#wordleBoard"),
  input: $("#wordleInput"),
  try: $("#wordleTry"),
  left: $("#wordleLeft"),
  status: $("#wordleStatus"),
  guessButton: $("#wordleGuessButton"),
  resetButton: $("#wordleResetButton"),
  target: "",
  row: 0,
  size: 5,
  maxRows: 6,
  complete: false,
};

const loadWordleDictionary = async () => {
  try {
    const response = await fetch("/words-5.txt", { cache: "force-cache" });
    if (!response.ok) throw new Error("Dictionary file not found");

    const words = (await response.text())
      .split(/\r?\n/)
      .map((word) => word.trim().toUpperCase())
      .filter((word) => /^[A-Z]{5}$/.test(word));
    const uniqueWords = [...new Set(words)];
    if (!uniqueWords.length) throw new Error("Dictionary file is empty");

    wordleDictionaryWords = uniqueWords;
    wordleDictionarySet = new Set(uniqueWords);
    wordleDictionaryLoaded = true;

    if (activeGame === "wordle" && !wordle.complete) {
      resetWordle();
    }
  } catch (error) {
    console.warn("Using fallback Wordle dictionary:", error.message);
  }
};

const crossy = {
  canvas: $("#crossyCanvas"),
  score: $("#crossyScore"),
  best: $("#crossyBest"),
  level: $("#crossyLevel"),
  finalScore: $("#crossyFinalScore"),
  gameOverScreen: $("#crossyGameOver"),
  status: $("#crossyStatus"),
  startButton: $("#crossyStartButton"),
  resetButton: $("#crossyResetButton"),
  cols: 9,
  rows: 11,
  player: { x: 4, y: 10 },
  cars: [],
  obstacles: [],
  scoreValue: 0,
  bestValue: 0,
  levelValue: 1,
  highestRow: 10,
  timer: null,
  running: false,
  gameOver: false,
};

const gamesGrid = $("#gamesGrid");
const gameCards = document.querySelectorAll("[data-game-card]");
const gameExpandedPanels = document.querySelectorAll("[data-game-expanded]");
let activeGame = "";
let activeLeaderboardGame = "";

const leaderboardGameLabels = {
  snake: "Snake",
  "click-rush": "Click Rush",
  wordle: "Wordle",
  crossy: "Crossy Road",
  memory: "Memory Match",
  dodge: "Orbit Dodge",
};

const publicHandleFromPath = () => {
  const match = location.pathname.match(/^\/u\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : "";
};

const isPublicProfilePage = Boolean(publicHandleFromPath());
const isResetPasswordPage = location.pathname === "/reset-password";

if (isPublicProfilePage) {
  document.body.classList.remove("landing-active");
  document.body.classList.add("public-profile", "previewing");
  $("#previewToolbar").hidden = true;
}

function updateThemeButtons() {
  document.querySelectorAll(".editor .swatch").forEach((swatch) => {
    swatch.classList.toggle("active", swatch.dataset.theme === profileTheme);
  });

  dashboardAppearanceButtons.forEach((button) => {
    const isActive = button.dataset.dashboardAppearance === dashboardAppearance;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-checked", String(isActive));
  });

  dashboardThemeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.dashboardTheme === dashboardTheme);
  });
}

function applyDashboardAppearance() {
  document.body.dataset.appearance = dashboardAppearance;
  updateThemeButtons();
}

function applyThemeForCurrentSection() {
  const section = document.body.dataset.accountSection;
  const nextTheme = !isPublicProfilePage && section !== "bio" ? dashboardTheme : profileTheme;
  document.body.dataset.theme = nextTheme;
  updateThemeButtons();
}

function syncDashboardAudioState() {
  const audio = $("#backgroundMusic");
  const section = document.body.dataset.accountSection;
  const shouldMute = !isPublicProfilePage && section !== "bio" && dashboardMusicMutedOutsideBio;
  if (audio) audio.muted = shouldMute;

  const muteButton = $("#dashboardMuteButton");
  if (muteButton) {
    muteButton.classList.toggle("active", dashboardMusicMutedOutsideBio);
    muteButton.setAttribute("aria-pressed", String(dashboardMusicMutedOutsideBio));
    muteButton.textContent = dashboardMusicMutedOutsideBio ? "Muted outside Bio" : "Mute outside Bio";
  }
}

function syncSidebarCollapsedState() {
  document.body.classList.toggle("sidebar-collapsed", sidebarCollapsed);

  const collapseButton = $("#sidebarCollapseButton");
  const collapseIcon = $("#sidebarCollapseIcon");
  const label = sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar";

  if (collapseButton) {
    collapseButton.setAttribute("aria-expanded", String(!sidebarCollapsed));
    collapseButton.setAttribute("aria-label", label);
    collapseButton.title = label;
  }

  if (collapseIcon) {
    collapseIcon.textContent = sidebarCollapsed ? ">" : "<";
  }
}

const isOwnerAccount = () => Boolean(accountState.isOwner);

const syncOwnerPanelAccess = () => {
  const isOwner = isOwnerAccount();
  if (ownerPanel.button) ownerPanel.button.hidden = !isOwner;
  if (!isOwner && document.body.dataset.accountSection === "owner") setDashboardSection("home");
};

const setDashboardSection = (section) => {
  const requestedSection = isPublicProfilePage ? "bio" : section;
  const nextSection = requestedSection === "owner" && !isOwnerAccount() ? "home" : requestedSection;
  document.body.dataset.accountSection = nextSection;
  applyThemeForCurrentSection();
  syncDashboardAudioState();

  dashboardPanels.forEach((panel) => {
    panel.hidden = panel.dataset.dashboardPanel !== nextSection;
  });

  dashboardButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.dashboardTarget === nextSection);
  });

  if (nextSection === "games") {
    loadSnakeBestScore();
    loadClickRushBestScore();
  }

  if (nextSection === "leaderboards") {
    loadSnakeBestScore();
    loadClickRushBestScore();
    loadCrossyBestScore();
    loadLeaderboards({ silent: true });
  }

  if (nextSection === "settings") {
    updateSettingsDetails();
  }

  if (nextSection === "owner") {
    loadOwnerUsers({ silent: true });
  }
};

applyDashboardAppearance();
setDashboardSection(isPublicProfilePage ? "bio" : "home");
syncSidebarCollapsedState();

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.16 }
  );
  landingRevealItems.forEach((item) => revealObserver.observe(item));
} else {
  landingRevealItems.forEach((item) => item.classList.add("revealed"));
}

const cleanHandle = (value) =>
  value
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 24);

const socialLabels = {
  discord: "Discord",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X",
  github: "GitHub",
};

const cleanSocialHandle = (value) =>
  value
    .trim()
    .replace(/^@+/, "")
    .replace(/^\/+/, "");

const isFullUrl = (value) => /^(https?:)?\/\//i.test(value);
const looksLikeDomain = (value) => /^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(value);

const socialUrlFor = (platform, value) => {
  const raw = value.trim();
  if (!raw) return "";
  if (isFullUrl(raw)) return raw.startsWith("//") ? `https:${raw}` : raw;
  if (looksLikeDomain(raw)) return `https://${raw}`;

  const handle = cleanSocialHandle(raw);
  if (!handle) return "";

  const encoded = encodeURIComponent(handle);
  const routes = {
    discord: `https://discord.com/users/${encoded}`,
    instagram: `https://www.instagram.com/${encoded}`,
    tiktok: `https://www.tiktok.com/@${encoded}`,
    youtube: `https://www.youtube.com/${raw.trim().startsWith("@") ? raw.trim() : `@${handle}`}`,
    x: `https://x.com/${encoded}`,
    github: `https://github.com/${encoded}`,
  };

  return routes[platform] || "";
};

const collectSocialLinks = () =>
  Object.fromEntries(
    Object.entries(socialInputs).map(([platform, input]) => [platform, input.value.trim()])
  );

const applySocialInputs = (links = {}) => {
  Object.entries(socialInputs).forEach(([platform, input]) => {
    input.value = links[platform] || "";
  });
};

const syncSocialLinks = () => {
  const socials = $("#socials");
  let activeCount = 0;

  Object.entries(socialInputs).forEach(([platform, input]) => {
    const link = socials.querySelector(`[data-social="${platform}"]`);
    const url = socialUrlFor(platform, input.value);
    if (!link || !url) {
      if (link) link.hidden = true;
      return;
    }

    activeCount += 1;
    link.hidden = false;
    link.href = url;
    link.setAttribute("aria-label", socialLabels[platform]);
    link.title = socialLabels[platform];
  });

  socials.classList.toggle("is-empty", activeCount === 0);
};

const showToast = (message) => {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1700);
};

const localSnakeScoreKey = () => `funlol-snake-best:${auth.email.value.trim().toLowerCase() || "local"}`;
const localClickRushScoreKey = () => `funlol-click-rush-best:${auth.email.value.trim().toLowerCase() || "local"}`;
const localCrossyScoreKey = () => `funlol-crossy-best:${auth.email.value.trim().toLowerCase() || "local"}`;

const drawSnake = () => {
  const canvas = snake.canvas;
  const context = canvas.getContext("2d");
  const cell = canvas.width / snake.gridSize;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#020204";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "rgba(255, 255, 255, 0.045)";
  context.lineWidth = 1;
  for (let index = 1; index < snake.gridSize; index += 1) {
    const line = index * cell;
    context.beginPath();
    context.moveTo(line, 0);
    context.lineTo(line, canvas.height);
    context.moveTo(0, line);
    context.lineTo(canvas.width, line);
    context.stroke();
  }

  context.fillStyle = "#f5f7fb";
  context.shadowColor = "rgba(255, 255, 255, 0.9)";
  context.shadowBlur = 16;
  context.beginPath();
  context.arc((snake.apple.x + 0.5) * cell, (snake.apple.y + 0.5) * cell, cell * 0.28, 0, Math.PI * 2);
  context.fill();

  snake.snake.forEach((segment, index) => {
    const inset = index === 0 ? 2 : 3.5;
    context.fillStyle = index === 0 ? "#ffffff" : "rgba(255, 255, 255, 0.78)";
    context.shadowColor = "rgba(255, 255, 255, 0.55)";
    context.shadowBlur = index === 0 ? 18 : 10;
    context.beginPath();
    context.roundRect(segment.x * cell + inset, segment.y * cell + inset, cell - inset * 2, cell - inset * 2, 6);
    context.fill();
  });

  context.shadowBlur = 0;
};

const randomSnakeCell = () => ({
  x: Math.floor(Math.random() * snake.gridSize),
  y: Math.floor(Math.random() * snake.gridSize),
});

const placeSnakeApple = () => {
  let nextApple = randomSnakeCell();
  while (snake.snake.some((segment) => segment.x === nextApple.x && segment.y === nextApple.y)) {
    nextApple = randomSnakeCell();
  }
  snake.apple = nextApple;
};

const updateSnakeScore = (score) => {
  snake.scoreValue = score;
  snake.score.textContent = String(score);
};

const updateSnakeBest = (score) => {
  snake.bestValue = Math.max(0, Number(score || 0));
  snake.best.textContent = String(snake.bestValue);
  localStorage.setItem(localSnakeScoreKey(), String(snake.bestValue));
  renderProfileBadges();
  renderDashboardInsights();
};

const loadSnakeBestScore = async () => {
  updateSnakeBest(Number(localStorage.getItem(localSnakeScoreKey()) || 0));
  if (!sessionToken || isPublicProfilePage) return;

  try {
    const response = await fetch("/api/games/snake-score", { headers: authHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load score");
    updateSnakeBest(data.highScore);
  } catch {
    snake.status.textContent = "Best score is saved on this device.";
  }
};

const saveSnakeBestScore = async () => {
  if (snake.scoreValue <= snake.bestValue) return;
  updateSnakeBest(snake.scoreValue);
  snake.status.textContent = "New best saved.";

  if (!sessionToken || isPublicProfilePage) return;

  try {
    const response = await fetch("/api/games/snake-score", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ score: snake.scoreValue }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not save score");
    updateSnakeBest(data.highScore);
    await loadLeaderboards({ silent: true });
  } catch {
    snake.status.textContent = "New best saved on this device.";
  }
};

const resetSnake = () => {
  snake.snake = [{ x: 9, y: 9 }];
  snake.direction = { x: 1, y: 0 };
  snake.nextDirection = { x: 1, y: 0 };
  snake.gameOver = false;
  snake.gameOverScreen.hidden = true;
  updateSnakeScore(0);
  placeSnakeApple();
  snake.status.textContent = "Use arrow keys, WASD, or swipe.";
  drawSnake();
};

const stopSnake = () => {
  clearInterval(snake.timer);
  snake.timer = null;
  snake.running = false;
  snake.paused = false;
  snake.startButton.textContent = "Start";
  snake.pauseButton.textContent = "Pause";
};

const endSnakeGame = async () => {
  stopSnake();
  snake.gameOver = true;
  snake.finalScore.textContent = String(snake.scoreValue);
  snake.gameOverScreen.hidden = false;
  snake.startButton.textContent = "Restart";
  snake.status.textContent = `Game over. Score - ${snake.scoreValue}.`;
  await saveSnakeBestScore();
};

const stepSnake = () => {
  if (!snake.running || snake.paused || snake.gameOver) return;

  snake.direction = snake.nextDirection;
  const head = snake.snake[0];
  const nextHead = {
    x: head.x + snake.direction.x,
    y: head.y + snake.direction.y,
  };

  const hitWall =
    nextHead.x < 0 || nextHead.x >= snake.gridSize || nextHead.y < 0 || nextHead.y >= snake.gridSize;
  const hitBody = snake.snake.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);
  if (hitWall || hitBody) {
    endSnakeGame();
    return;
  }

  snake.snake.unshift(nextHead);
  if (nextHead.x === snake.apple.x && nextHead.y === snake.apple.y) {
    updateSnakeScore(snake.scoreValue + 1);
    if (snake.scoreValue > snake.bestValue) saveSnakeBestScore();
    placeSnakeApple();
  } else {
    snake.snake.pop();
  }

  drawSnake();
};

const startSnake = () => {
  if (snake.gameOver || (snake.running && !snake.paused)) {
    resetSnake();
  }

  if (!snake.running) {
    snake.running = true;
    snake.paused = false;
    snake.startButton.textContent = "Restart";
    snake.status.textContent = "Playing";
    clearInterval(snake.timer);
    snake.timer = setInterval(stepSnake, 125);
    return;
  }

  if (snake.paused) {
    snake.paused = false;
    snake.pauseButton.textContent = "Pause";
    snake.status.textContent = "Playing";
    snake.timer = setInterval(stepSnake, 125);
  }
};

const pauseSnake = () => {
  if (!snake.running || snake.gameOver) return;

  if (snake.paused) {
    startSnake();
    return;
  }

  clearInterval(snake.timer);
  snake.timer = null;
  snake.paused = true;
  snake.pauseButton.textContent = "Resume";
  snake.status.textContent = "Paused";
};

const setSnakeDirection = (x, y) => {
  if (snake.direction.x + x === 0 && snake.direction.y + y === 0) return;
  snake.nextDirection = { x, y };
};

const updateClickRushScore = (score) => {
  clickRush.scoreValue = score;
  clickRush.score.textContent = String(score);
};

const updateClickRushBest = (score) => {
  clickRush.bestValue = Math.max(0, Number(score || 0));
  clickRush.best.textContent = String(clickRush.bestValue);
  localStorage.setItem(localClickRushScoreKey(), String(clickRush.bestValue));
};

const loadClickRushBestScore = () => {
  updateClickRushBest(Number(localStorage.getItem(localClickRushScoreKey()) || 0));
};

const saveClickRushBestScore = () => {
  if (clickRush.scoreValue > clickRush.bestValue) {
    updateClickRushBest(clickRush.scoreValue);
  }
};

const moveClickRushTarget = () => {
  clickRush.target.style.left = `${10 + Math.random() * 80}%`;
  clickRush.target.style.top = `${10 + Math.random() * 80}%`;
};

const stopClickRush = () => {
  clearInterval(clickRush.timer);
  clickRush.timer = null;
  clickRush.running = false;
  clickRush.startButton.textContent = "Start";
};

const resetClickRush = () => {
  stopClickRush();
  updateClickRushScore(0);
  clickRush.timeValue = 15;
  clickRush.time.textContent = String(clickRush.timeValue);
  clickRush.gameOverScreen.hidden = true;
  clickRush.status.textContent = "Click the glowing dot before time runs out.";
  moveClickRushTarget();
};

const endClickRush = () => {
  stopClickRush();
  clickRush.finalScore.textContent = String(clickRush.scoreValue);
  clickRush.gameOverScreen.hidden = false;
  clickRush.startButton.textContent = "Restart";
  clickRush.status.textContent = `Time up. Score - ${clickRush.scoreValue}.`;
  saveClickRushBestScore();
};

const startClickRush = () => {
  resetClickRush();
  clickRush.running = true;
  clickRush.startButton.textContent = "Restart";
  clickRush.status.textContent = "Playing";
  clickRush.timer = setInterval(() => {
    clickRush.timeValue -= 1;
    clickRush.time.textContent = String(clickRush.timeValue);
    if (clickRush.timeValue <= 0) endClickRush();
  }, 1000);
};

const buildWordleBoard = () => {
  wordle.board.innerHTML = "";
  for (let row = 0; row < wordle.maxRows; row += 1) {
    const rowElement = document.createElement("div");
    rowElement.className = "wordle-row";
    for (let col = 0; col < wordle.size; col += 1) {
      const tile = document.createElement("span");
      tile.className = "wordle-tile";
      rowElement.append(tile);
    }
    wordle.board.append(rowElement);
  }
};

const setWordleStats = () => {
  wordle.try.textContent = String(Math.min(wordle.row + 1, wordle.maxRows));
  wordle.left.textContent = String(Math.max(0, wordle.maxRows - wordle.row));
};

const resetWordle = () => {
  wordle.target = wordleDictionaryWords[Math.floor(Math.random() * wordleDictionaryWords.length)];
  wordle.row = 0;
  wordle.complete = false;
  wordle.input.value = "";
  wordle.input.disabled = false;
  wordle.status.textContent = wordleDictionaryLoaded
    ? "Guess any 5 letter English word."
    : "Loading the full word list.";
  buildWordleBoard();
  setWordleStats();
  if (activeGame === "wordle") wordle.input.focus();
};

const scoreWordleGuess = (guess) => {
  const result = Array(wordle.size).fill("absent");
  const remaining = {};

  for (let index = 0; index < wordle.size; index += 1) {
    const targetLetter = wordle.target[index];
    if (guess[index] === targetLetter) {
      result[index] = "correct";
    } else {
      remaining[targetLetter] = (remaining[targetLetter] || 0) + 1;
    }
  }

  for (let index = 0; index < wordle.size; index += 1) {
    const letter = guess[index];
    if (result[index] === "correct" || !remaining[letter]) continue;
    result[index] = "present";
    remaining[letter] -= 1;
  }

  return result;
};

const submitWordleGuess = () => {
  if (wordle.complete) return;

  const guess = wordle.input.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, wordle.size);
  wordle.input.value = guess;

  if (guess.length !== wordle.size) {
    wordle.status.textContent = "Enter 5 letters first.";
    return;
  }

  if (!wordleDictionarySet.has(guess)) {
    wordle.status.textContent = "That is not in the word list.";
    wordle.input.select();
    return;
  }

  const rowElement = wordle.board.children[wordle.row];
  const result = scoreWordleGuess(guess);
  [...rowElement.children].forEach((tile, index) => {
    tile.textContent = guess[index];
    tile.classList.add(result[index]);
  });

  wordle.row += 1;
  wordle.input.value = "";
  setWordleStats();

  if (guess === wordle.target) {
    wordle.complete = true;
    wordle.input.disabled = true;
    wordle.status.textContent = `You got it in ${wordle.row} ${wordle.row === 1 ? "try" : "tries"}.`;
    return;
  }

  if (wordle.row >= wordle.maxRows) {
    wordle.complete = true;
    wordle.input.disabled = true;
    wordle.status.textContent = `Out of tries. Word was ${wordle.target}.`;
    return;
  }

  wordle.status.textContent = "Keep guessing.";
};

const updateCrossyScore = (score) => {
  crossy.scoreValue = score;
  crossy.score.textContent = String(score);
  if (score > crossy.bestValue) {
    crossy.bestValue = score;
    crossy.best.textContent = String(score);
    localStorage.setItem(localCrossyScoreKey(), String(score));
  }
};

const loadCrossyBestScore = () => {
  crossy.bestValue = Number(localStorage.getItem(localCrossyScoreKey()) || 0);
  crossy.best.textContent = String(crossy.bestValue);
};

const updateCrossyLevel = (level) => {
  crossy.levelValue = Math.max(1, Number(level || 1));
  crossy.level.textContent = String(crossy.levelValue);
};

const crossySpeedMultiplier = () => 1 + (crossy.levelValue - 1) * 0.18;

const isCrossyObstacle = (x, y) =>
  crossy.obstacles.some((obstacle) => obstacle.x === x && obstacle.y === y);

const createCrossyObstacles = () => {
  const patterns = [
    [
      { x: 1, y: 3 },
      { x: 6, y: 3 },
      { x: 3, y: 6 },
      { x: 7, y: 6 },
      { x: 2, y: 0 },
    ],
    [
      { x: 2, y: 3 },
      { x: 7, y: 3 },
      { x: 1, y: 6 },
      { x: 5, y: 6 },
      { x: 6, y: 0 },
    ],
    [
      { x: 0, y: 3 },
      { x: 4, y: 3 },
      { x: 8, y: 3 },
      { x: 2, y: 6 },
      { x: 6, y: 6 },
      { x: 4, y: 0 },
    ],
  ];
  crossy.obstacles = patterns[(crossy.levelValue - 1) % patterns.length];
};

const createCrossyCars = () => {
  const laneRows = [1, 2, 4, 5, 7, 8];
  crossy.cars = laneRows.flatMap((row, laneIndex) => {
    const direction = laneIndex % 2 === 0 ? 1 : -1;
    const speed = 0.045 + laneIndex * 0.006;
    return Array.from({ length: 2 }, (_, carIndex) => ({
      x: (carIndex * 4 + laneIndex * 1.35) % crossy.cols,
      y: row,
      width: laneIndex % 3 === 0 ? 1.6 : 1.25,
      direction,
      speed,
    }));
  });
};

const drawCrossy = () => {
  const context = crossy.canvas.getContext("2d");
  const cellWidth = crossy.canvas.width / crossy.cols;
  const cellHeight = crossy.canvas.height / crossy.rows;

  context.clearRect(0, 0, crossy.canvas.width, crossy.canvas.height);

  for (let row = 0; row < crossy.rows; row += 1) {
    const safeRow = row === 0 || row === 3 || row === 6 || row === crossy.rows - 1;
    context.fillStyle = safeRow ? "rgba(255, 255, 255, 0.07)" : "rgba(255, 255, 255, 0.025)";
    context.fillRect(0, row * cellHeight, crossy.canvas.width, cellHeight);
    context.strokeStyle = "rgba(255, 255, 255, 0.045)";
    context.beginPath();
    context.moveTo(0, row * cellHeight);
    context.lineTo(crossy.canvas.width, row * cellHeight);
    context.stroke();
  }

  crossy.obstacles.forEach((obstacle) => {
    const x = obstacle.x * cellWidth + cellWidth * 0.16;
    const y = obstacle.y * cellHeight + cellHeight * 0.16;
    const size = Math.min(cellWidth, cellHeight) * 0.68;
    context.fillStyle = "rgba(255, 255, 255, 0.18)";
    context.shadowColor = "rgba(255, 255, 255, 0.32)";
    context.shadowBlur = 10;
    context.beginPath();
    context.roundRect(x, y, size, size, 8);
    context.fill();
    context.strokeStyle = "rgba(255, 255, 255, 0.34)";
    context.stroke();
  });

  crossy.cars.forEach((car, index) => {
    const x = car.x * cellWidth;
    const y = car.y * cellHeight + cellHeight * 0.18;
    const width = car.width * cellWidth;
    const height = cellHeight * 0.64;
    context.fillStyle = index % 2 === 0 ? "#ffffff" : "rgba(255, 255, 255, 0.72)";
    context.shadowColor = "rgba(255, 255, 255, 0.55)";
    context.shadowBlur = 14;
    context.beginPath();
    context.roundRect(x, y, width, height, 8);
    context.fill();
  });

  context.shadowBlur = 0;
  context.fillStyle = "#ffffff";
  context.shadowColor = "rgba(255, 255, 255, 0.95)";
  context.shadowBlur = 18;
  context.beginPath();
  context.arc(
    (crossy.player.x + 0.5) * cellWidth,
    (crossy.player.y + 0.5) * cellHeight,
    Math.min(cellWidth, cellHeight) * 0.32,
    0,
    Math.PI * 2
  );
  context.fill();
  context.shadowBlur = 0;
};

const stopCrossy = () => {
  clearInterval(crossy.timer);
  crossy.timer = null;
  crossy.running = false;
  crossy.startButton.textContent = "Start";
};

const resetCrossy = () => {
  stopCrossy();
  loadCrossyBestScore();
  crossy.player = { x: Math.floor(crossy.cols / 2), y: crossy.rows - 1 };
  crossy.highestRow = crossy.rows - 1;
  crossy.gameOver = false;
  crossy.gameOverScreen.hidden = true;
  updateCrossyLevel(1);
  crossy.status.textContent = "Use arrow keys, WASD, or swipe to cross.";
  updateCrossyScore(0);
  createCrossyObstacles();
  createCrossyCars();
  drawCrossy();
};

const endCrossy = () => {
  stopCrossy();
  crossy.gameOver = true;
  crossy.finalScore.textContent = String(crossy.scoreValue);
  crossy.gameOverScreen.hidden = false;
  crossy.startButton.textContent = "Restart";
  crossy.status.textContent = `Game over. Score - ${crossy.scoreValue}.`;
};

const checkCrossyCollision = () => {
  const playerLeft = crossy.player.x + 0.18;
  const playerRight = crossy.player.x + 0.82;
  return crossy.cars.some((car) => {
    if (car.y !== crossy.player.y) return false;
    return playerRight > car.x && playerLeft < car.x + car.width;
  });
};

const stepCrossy = () => {
  if (!crossy.running || crossy.gameOver) return;

  crossy.cars.forEach((car) => {
    car.x += car.speed * crossySpeedMultiplier() * car.direction;
    if (car.direction > 0 && car.x > crossy.cols + 0.35) car.x = -car.width - 0.35;
    if (car.direction < 0 && car.x < -car.width - 0.35) car.x = crossy.cols + 0.35;
  });

  if (checkCrossyCollision()) {
    endCrossy();
    drawCrossy();
    return;
  }

  drawCrossy();
};

const startCrossy = () => {
  if (crossy.running || crossy.gameOver) resetCrossy();
  crossy.running = true;
  crossy.startButton.textContent = "Restart";
  crossy.status.textContent = "Cross the roads.";
  clearInterval(crossy.timer);
  crossy.timer = setInterval(stepCrossy, 70);
};

const moveCrossyPlayer = (x, y) => {
  if (crossy.gameOver) return;
  if (!crossy.running) startCrossy();

  const nextPlayer = {
    x: Math.max(0, Math.min(crossy.cols - 1, crossy.player.x + x)),
    y: Math.max(0, Math.min(crossy.rows - 1, crossy.player.y + y)),
  };

  if (isCrossyObstacle(nextPlayer.x, nextPlayer.y)) {
    crossy.status.textContent = "That safe spot is blocked.";
    drawCrossy();
    return;
  }

  crossy.player = nextPlayer;

  if (crossy.player.y < crossy.highestRow) {
    const rowsCrossed = crossy.highestRow - crossy.player.y;
    crossy.highestRow = crossy.player.y;
    updateCrossyScore(crossy.scoreValue + rowsCrossed);
  }

  if (crossy.player.y === 0) {
    updateCrossyLevel(crossy.levelValue + 1);
    crossy.status.textContent = `Level ${crossy.levelValue}. Traffic is faster.`;
    crossy.player = { x: Math.floor(crossy.cols / 2), y: crossy.rows - 1 };
    crossy.highestRow = crossy.rows - 1;
    createCrossyObstacles();
    createCrossyCars();
  }

  if (checkCrossyCollision()) {
    endCrossy();
  }
  drawCrossy();
};

const openGame = (game) => {
  activeGame = game;
  gamesGrid.classList.add("has-expanded");
  gameCards.forEach((card) => {
    card.classList.toggle("expanded", card.dataset.gameCard === game);
  });
  gameExpandedPanels.forEach((panel) => {
    panel.hidden = panel.dataset.gameExpanded !== game;
  });

  if (game === "snake") {
    loadSnakeBestScore();
    drawSnake();
  }

  if (game === "click-rush") {
    loadClickRushBestScore();
    resetClickRush();
  }

  if (game === "wordle") {
    resetWordle();
  }

  if (game === "crossy") {
    resetCrossy();
  }
};

const closeActiveGame = () => {
  activeGame = "";
  gamesGrid.classList.remove("has-expanded");
  gameCards.forEach((card) => card.classList.remove("expanded"));
  gameExpandedPanels.forEach((panel) => {
    panel.hidden = true;
  });
  stopSnake();
  stopClickRush();
  stopCrossy();
};

document.querySelectorAll("[data-open-game]").forEach((button) => {
  button.addEventListener("click", () => openGame(button.dataset.openGame));
});

document.querySelectorAll("[data-close-game]").forEach((button) => {
  button.addEventListener("click", closeActiveGame);
});

document.querySelectorAll("[data-leaderboard-game]").forEach((button) => {
  button.addEventListener("click", () => openLeaderboard(button.dataset.leaderboardGame));
});

leaderboardView.backButton?.addEventListener("click", closeLeaderboardDetail);

snake.startButton.addEventListener("click", startSnake);
snake.pauseButton.addEventListener("click", pauseSnake);
clickRush.startButton.addEventListener("click", startClickRush);
clickRush.resetButton.addEventListener("click", resetClickRush);
clickRush.target.addEventListener("click", () => {
  if (!clickRush.running) return;
  updateClickRushScore(clickRush.scoreValue + 1);
  moveClickRushTarget();
});
wordle.guessButton.addEventListener("click", submitWordleGuess);
wordle.resetButton.addEventListener("click", resetWordle);
wordle.input.addEventListener("input", () => {
  wordle.input.value = wordle.input.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, wordle.size);
});
wordle.input.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  submitWordleGuess();
});
crossy.startButton.addEventListener("click", startCrossy);
crossy.resetButton.addEventListener("click", resetCrossy);

document.addEventListener("keydown", (event) => {
  if (document.body.dataset.accountSection !== "games") return;

  const directions = {
    ArrowUp: [0, -1],
    w: [0, -1],
    W: [0, -1],
    ArrowDown: [0, 1],
    s: [0, 1],
    S: [0, 1],
    ArrowLeft: [-1, 0],
    a: [-1, 0],
    A: [-1, 0],
    ArrowRight: [1, 0],
    d: [1, 0],
    D: [1, 0],
  };

  const direction = directions[event.key];
  if (!direction) return;
  const isSnakeActive = activeGame === "snake";
  const isCrossyActive = activeGame === "crossy";
  if (!isSnakeActive && !isCrossyActive) return;

  event.preventDefault();
  if (isSnakeActive) {
    if (snake.gameOver) return;
    setSnakeDirection(direction[0], direction[1]);
    if (!snake.running) startSnake();
  }

  if (isCrossyActive) {
    moveCrossyPlayer(direction[0], direction[1]);
  }
});

const directionFromSwipe = (start, end) => {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const distance = Math.max(Math.abs(deltaX), Math.abs(deltaY));
  if (distance < 24) return null;
  return Math.abs(deltaX) > Math.abs(deltaY)
    ? [deltaX > 0 ? 1 : -1, 0]
    : [0, deltaY > 0 ? 1 : -1];
};

const addSwipeGameControls = (target, onDirection) => {
  if (!target) return;
  let swipeStart = null;

  target.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") return;
    swipeStart = { x: event.clientX, y: event.clientY };
    target.setPointerCapture?.(event.pointerId);
  });

  target.addEventListener("pointerup", (event) => {
    if (!swipeStart || event.pointerType === "mouse") return;
    const direction = directionFromSwipe(swipeStart, { x: event.clientX, y: event.clientY });
    swipeStart = null;
    if (!direction) return;
    event.preventDefault();
    onDirection(direction);
  });

  target.addEventListener("pointercancel", () => {
    swipeStart = null;
  });
};

addSwipeGameControls(snake.canvas, ([x, y]) => {
  if (document.body.dataset.accountSection !== "games" || activeGame !== "snake" || snake.gameOver) return;
  setSnakeDirection(x, y);
  if (!snake.running) startSnake();
});

addSwipeGameControls(crossy.canvas, ([x, y]) => {
  if (document.body.dataset.accountSection !== "games" || activeGame !== "crossy") return;
  moveCrossyPlayer(x, y);
});

const gameDirectionMap = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

document.querySelectorAll("[data-game-control]").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = gameDirectionMap[button.dataset.direction];
    if (!direction || document.body.dataset.accountSection !== "games") return;
    const [x, y] = direction;
    if (button.dataset.gameControl === "snake" && activeGame === "snake" && !snake.gameOver) {
      setSnakeDirection(x, y);
      if (!snake.running) startSnake();
    }
    if (button.dataset.gameControl === "crossy" && activeGame === "crossy") {
      moveCrossyPlayer(x, y);
    }
  });
});

resetSnake();
loadWordleDictionary();
resetWordle();
resetCrossy();

const setAuthMessage = (message) => {
  auth.message.textContent = message;
};

const setForgotPasswordMessage = (message) => {
  auth.forgotMessage.textContent = message;
};

const setResetPasswordMessage = (message) => {
  auth.resetMessage.textContent = message;
};

const setAuthScreenMode = (mode = "signup") => {
  const isForgot = mode === "forgot";
  const isReset = mode === "reset";
  auth.form.hidden = isForgot || isReset;
  auth.forgotForm.hidden = !isForgot;
  auth.resetForm.hidden = !isReset;

  const titles = {
    login: "Welcome back",
    signup: "Make your profile",
    forgot: "Reset access",
    reset: "New password",
  };
  auth.title.textContent = titles[mode] || titles.signup;
};

const showAuthShell = () => {
  document.body.classList.remove("landing-active", "loading");
  hideEntryGate();
  exitPreview();
  document.body.classList.add("auth-required");
};

const showForgotPassword = () => {
  if (isPublicProfilePage) return;
  showAuthShell();
  setAuthScreenMode("forgot");
  auth.forgotEmail.value = auth.email.value.trim();
  setForgotPasswordMessage("Enter your email and we will send a secure reset link if the account exists.");
  auth.forgotEmail.focus();
};

const showResetPassword = () => {
  if (isPublicProfilePage) return;
  showAuthShell();
  setAuthScreenMode("reset");
  document.title = "Reset Password | slapz.lol";
  setResetPasswordMessage(
    resetPasswordToken ? "Enter a new password for your slapz.lol account." : "This reset link is missing a token."
  );
  auth.resetNewPassword.focus();
};

const setLoading = (percent, message) => {
  loadingPercent = Math.max(0, Math.min(100, percent));
  $("#loadingProgress").style.setProperty("--progress", `${loadingPercent}%`);
  if (message) $("#loadingText").textContent = message;
};

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

const startLoading = (message = "Loading...") => {
  clearInterval(loadingTimer);
  hideEntryGate();
  document.body.classList.remove("welcoming", "welcome-leaving", "owner-entering");
  document.body.classList.add("loading");
  setLoading(8, message);
  loadingTimer = setInterval(() => {
    if (loadingPercent < 88) setLoading(loadingPercent + 4);
  }, 180);
};

const finishLoading = async () => {
  clearInterval(loadingTimer);
  setLoading(100, "Ready");
  await wait(260);
  document.body.classList.remove("loading");
};

const playOwnerWelcome = async () => {
  if (isPublicProfilePage) return;

  hideEntryGate();
  document.body.classList.remove("landing-active", "auth-required", "previewing", "welcome-leaving", "owner-entering");
  document.body.classList.add("welcoming");
  await nextFrame();
  document.body.classList.remove("loading");
  await wait(1000);
  document.body.classList.remove("welcoming");
  document.body.classList.add("welcome-leaving", "owner-entering");
  await wait(1000);
  document.body.classList.remove("welcome-leaving", "owner-entering");
};

const finishLoadingIntoEditor = async ({ showWelcome = true } = {}) => {
  clearInterval(loadingTimer);
  setLoading(100, "Ready");
  await wait(260);
  setDashboardSection("home");
  document.body.classList.remove("landing-active", "auth-required");
  if (showWelcome) {
    await playOwnerWelcome();
  } else {
    document.body.classList.remove("loading");
  }
};

const showEditor = () => {
  clearInterval(loadingTimer);
  hideEntryGate();
  document.body.classList.remove("landing-active", "auth-required", "loading", "welcoming", "welcome-leaving", "owner-entering");
};

const showLanding = () => {
  if (isPublicProfilePage) return;
  clearInterval(loadingTimer);
  hideOnboarding();
  hideEntryGate();
  exitPreview();
  document.title = "slapz.lol | Custom Bio Pages, Friends, Tribes & Games";
  document.body.classList.remove("auth-required", "loading", "welcoming", "welcome-leaving", "owner-entering");
  document.body.classList.add("landing-active");
};

const showAuth = (mode = "signup") => {
  if (!isPublicProfilePage) {
    hideOnboarding();
    if (location.pathname === "/reset-password" && history.replaceState) history.replaceState(null, "", "/");
    showAuthShell();
    setAuthScreenMode(mode === "login" ? "login" : "signup");
    setAuthMessage(
      mode === "login"
        ? "Log in to continue editing your slapz.lol profile."
        : "Create an account to start editing your public profile."
    );
    auth.email.focus();
  }
};

const authHeaders = () => (sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {});

const collectDashboardSettings = () => ({
  dashboardAppearance: dashboardAppearanceValues.has(dashboardAppearance) ? dashboardAppearance : "dark",
  dashboardTheme: dashboardThemeValues.has(dashboardTheme) ? dashboardTheme : "black",
  dashboardMusicMutedOutsideBio: Boolean(dashboardMusicMutedOutsideBio),
  cursorMode: inputs.cursorTrail.value === "dot" ? "dot" : "normal",
  cursorColor: cursorColors.has(cursorColor) ? cursorColor : "white",
});

const saveDashboardSettingsNow = async () => {
  if (!sessionToken || isPublicProfilePage || applyingDashboardSettings) return;

  const response = await fetch("/api/me/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ dashboardSettings: collectDashboardSettings() }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not save account settings");
  if (data.dashboardSettings) accountState.dashboardSettings = data.dashboardSettings;
};

const queueDashboardSettingsSave = () => {
  if (!sessionToken || isPublicProfilePage || applyingDashboardSettings) return;
  clearTimeout(dashboardSettingsSaveTimer);
  dashboardSettingsSaveTimer = setTimeout(() => {
    saveDashboardSettingsNow().catch((error) => {
      console.warn("Could not save dashboard settings:", error.message);
    });
  }, 250);
};

const applyDashboardSettings = (settings = {}) => {
  if (!settings || typeof settings !== "object") return;
  applyingDashboardSettings = true;

  if (dashboardAppearanceValues.has(settings.dashboardAppearance)) {
    dashboardAppearance = settings.dashboardAppearance;
    localStorage.setItem(dashboardAppearanceKey, dashboardAppearance);
  }
  if (dashboardThemeValues.has(settings.dashboardTheme)) {
    dashboardTheme = settings.dashboardTheme;
    localStorage.setItem(dashboardThemeKey, dashboardTheme);
  }
  if (typeof settings.dashboardMusicMutedOutsideBio === "boolean") {
    dashboardMusicMutedOutsideBio = settings.dashboardMusicMutedOutsideBio;
    localStorage.setItem(dashboardMuteKey, String(dashboardMusicMutedOutsideBio));
  }
  if (cursorModeValues.has(settings.cursorMode) && typeof setCursorMode === "function") {
    setCursorMode(settings.cursorMode, { persistAccount: false });
  }
  if (cursorColors.has(settings.cursorColor) && typeof setCursorColor === "function") {
    setCursorColor(settings.cursorColor, { persistAccount: false });
  }

  applyDashboardAppearance();
  applyThemeForCurrentSection();
  syncDashboardAudioState();
  applyingDashboardSettings = false;
};

const onboardingLocalSkipKey = () => (accountState.userId ? `funlol:onboarding-skipped:${accountState.userId}` : "");

function hasLocalOnboardingSkip() {
  const key = onboardingLocalSkipKey();
  if (!key) return false;
  try {
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function setLocalOnboardingSkip(skipped) {
  const key = onboardingLocalSkipKey();
  if (!key) return;
  try {
    if (skipped) localStorage.setItem(key, "true");
    else localStorage.removeItem(key);
  } catch {
    // Local storage can be unavailable in private/restricted browser modes.
  }
}

const shouldShowOnboarding = () =>
  Boolean(
    !isPublicProfilePage &&
      sessionToken &&
      accountState.needsOnboarding &&
      !accountState.onboardingCompleted &&
      !accountState.onboardingSkipped &&
      !hasLocalOnboardingSkip()
  );

function renderOnboarding() {
  if (!onboarding.screen) return;
  const step = onboardingSteps[onboardingStep] || onboardingSteps[0];
  onboarding.stepText.textContent = `Step ${onboardingStep + 1} of ${onboardingSteps.length}`;
  onboarding.title.textContent = step.title;
  onboarding.body.textContent = step.body;
  onboarding.list.textContent = "";
  step.items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    onboarding.list.append(li);
  });

  onboarding.fields.hidden = !step.publish;
  onboarding.backButton.disabled = onboardingStep === 0;
  onboarding.nextButton.hidden = Boolean(step.publish);
  onboarding.publishButton.hidden = !step.publish;
  onboarding.progress.textContent = "";
  onboardingSteps.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.className = index === onboardingStep ? "active" : "";
    onboarding.progress.append(dot);
  });
}

function showOnboarding() {
  if (!onboarding.screen) return;
  onboardingStep = 0;
  onboarding.nameInput.value = inputs.name.value.trim();
  onboarding.handleInput.value = cleanHandle(inputs.handle.value || accountState.profileHandle);
  document.body.classList.add("onboarding-active");
  onboarding.screen.hidden = false;
  renderOnboarding();
}

function hideOnboarding() {
  document.body.classList.remove("onboarding-active");
  if (onboarding.screen) onboarding.screen.hidden = true;
}

async function saveOnboardingStatus(action) {
  const response = await fetch("/api/me/onboarding", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ action }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not save onboarding");
  updateAccountState(result);
  setLocalOnboardingSkip(Boolean(result.onboardingSkipped));
  return result;
}

async function skipOnboarding() {
  setLocalOnboardingSkip(true);
  updateAccountState({
    onboardingCompleted: false,
    onboardingSkipped: true,
    needsOnboarding: false,
  });
  hideOnboarding();
  showToast("Onboarding skipped");
  try {
    await saveOnboardingStatus("skip");
  } catch (error) {
    showToast("Skipped for now. Run the latest Supabase schema so it stays skipped everywhere.");
  }
}

function goToOnboardingPublish() {
  const displayName = onboarding.nameInput.value.trim();
  const handle = cleanHandle(onboarding.handleInput.value);
  if (!displayName) {
    showToast("Add a display name first");
    onboarding.nameInput.focus();
    return;
  }
  if (!handle) {
    showToast("Add a handle first");
    onboarding.handleInput.focus();
    return;
  }

  inputs.name.value = displayName;
  inputs.handle.value = handle;
  syncProfile();
  onboardingPublishPrompted = true;
  hideOnboarding();
  setDashboardSection("bio");
  showToast("Review your Bio, then press Publish profile to finish onboarding");
}

const submitAuth = async (mode) => {
  const email = auth.email.value.trim();
  const password = auth.password.value;
  setAuthMessage(mode === "signup" ? "Creating your account..." : "Logging in...");

  try {
    const response = await fetch(`/api/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      if (mode === "signup" && response.status === 409) {
        setAuthMessage("That email already exists. Trying to log you in...");
        return submitAuth("login");
      }
      throw new Error(data.error || "Could not sign in");
    }

    sessionToken = data.token;
    localStorage.setItem(sessionKey, sessionToken);
    auth.email.value = data.email;
    updateAccountState({ email: data.email });
    setAuthMessage(`Signed in as ${data.email}`);
    try {
      const detailsResponse = await fetch("/api/me", { headers: authHeaders() });
      const details = await detailsResponse.json();
      if (detailsResponse.ok) updateAccountState(details);
    } catch {
      updateSettingsDetails();
    }
    startLoading("Loading your profile...");
    await loadMyProfile();
    applyDashboardSettings(accountState.dashboardSettings);
    const showOnboardingAfterLoad = shouldShowOnboarding();
    await finishLoadingIntoEditor({ showWelcome: !showOnboardingAfterLoad });
    startFriendRefreshLoop();
    if (showOnboardingAfterLoad) showOnboarding();
  } catch (error) {
    document.body.classList.remove("loading");
    setAuthMessage(error.message);
  }
};

const submitForgotPassword = async () => {
  const email = auth.forgotEmail.value.trim();
  auth.sendResetButton.disabled = true;
  setForgotPasswordMessage("Sending reset link...");

  try {
    const response = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    setForgotPasswordMessage(
      data.message || "If an account exists for this email, a password reset link has been sent."
    );
  } catch {
    setForgotPasswordMessage("If an account exists for this email, a password reset link has been sent.");
  } finally {
    auth.sendResetButton.disabled = false;
  }
};

const submitResetPassword = async () => {
  const newPassword = auth.resetNewPassword.value;
  const confirmPassword = auth.resetConfirmPassword.value;

  if (!resetPasswordToken) {
    setResetPasswordMessage("This reset link is missing a token. Request a new reset link.");
    return;
  }

  if (newPassword.length < 6) {
    setResetPasswordMessage("Password must be at least 6 characters.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setResetPasswordMessage("Passwords do not match.");
    return;
  }

  auth.resetButton.disabled = true;
  setResetPasswordMessage("Resetting password...");

  try {
    const response = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resetPasswordToken, newPassword }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not reset password.");

    sessionToken = "";
    localStorage.removeItem(sessionKey);
    auth.resetNewPassword.value = "";
    auth.resetConfirmPassword.value = "";
    setResetPasswordMessage(data.message || "Password reset. You can log in with your new password.");
    if (history.replaceState) history.replaceState(null, "", "/");
  } catch (error) {
    setResetPasswordMessage(error.message);
  } finally {
    auth.resetButton.disabled = false;
  }
};

const tokenKeyForHandle = (handle) => `nightcard-owner-token:${handle}`;

const getOwnerToken = (handle) => {
  const key = tokenKeyForHandle(handle);
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
  }
  return token;
};

const updatePublicLink = () => {
  const handle = cleanHandle(inputs.handle.value) || "nightcard";
  const url = `/u/${handle}`;
  $("#publicLink").href = url;
  $("#publicLink").textContent = url;
};

const friendsStorageKey = () => {
  const owner = accountState.userId || accountState.email || "guest";
  return `funlol-friends:${owner}`;
};

const friendRequestsStorageKey = () => {
  const owner = accountState.userId || accountState.email || "guest";
  return `funlol-friend-requests:${owner}`;
};

const sentFriendRequestsStorageKey = () => {
  const owner = accountState.userId || accountState.email || "guest";
  return `funlol-sent-friend-requests:${owner}`;
};

const friendUrlFor = (value) => {
  const raw = value.trim();
  if (!raw) return "";
  if (isFullUrl(raw)) return raw.startsWith("//") ? `https:${raw}` : raw;
  if (raw.startsWith("/u/")) return raw;
  const handle = cleanHandle(raw);
  return handle ? `/u/${handle}` : raw;
};

const friendHandleFor = (value) => {
  const raw = value.trim();
  if (!raw) return "";
  try {
    const url = raw.startsWith("http") ? new URL(raw) : new URL(raw, location.origin);
    const match = url.pathname.match(/^\/u\/([^/]+)/);
    if (match) return cleanHandle(decodeURIComponent(match[1]));
  } catch {
    // Fall through to plain handle cleanup.
  }
  return cleanHandle(raw);
};

const makeFriendId = () => (crypto.randomUUID ? crypto.randomUUID() : `friend-${Date.now()}-${Math.random()}`);

const sanitizeFriend = (friend) => {
  const rawName = String(friend?.name || "").trim().slice(0, 32);
  const rawLink = String(friend?.link || friend?.url || friend?.handle || "").trim();
  const handle = friendHandleFor(rawLink);
  const link = friendUrlFor(rawLink || handle);
  const name = rawName || (handle ? `@${handle}` : "Friend");

  if (!link && !handle) return null;
  return {
    id: friend?.id || makeFriendId(),
    name,
    handle,
    link,
  };
};

const sanitizeFriends = (items = []) =>
  items
    .map(sanitizeFriend)
    .filter(Boolean)
    .filter((friend, index, list) => list.findIndex((item) => item.link === friend.link) === index)
    .slice(0, maxFriendCount);

const sanitizeFriendRequest = (request) => {
  const rawName = String(request?.fromName || request?.name || "").trim().slice(0, 32);
  const rawLink = String(request?.fromLink || request?.link || request?.fromHandle || request?.handle || "").trim();
  const fromHandle = friendHandleFor(rawLink || String(request?.fromHandle || ""));
  const fromLink = friendUrlFor(rawLink || fromHandle);
  const fromName = rawName || (fromHandle ? `@${fromHandle}` : "Friend request");

  if (!fromLink && !fromHandle) return null;
  return {
    id: String(request?.id || makeFriendId()),
    fromName,
    fromHandle,
    fromLink,
    createdAt: request?.createdAt || new Date().toISOString(),
  };
};

const sanitizeFriendRequests = (items = []) =>
  items
    .map(sanitizeFriendRequest)
    .filter(Boolean)
    .filter(
      (request, index, list) =>
        list.findIndex((item) => item.id === request.id || (item.fromHandle && item.fromHandle === request.fromHandle)) === index
    )
    .slice(0, 40);

const sanitizeSentFriendRequest = (request) => {
  const rawName = String(request?.targetName || request?.name || "").trim().slice(0, 32);
  const rawLink = String(request?.targetLink || request?.link || request?.targetHandle || request?.handle || "").trim();
  const targetHandle = friendHandleFor(rawLink || String(request?.targetHandle || ""));
  const targetLink = friendUrlFor(rawLink || targetHandle);
  const targetName = rawName || (targetHandle ? `@${targetHandle}` : "Friend request");

  if (!targetLink && !targetHandle) return null;
  return {
    id: String(request?.id || makeFriendId()),
    targetName,
    targetHandle,
    targetLink,
    createdAt: request?.createdAt || new Date().toISOString(),
  };
};

const sanitizeSentFriendRequests = (items = []) =>
  items
    .map(sanitizeSentFriendRequest)
    .filter(Boolean)
    .filter(
      (request, index, list) =>
        list.findIndex((item) => item.id === request.id || (item.targetHandle && item.targetHandle === request.targetHandle)) === index
    )
    .slice(0, 40);

const sanitizeAdminNotification = (notice) => {
  const message = String(notice?.message || "").trim().slice(0, 220);
  if (!message) return null;
  return {
    id: String(notice?.id || makeFriendId()),
    title: String(notice?.title || "Owner notice").trim().slice(0, 48),
    message,
    createdAt: notice?.createdAt || new Date().toISOString(),
  };
};

const sanitizeAdminNotifications = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map(sanitizeAdminNotification)
    .filter(Boolean)
    .slice(0, 40);

const sanitizeProfileTemplate = (value) => (profileTemplates[String(value || "").toLowerCase()] ? String(value).toLowerCase() : "dark");

const sanitizeStatus = (value) => {
  const allowed = new Set(["Online", "Chilling", "Gaming", "Busy", "Listening to music"]);
  const next = String(value || "Online").trim();
  return allowed.has(next) ? next : "Online";
};

const sanitizeBadges = (items = []) =>
  [...new Set((Array.isArray(items) ? items : []).map((item) => String(item || "").trim()).filter((item) => badgeOptions.includes(item)))]
    .slice(0, 6);

const selectedBadges = () =>
  sanitizeBadges([...document.querySelectorAll("#badgeOptionGrid input:checked:not(:disabled)")].map((input) => input.value));

const derivedUnlockedBadges = () => {
  const earned = new Set();
  const handle = cleanHandle(inputs.handle.value || accountState.profileHandle);
  if (accountState.profileHandle || handle) earned.add("Verified Profile");
  if ((inputs.name.value.trim() || "Nova") && handle) earned.add("Profile Creator");
  if (myTribes().some((tribe) => tribe.isOwner)) earned.add("Tribe Owner");
  if (friends.length > 100) earned.add("Top Friend");
  const ownLeaderboardIndex = leaderboards.global.findIndex(
    (row) => row.userId === accountState.userId || (handle && row.handle === handle)
  );
  if (ownLeaderboardIndex >= 0 && ownLeaderboardIndex < 25) earned.add("Game Champion");
  return sanitizeBadges([...earned]);
};

const currentUnlockedBadges = () => {
  const serverBadges = sanitizeBadges([...unlockedBadges]);
  return new Set(serverBadges.length ? serverBadges : derivedUnlockedBadges());
};

const selectedBadgeOptOuts = () => {
  const selected = new Set(selectedBadges());
  return sanitizeBadges([...currentUnlockedBadges()].filter((badge) => !selected.has(badge)));
};

const badgeUnlockHints = {
  "Early User": "Unlocked for the first 1000 accounts.",
  "Verified Profile": "Publish your public profile.",
  "Tribe Owner": "Create and own a tribe.",
  "Game Champion": "Reach the top 25 globally in a game leaderboard.",
  "Top Friend": "Add over 100 friends.",
  "Profile Creator": "Publish a basic profile with a display name and handle.",
};

const syncBadgeEditor = () => {
  const earned = currentUnlockedBadges();
  document.querySelectorAll("#badgeOptionGrid label").forEach((label) => {
    const input = label.querySelector("input");
    if (!input) return;
    const isUnlocked = earned.has(input.value);
    input.disabled = !isUnlocked;
    if (!isUnlocked) input.checked = false;
    label.classList.toggle("badge-locked", !isUnlocked);
    label.classList.toggle("badge-active", input.checked && isUnlocked);
    label.title = isUnlocked ? `${input.value} unlocked` : `Locked: ${badgeUnlockHints[input.value] || "Earn this badge first."}`;
  });
};

const applyBadgeInputs = (items = [], optOuts = []) => {
  const values = new Set(sanitizeBadges(items));
  const optedOut = new Set(sanitizeBadges(optOuts));
  currentUnlockedBadges().forEach((badge) => {
    if (!optedOut.has(badge)) values.add(badge);
  });
  document.querySelectorAll("#badgeOptionGrid input").forEach((input) => {
    input.checked = currentUnlockedBadges().has(input.value) && values.has(input.value);
  });
  syncBadgeEditor();
};

const sanitizeFeatured = (featured = {}) => ({
  type: ["status", "game", "song", "tribe", "friend"].includes(String(featured?.type || "")) ? String(featured.type) : "status",
  text: String(featured?.text || "").trim().slice(0, 80),
});

const sanitizeBestFriendHandles = (items = []) =>
  [...new Set((Array.isArray(items) ? items : []).map(cleanHandle).filter(Boolean))].slice(0, 8);

const sanitizeVisitorItems = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item) => ({
      label: String(item?.label || "Anonymous visitor").trim().slice(0, 28),
      viewedAt: item?.viewedAt || item?.createdAt || "",
    }))
    .filter((item) => item.viewedAt)
    .slice(0, 5);

const sanitizeUserSearchResult = (user = {}) => ({
  displayName: String(user?.displayName || user?.name || "slapz.lol user").trim().slice(0, 40),
  handle: cleanHandle(user?.handle || user?.profileHandle || ""),
  profilePath: String(user?.profilePath || (user?.handle ? `/u/${cleanHandle(user.handle)}` : "")),
  views: Number(user?.views || 0),
  friendCount: Number(user?.friendCount || 0),
  sharedTribeCount: Number(user?.sharedTribeCount || 0),
});

const sanitizeLeaderboardRows = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item) => ({
      displayName: String(item?.displayName || item?.name || "Player").trim().slice(0, 32),
      handle: cleanHandle(item?.handle || ""),
      score: Number(item?.score || item?.snakeHighScore || 0),
    }))
    .filter((item) => item.score > 0)
    .slice(0, 8);

const currentFeatured = () => sanitizeFeatured({ type: inputs.featuredType?.value, text: inputs.featuredText?.value });

const readFileAsDataUrl = (file, maxBytes = 1024 * 1024) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    if (file.size > maxBytes) {
      reject(new Error("Attachment is too large"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });

const sanitizeOwnerUser = (user) => ({
  userId: String(user?.userId || ""),
  email: String(user?.email || ""),
  createdAt: user?.createdAt || "",
  profileHandle: cleanHandle(user?.profileHandle || user?.handle || ""),
  profilePath: String(user?.profilePath || (user?.handle ? `/u/${cleanHandle(user.handle)}` : "")),
  displayName: String(user?.displayName || "No profile").trim().slice(0, 40),
  handle: cleanHandle(user?.handle || user?.profileHandle || ""),
  views: Number(user?.views || 0),
  updatedAt: user?.updatedAt || "",
  hasProfile: Boolean(user?.hasProfile),
  isOwner: Boolean(user?.isOwner),
  accountStatus: ["active", "suspended", "banned"].includes(String(user?.accountStatus || "").toLowerCase())
    ? String(user.accountStatus).toLowerCase()
    : "active",
  accountStatusUpdatedAt: user?.accountStatusUpdatedAt || "",
});

const sanitizeTribeColor = (color) => {
  const value = String(color || "").trim();
  return /^#[0-9a-f]{6}$/i.test(value) ? value : "#f5f7fb";
};

const sanitizeTribeMember = (member) => ({
  userId: String(member?.userId || ""),
  displayName: String(member?.displayName || member?.name || "Member").trim().slice(0, 32),
  handle: cleanHandle(member?.handle || ""),
  link: member?.link || (member?.handle ? `/u/${cleanHandle(member.handle)}` : ""),
  role: ["owner", "admin", "member"].includes(String(member?.role || "").toLowerCase()) ? String(member.role).toLowerCase() : "member",
});

const sanitizeTribe = (tribe) => ({
  tribeId: String(tribe?.tribeId || ""),
  name: String(tribe?.name || "Untitled tribe").trim().slice(0, 36),
  ownerId: String(tribe?.ownerId || ""),
  ownerDisplayName: String(tribe?.ownerDisplayName || "Owner").trim().slice(0, 32),
  ownerHandle: cleanHandle(tribe?.ownerHandle || ""),
  memberIds: Array.isArray(tribe?.memberIds) ? tribe.memberIds.map(String).filter(Boolean) : [],
  adminIds: Array.isArray(tribe?.adminIds) ? tribe.adminIds.map(String).filter(Boolean) : [],
  pendingInviteIds: Array.isArray(tribe?.pendingInviteIds) ? tribe.pendingInviteIds.map(String).filter(Boolean) : [],
  pendingJoinIds: Array.isArray(tribe?.pendingJoinIds) ? tribe.pendingJoinIds.map(String).filter(Boolean) : [],
  members: Array.isArray(tribe?.members) ? tribe.members.map(sanitizeTribeMember).filter((member) => member.userId) : [],
  themeColor: sanitizeTribeColor(tribe?.themeColor),
  visibility: ["public", "private", "invite-only"].includes(String(tribe?.visibility || "")) ? String(tribe.visibility) : "public",
  icon: String(tribe?.icon || "T").trim().slice(0, 4) || "T",
  bannerData: String(tribe?.bannerData || "").startsWith("data:image/") ? String(tribe.bannerData) : "",
  announcement: String(tribe?.announcement || "").trim().slice(0, 140),
  createdAt: tribe?.createdAt || "",
  updatedAt: tribe?.updatedAt || "",
  isOwner: Boolean(tribe?.isOwner),
  isAdmin: Boolean(tribe?.isAdmin),
  isMember: Boolean(tribe?.isMember),
  hasPendingJoin: Boolean(tribe?.hasPendingJoin),
});

const sanitizeTribeInvite = (invite) => ({
  id: String(invite?.id || ""),
  tribeId: String(invite?.tribeId || ""),
  tribeName: String(invite?.tribeName || "a tribe").trim().slice(0, 36),
  ownerId: String(invite?.ownerId || ""),
  ownerDisplayName: String(invite?.ownerDisplayName || "Someone").trim().slice(0, 32),
  ownerHandle: cleanHandle(invite?.ownerHandle || ""),
  createdAt: invite?.createdAt || "",
});

const sanitizeTribeJoinRequest = (request) => ({
  id: String(request?.id || ""),
  tribeId: String(request?.tribeId || ""),
  tribeName: String(request?.tribeName || "a tribe").trim().slice(0, 36),
  requesterId: String(request?.requesterId || ""),
  requesterDisplayName: String(request?.requesterDisplayName || "Someone").trim().slice(0, 32),
  requesterHandle: cleanHandle(request?.requesterHandle || ""),
  createdAt: request?.createdAt || "",
});

const sanitizeTribeMessage = (message) => ({
  id: String(message?.id || makeFriendId()),
  senderId: String(message?.senderId || ""),
  senderDisplayName: String(message?.senderDisplayName || "Member").trim().slice(0, 32),
  senderHandle: cleanHandle(message?.senderHandle || ""),
  text: String(message?.text || "").trim().slice(0, 500),
  attachment: message?.attachment?.data
    ? {
        name: String(message.attachment.name || "attachment").trim().slice(0, 80),
        type: String(message.attachment.type || "").trim().slice(0, 40),
        data: String(message.attachment.data || ""),
      }
    : null,
  reactions: Object.fromEntries(
    Object.entries(message?.reactions || {})
      .map(([emoji, userIds]) => [String(emoji).slice(0, 4), Array.isArray(userIds) ? userIds.map(String).filter(Boolean).slice(0, 60) : []])
      .filter(([emoji]) => emoji)
  ),
  pinned: Boolean(message?.pinned),
  createdAt: message?.createdAt || new Date().toISOString(),
});

const tribeMessageTime = (message) => {
  const time = new Date(message?.createdAt || "");
  return Number.isNaN(time.getTime()) ? 0 : time.getTime();
};

const sortTribeMessages = (messages = []) =>
  [...messages].sort((a, b) => tribeMessageTime(a) - tribeMessageTime(b));

const saveFriendsLocal = () => {
  if (isPublicProfilePage) return;
  localStorage.setItem(friendsStorageKey(), JSON.stringify(friends));
};

const saveFriendRequestsLocal = () => {
  if (isPublicProfilePage) return;
  localStorage.setItem(friendRequestsStorageKey(), JSON.stringify(friendRequests));
};

const saveSentFriendRequestsLocal = () => {
  if (isPublicProfilePage) return;
  localStorage.setItem(sentFriendRequestsStorageKey(), JSON.stringify(sentFriendRequests));
};

const loadFriendsLocal = () => {
  if (isPublicProfilePage) return [];
  try {
    return sanitizeFriends(JSON.parse(localStorage.getItem(friendsStorageKey()) || "[]"));
  } catch {
    return [];
  }
};

const loadSentFriendRequestsLocal = () => {
  if (isPublicProfilePage) return [];
  try {
    return sanitizeSentFriendRequests(JSON.parse(localStorage.getItem(sentFriendRequestsStorageKey()) || "[]"));
  } catch {
    return [];
  }
};

const loadFriendRequestsLocal = () => {
  if (isPublicProfilePage) return [];
  try {
    return sanitizeFriendRequests(JSON.parse(localStorage.getItem(friendRequestsStorageKey()) || "[]"));
  } catch {
    return [];
  }
};

const friendInitials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "F";

const isBestFriend = (friend) => Boolean(friend?.handle && bestFriendHandles.includes(friend.handle));

const createFriendCard = (friend, { removable = false, pinnable = false } = {}) => {
  const card = document.createElement("article");
  card.className = `friend-card${isBestFriend(friend) ? " best-friend" : ""}`;

  const avatar = document.createElement("span");
  avatar.className = "friend-avatar";
  avatar.textContent = friendInitials(friend.name);
  card.append(avatar);

  const copy = document.createElement("div");
  copy.className = "friend-copy";

  const name = document.createElement("strong");
  name.textContent = friend.name;
  copy.append(name);

  const link = document.createElement("a");
  link.href = friend.link || (friend.handle ? `/u/${friend.handle}` : "#");
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = friend.handle ? `@${friend.handle}` : friend.link;
  copy.append(link);
  card.append(copy);

  if (pinnable && friend.handle) {
    const pinButton = document.createElement("button");
    pinButton.className = "friend-accept";
    pinButton.type = "button";
    pinButton.textContent = isBestFriend(friend) ? "Best" : "Pin";
    pinButton.addEventListener("click", () => toggleBestFriend(friend));
    card.append(pinButton);
  }

  if (removable) {
    const removeButton = document.createElement("button");
    removeButton.className = "friend-remove";
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", `Remove ${friend.name}`);
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      openFriendRemoveDialog(friend);
    });
    card.append(removeButton);
  }

  return card;
};

function createUserResultCard(user) {
  const card = createFriendCard(
    {
      id: user.handle,
      name: user.displayName,
      handle: user.handle,
      link: user.profilePath || (user.handle ? `/u/${user.handle}` : "#"),
    },
    { removable: false }
  );
  const actions = document.createElement("div");
  actions.className = "friend-actions";
  const sendButton = createSmallActionButton("Add", "friend-accept", () => sendFriendRequestTo(user.handle || user.profilePath));
  sendButton.disabled = !user.handle || friends.some((friend) => friend.handle === user.handle);
  actions.append(sendButton);
  card.append(actions);
  return card;
}

const createNotificationCard = (request) => {
  const card = document.createElement("article");
  card.className = "friend-card notification-card";

  const avatar = document.createElement("span");
  avatar.className = "friend-avatar";
  avatar.textContent = friendInitials(request.fromName);
  card.append(avatar);

  const copy = document.createElement("div");
  copy.className = "friend-copy";

  const title = document.createElement("strong");
  title.textContent = `${request.fromName} sent a friend request`;
  copy.append(title);

  const link = document.createElement("a");
  link.href = request.fromLink || (request.fromHandle ? `/u/${request.fromHandle}` : "#");
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = request.fromHandle ? `@${request.fromHandle}` : "Open profile";
  copy.append(link);

  card.append(copy);
  return card;
};

const createAdminNotificationCard = (notice) => {
  const card = document.createElement("article");
  card.className = "friend-card notification-card admin-notification-card";

  const avatar = document.createElement("span");
  avatar.className = "friend-avatar";
  avatar.textContent = "!";
  card.append(avatar);

  const copy = document.createElement("div");
  copy.className = "friend-copy";

  const title = document.createElement("strong");
  title.textContent = notice.title || "Owner notice";
  copy.append(title);

  const message = document.createElement("span");
  message.className = "request-note";
  message.textContent = notice.message;
  copy.append(message);

  card.append(copy);
  return card;
};

const createSmallActionButton = (label, className, onClick) => {
  const button = document.createElement("button");
  button.className = className;
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
};

const createTribeInviteNotificationCard = (invite) => {
  const card = document.createElement("article");
  card.className = "friend-card notification-card tribe-notification-card";

  const avatar = document.createElement("span");
  avatar.className = "friend-avatar";
  avatar.textContent = "T";
  card.append(avatar);

  const copy = document.createElement("div");
  copy.className = "friend-copy";

  const title = document.createElement("strong");
  title.textContent = `Join ${invite.tribeName}`;
  copy.append(title);

  const message = document.createElement("span");
  message.className = "request-note";
  message.textContent = `You have been sent a request to join ${invite.tribeName} from ${invite.ownerDisplayName} (@${invite.ownerHandle}).`;
  copy.append(message);
  card.append(copy);

  const actions = document.createElement("div");
  actions.className = "friend-actions";
  actions.append(createSmallActionButton("Yes", "friend-accept", () => respondToTribeInvite(invite.id, "accept")));
  actions.append(createSmallActionButton("No", "friend-remove", () => respondToTribeInvite(invite.id, "decline")));
  card.append(actions);
  return card;
};

const createTribeJoinRequestCard = (request) => {
  const card = document.createElement("article");
  card.className = "friend-card notification-card tribe-notification-card";

  const avatar = document.createElement("span");
  avatar.className = "friend-avatar";
  avatar.textContent = friendInitials(request.requesterDisplayName);
  card.append(avatar);

  const copy = document.createElement("div");
  copy.className = "friend-copy";

  const title = document.createElement("strong");
  title.textContent = `${request.requesterDisplayName} wants to join ${request.tribeName}`;
  copy.append(title);

  const link = document.createElement("a");
  link.href = request.requesterHandle ? `/u/${request.requesterHandle}` : "#";
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = request.requesterHandle ? `@${request.requesterHandle}` : "Open profile";
  copy.append(link);
  card.append(copy);

  const actions = document.createElement("div");
  actions.className = "friend-actions";
  actions.append(createSmallActionButton("Yes", "friend-accept", () => respondToTribeJoinRequest(request.id, "accept")));
  actions.append(createSmallActionButton("No", "friend-remove", () => respondToTribeJoinRequest(request.id, "decline")));
  card.append(actions);
  return card;
};

const createSentFriendRequestCard = (request) => {
  const card = createFriendCard(
    {
      id: request.id,
      name: request.targetName,
      handle: request.targetHandle,
      link: request.targetLink,
    },
    { removable: false }
  );
  card.classList.add("friend-request-card");

  const status = document.createElement("span");
  status.className = "request-status";
  status.textContent = "Pending";
  card.append(status);
  return card;
};

const openConfirmDialog = ({ eyebrow = "Are you sure?", title = "Are you sure?", message, confirmText = "Yes", onConfirm }) => {
  pendingConfirmAction = onConfirm;
  $("#friendRemoveDialog p").textContent = eyebrow;
  $("#friendRemoveTitle").textContent = title;
  $("#friendRemoveMessage").textContent = message;
  $("#friendRemoveConfirm").textContent = confirmText;
  $("#friendRemoveDialog").hidden = false;
  $("#friendRemoveConfirm").focus();
};

const closeFriendRemoveDialog = () => {
  $("#friendRemoveDialog").hidden = true;
  pendingFriendRemoval = null;
  pendingConfirmAction = null;
};

const openFriendRemoveDialog = (friend) => {
  pendingFriendRemoval = friend;
  openConfirmDialog({
    eyebrow: "Remove friend",
    title: "Are you sure?",
    message: `Do you want to remove ${friend.name}?`,
    confirmText: "Yes, remove",
    onConfirm: () => removeFriend(friend),
  });
};

async function removeFriend(friend) {
  try {
    if (!sessionToken) {
      setFriends(friends.filter((item) => item.id !== friend.id));
      showToast(`Removed ${friend.name}`);
      return;
    }

    const key = friend.handle || friend.id || friend.link;
    const response = await fetch(`/api/friends/${encodeURIComponent(key)}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not remove friend");

    setFriends(result.friends || friends.filter((item) => item.id !== friend.id), { persist: false });
    setFriendRequests(result.friendRequests || friendRequests, { persist: false });
    setSentFriendRequests(result.sentFriendRequests || sentFriendRequests, { persist: false });
    showToast(`Removed ${friend.name}`);
  } catch (error) {
    showToast(error.message);
  }
}

async function acceptFriendRequest(requestId) {
  try {
    if (!sessionToken) throw new Error("Sign in before accepting friend requests");
    const response = await fetch(`/api/friend-requests/${encodeURIComponent(requestId)}/accept`, {
      method: "POST",
      headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not accept request");

    setFriends(result.friends || friends, { persist: false });
    setFriendRequests(result.friendRequests || friendRequests.filter((request) => request.id !== requestId), { persist: false });
    setSentFriendRequests(result.sentFriendRequests || sentFriendRequests, { persist: false });
    showToast("Friend request accepted");
  } catch (error) {
    showToast(error.message);
  }
}

const createFriendRequestCard = (request) => {
  const card = createFriendCard(
    {
      id: request.id,
      name: request.fromName,
      handle: request.fromHandle,
      link: request.fromLink,
    },
    { removable: false }
  );
  card.classList.add("friend-request-card");

  const actions = document.createElement("div");
  actions.className = "friend-actions";

  const acceptButton = document.createElement("button");
  acceptButton.className = "friend-accept";
  acceptButton.type = "button";
  acceptButton.textContent = "Accept";
  acceptButton.addEventListener("click", () => acceptFriendRequest(request.id));
  actions.append(acceptButton);

  card.append(actions);
  return card;
};

const myTribes = () => tribes.filter((tribe) => tribe.isOwner || tribe.isMember);

const selectedTribe = () => {
  const ownedOrJoined = myTribes();
  return tribes.find((tribe) => tribe.tribeId === selectedTribeId) || ownedOrJoined[0] || null;
};

const activeTribeChat = () => myTribes().find((tribe) => tribe.tribeId === activeTribeChatId) || null;

const tribeReadKey = (tribeId) => `funlol-tribe-read:${accountState.userId || accountState.email || "guest"}:${tribeId}`;

const unreadCountForTribe = (tribeId) => {
  const lastRead = Number(localStorage.getItem(tribeReadKey(tribeId)) || 0);
  return (tribeChatMessages[tribeId] || []).filter((message) => tribeMessageTime(message) > lastRead).length;
};

const markTribeRead = (tribeId) => {
  if (!tribeId) return;
  localStorage.setItem(tribeReadKey(tribeId), String(Date.now()));
};

const applyTribePayload = (result) => {
  if (Array.isArray(result?.tribes)) setTribes(result.tribes);
  if (Array.isArray(result?.tribeInvites)) setTribeInvites(result.tribeInvites);
  if (Array.isArray(result?.tribeJoinRequests)) setTribeJoinRequests(result.tribeJoinRequests);
};

const renderTribeInviteFriendOptions = () => {
  const list = $("#tribeInviteFriendList");
  if (!list) return;
  list.textContent = "";

  const friendsWithHandles = friends.filter((friend) => friend.handle);
  if (!friendsWithHandles.length) {
    const empty = document.createElement("p");
    empty.className = "friend-empty";
    empty.textContent = "Add friends first, then invite them here.";
    list.append(empty);
    return;
  }

  friendsWithHandles.forEach((friend) => {
    const label = document.createElement("label");
    label.className = "tribe-invite-option";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = friend.handle;
    label.append(checkbox);

    const copy = document.createElement("span");
    copy.textContent = `${friend.name} (@${friend.handle})`;
    label.append(copy);
    list.append(label);
  });
};

const friendsAvailableForTribe = (tribe) => {
  if (!tribe?.isOwner && !tribe?.isAdmin) return [];
  const memberHandles = new Set((tribe.members || []).map((member) => cleanHandle(member.handle)).filter(Boolean));
  return friends
    .filter((friend) => friend.handle)
    .filter((friend) => friend.handle !== tribe.ownerHandle)
    .filter((friend) => !memberHandles.has(friend.handle));
};

function renderTribeAddMembersPanel(tribe) {
  const form = $("#tribeAddMembersForm");
  const list = $("#tribeAddMemberList");
  const submitButton = $("#submitTribeAddMembersButton");
  if (!form || !list || !submitButton) return;

  const isOpen = Boolean((tribe?.isOwner || tribe?.isAdmin) && addMembersTribeId === tribe.tribeId);
  form.hidden = !isOpen;
  list.textContent = "";
  submitButton.disabled = true;
  if (!isOpen) return;

  const availableFriends = friendsAvailableForTribe(tribe);
  if (!availableFriends.length) {
    const empty = document.createElement("p");
    empty.className = "friend-empty";
    empty.textContent = "No friends available to add.";
    list.append(empty);
    return;
  }

  submitButton.disabled = false;
  availableFriends.forEach((friend) => {
    const label = document.createElement("label");
    label.className = "tribe-invite-option";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = friend.handle;
    label.append(checkbox);

    const copy = document.createElement("span");
    copy.textContent = `${friend.name} (@${friend.handle})`;
    label.append(copy);
    list.append(label);
  });
}

function openTribeAddMembers(tribeId) {
  selectedTribeId = tribeId;
  addMembersTribeId = tribeId;
  renderTribes();
  $("#tribeAddMemberList input")?.focus();
}

function closeTribeAddMembers() {
  addMembersTribeId = "";
  renderSelectedTribe();
}

const createTribeCard = (tribe, { selectable = false, joinable = false, compact = false } = {}) => {
  const card = document.createElement("article");
  card.className = `tribe-card${selectedTribeId === tribe.tribeId ? " active" : ""}${compact ? " compact" : ""}`;
  card.style.setProperty("--tribe-color", tribe.themeColor);

  if (selectable) {
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.addEventListener("click", () => {
      selectedTribeId = tribe.tribeId;
      renderTribes();
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      selectedTribeId = tribe.tribeId;
      renderTribes();
    });
  }

  const head = document.createElement("div");
  head.className = "tribe-card-head";

  const dot = document.createElement("span");
  dot.className = "tribe-dot";
  dot.textContent = tribe.icon || "";
  head.append(dot);

  const copy = document.createElement("div");
  copy.className = "friend-copy";

  const name = document.createElement("strong");
  name.textContent = tribe.name;

  if (selectable && (tribe.isOwner || tribe.isMember)) {
    const titleRow = document.createElement("div");
    titleRow.className = "tribe-title-row";
    titleRow.append(name);

    const chatButton = document.createElement("button");
    chatButton.className = "friend-accept tribe-chat-link";
    chatButton.type = "button";
    chatButton.textContent = "Go to Chat";
    chatButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openTribeChat(tribe.tribeId, { switchTab: true });
    });
    titleRow.append(chatButton);
    copy.append(titleRow);
  } else {
    copy.append(name);
  }

  const owner = document.createElement("span");
  owner.className = "request-note";
  owner.textContent = `${tribe.ownerDisplayName} (@${tribe.ownerHandle || "owner"})`;
  copy.append(owner);
  head.append(copy);
  card.append(head);

  const meta = document.createElement("span");
  meta.className = "tribe-meta";
  const memberCount = tribe.members.length || tribe.memberIds.length;
  meta.textContent = `${memberCount} ${memberCount === 1 ? "member" : "members"} • ${tribe.visibility}`;
  card.append(meta);

  if (selectable && tribe.isOwner) {
    const addButton = document.createElement("button");
    addButton.className = "friend-accept tribe-card-action";
    addButton.type = "button";
    addButton.textContent = "Add Members";
    addButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openTribeAddMembers(tribe.tribeId);
    });
    card.append(addButton);
  }

  if (joinable) {
    const button = document.createElement("button");
    button.className = tribe.isOwner || tribe.isMember || tribe.hasPendingJoin ? "friend-remove" : "friend-accept";
    button.type = "button";
    button.textContent = tribe.isOwner ? "Owner" : tribe.isMember ? "Joined" : tribe.hasPendingJoin ? "Requested" : "Join";
    button.disabled = tribe.isOwner || tribe.isMember || tribe.hasPendingJoin;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      requestJoinTribe(tribe.tribeId);
    });
    card.append(button);
  }

  return card;
};

const renderSelectedTribe = () => {
  const tribe = selectedTribe();
  const name = $("#selectedTribeName");
  const role = $("#selectedTribeRole");
  const form = $("#tribeManageForm");
  const membersList = $("#tribeMemberList");

  if (!membersList || !name || !role || !form) return;
  membersList.textContent = "";

  if (!tribe) {
    selectedTribeId = "";
    addMembersTribeId = "";
    name.textContent = "Select a tribe";
    role.textContent = "No tribe selected";
    form.hidden = true;
    renderTribeAddMembersPanel(null);
    const empty = document.createElement("p");
    empty.className = "friend-empty";
    empty.textContent = "Create or join a tribe to see members.";
    membersList.append(empty);
    return;
  }

  selectedTribeId = tribe.tribeId;
  name.textContent = tribe.name;
  const canManage = tribe.isOwner || tribe.isAdmin;
  role.textContent = tribe.isOwner ? "Owner controls" : tribe.isAdmin ? "Admin controls" : "Member view";
  form.hidden = !canManage;
  $("#tribeEditNameInput").value = tribe.name;
  $("#tribeEditThemeInput").value = tribe.themeColor;
  $("#tribeEditVisibilityInput").value = tribe.visibility;
  $("#tribeEditIconInput").value = tribe.icon || "T";
  $("#tribeEditAnnouncementInput").value = tribe.announcement || "";
  $("#deleteTribeButton").hidden = !tribe.isOwner;
  if (!canManage) addMembersTribeId = "";
  renderTribeAddMembersPanel(tribe);

  const announcementPanel = $("#tribeAnnouncementPanel");
  if (announcementPanel) {
    announcementPanel.hidden = !tribe.announcement;
    announcementPanel.textContent = tribe.announcement ? `Announcement: ${tribe.announcement}` : "";
  }
  const bannerPreview = $("#tribeBannerPreview");
  if (bannerPreview) {
    bannerPreview.hidden = !tribe.bannerData;
    bannerPreview.style.backgroundImage = tribe.bannerData ? `url("${tribe.bannerData}")` : "";
  }
  renderChipList($("#tribeChallengesList"), ["Highest Snake score this week", "Best Click Rush score", "Wordle streak challenge"], "Challenges are coming soon.");
  loadLeaderboards({ tribeId: tribe.tribeId, silent: true });

  const members = tribe.members.length ? tribe.members : tribe.memberIds.map((memberId) => ({ userId: memberId, displayName: "Member", handle: "" }));
  members.forEach((member) => {
    const card = document.createElement("article");
    card.className = "friend-card tribe-member-card";

    const avatar = document.createElement("span");
    avatar.className = "friend-avatar";
    avatar.textContent = friendInitials(member.displayName);
    card.append(avatar);

    const copy = document.createElement("div");
    copy.className = "friend-copy";
    const memberName = document.createElement("strong");
    memberName.textContent = member.displayName;
    copy.append(memberName);
    const handle = document.createElement(member.handle ? "a" : "span");
    handle.textContent = member.handle ? `@${member.handle}` : member.userId === tribe.ownerId ? "Owner" : "Member";
    if (member.handle) {
      handle.href = `/u/${member.handle}`;
      handle.target = "_blank";
      handle.rel = "noreferrer";
    }
    copy.append(handle);
    card.append(copy);

    if (canManage && member.userId !== tribe.ownerId) {
      const removeButton = document.createElement("button");
      removeButton.className = "friend-remove";
      removeButton.type = "button";
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", () => confirmRemoveTribeMember(tribe, member));
      card.append(removeButton);
      if (tribe.isOwner) {
        const roleButton = document.createElement("button");
        roleButton.className = member.role === "admin" ? "friend-remove" : "friend-accept";
        roleButton.type = "button";
        roleButton.textContent = member.role === "admin" ? "Demote" : "Promote";
        roleButton.addEventListener("click", () => changeTribeMemberRole(tribe, member, member.role === "admin" ? "member" : "admin"));
        card.append(roleButton);
      }
    } else {
      const status = document.createElement("span");
      status.className = "request-status";
      status.textContent = member.role || (member.userId === tribe.ownerId ? "Owner" : "Member");
      card.append(status);
    }

    membersList.append(card);
  });
};

function renderTribes() {
  const yourList = $("#yourTribesList");
  const searchResults = $("#tribeSearchResults");
  const allList = $("#allTribesList");
  const allCount = $("#allTribesCount");
  const query = ($("#tribeSearchInput")?.value || "").trim().toLowerCase();
  const ownedOrJoined = myTribes();

  renderTribeInviteFriendOptions();
  if (allCount) allCount.textContent = `${tribes.length} ${tribes.length === 1 ? "tribe" : "tribes"}`;

  if (yourList) {
    yourList.textContent = "";
    if (!ownedOrJoined.length) {
      const empty = document.createElement("p");
      empty.className = "friend-empty";
      empty.textContent = "No tribes yet. Create one or join one.";
      yourList.append(empty);
    } else {
      ownedOrJoined.forEach((tribe) => yourList.append(createTribeCard(tribe, { selectable: true })));
    }
  }

  if (searchResults) {
    searchResults.textContent = "";
    const matches = tribes.filter((tribe) => !query || tribe.name.toLowerCase().includes(query));
    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "friend-empty";
      empty.textContent = "No tribes matched your search.";
      searchResults.append(empty);
    } else {
      matches.forEach((tribe) => searchResults.append(createTribeCard(tribe, { joinable: true })));
    }
  }

  if (allList) {
    allList.textContent = "";
    if (!tribes.length) {
      const empty = document.createElement("p");
      empty.className = "friend-empty";
      empty.textContent = "No public tribes yet.";
      allList.append(empty);
    } else {
      tribes.forEach((tribe) => allList.append(createTribeCard(tribe, { compact: true })));
    }
  }

  renderSelectedTribe();
  renderTribeChats();
}

function createTribeChatCard(tribe) {
  const card = document.createElement("article");
  card.className = "tribe-card tribe-chat-card";
  card.style.setProperty("--tribe-color", tribe.themeColor);

  const title = document.createElement("strong");
  title.textContent = tribe.name;
  card.append(title);

  const owner = document.createElement("span");
  owner.className = "request-note";
  owner.textContent = `Owned by ${tribe.ownerDisplayName} (@${tribe.ownerHandle || "owner"})`;
  card.append(owner);

  const memberCount = tribe.members.length || tribe.memberIds.length;
  const meta = document.createElement("span");
  meta.className = "tribe-meta";
  meta.textContent = `${memberCount} ${memberCount === 1 ? "member" : "members"}`;
  card.append(meta);
  const unread = unreadCountForTribe(tribe.tribeId);
  if (unread) {
    const badge = document.createElement("span");
    badge.className = "tab-badge tribe-unread-badge";
    badge.textContent = String(unread);
    card.append(badge);
  }

  const button = document.createElement("button");
  button.className = "friend-accept";
  button.type = "button";
  button.textContent = "Open Chat";
  button.addEventListener("click", () => openTribeChat(tribe.tribeId));
  card.append(button);

  return card;
}

function renderTribeMessages() {
  const messagesList = $("#tribeChatMessages");
  const pinnedList = $("#tribePinnedMessages");
  if (!messagesList) return;
  messagesList.textContent = "";
  if (pinnedList) pinnedList.textContent = "";

  const messages = sortTribeMessages(tribeChatMessages[activeTribeChatId] || []);
  const active = activeTribeChat();
  const canPin = Boolean(active?.isOwner || active?.isAdmin);
  const pinnedMessages = messages.filter((message) => message.pinned);
  if (pinnedList) {
    if (!pinnedMessages.length) {
      const emptyPinned = document.createElement("span");
      emptyPinned.className = "mini-empty";
      emptyPinned.textContent = "No pinned messages.";
      pinnedList.append(emptyPinned);
    } else {
      pinnedMessages.forEach((message) => {
        const pinned = document.createElement("article");
        pinned.className = "pinned-message";
        pinned.textContent = `${message.senderDisplayName}: ${message.text}`;
        pinnedList.append(pinned);
      });
    }
  }
  if (!messages.length) {
    const empty = document.createElement("p");
    empty.className = "friend-empty";
    empty.textContent = "No messages yet. Start the chat.";
    messagesList.append(empty);
    return;
  }

  messages.forEach((message) => {
    const bubble = document.createElement("article");
    bubble.className = `tribe-message${message.senderId === accountState.userId ? " own" : ""}`;

    const meta = document.createElement("span");
    meta.className = "tribe-message-meta";
    meta.append(document.createTextNode(message.senderHandle ? `${message.senderDisplayName} (@${message.senderHandle})` : message.senderDisplayName));
    const timestamp = formatChatTimestamp(message.createdAt);
    if (timestamp) {
      const time = document.createElement("time");
      time.dateTime = message.createdAt;
      time.textContent = timestamp;
      meta.append(time);
    }
    bubble.append(meta);

    const text = document.createElement("p");
    text.textContent = message.text;
    bubble.append(text);

    if (message.attachment?.data) {
      const link = document.createElement("a");
      link.className = "message-attachment";
      link.href = message.attachment.data;
      link.target = "_blank";
      link.rel = "noreferrer";
      if (String(message.attachment.type || "").startsWith("image/")) {
        const image = document.createElement("img");
        image.src = message.attachment.data;
        image.alt = message.attachment.name || "Attachment";
        link.append(image);
      } else {
        link.textContent = message.attachment.name || "Attachment";
      }
      bubble.append(link);
    }

    const tools = document.createElement("div");
    tools.className = "message-tools";
    ["❤️", "🔥", "😂"].forEach((emoji) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `${emoji} ${(message.reactions?.[emoji] || []).length || ""}`.trim();
      button.addEventListener("click", () => reactToTribeMessage(message.id, emoji));
      tools.append(button);
    });
    if (canPin) {
      const pinButton = document.createElement("button");
      pinButton.type = "button";
      pinButton.textContent = message.pinned ? "Unpin" : "Pin";
      pinButton.addEventListener("click", () => pinTribeMessage(message.id, !message.pinned));
      tools.append(pinButton);
    }
    bubble.append(tools);

    messagesList.append(bubble);
  });

  messagesList.scrollTop = messagesList.scrollHeight;
}

function renderTribeChats() {
  const grid = $("#tribeChatGrid");
  const activePanel = $("#tribeChatActive");
  const count = $("#tribeChatsCount");
  const activeName = $("#activeTribeChatName");
  if (!grid || !activePanel || !count || !activeName) return;

  const chatTribes = myTribes();
  const active = activeTribeChat();
  count.textContent = `${chatTribes.length} ${chatTribes.length === 1 ? "chat" : "chats"}`;

  if (!active) {
    activeTribeChatId = "";
    activePanel.hidden = true;
    grid.hidden = false;
    grid.textContent = "";

    if (!chatTribes.length) {
      const empty = document.createElement("p");
      empty.className = "friend-empty";
      empty.textContent = "Join or create a tribe to unlock tribe chats.";
      grid.append(empty);
      return;
    }

    chatTribes.forEach((tribe) => grid.append(createTribeChatCard(tribe)));
    return;
  }

  grid.hidden = true;
  activePanel.hidden = false;
  activeName.textContent = active.name;
  renderTribeMessages();
}

function setTribes(nextTribes) {
  tribes = (Array.isArray(nextTribes) ? nextTribes : []).map(sanitizeTribe).filter((tribe) => tribe.tribeId);
  if (selectedTribeId && !myTribes().some((tribe) => tribe.tribeId === selectedTribeId)) selectedTribeId = "";
  if (addMembersTribeId && !myTribes().some((tribe) => tribe.tribeId === addMembersTribeId && tribe.isOwner)) addMembersTribeId = "";
  if (activeTribeChatId && !myTribes().some((tribe) => tribe.tribeId === activeTribeChatId)) activeTribeChatId = "";
  renderTribes();
}

function setTribeInvites(nextInvites) {
  tribeInvites = (Array.isArray(nextInvites) ? nextInvites : []).map(sanitizeTribeInvite).filter((invite) => invite.id && invite.tribeId);
  renderFriendRequests();
}

function setTribeJoinRequests(nextRequests) {
  tribeJoinRequests = (Array.isArray(nextRequests) ? nextRequests : [])
    .map(sanitizeTribeJoinRequest)
    .filter((request) => request.id && request.tribeId);
  renderFriendRequests();
}

function renderFriends() {
  const homeList = $("#homeFriendsList");
  const communitiesList = $("#communitiesFriendsList");
  const bestList = $("#bestFriendsList");
  const count = $("#friendsCount");
  const friendCountText = `${friends.length} ${friends.length === 1 ? "friend" : "friends"}`;
  if (count) count.textContent = friendCountText;

  [homeList, communitiesList, bestList].forEach((list) => {
    if (!list) return;
    list.textContent = "";
  });

  if (!friends.length) {
    const emptyHome = document.createElement("p");
    emptyHome.className = "friend-empty";
    emptyHome.textContent = "No friends added yet.";
    homeList?.append(emptyHome);

    const emptyCommunities = document.createElement("p");
    emptyCommunities.className = "friend-empty";
    emptyCommunities.textContent = "Add friends above and they will show here.";
    communitiesList?.append(emptyCommunities);
    bestList?.append(emptyCommunities.cloneNode(true));
    renderTribeInviteFriendOptions();
    renderActivity();
    return;
  }

  friends.forEach((friend) => {
    homeList?.append(createFriendCard(friend));
    communitiesList?.append(createFriendCard(friend, { removable: true, pinnable: true }));
  });
  const bestFriends = friends.filter((friend) => isBestFriend(friend));
  if (!bestFriends.length) {
    const empty = document.createElement("p");
    empty.className = "friend-empty";
    empty.textContent = "Pin best friends from your list.";
    bestList?.append(empty);
  } else {
    bestFriends.forEach((friend) => bestList?.append(createFriendCard(friend, { pinnable: true })));
  }
  renderTribeInviteFriendOptions();
  renderActivity();
}

function renderFriendRequests() {
  const notificationsList = $("#notificationsList");
  const notificationsCount = $("#notificationsCount");
  const requestsList = $("#friendRequestsList");
  const requestsCount = $("#friendRequestsCount");
  const badge = $("#friendRequestTabBadge");
  const incomingTotal = friendRequests.length + tribeInvites.length + tribeJoinRequests.length;
  const notificationTotal = incomingTotal + adminNotifications.length;
  const requestCountText = `${incomingTotal} incoming / ${sentFriendRequests.length} sent`;

  if (notificationsCount) notificationsCount.textContent = String(notificationTotal);
  if (requestsCount) requestsCount.textContent = requestCountText;
  if (badge) {
    badge.hidden = incomingTotal === 0;
    badge.textContent = String(incomingTotal);
  }

  [notificationsList, requestsList].forEach((list) => {
    if (list) list.textContent = "";
  });

  if (!notificationTotal) {
    const emptyNotifications = document.createElement("p");
    emptyNotifications.className = "friend-empty";
    emptyNotifications.textContent = "No notifications yet.";
    notificationsList?.append(emptyNotifications);
  } else {
    adminNotifications.forEach((notice) => {
      notificationsList?.append(createAdminNotificationCard(notice));
    });
    friendRequests.forEach((request) => {
      notificationsList?.append(createNotificationCard(request));
    });
    tribeInvites.forEach((invite) => {
      notificationsList?.append(createTribeInviteNotificationCard(invite));
    });
    tribeJoinRequests.forEach((request) => {
      notificationsList?.append(createTribeJoinRequestCard(request));
    });
  }

  if (!incomingTotal && !sentFriendRequests.length) {
    const emptyRequests = document.createElement("p");
    emptyRequests.className = "friend-empty";
    emptyRequests.textContent = "No friend requests yet.";
    requestsList?.append(emptyRequests);
    return;
  }

  if (friendRequests.length) {
    const incomingSection = document.createElement("section");
    incomingSection.className = "request-section";
    const incomingTitle = document.createElement("h3");
    incomingTitle.className = "request-section-title";
    incomingTitle.textContent = "Incoming";
    incomingSection.append(incomingTitle);
    friendRequests.forEach((request) => {
      incomingSection.append(createFriendRequestCard(request));
    });
    requestsList?.append(incomingSection);
  }

  if (tribeInvites.length) {
    const invitesSection = document.createElement("section");
    invitesSection.className = "request-section";
    const invitesTitle = document.createElement("h3");
    invitesTitle.className = "request-section-title";
    invitesTitle.textContent = "Tribe invites";
    invitesSection.append(invitesTitle);
    tribeInvites.forEach((invite) => {
      invitesSection.append(createTribeInviteNotificationCard(invite));
    });
    requestsList?.append(invitesSection);
  }

  if (tribeJoinRequests.length) {
    const joinSection = document.createElement("section");
    joinSection.className = "request-section";
    const joinTitle = document.createElement("h3");
    joinTitle.className = "request-section-title";
    joinTitle.textContent = "Tribe join requests";
    joinSection.append(joinTitle);
    tribeJoinRequests.forEach((request) => {
      joinSection.append(createTribeJoinRequestCard(request));
    });
    requestsList?.append(joinSection);
  }

  if (sentFriendRequests.length) {
    const sentSection = document.createElement("section");
    sentSection.className = "request-section";
    const sentTitle = document.createElement("h3");
    sentTitle.className = "request-section-title";
    sentTitle.textContent = "Sent by you";
    sentSection.append(sentTitle);
    sentFriendRequests.forEach((request) => {
      sentSection.append(createSentFriendRequestCard(request));
    });
    requestsList?.append(sentSection);
  }
}

function setAdminNotifications(nextNotifications) {
  adminNotifications = sanitizeAdminNotifications(nextNotifications);
  renderFriendRequests();
}

function renderOwnerUsers() {
  if (!ownerPanel.list || !ownerPanel.count) return;
  ownerPanel.list.textContent = "";
  ownerPanel.count.textContent = `${ownerUsers.length} ${ownerUsers.length === 1 ? "user" : "users"}`;

  if (ownerUsersLoading) {
    const loading = document.createElement("p");
    loading.className = "friend-empty";
    loading.textContent = "Loading registered users...";
    ownerPanel.list.append(loading);
    return;
  }

  if (!ownerUsers.length) {
    const empty = document.createElement("p");
    empty.className = "friend-empty";
    empty.textContent = "No registered users found.";
    ownerPanel.list.append(empty);
    return;
  }

  ownerUsers.forEach((user) => {
    const card = document.createElement("article");
    card.className = "owner-user-card";

    const avatar = document.createElement("span");
    avatar.className = "friend-avatar";
    avatar.textContent = friendInitials(user.displayName || user.email);
    card.append(avatar);

    const copy = document.createElement("div");
    copy.className = "friend-copy owner-user-copy";

    const title = document.createElement("strong");
    title.textContent = user.displayName || "No profile";
    copy.append(title);

    const email = document.createElement("span");
    email.className = "request-note";
    email.textContent = user.email;
    copy.append(email);

    const meta = document.createElement("span");
    meta.className = "request-note";
    meta.textContent = user.handle ? `@${user.handle} | ${user.views.toLocaleString()} views` : "No published profile yet";
    copy.append(meta);

    const status = document.createElement("span");
    status.className = `owner-status-chip ${user.accountStatus}`;
    status.textContent = user.accountStatus === "banned" ? "Banned" : user.accountStatus === "suspended" ? "Suspended" : "Active";
    copy.append(status);
    card.append(copy);

    const actions = document.createElement("div");
    actions.className = "owner-user-actions";

    if (user.handle) {
      const profileLink = document.createElement("a");
      profileLink.className = "friend-accept";
      profileLink.href = user.profilePath || `/u/${user.handle}`;
      profileLink.target = "_blank";
      profileLink.rel = "noreferrer";
      profileLink.textContent = "View";
      actions.append(profileLink);
    }

    const addFriendButton = createSmallActionButton("Add friend", "friend-accept", () => ownerAddFriend(user));
    addFriendButton.disabled = user.isOwner || !user.hasProfile;
    actions.append(addFriendButton);

    const notifyButton = createSmallActionButton("Notify", "friend-accept", () => ownerSendNotice(user));
    notifyButton.disabled = !user.hasProfile;
    actions.append(notifyButton);

    if (user.accountStatus === "active") {
      const suspendButton = createSmallActionButton("Suspend", "friend-remove owner-warning-button", () =>
        confirmOwnerAccountStatus(user, "suspended")
      );
      suspendButton.disabled = user.isOwner;
      actions.append(suspendButton);
    }

    if (user.accountStatus === "suspended") {
      const unsuspendButton = createSmallActionButton("Unsuspend", "friend-accept", () =>
        confirmOwnerAccountStatus(user, "active")
      );
      unsuspendButton.disabled = user.isOwner;
      actions.append(unsuspendButton);
    }

    if (user.accountStatus !== "banned") {
      const banButton = createSmallActionButton("Ban", "friend-remove owner-danger-button", () =>
        confirmOwnerAccountStatus(user, "banned")
      );
      banButton.disabled = user.isOwner;
      actions.append(banButton);
    } else {
      const reactivateButton = createSmallActionButton("Reactivate", "friend-accept", () =>
        confirmOwnerAccountStatus(user, "active")
      );
      reactivateButton.disabled = user.isOwner;
      actions.append(reactivateButton);
    }

    const deleteButton = createSmallActionButton("Delete", "friend-remove owner-danger-button", () => confirmOwnerDeleteAccount(user));
    deleteButton.disabled = user.isOwner;
    actions.append(deleteButton);

    card.append(actions);
    ownerPanel.list.append(card);
  });
}

async function loadOwnerUsers({ silent = false } = {}) {
  if (!isOwnerAccount() || !sessionToken || isPublicProfilePage) return;
  ownerUsersLoading = true;
  renderOwnerUsers();

  try {
    const response = await fetch("/api/admin/users", { headers: authHeaders() });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not load registered users");
    ownerUsers = (result.users || []).map(sanitizeOwnerUser).filter((user) => user.userId);
  } catch (error) {
    if (!silent) showToast(error.message);
  } finally {
    ownerUsersLoading = false;
    renderOwnerUsers();
  }
}

async function ownerAddFriend(user) {
  try {
    const response = await fetch(`/api/admin/users/${encodeURIComponent(user.userId)}/friend`, {
      method: "POST",
      headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not add friend");
    setFriends(result.friends || friends, { persist: false });
    showToast(`Added ${user.displayName || user.email} as a friend`);
    await loadOwnerUsers({ silent: true });
  } catch (error) {
    showToast(error.message);
  }
}

async function ownerSendNotice(user) {
  const message = ownerPanel.notice?.value.trim() || "";
  if (!message) {
    showToast("Write a notification message first");
    ownerPanel.notice?.focus();
    return;
  }

  try {
    const response = await fetch(`/api/admin/users/${encodeURIComponent(user.userId)}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ message }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not send notification");
    showToast(`Notification sent to ${user.displayName || user.email}`);
  } catch (error) {
    showToast(error.message);
  }
}

function confirmOwnerAccountStatus(user, status) {
  const label = status === "banned" ? "ban" : status === "suspended" ? "suspend" : "reactivate";
  openConfirmDialog({
    eyebrow: `${label} account`,
    title: "Are you sure?",
    message:
      status === "active"
        ? `This will restore access for ${user.email}.`
        : `This will ${label} ${user.email} and block their account access.`,
    confirmText: status === "active" ? "Yes, reactivate" : `Yes, ${label}`,
    onConfirm: () => ownerUpdateAccountStatus(user, status),
  });
}

async function ownerUpdateAccountStatus(user, status) {
  try {
    const response = await fetch(`/api/admin/users/${encodeURIComponent(user.userId)}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ status }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not update account status");
    const updated = sanitizeOwnerUser(result.user || { ...user, accountStatus: status });
    ownerUsers = ownerUsers.map((item) => (item.userId === updated.userId ? updated : item));
    renderOwnerUsers();
    showToast(`${updated.email} is now ${updated.accountStatus}`);
  } catch (error) {
    showToast(error.message);
  }
}

function confirmOwnerDeleteAccount(user) {
  openConfirmDialog({
    eyebrow: "Delete account",
    title: "Are you sure?",
    message: `This will delete ${user.email} and their profile. This cannot be undone.`,
    confirmText: "Yes, delete",
    onConfirm: () => ownerDeleteAccount(user),
  });
}

async function ownerDeleteAccount(user) {
  try {
    const response = await fetch(`/api/admin/users/${encodeURIComponent(user.userId)}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not delete account");
    ownerUsers = ownerUsers.filter((item) => item.userId !== user.userId);
    renderOwnerUsers();
    showToast(`Deleted ${user.email}`);
    await refreshFriendState();
  } catch (error) {
    showToast(error.message);
  }
}

function setFriends(nextFriends, { persist = true } = {}) {
  friends = sanitizeFriends(nextFriends);
  renderFriends();
  if (persist) saveFriendsLocal();
}

function setFriendRequests(nextRequests, { persist = true } = {}) {
  friendRequests = sanitizeFriendRequests(nextRequests);
  renderFriendRequests();
  if (persist) saveFriendRequestsLocal();
}

function setSentFriendRequests(nextRequests, { persist = true } = {}) {
  sentFriendRequests = sanitizeSentFriendRequests(nextRequests);
  renderFriendRequests();
  if (persist) saveSentFriendRequestsLocal();
}

function setBestFriendHandles(items = []) {
  bestFriendHandles = sanitizeBestFriendHandles(items);
  renderFriends();
  renderProfileBadges();
  renderDashboardInsights();
}

function toggleBestFriend(friend) {
  if (!friend?.handle) return;
  const next = new Set(bestFriendHandles);
  if (next.has(friend.handle)) {
    next.delete(friend.handle);
    showToast(`Removed ${friend.name} from best friends`);
  } else {
    next.add(friend.handle);
    showToast(`Pinned ${friend.name} as a best friend`);
  }
  setBestFriendHandles([...next]);
}

function renderUserResults(list, items, emptyText) {
  if (!list) return;
  list.textContent = "";
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "friend-empty";
    empty.textContent = emptyText;
    list.append(empty);
    return;
  }
  items.forEach((item) => list.append(createUserResultCard(item)));
}

function renderFriendDiscovery() {
  renderUserResults($("#friendSearchResults"), friendSearchResults, "Search for users by handle, name, or link.");
  renderUserResults($("#friendSuggestionsList"), friendSuggestions, "No suggestions yet.");
}

async function loadFriendSuggestions() {
  if (!sessionToken || isPublicProfilePage) return;
  try {
    const response = await fetch("/api/users/search?mode=suggestions", { headers: authHeaders() });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not load suggestions");
    friendSuggestions = (result.users || []).map(sanitizeUserSearchResult).filter((user) => user.handle);
    renderFriendDiscovery();
  } catch {
    friendSuggestions = [];
    renderFriendDiscovery();
  }
}

let friendSearchTimer = 0;
async function searchFriendsNow() {
  const query = $("#friendSearchInput")?.value.trim() || "";
  if (!query) {
    friendSearchResults = [];
    renderFriendDiscovery();
    return;
  }
  try {
    const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, { headers: authHeaders() });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not search users");
    friendSearchResults = (result.users || []).map(sanitizeUserSearchResult).filter((user) => user.handle);
    renderFriendDiscovery();
  } catch (error) {
    showToast(error.message);
  }
}

function queueFriendSearch() {
  clearTimeout(friendSearchTimer);
  friendSearchTimer = setTimeout(searchFriendsNow, 250);
}

async function sendFriendRequestTo(target) {
  const handle = friendHandleFor(target);
  if (!handle) return;
  friendInputs.name.value = handle;
  friendInputs.link.value = `@${handle}`;
  await submitFriendRequest();
}

async function refreshFriendState() {
  if (!sessionToken || isPublicProfilePage) return;
  try {
    const response = await fetch("/api/my-profile", { headers: authHeaders() });
    if (!response.ok) return;
    const data = await response.json();
    setFriends(data.friends || [], { persist: false });
    setFriendRequests(data.friendRequests || [], { persist: false });
    setSentFriendRequests(data.sentFriendRequests || [], { persist: false });
    setAdminNotifications(data.adminNotifications || []);
    setTribeInvites(data.tribeInvites || []);
    setTribeJoinRequests(data.tribeJoinRequests || []);
    unlockedBadges = new Set(sanitizeBadges(data.unlockedBadges || []));
    applyBadgeInputs(data.badges || selectedBadges(), data.badgeOptOuts || selectedBadgeOptOuts());
    if (Array.isArray(data.bestFriendHandles)) setBestFriendHandles(data.bestFriendHandles);
    friendActivity = Array.isArray(data.friendActivity) ? data.friendActivity.map((item) => String(item).slice(0, 100)).slice(0, 20) : friendActivity;
    await loadTribes({ silent: true });
    if (activeTribeChatId) await loadTribeChatMessages(activeTribeChatId, { silent: true });
  } catch {
    // The dashboard keeps the last loaded friend state if refresh fails.
  }
}

const stopFriendRefreshLoop = () => {
  if (friendRefreshTimer) {
    clearInterval(friendRefreshTimer);
    friendRefreshTimer = 0;
  }
};

const startFriendRefreshLoop = () => {
  stopFriendRefreshLoop();
  if (!sessionToken || isPublicProfilePage) return;
  refreshFriendState();
  friendRefreshTimer = setInterval(refreshFriendState, 10000);
};

const shortId = (value) => {
  if (!value) return "Hidden until sign in";
  return value.length > 14 ? `${value.slice(0, 8)}...${value.slice(-4)}` : value;
};

const formatDate = (value) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const formatChatTimestamp = (value) => {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  return date.toLocaleString(undefined, sameDay
    ? { hour: "numeric", minute: "2-digit" }
    : { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit" });
};

const formatRelativeTime = (value) => {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

function renderChipList(container, items, emptyText) {
  if (!container) return;
  container.textContent = "";
  if (!items.length) {
    const empty = document.createElement("span");
    empty.className = "mini-empty";
    empty.textContent = emptyText;
    container.append(empty);
    return;
  }
  items.forEach((item) => {
    const chip = document.createElement("span");
    chip.className = "mini-chip";
    chip.textContent = item;
    container.append(chip);
  });
}

function renderProfileBadgeChips(items) {
  if (!profile.badges) return;
  const badges = sanitizeBadges(items);
  profile.badges.textContent = "";
  profile.badges.classList.toggle("is-empty", badges.length === 0);
  if (!badges.length) {
    profile.badges.hidden = isPublicProfilePage;
    if (!isPublicProfilePage) {
      const empty = document.createElement("span");
      empty.className = "mini-empty";
      empty.textContent = "No badges worn yet";
      profile.badges.append(empty);
    }
    return;
  }
  profile.badges.hidden = false;

  const label = document.createElement("span");
  label.className = "profile-badge-tier";
  label.textContent = "Premium";
  profile.badges.append(label);

  const tray = document.createElement("div");
  tray.className = "profile-badge-tray";
  tray.setAttribute("role", "list");
  badges.forEach((item) => {
    const icon = profileBadgeIconMap[item] || profileBadgeIconMap["Early User"];
    const chip = document.createElement("span");
    chip.className = `profile-badge-icon ${icon.className}`;
    chip.title = item;
    chip.setAttribute("role", "listitem");
    chip.setAttribute("aria-label", item);
    chip.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${icon.svg}</svg>`;
    tray.append(chip);
  });
  profile.badges.append(tray);
}

const achievementList = () => {
  const achievements = [];
  if (accountState.profileHandle || cleanHandle(inputs.handle.value)) achievements.push("Profile Published");
  if (friends.length) achievements.push("First Friend Added");
  if (myTribes().length) achievements.push("First Tribe Joined");
  if (myTribes().some((tribe) => tribe.isOwner)) achievements.push("Tribe Owner");
  if (snake.bestValue > 0) achievements.push("First Game Played");
  if (snake.bestValue >= 10) achievements.push("Snake Master");
  if (bestFriendHandles.length) achievements.push("Top Friend");
  return achievements.slice(0, 8);
};

function renderProfileBadges() {
  const earned = currentUnlockedBadges();
  const badges = selectedBadges().filter((badge) => isPublicProfilePage || earned.has(badge));
  renderProfileBadgeChips(badges);
  syncBadgeEditor();
}

function renderVisitors(visitors = []) {
  if (!profile.visitors) return;
  const safeVisitors = sanitizeVisitorItems(visitors);
  profile.visitors.textContent = "";
  if (!safeVisitors.length) {
    profile.visitors.textContent = "Recent visitors appear here after views.";
    return;
  }
  safeVisitors.forEach((visitor) => {
    const item = document.createElement("span");
    item.textContent = `${visitor.label} • ${formatRelativeTime(visitor.viewedAt) || "recently"}`;
    profile.visitors.append(item);
  });
}

function renderDashboardInsights() {
  const featured = currentFeatured();
  const featuredText = featured.text || `${sanitizeStatus(inputs.status?.value)} on slapz.lol`;
  $("#homeStatusText").textContent = sanitizeStatus(inputs.status?.value);
  $("#homeFeaturedText").textContent = featuredText;
  renderChipList($("#homeAchievementsList"), achievementList(), "No achievements yet");
  renderActivity();
}

function renderActivity() {
  const activities = [
    ...friendActivity,
    ...friends.slice(0, 4).map((friend) => `${friend.name} is in your friends list`),
    ...myTribes().slice(0, 3).map((tribe) => `Joined ${tribe.name}`),
  ].slice(0, 8);
  [$("#friendActivityList"), $("#communitiesFriendActivityList")].forEach((list) => {
    if (!list) return;
    list.textContent = "";
    if (!activities.length) {
      const empty = document.createElement("span");
      empty.className = "mini-empty";
      empty.textContent = "No activity yet.";
      list.append(empty);
      return;
    }
    activities.forEach((activity) => {
      const item = document.createElement("span");
      item.textContent = activity;
      list.append(item);
    });
  });
}

function renderLeaderboard(container, rows, emptyText = "No scores yet.") {
  if (!container) return;
  container.textContent = "";
  if (!rows.length) {
    const empty = document.createElement("span");
    empty.className = "mini-empty";
    empty.textContent = emptyText;
    container.append(empty);
    return;
  }
  rows.forEach((row, index) => {
    const item = document.createElement("article");
    item.className = "leaderboard-row";
    const name = document.createElement("span");
    name.textContent = `${index + 1}. ${row.displayName}${row.handle ? ` (@${row.handle})` : ""}`;
    const score = document.createElement("strong");
    score.textContent = String(row.score);
    item.append(name, score);
    container.append(item);
  });
}

function leaderboardOwnScoreFor(game) {
  if (game === "snake") return snake.bestValue || Number(localStorage.getItem(localSnakeScoreKey()) || 0);
  if (game === "click-rush") return clickRush.bestValue || Number(localStorage.getItem(localClickRushScoreKey()) || 0);
  if (game === "crossy") return crossy.bestValue || Number(localStorage.getItem(localCrossyScoreKey()) || 0);
  return null;
}

function renderLeaderboardDetail() {
  if (!activeLeaderboardGame || !leaderboardView.detail) return;
  const label = leaderboardGameLabels[activeLeaderboardGame] || "Leaderboard";
  const hasServerScores = activeLeaderboardGame === "snake";
  const ownScore = leaderboardOwnScoreFor(activeLeaderboardGame);

  leaderboardView.title.textContent = label;
  renderLeaderboard(
    leaderboardView.global,
    hasServerScores ? leaderboards.global : [],
    hasServerScores ? "No global scores yet." : "Leaderboard coming soon for this game."
  );
  renderLeaderboard(
    leaderboardView.friends,
    hasServerScores ? leaderboards.friends : [],
    hasServerScores ? "No friend scores yet." : "Friend leaderboard coming soon for this game."
  );

  leaderboardView.ownScore.textContent = ownScore === null ? "Coming soon" : String(ownScore);
  leaderboardView.status.textContent = hasServerScores
    ? "Snake scores are saved on the server."
    : ownScore
      ? "Your local score is shown here until server leaderboards are added."
      : "Leaderboard coming soon for this game.";
}

function renderLeaderboards() {
  renderLeaderboardDetail();
  renderLeaderboard($("#tribeLeaderboardList"), leaderboards.tribe, "No tribe scores yet.");
}

function openLeaderboard(game) {
  activeLeaderboardGame = game;
  leaderboardView.grid.hidden = true;
  leaderboardView.detail.hidden = false;
  loadSnakeBestScore();
  loadClickRushBestScore();
  loadCrossyBestScore();
  renderLeaderboardDetail();
  if (game === "snake") loadLeaderboards({ silent: true });
}

function closeLeaderboardDetail() {
  activeLeaderboardGame = "";
  if (leaderboardView.grid) leaderboardView.grid.hidden = false;
  if (leaderboardView.detail) leaderboardView.detail.hidden = true;
}

function renderDailyChallenge() {
  const challenge = dailyChallenges[new Date().getDate() % dailyChallenges.length];
  $("#dailyChallengeTitle").textContent = challenge.title;
  $("#dailyChallengeText").textContent = challenge.text;
}

const hasProfileMedia = (dataKey, pathKey) => Boolean(mediaState[dataKey] || mediaState[pathKey]);
const hasAnySocialLink = () => Object.values(collectSocialLinks()).some((value) => value.trim());

function profileCompletionItems() {
  return [
    {
      label: "Display name",
      done: Boolean(inputs.name.value.trim()),
      suggestion: "Add a display name",
    },
    {
      label: "Handle",
      done: Boolean(cleanHandle(inputs.handle.value)),
      suggestion: "Choose a handle",
    },
    {
      label: "Bio text",
      done: Boolean(inputs.bio.value.trim()),
      suggestion: "Write a short bio",
    },
    {
      label: "Location",
      done: Boolean(inputs.location.value.trim()),
      suggestion: "Add a location",
    },
    {
      label: "Avatar",
      done: hasProfileMedia("avatarData", "avatarPath"),
      suggestion: "Add an avatar",
    },
    {
      label: "Background media",
      done: hasProfileMedia("backgroundData", "backgroundPath"),
      suggestion: "Upload background media",
    },
    {
      label: "Music",
      done: hasProfileMedia("musicData", "musicPath"),
      suggestion: "Add background music",
    },
    {
      label: "Social link",
      done: hasAnySocialLink(),
      suggestion: "Add one social link",
    },
    {
      label: "Theme",
      done: Boolean(profileTheme),
      suggestion: "Choose a theme",
    },
    {
      label: "Published",
      done: Boolean(accountState.profileHandle || accountState.profilePath),
      suggestion: "Publish your profile",
    },
  ];
}

function renderProfileCompletion() {
  const list = $("#profileCompletionList");
  if (!list) return;

  const items = profileCompletionItems();
  const completeCount = items.filter((item) => item.done).length;
  const percent = Math.round((completeCount / items.length) * 100);
  const title = $("#profileCompletionTitle");
  const percentLabel = $("#profileCompletionPercent");
  const bar = $("#profileCompletionBar");
  const suggestions = $("#profileCompletionSuggestions");

  if (title) title.textContent = `Profile ${percent}% complete`;
  if (percentLabel) percentLabel.textContent = `${percent}%`;
  if (bar) bar.style.width = `${percent}%`;

  list.textContent = "";
  items.forEach((item) => {
    const row = document.createElement("li");
    row.className = item.done ? "complete" : "";
    row.textContent = `${item.done ? "Done" : "To do"}: ${item.label}`;
    list.append(row);
  });

  const nextSuggestions = items.filter((item) => !item.done).map((item) => item.suggestion).slice(0, 3);
  if (suggestions) {
    suggestions.textContent = nextSuggestions.length
      ? `Next: ${nextSuggestions.join(", ")}.`
      : "Nice. Your profile has the full setup.";
  }
}

const updateAccountState = (data = {}) => {
  const previousOwner = accountState.userId || accountState.email;
  accountState = {
    ...accountState,
    email: data.email ?? accountState.email,
    userId: data.userId ?? accountState.userId,
    createdAt: data.createdAt ?? accountState.createdAt,
    profileHandle: data.profileHandle ?? accountState.profileHandle,
    profilePath: data.profilePath ?? accountState.profilePath,
    profileUrl: data.profileUrl ?? accountState.profileUrl,
    isOwner: data.isOwner ?? accountState.isOwner,
    onboardingCompleted: data.onboardingCompleted ?? accountState.onboardingCompleted,
    onboardingSkipped: data.onboardingSkipped ?? accountState.onboardingSkipped,
    needsOnboarding: data.needsOnboarding ?? accountState.needsOnboarding,
    dashboardSettings: data.dashboardSettings ?? accountState.dashboardSettings,
  };
  if (data.dashboardSettings) applyDashboardSettings(data.dashboardSettings);
  const nextOwner = accountState.userId || accountState.email;
  if (!isPublicProfilePage && nextOwner && nextOwner !== previousOwner && !friends.length) {
    setFriends(loadFriendsLocal(), { persist: false });
  }
  if (!isPublicProfilePage && nextOwner && nextOwner !== previousOwner && !friendRequests.length) {
    setFriendRequests(loadFriendRequestsLocal(), { persist: false });
  }
  if (!isPublicProfilePage && nextOwner && nextOwner !== previousOwner && !sentFriendRequests.length) {
    setSentFriendRequests(loadSentFriendRequestsLocal(), { persist: false });
  }
  syncOwnerPanelAccess();
  updateSettingsDetails();
  renderProfileCompletion();
};

function updateSettingsDetails() {
  const handle = cleanHandle(inputs.handle.value || accountState.profileHandle) || "nightcard";
  const profilePath = accountState.profilePath || `/u/${handle}`;
  settings.email.textContent = accountState.email || auth.email.value.trim() || "Not signed in";
  settings.displayName.textContent = inputs.name.value.trim() || "Nova";
  settings.handle.textContent = `@${handle}`;
  settings.profileLink.href = profilePath;
  settings.profileLink.textContent = profilePath;
  settings.views.textContent = profile.views.textContent || "0 views";
  settings.created.textContent = formatDate(accountState.createdAt);
  settings.userId.textContent = shortId(accountState.userId);
}

function statusBadgeFor(value) {
  const status = sanitizeStatus(value);
  if (status === "Gaming") return { label: "Gaming", text: "▣", className: "status-gaming" };
  if (status === "Busy") return { label: "Busy", text: "●", className: "status-busy" };
  if (status === "Listening to music") return { label: "Listening to music", text: "♪", className: "status-music" };
  if (status === "Chilling") return { label: "Chilling", text: "◐", className: "status-chilling" };
  return { label: "Online", text: "●", className: "status-online" };
}

function syncSidebarProfile() {
  if (!sidebarProfile.avatar) return;
  const handle = cleanHandle(inputs.handle.value || accountState.profileHandle) || "nightcard";
  const name = inputs.name.value.trim() || "Nova";
  const hasCustomAvatar = Boolean(mediaState.avatarData || mediaState.avatarPath);

  sidebarProfile.name.textContent = name;
  sidebarProfile.handle.textContent = `@${handle}`;
  sidebarProfile.avatar.textContent = hasCustomAvatar ? "" : name.slice(0, 1).toUpperCase();
  sidebarProfile.avatar.style.backgroundImage = hasCustomAvatar ? `url("${$("#avatar").src}")` : "";

  const badge = statusBadgeFor(inputs.status?.value);
  sidebarProfile.status.textContent = badge.text;
  sidebarProfile.status.className = `sidebar-status-badge ${badge.className}`;
  sidebarProfile.status.setAttribute("aria-label", badge.label);
}

const syncProfile = () => {
  profile.name.textContent = inputs.name.value.trim() || "Nova";
  const handle = cleanHandle(inputs.handle.value) || "nightcard";
  profile.handle.textContent = `@${handle}`;
  profile.bio.textContent = inputs.bio.value.trim() || "No bio yet.";
  profile.location.textContent = inputs.location.value.trim() || "Somewhere online";
  const status = sanitizeStatus(inputs.status?.value);
  const template = sanitizeProfileTemplate(inputs.template?.value);
  const featured = currentFeatured();
  document.body.dataset.profileTemplate = template;
  if (profile.status) profile.status.textContent = status;
  $("#featuredTitle").textContent = featured.type === "status" ? `${profile.name.textContent}'s status` : `Featured ${featured.type}`;
  $("#featuredText").textContent = featured.text || profile.bio.textContent;
  renderProfileBadges();
  renderDashboardInsights();
  syncSocialLinks();
  updatePublicLink();
  updateSettingsDetails();
  syncSidebarProfile();
  renderProfileCompletion();
};

const formatViews = (count) => {
  const safeCount = Number(count || 0);
  return `${safeCount.toLocaleString()} ${safeCount === 1 ? "view" : "views"}`;
};

[...Object.values(inputs), ...Object.values(socialInputs)].forEach((input) =>
  input.addEventListener("input", syncProfile)
);

[inputs.profilePrivacy, inputs.entryAnimation, inputs.template].forEach((input) => {
  input?.addEventListener("change", syncProfile);
});

auth.form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitAuth("signup");
});

auth.loginButton.addEventListener("click", () => submitAuth("login"));
auth.forgotButton.addEventListener("click", showForgotPassword);
auth.forgotBackButton.addEventListener("click", () => showAuth("login"));
auth.resetBackButton.addEventListener("click", () => showAuth("login"));

auth.forgotForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitForgotPassword();
});

auth.resetForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitResetPassword();
});

onboarding.skipButton?.addEventListener("click", skipOnboarding);
onboarding.backButton?.addEventListener("click", () => {
  onboardingStep = Math.max(0, onboardingStep - 1);
  renderOnboarding();
});
onboarding.nextButton?.addEventListener("click", () => {
  onboardingStep = Math.min(onboardingSteps.length - 1, onboardingStep + 1);
  renderOnboarding();
});
onboarding.publishButton?.addEventListener("click", goToOnboardingPublish);

landingAuthButtons.forEach((button) => {
  button.addEventListener("click", () => showAuth(button.dataset.landingAuth || "signup"));
});

$(".landing-brand")?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const logoutUser = () => {
  stopFriendRefreshLoop();
  sessionToken = "";
  localStorage.removeItem(sessionKey);
  accountState = {
    email: "",
    userId: "",
    createdAt: "",
    profileHandle: "",
    profilePath: "",
    profileUrl: "",
    isOwner: false,
    onboardingCompleted: false,
    onboardingSkipped: false,
    needsOnboarding: false,
  };
  setFriends([], { persist: false });
  setFriendRequests([], { persist: false });
  setSentFriendRequests([], { persist: false });
  setAdminNotifications([]);
  setTribes([]);
  setTribeInvites([]);
  setTribeJoinRequests([]);
  ownerUsers = [];
  syncOwnerPanelAccess();
  renderOwnerUsers();
  addMembersTribeId = "";
  activeTribeChatId = "";
  tribeChatMessages = {};
  onboardingPublishPrompted = false;
  hideOnboarding();
  updateSettingsDetails();
  setDashboardSection("home");
  showLanding();
  setAuthMessage("Logged out. Sign in again to edit your profile.");
};

auth.logoutButton.addEventListener("click", logoutUser);
auth.accountLogoutButton.addEventListener("click", logoutUser);

$("#friendRemoveCancel").addEventListener("click", closeFriendRemoveDialog);
$("#friendRemoveConfirm").addEventListener("click", async () => {
  const action = pendingConfirmAction;
  closeFriendRemoveDialog();
  if (action) await action();
});
$("#friendRemoveDialog").addEventListener("click", (event) => {
  if (event.target.id === "friendRemoveDialog") closeFriendRemoveDialog();
});

dashboardButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.dashboardTarget;
    if (target !== "games") closeActiveGame();
    if (target !== "leaderboards") closeLeaderboardDetail();
    setDashboardSection(target);
    if (target === "home" || target === "communities") refreshFriendState();
    if (target === "games") loadLeaderboards({ silent: true });
    if (target === "leaderboards") loadLeaderboards({ silent: true });
    exitPreview();
    if (target === "bio" && !isPublicProfilePage) {
      showOwnerBioEntryGate();
    } else if (!isPublicProfilePage) {
      hideEntryGate();
    }
  });
});

ownerPanel.refreshButton?.addEventListener("click", () => loadOwnerUsers());

const setCommunityTab = (tab) => {
  const nextTab = tab || "add";
  document.querySelectorAll("[data-community-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.communityTab === nextTab);
  });
  document.querySelectorAll("[data-community-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.communityPanel !== nextTab;
    panel.classList.toggle("active", panel.dataset.communityPanel === nextTab);
  });
  if (nextTab === "add") loadFriendSuggestions();
  if (nextTab === "communities" || nextTab === "join" || nextTab === "chats") loadTribes({ silent: true });
  if (nextTab === "chats") renderTribeChats();
};

document.querySelectorAll("[data-community-tab]").forEach((button) => {
  button.addEventListener("click", () => setCommunityTab(button.dataset.communityTab));
});

document.querySelectorAll(".editor .swatch").forEach((button) => {
  button.addEventListener("click", () => {
    profileTheme = button.dataset.theme || "black";
    applyThemeForCurrentSection();
    renderProfileCompletion();
  });
});

inputs.template?.addEventListener("change", () => {
  const preset = profileTemplates[sanitizeProfileTemplate(inputs.template.value)];
  if (preset) {
    profileTheme = preset.theme;
    setSparkleEffect(preset.sparkle);
    setCursorMode(preset.cursor, { persistAccount: false });
    applyThemeForCurrentSection();
  }
  syncProfile();
});

document.querySelectorAll("#badgeOptionGrid input").forEach((input) => {
  input.addEventListener("change", syncProfile);
});

$("#friendSearchInput")?.addEventListener("input", queueFriendSearch);

dashboardAppearanceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    dashboardAppearance = button.dataset.dashboardAppearance === "light" ? "light" : "dark";
    localStorage.setItem(dashboardAppearanceKey, dashboardAppearance);
    applyDashboardAppearance();
    queueDashboardSettingsSave();
  });
});

dashboardThemeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    dashboardTheme = button.dataset.dashboardTheme || "black";
    localStorage.setItem(dashboardThemeKey, dashboardTheme);
    applyThemeForCurrentSection();
    queueDashboardSettingsSave();
  });
});

$("#dashboardMuteButton").addEventListener("click", () => {
  dashboardMusicMutedOutsideBio = !dashboardMusicMutedOutsideBio;
  localStorage.setItem(dashboardMuteKey, String(dashboardMusicMutedOutsideBio));
  syncDashboardAudioState();
  queueDashboardSettingsSave();
});

$("#sidebarCollapseButton").addEventListener("click", () => {
  sidebarCollapsed = !sidebarCollapsed;
  localStorage.setItem(sidebarCollapsedKey, String(sidebarCollapsed));
  syncSidebarCollapsedState();
});

const attachMouseBoxEffect = (element, { lift = 1, tilt = 1 } = {}) => {
  if (!element) return;

  element.addEventListener("pointermove", (event) => {
    if (!canUsePointerEffects() || event.pointerType !== "mouse") return;

    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const liftX = (x - 0.5) * 10 * lift;
    const liftY = ((y - 0.5) * -14 - 6) * lift;
    const tiltX = (0.5 - y) * 10 * tilt;
    const tiltY = (x - 0.5) * 12 * tilt;

    element.style.setProperty("--lift-x", `${liftX.toFixed(2)}px`);
    element.style.setProperty("--lift-y", `${liftY.toFixed(2)}px`);
    element.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
    element.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
    element.style.setProperty("--spot-x", `${(x * 100).toFixed(1)}%`);
    element.style.setProperty("--spot-y", `${(y * 100).toFixed(1)}%`);
  });

  element.addEventListener("pointerleave", () => {
    element.style.setProperty("--lift-x", "0px");
    element.style.setProperty("--lift-y", "0px");
    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
    element.style.setProperty("--spot-x", "50%");
    element.style.setProperty("--spot-y", "50%");
  });
};

attachMouseBoxEffect($("#hoverCard"));
attachMouseBoxEffect($(".account-sidebar"), { lift: 0.55, tilt: 0.65 });
document.querySelectorAll(".game-card-preview").forEach((card) => {
  attachMouseBoxEffect(card, { lift: 0.85, tilt: 0.8 });
});
document.querySelectorAll(".friends-widget, .notifications-widget, .dashboard-mini-panel, .leaderboard-game-tile, .community-panel, .communities-tab, .owner-notice-composer, .owner-users-panel").forEach((card) => {
  attachMouseBoxEffect(card, { lift: 0.45, tilt: 0.5 });
});

$("#particlesToggle").addEventListener("change", (event) => {
  document.body.classList.toggle("no-motion", !event.target.checked);
});

$("#compactToggle").addEventListener("change", (event) => {
  document.body.classList.toggle("compact", event.target.checked);
});

$("#darkenVideoToggle").addEventListener("change", (event) => {
  document.body.classList.toggle("video-dark", event.target.checked);
});

inputs.cursorTrail.addEventListener("change", () => {
  setCursorMode(inputs.cursorTrail.value);
});

const syncCursorModeButtons = (mode) => {
  document.querySelectorAll(".cursor-option").forEach((button) => {
    const isActive = button.dataset.cursor === mode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-checked", String(isActive));
  });
  dashboardCursorButtons.forEach((button) => {
    const isActive = button.dataset.dashboardCursor === mode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-checked", String(isActive));
  });
};

const setCursorMode = (mode, { persistAccount = true } = {}) => {
  const nextMode = mode === "dot" ? "dot" : "normal";
  inputs.cursorTrail.value = nextMode;
  localStorage.setItem(dashboardCursorModeKey, nextMode);
  syncCursorModeButtons(nextMode);
  applyCursorTrail(nextMode === "dot");
  if (persistAccount) queueDashboardSettingsSave();
};

document.querySelectorAll(".cursor-option").forEach((button) => {
  button.addEventListener("click", () => setCursorMode(button.dataset.cursor));
});

dashboardCursorButtons.forEach((button) => {
  button.addEventListener("click", () => setCursorMode(button.dataset.dashboardCursor));
});

const setCursorColor = (color, { persistAccount = true } = {}) => {
  cursorColor = cursorColors.has(color) ? color : "white";
  document.body.dataset.cursorColor = cursorColor;
  localStorage.setItem(cursorColorKey, cursorColor);
  cursorColorButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.cursorColor === cursorColor);
  });
  if (persistAccount) queueDashboardSettingsSave();
};

cursorColorButtons.forEach((button) => {
  button.addEventListener("click", () => setCursorColor(button.dataset.cursorColor));
});

setCursorColor(cursorColor, { persistAccount: false });

const sparkleEffects = new Set(["none", "white", "gold", "pink", "aqua", "purple"]);

const setSparkleEffect = (effect) => {
  const nextEffect = sparkleEffects.has(effect) ? effect : "none";
  inputs.sparkleEffect.value = nextEffect;
  document.body.dataset.sparkleEffect = nextEffect;
  document.querySelectorAll("[data-sparkle]").forEach((button) => {
    const isActive = button.dataset.sparkle === nextEffect;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-checked", String(isActive));
  });
};

document.querySelectorAll("[data-sparkle]").forEach((button) => {
  button.addEventListener("click", () => setSparkleEffect(button.dataset.sparkle));
});

async function submitFriendRequest() {
  const friend = sanitizeFriend({
    name: friendInputs.name.value,
    link: friendInputs.link.value,
  });

  if (!friend) {
    showToast("Add a profile handle or link first");
    return;
  }

  try {
    if (!sessionToken) throw new Error("Sign in before sending friend requests");
    const response = await fetch("/api/friend-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({
        target: friend.link || friend.handle,
        targetName: friend.name,
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not send friend request");

    friendInputs.name.value = "";
    friendInputs.link.value = "";
    setSentFriendRequests(result.sentFriendRequests || sentFriendRequests, { persist: false });
    showToast(`Friend request sent to @${result.targetHandle || friend.handle}`);
  } catch (error) {
    showToast(error.message);
  }
}

$("#friendForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  await submitFriendRequest();
});

async function loadTribes({ silent = false } = {}) {
  if (!sessionToken || isPublicProfilePage) return;

  try {
    const response = await fetch("/api/tribes", { headers: authHeaders() });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not load tribes");
    applyTribePayload(result);
  } catch (error) {
    if (!silent) showToast(error.message);
  }
}

async function loadLeaderboards({ tribeId = selectedTribeId, silent = false } = {}) {
  if (!sessionToken || isPublicProfilePage) return;
  try {
    const url = tribeId ? `/api/games/leaderboards?tribeId=${encodeURIComponent(tribeId)}` : "/api/games/leaderboards";
    const response = await fetch(url, { headers: authHeaders() });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not load leaderboards");
    leaderboards = {
      global: sanitizeLeaderboardRows(result.global),
      friends: sanitizeLeaderboardRows(result.friends),
      tribe: sanitizeLeaderboardRows(result.tribe),
    };
    renderLeaderboards();
    renderDailyChallenge();
    renderProfileBadges();
  } catch (error) {
    if (!silent) showToast(error.message);
  }
}

async function loadTribeChatMessages(tribeId, { silent = false } = {}) {
  if (!sessionToken || isPublicProfilePage) return;
  let response;

  try {
    response = await fetch(`/api/tribes/${encodeURIComponent(tribeId)}/messages`, { headers: authHeaders() });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not load tribe chat");
    tribeChatMessages[tribeId] = sortTribeMessages(
      (Array.isArray(result.messages) ? result.messages : [])
        .map(sanitizeTribeMessage)
        .filter((message) => message.senderId && (message.text || message.attachment))
    );
    if (activeTribeChatId === tribeId) markTribeRead(tribeId);
    renderTribeChats();
  } catch (error) {
    if (!silent) showToast(error.message);
    if (response?.status === 403) {
      activeTribeChatId = "";
      renderTribeChats();
    }
  }
}

async function openTribeChat(tribeId, { switchTab = false } = {}) {
  const tribe = myTribes().find((item) => item.tribeId === tribeId);
  if (!tribe) {
    showToast("Only tribe members can open this chat");
    return;
  }

  activeTribeChatId = tribeId;
  if (switchTab) setCommunityTab("chats");
  renderTribeChats();
  await loadTribeChatMessages(tribeId, { silent: true });
  markTribeRead(tribeId);
  $("#tribeChatInput")?.focus();
}

async function sendTribeChatMessage(event) {
  event.preventDefault();
  const tribe = activeTribeChat();
  const input = $("#tribeChatInput");
  const text = input?.value.trim() || "";
  if (!tribe) {
    showToast("Open a tribe chat first");
    return;
  }
  if (!text && !tribeChatAttachment) return;

  try {
    const response = await fetch(`/api/tribes/${encodeURIComponent(tribe.tribeId)}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ text, attachment: tribeChatAttachment }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not send message");
    tribeChatMessages[tribe.tribeId] = sortTribeMessages(
      (Array.isArray(result.messages) ? result.messages : [])
        .map(sanitizeTribeMessage)
        .filter((message) => message.senderId && (message.text || message.attachment))
    );
    input.value = "";
    tribeChatAttachment = null;
    $("#tribeChatAttachmentInput").value = "";
    markTribeRead(tribe.tribeId);
    renderTribeChats();
  } catch (error) {
    showToast(error.message);
  }
}

function exitTribeChat() {
  activeTribeChatId = "";
  renderTribeChats();
}

async function reactToTribeMessage(messageId, emoji) {
  const tribe = activeTribeChat();
  if (!tribe) return;
  try {
    const response = await fetch(`/api/tribes/${encodeURIComponent(tribe.tribeId)}/messages/${encodeURIComponent(messageId)}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ emoji }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not react");
    tribeChatMessages[tribe.tribeId] = sortTribeMessages((result.messages || []).map(sanitizeTribeMessage));
    renderTribeChats();
  } catch (error) {
    showToast(error.message);
  }
}

async function pinTribeMessage(messageId, pinned) {
  const tribe = activeTribeChat();
  if (!tribe) return;
  try {
    const response = await fetch(`/api/tribes/${encodeURIComponent(tribe.tribeId)}/messages/${encodeURIComponent(messageId)}/pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ pinned }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not pin message");
    tribeChatMessages[tribe.tribeId] = sortTribeMessages((result.messages || []).map(sanitizeTribeMessage));
    renderTribeChats();
  } catch (error) {
    showToast(error.message);
  }
}

async function createTribe(event) {
  event.preventDefault();
  const name = $("#tribeNameInput").value.trim();
  const inviteHandles = [...document.querySelectorAll("#tribeInviteFriendList input:checked")].map((input) => input.value);

  try {
    if (!sessionToken) throw new Error("Sign in before creating tribes");
    const response = await fetch("/api/tribes", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({
        name,
        inviteHandles,
        themeColor: $("#tribeThemeInput").value,
        visibility: $("#tribeVisibilityInput").value,
        icon: $("#tribeIconInput").value,
        bannerData: await readFileAsDataUrl($("#tribeBannerInput").files?.[0], 1024 * 1024),
        announcement: $("#tribeAnnouncementInput").value,
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not create tribe");

    const created = (result.tribes || []).find((tribe) => tribe.isOwner && tribe.name === name);
    selectedTribeId = created?.tribeId || selectedTribeId;
    applyTribePayload(result);
    $("#tribeCreateForm").reset();
    $("#tribeThemeInput").value = "#f5f7fb";
    $("#tribeCreateForm").hidden = true;
    showToast("Tribe created");
  } catch (error) {
    showToast(error.message);
  }
}

async function saveSelectedTribe(event) {
  event.preventDefault();
  const tribe = selectedTribe();
  if (!tribe?.isOwner && !tribe?.isAdmin) return;

  try {
    const response = await fetch(`/api/tribes/${encodeURIComponent(tribe.tribeId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({
        name: $("#tribeEditNameInput").value,
        themeColor: $("#tribeEditThemeInput").value,
        visibility: $("#tribeEditVisibilityInput").value,
        icon: $("#tribeEditIconInput").value,
        bannerData: await readFileAsDataUrl($("#tribeEditBannerInput").files?.[0], 1024 * 1024),
        announcement: $("#tribeEditAnnouncementInput").value,
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not save tribe");
    applyTribePayload(result);
    showToast("Tribe updated");
  } catch (error) {
    showToast(error.message);
  }
}

function confirmDeleteSelectedTribe() {
  const tribe = selectedTribe();
  if (!tribe?.isOwner) return;
  openConfirmDialog({
    eyebrow: "Delete tribe",
    title: "Are you sure?",
    message: "Are you sure you want to delete this tribe?",
    confirmText: "Yes, delete",
    onConfirm: () => deleteSelectedTribe(tribe),
  });
}

async function deleteSelectedTribe(tribe) {
  try {
    const response = await fetch(`/api/tribes/${encodeURIComponent(tribe.tribeId)}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not delete tribe");
    selectedTribeId = "";
    applyTribePayload(result);
    showToast("Tribe deleted");
  } catch (error) {
    showToast(error.message);
  }
}

function confirmRemoveTribeMember(tribe, member) {
  openConfirmDialog({
    eyebrow: "Remove member",
    title: "Are you sure?",
    message: "Are you sure you want to remove this member?",
    confirmText: "Yes, remove",
    onConfirm: () => removeTribeMember(tribe, member),
  });
}

async function removeTribeMember(tribe, member) {
  try {
    const response = await fetch(`/api/tribes/${encodeURIComponent(tribe.tribeId)}/members/${encodeURIComponent(member.userId)}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not remove member");
    applyTribePayload(result);
    showToast("Member removed");
  } catch (error) {
    showToast(error.message);
  }
}

async function changeTribeMemberRole(tribe, member, role) {
  try {
    const response = await fetch(`/api/tribes/${encodeURIComponent(tribe.tribeId)}/members/${encodeURIComponent(member.userId)}/role`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ role }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not change role");
    applyTribePayload(result);
    showToast(role === "admin" ? "Member promoted" : "Member demoted");
  } catch (error) {
    showToast(error.message);
  }
}

async function addSelectedTribeMembers(event) {
  event.preventDefault();
  const tribe = selectedTribe();
  if (!tribe?.isOwner && !tribe?.isAdmin) {
    showToast("Only tribe managers can add members");
    return;
  }

  const friendHandles = [...document.querySelectorAll("#tribeAddMemberList input:checked")].map((input) => input.value);
  if (!friendHandles.length) {
    showToast("Select at least one friend to add");
    return;
  }

  try {
    const response = await fetch(`/api/tribes/${encodeURIComponent(tribe.tribeId)}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ friendHandles }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not add members");
    applyTribePayload(result);
    showToast(result.addedCount ? `${result.addedCount} member${result.addedCount === 1 ? "" : "s"} added` : "No new members added");
  } catch (error) {
    showToast(error.message);
  }
}

async function requestJoinTribe(tribeId) {
  try {
    if (!sessionToken) throw new Error("Sign in before joining tribes");
    const response = await fetch(`/api/tribes/${encodeURIComponent(tribeId)}/join`, {
      method: "POST",
      headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not request to join");
    applyTribePayload(result);
    showToast(result.status === "joined" ? "You are already in this tribe" : "Join request sent");
  } catch (error) {
    showToast(error.message);
  }
}

async function respondToTribeInvite(inviteId, action) {
  try {
    const response = await fetch(`/api/tribe-invites/${encodeURIComponent(inviteId)}/${action}`, {
      method: "POST",
      headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not answer tribe invite");
    applyTribePayload(result);
    showToast(action === "accept" ? "Tribe invite accepted" : "Tribe invite declined");
  } catch (error) {
    showToast(error.message);
  }
}

async function respondToTribeJoinRequest(requestId, action) {
  try {
    const response = await fetch(`/api/tribe-join-requests/${encodeURIComponent(requestId)}/${action}`, {
      method: "POST",
      headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not answer join request");
    applyTribePayload(result);
    showToast(action === "accept" ? "Join request accepted" : "Join request declined");
  } catch (error) {
    showToast(error.message);
  }
}

$("#showCreateTribeButton")?.addEventListener("click", () => {
  const form = $("#tribeCreateForm");
  form.hidden = !form.hidden;
  if (!form.hidden) $("#tribeNameInput").focus();
});

$("#tribeCreateForm")?.addEventListener("submit", createTribe);
$("#tribeManageForm")?.addEventListener("submit", saveSelectedTribe);
$("#tribeAddMembersForm")?.addEventListener("submit", addSelectedTribeMembers);
$("#showAddTribeMembersButton")?.addEventListener("click", () => {
  const tribe = selectedTribe();
  if (tribe?.isOwner || tribe?.isAdmin) openTribeAddMembers(tribe.tribeId);
});
$("#closeTribeAddMembersButton")?.addEventListener("click", closeTribeAddMembers);
$("#deleteTribeButton")?.addEventListener("click", confirmDeleteSelectedTribe);
$("#tribeSearchInput")?.addEventListener("input", renderTribes);
$("#tribeChatForm")?.addEventListener("submit", sendTribeChatMessage);
$("#exitTribeChatButton")?.addEventListener("click", exitTribeChat);
$("#tribeChatAttachmentInput")?.addEventListener("change", async (event) => {
  try {
    const file = event.target.files?.[0];
    if (!file) {
      tribeChatAttachment = null;
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) throw new Error("Only images and GIFs can be attached");
    tribeChatAttachment = {
      name: file.name,
      type: file.type,
      data: await readFileAsDataUrl(file, 1024 * 1024),
    };
    showToast("Attachment ready");
  } catch (error) {
    event.target.value = "";
    tribeChatAttachment = null;
    showToast(error.message);
  }
});
let typingTimer = 0;
$("#tribeChatInput")?.addEventListener("input", () => {
  const typing = $("#tribeTypingIndicator");
  if (!typing) return;
  typing.hidden = false;
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    typing.hidden = true;
  }, 1100);
});

$("#copyLink").addEventListener("click", async () => {
  const handle = profile.handle.textContent.slice(1);
  const link = `${location.origin}/u/${handle}`;
  try {
    await navigator.clipboard.writeText(link);
  } catch {
    window.prompt("Copy your profile link", link);
  }
  showToast("Public profile link copied");
});

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const dataUrlToObjectUrl = (dataUrl) => {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);base64/)?.[1] || "audio/mpeg";
  const binary = atob(base64 || "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
};

let publicLoopTransitionRunning = false;
let publicLoopFadeStarted = false;
let publicLoopAudioFrame = 0;

const preferredMusicVolume = () => Math.max(0, Math.min(1, Number($("#volumeInput").value) / 100 || 0.55));

const cancelPublicAudioFade = () => {
  if (publicLoopAudioFrame) {
    cancelAnimationFrame(publicLoopAudioFrame);
    publicLoopAudioFrame = 0;
  }
};

const fadePublicMusicTo = (targetVolume, duration = 900) => {
  const audio = $("#backgroundMusic");
  if (!audio.src) return Promise.resolve();
  cancelPublicAudioFade();

  const startVolume = audio.volume;
  const startedAt = performance.now();
  const target = Math.max(0, Math.min(1, targetVolume));

  return new Promise((resolve) => {
    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      audio.volume = startVolume + (target - startVolume) * eased;

      if (progress < 1) {
        publicLoopAudioFrame = requestAnimationFrame(tick);
        return;
      }

      publicLoopAudioFrame = 0;
      audio.volume = target;
      resolve();
    };

    publicLoopAudioFrame = requestAnimationFrame(tick);
  });
};

const resetPublicLoopTransition = () => {
  publicLoopTransitionRunning = false;
  publicLoopFadeStarted = false;
  document.body.classList.remove("public-loop-transitioning", "public-loop-revealing");
};

const shouldRunPublicLoopTransition = () => {
  const video = $("#backgroundVideo");
  return isPublicProfilePage && document.body.classList.contains("has-video") && Boolean(video.src);
};

const runPublicLoopTransition = async () => {
  if (!shouldRunPublicLoopTransition() || publicLoopTransitionRunning) return;

  const video = $("#backgroundVideo");
  const audio = $("#backgroundMusic");
  const targetVolume = preferredMusicVolume();
  const shouldRestartAudio = Boolean(audio.src && (!audio.paused || audio.currentTime > 0));

  publicLoopTransitionRunning = true;
  publicLoopFadeStarted = true;
  fadePublicMusicTo(0, 180);

  document.body.classList.remove("public-loop-revealing");
  document.body.classList.add("public-loop-transitioning");

  video.pause();
  video.currentTime = 0;
  video.play().catch(() => {});

  if (audio.src) {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 0;
    if (shouldRestartAudio) {
      audio.play().catch(() => {});
    }
  }

  await wait(1000);
  document.body.classList.add("public-loop-revealing");

  if (audio.src && shouldRestartAudio) {
    fadePublicMusicTo(targetVolume, 900);
  }

  await wait(860);
  document.body.classList.remove("public-loop-transitioning", "public-loop-revealing");
  publicLoopTransitionRunning = false;
  publicLoopFadeStarted = false;
  if (audio.src && shouldRestartAudio) audio.volume = targetVolume;
};

const handlePublicVideoTimeUpdate = () => {
  const video = $("#backgroundVideo");
  if (!shouldRunPublicLoopTransition() || publicLoopFadeStarted || publicLoopTransitionRunning) return;
  if (!Number.isFinite(video.duration) || video.duration <= 1.5) return;

  const fadeLead = Math.min(1.35, Math.max(0.55, video.duration * 0.12));
  if (video.duration - video.currentTime <= fadeLead) {
    publicLoopFadeStarted = true;
    fadePublicMusicTo(0, fadeLead * 1000);
  }
};

const setAvatarSource = (src, name = "") => {
  const avatar = $("#avatar");
  avatar.src =
    src ||
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=320&q=80";
  $("#avatarFileName").textContent = name || "Choose a profile image";
  syncSidebarProfile();
  renderProfileCompletion();
};

$("#avatarInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) {
    mediaState.avatarData = "";
    mediaState.avatarName = "";
    mediaState.avatarPath = "";
    setAvatarSource("");
    return;
  }

  mediaState.avatarData = await fileToDataUrl(file);
  mediaState.avatarName = file.name;
  mediaState.avatarPath = "";
  setAvatarSource(mediaState.avatarData, file.name);
});

const setBackgroundSource = (src, name = "", type = "") => {
  const video = $("#backgroundVideo");
  const image = $("#backgroundImage");
  resetPublicLoopTransition();
  video.pause();
  video.removeAttribute("src");
  image.style.backgroundImage = "";
  document.body.classList.remove("has-video", "has-image");

  if (!src) {
    $("#backgroundFileName").textContent = "Choose an image or video";
    renderProfileCompletion();
    return;
  }

  $("#backgroundFileName").textContent = name || "Saved background";

  if (type.startsWith("image/")) {
    image.style.backgroundImage = `url("${src}")`;
    document.body.classList.add("has-image");
    renderProfileCompletion();
    return;
  }

  video.src = src;
  video.loop = !isPublicProfilePage;
  video.play().catch(() => {});
  document.body.classList.add("has-video");
  renderProfileCompletion();
};

$("#backgroundVideo").addEventListener("loadedmetadata", () => {
  $("#backgroundVideo").loop = !isPublicProfilePage;
  publicLoopFadeStarted = false;
});

$("#backgroundVideo").addEventListener("timeupdate", handlePublicVideoTimeUpdate);
$("#backgroundVideo").addEventListener("ended", () => {
  runPublicLoopTransition();
});

const setMusicSource = (src, name = "") => {
  const audio = $("#backgroundMusic");
  audio.pause();
  if (mediaState.musicObjectUrl) {
    URL.revokeObjectURL(mediaState.musicObjectUrl);
    mediaState.musicObjectUrl = "";
  }

  if (!src) {
    audio.removeAttribute("src");
    $("#musicPlayer").hidden = true;
    $("#musicFileName").textContent = "Choose an audio file";
    $("#musicIcon").textContent = "Play";
    syncDashboardAudioState();
    renderProfileCompletion();
    return;
  }

  mediaState.musicObjectUrl = src.startsWith("data:") ? dataUrlToObjectUrl(src) : "";
  audio.src = mediaState.musicObjectUrl || src;
  audio.preload = "auto";
  audio.load();
  audio.volume = Number($("#volumeInput").value) / 100;
  $("#trackName").textContent = name || "Background track";
  $("#musicFileName").textContent = name || "Saved background music";
  $("#musicPlayer").hidden = false;
  $("#musicIcon").textContent = "Play";
  syncDashboardAudioState();
  renderProfileCompletion();
};

const clearPrivateMediaUrl = (kind) => {
  const current = mediaState.privateMediaUrls?.[kind];
  if (current) URL.revokeObjectURL(current);
  mediaState.privateMediaUrls[kind] = "";
};

async function authenticatedProfileMediaUrl(handle, kind) {
  if (!sessionToken) return "";
  const response = await fetch(`/api/profiles/${handle}/${kind}`, { headers: authHeaders() });
  if (!response.ok) return "";
  const blob = await response.blob();
  clearPrivateMediaUrl(kind);
  const objectUrl = URL.createObjectURL(blob);
  mediaState.privateMediaUrls[kind] = objectUrl;
  return objectUrl;
}

async function applyProfileMediaRoutes(data, handle) {
  const cleanProfileHandle = cleanHandle(handle);
  if (!cleanProfileHandle) return;

  const needsAuth = sanitizeProfilePrivacy(data.profilePrivacy) !== "public" && Boolean(sessionToken);
  const sourceFor = async (kind) =>
    needsAuth ? authenticatedProfileMediaUrl(cleanProfileHandle, kind) : `/api/profiles/${cleanProfileHandle}/${kind}`;

  if (data.hasAvatar) {
    const avatarSource = await sourceFor("avatar");
    if (avatarSource) setAvatarSource(avatarSource, data.avatarName || "Saved profile image");
  }

  if (data.hasBackground) {
    const backgroundSource = await sourceFor("background");
    if (backgroundSource) {
      setBackgroundSource(backgroundSource, data.backgroundName || "Saved background", data.backgroundType || "image/jpeg");
    }
  }

  if (data.hasMusic) {
    const musicSource = await sourceFor("music");
    if (musicSource) setMusicSource(musicSource, data.musicName || "Background music");
  }
}

$("#backgroundInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) {
    mediaState.backgroundData = "";
    mediaState.backgroundName = "";
    mediaState.backgroundType = "";
    mediaState.backgroundPath = "";
    setBackgroundSource("");
    return;
  }

  mediaState.backgroundData = await fileToDataUrl(file);
  mediaState.backgroundName = file.name;
  mediaState.backgroundType = file.type;
  mediaState.backgroundPath = "";
  setBackgroundSource(mediaState.backgroundData, file.name, file.type);
  document.body.classList.add("video-dark");
  $("#darkenVideoToggle").checked = true;
});

$("#clearBackgroundButton").addEventListener("click", () => {
  $("#backgroundInput").value = "";
  mediaState.backgroundData = "";
  mediaState.backgroundName = "";
  mediaState.backgroundType = "";
  mediaState.backgroundPath = "";
  setBackgroundSource("");
  showToast("Background file removed");
});

$("#musicInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) {
    mediaState.musicData = "";
    mediaState.musicName = "";
    mediaState.musicPath = "";
    setMusicSource("");
    return;
  }

  mediaState.musicData = await fileToDataUrl(file);
  mediaState.musicName = file.name;
  mediaState.musicPath = "";
  setMusicSource(mediaState.musicData, file.name);
});

$("#clearMusicButton").addEventListener("click", () => {
  $("#musicInput").value = "";
  mediaState.musicData = "";
  mediaState.musicName = "";
  mediaState.musicPath = "";
  setMusicSource("");
  showToast("Music file removed");
});

$("#musicToggle").addEventListener("click", async () => {
  const audio = $("#backgroundMusic");
  if (!audio.src) return;

  if (audio.paused) {
    await audio.play();
    $("#musicIcon").textContent = "Pause";
    $("#musicToggle").setAttribute("aria-label", "Pause music");
  } else {
    audio.pause();
    $("#musicIcon").textContent = "Play";
    $("#musicToggle").setAttribute("aria-label", "Play music");
  }
});

let entryMusicStarting = false;

const hideEntryGate = () => {
  document.body.classList.remove("entry-locked", "public-locked");
  $("#musicGate").classList.remove("entry-active");
};

const runProfileEntryAnimation = () => {
  if (!isPublicProfilePage || activeEntryAnimation === "none") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const card = $(".profile-card");
  if (!card) return;
  const animationClasses = [...entryAnimationOptions].filter((item) => item !== "none").map((item) => `entry-animation-${item}`);
  card.classList.remove(...animationClasses);
  void card.offsetWidth;
  card.classList.add(`entry-animation-${activeEntryAnimation}`);
  window.setTimeout(() => card.classList.remove(`entry-animation-${activeEntryAnimation}`), 1500);
};

const startEntryGate = async () => {
  if (entryMusicStarting || !$("#musicGate").classList.contains("entry-active")) return;
  const audio = $("#backgroundMusic");
  if (!audio.src) {
    hideEntryGate();
    runProfileEntryAnimation();
    return;
  }

  entryMusicStarting = true;
  hideEntryGate();
  runProfileEntryAnimation();
  try {
    if (audio.src) {
      audio.currentTime = 0;
      audio.muted = false;
      await audio.play();
      $("#musicIcon").textContent = "Pause";
      $("#musicToggle").setAttribute("aria-label", "Pause music");
    }
  } catch (error) {
    showToast(`Music failed: ${error.name || "playback blocked"}`);
  } finally {
    entryMusicStarting = false;
  }
};

$("#musicGate").addEventListener("pointerdown", startEntryGate);
$("#musicGate").addEventListener("click", startEntryGate);

$("#backgroundMusic").addEventListener("error", () => {
  showToast("Music file could not load. Re-upload a smaller MP3 and publish again.");
});

$("#volumeInput").addEventListener("input", (event) => {
  $("#backgroundMusic").volume = Number(event.target.value) / 100;
});

const enterPreview = (isPublic = false) => {
  if (document.body.classList.contains("auth-required")) return;
  document.body.classList.add("previewing");
  $("#previewToolbar").hidden = isPublic;
};

const showEntryGate = ({ title = "Click to enter", hint = "Click to enter", hasMusic = false } = {}) => {
  document.body.classList.add("entry-locked");
  $("#musicGate").classList.add("entry-active");
  $("#musicGate span").textContent = title;
  $("#musicGateHint").textContent = hasMusic ? "Click to start music" : hint;
};

const showPublicEntryGate = (hasMusic) => {
  if (!isPublicProfilePage) return;
  document.body.classList.add("public-locked");
  showEntryGate({
    title: "Click to enter",
    hint: "Click to enter",
    hasMusic,
  });
};

const showOwnerBioEntryGate = () => {
  if (isPublicProfilePage || document.body.classList.contains("auth-required")) return;
  showEntryGate({
    title: "Click to enter bio",
    hint: "Open your bio editor",
    hasMusic: Boolean($("#backgroundMusic").src),
  });
};

const exitPreview = () => {
  document.body.classList.remove("previewing");
  $("#previewToolbar").hidden = true;
};

$("#previewButton").addEventListener("click", () => enterPreview(false));
$("#exitPreview").addEventListener("click", exitPreview);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !$("#friendRemoveDialog").hidden) {
    closeFriendRemoveDialog();
    return;
  }
  if (isPublicProfilePage) return;
  if (event.key === "Escape" && document.body.classList.contains("previewing")) {
    exitPreview();
  }
});

const getActiveTheme = () => profileTheme || "black";

const collectProfile = () => ({
  name: inputs.name.value.trim() || "Nova",
  handle: cleanHandle(inputs.handle.value) || "nightcard",
  bio: inputs.bio.value.trim() || "No bio yet.",
  location: inputs.location.value.trim() || "Somewhere online",
  status: sanitizeStatus(inputs.status?.value),
  profileTemplate: sanitizeProfileTemplate(inputs.template?.value),
  profilePrivacy: sanitizeProfilePrivacy(inputs.profilePrivacy?.value),
  entryAnimation: sanitizeEntryAnimation(inputs.entryAnimation?.value),
  featured: currentFeatured(),
  badges: selectedBadges(),
  badgeOptOuts: selectedBadgeOptOuts(),
  bestFriendHandles,
  theme: getActiveTheme(),
  compactLinks: $("#compactToggle").checked,
  animatedBackground: $("#particlesToggle").checked,
  darkVideo: $("#darkenVideoToggle").checked,
  cursorTrail: inputs.cursorTrail.value === "dot",
  cursorColor,
  sparkleEffect: inputs.sparkleEffect.value || "none",
  friends,
  friendRequests,
  sentFriendRequests,
  socialLinks: collectSocialLinks(),
  avatarData: mediaState.avatarData,
  avatarName: mediaState.avatarName,
  avatarPath: mediaState.avatarPath,
  backgroundData: mediaState.backgroundData,
  backgroundName: mediaState.backgroundName,
  backgroundType: mediaState.backgroundType,
  backgroundPath: mediaState.backgroundPath,
  musicData: mediaState.musicData,
  musicName: mediaState.musicName,
  musicPath: mediaState.musicPath,
});

const applyProfile = (data) => {
  inputs.name.value = data.name || "Nova";
  inputs.handle.value = data.handle || "nightcard";
  inputs.bio.value = data.bio || "No bio yet.";
  inputs.location.value = data.location || "Somewhere online";
  if (inputs.status) inputs.status.value = sanitizeStatus(data.status);
  if (inputs.template) inputs.template.value = sanitizeProfileTemplate(data.profileTemplate || data.template);
  if (inputs.profilePrivacy) inputs.profilePrivacy.value = sanitizeProfilePrivacy(data.profilePrivacy);
  activeEntryAnimation = sanitizeEntryAnimation(data.entryAnimation);
  if (inputs.entryAnimation) inputs.entryAnimation.value = activeEntryAnimation;
  const featured = sanitizeFeatured(data.featured);
  if (inputs.featuredType) inputs.featuredType.value = featured.type;
  if (inputs.featuredText) inputs.featuredText.value = featured.text;
  unlockedBadges = new Set(sanitizeBadges(isPublicProfilePage ? data.badges || [] : data.unlockedBadges || []));
  applyBadgeInputs(data.badges || [], data.badgeOptOuts || []);
  bestFriendHandles = sanitizeBestFriendHandles(data.bestFriendHandles || []);
  friendActivity = Array.isArray(data.friendActivity) ? data.friendActivity.map((item) => String(item).slice(0, 100)).slice(0, 20) : [];
  updateAccountState({
    profileHandle: data.profileHandle || data.handle,
    profilePath: data.profilePath || (data.handle ? `/u/${data.handle}` : accountState.profilePath),
    profileUrl: data.profileUrl || accountState.profileUrl,
  });
  applySocialInputs(data.socialLinks || data.socials || {});

  profileTheme = data.theme || "black";
  applyThemeForCurrentSection();

  $("#compactToggle").checked = Boolean(data.compactLinks);
  $("#particlesToggle").checked = data.animatedBackground !== false;
  $("#darkenVideoToggle").checked = data.darkVideo !== false;
  setCursorMode(data.cursorTrail === true || data.cursorTrail === "dot" ? "dot" : "normal", { persistAccount: false });
  setCursorColor(data.cursorColor || cursorColor || "white", { persistAccount: false });
  setSparkleEffect(data.sparkleEffect || "none");
  setFriends(Array.isArray(data.friends) ? data.friends : loadFriendsLocal(), { persist: false });
  setFriendRequests(Array.isArray(data.friendRequests) ? data.friendRequests : loadFriendRequestsLocal(), { persist: false });
  setSentFriendRequests(Array.isArray(data.sentFriendRequests) ? data.sentFriendRequests : loadSentFriendRequestsLocal(), { persist: false });
  setAdminNotifications(Array.isArray(data.adminNotifications) ? data.adminNotifications : []);
  setTribeInvites(Array.isArray(data.tribeInvites) ? data.tribeInvites : []);
  setTribeJoinRequests(Array.isArray(data.tribeJoinRequests) ? data.tribeJoinRequests : []);
  renderVisitors(data.recentVisitors || data.visitors || []);

  document.body.classList.toggle("compact", $("#compactToggle").checked);
  document.body.classList.toggle("no-motion", !$("#particlesToggle").checked);
  document.body.classList.toggle("video-dark", $("#darkenVideoToggle").checked);

  mediaState.avatarData = data.avatarData || "";
  mediaState.avatarName = data.avatarName || "";
  mediaState.avatarPath = data.avatarPath || "";
  mediaState.backgroundData = data.backgroundData || data.videoData || "";
  mediaState.backgroundName = data.backgroundName || data.videoName || "";
  mediaState.backgroundType = data.backgroundType || (data.videoData ? "video/mp4" : "");
  mediaState.backgroundPath = data.backgroundPath || "";
  mediaState.musicData = data.musicData || "";
  mediaState.musicName = data.musicName || "";
  mediaState.musicPath = data.musicPath || "";

  const profileHandle = cleanHandle(data.handle || inputs.handle.value);
  const shouldLoadMediaWithAuth = sessionToken && sanitizeProfilePrivacy(data.profilePrivacy) !== "public";
  const avatarSource = mediaState.avatarPath && !shouldLoadMediaWithAuth ? `/api/profiles/${profileHandle}/avatar` : mediaState.avatarData;
  const backgroundSource =
    mediaState.backgroundPath && !shouldLoadMediaWithAuth ? `/api/profiles/${profileHandle}/background` : mediaState.backgroundData;
  const musicSource = mediaState.musicPath && !shouldLoadMediaWithAuth ? `/api/profiles/${profileHandle}/music` : mediaState.musicData;

  setAvatarSource(avatarSource, mediaState.avatarName);
  setBackgroundSource(backgroundSource, mediaState.backgroundName, mediaState.backgroundType);
  setMusicSource(musicSource, mediaState.musicName);
  profile.views.textContent = formatViews(data.views);
  syncProfile();
  if (shouldLoadMediaWithAuth) {
    applyProfileMediaRoutes(
      {
        ...data,
        hasAvatar: Boolean(data.hasAvatar || mediaState.avatarPath),
        hasBackground: Boolean(data.hasBackground || mediaState.backgroundPath),
        hasMusic: Boolean(data.hasMusic || mediaState.musicPath),
      },
      profileHandle
    );
  }
};

$("#saveButton").addEventListener("click", async () => {
  const payload = collectProfile();
  $("#saveButton").textContent = "Publishing...";
  $("#saveButton").disabled = true;

  try {
    if (!sessionToken) throw new Error("Sign in before publishing a profile");
    const response = await fetch(`/api/profiles/${payload.handle}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not publish profile");

    const shouldCompleteOnboarding = onboardingPublishPrompted || accountState.needsOnboarding;
    $("#publicLink").href = result.url;
    $("#publicLink").textContent = result.url;
    updateAccountState({
      profileHandle: result.handle,
      profilePath: result.url,
      profileUrl: result.fullUrl,
      onboardingCompleted: true,
      onboardingSkipped: false,
      needsOnboarding: false,
    });
    unlockedBadges = new Set(sanitizeBadges(result.unlockedBadges || []));
    applyBadgeInputs(result.badges || selectedBadges(), result.badgeOptOuts || selectedBadgeOptOuts());
    renderProfileBadges();
    if (shouldCompleteOnboarding) {
      try {
        await saveOnboardingStatus("complete");
      } catch {
        // Publishing already marks onboarding complete when storage is configured.
      }
      onboardingPublishPrompted = false;
      hideOnboarding();
    }
    saveDashboardSettingsNow().catch((error) => {
      console.warn("Could not sync account settings after profile publish:", error.message);
    });
    showToast(`Published at ${result.url}`);
  } catch (error) {
    showToast(error.message);
  } finally {
    $("#saveButton").textContent = "Publish profile";
    $("#saveButton").disabled = false;
  }
});

async function loadPublicProfile() {
  const publicHandle = publicHandleFromPath();
  if (!publicHandle) return;

  try {
    const response = await fetch(`/api/profiles/${publicHandle}?view=1`, {
      headers: sessionToken ? authHeaders() : {},
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Profile not found");
    applyProfile(data);
    await applyProfileMediaRoutes(data, publicHandle);
    enterPreview(true);
    showPublicEntryGate(Boolean(data.hasMusic));
    document.title = `${data.name || data.handle} | slapz.lol`;
  } catch (error) {
    const isPrivate = /private/i.test(error.message);
    profile.name.textContent = isPrivate ? "This profile is private." : "Profile not found";
    profile.handle.textContent = `@${publicHandle}`;
    profile.bio.textContent = isPrivate ? "Only approved viewers can open this profile." : error.message;
    enterPreview(true);
    hideEntryGate();
  }
}

async function loadMyProfile() {
  if (!sessionToken || isPublicProfilePage) return;

  try {
    const response = await fetch("/api/my-profile", { headers: authHeaders() });
    const data = await response.json();
    if (response.status === 404) return;
    if (!response.ok) throw new Error(data.error || "Could not load your profile");
    applyProfile(data);
    applyDashboardSettings(accountState.dashboardSettings);
    await loadTribes({ silent: true });
    showToast("Loaded your saved profile");
  } catch (error) {
    setAuthMessage(error.message);
  }
}

document.body.classList.add("video-dark");
syncProfile();
renderFriends();
renderFriendRequests();
renderTribes();
renderFriendDiscovery();
renderDailyChallenge();
renderLeaderboards();

async function bootApp() {
  if (isPublicProfilePage) {
    startLoading("Loading public profile...");
    await loadPublicProfile();
    await finishLoading();
    return;
  }

  if (isResetPasswordPage) {
    showResetPassword();
    return;
  }

  showLanding();
}

bootApp();

const cursorDot = document.createElement("div");
cursorDot.className = "cursor-dot";
cursorDot.hidden = true;
document.body.append(cursorDot);

const cursorTrailDots = Array.from({ length: 8 }, (_, index) => {
  const dot = document.createElement("span");
  dot.className = "cursor-trail-dot";
  dot.hidden = true;
  dot.style.setProperty("--trail-size", `${Math.max(3, 7 - index * 0.45)}px`);
  dot.style.setProperty("--trail-opacity", `${Math.max(0.12, 0.5 - index * 0.045)}`);
  document.body.append(dot);
  return {
    node: dot,
    x: 0,
    y: 0,
  };
});

let activeCursorTrail = false;
let lastCursorX = 0;
let lastCursorY = 0;
let cursorHasPosition = false;

function applyCursorTrail(mode) {
  activeCursorTrail = Boolean(mode) && canUsePointerEffects();
  if (!activeCursorTrail) cursorHasPosition = false;
  document.body.classList.toggle("cursor-effect", activeCursorTrail);
  cursorDot.hidden = !activeCursorTrail || !cursorHasPosition;
  cursorTrailDots.forEach((dot) => {
    dot.node.hidden = !activeCursorTrail || !cursorHasPosition;
  });
}

const syncCursorForPointer = () => {
  applyCursorTrail(inputs.cursorTrail.value === "dot");
};

setCursorMode(localStorage.getItem(dashboardCursorModeKey) || inputs.cursorTrail.value || "normal", { persistAccount: false });

if (finePointerQuery?.addEventListener) {
  finePointerQuery.addEventListener("change", syncCursorForPointer);
} else if (finePointerQuery?.addListener) {
  finePointerQuery.addListener(syncCursorForPointer);
}

window.addEventListener("pointermove", (event) => {
  if (!canUsePointerEffects() || event.pointerType !== "mouse") {
    cursorDot.hidden = true;
    cursorTrailDots.forEach((dot) => {
      dot.node.hidden = true;
    });
    return;
  }

  lastCursorX = event.clientX;
  lastCursorY = event.clientY;
  cursorHasPosition = true;

  if (!activeCursorTrail) return;

  cursorDot.style.left = `${lastCursorX}px`;
  cursorDot.style.top = `${lastCursorY}px`;
  cursorDot.hidden = false;
  cursorTrailDots.forEach((dot) => {
    dot.node.hidden = false;
  });
});

window.addEventListener("pointerleave", () => {
  cursorDot.hidden = true;
  cursorTrailDots.forEach((dot) => {
    dot.node.hidden = true;
  });
});

window.addEventListener("pointerenter", () => {
  cursorDot.hidden = !activeCursorTrail || !cursorHasPosition;
  cursorTrailDots.forEach((dot) => {
    dot.node.hidden = !activeCursorTrail || !cursorHasPosition;
  });
});

function animateCursorTrail() {
  let targetX = lastCursorX;
  let targetY = lastCursorY;

  cursorTrailDots.forEach((dot, index) => {
    const followSpeed = 0.42 - index * 0.025;
    dot.x += (targetX - dot.x) * followSpeed;
    dot.y += (targetY - dot.y) * followSpeed;
    dot.node.style.left = `${dot.x}px`;
    dot.node.style.top = `${dot.y}px`;
    targetX = dot.x;
    targetY = dot.y;
  });

  requestAnimationFrame(animateCursorTrail);
}

animateCursorTrail();

const canvas = $("#stars");
const context = canvas.getContext("2d");
const stars = Array.from({ length: 90 }, () => ({
  x: Math.random(),
  y: Math.random(),
  size: Math.random() * 1.6 + 0.35,
  speed: Math.random() * 0.18 + 0.05,
}));

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawStars() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  context.fillStyle = "rgba(255, 255, 255, 0.74)";

  for (const star of stars) {
    star.y += star.speed / window.innerHeight;
    if (star.y > 1) {
      star.y = 0;
      star.x = Math.random();
    }

    context.beginPath();
    context.arc(star.x * window.innerWidth, star.y * window.innerHeight, star.size, 0, Math.PI * 2);
    context.fill();
  }

  requestAnimationFrame(drawStars);
}

resizeCanvas();
drawStars();
window.addEventListener("resize", resizeCanvas);
