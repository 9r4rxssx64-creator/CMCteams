#!/usr/bin/env node
/**
 * cli.js — Interface ligne de commande pour le système social
 *
 * Usage :
 *   node tools/social/cli.js generate --type narrative --story betrayal-001 --format short
 *   node tools/social/cli.js generate --type narrative --random --format long
 *   node tools/social/cli.js list-stories
 *   node tools/social/cli.js list-voices
 *   node tools/social/cli.js test-tts --text "Hello world" --voice en-US-GuyNeural
 *   node tools/social/cli.js publish-telegram --video <path>
 *   node tools/social/cli.js status
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SOCIAL_ROOT = __dirname;

/* ---------- Argument parsing ---------- */

function parseArgs(argv) {
  const cmd = argv[2];
  const args = { _cmd: cmd };
  for (let i = 3; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

/* ---------- Commands ---------- */

async function cmdListStories() {
  const lib = JSON.parse(
    fs.readFileSync(path.join(SOCIAL_ROOT, "config", "content-library.json"), "utf8")
  );
  console.log("\n📚 Bibliothèque de contenus\n");
  for (const [category, items] of Object.entries(lib)) {
    if (category.startsWith("_")) continue;
    console.log(`\n=== ${category} ===`);
    for (const item of items) {
      const status = item.used ? "✅" : "🆕";
      console.log(`  ${status} ${item.id}  [${item.lang}]  "${item.title}"  (${item.tags.join(", ")})`);
    }
  }
  console.log("");
}

async function cmdListVoices() {
  const { listVoices, VOICES } = await import("./engine/tts.js");
  console.log("\n🗣 Voix recommandées (par cas d'usage)\n");
  for (const [k, v] of Object.entries(VOICES)) {
    console.log(`  ${k.padEnd(35)} → ${v}`);
  }
  console.log("\n📡 Récupération de la liste complète depuis Edge TTS...");
  try {
    const voices = await listVoices();
    console.log(`Total : ${voices.length} voix disponibles`);
    const byLocale = {};
    for (const v of voices) {
      const loc = v.Locale || v.locale || "unknown";
      byLocale[loc] = (byLocale[loc] || 0) + 1;
    }
    const top = Object.entries(byLocale).sort((a, b) => b[1] - a[1]).slice(0, 15);
    console.log("\nTop 15 langues :");
    for (const [l, n] of top) console.log(`  ${l.padEnd(10)} : ${n} voix`);
  } catch (e) {
    console.error("⚠ Impossible de récupérer les voix :", e.message);
  }
}

async function cmdTestTts(args) {
  const { generateSpeech, VOICES } = await import("./engine/tts.js");
  const text = args.text || "Hello, this is a test of the Microsoft Edge text to speech engine.";
  const voice = args.voice || VOICES.en_storytelling_male_dramatic;
  const out = args.out || path.join(SOCIAL_ROOT, "output", "tts-test.mp3");

  console.log(`🗣 TTS test : "${text.substring(0, 60)}..."`);
  console.log(`   Voix    : ${voice}`);
  console.log(`   Sortie  : ${out}\n`);

  const result = await generateSpeech(text, {
    outputPath: out,
    voice,
    rate: parseInt(args.rate || "0", 10),
    pitch: parseInt(args.pitch || "0", 10),
  });

  console.log(`✅ Audio généré`);
  console.log(`   Fichier : ${result.audioPath}`);
  console.log(`   Taille  : ${(result.sizeBytes / 1024).toFixed(1)} KB`);
  console.log(`   Durée   : ~${(result.durationMs / 1000).toFixed(1)}s (estimation)`);
}

async function cmdGenerate(args) {
  const type = args.type || "narrative";
  const format = args.format || "long"; // long | short

  // --- Option : générer un script via Gemma 4 AI ---
  if (args["ai-script"]) {
    const { generateScript, addToLibrary } = await import("./engine/script-generator.js");
    const niche = args.niche || "betrayal-revenge";
    const length = args.length || (format === "short" ? "short" : "medium");
    console.log(`\n🤖 Génération script via Gemma 4 (niche=${niche}, length=${length})...`);
    const newScript = await generateScript({ niche, length, topic: args.topic, language: args.language });
    console.log(`✅ Script généré : "${newScript.title}" (${newScript.wordCount} mots)`);

    // Ajoute à la library et continue avec ce script
    addToLibrary(newScript);
    args.story = newScript.id;
  }

  const lib = JSON.parse(
    fs.readFileSync(path.join(SOCIAL_ROOT, "config", "content-library.json"), "utf8")
  );

  // Trouve la catégorie qui matche le type
  const matchingCategories = Object.keys(lib).filter(
    (k) => !k.startsWith("_") && k.includes(type)
  );
  if (matchingCategories.length === 0) {
    console.error(`❌ Aucune catégorie pour type="${type}". Disponibles :`, Object.keys(lib).filter((k) => !k.startsWith("_")));
    process.exit(1);
  }

  // Sélectionne une histoire
  let story = null;
  if (args.story) {
    for (const cat of matchingCategories) {
      const found = lib[cat].find((s) => s.id === args.story);
      if (found) { story = found; break; }
    }
    if (!story) {
      console.error(`❌ Histoire "${args.story}" introuvable`);
      process.exit(1);
    }
  } else if (args.random) {
    // Première non utilisée d'une catégorie aléatoire
    const cat = matchingCategories[Math.floor(Math.random() * matchingCategories.length)];
    const unused = lib[cat].filter((s) => !s.used);
    if (unused.length === 0) {
      console.error(`❌ Toutes les histoires de ${cat} sont déjà utilisées`);
      process.exit(1);
    }
    story = unused[Math.floor(Math.random() * unused.length)];
  } else {
    // Premier non utilisé
    for (const cat of matchingCategories) {
      const unused = lib[cat].filter((s) => !s.used);
      if (unused.length > 0) { story = unused[0]; break; }
    }
    if (!story) {
      console.error(`❌ Toutes les histoires sont utilisées. Utilise --story <id> pour forcer.`);
      process.exit(1);
    }
  }

  console.log(`\n🎬 Génération vidéo`);
  console.log(`   Story  : ${story.id} — "${story.title}"`);
  console.log(`   Tags   : ${story.tags.join(", ")}`);
  console.log(`   Format : ${format}`);
  console.log(`   Mots   : ${story.script.split(/\s+/).length}\n`);

  const { generateNarrativeVideo } = await import("./templates/narrative-storytelling.js");
  const musicPath = args.music || findFirstMusic();
  const result = await generateNarrativeVideo(story, {
    format,
    musicPath,
    bgImage: args.bg,
    verbose: args.verbose === true || args.verbose === "true",
    keepFrames: args.keep === true || args.keep === "true",
  });

  console.log(`\n✅ Vidéo générée`);
  console.log(`   Path     : ${result.videoPath}`);
  console.log(`   Durée    : ${result.durationSec.toFixed(1)}s`);
  console.log(`   Taille   : ${(result.metadata.sizeBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Format   : ${result.metadata.width}x${result.metadata.height}`);

  // Sauvegarde le metadata
  const metaPath = path.join(path.dirname(result.videoPath), "metadata.json");
  fs.writeFileSync(metaPath, JSON.stringify(result.metadata, null, 2));
  console.log(`   Metadata : ${metaPath}`);

  // Si --send-telegram, envoie automatiquement
  if (args["send-telegram"]) {
    console.log(`\n📤 Envoi sur Telegram...`);
    await sendVideoTelegram(result.videoPath, result.metadata);
  }
}

async function cmdPublishTelegram(args) {
  const video = args.video;
  if (!video || !fs.existsSync(video)) {
    console.error(`❌ Fichier vidéo introuvable : ${video}`);
    process.exit(1);
  }
  const metaPath = path.join(path.dirname(video), "metadata.json");
  const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, "utf8")) : {};
  await sendVideoTelegram(video, meta);
}

async function sendVideoTelegram(videoPath, metadata) {
  const tgPath = "/home/user/CMCteams/tools/integrations/telegram/client.js";
  if (!fs.existsSync(tgPath)) {
    console.error(`❌ Client Telegram introuvable : ${tgPath}`);
    return;
  }
  const tg = await import(tgPath);

  const sizeMB = fs.statSync(videoPath).size / 1024 / 1024;
  const caption = [
    `🎬 <b>${escapeHtml(metadata.title || "Vidéo générée")}</b>`,
    `Format: ${metadata.format} · ${metadata.width}x${metadata.height}`,
    `Durée: ${metadata.durationMs ? (metadata.durationMs/1000).toFixed(1)+"s" : "?"}`,
    `Taille: ${sizeMB.toFixed(2)} MB`,
    metadata.tags ? `Tags: ${metadata.tags.join(", ")}` : "",
    "",
    "Réponds <code>OK</code> pour publier ou <code>NO</code> pour annuler.",
  ].filter(Boolean).join("\n");

  if (sizeMB > 50) {
    // Telegram limite à 50MB pour les bots simples
    console.log(`⚠ Vidéo > 50 MB, envoi en document...`);
    await tg.sendDocument(videoPath, caption, { parse_mode: "HTML" });
  } else {
    // Bots peuvent envoyer photos directement, pour vidéos il faut sendVideo
    // On utilise sendDocument pour fiabilité
    await tg.sendDocument(videoPath, caption, { parse_mode: "HTML" });
  }
  console.log(`✅ Envoyé sur Telegram (${sizeMB.toFixed(2)} MB)`);
}

async function cmdGenerateScript(args) {
  const { generateScript, generateBatch, addToLibrary } = await import("./engine/script-generator.js");
  const niche = args.niche || "betrayal-revenge";
  const length = args.length || "medium";
  const count = parseInt(args.count || "1", 10);

  console.log(`\n🤖 Génération de ${count} script(s) via Gemma 4`);
  console.log(`   Niche  : ${niche}`);
  console.log(`   Length : ${length}\n`);

  let scripts;
  if (count === 1) {
    scripts = [await generateScript({ niche, length, topic: args.topic, language: args.language })];
  } else {
    scripts = await generateBatch(count, { niche, length, language: args.language });
  }

  for (const s of scripts) {
    addToLibrary(s);
    console.log(`✅ ${s.id} — "${s.title}" (${s.wordCount} mots)`);
  }

  console.log(`\n📚 ${scripts.length} script(s) ajoutés à content-library.json`);
}

async function cmdExtractShorts(args) {
  const { extractShorts } = await import("./engine/shorts-extractor.js");
  const video = args.video;
  if (!video || !fs.existsSync(video)) {
    console.error(`❌ Vidéo introuvable : ${video}`);
    process.exit(1);
  }
  const count = parseInt(args.count || "3", 10);
  const duration = parseInt(args.duration || "45", 10);

  console.log(`\n✂️ Extraction de ${count} Shorts depuis ${path.basename(video)}`);
  const results = await extractShorts(video, { count, targetDurationSec: duration });

  console.log(`\n✅ ${results.length} Shorts extraits :`);
  for (const r of results) {
    const size = (fs.statSync(r.path).size / 1024 / 1024).toFixed(2);
    console.log(`   ${r.index}. ${path.basename(r.path)} (${size} MB, début: ${r.startSec.toFixed(1)}s)`);
  }
}

async function cmdPublish(args) {
  const platform = args.platform;
  const video = args.video;
  if (!platform || !video) {
    console.error(`❌ Usage : cli.js publish --platform <youtube|facebook|instagram> --video <path>`);
    process.exit(1);
  }
  if (!fs.existsSync(video)) {
    console.error(`❌ Vidéo introuvable : ${video}`);
    process.exit(1);
  }

  // Charge les metadata si dispo
  const metaPath = path.join(path.dirname(video), "metadata.json");
  const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, "utf8")) : {};

  const title = args.title || meta.title || path.basename(video, path.extname(video));
  const description = args.description || buildDefaultDescription(meta);
  const tags = args.tags ? args.tags.split(",") : (meta.tags || []);
  const privacy = args.privacy || "private";
  const isShort = args.short === true || args.short === "true";

  console.log(`\n📤 Publication sur ${platform.toUpperCase()}`);
  console.log(`   Titre   : ${title}`);
  console.log(`   Privacy : ${privacy}`);
  console.log(`   Vidéo   : ${path.basename(video)} (${(fs.statSync(video).size / 1024 / 1024).toFixed(2)} MB)\n`);

  let result;
  switch (platform) {
    case "youtube": {
      const { uploadVideo } = await import("./publishers/youtube.js");
      result = await uploadVideo(video, {
        title,
        description,
        tags,
        privacyStatus: privacy,
        isShort,
      });
      break;
    }
    case "facebook": {
      const { uploadVideo, createReel } = await import("./publishers/facebook.js");
      if (isShort) {
        result = await createReel(video, { description: title + "\n\n" + description });
      } else {
        result = await uploadVideo(video, { title, description, published: privacy === "public" });
      }
      break;
    }
    case "instagram": {
      const { publishReelFromFile } = await import("./publishers/instagram.js");
      result = await publishReelFromFile(video, { caption: title + "\n\n" + description });
      break;
    }
    default:
      console.error(`❌ Plateforme inconnue : ${platform}. Disponibles : youtube, facebook, instagram`);
      process.exit(1);
  }

  console.log(`\n✅ Publié sur ${platform} : ${JSON.stringify(result, null, 2)}`);
}

function buildDefaultDescription(meta) {
  const parts = [];
  if (meta.tags && meta.tags.length > 0) {
    parts.push("");
    parts.push(meta.tags.map((t) => "#" + t.replace(/\s+/g, "")).slice(0, 5).join(" "));
  }
  return parts.join("\n");
}

function cmdStatus() {
  console.log("\n📊 Status du système social\n");
  const out = path.join(SOCIAL_ROOT, "output");
  if (!fs.existsSync(out)) {
    console.log("Aucune vidéo générée encore.");
    return;
  }
  const dirs = fs.readdirSync(out).filter((d) => fs.statSync(path.join(out, d)).isDirectory());
  console.log(`Vidéos générées : ${dirs.length}`);
  for (const d of dirs) {
    const meta = path.join(out, d, "metadata.json");
    if (fs.existsSync(meta)) {
      const m = JSON.parse(fs.readFileSync(meta, "utf8"));
      console.log(`  📹 ${m.id}  "${m.title}"  ${m.format}  ${(m.sizeBytes/1024/1024).toFixed(2)}MB`);
    } else {
      console.log(`  📁 ${d}  (pas de metadata)`);
    }
  }
}

function cmdHelp() {
  console.log(`
🎬 CMCteams Social — Pipeline vidéo automatisé

USAGE :
  node tools/social/cli.js <command> [options]

COMMANDS :
  list-stories                    Liste les histoires de la bibliothèque
  list-voices                     Liste les voix TTS disponibles
  test-tts --text "..." --voice X Test rapide du TTS

  generate                        Génère une vidéo
    --type narrative              Type de contenu (défaut: narrative)
    --story <id>                  ID spécifique (défaut: première non utilisée)
    --random                      Sélection aléatoire
    --ai-script                   Génère un script via Gemma 4 avant la vidéo
    --niche <niche>               Niche pour AI script (betrayal-revenge, mystery, finance-lesson...)
    --format long|short           Format (défaut: long, 16:9)
    --music <path>                Musique de fond MP3 (optionnel)
    --bg <path>                   Image de fond (optionnel)
    --send-telegram               Envoie la vidéo sur Telegram après génération
    --keep                        Garde les frames PNG (debug)

  generate-script                 Génère script(s) via Gemma 4 (sans vidéo)
    --niche <niche>               betrayal-revenge | mystery | finance-lesson | motivation | true-crime
    --length <len>                short | medium | long | longform
    --count <n>                   Nombre de scripts à générer (défaut 1)
    --language en|fr              Langue (défaut en)
    --topic "..."                 Topic spécifique (sinon Gemma invente)

  extract-shorts --video <path>   Extrait N Shorts 9:16 depuis un long-form 16:9
    --count <n>                   Nombre de Shorts (défaut 3)
    --duration <sec>              Durée par Short en secondes (défaut 45)

  publish --platform <p> --video <path>  Publie sur une plateforme
    --platform youtube|facebook|instagram
    --title "..."                 Titre (défaut: lu depuis metadata)
    --description "..."           Description
    --tags "tag1,tag2"            Tags comma-separated
    --privacy private|unlisted|public  Pour YouTube (défaut private)
    --short                       Si c'est un Short/Reel

  publish-telegram --video <path> Envoie une vidéo existante sur Telegram

  status                          Liste les vidéos générées

EXEMPLES :
  node tools/social/cli.js list-stories
  node tools/social/cli.js test-tts --text "Hello world"
  node tools/social/cli.js generate --story betrayal-001 --format short --send-telegram
  node tools/social/cli.js generate --random --format long
`);
}

/* ---------- Helpers ---------- */

function findFirstMusic() {
  const musicDir = path.join(SOCIAL_ROOT, "assets", "music");
  if (!fs.existsSync(musicDir)) return null;
  const files = fs.readdirSync(musicDir).filter((f) => /\.(mp3|m4a|wav)$/i.test(f));
  return files.length > 0 ? path.join(musicDir, files[0]) : null;
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ---------- Main ---------- */

async function main() {
  const args = parseArgs(process.argv);
  const cmd = args._cmd;

  try {
    switch (cmd) {
      case "list-stories":      await cmdListStories(); break;
      case "list-voices":       await cmdListVoices(); break;
      case "test-tts":          await cmdTestTts(args); break;
      case "generate":          await cmdGenerate(args); break;
      case "generate-script":   await cmdGenerateScript(args); break;
      case "extract-shorts":    await cmdExtractShorts(args); break;
      case "publish":           await cmdPublish(args); break;
      case "publish-telegram":  await cmdPublishTelegram(args); break;
      case "status":            cmdStatus(); break;
      case "help":
      case "--help":
      case "-h":
      case undefined:
        cmdHelp();
        break;
      default:
        console.error(`❌ Commande inconnue : ${cmd}`);
        cmdHelp();
        process.exit(1);
    }
  } catch (err) {
    console.error(`\n❌ Erreur : ${err.message}`);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
  }
}

main();
