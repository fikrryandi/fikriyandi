import express from "express";
import path from "path";
import fs from "fs/promises";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

// Fallback / Initial Database Values from src/data
import { 
  INITIAL_PROJECTS, 
  INITIAL_SKILLS, 
  INITIAL_EXPERIENCES, 
  INITIAL_MESSAGES, 
  INITIAL_SETTINGS,
  INITIAL_EDUCATIONS,
  INITIAL_CERTIFICATES,
  INITIAL_PUBLICATIONS 
} from "./src/data";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "portfolio_db.json");
const TIMESTAMPS_FILE = path.join(process.cwd(), "local_timestamps.json");

async function getLocalTimestamp(key: string): Promise<string | null> {
  try {
    const exists = await fs.access(TIMESTAMPS_FILE).then(() => true).catch(() => false);
    if (exists) {
      const content = await fs.readFile(TIMESTAMPS_FILE, "utf-8");
      const data = JSON.parse(content);
      return data[key] || null;
    }
  } catch (e) {
    console.error("Failed to read local timestamps:", e);
  }
  return null;
}

async function setLocalTimestamp(key: string, timestamp: string): Promise<void> {
  try {
    let data: any = {};
    const exists = await fs.access(TIMESTAMPS_FILE).then(() => true).catch(() => false);
    if (exists) {
      const content = await fs.readFile(TIMESTAMPS_FILE, "utf-8");
      data = JSON.parse(content);
    }
    data[key] = timestamp;
    await fs.writeFile(TIMESTAMPS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write local timestamp:", e);
  }
}

// Structure of our database
interface PortfolioDB {
  projects: any[];
  skills: any[];
  experiences: any[];
  educations: any[];
  messages: any[];
  settings: any;
  certificates: any[];
  publications: any[];
  visitors?: any[];
}

// Initialize Firebase DB connection lazily to handle missing config safely
let dbInstance: any = null;

async function getFirebaseDB() {
  if (dbInstance) return dbInstance;
  try {
    const CONFIG_FILE = path.join(process.cwd(), "firebase-applet-config.json");
    const exists = await fs.access(CONFIG_FILE).then(() => true).catch(() => false);
    if (!exists) {
      console.warn("firebase-applet-config.json not found! Falling back to local state.");
      return null;
    }
    const configContent = await fs.readFile(CONFIG_FILE, "utf-8");
    const firebaseConfig = JSON.parse(configContent);
    const app = initializeApp(firebaseConfig);
    const dbId = firebaseConfig.firestoreDatabaseId;
    dbInstance = dbId ? getFirestore(app, dbId) : getFirestore(app);
    return dbInstance;
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    return null;
  }
}

// Maximum base64 string characters stored per Firestore document chunk (~520KB safe limit under 1MB)
const MAX_DOC_CHARS = 700000;

// Save media permanently into Firestore (single document or chunked for large files/PDFs)
async function saveMediaToFirestore(fileName: string, mimeType: string, base64Data: string): Promise<boolean> {
  try {
    const db = await getFirebaseDB();
    if (!db) return false;

    // Sanitize document ID for firestore (no slashes)
    const docId = fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const timestamp = new Date().toISOString();
    const size = Buffer.byteLength(base64Data, "base64");

    if (base64Data.length <= MAX_DOC_CHARS) {
      await setDoc(doc(db, "uploaded_media", docId), {
        fileName,
        mimeType,
        size,
        data: base64Data,
        isChunked: false,
        totalChunks: 1,
        updatedAt: timestamp
      });
      console.log(`[Media Persist] Saved ${fileName} (${(size / 1024).toFixed(1)} KB) directly to Firestore`);
      return true;
    }

    // Oversized media: chunk across subcollection
    const totalChunks = Math.ceil(base64Data.length / MAX_DOC_CHARS);
    await setDoc(doc(db, "uploaded_media", docId), {
      fileName,
      mimeType,
      size,
      isChunked: true,
      totalChunks,
      updatedAt: timestamp
    });

    for (let i = 0; i < totalChunks; i++) {
      const chunkStr = base64Data.substring(i * MAX_DOC_CHARS, (i + 1) * MAX_DOC_CHARS);
      await setDoc(doc(db, "uploaded_media", docId, "chunks", String(i)), {
        index: i,
        data: chunkStr
      });
    }
    console.log(`[Media Persist] Saved ${fileName} (${(size / 1024).toFixed(1)} KB) chunked into ${totalChunks} docs in Firestore`);
    return true;
  } catch (err) {
    console.error(`[Media Persist] Failed to save media [${fileName}] to Firestore:`, err);
    return false;
  }
}

// Retrieve media from Firestore (rebuilding from chunks if necessary)
async function getMediaFromFirestore(fileName: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
  try {
    const db = await getFirebaseDB();
    if (!db) return null;

    const docId = fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const docRef = doc(db, "uploaded_media", docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const docData = docSnap.data();
    const mimeType = docData.mimeType || "image/jpeg";

    if (!docData.isChunked && docData.data) {
      const buffer = Buffer.from(docData.data, "base64");
      return { buffer, mimeType };
    }

    if (docData.isChunked) {
      const chunksSnap = await getDocs(collection(db, "uploaded_media", docId, "chunks"));
      const chunks: { index: number; data: string }[] = [];
      chunksSnap.forEach((c) => {
        chunks.push(c.data() as { index: number; data: string });
      });
      chunks.sort((a, b) => a.index - b.index);
      const fullBase64 = chunks.map(c => c.data).join("");
      const buffer = Buffer.from(fullBase64, "base64");
      return { buffer, mimeType };
    }

    return null;
  } catch (err) {
    console.error(`[Media Restore] Error restoring [${fileName}] from Firestore:`, err);
    return null;
  }
}

// Generate an elegant SVG placeholder for legacy missing files so that no broken [?] image is ever rendered
function generateFallbackSvg(fileName: string): string {
  const isDoc = fileName.toLowerCase().includes("pdf") || fileName.toLowerCase().includes("doc");
  const isCertificate = fileName.toLowerCase().includes("cert") || fileName.toLowerCase().includes("ijazah");
  
  let title = "Dokumentasi Kegiatan";
  let subtitle = "Foto dokumentasi kegiatan & pengalaman kerja";
  let iconPath = "M376 216h48l16 20h24a16 16 0 0 1 16 16v64a16 16 0 0 1-16 16H336a16 16 0 0 1-16-16v-64a16 16 0 0 1 16-16h24l16-20z M400 316a36 36 0 1 0 0-72 36 36 0 0 0 0 72z";

  if (isDoc || isCertificate) {
    title = isCertificate ? "Sertifikat / Ijazah" : "Dokumen Portofolio";
    subtitle = "Berkas resmi terverifikasi";
    iconPath = "M360 210h80v40h40v140H320V210h40zm40 10v30h30l-30-30zm-60 60h120v15H340zm0 30h120v15H340zm0 30h80v15H340z";
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080d1a"/>
      <stop offset="50%" stop-color="#0e172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00c2ff"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bgGrad)"/>
  <rect x="30" y="30" width="740" height="540" rx="28" fill="none" stroke="#1e293b" stroke-width="2" stroke-dasharray="10 8"/>
  <circle cx="400" cy="240" r="68" fill="#0369a1" fill-opacity="0.12" stroke="url(#ringGrad)" stroke-width="2.5"/>
  <path d="${iconPath}" fill="#00c2ff"/>
  <text x="400" y="360" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#f8fafc" text-anchor="middle">${title}</text>
  <text x="400" y="398" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="#94a3b8" text-anchor="middle">${subtitle}</text>
  <rect x="280" y="435" width="240" height="38" rx="19" fill="#0f172a" stroke="#00c2ff" stroke-width="1.5" stroke-opacity="0.4"/>
  <text x="400" y="459" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#38bdf8" text-anchor="middle">Portofolio Asset Aktif</text>
</svg>`;
}

// Deeply scan an object for base64 data URLs, offload them to permanent Firestore media storage + disk, and replace with /uploads/ URLs
async function offloadBase64Media(obj: any, contextKey: string): Promise<any> {
  if (!obj) return obj;
  if (typeof obj === "string") {
    const matches = obj.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mimeType = matches[1];
      const base64Data = matches[2];
      let ext = "jpg";
      if (mimeType.includes("png")) ext = "png";
      else if (mimeType.includes("webp")) ext = "webp";
      else if (mimeType.includes("pdf")) ext = "pdf";
      else if (mimeType.includes("svg")) ext = "svg";
      else if (mimeType.includes("gif")) ext = "gif";

      const prefix = contextKey.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
      const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });

      const buffer = Buffer.from(base64Data, "base64");
      await fs.writeFile(path.join(uploadsDir, fileName), buffer);

      // Save permanently to Firestore
      await saveMediaToFirestore(fileName, mimeType, base64Data);
      console.log(`[Auto-Offload] Offloaded ${contextKey} base64 (${(buffer.length / 1024).toFixed(1)} KB) -> /uploads/${fileName}`);
      return `/uploads/${fileName}`;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    const newArr = [];
    for (const item of obj) {
      newArr.push(await offloadBase64Media(item, contextKey));
    }
    return newArr;
  }
  if (typeof obj === "object") {
    const newObj: any = {};
    for (const [k, v] of Object.entries(obj)) {
      newObj[k] = await offloadBase64Media(v, `${contextKey}-${k}`);
    }
    return newObj;
  }
  return obj;
}

// One-time startup migration: cleans up embedded base64 in local DB and Firestore to keep documents <50KB!
async function migrateExistingBase64Media(db: PortfolioDB): Promise<PortfolioDB> {
  const jsonStr = JSON.stringify(db);
  if (!jsonStr.includes("data:image") && !jsonStr.includes("data:application/pdf")) {
    return db;
  }
  console.log("[Migration] Detected embedded base64 images in database. Offloading to permanent Firestore media storage...");
  const migrated: any = {};
  for (const [k, v] of Object.entries(db)) {
    migrated[k] = await offloadBase64Media(v, k);
  }

  // Save sanitized local JSON
  await fs.writeFile(DB_FILE, JSON.stringify(migrated, null, 2), "utf-8");

  // Sync sanitized documents to Firestore so they never hit 1MB limit
  const firestoreDb = await getFirebaseDB();
  if (firestoreDb) {
    for (const [k, v] of Object.entries(migrated)) {
      try {
        await setDoc(doc(firestoreDb, "portfolio_data", k), {
          data: v,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.error(`[Migration] Failed to sync cleaned ${k} to firestore:`, e);
      }
    }
  }
  console.log("[Migration] Successfully offloaded all embedded media into permanent Firestore storage!");
  return migrated;
}

// Initialize in-memory cache to guarantee zero data loss and instant responses
let memoryDB: PortfolioDB | null = null;

// Helper to get local data fallback (preferring current portfolio_db.json edits, then INITIAL_* constants)
async function getLocalFallback(key: string): Promise<any> {
  try {
    const fileExists = await fs.access(DB_FILE).then(() => true).catch(() => false);
    if (fileExists) {
      const content = await fs.readFile(DB_FILE, "utf-8");
      const localDB = JSON.parse(content);
      if (localDB && localDB[key] !== undefined) {
        return localDB[key];
      }
    }
  } catch (e) {
    console.error(`Failed to read local fallback for [${key}]:`, e);
  }
  
  switch (key) {
    case "projects": return INITIAL_PROJECTS;
    case "skills": return INITIAL_SKILLS;
    case "experiences": return INITIAL_EXPERIENCES;
    case "educations": return INITIAL_EDUCATIONS;
    case "messages": return INITIAL_MESSAGES;
    case "settings": return INITIAL_SETTINGS;
    case "certificates": return INITIAL_CERTIFICATES;
    case "publications": return INITIAL_PUBLICATIONS;
    case "visitors": return [];
    default: return null;
  }
}

// Try loading full portfolio from Firestore with a robust connection safeguard
async function loadPortfolioFromFirestore(): Promise<{ portfolio: PortfolioDB | null; hasErrors: boolean }> {
  const db = await getFirebaseDB();
  if (!db) return { portfolio: null, hasErrors: true };
  
  const keys = ["projects", "skills", "experiences", "educations", "messages", "settings", "certificates", "publications", "visitors"];
  const portfolio: Partial<PortfolioDB> = {};
  let anyLoaded = false;
  let hasErrors = false;
  
  const results = await Promise.all(
    keys.map(async (key) => {
      try {
        const docRef = doc(db, "portfolio_data", key);
        const docSnap = await getDoc(docRef);
        const localTimeStr = await getLocalTimestamp(key);
        
        if (docSnap.exists()) {
          anyLoaded = true;
          const cloudDoc = docSnap.data();
          const cloudTimeStr = cloudDoc.updatedAt;
          
          if (localTimeStr && cloudTimeStr) {
            const localTime = new Date(localTimeStr).getTime();
            const cloudTime = new Date(cloudTimeStr).getTime();
            if (localTime > cloudTime) {
              console.log(`Local timestamp for [${key}] is newer than cloud. Preferring local file data.`);
              const localData = await getLocalFallback(key);
              return { key, data: localData, ok: true };
            }
          }
          
          return { key, data: cloudDoc.data, ok: true };
        }
        
        const localData = await getLocalFallback(key);
        if (localData !== null && localData !== undefined) {
          anyLoaded = true;
        }
        return { key, data: localData, ok: true };
      } catch (err) {
        console.error(`Error loading segment [${key}] from Firestore:`, err);
        hasErrors = true;
        return { key, data: null, ok: false };
      }
    })
  );
  
  if (hasErrors) {
    return { portfolio: null, hasErrors: true };
  }
  
  if (!anyLoaded) {
    return { portfolio: null, hasErrors: false }; // Genuinely blank cloud database
  }
  
  for (const res of results) {
    if (res.data !== null) {
      portfolio[res.key as keyof PortfolioDB] = res.data;
    } else {
      portfolio[res.key as keyof PortfolioDB] = await getLocalFallback(res.key);
    }
  }
  
  return { portfolio: portfolio as PortfolioDB, hasErrors: false };
}

// Ensure the portfolio state is loaded from Firestore or migrated
async function initDB(): Promise<PortfolioDB> {
  if (memoryDB) {
    return memoryDB;
  }

  try {
    // 1. Check local file first for cached persistence
    let localDB: PortfolioDB = {
      projects: await getLocalFallback("projects"),
      skills: await getLocalFallback("skills"),
      experiences: await getLocalFallback("experiences"),
      educations: await getLocalFallback("educations"),
      messages: await getLocalFallback("messages"),
      settings: await getLocalFallback("settings"),
      certificates: await getLocalFallback("certificates"),
      publications: await getLocalFallback("publications"),
      visitors: (await getLocalFallback("visitors")) || []
    };

    // 2. Try loading from persistent Firestore
    const { portfolio: cloudDB, hasErrors } = await loadPortfolioFromFirestore();
    
    if (!hasErrors && cloudDB) {
      // Merge cloud data safely (respecting whatever was updated latest)
      localDB = {
        ...localDB,
        ...cloudDB
      };
      await fs.writeFile(DB_FILE, JSON.stringify(localDB, null, 2), "utf-8");
    } else if (!hasErrors && !cloudDB) {
      // Firestore is completely fresh/empty - seed initial data to Firestore
      console.log("Firestore database is empty. Migrating local file data or default configurations to Cloud Firestore...");
      const db = await getFirebaseDB();
      if (db) {
        await Promise.all(
          Object.entries(localDB).map(async ([key, val]) => {
            try {
              await setDoc(doc(db, "portfolio_data", key), {
                data: val,
                updatedAt: new Date().toISOString()
              });
              console.log(`Migrated [${key}] segment successfully into Firestore.`);
            } catch (err) {
              console.error(`Failed to migrate [${key}] segment to Firestore:`, err);
            }
          })
        );
      }
    }

    // 3. Clean up any embedded base64 in local DB or cloud, offloading to permanent Firestore media storage
    localDB = await migrateExistingBase64Media(localDB);

    memoryDB = localDB;
    return memoryDB;
  } catch (error) {
    console.error("Error initializing database, using defaults:", error);
    memoryDB = {
      projects: INITIAL_PROJECTS,
      skills: INITIAL_SKILLS,
      experiences: INITIAL_EXPERIENCES,
      educations: INITIAL_EDUCATIONS,
      messages: INITIAL_MESSAGES,
      settings: INITIAL_SETTINGS,
      certificates: INITIAL_CERTIFICATES,
      publications: INITIAL_PUBLICATIONS
    };
    return memoryDB;
  }
}

async function startServer() {
  const app = express();

  // Support large Base64 project/profile images uploaded via Admin Interface
  app.use(express.json({ limit: "150mb" }));
  app.use(express.urlencoded({ limit: "150mb", extended: true }));

  // Serve uploaded images and documents with Self-Healing from Firestore & graceful fallback
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  // Self-healing /uploads/:fileName handler:
  // If file exists on disk, serves it immediately.
  // If not on disk (e.g. container was restarted/scaled), restores from Firestore uploaded_media and caches back to disk!
  // If not found anywhere (e.g. legacy missing file), returns an attractive SVG graphic so no broken [?] image is ever rendered!
  app.get("/uploads/:fileName", async (req, res) => {
    try {
      const rawFileName = req.params.fileName;
      const fileName = path.basename(rawFileName);
      const filePath = path.join(uploadsDir, fileName);

      // 1. Check local disk first
      const existsOnDisk = await fs.access(filePath).then(() => true).catch(() => false);
      if (existsOnDisk) {
        return res.sendFile(filePath, {
          maxAge: "30d",
          immutable: true
        });
      }

      // 2. Self-Healing: Fetch from permanent Firestore media storage
      console.log(`[Uploads] File not on disk: ${fileName}. Restoring from Firestore...`);
      const media = await getMediaFromFirestore(fileName);
      if (media && media.buffer) {
        await fs.writeFile(filePath, media.buffer).catch(() => {});
        res.setHeader("Content-Type", media.mimeType);
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        console.log(`[Uploads] Successfully restored ${fileName} (${(media.buffer.length / 1024).toFixed(1)} KB) from Firestore!`);
        return res.send(media.buffer);
      }

      // 3. Fallback: Serve graceful SVG asset so UI never shows a broken icon
      console.warn(`[Uploads] File ${fileName} not found. Serving graceful SVG placeholder.`);
      const svg = generateFallbackSvg(fileName);
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.send(svg);
    } catch (err) {
      console.error(`[Uploads] Error serving ${req.params.fileName}:`, err);
      const svg = generateFallbackSvg(req.params.fileName || "media.jpg");
      res.setHeader("Content-Type", "image/svg+xml");
      return res.send(svg);
    }
  });

  app.use("/uploads", express.static(uploadsDir));

  // API Endpoints for dynamic content fetching & management

  // 1. Get entire portfolio state
  app.get("/api/portfolio", async (req, res) => {
    try {
      const db = await initDB();
      res.json(db);
    } catch (error) {
      console.error("Failed to read portfolio data:", error);
      res.status(500).json({ error: "Failed to read portfolio data" });
    }
  });

  // 2. Update specific table or section of the database
  app.post("/api/portfolio/update", async (req, res) => {
    try {
      const { key, data } = req.body;
      const validKeys = ["projects", "skills", "experiences", "educations", "messages", "settings", "certificates", "publications", "visitors"];
      
      if (!key || !validKeys.includes(key)) {
        return res.status(400).json({ error: "Invalid collection key" });
      }

      const timestamp = new Date().toISOString();

      // Automatically offload any embedded base64 strings into permanent Firestore storage
      // This guarantees Firestore documents stay lightweight (<50KB) and NEVER exceed 1MB limits!
      const sanitizedData = await offloadBase64Media(data, key);

      // Update in cloud Firestore (with safe fallback to local cache on error)
      const db = await getFirebaseDB();
      let firebaseSynced = false;
      if (db) {
        try {
          await setDoc(doc(db, "portfolio_data", key), {
            data: sanitizedData,
            updatedAt: timestamp
          });
          firebaseSynced = true;
          console.log(`Successfully persisted [${key}] segment in Firestore.`);
        } catch (err) {
          console.error(`Failed to write [${key}] to Firestore (falling back to local file):`, err);
        }
      }

      // Always write local timestamp to ensure local edits can be compared
      await setLocalTimestamp(key, timestamp);

      // Sync local file cache (ensures changes are always saved!)
      const cached = await initDB();

      // If we are updating messages, check if a new message was added!
      if (key === "messages") {
        const oldMessages = cached.messages || [];
        const newMessages = sanitizedData || [];
        
        if (newMessages.length > oldMessages.length && newMessages.length > 0) {
          const newMsg = newMessages[0]; // new messages are inserted at the head
          const settings = cached.settings || {};
          
          if (settings.enableEmailNotify !== false) {
            console.log(`Dispatched automatic background SMTP notification for message from ${newMsg.sender}`);
            sendEmailNotification(newMsg, settings).catch(err => {
              console.error("Failed to dispatch background email notification:", err);
            });
          }
        }
      }

      cached[key as keyof PortfolioDB] = sanitizedData;
      memoryDB = cached;
      await fs.writeFile(DB_FILE, JSON.stringify(cached, null, 2), "utf-8");

      console.log(`Database key [${key}] successfully updated on server. Firebase synced: ${firebaseSynced}`);
      res.json({ success: true, firebaseSynced, data: sanitizedData });
    } catch (error) {
      console.error("Failed to update portfolio data:", error);
      res.status(500).json({ error: "Failed to update portfolio data" });
    }
  });

  // 3. Reset entire database back to default initial values
  app.post("/api/portfolio/reset", async (req, res) => {
    try {
      const defaultDB: PortfolioDB = {
        projects: INITIAL_PROJECTS,
        skills: INITIAL_SKILLS,
        experiences: INITIAL_EXPERIENCES,
        educations: INITIAL_EDUCATIONS,
        messages: INITIAL_MESSAGES,
        settings: INITIAL_SETTINGS,
        certificates: INITIAL_CERTIFICATES,
        publications: INITIAL_PUBLICATIONS
      };

      memoryDB = defaultDB;

      // Reset in cloud Firestore first
      const db = await getFirebaseDB();
      if (db) {
        await Promise.all(
          Object.entries(defaultDB).map(async ([key, val]) => {
            try {
              await setDoc(doc(db, "portfolio_data", key), {
                data: val,
                updatedAt: new Date().toISOString()
              });
            } catch (err) {
              console.error(`Failed to reset [${key}] in Firestore:`, err);
            }
          })
        );
        console.log("Firestore database successfully reset back to defaults.");
      }

      // Clear local timestamps
      await fs.unlink(TIMESTAMPS_FILE).catch(() => {});

      await fs.writeFile(DB_FILE, JSON.stringify(defaultDB, null, 2), "utf-8");
      console.log("Database reset to defaults.");
      res.json({ success: true, db: defaultDB });
    } catch (error) {
      console.error("Failed to reset portfolio database:", error);
      res.status(500).json({ error: "Failed to reset portfolio database" });
    }
  });

  // 4. Upload file (Images & PDFs) - stores files locally in /public/uploads/
  // Prevents Firestore document 1MB limits from being exceeded and guarantees high-res quality!
  app.post("/api/upload", async (req, res) => {
    try {
      const { fileData, fileName, folder } = req.body;
      if (!fileData || typeof fileData !== 'string') {
        return res.status(400).json({ error: "Missing fileData (Base64 Data URL required)" });
      }

      // Check format
      const matches = fileData.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid Data URL base64 format" });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");

      // Infer extension
      let ext = "jpg";
      if (mimeType.includes("png")) ext = "png";
      else if (mimeType.includes("webp")) ext = "webp";
      else if (mimeType.includes("pdf")) ext = "pdf";
      else if (mimeType.includes("svg")) ext = "svg";
      else if (mimeType.includes("gif")) ext = "gif";

      const prefix = folder ? `${folder}-` : "media-";
      const cleanFileName = `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      const targetPath = path.join(uploadsDir, cleanFileName);
      
      // Save locally to disk for instant zero-latency serving
      await fs.writeFile(targetPath, buffer);

      // Save permanently to Cloud Firestore (with chunking support for large files/PDFs)
      const firestorePersisted = await saveMediaToFirestore(cleanFileName, mimeType, base64Data);

      const publicUrl = `/uploads/${cleanFileName}`;
      console.log(`[Upload] File saved successfully: ${publicUrl} (${(buffer.length / 1024).toFixed(1)} KB, mime: ${mimeType}, firestore: ${firestorePersisted})`);
      res.json({ success: true, url: publicUrl, fileName: cleanFileName, mimeType, firestorePersisted });
    } catch (err) {
      console.error("File upload error:", err);
      res.status(500).json({ error: "Failed to save uploaded file" });
    }
  });

  // 5. Visitor tracking & recording
  app.post("/api/visitors/record", async (req, res) => {
    try {
      const {
        visitorId,
        deviceType,
        browser,
        os,
        screenResolution,
        referrer,
        city,
        region,
        country,
        countryCode,
        ip: clientIp,
        section,
        visitedSections
      } = req.body;

      if (!visitorId) {
        return res.status(400).json({ error: "visitorId is required" });
      }

      const headerIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || '';
      const ip = clientIp || (headerIp.startsWith('::ffff:') ? headerIp.replace('::ffff:', '') : headerIp) || '127.0.0.1';

      const cached = await initDB();
      if (!cached.visitors) {
        cached.visitors = [];
      }

      const nowIso = new Date().toISOString();
      const existingIndex = cached.visitors.findIndex((v: any) => v.visitorId === visitorId);

      if (existingIndex !== -1) {
        const existing = cached.visitors[existingIndex];
        const updatedSections = Array.from(new Set([
          ...(existing.visitedSections || []),
          ...(visitedSections || []),
          ...(section ? [section] : [])
        ]));
        
        const firstTime = new Date(existing.timestamp).getTime();
        const currentTime = new Date(nowIso).getTime();
        const durationSeconds = Math.max(existing.durationSeconds || 0, Math.round((currentTime - firstTime) / 1000));

        cached.visitors[existingIndex] = {
          ...existing,
          lastActive: nowIso,
          durationSeconds,
          visitedSections: updatedSections,
          visitCount: (existing.visitCount || 1) + (section ? 0 : 1),
          ip: (ip && ip !== '127.0.0.1' && ip !== '::1') ? ip : (existing.ip || ip),
          city: city || existing.city || 'Indonesia',
          region: region || existing.region,
          country: country || existing.country || 'Indonesia',
          countryCode: countryCode || existing.countryCode || 'ID'
        };
      } else {
        const newVisitor = {
          id: `vis-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          visitorId,
          timestamp: nowIso,
          lastActive: nowIso,
          ip: (ip && ip !== '127.0.0.1' && ip !== '::1') ? ip : '127.0.0.1',
          city: city || 'Indonesia',
          region: region || '',
          country: country || 'Indonesia',
          countryCode: countryCode || 'ID',
          deviceType: deviceType || 'Desktop',
          browser: browser || 'Unknown',
          os: os || 'Unknown',
          screenResolution: screenResolution || '',
          referrer: referrer || 'Direct',
          visitedSections: visitedSections || (section ? [section] : ['Home']),
          durationSeconds: 1,
          visitCount: 1
        };
        cached.visitors.unshift(newVisitor);
      }

      // Cap at most recent 500 visitors
      if (cached.visitors.length > 500) {
        cached.visitors = cached.visitors.slice(0, 500);
      }

      memoryDB = cached;
      await fs.writeFile(DB_FILE, JSON.stringify(cached, null, 2), "utf-8");

      // Asynchronously sync top visitors to Firestore
      const db = await getFirebaseDB();
      if (db) {
        setDoc(doc(db, "portfolio_data", "visitors"), {
          data: cached.visitors.slice(0, 150),
          updatedAt: nowIso
        }).catch(e => console.error("Firestore visitor update failed:", e));
      }

      res.json({ success: true, count: cached.visitors.length });
    } catch (err) {
      console.error("Failed to record visitor:", err);
      res.status(500).json({ error: "Failed to record visitor" });
    }
  });

  // 6. Get visitors log and stats
  app.get("/api/visitors", async (req, res) => {
    try {
      const cached = await initDB();
      const visitors = cached.visitors || [];
      res.json({ success: true, visitors });
    } catch (err) {
      console.error("Failed to get visitors:", err);
      res.status(500).json({ error: "Failed to get visitors" });
    }
  });

  // 7. Clear visitors history
  app.post("/api/visitors/clear", async (req, res) => {
    try {
      const cached = await initDB();
      cached.visitors = [];
      memoryDB = cached;
      await fs.writeFile(DB_FILE, JSON.stringify(cached, null, 2), "utf-8");
      
      const db = await getFirebaseDB();
      if (db) {
        await setDoc(doc(db, "portfolio_data", "visitors"), {
          data: [],
          updatedAt: new Date().toISOString()
        }).catch(() => {});
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to clear visitors:", err);
      res.status(500).json({ error: "Failed to clear visitors" });
    }
  });

  // Integrate Vite for hot reloads and asset compilation
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();

async function sendEmailNotification(message: any, settings: any) {
  const smtpHost = settings.smtpHost;
  const smtpPort = parseInt(settings.smtpPort || "465", 10);
  const smtpUser = settings.smtpUser;
  const smtpPass = settings.smtpPass;
  const recipient = settings.contactEmail || "fikrryandi@gmail.com";
  const senderName = settings.senderName || "Fikri Portfolio Form";

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn("[SMTP Warn] SMTP settings are incomplete. Skipping email generation.");
    return;
  }

  const secure = smtpPort === 465;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: secure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const subject = `[Notification] Baru! Pesan masuk dari ${message.sender}`;
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
      <h2 style="color: #6d28d9; margin-top: 0; font-size: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
        ✉️ Ada Pesan Baru di Portofolio Anda!
      </h2>
      <p style="font-size: 14px; color: #334155;">Seseorang baru saja mengirimkan pesan melalui formulir kontak Anda di website Portofolio.</p>
      
      <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 15px; margin-bottom: 15px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #475569; width: 120px;">Nama Pengirim:</td>
            <td style="padding: 6px 0; color: #0f172a;">${message.sender}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #475569;">Email Pengirim:</td>
            <td style="padding: 6px 0; color: #6d28d9; font-weight: 500;">
              <a href="mailto:${message.email}" style="color: #6d28d9; text-decoration: none;">${message.email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #475569;">Subjek:</td>
            <td style="padding: 6px 0; color: #0f172a;">${message.subject || 'Kontak Portofolio'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #475569; vertical-align: top;">Pesan:</td>
            <td style="padding: 10px; color: #1e293b; background-color: #f1f5f9; border-radius: 6px; font-family: monospace; white-space: pre-wrap; line-height: 1.5; margin-top: 5px; display: block;">${message.message}</td>
          </tr>
        </table>
      </div>
      
      <p style="font-size: 11px; color: #64748b; text-align: center; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px; line-height: 1.4;">
        Sistem Notifikasi Portofolio Otomatis &bull; Dikirim menggunakan SMTP yang dikonfigurasi melalui modul Admin Settings Anda.
      </p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"${senderName}" <${smtpUser}>`,
    to: recipient,
    subject: subject,
    html: htmlContent,
  });

  console.log("Email notification dispatched successfully, messageId:", info.messageId);
}
