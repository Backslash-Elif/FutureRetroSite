const header = document.querySelector("header");
const headerContent = document.getElementById("header-content");
const menuButton = document.getElementById("menu-button");
const content = document.getElementById("content");
const themeButton = document.getElementById("theme-switch");
const darkLink = document.getElementById("dark-theme");

const MAX_MOBILE_WIDTH = 768;

if (menuButton) {
  menuButton.addEventListener("click", function () {
    if (headerContent) {
      headerContent.style.display =
        headerContent.style.display === "flex" ? "none" : "flex";
    }
  });
}

if (themeButton && darkLink) {
  themeButton.addEventListener("click", () => {
    darkLink.disabled = !darkLink.disabled;
    try {
      localStorage.setItem("darkTheme", darkLink.disabled ? "off" : "on");
    } catch (e) {}
  });
}

//update mobile menu
function onPointerOrTouch() {
  headerContent.style.display =
    window.screen.width <= MAX_MOBILE_WIDTH ? "none" : "flex";
}
content.addEventListener("touchstart", onPointerOrTouch, { passive: true });
content.addEventListener("pointerdown", onPointerOrTouch, { passive: true });

function updateHeaderDisplay(matchesMobile) {
  headerContent.style.display = matchesMobile ? "none" : "flex";
}

// try matchMedia
const mq = window.matchMedia(`(max-width: ${MAX_MOBILE_WIDTH}px)`);

// init
updateHeaderDisplay(mq.matches);

function mqListener(e) {
  updateHeaderDisplay(e.matches);
}
if (mq.addEventListener) {
  mq.addEventListener("change", mqListener);
} else {
  // fallback
  mq.addListener(mqListener);
}

// fallback without matchMedia
let resizeTimer = null;
window.addEventListener(
  "resize",
  () => {
    if (resizeTimer) return;
    resizeTimer = setTimeout(() => {
      resizeTimer = null;
      updateHeaderDisplay(window.innerWidth <= MAX_MOBILE_WIDTH);
    }, 100);
  },
  { passive: true },
);
