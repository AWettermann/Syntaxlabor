/* Railroad diagrams. Every layout has an entry/exit at the same baseline.
   Sequence height accounts separately for space above and below that baseline. */
(function (scope) {
  'use strict';
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  function layout(n) {
    if (n.type === 'lit' || n.type === 'ref') return {w: Math.max(76, Array.from(n.type === 'lit' ? JSON.stringify(n.value) : n.value).length * 9 + 28), h: 44, mid: 22, children: []};
    if (n.type === 'eps') return {w: 76, h: 38, mid: 19, children: []};
    if (n.type === 'seq') {
      const ms = n.items.map(layout);
      if (!ms.length) return layout({type: 'eps'});
      const mid = Math.max(...ms.map(m => m.mid)), below = Math.max(...ms.map(m => m.h - m.mid));
      let x = 0;
      const children = ms.map((m, i) => { const child = {x, y: mid - m.mid, m, key: ['items', i]}; x += m.w + 30; return child; });
      return {w: x - 30, h: mid + below, mid, children};
    }
    if (n.type === 'alt') {
      const ms = n.items.map(layout); let y = 0;
      const children = ms.map((m, i) => { const child = {x: 48, y, m, key: ['items', i]}; y += m.h + 28; return child; });
      return {w: Math.max(76, ...ms.map(m => m.w)) + 96, h: Math.max(38, y - 28), mid: ms[0]?.mid ?? 19, children};
    }
    const child = layout(n.child);
    return {w: child.w + 96, h: 48 + child.h + (n.type === 'rep' ? 42 : 0), mid: 20, children: [{x: 48, y: 48, m: child, key: ['child']}]};
  }
  function svg(node, name, options = {}) {
    const m = layout(node), width = m.w + 68, height = m.h + 48, parts = [];
    const marker = `arrow-${options.id || 'diagram'}`.replace(/[^A-Za-z0-9_-]/g, '-');
    const p = (d, arrow = false) => parts.push(`<path class="rail" d="${d}"${arrow ? ` marker-end="url(#${marker})"` : ''}/>`);
    const line = (x1, y1, x2, y2, arrow = false) => p(`M${x1} ${y1}H${x2}${y1 === y2 ? '' : `V${y2}`}`, arrow);
    function draw(n, box, x, y, path) {
      const selected = options.selected && JSON.stringify(options.selected) === JSON.stringify(path);
      const label = {seq: 'Folge', alt: 'Alternative', opt: 'Optional', rep: 'Wiederholung', eps: 'Leeres Wort', lit: 'Terminal', ref: 'Nichtterminal'}[n.type];
      parts.push(`<g class="rail-node${selected ? ' selected' : ''}" data-node="${path.join('.')}" data-type="${n.type}" tabindex="0" role="button" aria-label="${escape(label + (n.value ? ': ' + n.value : ''))}"><title>${escape(label)} – anklicken zum Bearbeiten</title>`);
      if (!['lit', 'ref', 'eps'].includes(n.type)) parts.push(`<rect class="hit" x="${x - 3}" y="${y - 5}" width="${box.w + 6}" height="${box.h + 10}" rx="9"/>`);
      if (n.type === 'lit' || n.type === 'ref') {
        parts.push(`<rect class="block ${n.type}" x="${x}" y="${y}" width="${box.w}" height="44" rx="${n.type === 'lit' ? 18 : 2}"/><text x="${x + box.w / 2}" y="${y + 27}" text-anchor="middle">${escape(n.type === 'lit' ? JSON.stringify(n.value) : n.value)}</text>`);
      } else if (n.type === 'eps' || n.type === 'seq' && !n.items.length) {
        parts.push(`<rect class="empty" x="${x}" y="${y}" width="${box.w}" height="${box.h}" rx="12"/>`);
        line(x, y + box.mid, x + 22, y + box.mid); line(x + box.w - 22, y + box.mid, x + box.w, y + box.mid);
        parts.push(`<text x="${x + box.w / 2}" y="${y + box.mid + 5}" text-anchor="middle">ε</text>`);
      } else if (n.type === 'seq') {
        box.children.forEach((c, i) => {
          draw(n.items[i], c.m, x + c.x, y + c.y, [...path, ...c.key]);
          if (i < box.children.length - 1) line(x + c.x + c.m.w, y + box.mid, x + c.x + c.m.w + 30, y + box.mid, true);
        });
      } else if (n.type === 'alt') {
        const first = y + box.mid, lastChild = box.children.at(-1), last = lastChild ? y + lastChild.y + lastChild.m.mid : first;
        line(x, first, x + 16, first); p(`M${x + 16} ${first}V${last}`);
        p(`M${x + box.w - 16} ${first}V${last}`); line(x + box.w - 16, first, x + box.w, first);
        box.children.forEach((c, i) => {
          const base = y + c.y + c.m.mid;
          line(x + 16, base, x + c.x, base, true);
          draw(n.items[i], c.m, x + c.x, y + c.y, [...path, ...c.key]);
          line(x + c.x + c.m.w, base, x + box.w - 16, base, true);
        });
      } else {
        const c = box.children[0], base = y + box.mid, down = y + c.y + c.m.mid, end = x + c.x + c.m.w;
        // Top bypass is present for BOTH option and zero-or-more repetition.
        line(x, base, x + 16, base); line(x + 16, base, x + box.w - 16, base, true); line(x + box.w - 16, base, x + box.w, base);
        p(`M${x + 16} ${base}V${down}H${x + c.x}`, true);
        draw(n.child, c.m, x + c.x, y + c.y, [...path, ...c.key]);
        p(`M${end} ${down}H${x + box.w - 16}V${base}`, true);
        if (n.type === 'rep') {
          const low = y + c.y + c.m.h + 24;
          p(`M${end} ${down}H${x + box.w - 30}V${low}H${x + 30}`, true);
          p(`M${x + 30} ${low}V${down}H${x + c.x}`, true);
        }
        parts.push(`<text class="construct-label" x="${x + box.w / 2}" y="${y + 10}" text-anchor="middle">${n.type === 'rep' ? '0 … ∞' : '0 oder 1'}</text>`);
      }
      parts.push('</g>');
    }
    draw(node, m, 34, 24, []);
    parts.push(`<circle class="endpoint" cx="8" cy="${24 + m.mid}" r="3"/>`);
    line(11, 24 + m.mid, 34, 24 + m.mid, true);
    line(34 + m.w, 24 + m.mid, 57 + m.w, 24 + m.mid, true);
    parts.push(`<circle class="endpoint" cx="${61 + m.w}" cy="${24 + m.mid}" r="3"/>`);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="group" aria-label="Syntaxdiagramm ${escape(name)}"><defs><marker id="${marker}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="#59646a" stroke-width="1.5"/></marker></defs><style>.rail{fill:none;stroke:#59646a;stroke-width:1.8;stroke-linejoin:round}.endpoint{fill:#59646a}text{font:14px ui-monospace,SFMono-Regular,Consolas,monospace;fill:#29323b;pointer-events:none}.block{stroke:#ba7b42;stroke-width:1.6;fill:#f9ddbc}.ref{fill:#e2edf1;stroke:#819da7}.hit{fill:transparent;stroke:transparent}.empty{fill:#fffcf6;stroke:#d4bda5;stroke-dasharray:3 3}.rail-node{cursor:pointer;outline:none}.rail-node:hover>.block,.rail-node:focus>.block,.selected>.block,.selected>.empty{stroke:#c05c21;stroke-width:3}.rail-node:hover>.hit,.rail-node:focus>.hit,.selected>.hit{stroke:#c05c21;stroke-width:1.5;stroke-dasharray:5 4}.construct-label{font:11px system-ui;fill:#7c6858}</style>${parts.join('')}</svg>`;
  }
  const api = {layout, svg, escape};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else scope.SyntaxRenderer = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
