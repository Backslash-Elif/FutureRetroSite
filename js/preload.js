// Restore theme
try {
  const pref = localStorage.getItem('darkTheme');
  const darkLink = document.getElementById('dark-theme');
  if (darkLink) {
    if (pref === 'on') darkLink.disabled = false;
    if (pref === 'off') darkLink.disabled = true;
  }
} catch (e) {}