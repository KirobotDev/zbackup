(() => {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLORS = {
    main: '#C7F12E',
    light: '#DFFF3A',
    lime: '#B7E61E',
    mid: '#8CBF28',
    dark: '#4E7420',
    bg: '#0D0F0B',
    gray: '#1B1F1A',
  };

  let W, H, dpr;
  let mouse = { x: -9999, y: -9999 };
  let time = 0;
  let particles = [];
  let nodes = [];
  let branches = [];
  let dataPackets = [];

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildScene();
  }

  function buildScene() {
    nodes = [];
    branches = [];
    dataPackets = [];

    const cx = W / 2;
    const cy = H / 2;
    const spread = Math.min(W, H) * 0.35;

    const positions = [
      { x: cx - spread * 0.8, y: cy - spread * 0.3, r: 10, color: COLORS.main, label: 'V-0.2', speed: 0.4 },
      { x: cx - spread * 0.25, y: cy - spread * 0.5, r: 13, color: COLORS.light, label: 'main', speed: 0.3 },
      { x: cx + spread * 0.3, y: cy - spread * 0.6, r: 9, color: COLORS.mid, label: 'v1', speed: 0.5 },
      { x: cx + spread * 0.8, y: cy - spread * 0.2, r: 11, color: COLORS.lime, label: 'v2', speed: 0.35 },
      { x: cx + spread * 0.5, y: cy + spread * 0.15, r: 8, color: COLORS.dark, label: 'dev', speed: 0.45 },
      { x: cx - spread * 0.1, y: cy + spread * 0.4, r: 12, color: COLORS.main, label: 'backup', speed: 0.28 },
      { x: cx + spread * 0.6, y: cy + spread * 0.55, r: 7, color: COLORS.mid, label: 'zip', speed: 0.55 },
      { x: cx - spread * 0.6, y: cy + spread * 0.25, r: 9, color: COLORS.lime, label: 'restore', speed: 0.42 },
      { x: cx + spread * 0.1, y: cy - spread * 0.1, r: 15, color: COLORS.main, label: 'ZB', speed: 0.2, isCenter: true },
    ];

    positions.forEach((p) => {
      nodes.push({
        x: p.x,
        y: p.y,
        baseX: p.x,
        baseY: p.y,
        r: p.r,
        color: p.color,
        label: p.label,
        speed: p.speed,
        phase: Math.random() * Math.PI * 2,
        isCenter: p.isCenter || false,
        glow: 0,
        spawnTime: Math.random() * 2,
      });
    });

    const connections = [
      [8, 0], [8, 1], [8, 4], [8, 5], [8, 7],
      [0, 2], [1, 2], [1, 3], [3, 4], [5, 6], [5, 7], [7, 0],
      [2, 6],
    ];

    connections.forEach(([a, b]) => {
      branches.push({
        from: a,
        to: b,
        progress: 0,
        speed: 0.15 + Math.random() * 0.1,
      });
    });

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.3 + 0.05,
      });
    }
  }

  function spawnDataPackets() {
    if (dataPackets.length < 6 && Math.random() < 0.03) {
      const conn = branches[Math.floor(Math.random() * branches.length)];
      const reverse = Math.random() > 0.5;
      dataPackets.push({
        branch: conn,
        t: 0,
        speed: 0.005 + Math.random() * 0.008,
        reverse,
        color: [COLORS.main, COLORS.light, COLORS.lime, COLORS.mid][Math.floor(Math.random() * 4)],
        size: 2.5 + Math.random() * 2,
      });
    }
  }

  function drawParticles() {
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(199, 241, 46, ${p.alpha})`;
      ctx.fill();
    });
  }

  function drawGrid() {
    const spacing = 40;
    ctx.strokeStyle = 'rgba(199, 241, 46, 0.02)';
    ctx.lineWidth = 0.5;

    for (let x = 0; x < W; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }

  function drawBranches() {
    branches.forEach((b) => {
      if (b.progress < 1) {
        b.progress = Math.min(1, b.progress + b.speed * 0.016);
      }

      const nA = nodes[b.from];
      const nB = nodes[b.to];
      if (!nA || !nB) return;

      const dx = nB.x - nA.x;
      const dy = nB.y - nA.y;
      const ex = nA.x + dx * b.progress;
      const ey = nA.y + dy * b.progress;

      const grad = ctx.createLinearGradient(nA.x, nA.y, ex, ey);
      grad.addColorStop(0, 'rgba(78, 116, 32, 0.6)');
      grad.addColorStop(1, 'rgba(140, 191, 40, 0.3)');

      ctx.beginPath();
      ctx.moveTo(nA.x, nA.y);

      const mx = (nA.x + ex) / 2 + Math.sin(time * 0.5 + b.from) * 3;
      const my = (nA.y + ey) / 2 + Math.cos(time * 0.5 + b.to) * 3;
      ctx.quadraticCurveTo(mx, my, ex, ey);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();

      const pulse = Math.sin(time * 2 + b.from * 0.5) * 0.3 + 0.7;
      ctx.strokeStyle = `rgba(199, 241, 46, ${0.08 * pulse})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    });
  }

  function drawDataPackets() {
    spawnDataPackets();

    for (let i = dataPackets.length - 1; i >= 0; i--) {
      const dp = dataPackets[i];
      dp.t += dp.speed;

      if (dp.t >= 1) {
        dataPackets.splice(i, 1);
        continue;
      }

      const nA = nodes[dp.branch.from];
      const nB = nodes[dp.branch.to];
      if (!nA || !nB) continue;

      const t = dp.reverse ? 1 - dp.t : dp.t;
      const dx = nB.x - nA.x;
      const dy = nB.y - nA.y;
      const px = nA.x + dx * t;
      const py = nA.y + dy * t;

      ctx.beginPath();
      ctx.arc(px, py, dp.size, 0, Math.PI * 2);
      ctx.fillStyle = dp.color;
      ctx.shadowColor = dp.color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(px, py, dp.size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = dp.color.replace(')', ', 0.1)').replace('rgb', 'rgba').replace('#', '');
      const alpha = 0.1;
      ctx.fillStyle = `rgba(199, 241, 46, ${alpha})`;
      ctx.fill();
    }
  }

  function drawNodes() {
    nodes.forEach((n, i) => {
      if (time < n.spawnTime) return;

      const floatX = Math.sin(time * n.speed + n.phase) * 4;
      const floatY = Math.cos(time * n.speed * 0.7 + n.phase) * 3;
      n.x = n.baseX + floatX;
      n.y = n.baseY + floatY;

      const mouseDist = Math.hypot(mouse.x - n.x, mouse.y - n.y);
      const mouseInfluence = mouseDist < 100 ? (1 - mouseDist / 100) * 8 : 0;

      const pulse = Math.sin(time * 1.5 + i) * 0.15 + 1;
      const finalR = n.r * pulse;

      const outerR = finalR + 6 + mouseInfluence;

      const r = parseInt(n.color.slice(1, 3), 16);
      const g = parseInt(n.color.slice(3, 5), 16);
      const b = parseInt(n.color.slice(5, 7), 16);

      const outerGrad = ctx.createRadialGradient(n.x, n.y, finalR * 0.5, n.x, n.y, outerR);
      outerGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.15)`);
      outerGrad.addColorStop(1, 'rgba(199, 241, 46, 0)');

      const g1 = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, outerR);
      g1.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.12)`);
      g1.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.beginPath();
      ctx.arc(n.x, n.y, outerR, 0, Math.PI * 2);
      ctx.fillStyle = g1;
      ctx.fill();

      if (n.isCenter) {
        const ringR = finalR + 15 + Math.sin(time) * 3;
        ctx.beginPath();
        ctx.arc(n.x, n.y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(199, 241, 46, ${0.15 + Math.sin(time * 2) * 0.1})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        const ringR2 = finalR + 28 + Math.cos(time * 0.7) * 2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, ringR2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(199, 241, 46, ${0.08 + Math.sin(time * 1.3) * 0.05})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      const grad = ctx.createRadialGradient(
        n.x - finalR * 0.3, n.y - finalR * 0.3, finalR * 0.1,
        n.x, n.y, finalR
      );
      grad.addColorStop(0, n.color);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.7)`);

      ctx.beginPath();
      ctx.arc(n.x, n.y, finalR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = n.color;
      ctx.shadowBlur = n.isCenter ? 25 : 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(n.x - finalR * 0.25, n.y - finalR * 0.25, finalR * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, 0.15)`;
      ctx.fill();

      if (n.label) {
        const fadeIn = Math.min(1, Math.max(0, (time - n.spawnTime - 0.5) * 2));
        if (fadeIn > 0) {
          ctx.font = `${n.isCenter ? 'bold ' : ''}${n.isCenter ? 10 : 7}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = `rgba(13, 15, 11, ${fadeIn})`;
          ctx.fillText(n.label, n.x, n.y);
        }
      }
    });
  }

  function drawScanLine() {
    const scanY = (time * 30) % (H + 40) - 20;
    const grad = ctx.createLinearGradient(0, scanY - 10, 0, scanY + 10);
    grad.addColorStop(0, 'rgba(199, 241, 46, 0)');
    grad.addColorStop(0.5, 'rgba(199, 241, 46, 0.04)');
    grad.addColorStop(1, 'rgba(199, 241, 46, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY - 10, W, 20);
  }

  function animate() {
    time += 0.016;
    ctx.clearRect(0, 0, W, H);

    drawGrid();
    drawScanLine();
    drawParticles();
    drawBranches();
    drawDataPackets();
    drawNodes();

    requestAnimationFrame(animate);
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', resize);
  resize();
  animate();
})();
