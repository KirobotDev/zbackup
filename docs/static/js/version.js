const REPO_OWNER = 'KirobotDev';
const REPO_NAME = 'zbackup';
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=100`;

async function detectVersion() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('GitHub API error');
    const commits = await res.json();

    let highestVersion = null;
    let versionDate = null;

    const versionPatterns = [
      /V-(\d+\.\d+(?:\.\d+)?)/i,
      /Version\s+(\d+\.\d+(?:\.\d+)?)/i,
      /v(\d+\.\d+(?:\.\d+)?)/i,
      /release\s+(\d+\.\d+(?:\.\d+)?)/i,
      /(\d+\.\d+(?:\.\d+)?)\s+release/i,
    ];

    for (const commit of commits) {
      const msg = commit.commit.message;
      const date = commit.commit.author.date;

      for (const pattern of versionPatterns) {
        const match = msg.match(pattern);
        if (match) {
          const version = match[1];
          if (!highestVersion || compareVersions(version, highestVersion) > 0) {
            highestVersion = version;
            versionDate = date;
          }
        }
      }
    }

    return { version: highestVersion, date: versionDate };
  } catch (err) {
    console.warn('Could not fetch version from GitHub:', err);
    return { version: null, date: null };
  }
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

function applyVersion(info) {
  const { version, date } = info;

  document.querySelectorAll('.version-display').forEach(el => {
    el.textContent = version || 'dev';
  });

  document.querySelectorAll('.version-date').forEach(el => {
    if (date) {
      const d = new Date(date);
      el.textContent = d.toLocaleDateString('en-CA');
      el.setAttribute('datetime', d.toISOString());
    }
  });

  document.querySelectorAll('.version-badge').forEach(el => {
    el.textContent = `v${version || 'dev'}`;
  });

  const titleEl = document.getElementById('page-title');
  if (titleEl && version) {
    const base = titleEl.getAttribute('data-base-title') || titleEl.textContent;
    titleEl.textContent = `${base} v${version}`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const info = await detectVersion();
  applyVersion(info);
});
