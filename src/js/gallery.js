function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v; // use only for trusted markup
    else e.setAttribute(k, v);
  }
  children.flat().forEach(c => {
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return e;
}

// Call this once the page is ready (e.g., at end of body or DOMContentLoaded)
async function renderGallery(
  jsonUrl = "/assets/gallery/gallery.json",
  containerId = "gallery-content",
) {
  console.log("Building gallery from " + jsonUrl)
  const container = document.getElementById(containerId);
  if (!container) return console.error("Container not found:", containerId);

  try {
    const resp = await fetch(jsonUrl, { cache: "no-store" });
    if (!resp.ok)
      throw new Error("Failed to fetch gallery.json: " + resp.status);
    const data = await resp.json();

    // Clear container
    container.innerHTML = "";

    // data root: keys are titles
    for (const title of Object.keys(data)) {
      // Insert title h2
      const h2 = document.createElement("h2");
      h2.textContent = title;
      container.appendChild(h2);

      const sources = data[title] || {};
      const preparedImages = []
      // sources: keys are either links or place names; values are arrays of image URLs
      for (const sourceKey of Object.keys(sources)) {
        const images = Array.isArray(sources[sourceKey])
          ? sources[sourceKey]
          : [];

        // Determine if sourceKey is a link (basic check)
        const isLink = (() => {
          try {
            const u = new URL(sourceKey);
            return u.protocol === "http:" || u.protocol === "https:";
          } catch (e) {
            return false;
          }
        })();

        for (const imgUrl of images) {
          let imgName = "";
          try {
            const parsed = new URL(imgUrl);
            imgName =
              parsed.pathname.split("/").filter(Boolean).pop() ||
              parsed.hostname;
          } catch (e) {
            // fallback if not a valid URL
            const parts = imgUrl.split("/");
            imgName = parts[parts.length - 1] || imgUrl;
          }
          // prettier-ignore
          const node = el("div", { class: "w98-border1 shadow" },
            el("div", { class: "w98-border2" },
              el("div", { class: "w98-root" },
                el("div", { class: "w98-title", "aria-hidden": "true" },
                  el("div", {},
                    el("img", {
                      src: "/assets/icons/kodak_imaging-1.png",
                      alt: "window icon",
                    }),
                    el("div", {}, imgName + " - Imaging"),
                  ),
                  el("div", {},
                    el("img", {
                      src: "/assets/icons/window_minimize.png",
                      alt: "minimze",
                    }),
                    el("img", {
                      src: "/assets/icons/window_maximize.png",
                      alt: "maximize",
                    }),
                    el("img", {
                      src: "/assets/icons/window_exit.png",
                      alt: "exit",
                    }),
                  ),
                ),
                el(
                  "div",
                  { class: "w98-menu", "aria-hidden": "true" },
                  el("div", {}, "File"),
                  el("div", {}, "Edit"),
                  el("div", {}, "View"),
                  el("div", {}, "Page"),
                  el("div", {}, "Zoom"),
                  el("div", {}, "Tools"),
                  el("div", {}, "Help")
                ),
                el("div", { class: "w98-border2r" },
                  el("div", { class: "w98-border1r" },
                    el("div", { class: "window-bg" },
                      el("img", { src: imgUrl, alt: "Photo" }),
                    ),
                  ),
                ),
                el("div", { class: "gallery-source" },
                  isLink
                    ? el("a", {
                          href: sourceKey,
                          target: "_blank",
                          rel: "noopener noreferrer",
                        },
                        el("img", {
                          src: "/assets/icons/msie1-3.png",
                          alt: "info",
                        }),
                        " Click to view source.",
                      )
                    : el("span", {},
                        el("img", {
                          src: "/assets/icons/msg_information-2.png",
                          alt: "location",
                        }),
                        sourceKey,
                      ),
                ),
              ),
            ),
          );

          preparedImages.push(node)

          //container.appendChild(node);
        }
      }
      container.appendChild(el('div', { class: 'gallery-flex' }, ...preparedImages));
    }
  } catch (err) {
    console.error("renderGallery error:", err);
  }
}

renderGallery();
