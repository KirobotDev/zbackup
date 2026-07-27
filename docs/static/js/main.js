document.addEventListener('keydown', function(e) {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    var searchInput = document.getElementById('search-text');
    if (searchInput) searchInput.focus();
  }
});
