window.addEventListener('keydown', function(e) {
  // keycode is fallback
  if (e.key === 'F1' || e.key === 'f1' || e.keyCode === 112) {
    e.preventDefault(); // stop inbuilt help
    document.documentElement.classList.toggle("about-show-bsod");
  }
});