#!/usr/bin/env node
/**
 * Fetches YouTube captions and outputs JSON to stdout.
 * Called from PHP: node scripts/fetch-transcript.mjs <videoId>
 *
 * Output format:
 * { "success": true, "text": "full transcript", "segments": [...] }
 * or
 * { "success": false, "error": "message" }
 */

import { YoutubeTranscript } from 'youtube-transcript';

const videoId = process.argv[2];

if (!videoId) {
    process.stdout.write(JSON.stringify({ success: false, error: 'No video ID provided' }));
    process.exit(1);
}

try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });

    if (!segments || segments.length === 0) {
        process.stdout.write(JSON.stringify({ success: false, error: 'No captions available for this video' }));
        process.exit(0);
    }

    const text = segments.map(s => s.text).join(' ').replace(/\s+/g, ' ').trim();

    process.stdout.write(JSON.stringify({
        success: true,
        text,
        segments: segments.map(s => ({
            text: s.text,
            offset: s.offset,
            duration: s.duration,
        })),
    }));
} catch (err) {
    process.stdout.write(JSON.stringify({ success: false, error: err.message }));
    process.exit(0);
}
