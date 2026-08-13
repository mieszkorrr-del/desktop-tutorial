/* Ilustracje ćwiczeń — rysowane w SVG z modelu stawów.

   Każde ćwiczenie ma dwie pozy: startową i końcową. Rysunki przełączają
   się w pętli, więc widać ruch, a nie zastygłą sylwetkę. Wszystko liczone
   w kodzie, bez plików graficznych — działa offline i waży kilka kilobajtów.

   Układ współrzędnych: 120 × 130, podłoga na y = 124. */

const FIG = {
  /* --- A1. Przysiad do krzesła --- */
  przysiad_start: {
    head: [60, 20], spine: [[60, 28], [60, 66]],
    arms: [[[60, 36], [52, 52], [50, 68]], [[60, 36], [68, 52], [70, 68]]],
    legs: [[[60, 66], [56, 94], [55, 124]], [[60, 66], [66, 94], [67, 124]]],
    props: 'chair'
  },
  przysiad_end: {
    head: [50, 32], spine: [[50, 40], [62, 76]],
    arms: [[[51, 46], [66, 52], [80, 54]], [[51, 46], [67, 55], [81, 57]]],
    legs: [[[62, 76], [76, 92], [66, 124]], [[62, 76], [78, 94], [70, 124]]],
    props: 'chair'
  },

  /* --- A2. Martwy ciąg z plecakiem --- */
  ciag_start: {
    head: [60, 20], spine: [[60, 28], [60, 66]],
    arms: [[[60, 36], [58, 54], [57, 72]], [[60, 36], [64, 54], [65, 72]]],
    legs: [[[60, 66], [57, 94], [56, 124]], [[60, 66], [65, 94], [66, 124]]],
    props: 'bag-hands:61,74'
  },
  ciag_end: {
    head: [42, 40], spine: [[48, 46], [68, 70]],
    arms: [[[50, 52], [52, 72], [53, 92]], [[50, 52], [56, 72], [57, 92]]],
    legs: [[[68, 70], [70, 96], [66, 124]], [[68, 70], [76, 96], [72, 124]]],
    props: 'bag-hands:55,94'
  },

  /* --- A3. Wiosłowanie w opadzie --- */
  wioslo_start: {
    head: [40, 44], spine: [[46, 50], [70, 70]],
    arms: [[[48, 56], [50, 76], [51, 94]], [[48, 56], [55, 76], [56, 94]]],
    legs: [[[70, 70], [72, 96], [68, 124]], [[70, 70], [78, 96], [74, 124]]],
    props: 'bag-hands:53,96'
  },
  wioslo_end: {
    head: [40, 44], spine: [[46, 50], [70, 70]],
    arms: [[[48, 56], [40, 72], [52, 68]], [[48, 56], [42, 76], [54, 72]]],
    legs: [[[70, 70], [72, 96], [68, 124]], [[70, 70], [78, 96], [74, 124]]],
    props: 'bag-hands:53,70'
  },

  /* --- A4. Mostek biodrowy --- */
  mostek_start: {
    head: [26, 108], spine: [[34, 112], [70, 114]],
    arms: [[[38, 112], [54, 118], [66, 120]], [[38, 114], [54, 120], [66, 122]]],
    legs: [[[70, 114], [90, 108], [96, 124]], [[70, 116], [92, 110], [98, 124]]],
    props: 'floor'
  },
  mostek_end: {
    head: [26, 108], spine: [[34, 110], [72, 96]],
    arms: [[[38, 110], [54, 116], [66, 120]], [[38, 112], [54, 118], [66, 122]]],
    legs: [[[72, 96], [92, 104], [96, 124]], [[72, 98], [94, 106], [98, 124]]],
    props: 'floor'
  },

  /* --- A5. Wznosy na palce --- */
  palce_start: {
    head: [60, 20], spine: [[60, 28], [60, 66]],
    arms: [[[60, 36], [52, 52], [50, 68]], [[60, 36], [68, 52], [70, 68]]],
    legs: [[[60, 66], [57, 94], [56, 124]], [[60, 66], [65, 94], [66, 124]]],
    props: 'step'
  },
  palce_end: {
    head: [60, 12], spine: [[60, 20], [60, 58]],
    arms: [[[60, 28], [52, 44], [50, 60]], [[60, 28], [68, 44], [70, 60]]],
    legs: [[[60, 58], [57, 88], [56, 118]], [[60, 58], [65, 88], [66, 118]]],
    props: 'step'
  },

  /* --- B1. Pompki o blat --- */
  pompki_start: {
    head: [86, 46], spine: [[80, 52], [46, 92]],
    arms: [[[78, 54], [66, 50], [56, 46]], [[78, 56], [66, 52], [56, 48]]],
    legs: [[[46, 92], [34, 108], [24, 122]], [[46, 94], [32, 110], [22, 124]]],
    props: 'counter'
  },
  pompki_end: {
    head: [74, 50], spine: [[70, 56], [42, 94]],
    arms: [[[68, 58], [58, 62], [54, 46]], [[68, 60], [58, 64], [54, 48]]],
    legs: [[[42, 94], [32, 108], [22, 122]], [[42, 96], [30, 110], [20, 124]]],
    props: 'counter'
  },

  /* --- B2. Wyciskanie nad głowę --- */
  wyciskanie_start: {
    head: [60, 20], spine: [[60, 28], [60, 66]],
    arms: [[[60, 36], [46, 44], [52, 34]], [[60, 36], [74, 44], [68, 34]]],
    legs: [[[60, 66], [57, 94], [56, 124]], [[60, 66], [65, 94], [66, 124]]],
    props: 'bag-hands:60,32'
  },
  wyciskanie_end: {
    head: [60, 22], spine: [[60, 30], [60, 66]],
    arms: [[[60, 36], [54, 20], [56, 6]], [[60, 36], [66, 20], [64, 6]]],
    legs: [[[60, 66], [57, 94], [56, 124]], [[60, 66], [65, 94], [66, 124]]],
    props: 'bag-hands:60,4'
  },

  /* --- B3. Odwodzenie ramion --- */
  odwodzenie_start: {
    head: [60, 20], spine: [[60, 28], [60, 66]],
    arms: [[[60, 36], [56, 52], [55, 70]], [[60, 36], [64, 52], [65, 70]]],
    legs: [[[60, 66], [57, 94], [56, 124]], [[60, 66], [65, 94], [66, 124]]],
    props: 'bottles:55,72;65,72'
  },
  odwodzenie_end: {
    head: [60, 20], spine: [[60, 28], [60, 66]],
    arms: [[[60, 36], [44, 36], [28, 36]], [[60, 36], [76, 36], [92, 36]]],
    legs: [[[60, 66], [57, 94], [56, 124]], [[60, 66], [65, 94], [66, 124]]],
    props: 'bottles:26,38;92,38'
  },

  /* --- B4. Deska (plank) --- */
  deska_start: {
    head: [96, 76], spine: [[88, 80], [40, 88]],
    arms: [[[86, 82], [82, 94], [96, 96]], [[86, 84], [82, 96], [96, 98]]],
    legs: [[[40, 88], [26, 100], [14, 120]], [[40, 90], [24, 102], [12, 122]]],
    props: 'floor'
  },
  deska_end: {
    head: [96, 74], spine: [[88, 78], [40, 86]],
    arms: [[[86, 80], [82, 92], [96, 94]], [[86, 82], [82, 94], [96, 96]]],
    legs: [[[40, 86], [26, 98], [14, 120]], [[40, 88], [24, 100], [12, 122]]],
    props: 'floor'
  },

  /* --- B5. Marsz w miejscu z wysokim kolanem --- */
  marsz_start: {
    head: [60, 20], spine: [[60, 28], [60, 66]],
    arms: [[[60, 36], [48, 48], [46, 62]], [[60, 36], [72, 48], [74, 62]]],
    legs: [[[60, 66], [57, 94], [56, 124]], [[60, 66], [65, 94], [66, 124]]],
    props: 'floor'
  },
  marsz_end: {
    head: [60, 20], spine: [[60, 28], [60, 66]],
    arms: [[[60, 36], [72, 46], [76, 60]], [[60, 36], [48, 44], [44, 32]]],
    legs: [[[60, 66], [58, 94], [57, 124]], [[60, 66], [76, 72], [74, 92]]],
    props: 'floor'
  }
};

/* Sprzęt i otoczenie rysowane pod sylwetką. */
function figProps(spec) {
  if (!spec) return '';
  const line = 'stroke="var(--ink-soft)" stroke-width="2.5" fill="none" stroke-linecap="round"';

  if (spec === 'floor') return `<line x1="4" y1="124" x2="116" y2="124" ${line}/>`;
  if (spec === 'chair') return `<line x1="4" y1="124" x2="116" y2="124" ${line}/>
    <path d="M66 88 h30 v36 M96 88 v-34" ${line}/>`;
  if (spec === 'counter') return `<line x1="4" y1="124" x2="116" y2="124" ${line}/>
    <path d="M44 46 h64 M52 46 v78" ${line}/>`;
  if (spec === 'step') return `<line x1="4" y1="124" x2="116" y2="124" ${line}/>
    <path d="M40 118 h44 v6" ${line}/>`;

  if (spec.startsWith('bag-hands:')) {
    const [x, y] = spec.split(':')[1].split(',').map(Number);
    return `<line x1="4" y1="124" x2="116" y2="124" ${line}/>
      <rect x="${x - 9}" y="${y - 2}" width="18" height="15" rx="3"
            fill="var(--accent)" opacity=".85"/>`;
  }
  if (spec.startsWith('bottles:')) {
    const pts = spec.split(':')[1].split(';').map(s => s.split(',').map(Number));
    return `<line x1="4" y1="124" x2="116" y2="124" ${line}/>` +
      pts.map(([x, y]) => `<rect x="${x - 3}" y="${y - 4}" width="7" height="14" rx="2"
        fill="var(--accent)" opacity=".85"/>`).join('');
  }
  return '';
}

function figBody(pose) {
  const poly = pts => `<polyline points="${pts.map(p => p.join(',')).join(' ')}"
    fill="none" stroke="var(--accent-ink)" stroke-width="4.5"
    stroke-linecap="round" stroke-linejoin="round"/>`;

  return `
    ${figProps(pose.props)}
    ${pose.legs.map(poly).join('')}
    ${poly(pose.spine)}
    ${pose.arms.map(poly).join('')}
    <circle cx="${pose.head[0]}" cy="${pose.head[1]}" r="8.5"
            fill="var(--accent-ink)"/>`;
}

/* Dwie klatki nakładane na siebie; CSS przełącza ich widoczność,
   dzięki czemu rysunek pokazuje ruch tam i z powrotem. */
function exerciseFigure(key) {
  const a = FIG[key + '_start'], b = FIG[key + '_end'];
  if (!a || !b) return '';
  return `<svg class="exfig" viewBox="0 0 120 130" role="img"
      aria-label="Ilustracja wykonania ćwiczenia — dwie fazy ruchu">
    <g class="exfig-a">${figBody(a)}</g>
    <g class="exfig-b">${figBody(b)}</g>
  </svg>`;
}
