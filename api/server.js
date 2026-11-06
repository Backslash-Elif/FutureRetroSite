import "dotenv/config";
import Fastify from "fastify";

const app = Fastify({ logger: true });

const { LASTFM_API_KEY, LASTFM_USERNAME } = process.env;
const CACHE_TTL_MS = 3 * 60 * 1000;

let cache = null; // { data, expiresAt }
let refreshInProgress = null;

if (!LASTFM_API_KEY || !LASTFM_USERNAME) {
  throw new Error("Set LASTFM_API_KEY and LASTFM_USERNAME in your .env file.");
}

function getImageUrl(images = []) {
  // Prefer larger artwork, but fall back to whatever Last.fm provides.
  const preferred = ["extralarge", "large", "medium", "small"];
  for (const size of preferred) {
    const image = images.find((item) => item.size === size && item["#text"]);
    if (image) return image["#text"];
  }
  return null;
}

async function fetchScrobbles() {
  const url = new URL("https://ws.audioscrobbler.com/2.0/");
  url.search = new URLSearchParams({
    method: "user.getRecentTracks",
    user: LASTFM_USERNAME,
    api_key: LASTFM_API_KEY,
    format: "json",
    limit: "3"
  });

  const response = await fetch(url, {
    signal: AbortSignal.timeout(10_000)
  });

  if (!response.ok) {
    throw new Error(`Last.fm returned HTTP ${response.status}`);
  }

  const body = await response.json();

  if (body.error) {
    throw new Error(`Last.fm error ${body.error}: ${body.message}`);
  }

  const tracks = body.recenttracks?.track ?? [];
  const list = Array.isArray(tracks) ? tracks : [tracks];

  return {
    username: LASTFM_USERNAME,
    fetchedAt: new Date().toISOString(),
    cacheTtlSeconds: CACHE_TTL_MS / 1000,
    tracks: list.slice(0, 3).map((track) => ({
      name: track.name,
      artist: track.artist?.["#text"] ?? track.artist?.name ?? null,
      album: track.album?.["#text"] ?? null,
      url: track.url ?? null,
      nowPlaying: track["@attr"]?.nowplaying === "true",
      playedAt: track.date
        ? {
            uts: track.date.uts,
            text: track.date["#text"]
          }
        : null,
      // Last.fm may return empty artwork URLs when no art is available.
      imageUrl: getImageUrl(track.image)
    }))
  };
}

app.get("/api/scrobbles", async (_request, reply) => {
  const now = Date.now();

  if (cache && now < cache.expiresAt) {
    return reply
      .header("X-Cache", "HIT")
      .send(cache.data);
  }

  // Coalesce simultaneous requests so they share one Last.fm API call.
  if (!refreshInProgress) {
    refreshInProgress = fetchScrobbles()
      .then((data) => {
        cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
        return data;
      })
      .finally(() => {
        refreshInProgress = null;
      });
  }

  try {
    const data = await refreshInProgress;
    return reply
      .header("X-Cache", "MISS")
      .send(data);
  } catch (error) {
    app.log.error(error);
    return reply.code(502).send({
      error: "Could not fetch recent tracks from Last.fm."
    });
  }
});

app.get("/health", async () => ({ ok: true }));

try {
  await app.listen({ port: 3000, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
