class CsLoader extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          display:         flex;
          flex-direction:  column;
          align-items:     center;
          justify-content: center;
          gap:             28px;
          min-height:      100dvh;
          background:      var(--color-bg, #0b0e15);
        }
        svg {
          width:    min(200px, 26vw);
          overflow: visible;
        }
        .bar, .wave, .tail { fill: var(--loader-color, #183EFC); }
        .label {
          font-family:    var(--font-mono, 'JetBrains Mono', monospace);
          font-size:      var(--font-size-sm, 11px);
          color:          var(--color-muted, #8394a8);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
      </style>
      <svg viewBox="0 0 1000 160">
        <rect id="leftBar" class="bar" />
        <polygon id="rightTail" class="tail" />
        <rect id="wave" class="wave" />
      </svg>
      <div class="label"><slot>Loading…</slot></div>
    `;

    const leftBar   = shadow.getElementById('leftBar');
    const rightTail = shadow.getElementById('rightTail');
    const wave      = shadow.getElementById('wave');

    const bar      = { x: 80, y: 70, width: 840, height: 32 };
    const segment  = { width: 95, height: bar.height };
    const duration = 2800;
    const maxAngle = -Math.asin(bar.height / segment.width);

    const lerp = (a, b, t) => a + (b - a) * t;
    const easeInOutCubic = t =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const gaussianPulse = (t, center = 0.5, width = 0.18) => {
      const x = (t - center) / width;
      return Math.exp(-x * x);
    };

    const draw = time => {
      const raw      = (time % duration) / duration;
      const progress = easeInOutCubic(raw);
      const angle    = maxAngle * gaussianPulse(raw, 0.5, 0.18);

      const startX = bar.x;
      const endX   = bar.x + bar.width - segment.width;
      const pivotX = lerp(startX, endX, progress);
      const pivotY = bar.y + bar.height;
      const cos    = Math.cos(angle);
      const sin    = Math.sin(angle);

      const bottomRight = {
        x: pivotX + segment.width * cos,
        y: pivotY + segment.width * sin,
      };

      const barEndX    = bar.x + bar.width;
      const barTopY    = bar.y;
      const barBottomY = bar.y + bar.height;

      const xOnCutLineAtY = y => {
        const u = (y - bottomRight.y) / -cos;
        return bottomRight.x + u * sin;
      };

      leftBar.setAttribute('x',      bar.x);
      leftBar.setAttribute('y',      bar.y);
      leftBar.setAttribute('width',  Math.max(0, pivotX - bar.x));
      leftBar.setAttribute('height', bar.height);

      rightTail.setAttribute('points', `
        ${xOnCutLineAtY(barTopY)},${barTopY}
        ${barEndX},${barTopY}
        ${barEndX},${barBottomY}
        ${xOnCutLineAtY(barBottomY)},${barBottomY}
      `);

      wave.setAttribute('x',         pivotX);
      wave.setAttribute('y',         bar.y);
      wave.setAttribute('width',     segment.width);
      wave.setAttribute('height',    segment.height);
      wave.setAttribute('transform', `rotate(${angle * 180 / Math.PI} ${pivotX} ${pivotY})`);

      this._raf = requestAnimationFrame(draw);
    };

    this._raf = requestAnimationFrame(draw);
  }

  disconnectedCallback() {
    cancelAnimationFrame(this._raf);
  }
}

customElements.define('cs-loader', CsLoader);
