(function(){
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t){
    return a + (b - a) * t;
  }

  function roundedRect(ctx, x, y, w, h, r){
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  class FinanceBackground {
    constructor(hero){
      this.hero = hero;
      this.scene = document.body.dataset.scene || 'network';
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'finance-bg-canvas';
      this.canvas.setAttribute('aria-hidden', 'true');
      this.ctx = this.canvas.getContext('2d', {alpha: true});
      if(!this.ctx){
        this.canvas.remove();
        return;
      }
      this.hero.prepend(this.canvas);

      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.nodes = [];
      this.panels = [];
      this.raf = 0;
      this.resizeRaf = 0;
      this.lastTime = 0;
      this.visible = true;
      this.inViewport = true;
      this.pointer = {x: 0, y: 0, tx: 0, ty: 0};
      this.compact = false;
      this.pointerRect = null;

      this.onResize = () => {
        cancelAnimationFrame(this.resizeRaf);
        this.resizeRaf = requestAnimationFrame(() => this.resize());
      };
      this.onPointerMove = this.movePointer.bind(this);
      this.onTick = this.tick.bind(this);
      this.onVisibilityChange = this.handleVisibility.bind(this);
      this.onMotionChange = this.handleMotionPreference.bind(this);

      window.addEventListener('resize', this.onResize, {passive: true});
      document.addEventListener('visibilitychange', this.onVisibilityChange);
      this.hero.addEventListener('pointerenter', () => {
        if(finePointer.matches){
          this.pointerRect = this.hero.getBoundingClientRect();
          this.heroTop = this.pointerRect.top + window.scrollY;
        }
      }, {passive: true});
      this.hero.addEventListener('pointermove', this.onPointerMove, {passive: true});
      this.hero.addEventListener('pointerleave', () => {
        this.pointer.tx = this.pointer.ty = 0;
      }, {passive: true});
      finePointer.addEventListener('change', this.onMotionChange);
      window.addEventListener('efe:motion-change', this.onMotionChange);
      if(typeof prefersReducedMotion.addEventListener === 'function'){
        prefersReducedMotion.addEventListener('change', this.onMotionChange);
      }else if(typeof prefersReducedMotion.addListener === 'function'){
        prefersReducedMotion.addListener(this.onMotionChange);
      }

      if(typeof IntersectionObserver !== 'undefined'){
        this.observer = new IntersectionObserver(entries => {
          this.inViewport = Boolean(entries[0] && entries[0].isIntersecting);
          if(this.inViewport && !document.hidden && !this.motionPaused()) this.start();
          else this.stop();
        });
        this.observer.observe(this.hero);
      }

      this.resize();
      this.start();
    }

    resize(){
      const rect = this.hero.getBoundingClientRect();
      this.pointerRect = rect;
      this.heroTop = rect.top + window.scrollY;
      const nextWidth = Math.max(1, Math.round(rect.width));
      const nextHeight = Math.max(1, Math.round(rect.height));
      const nextDpr = Math.min(window.devicePixelRatio || 1, 1.8);
      const changed = nextWidth !== this.width || nextHeight !== this.height || nextDpr !== this.dpr;

      this.width = nextWidth;
      this.height = nextHeight;
      this.dpr = nextDpr;
      this.compact = this.width < 760 || this.height < 520;
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      if(changed){
        this.seedScene();
      }
      this.draw(0);
    }

    seedScene(){
      const nodeCount = this.compact ? 24 : 52;
      const panelCount = this.scene === 'flow' || this.scene === 'orbit'
        ? (this.compact ? 0 : 2)
        : (this.compact ? 2 : 6);

      this.nodes = Array.from({length: nodeCount}, (_, i) => ({
        x: (Math.random() - 0.5) * 2.2,
        y: (Math.random() - 0.5) * 1.15,
        z: Math.random(),
        speed: 0.020 + Math.random() * 0.036,
        phase: Math.random() * Math.PI * 2,
        tone: i % 5 === 0 ? 'gold' : i % 3 === 0 ? 'green' : 'blue'
      }));

      this.panels = Array.from({length: panelCount}, (_, i) => ({
        x: -0.78 + (i % 3) * 0.78 + (Math.random() - 0.5) * 0.14,
        y: -0.28 + Math.floor(i / 3) * 0.46 + (Math.random() - 0.5) * 0.12,
        z: 0.18 + (i % 3) * 0.18,
        w: 132 + Math.random() * 48,
        h: 76 + Math.random() * 34,
        phase: Math.random() * Math.PI * 2,
        label: ['BIST', 'RISK', 'MODEL', 'FLOW', 'FX', 'VAL'][i] || 'DATA',
        bars: [0.42 + Math.random() * 0.45, 0.28 + Math.random() * 0.48, 0.52 + Math.random() * 0.34]
      }));
    }

    motionPaused(){
      return prefersReducedMotion.matches || document.documentElement.hasAttribute('data-motion-paused');
    }

    start(){
      cancelAnimationFrame(this.raf);
      this.lastTime = performance.now();
      if(this.motionPaused()){
        this.draw(0);
        return;
      }
      this.visible = !document.hidden && this.inViewport;
      if(this.visible){
        this.raf = requestAnimationFrame(this.onTick);
      }
    }

    stop(){
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }

    handleVisibility(){
      this.visible = !document.hidden && this.inViewport;
      if(this.visible){
        this.start();
      }else{
        this.stop();
      }
    }

    handleMotionPreference(){
      this.pointer.x = this.pointer.y = this.pointer.tx = this.pointer.ty = 0;
      if(this.motionPaused()){
        this.stop();
        this.draw(0);
      }else{
        this.start();
      }
    }

    movePointer(event){
      if(!finePointer.matches || this.motionPaused() || document.hidden || !this.inViewport || event.pointerType === 'touch') return;
      const rect = this.pointerRect;
      if(!rect) return;
      this.pointer.tx = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
      // offsetY would vary by child; use page coordinates to survive scrolling.
      this.pointer.ty = clamp(((event.clientY + window.scrollY - this.heroTop) / rect.height - 0.5) * 2, -1, 1);
    }

    tick(now){
      const dt = clamp((now - this.lastTime) / 1000, 0, 0.05);
      this.lastTime = now;
      this.update(dt, now / 1000);
      this.draw(now / 1000);
      if(!document.hidden && this.inViewport && !this.motionPaused()){
        this.raf = requestAnimationFrame(this.onTick);
      }
    }

    update(dt, time){
      this.pointer.x = lerp(this.pointer.x, this.pointer.tx, 0.045);
      this.pointer.y = lerp(this.pointer.y, this.pointer.ty, 0.045);

      for(const node of this.nodes){
        node.z += node.speed * dt * (this.compact ? 0.45 : 1);
        node.y += Math.sin(time * 0.55 + node.phase) * 0.0008;
        if(node.z > 1.08){
          node.z = -0.05;
          node.x = (Math.random() - 0.5) * 2.2;
          node.y = (Math.random() - 0.5) * 1.12;
        }
      }
    }

    project(point){
      const depth = clamp(point.z, 0, 1);
      const perspective = 0.56 + depth * 0.68;
      const horizon = this.height * (this.compact ? 0.45 : 0.47);
      const parallaxX = this.pointer.x * (1 - depth) * 0.012;
      const parallaxY = this.pointer.y * (1 - depth) * 0.008;
      return {
        x: this.width * 0.5 + (point.x + parallaxX) * this.width * 0.46 * perspective,
        y: horizon + (point.y + parallaxY) * this.height * 0.34 * perspective + depth * this.height * 0.22,
        scale: perspective,
        depth
      };
    }

    draw(time){
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);
      this.drawAtmosphere(ctx, time);
      this.drawPerspectiveGrid(ctx, time);
      if(this.scene === 'orbit'){
        this.drawRiskOrbit(ctx, time);
        this.drawNetwork(ctx, time);
        return;
      }
      if(this.scene === 'report') this.drawDepthColumns(ctx, time);
      this.drawDataRibbons(ctx, time);
      this.drawNetwork(ctx, time);
      if(this.scene !== 'lattice') this.drawPanels(ctx, time);
    }

    drawAtmosphere(ctx, time){
      const glowX = this.width * (0.58 + this.pointer.x * 0.08);
      const glowY = this.height * (0.38 + this.pointer.y * 0.06);
      const radial = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, Math.max(this.width, this.height) * 0.75);
      radial.addColorStop(0, 'rgba(48, 118, 255, 0.18)');
      radial.addColorStop(0.38, 'rgba(28, 181, 146, 0.10)');
      radial.addColorStop(1, 'rgba(4, 10, 18, 0)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, this.width, this.height);

      const sweep = ctx.createLinearGradient(0, 0, this.width, this.height);
      sweep.addColorStop(0, 'rgba(255,255,255,0)');
      sweep.addColorStop(0.52 + Math.sin(time * 0.12) * 0.04, 'rgba(226, 185, 91, 0.07)');
      sweep.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sweep;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    drawPerspectiveGrid(ctx, time){
      const horizon = this.height * (this.compact ? 0.49 : 0.52);
      const vanishingX = this.width * (0.52 + this.pointer.x * 0.035);
      const bottom = this.height + 24;

      ctx.save();
      ctx.lineWidth = 1;
      for(let i = 0; i < 13; i++){
        const t = i / 12;
        const y = horizon + t * t * (bottom - horizon);
        const alpha = 0.05 + (1 - t) * 0.045;
        ctx.strokeStyle = `rgba(139, 166, 196, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
        ctx.stroke();
      }

      const cols = this.compact ? 9 : 15;
      for(let i = 0; i <= cols; i++){
        const x = (i / cols) * this.width;
        const alpha = 0.035 + Math.abs(i - cols / 2) / cols * 0.025;
        ctx.strokeStyle = `rgba(116, 150, 190, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(vanishingX, horizon);
        ctx.lineTo(x, bottom);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(53, 196, 159, 0.13)';
      ctx.lineWidth = 1.4;
      const offset = (time * 34) % 72;
      for(let i = -2; i < 8; i++){
        const y = horizon + i * 72 + offset;
        if(y > horizon && y < bottom){
          ctx.beginPath();
          ctx.moveTo(this.width * 0.12, y);
          ctx.lineTo(this.width * 0.88, y + 14);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    drawDataRibbons(ctx, time){
      const ribbons = this.compact ? 2 : 4;
      for(let r = 0; r < ribbons; r++){
        const baseY = this.height * (0.22 + r * 0.105);
        const amp = this.height * (0.026 + r * 0.004);
        const phase = time * (0.22 + r * 0.04) + r * 1.5;
        const gradient = ctx.createLinearGradient(this.width * 0.08, baseY, this.width * 0.92, baseY);
        gradient.addColorStop(0, 'rgba(102, 162, 255, 0)');
        gradient.addColorStop(0.22, 'rgba(102, 162, 255, 0.42)');
        gradient.addColorStop(0.62, 'rgba(53, 196, 159, 0.46)');
        gradient.addColorStop(1, 'rgba(226, 185, 91, 0)');
        ctx.save();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = r === 0 ? 2.2 : 1.35;
        ctx.shadowColor = r % 2 ? 'rgba(53,196,159,.28)' : 'rgba(102,162,255,.24)';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        const points = 44;
        for(let i = 0; i < points; i++){
          const t = i / (points - 1);
          const x = lerp(this.width * 0.08, this.width * 0.92, t);
          const wave = Math.sin(t * Math.PI * 4.5 + phase) * amp + Math.cos(t * Math.PI * 2.2 + phase * 0.7) * amp * 0.42;
          const y = baseY + wave + this.pointer.y * 8;
          if(i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    drawDepthColumns(ctx, time){
      const count = this.compact ? 5 : 9;
      const startX = this.width * (this.compact ? 0.48 : 0.57);
      const available = this.width * 0.38;
      ctx.save();
      for(let index = 0; index < count; index++){
        const ratio = index / Math.max(1, count - 1);
        const width = Math.max(12, available / count - 8);
        const height = this.height * (0.10 + (0.10 + Math.sin(time * 0.3 + index * 1.3) * 0.025) * (index % 4 + 1));
        const x = startX + ratio * (available - width);
        const y = this.height * 0.64 - height;
        const fill = ctx.createLinearGradient(x, y, x, y + height);
        fill.addColorStop(0, index % 3 === 0 ? 'rgba(79,209,165,.22)' : 'rgba(134,174,202,.19)');
        fill.addColorStop(1, 'rgba(255,255,255,.018)');
        roundedRect(ctx, x, y, width, height, 3);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = 'rgba(190,215,214,.10)';
        ctx.stroke();
      }
      ctx.restore();
    }

    drawRiskOrbit(ctx, time){
      const centerX = this.width * (this.compact ? 0.62 : 0.71) + this.pointer.x * 18;
      const centerY = this.height * 0.44 + this.pointer.y * 12;
      const radius = Math.min(this.width, this.height) * (this.compact ? 0.23 : 0.28);
      ctx.save();
      for(let ring = 1; ring <= 4; ring++){
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius * ring / 4, radius * 0.46 * ring / 4, -0.16, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(134,174,202,${0.055 + ring * 0.018})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      const orbiters = this.compact ? 5 : 9;
      for(let index = 0; index < orbiters; index++){
        const angle = time * (0.045 + index * 0.002) + index / orbiters * Math.PI * 2;
        const orbitRadius = radius * (0.52 + (index % 3) * 0.18);
        const x = centerX + Math.cos(angle) * orbitRadius;
        const y = centerY + Math.sin(angle) * orbitRadius * 0.46;
        const color = index % 4 === 0 ? '215,179,106' : index % 3 === 0 ? '79,209,165' : '134,174,202';
        ctx.fillStyle = `rgba(${color},.75)`;
        ctx.shadowColor = `rgba(${color},.30)`;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(x, y, 2.2 + index % 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    drawNetwork(ctx){
      const projected = this.nodes.map(node => ({node, ...this.project(node)}));
      const maxDistance = this.compact ? 96 : 132;

      ctx.save();
      for(let i = 0; i < projected.length; i++){
        for(let j = i + 1; j < projected.length; j++){
          const a = projected[i];
          const b = projected[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.hypot(dx, dy);
          if(distance < maxDistance){
            const alpha = (1 - distance / maxDistance) * 0.18 * (0.42 + (a.depth + b.depth) * 0.58);
            ctx.strokeStyle = `rgba(111, 185, 213, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for(const item of projected){
        const radius = 1.6 + item.scale * 2.5;
        const color = item.node.tone === 'gold'
          ? '226, 185, 91'
          : item.node.tone === 'green'
            ? '53, 196, 159'
            : '102, 162, 255';
        ctx.fillStyle = `rgba(${color}, ${0.45 + item.depth * 0.34})`;
        ctx.shadowColor = `rgba(${color}, 0.35)`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(item.x, item.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    drawPanels(ctx, time){
      ctx.save();
      for(const panel of this.panels){
        const p = this.project({
          x: panel.x,
          y: panel.y + Math.sin(time * 0.35 + panel.phase) * 0.018,
          z: panel.z
        });
        const w = panel.w * p.scale;
        const h = panel.h * p.scale;
        const x = p.x - w / 2;
        const y = p.y - h / 2;

        ctx.globalAlpha = this.compact ? 0.55 : 0.76;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
        ctx.shadowBlur = 22;
        roundedRect(ctx, x, y, w, h, 8);
        const fill = ctx.createLinearGradient(x, y, x + w, y + h);
        fill.addColorStop(0, 'rgba(16, 27, 43, 0.70)');
        fill.addColorStop(1, 'rgba(10, 18, 30, 0.46)');
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(180, 210, 236, 0.18)';
        ctx.stroke();

        ctx.fillStyle = 'rgba(226, 185, 91, 0.82)';
        ctx.font = `${Math.max(9, 10 * p.scale)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
        ctx.fillText(panel.label, x + 12 * p.scale, y + 20 * p.scale);

        ctx.fillStyle = 'rgba(222, 233, 236, 0.72)';
        ctx.font = `${Math.max(9, 11 * p.scale)}px Inter, system-ui, sans-serif`;
        ctx.fillText('MODEL TRACE', x + 12 * p.scale, y + 42 * p.scale);

        panel.bars.forEach((bar, index) => {
          const by = y + (52 + index * 10) * p.scale;
          const bw = (w - 24 * p.scale) * (bar + Math.sin(time * 0.7 + index + panel.phase) * 0.035);
          ctx.fillStyle = 'rgba(255,255,255,0.10)';
          roundedRect(ctx, x + 12 * p.scale, by, w - 24 * p.scale, 4 * p.scale, 99);
          ctx.fill();
          ctx.fillStyle = index === 0 ? 'rgba(53,196,159,0.72)' : index === 1 ? 'rgba(102,162,255,0.70)' : 'rgba(226,185,91,0.70)';
          roundedRect(ctx, x + 12 * p.scale, by, bw, 4 * p.scale, 99);
          ctx.fill();
        });
      }
      ctx.restore();
    }
  }

  function boot(){
    document.querySelectorAll('.hero').forEach(hero => {
      if(!hero.querySelector('.finance-bg-canvas')){
        new FinanceBackground(hero);
      }
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot, {once: true});
  }else{
    boot();
  }
})();
