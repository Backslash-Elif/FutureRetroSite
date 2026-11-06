window.addEventListener('keydown', function(e) {
  // keycode is fallback
  if (e.key === 'F1' || e.key === 'f1' || e.keyCode === 112) {
    e.preventDefault(); // stop inbuilt help
    document.documentElement.classList.toggle("about-show-bsod");
  }
});

function startScribbleDisplay() {
  const container = document.getElementById("mediadisplay");
  if (!container) return;

  let timer;

  async function refresh() {
    clearTimeout(timer);
    container.replaceChildren();

    try {
      const response = await fetch("/api/scrobbles");
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      const data = await response.json();

      data.tracks.forEach((track, index) => {
        const item = document.createElement("div");
        item.className = "scrobble";

        const image = document.createElement("img");
        image.className = "scrobble-image";
        image.src = track.imageUrl;
        image.alt = "";
        image.loading = "lazy";

        const details = document.createElement("div");
        details.className = "scrobble-details";

        const trackName = document.createElement("div");
        trackName.className = "scrobble-track";
        trackName.textContent = track.name;

        const albumLine = document.createElement("div");
        albumLine.className = "scrobble-album";
        albumLine.append("from ");
        const albumName = document.createElement("span");
        albumName.textContent = track.album;
        albumLine.append(albumName);

        const artistLine = document.createElement("div");
        artistLine.className = "scrobble-artist";
        artistLine.append("by ");
        const artistName = document.createElement("span");
        artistName.textContent = track.artist;
        artistLine.append(artistName);

        details.append(trackName, albumLine, artistLine);
        item.append(image, details);
        container.append(item);

        if (index < data.tracks.length - 1) {
          const separator = document.createElement("div");
          separator.className = "scrobble-separator";
          container.append(separator);
        }
      });

      const fetchedAt = Date.parse(data.fetchedAt);
      const ttlMs = Number(data.cacheTtlSeconds) * 1000;
      const delay =
        Number.isFinite(fetchedAt) && Number.isFinite(ttlMs)
          ? Math.max(0, fetchedAt + ttlMs - Date.now())
          : 0;

      timer = setTimeout(refresh, delay);
    } catch (error) {
      console.error("Could not load scribbles:", error);
      timer = setTimeout(refresh, 30000);
    }
  }

  refresh();
}


startScribbleDisplay();