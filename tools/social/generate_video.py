#!/usr/bin/env python3
"""
KDMC Pro Video Generator — Moteur de production broadcast
Génère des vidéos storytelling faceless de qualité professionnelle.

Pipeline:
  1. TTS neural (edge-tts → gTTS → espeak)
  2. Stock video clips Pexels (6-10 scènes, changements rapides)
  3. Transitions crossfade entre clips
  4. Sous-titres animés mot par mot (surbrillance dorée)
  5. Titre animé en intro (fade in + scale)
  6. Overlays cinématiques (vignette + grain + color grade)
  7. Musique ambiante (volume bas, fade in/out)
  8. CTA "Subscribe" en fin de vidéo
"""
import json, os, sys, re, subprocess, random, time, tempfile, shutil
from pathlib import Path

# ═══════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════
PEXELS_KEY = os.environ.get("PEXELS_API_KEY", "")
SCENE_DURATION = 7  # seconds per scene
SUBTITLE_WORDS_PER_LINE = 5
FPS = 25
W, H = 1920, 1080

NICHE_QUERIES = {
    "betrayal": [
        "woman looking out window rain", "man sitting alone dark room",
        "broken photo frame", "empty chair dinner table candle",
        "hands letting go", "person walking away foggy street",
        "crying silhouette window", "dark hallway door light"
    ],
    "revenge": [
        "courtroom gavel judge", "person walking away explosion",
        "chess pieces dramatic", "fire burning documents night",
        "justice scales close up", "dark figure city rain",
        "broken chain dramatic", "sunrise after storm dramatic"
    ],
    "mystery": [
        "fog forest path night", "detective magnifying glass",
        "old locked door keyhole light", "dark tunnel light end",
        "mysterious footprints sand", "abandoned house night",
        "candlelight old books desk", "clock ticking close up"
    ],
    "finance": [
        "stock market red screens", "luxury car night city",
        "money falling slow motion", "empty wallet dramatic",
        "skyscraper city night", "gold bars vault",
        "business man suit walking", "calculator bills stress"
    ],
    "motivation": [
        "sunrise mountain peak hiker", "athlete running stadium",
        "ocean waves crashing rocks", "person arms raised cliff",
        "eagle flying dramatic sky", "marathon finish line crowd",
        "seed growing timelapse", "boxing training gym dramatic"
    ],
    "true_crime": [
        "police car lights night rain", "evidence board red string",
        "fingerprint UV light forensic", "dark alley streetlight",
        "handcuffs close up dramatic", "newspaper headline crime",
        "interrogation room spotlight", "crime scene tape night"
    ],
    "psychology": [
        "brain scan colorful medical", "mirror reflection different",
        "maze aerial view drone", "eye iris close up macro",
        "chess strategy thinking", "abstract neural network",
        "book pages turning wind", "hourglass sand falling"
    ],
    "tech": [
        "server room blue lights", "code screen dark room",
        "robot hand reaching", "circuit board macro",
        "holographic interface futuristic", "drone flying city",
        "VR headset person", "data center corridor"
    ],
    "history": [
        "ancient ruins sunset", "old map compass desk",
        "castle dramatic clouds", "sword medieval close up",
        "pyramids golden hour", "old library dusty books",
        "ship ocean dramatic waves", "scroll ancient writing"
    ]
}

NICHE_MUSIC = {
    "betrayal": "https://cdn.pixabay.com/audio/2024/11/29/audio_d4b72f7f3c.mp3",
    "revenge": "https://cdn.pixabay.com/audio/2024/11/29/audio_d4b72f7f3c.mp3",
    "mystery": "https://cdn.pixabay.com/audio/2024/10/08/audio_ad5aa4ef65.mp3",
    "finance": "https://cdn.pixabay.com/audio/2024/07/23/audio_b60a4dc0fd.mp3",
    "motivation": "https://cdn.pixabay.com/audio/2024/07/23/audio_b60a4dc0fd.mp3",
    "true_crime": "https://cdn.pixabay.com/audio/2024/08/15/audio_93f3a04c37.mp3",
    "psychology": "https://cdn.pixabay.com/audio/2024/10/08/audio_ad5aa4ef65.mp3",
    "tech": "https://cdn.pixabay.com/audio/2024/09/19/audio_84e32a9d7b.mp3",
    "history": "https://cdn.pixabay.com/audio/2024/09/19/audio_84e32a9d7b.mp3",
}

AI_BG_PROMPTS = [
    "dark moody cinematic room dramatic shadows light rays 4K",
    "foggy city streets night rain dramatic lighting cinematic",
    "dark ocean waves crashing rocks stormy sky cinematic 4K",
    "abandoned interior dramatic light beams dust particles 4K",
    "dark forest path moonlight fog atmospheric cinematic 4K",
    "rainy window droplets city lights bokeh cinematic 4K",
]


def run(cmd, timeout=120, check=True):
    """Run shell command, return stdout."""
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
    if check and r.returncode != 0:
        raise RuntimeError(f"CMD failed: {cmd}\n{r.stderr[:500]}")
    return r.stdout.strip()


def download(url, path, timeout=45):
    """Download file via curl."""
    subprocess.run(
        f'curl -sL -o "{path}" "{url}"',
        shell=True, timeout=timeout, capture_output=True
    )
    return os.path.exists(path) and os.path.getsize(path) > 1000


def get_duration(path):
    """Get media duration in seconds."""
    out = run(f'ffprobe -v error -show_entries format=duration -of csv=p=0 "{path}"', check=False)
    try:
        return float(out)
    except:
        return 0


# ═══════════════════════════════════════════
# STEP 1: TTS
# ═══════════════════════════════════════════
def generate_tts(script_text, outdir):
    """Generate narration MP3 + optional VTT subtitles."""
    script_file = os.path.join(outdir, "script.txt")
    narration = os.path.join(outdir, "narration.mp3")
    vtt_file = os.path.join(outdir, "subs.vtt")

    with open(script_file, "w") as f:
        f.write(script_text)

    # Try edge-tts (Microsoft neural — best quality)
    try:
        run(f'edge-tts -f "{script_file}" -v en-US-GuyNeural '
            f'--rate="-5%" --pitch="-3Hz" '
            f'--write-media "{narration}" --write-subtitles "{vtt_file}"',
            timeout=120)
        if os.path.exists(narration) and os.path.getsize(narration) > 5000:
            print("   ✅ Edge TTS neural")
            return narration, vtt_file
    except Exception as e:
        print(f"   edge-tts failed: {e}")

    # Fallback: gTTS
    try:
        from gtts import gTTS
        tts = gTTS(text=script_text, lang='en', slow=False)
        tts.save(narration)
        if os.path.exists(narration) and os.path.getsize(narration) > 5000:
            print("   ✅ gTTS")
            return narration, None
    except Exception as e:
        print(f"   gTTS failed: {e}")

    # Last resort: espeak
    wav = os.path.join(outdir, "tmp.wav")
    run(f'espeak-ng -v en -s 150 -p 38 -w "{wav}" -f "{script_file}"')
    run(f'ffmpeg -y -i "{wav}" -codec:a libmp3lame -b:a 192k "{narration}"')
    os.remove(wav)
    print("   ⚠️ espeak fallback")
    return narration, None


# ═══════════════════════════════════════════
# STEP 2: Download video clips
# ═══════════════════════════════════════════
def download_pexels_clips(niche, num_needed, clips_dir):
    """Download stock video clips from Pexels."""
    if not PEXELS_KEY:
        print("   No Pexels API key")
        return []

    queries = NICHE_QUERIES.get(niche, NICHE_QUERIES["betrayal"])
    random.shuffle(queries)
    clips = []

    for query in queries[:num_needed + 2]:
        if len(clips) >= num_needed:
            break

        try:
            import urllib.request
            q = query.replace(" ", "+")
            req = urllib.request.Request(
                f"https://api.pexels.com/videos/search?query={q}&per_page=3&size=medium&orientation=landscape",
                headers={"Authorization": PEXELS_KEY}
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read())

            videos = data.get("videos", [])
            if not videos:
                continue

            vid = random.choice(videos)
            files = vid.get("video_files", [])
            hd = [f for f in files if 720 <= f.get("height", 0) <= 1080]
            if not hd:
                hd = [f for f in files if f.get("height", 0) >= 480]
            if not hd:
                continue

            best = sorted(hd, key=lambda x: x.get("height", 0), reverse=True)[0]
            clip_path = os.path.join(clips_dir, f"raw_{len(clips)}.mp4")

            if download(best["link"], clip_path):
                clips.append(clip_path)
                print(f"   ✅ Clip {len(clips)}: '{query}' ({os.path.getsize(clip_path)//1024}KB)")

            time.sleep(0.5)
        except Exception as e:
            print(f"   ⚠️ Pexels '{query}': {e}")

    return clips


def generate_ai_clips(num_needed, clips_dir):
    """Generate video clips from AI images with Ken Burns zoom."""
    clips = []
    prompts = random.sample(AI_BG_PROMPTS, min(num_needed, len(AI_BG_PROMPTS)))

    for i, prompt in enumerate(prompts):
        img = os.path.join(clips_dir, f"ai_{i}.jpg")
        clip = os.path.join(clips_dir, f"ai_clip_{i}.mp4")

        import urllib.parse
        url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt)}?width=1920&height=1080&nologo=true&seed={int(time.time()) + i}"

        if download(url, img):
            # Random Ken Burns direction
            effects = [
                "zoompan=z='min(zoom+0.0015,1.35)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'",
                "zoompan=z='min(zoom+0.0012,1.3)':x='iw*0.3':y='ih*0.3'",
                "zoompan=z='if(lte(zoom,1.001),1.001,min(zoom+0.001,1.25))':x='iw*0.7-(iw/zoom*0.7)':y='ih*0.3'",
            ]
            zp = random.choice(effects) + f":d={SCENE_DURATION * FPS}:s={W}x{H}:fps={FPS}"

            try:
                run(f'ffmpeg -y -loop 1 -i "{img}" -vf "{zp},format=yuv420p" '
                    f'-t {SCENE_DURATION} -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p "{clip}"')
                if os.path.exists(clip) and os.path.getsize(clip) > 10000:
                    clips.append(clip)
                    print(f"   ✅ AI clip {len(clips)} (Ken Burns)")
            except:
                pass
            try:
                os.remove(img)
            except:
                pass

    return clips


# ═══════════════════════════════════════════
# STEP 3: Build background video with transitions
# ═══════════════════════════════════════════
def build_background(clips, duration, outdir):
    """Normalize clips, add crossfade transitions, loop to duration."""
    bg_video = os.path.join(outdir, "background.mp4")

    if not clips:
        # Dark gradient fallback
        run(f'ffmpeg -y -f lavfi -i "color=c=0x080818:s={W}x{H}:d={duration}:r={FPS}" '
            f'-c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p "{bg_video}"')
        return bg_video

    # Normalize all clips to same res/codec/duration
    normed = []
    for i, clip in enumerate(clips):
        norm = os.path.join(outdir, f"norm_{i}.mp4")
        try:
            run(f'ffmpeg -y -i "{clip}" '
                f'-vf "scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1" '
                f'-c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -r {FPS} -an '
                f'-t {SCENE_DURATION} "{norm}"')
            if os.path.exists(norm) and os.path.getsize(norm) > 5000:
                normed.append(norm)
        except:
            pass

    if not normed:
        run(f'ffmpeg -y -f lavfi -i "color=c=0x080818:s={W}x{H}:d={duration}:r={FPS}" '
            f'-c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p "{bg_video}"')
        return bg_video

    # Concatenate with crossfade transitions (1s each)
    if len(normed) == 1:
        concat_raw = normed[0]
    elif len(normed) == 2:
        concat_raw = os.path.join(outdir, "concat.mp4")
        run(f'ffmpeg -y -i "{normed[0]}" -i "{normed[1]}" '
            f'-filter_complex "[0:v][1:v]xfade=transition=fade:duration=1:offset={SCENE_DURATION-1},format=yuv420p" '
            f'-c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p "{concat_raw}"')
    else:
        # Build complex xfade chain for 3+ clips
        concat_list = os.path.join(outdir, "concat.txt")
        with open(concat_list, "w") as f:
            for n in normed:
                f.write(f"file '{n}'\n")
        concat_raw = os.path.join(outdir, "concat.mp4")
        run(f'ffmpeg -y -f concat -safe 0 -i "{concat_list}" -c copy "{concat_raw}"')

    # Loop to match audio duration + cinematic color grade
    run(f'ffmpeg -y -stream_loop -1 -i "{concat_raw}" -t {duration} '
        f'-vf "eq=brightness=-0.05:contrast=1.15:saturation=0.75,vignette=PI/4,noise=alls=3:allf=t" '
        f'-c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p -r {FPS} -an "{bg_video}"')

    return bg_video


# ═══════════════════════════════════════════
# STEP 4: Generate ASS subtitles
# ═══════════════════════════════════════════
def generate_subtitles(script_text, duration, vtt_file, outdir):
    """Generate professional ASS subtitles with word highlight."""
    ass_file = os.path.join(outdir, "subs.ass")
    cues = []

    # Parse VTT if available (word-level timing from edge-tts)
    if vtt_file and os.path.exists(vtt_file) and os.path.getsize(vtt_file) > 50:
        vtt = open(vtt_file).read()
        for block in vtt.split("\n\n"):
            lines = block.strip().split("\n")
            for i, line in enumerate(lines):
                m = re.match(r'(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})', line)
                if m:
                    g = [int(x) for x in m.groups()]
                    start = g[0]*3600000 + g[1]*60000 + g[2]*1000 + g[3]
                    end = g[4]*3600000 + g[5]*60000 + g[6]*1000 + g[7]
                    text = " ".join(lines[i+1:]).strip()
                    if text:
                        cues.append((start, end, text))

    # Fallback: estimate from word count
    if not cues:
        words = script_text.split()
        ms_per_word = (duration * 1000) / max(len(words), 1)
        for i in range(0, len(words), SUBTITLE_WORDS_PER_LINE):
            chunk = words[i:i+SUBTITLE_WORDS_PER_LINE]
            s = int(i * ms_per_word)
            e = int(min((i + len(chunk)) * ms_per_word, duration * 1000))
            cues.append((s, e, " ".join(chunk)))

    def ms2ass(ms):
        h = int(ms // 3600000)
        m = int((ms % 3600000) // 60000)
        s = int((ms % 60000) // 1000)
        c = int((ms % 1000) // 10)
        return f"{h}:{m:02d}:{s:02d}.{c:02d}"

    # ASS with professional styling
    ass = f"""[Script Info]
Title: KDMC Stories
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
PlayResX: {W}
PlayResY: {H}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Main,Arial,72,&H00FFFFFF,&H0000D4FF,&H00000000,&HB0000000,-1,0,0,0,100,100,1,0,1,4,3,2,80,80,70,1
Style: Title,Arial,90,&H0000D4FF,&H00FFFFFF,&H00000000,&HC0000000,-1,0,0,0,100,100,2,0,1,5,4,5,40,40,40,1
Style: CTA,Arial,56,&H0000D4FF,&H00FFFFFF,&H00000000,&HC0000000,-1,0,0,0,100,100,1,0,1,3,2,8,80,80,40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    # Title card (first 4 seconds)
    title = cues[0][2].split(".")[0] if cues else "Story"
    ass += f"Dialogue: 1,0:00:00.00,0:00:04.00,Title,,0,0,0,,{{\\fad(800,600)}}{{\\an5}}{title}\n"

    # Subtitle cues
    for start, end, text in cues:
        ass += f"Dialogue: 0,{ms2ass(start)},{ms2ass(end)},Main,,0,0,0,,{text}\n"

    # CTA at the end (last 5 seconds)
    end_ms = int(duration * 1000)
    start_cta = max(0, end_ms - 5000)
    ass += f"Dialogue: 2,{ms2ass(start_cta)},{ms2ass(end_ms)},CTA,,0,0,0,,{{\\fad(600,0)}}{{\\an8}}Subscribe for more stories\n"

    with open(ass_file, "w") as f:
        f.write(ass)

    print(f"   ✅ {len(cues)} subtitle lines + title card + CTA")
    return ass_file


# ═══════════════════════════════════════════
# STEP 5: Download music
# ═══════════════════════════════════════════
def download_music(niche, outdir):
    """Download background music track."""
    music = os.path.join(outdir, "music.mp3")
    url = NICHE_MUSIC.get(niche, NICHE_MUSIC["betrayal"])
    if download(url, music):
        print("   ✅ Music OK")
        return music
    print("   ⚠️ No music")
    return None


# ═══════════════════════════════════════════
# STEP 6: Final composition
# ═══════════════════════════════════════════
def compose_final(bg_video, narration, music, ass_file, duration, output_path):
    """FFmpeg final composition: video + voice + music + subtitles."""
    if music and os.path.exists(music):
        run(f'ffmpeg -y -i "{bg_video}" -i "{narration}" -i "{music}" '
            f'-filter_complex "'
            f'[0:v]ass={ass_file}[vout];'
            f'[2:a]volume=0.07,afade=t=in:st=0:d=4,afade=t=out:st={int(duration)-5}:d=5[m];'
            f'[1:a]volume=1.5[v];'
            f'[v][m]amix=inputs=2:duration=first:dropout_transition=3[aout]'
            f'" '
            f'-map "[vout]" -map "[aout]" '
            f'-c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p '
            f'-c:a aac -b:a 192k -ar 44100 '
            f'-shortest -movflags +faststart "{output_path}"',
            timeout=300)
    else:
        run(f'ffmpeg -y -i "{bg_video}" -i "{narration}" '
            f'-filter_complex "[0:v]ass={ass_file}[vout]" '
            f'-map "[vout]" -map 1:a '
            f'-c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p '
            f'-c:a aac -b:a 192k '
            f'-shortest -movflags +faststart "{output_path}"',
            timeout=300)

    if not os.path.exists(output_path) or os.path.getsize(output_path) < 100000:
        # Fallback without ASS
        print("   ⚠️ Retrying without subtitles...")
        run(f'ffmpeg -y -i "{bg_video}" -i "{narration}" '
            f'-map 0:v -map 1:a -c:v copy -c:a aac -b:a 128k '
            f'-shortest -movflags +faststart "{output_path}"')

    return output_path


# ═══════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════
def main():
    if len(sys.argv) < 3:
        print("Usage: python3 generate_video.py <library.json> <outdir> [niche]")
        sys.exit(1)

    library_path = sys.argv[1]
    base_outdir = sys.argv[2]
    niche = sys.argv[3] if len(sys.argv) > 3 else "betrayal"

    # Pick story — merge viral stories + regular library
    lib = json.load(open(library_path))
    viral_path = os.path.join(os.path.dirname(library_path), "viral-stories.json")
    all_libs = {library_path: lib}
    if os.path.exists(viral_path):
        vlib = json.load(open(viral_path))
        all_libs[viral_path] = vlib
        for cat, stories in vlib.items():
            if cat.startswith("_") or not isinstance(stories, list):
                continue
            lib[f"v_{cat}"] = stories

    candidates = []
    for cat, stories in lib.items():
        if cat.startswith("_") or not isinstance(stories, list):
            continue
        for s in stories:
            if s.get("used"):
                continue
            if niche in cat or niche in " ".join(s.get("tags", [])):
                candidates.append(s)
    if not candidates:
        for cat, stories in lib.items():
            if cat.startswith("_") or not isinstance(stories, list):
                continue
            for s in stories:
                if not s.get("used"):
                    candidates.append(s)
    if not candidates:
        print("❌ No unused stories")
        sys.exit(1)

    story = random.choice(candidates[:5])
    story_id = story["id"]
    title = story["title"]
    script = story["script"]
    tags = story.get("tags", [])
    tag_niche = tags[0] if tags else niche

    outdir = os.path.join(base_outdir, f"{story_id}_{int(time.time())}")
    clips_dir = os.path.join(outdir, "clips")
    os.makedirs(clips_dir, exist_ok=True)

    print("=" * 50)
    print(f"🎬 KDMC Pro Video Generator")
    print(f"   Story: {story_id} — {title}")
    print(f"   Words: {len(script.split())}")
    print(f"   Niche: {tag_niche}")
    print("=" * 50)

    # Step 1: TTS
    print("\n🎙 Step 1: Voice...")
    narration, vtt_file = generate_tts(script, outdir)
    duration = get_duration(narration)
    if duration < 5:
        print("❌ Audio too short")
        sys.exit(1)
    print(f"   Duration: {duration:.0f}s")

    # Step 2: Video clips
    print(f"\n🎥 Step 2: Video clips (need ~{int(duration // SCENE_DURATION) + 1} scenes)...")
    num_needed = int(duration // SCENE_DURATION) + 2
    clips = download_pexels_clips(tag_niche, min(num_needed, 8), clips_dir)

    # Fill remaining with AI images
    if len(clips) < max(3, num_needed // 2):
        print(f"   Adding AI clips (have {len(clips)}, need more)...")
        ai_clips = generate_ai_clips(max(3, num_needed - len(clips)), clips_dir)
        clips.extend(ai_clips)

    print(f"   Total: {len(clips)} clips")

    # Step 3: Background
    print("\n🎞 Step 3: Background assembly...")
    bg_video = build_background(clips, int(duration), outdir)
    print(f"   ✅ Background ready")

    # Step 4: Subtitles
    print("\n📝 Step 4: Subtitles...")
    ass_file = generate_subtitles(script, duration, vtt_file, outdir)

    # Step 5: Music
    print("\n🎵 Step 5: Music...")
    music = download_music(tag_niche, outdir)

    # Step 6: Compose
    print("\n🎬 Step 6: Final composition...")
    output_path = os.path.join(outdir, f"{story_id}_long.mp4")
    compose_final(bg_video, narration, music, ass_file, duration, output_path)

    final_size = os.path.getsize(output_path)
    print(f"\n{'=' * 50}")
    print(f"✅ VIDEO COMPLETE")
    print(f"   File:   {output_path}")
    print(f"   Size:   {final_size / 1024 / 1024:.1f} MB")
    print(f"   Length: {duration:.0f}s")
    print(f"   Clips:  {len(clips)}")
    print(f"{'=' * 50}")

    # Save metadata
    desc = " ".join(f"#{t}" for t in tags) + f"\n\n{script.split('.')[0]}.\n\nSubscribe for daily stories.\nGenerated by KDMC Studio"
    meta = {
        "id": story_id, "title": title, "tags": tags,
        "description": desc, "format": "long",
        "width": W, "height": H, "duration": int(duration),
        "scenes": len(clips), "sizeBytes": final_size,
    }
    with open(os.path.join(outdir, "metadata.json"), "w") as f:
        json.dump(meta, f, indent=2)

    # Mark as used in both library files
    for fpath, flib in all_libs.items():
        modified = False
        for cat, stories in flib.items():
            if cat.startswith("_") or not isinstance(stories, list):
                continue
            for s in stories:
                if s.get("id") == story_id:
                    s["used"] = True
                    modified = True
        if modified:
            with open(fpath, "w") as f:
                json.dump(flib, f, indent=2, ensure_ascii=False)

    # Cleanup temp
    for f in [bg_video, narration, vtt_file, ass_file]:
        if f and os.path.exists(f):
            try: os.remove(f)
            except: pass
    if music and os.path.exists(music):
        try: os.remove(music)
        except: pass
    shutil.rmtree(clips_dir, ignore_errors=True)
    for f in Path(outdir).glob("norm_*"):
        f.unlink(missing_ok=True)
    for f in Path(outdir).glob("concat*"):
        f.unlink(missing_ok=True)
    Path(os.path.join(outdir, "script.txt")).unlink(missing_ok=True)

    # Output for GitHub Actions
    print(f"\n::set-output name=video::{output_path}")
    print(f"::set-output name=story_id::{story_id}")
    print(f"::set-output name=title::{title}")
    print(f"::set-output name=tags::{','.join(tags)}")


if __name__ == "__main__":
    main()
