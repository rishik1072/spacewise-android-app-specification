// ---------------------------------------------------------------------------
// SPACEWISE — Local Device Snapshot Simulator
//
// IMPORTANT / HONESTY NOTE:
// A web browser sandbox has no access to Android's PackageManager,
// UsageStatsManager, MediaStore, or StorageStatsManager. Those APIs only
// exist inside the Android runtime. To let the full SpaceWise analysis,
// scoring, and recommendation engine run end-to-end in this environment,
// we generate one deterministic, locally-computed "device snapshot" the
// moment the app starts (seeded, so results are stable across sessions).
//
// Nothing here is fetched from a network and nothing leaves the browser —
// this respects the "analyze locally" principle even though, on this
// platform, "local" data is a generated stand-in for real OS statistics
// rather than a genuine device read. On real Android hardware this module
// would be replaced 1:1 by AppRepository / FileRepository / MediaStoreRepository
// implementations backed by the real platform APIs (see PLATFORM_NOTE in
// Settings > About for full disclosure).
// ---------------------------------------------------------------------------

import type { AppInfo, AppUsageBucket, FileCategory, FileInfo } from "../types/models";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20240517);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(min + rand() * (max - min + 1));
const randMB = (min: number, max: number) => Math.floor((min + rand() * (max - min)) * 1024 * 1024);

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308",
  "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#a855f7", "#84cc16",
];

// -------------------------------- APPS --------------------------------

interface AppSeed {
  name: string;
  pkg: string;
  glyph: string;
  system?: boolean;
  sizeRangeMB: [number, number];
}

const APP_SEEDS: AppSeed[] = [
  { name: "Chrome", pkg: "com.android.chrome", glyph: "🌐", sizeRangeMB: [180, 320] },
  { name: "WhatsApp", pkg: "com.whatsapp", glyph: "💬", sizeRangeMB: [140, 260] },
  { name: "Instagram", pkg: "com.instagram.android", glyph: "📷", sizeRangeMB: [220, 400] },
  { name: "TikTok", pkg: "com.zhiliaoapp.musically", glyph: "🎵", sizeRangeMB: [280, 520] },
  { name: "Spotify", pkg: "com.spotify.music", glyph: "🎧", sizeRangeMB: [150, 300] },
  { name: "Netflix", pkg: "com.netflix.mediaclient", glyph: "🎬", sizeRangeMB: [90, 180] },
  { name: "Gmail", pkg: "com.google.android.gm", glyph: "✉️", sizeRangeMB: [70, 140] },
  { name: "Maps", pkg: "com.google.android.apps.maps", glyph: "🗺️", sizeRangeMB: [180, 260] },
  { name: "YouTube", pkg: "com.google.android.youtube", glyph: "▶️", sizeRangeMB: [150, 260] },
  { name: "Facebook", pkg: "com.facebook.katana", glyph: "📘", sizeRangeMB: [300, 560] },
  { name: "Messenger", pkg: "com.facebook.orca", glyph: "🗨️", sizeRangeMB: [180, 320] },
  { name: "Twitter/X", pkg: "com.twitter.android", glyph: "🕊️", sizeRangeMB: [150, 260] },
  { name: "Snapchat", pkg: "com.snapchat.android", glyph: "👻", sizeRangeMB: [220, 380] },
  { name: "Amazon Shopping", pkg: "com.amazon.mShop.android.shopping", glyph: "📦", sizeRangeMB: [120, 220] },
  { name: "LinkedIn", pkg: "com.linkedin.android", glyph: "💼", sizeRangeMB: [140, 240] },
  { name: "Zoom", pkg: "us.zoom.videomeetings", glyph: "🎥", sizeRangeMB: [160, 260] },
  { name: "Uber", pkg: "com.ubercab", glyph: "🚗", sizeRangeMB: [110, 190] },
  { name: "PayPal", pkg: "com.paypal.android.p2pmobile", glyph: "💳", sizeRangeMB: [90, 160] },
  { name: "Duolingo", pkg: "com.duolingo", glyph: "🦉", sizeRangeMB: [100, 180] },
  { name: "Candy Crush Saga", pkg: "com.king.candycrushsaga", glyph: "🍬", sizeRangeMB: [200, 380] },
  { name: "Clash of Clans", pkg: "com.supercell.clashofclans", glyph: "🏰", sizeRangeMB: [250, 420] },
  { name: "PUBG Mobile", pkg: "com.tencent.ig", glyph: "🔫", sizeRangeMB: [1400, 2200] },
  { name: "Genshin Impact", pkg: "com.miHoYo.GenshinImpact", glyph: "⚔️", sizeRangeMB: [3200, 5200] },
  { name: "Old Weather App", pkg: "com.example.oldweather", glyph: "🌦️", sizeRangeMB: [40, 80] },
  { name: "QR Scanner Pro", pkg: "com.example.qrscanner", glyph: "🔲", sizeRangeMB: [20, 45] },
  { name: "Flashlight Plus", pkg: "com.example.flashlightplus", glyph: "🔦", sizeRangeMB: [15, 30] },
  { name: "Retail Loyalty Card", pkg: "com.example.retailcard", glyph: "🏷️", sizeRangeMB: [30, 60] },
  { name: "Airline Companion", pkg: "com.example.airline", glyph: "✈️", sizeRangeMB: [60, 120] },
  { name: "Fitness Tracker Lite", pkg: "com.example.fitnesslite", glyph: "🏃", sizeRangeMB: [50, 110] },
  { name: "PDF Reader Free", pkg: "com.example.pdfreader", glyph: "📄", sizeRangeMB: [40, 90] },
  { name: "Old Bank App (legacy)", pkg: "com.example.legacybank", glyph: "🏦", sizeRangeMB: [80, 150] },
  { name: "Ride Share Rival", pkg: "com.example.rideshare2", glyph: "🚕", sizeRangeMB: [90, 170] },
  { name: "Conference App 2022", pkg: "com.example.conf2022", glyph: "🎪", sizeRangeMB: [70, 140] },
  { name: "Meme Generator", pkg: "com.example.memegen", glyph: "😂", sizeRangeMB: [35, 70] },
  { name: "Voice Recorder Extra", pkg: "com.example.voicerec", glyph: "🎙️", sizeRangeMB: [25, 55] },
  { name: "Barcode Inventory", pkg: "com.example.barcodeinv", glyph: "📊", sizeRangeMB: [45, 90] },
  { name: "Recipe Box", pkg: "com.example.recipebox", glyph: "🍳", sizeRangeMB: [50, 100] },
  { name: "Sudoku Classic", pkg: "com.example.sudoku", glyph: "🔢", sizeRangeMB: [20, 40] },
  { name: "Language Flashcards", pkg: "com.example.flashcards", glyph: "🈶", sizeRangeMB: [55, 110] },
  { name: "Old Ride Hailing Beta", pkg: "com.example.ridebeta", glyph: "🚖", sizeRangeMB: [60, 120] },
  { name: "Phone", pkg: "com.android.dialer", glyph: "📞", system: true, sizeRangeMB: [60, 100] },
  { name: "Messages", pkg: "com.android.messaging", glyph: "💌", system: true, sizeRangeMB: [50, 90] },
  { name: "Settings", pkg: "com.android.settings", glyph: "⚙️", system: true, sizeRangeMB: [80, 140] },
  { name: "Camera", pkg: "com.android.camera2", glyph: "📸", system: true, sizeRangeMB: [90, 150] },
  { name: "Android System WebView", pkg: "com.google.android.webview", glyph: "🧩", system: true, sizeRangeMB: [200, 340] },
  { name: "Google Play Services", pkg: "com.google.android.gms", glyph: "▶", system: true, sizeRangeMB: [300, 480] },
  { name: "Google Play Store", pkg: "com.android.vending", glyph: "🛒", system: true, sizeRangeMB: [70, 120] },
];

function buildApps(): AppInfo[] {
  return APP_SEEDS.map((seed, idx) => {
    const isSystem = !!seed.system;
    let lastUsedDaysAgo: number | null;
    let usageAvailable = true;
    let category: AppUsageBucket;

    if (isSystem) {
      category = "system";
      lastUsedDaysAgo = randInt(0, 10);
    } else {
      // Skew: roughly a third frequently used, a third occasional, a third unused
      const bucket = idx % 3;
      if (bucket === 0) {
        lastUsedDaysAgo = randInt(0, 5);
        category = "frequently_used";
      } else if (bucket === 1) {
        lastUsedDaysAgo = randInt(10, 45);
        category = "occasionally_used";
      } else {
        lastUsedDaysAgo = randInt(60, 420);
        category = "unused";
      }
      // A handful of apps simulate "usage stats unavailable"
      if (rand() < 0.08) {
        usageAvailable = false;
        lastUsedDaysAgo = null;
      }
    }

    return {
      id: `app-${idx}`,
      name: seed.name,
      packageName: seed.pkg,
      versionName: `${randInt(1, 9)}.${randInt(0, 30)}.${randInt(0, 9)}`,
      glyph: seed.glyph,
      color: COLORS[idx % COLORS.length],
      sizeBytes: randMB(seed.sizeRangeMB[0], seed.sizeRangeMB[1]),
      isSystemCritical: isSystem,
      installedAtDaysAgo: randInt(30, 900),
      lastUsedDaysAgo,
      usageAvailable,
      category,
      opensPerWeek: category === "frequently_used" ? randInt(5, 40) : category === "occasionally_used" ? randInt(1, 6) : 0,
    };
  });
}

// -------------------------------- FILES --------------------------------

const IMAGE_NAMES = ["IMG_2041", "IMG_2041 (1)", "IMG_2041 (2)", "vacation_beach", "family_dinner", "sunset_view", "profile_pic_new", "meme_saved", "receipt_scan", "wallpaper_hd", "birthday_party", "product_photo"];
const VIDEO_NAMES = ["VID_0098", "VID_0098 (1)", "concert_clip", "trip_to_lake", "birthday_video", "tutorial_recording", "old_project_export", "family_reunion", "graduation_ceremony"];
const AUDIO_NAMES = ["voice_memo_012", "podcast_episode_44", "recorded_call", "song_download", "meeting_audio"];
const DOC_NAMES = ["invoice_2022", "resume_final", "resume_final_v2", "tax_return_2021", "contract_signed", "lecture_notes", "ebook_sample", "insurance_policy"];
const ARCHIVE_NAMES = ["project_backup", "photos_export", "old_downloads_bundle", "software_installer_pack", "app_data_backup"];
const APK_NAMES = ["com.example.oldweather_v3.1", "com.example.qrscanner_setup", "clash_of_clans_installer", "com.example.legacybank_update", "app-release-unsigned"];
const SCREENSHOT_PREFIX = "Screenshot_";
const RECORDING_PREFIX = "ScreenRecording_";

function extForCategory(cat: FileCategory): { ext: string; mime: string } {
  switch (cat) {
    case "image": return { ext: "jpg", mime: "image/jpeg" };
    case "screenshot": return { ext: "png", mime: "image/png" };
    case "video": return { ext: "mp4", mime: "video/mp4" };
    case "recording": return { ext: "mp4", mime: "video/mp4" };
    case "audio": return { ext: "mp3", mime: "audio/mpeg" };
    case "document": return { ext: "pdf", mime: "application/pdf" };
    case "archive": return { ext: "zip", mime: "application/zip" };
    case "apk": return { ext: "apk", mime: "application/vnd.android.package-archive" };
    default: return { ext: "dat", mime: "application/octet-stream" };
  }
}

let fileCounter = 0;
function makeFile(opts: {
  name: string;
  category: FileCategory;
  sizeBytes: number;
  modifiedDaysAgo: number;
  isInDownloads?: boolean;
  contentHash?: string;
  matchedPackage?: string;
  path?: string;
}): FileInfo {
  const { ext, mime } = extForCategory(opts.category);
  fileCounter += 1;
  const folder =
    opts.path ??
    (opts.isInDownloads
      ? "Download"
      : opts.category === "screenshot"
      ? "Pictures/Screenshots"
      : opts.category === "recording"
      ? "Movies/ScreenRecordings"
      : opts.category === "image"
      ? "DCIM/Camera"
      : opts.category === "video"
      ? "DCIM/Camera"
      : opts.category === "apk"
      ? "Download"
      : "Documents");
  return {
    id: `file-${fileCounter}`,
    name: `${opts.name}.${ext}`,
    path: `/storage/emulated/0/${folder}/${opts.name}.${ext}`,
    sizeBytes: opts.sizeBytes,
    category: opts.category,
    mimeType: mime,
    modifiedDaysAgo: opts.modifiedDaysAgo,
    isInDownloads: !!opts.isInDownloads,
    contentHash: opts.contentHash ?? `h${fileCounter}-${opts.sizeBytes}`,
    matchedPackage: opts.matchedPackage,
  };
}

function buildFiles(apps: AppInfo[]): FileInfo[] {
  const files: FileInfo[] = [];

  // Regular photos
  for (let i = 0; i < 60; i++) {
    const name = pick(IMAGE_NAMES) + (rand() < 0.3 ? `_${randInt(100, 999)}` : "");
    files.push(makeFile({
      name,
      category: "image",
      sizeBytes: randMB(1.5, 12),
      modifiedDaysAgo: randInt(0, 700),
    }));
  }

  // Screenshots (accumulate a lot — common real-world pattern)
  for (let i = 0; i < 85; i++) {
    files.push(makeFile({
      name: `${SCREENSHOT_PREFIX}2024-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}-${String(randInt(10, 22))}-${String(randInt(10, 59))}-${String(randInt(10, 59))}`,
      category: "screenshot",
      sizeBytes: randMB(0.3, 4),
      modifiedDaysAgo: randInt(0, 500),
    }));
  }

  // Screen recordings
  for (let i = 0; i < 8; i++) {
    files.push(makeFile({
      name: `${RECORDING_PREFIX}2024-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}-${String(randInt(10, 22))}-${String(randInt(10, 59))}-${String(randInt(10, 59))}`,
      category: "recording",
      sizeBytes: randMB(80, 650),
      modifiedDaysAgo: randInt(0, 400),
    }));
  }

  // Videos, including some intentional large ones
  for (let i = 0; i < 22; i++) {
    files.push(makeFile({
      name: pick(VIDEO_NAMES) + `_${randInt(1, 999)}`,
      category: "video",
      sizeBytes: randMB(40, 900),
      modifiedDaysAgo: randInt(0, 800),
    }));
  }
  // A few very large videos to trigger large-file detection
  files.push(makeFile({ name: "family_reunion_4k_full", category: "video", sizeBytes: randMB(1100, 1600), modifiedDaysAgo: randInt(200, 600) }));
  files.push(makeFile({ name: "drone_footage_raw", category: "video", sizeBytes: randMB(2100, 2900), modifiedDaysAgo: randInt(100, 300) }));
  files.push(makeFile({ name: "old_project_export_master", category: "video", sizeBytes: randMB(600, 900), modifiedDaysAgo: randInt(400, 900) }));

  // Audio
  for (let i = 0; i < 15; i++) {
    files.push(makeFile({
      name: pick(AUDIO_NAMES) + `_${randInt(1, 999)}`,
      category: "audio",
      sizeBytes: randMB(2, 45),
      modifiedDaysAgo: randInt(0, 600),
    }));
  }

  // Documents
  for (let i = 0; i < 18; i++) {
    files.push(makeFile({
      name: pick(DOC_NAMES) + (rand() < 0.2 ? "_v2" : ""),
      category: "document",
      sizeBytes: randMB(0.2, 15),
      modifiedDaysAgo: randInt(0, 900),
    }));
  }

  // Archives (Downloads-heavy)
  for (let i = 0; i < 10; i++) {
    files.push(makeFile({
      name: pick(ARCHIVE_NAMES) + `_${randInt(1, 999)}`,
      category: "archive",
      sizeBytes: randMB(20, 700),
      modifiedDaysAgo: randInt(30, 800),
      isInDownloads: true,
    }));
  }

  // APKs — some matched to installed packages (simulating old installers)
  const installedSample = apps.filter((a) => !a.isSystemCritical).slice(0, 5);
  APK_NAMES.forEach((name, i) => {
    const match = i < installedSample.length ? installedSample[i] : undefined;
    files.push(makeFile({
      name,
      category: "apk",
      sizeBytes: randMB(15, 180),
      modifiedDaysAgo: randInt(60, 500),
      isInDownloads: true,
      matchedPackage: match?.packageName,
    }));
  });
  for (let i = 0; i < 4; i++) {
    files.push(makeFile({
      name: `unknown_app_installer_${randInt(100, 999)}`,
      category: "apk",
      sizeBytes: randMB(10, 90),
      modifiedDaysAgo: randInt(100, 600),
      isInDownloads: true,
    }));
  }

  // Misc downloads / other
  for (let i = 0; i < 14; i++) {
    files.push(makeFile({
      name: `file_download_${randInt(1000, 9999)}`,
      category: "other",
      sizeBytes: randMB(1, 60),
      modifiedDaysAgo: randInt(10, 700),
      isInDownloads: true,
    }));
  }

  // ---- Inject deliberate duplicate groups (content-hash based) ----
  const dupGroups: { base: () => FileInfo; copies: number; cat: FileCategory }[] = [
    { cat: "image", copies: 3, base: () => makeFile({ name: "IMG_2041", category: "image", sizeBytes: randMB(4, 4), modifiedDaysAgo: randInt(30, 200) }) },
    { cat: "image", copies: 2, base: () => makeFile({ name: "wallpaper_hd", category: "image", sizeBytes: randMB(6, 6), modifiedDaysAgo: randInt(10, 300) }) },
    { cat: "video", copies: 2, base: () => makeFile({ name: "birthday_video", category: "video", sizeBytes: randMB(220, 220), modifiedDaysAgo: randInt(60, 400) }) },
    { cat: "document", copies: 3, base: () => makeFile({ name: "resume_final", category: "document", sizeBytes: randMB(1.2, 1.2), modifiedDaysAgo: randInt(5, 100) }) },
    { cat: "audio", copies: 2, base: () => makeFile({ name: "song_download", category: "audio", sizeBytes: randMB(8, 8), modifiedDaysAgo: randInt(20, 250) }) },
    { cat: "archive", copies: 2, base: () => makeFile({ name: "photos_export", category: "archive", sizeBytes: randMB(150, 150), modifiedDaysAgo: randInt(100, 500) }) },
  ];

  dupGroups.forEach((group, gi) => {
    const size = randMB(1, 1); // placeholder, replaced below per group to keep identical size across copies
    const sharedHash = `dup-${gi}-${Date.now() % 100000}`;
    const template = group.base();
    for (let c = 0; c < group.copies; c++) {
      const suffix = c === 0 ? "" : ` (${c})`;
      const nameNoExt = template.name.replace(/\.[a-z0-9]+$/i, "");
      files.push(
        makeFile({
          name: `${nameNoExt}${suffix}`,
          category: template.category,
          sizeBytes: template.sizeBytes,
          modifiedDaysAgo: Math.max(0, template.modifiedDaysAgo - c * randInt(0, 5)),
          isInDownloads: false,
          contentHash: sharedHash,
        })
      );
    }
    void size;
  });

  return files;
}

export interface DeviceSnapshot {
  apps: AppInfo[];
  files: FileInfo[];
  totalDeviceBytes: number;
  freeBytesBeforeAnalysis: number;
}

export function generateDeviceSnapshot(): DeviceSnapshot {
  const apps = buildApps();
  const files = buildFiles(apps);
  const totalDeviceBytes = 128 * 1024 * 1024 * 1024; // simulated 128GB device
  const appsBytes = apps.reduce((s, a) => s + a.sizeBytes, 0);
  const filesBytes = files.reduce((s, f) => s + f.sizeBytes, 0);
  const systemReserved = 14 * 1024 * 1024 * 1024; // OS + reserved partitions
  const usedBytes = appsBytes + filesBytes + systemReserved;
  const freeBytesBeforeAnalysis = Math.max(totalDeviceBytes - usedBytes, 4 * 1024 * 1024 * 1024);
  return { apps, files, totalDeviceBytes, freeBytesBeforeAnalysis };
}
