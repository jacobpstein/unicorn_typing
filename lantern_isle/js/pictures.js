'use strict';

/* Hand-drawn spot illustrations for spelling words (viewBox 0 0 100 100). */

const eye = (x, y, r = 2.7) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#4b3b63" stroke="none"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.38}" fill="#fff" stroke="none"/>`;
const smile = (x, y, w = 5) => `<path d="M${x - w} ${y} Q${x} ${y + w * 0.9} ${x + w} ${y}" fill="none"/>`;
const blush = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="2.2" fill="#f7a3b5" stroke="none" opacity=".75"/>`;
const shine = (x, y, r = 4) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.6}" fill="#fff" stroke="none" opacity=".7" transform="rotate(-30 ${x} ${y})"/>`;

const PICS = {
  cat: `<path d="M72 80 Q94 74 88 52" fill="none" stroke="#e8964a" stroke-width="7"/>    <ellipse cx="54" cy="72" rx="24" ry="16" fill="#f7b267"/>
    <path d="M24 34 L22 14 L38 26Z M56 34 L58 14 L42 26Z" fill="#f7b267"/><path d="M27 29 L26 20 L33 26Z M53 29 L54 20 L47 26Z" fill="#f7a3b5" stroke="none"/>
    <circle cx="40" cy="44" r="18" fill="#f7b267"/>
    ${eye(33, 43)}${eye(47, 43)}<path d="M38 50 L40 52 L42 50Z" fill="#f48aa6"/>${smile(40, 53, 3.5)}
    <path d="M18 47 L29 49 M18 54 L29 52 M51 49 L62 47 M51 52 L62 54" fill="none" stroke-width="1.4"/>${blush(29, 50)}${blush(51, 50)}`,

  dog: `<ellipse cx="27" cy="52" rx="9" ry="19" fill="#8a5a35" transform="rotate(18 27 52)"/>
    <ellipse cx="73" cy="52" rx="9" ry="19" fill="#8a5a35" transform="rotate(-18 73 52)"/>
    <circle cx="50" cy="50" r="23" fill="#d6a06a"/><ellipse cx="62" cy="40" rx="7" ry="6" fill="#8a5a35" stroke="none" opacity=".6"/>
    <ellipse cx="50" cy="63" rx="13" ry="10" fill="#f6dfc2"/>
    <ellipse cx="50" cy="57" rx="5" ry="3.6" fill="#4b3b63"/>${eye(41, 45)}${eye(59, 45)}
    <path d="M47 68 Q50 78 53 68Z" fill="#f48aa6"/><path d="M44 64 Q50 69 56 64" fill="none"/>`,

  sun: `<g stroke="#f5a623" stroke-width="5"><path d="M74 50 L86 50 M67 67 L75 75 M50 74 L50 86 M33 67 L25 75 M26 50 L14 50 M33 33 L25 25 M50 26 L50 14 M67 33 L75 25"/></g>
    <circle cx="50" cy="50" r="19" fill="#ffd35c"/>${eye(43, 47, 2.4)}${eye(57, 47, 2.4)}${smile(50, 55, 5)}${blush(39, 54)}${blush(61, 54)}`,

  hat: `<ellipse cx="50" cy="66" rx="40" ry="12" fill="#f0606f"/>
    <path d="M28 66 Q28 32 50 32 Q72 32 72 66Z" fill="#f0606f"/>
    <path d="M29 56 Q50 61 71 56 L71.6 64 Q50 69 28.6 64Z" fill="#ffd1e6"/>
    <circle cx="64" cy="58" r="6" fill="#ffd35c"/><circle cx="64" cy="58" r="2.4" fill="#f5a623" stroke="none"/>${shine(40, 42, 5)}`,

  map: `<path d="M12 28 L37 20 L63 28 L88 20 L88 74 L63 82 L37 74 L12 82Z" fill="#fbe7c0"/>
    <path d="M37 20 L37 74 M63 28 L63 82" fill="none" stroke-width="1.8"/>
    <path d="M37 20 L63 28 L63 82 L37 74Z" fill="#f3d6a0" stroke="none" opacity=".7"/>
    <path d="M22 68 Q34 50 48 58 T74 38" fill="none" stroke="#f0606f" stroke-width="3" stroke-dasharray="5 5"/>
    <path d="M70 32 L80 42 M80 32 L70 42" stroke="#f0606f" stroke-width="4"/>
    <path d="M20 34 Q26 30 30 36 Q26 42 20 38Z" fill="#7fd48a" stroke-width="1.5"/>`,

  bed: `<rect x="12" y="28" width="12" height="54" rx="4" fill="#b48ef0"/>
    <rect x="80" y="50" width="10" height="32" rx="4" fill="#b48ef0"/>
    <rect x="22" y="56" width="62" height="14" rx="3" fill="#fff"/>
    <path d="M42 50 L86 50 Q88 50 88 54 L88 70 L42 70Z" fill="#7fc8f8"/>
    <path d="M50 50 L50 70 M60 50 L60 70" stroke="#fff" stroke-width="2" fill="none"/>
    <ellipse cx="34" cy="50" rx="11" ry="7" fill="#fff"/>
    <rect x="12" y="68" width="78" height="10" rx="3" fill="#9b74e8"/>`,

  pig: `<path d="M28 34 L24 18 L40 28Z M72 34 L76 18 L60 28Z" fill="#ffb3c7"/>
    <circle cx="50" cy="52" r="26" fill="#ffc2d4"/>
    <ellipse cx="50" cy="60" rx="12" ry="9" fill="#f590ae"/>
    <ellipse cx="45.5" cy="60" rx="2.4" ry="3.4" fill="#4b3b63" stroke="none"/><ellipse cx="54.5" cy="60" rx="2.4" ry="3.4" fill="#4b3b63" stroke="none"/>
    ${eye(40, 45)}${eye(60, 45)}${blush(33, 56)}${blush(67, 56)}`,

  bug: `<path d="M44 26 Q36 14 30 14 M56 26 Q64 14 70 14" fill="none"/><circle cx="30" cy="14" r="3" fill="#4b3b63"/><circle cx="70" cy="14" r="3" fill="#4b3b63"/>
    <path d="M28 58 L16 54 M28 68 L16 72 M72 58 L84 54 M72 68 L84 72" fill="none"/>
    <circle cx="50" cy="60" r="26" fill="#f0606f"/>
    <path d="M30 42 A20 14 0 0 1 70 42 Q50 32 30 42Z" fill="#4b3b63"/><circle cx="50" cy="34" r="11" fill="#4b3b63"/>
    <path d="M50 38 L50 86" fill="none"/>
    <circle cx="38" cy="55" r="5" fill="#4b3b63" stroke="none"/><circle cx="62" cy="55" r="5" fill="#4b3b63" stroke="none"/>
    <circle cx="36" cy="71" r="4" fill="#4b3b63" stroke="none"/><circle cx="64" cy="71" r="4" fill="#4b3b63" stroke="none"/>
    ${eye(46, 33, 1.8)}${eye(54, 33, 1.8)}${shine(64, 46, 5)}`,

  cup: `<path d="M70 42 Q88 42 86 56 Q84 70 67 68 L68 61 Q78 62 79 56 Q80 49 70 49Z" fill="#7fc8f8"/>
    <path d="M26 34 L74 34 L70 78 Q50 86 30 78Z" fill="#7fc8f8"/>
    <ellipse cx="50" cy="34" rx="24" ry="5" fill="#cfeaff"/>
    <path d="M38 52 Q42 46 46 52 Q50 58 54 52" fill="none" stroke="#fff" stroke-width="3"/>
    <path d="M40 24 Q36 18 40 12 M52 24 Q48 18 52 12" fill="none" stroke="#c9b6e3" stroke-width="2.5"/>`,

  bus: `<rect x="8" y="28" width="84" height="44" rx="9" fill="#ffd35c"/>
    <rect x="14" y="34" width="16" height="14" rx="3" fill="#cfeaff"/><rect x="34" y="34" width="16" height="14" rx="3" fill="#cfeaff"/>
    <rect x="54" y="34" width="16" height="14" rx="3" fill="#cfeaff"/><rect x="74" y="34" width="12" height="26" rx="3" fill="#cfeaff"/>
    <path d="M8 56 L72 56" stroke="#f5a623" stroke-width="4"/>
    <circle cx="26" cy="74" r="9" fill="#4b3b63"/><circle cx="26" cy="74" r="3.5" fill="#c9b6e3" stroke="none"/>
    <circle cx="72" cy="74" r="9" fill="#4b3b63"/><circle cx="72" cy="74" r="3.5" fill="#c9b6e3" stroke="none"/>
    <circle cx="90" cy="64" r="3" fill="#fff4b8"/>`,

  net: `<path d="M18 88 L48 56" stroke="#c98f5a" stroke-width="6"/>
    <path d="M44 48 Q54 90 80 58" fill="#ffffff" fill-opacity=".7"/>
    <path d="M52 52 Q58 74 66 76 M62 48 Q66 70 74 70 M48 58 Q62 64 78 56 M50 66 Q62 72 72 66" fill="none" stroke-width="1.4"/>
    <ellipse cx="62" cy="38" rx="20" ry="14" fill="none" stroke="#9b74e8" stroke-width="5" transform="rotate(-25 62 38)"/>
    <path d="M60 64 q6 -6 12 0 q-6 6 -12 0Z M72 64 l5 -4 0 8Z" fill="#ffa26b" stroke-width="1.5"/>`,

  pen: `<g transform="rotate(-38 50 50)"><rect x="43" y="10" width="14" height="62" rx="3" fill="#b48ef0"/><rect x="43" y="10" width="14" height="12" rx="3" fill="#7e5fc4"/>
    <path d="M55 22 L60 22 L60 44" fill="none" stroke-width="2.5"/>
    <path d="M43 72 L57 72 L50 90Z" fill="#f6dfc2"/><path d="M48 85 L52 85 L50 90Z" fill="#4b3b63"/></g>
    <path d="M14 84 Q24 76 32 84 T50 84" fill="none" stroke="#7e5fc4" stroke-width="2.5"/>`,

  box: `<path d="M16 42 L60 42 L60 86 L16 86Z" fill="#e3b07a"/>
    <path d="M60 42 L84 30 L84 74 L60 86Z" fill="#c98f5a"/>
    <path d="M16 42 L40 30 L84 30 L60 42Z" fill="#f1c792"/>
    <path d="M16 42 L6 28 L30 20 L40 30 Z" fill="#f1c792"/><path d="M84 30 L94 18 L72 14 L60 30Z" fill="#e3b07a"/>
    <path d="M38 42 L38 60" stroke="#c98f5a" stroke-width="5"/>`,

  fox: `<path d="M50 84 L20 42 L24 14 L42 30 Q50 28 58 30 L76 14 L80 42Z" fill="#f7953f"/>
    <path d="M28 22 L30 34 L38 30Z M72 22 L70 34 L62 30Z" fill="#4b3b63" stroke="none" opacity=".8"/>
    <path d="M50 84 L28 52 Q40 60 50 58 Q60 60 72 52Z" fill="#fff"/>
    ${eye(38, 46)}${eye(62, 46)}<ellipse cx="50" cy="80" rx="4.5" ry="3.4" fill="#4b3b63"/>`,

  web: `<g fill="none" stroke="#9b97b8" stroke-width="1.6">
    <path d="M50 50 L90 50 M50 50 L78 78 M50 50 L50 90 M50 50 L22 78 M50 50 L10 50 M50 50 L22 22 M50 50 L50 10 M50 50 L78 22"/>
    <path d="M62 50 L58.5 58.5 L50 62 L41.5 58.5 L38 50 L41.5 41.5 L50 38 L58.5 41.5Z"/>
    <path d="M74 50 L67 67 L50 74 L33 67 L26 50 L33 33 L50 26 L67 33Z"/>
    <path d="M86 50 L75.5 75.5 L50 86 L24.5 75.5 L14 50 L24.5 24.5 L50 14 L75.5 24.5Z"/></g>
    <path d="M70 0 L70 30" fill="none" stroke-width="1.2"/><circle cx="70" cy="34" r="6" fill="#4b3b63"/>${eye(68, 33, 1.3)}${eye(72, 33, 1.3)}`,

  log: `<rect x="14" y="38" width="64" height="30" rx="6" fill="#b07a48"/>
    <path d="M24 46 L50 46 M30 58 L62 58 M20 52 L36 52" fill="none" stroke="#8a5a35" stroke-width="2"/>
    <ellipse cx="78" cy="53" rx="11" ry="15" fill="#e8c08a"/>
    <ellipse cx="78" cy="53" rx="6" ry="9" fill="none" stroke="#c98f5a" stroke-width="2"/><ellipse cx="78" cy="53" rx="2" ry="3" fill="#c98f5a" stroke="none"/>
    <path d="M34 38 Q34 26 44 28" fill="none" stroke="#7fd48a" stroke-width="3"/><ellipse cx="46" cy="27" rx="6" ry="3" fill="#7fd48a"/>`,

  pot: `<path d="M16 46 L8 46 Q4 50 8 54 L16 54 M84 46 L92 46 Q96 50 92 54 L84 54" fill="none" stroke-width="3"/>
    <path d="M16 42 L84 42 L80 80 Q50 88 20 80Z" fill="#f0606f"/>
    <rect x="12" y="36" width="76" height="9" rx="4" fill="#d94a5a"/>
    <path d="M36 28 Q32 20 36 12 M50 28 Q46 20 50 12 M64 28 Q60 20 64 12" fill="none" stroke="#c9b6e3" stroke-width="2.5"/>${shine(30, 56, 5)}`,

  van: `<path d="M8 72 L8 38 Q8 28 18 28 L62 28 Q72 28 78 40 L90 50 Q92 52 92 56 L92 72Z" fill="#7fc8f8"/>
    <path d="M62 34 L72 34 L82 50 L62 50Z" fill="#e6f4ff"/><rect x="16" y="34" width="18" height="16" rx="3" fill="#e6f4ff"/><rect x="38" y="34" width="18" height="16" rx="3" fill="#e6f4ff"/>
    <path d="M8 58 L92 58" stroke="#fff" stroke-width="4"/>
    <circle cx="26" cy="74" r="9" fill="#4b3b63"/><circle cx="26" cy="74" r="3.5" fill="#c9b6e3" stroke="none"/>
    <circle cx="74" cy="74" r="9" fill="#4b3b63"/><circle cx="74" cy="74" r="3.5" fill="#c9b6e3" stroke="none"/>`,

  fan: `<path d="M50 66 L50 84" stroke-width="5"/><ellipse cx="50" cy="86" rx="20" ry="6" fill="#b48ef0"/>
    <circle cx="50" cy="40" r="28" fill="#eaf7ff"/>
    <g fill="#7fc8f8"><ellipse cx="50" cy="26" rx="8" ry="13"/><ellipse cx="50" cy="26" rx="8" ry="13" transform="rotate(120 50 40)"/><ellipse cx="50" cy="26" rx="8" ry="13" transform="rotate(240 50 40)"/></g>
    <circle cx="50" cy="40" r="5" fill="#b48ef0"/>
    <path d="M22 40 L78 40 M50 12 L50 68 M30 20 L70 60 M70 20 L30 60" fill="none" stroke-width="1" opacity=".35"/>`,

  hen: `<path d="M74 44 Q90 34 86 54 Q92 50 88 62" fill="#fff"/>
    <ellipse cx="54" cy="60" rx="28" ry="21" fill="#fff"/>
    <path d="M28 30 Q30 20 36 26 Q40 18 44 28" fill="#f0606f"/>
    <circle cx="36" cy="40" r="13" fill="#fff"/>
    <path d="M23 40 L14 44 L23 47Z" fill="#ffc94a"/><path d="M27 48 Q24 56 30 54" fill="#f0606f"/>${eye(34, 38)}
    <path d="M46 58 Q58 50 70 62 Q58 70 46 58Z" fill="#f3ecf8"/>
    <path d="M46 80 L44 90 M60 80 L62 90" stroke="#f5a623" stroke-width="3"/>`,

  cap: `<path d="M22 62 Q22 28 50 28 Q78 28 78 62Z" fill="#7fc8f8"/>
    <path d="M70 60 Q94 58 96 68 Q80 74 58 66Z" fill="#4f9fe0"/>
    <path d="M50 28 L50 62 M36 32 Q32 46 34 62 M64 32 Q68 46 66 62" fill="none" stroke-width="1.6"/>
    <circle cx="50" cy="27" r="4" fill="#4f9fe0"/><rect x="20" y="58" width="58" height="6" rx="3" fill="#4f9fe0"/>`,

  jam: `<rect x="28" y="36" width="44" height="48" rx="10" fill="#d6406a"/>
    <rect x="26" y="24" width="48" height="13" rx="4" fill="#fff"/>
    <path d="M30 24 L30 37 M38 24 L38 37 M46 24 L46 37 M54 24 L54 37 M62 24 L62 37 M70 24 L70 37" stroke="#f48aa6" stroke-width="3"/>
    <rect x="34" y="50" width="32" height="22" rx="5" fill="#fff4f7"/>
    <path d="M50 54 Q58 56 56 64 Q52 70 50 70 Q48 70 44 64 Q42 56 50 54Z" fill="#f0606f" stroke-width="1.5"/>
    <path d="M46 54 L50 51 L54 54" fill="#7fd48a" stroke-width="1.5"/>${shine(34, 44, 4)}`,

  mop: `<path d="M70 8 L48 62" stroke="#c98f5a" stroke-width="6"/>
    <path d="M30 60 Q48 54 66 64 L64 70 Q48 62 32 66Z" fill="#9b74e8"/>
    <g stroke="#cfc6e6" stroke-width="5" fill="none"><path d="M34 66 Q30 78 26 88"/><path d="M42 66 Q40 80 38 90"/><path d="M50 67 Q50 80 50 91"/><path d="M58 68 Q60 80 62 90"/><path d="M64 69 Q70 80 74 88"/></g>
    <path d="M14 90 Q30 84 46 92" fill="none" stroke="#7fc8f8" stroke-width="3"/>`,

  bat: `<path d="M50 44 Q34 28 10 34 Q18 40 16 48 Q24 46 28 54 Q34 48 40 56 Q46 50 50 56 Q54 50 60 56 Q66 48 72 54 Q76 46 84 48 Q82 40 90 34 Q66 28 50 44Z" fill="#7e5fc4"/>
    <path d="M42 36 L40 24 L48 32 M58 36 L60 24 L52 32" fill="#9b74e8"/>
    <ellipse cx="50" cy="44" rx="11" ry="13" fill="#9b74e8"/>${eye(46, 41, 2.2)}${eye(54, 41, 2.2)}
    <path d="M47 48 L48 51 M53 48 L52 51" stroke="#fff" stroke-width="1.5"/>
    <path d="M70 80 Q74 72 80 78 Q84 70 88 80 A10 10 0 1 1 70 80Z" fill="#fff4b8" stroke-width="1.6" opacity=".9"/>`,

  red: `<path d="M50 16 Q66 14 72 28 Q90 30 84 48 Q94 64 78 72 Q74 90 56 84 Q42 94 32 80 Q12 80 16 62 Q4 48 20 38 Q20 18 38 22 Q42 14 50 16Z" fill="#f0606f"/>
    ${shine(38, 36, 7)}<circle cx="88" cy="22" r="4" fill="#f0606f"/><circle cx="12" cy="86" r="3" fill="#f0606f"/>`,

  nut: `<path d="M26 44 Q50 22 74 44 Q72 54 50 54 Q28 54 26 44Z" fill="#a0683c"/>
    <path d="M34 40 L66 40 M30 46 L70 46" fill="none" stroke="#7a4b2a" stroke-width="1.5"/>
    <path d="M50 30 Q52 20 58 18" fill="none" stroke="#7a4b2a" stroke-width="4"/>
    <path d="M30 52 Q28 76 50 86 Q72 76 70 52Z" fill="#e3b07a"/>${shine(40, 62, 4)}`,

  six: `<rect x="18" y="18" width="64" height="64" rx="14" fill="#fff"/>
    <g fill="#f0699f" stroke="none"><circle cx="36" cy="34" r="6"/><circle cx="36" cy="50" r="6"/><circle cx="36" cy="66" r="6"/><circle cx="64" cy="34" r="6"/><circle cx="64" cy="50" r="6"/><circle cx="64" cy="66" r="6"/></g>`,

  bag: `<path d="M36 40 Q36 18 50 18 Q64 18 64 40" fill="none" stroke="#9b74e8" stroke-width="5"/>
    <path d="M20 40 L80 40 L74 86 L26 86Z" fill="#b48ef0"/>
    <path d="M20 40 L80 40 L78 54 Q50 62 22 54Z" fill="#9b74e8"/>
    <circle cx="50" cy="56" r="5" fill="#ffd35c"/>
    <path d="M34 70 l3 5 5 1 -4 3 1 5 -5 -3 -5 3 1 -5 -4 -3 5 -1Z" fill="#ffd1e6" stroke-width="1.2"/>`,

  tub: `<g fill="#fff" stroke-width="1.6"><circle cx="30" cy="34" r="8"/><circle cx="44" cy="28" r="10"/><circle cx="60" cy="32" r="9"/><circle cx="72" cy="36" r="6"/><circle cx="54" cy="18" r="5"/></g>
    <path d="M10 42 L90 42 L86 66 Q80 80 66 80 L34 80 Q20 80 14 66Z" fill="#7fc8f8"/>
    <rect x="8" y="40" width="84" height="8" rx="4" fill="#b5e0ff"/>
    <path d="M26 80 L22 90 M74 80 L78 90" stroke-width="4"/>`,

  ant: `<path d="M30 58 L22 72 M44 60 L42 76 M56 60 L60 76 M40 56 L30 46 M54 56 L60 44" fill="none"/>
    <ellipse cx="26" cy="52" rx="13" ry="11" fill="#c0483e"/>
    <circle cx="48" cy="54" r="8" fill="#c0483e"/>
    <circle cx="68" cy="48" r="11" fill="#c0483e"/>
    <path d="M72 38 Q74 26 82 24 M66 38 Q62 26 66 20" fill="none"/>${eye(72, 46, 2.4)}${smile(70, 53, 3)}`,

  jet: `<path d="M10 52 Q20 42 50 44 L80 44 Q94 46 94 52 Q94 58 80 60 L50 60 Q20 62 10 52Z" fill="#fff"/>
    <path d="M44 44 L30 18 L40 18 L62 44Z" fill="#7fc8f8"/><path d="M44 60 L30 86 L40 86 L62 60Z" fill="#7fc8f8"/>
    <path d="M14 50 L8 34 L18 34 L26 46Z" fill="#f0699f"/>
    <circle cx="66" cy="51" r="3" fill="#cfeaff"/><circle cx="56" cy="51" r="3" fill="#cfeaff"/><circle cx="46" cy="51" r="3" fill="#cfeaff"/>
    <path d="M82 46 Q90 48 92 52 L82 52Z" fill="#cfeaff"/>`,

  ship: `<path d="M50 14 L50 62" stroke-width="3"/>
    <path d="M52 16 Q78 36 54 58Z" fill="#fff"/><path d="M48 22 Q28 40 46 58Z" fill="#ffd1e6"/>
    <path d="M50 14 L64 18 L50 22Z" fill="#f0699f"/>
    <path d="M14 62 L86 62 L76 80 L24 80Z" fill="#c98f5a"/><circle cx="36" cy="70" r="3" fill="#fff4b8"/><circle cx="50" cy="70" r="3" fill="#fff4b8"/><circle cx="64" cy="70" r="3" fill="#fff4b8"/>
    <path d="M4 84 Q14 78 24 84 T44 84 T64 84 T84 84 T100 84" fill="none" stroke="#4f9fe0" stroke-width="4"/>`,

  fish: `<path d="M68 50 L90 32 Q86 50 90 68Z" fill="#ff9f6b"/>
    <ellipse cx="46" cy="50" rx="30" ry="22" fill="#ffb36b"/>
    <path d="M40 30 Q50 16 60 30" fill="#ff9f6b"/>
    <path d="M44 30 Q38 50 44 70 M56 32 Q50 50 56 68" fill="none" stroke="#fff" stroke-width="5"/>
    ${eye(28, 46, 3.4)}${smile(24, 58, 4)}
    <circle cx="10" cy="36" r="3" fill="#fff" stroke-width="1.4"/><circle cx="14" cy="26" r="2" fill="#fff" stroke-width="1.2"/>`,

  chick: `<path d="M40 82 L36 92 M58 82 L62 92" stroke="#f5a623" stroke-width="3"/>
    <circle cx="50" cy="56" r="28" fill="#ffe066"/>
    <path d="M64 56 Q78 52 76 64 Q70 70 62 64Z" fill="#ffd23a"/>
    <path d="M44 28 Q46 18 50 26 Q54 18 54 30" fill="#ffd23a"/>
    ${eye(42, 50)}${eye(58, 50)}<path d="M46 58 L54 58 L50 64Z" fill="#f5a623"/>${blush(36, 60)}${blush(64, 60)}`,



  moth: `<path d="M50 30 Q42 18 38 16 M50 30 Q58 18 62 16" fill="none"/>
    <path d="M48 40 Q22 14 12 34 Q12 52 46 50Z" fill="#e7d6b8"/><path d="M52 40 Q78 14 88 34 Q88 52 54 50Z" fill="#e7d6b8"/>
    <path d="M46 54 Q20 60 26 78 Q40 82 48 60Z" fill="#d8c19a"/><path d="M54 54 Q80 60 74 78 Q60 82 52 60Z" fill="#d8c19a"/>
    <circle cx="28" cy="36" r="5" fill="#b48ef0" stroke="none"/><circle cx="72" cy="36" r="5" fill="#b48ef0" stroke="none"/>
    <ellipse cx="50" cy="52" rx="5" ry="20" fill="#8a6a4a"/>`,

  duck: `<ellipse cx="50" cy="64" rx="34" ry="20" fill="#ffd23a"/>
    <path d="M78 54 Q90 44 88 58Z" fill="#ffd23a"/>
    <circle cx="36" cy="38" r="16" fill="#ffd23a"/>
    <path d="M20 40 Q10 40 10 46 Q16 50 24 46Z" fill="#ff9f43"/>${eye(34, 34)}
    <path d="M44 62 Q58 52 70 64 Q58 72 44 62Z" fill="#ffc21a"/>
    <path d="M4 84 Q20 78 36 84 T68 84 T96 84" fill="none" stroke="#7fc8f8" stroke-width="3"/>`,

  sock: `<path d="M34 12 L64 12 L64 58 Q66 68 78 70 Q92 74 88 86 Q84 94 66 90 L40 84 Q30 80 32 68Z" fill="#b48ef0"/>
    <rect x="32" y="12" width="34" height="12" rx="3" fill="#ffd1e6"/>
    <path d="M33 34 L64 34 M33 46 L64 46" stroke="#ffd1e6" stroke-width="5"/>
    <path d="M70 80 Q80 76 88 82" fill="none" stroke="#ffd1e6" stroke-width="5"/>`,

  rock: `<path d="M12 78 Q10 50 30 38 Q46 24 66 32 Q88 40 90 66 Q92 80 78 82 L22 84 Q12 84 12 78Z" fill="#a8a3bc"/>
    <path d="M30 48 Q38 42 46 46 M62 50 Q70 48 74 56" fill="none" stroke="#8b86a3" stroke-width="2"/>${shine(40, 42, 6)}
    <path d="M10 84 L92 84" stroke="#e8d5b0" stroke-width="5"/>`,

  lock: `<path d="M32 46 L32 32 Q32 14 50 14 Q68 14 68 32 L68 46" fill="none" stroke="#a8a3bc" stroke-width="8"/>
    <rect x="22" y="44" width="56" height="44" rx="10" fill="#ffd35c"/>
    <circle cx="50" cy="62" r="6" fill="#4b3b63"/><path d="M47 64 L45 76 L55 76 L53 64Z" fill="#4b3b63"/>${shine(32, 52, 4)}`,

  ring: `<ellipse cx="50" cy="62" rx="26" ry="24" fill="none" stroke="#f5b73b" stroke-width="9"/>
    <ellipse cx="50" cy="62" rx="26" ry="24" fill="none" stroke="#ffe58a" stroke-width="3"/>
    <path d="M36 30 L42 20 L58 20 L64 30 L50 46Z" fill="#9fe7ff"/><path d="M36 30 L64 30 M42 20 L46 30 L50 46 L54 30 L58 20" fill="none" stroke-width="1.5"/>
    <path d="M70 18 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2Z" fill="#fff" stroke="none"/>`,

  king: `<path d="M26 40 L30 18 L40 30 L50 14 L60 30 L70 18 L74 40Z" fill="#ffd35c"/><circle cx="50" cy="26" r="3" fill="#f0606f" stroke="none"/>
    <circle cx="50" cy="56" r="20" fill="#f6c9a8"/>
    <path d="M30 60 Q32 88 50 90 Q68 88 70 60 Q62 70 50 70 Q38 70 30 60Z" fill="#c98f5a"/>
    ${eye(43, 52)}${eye(57, 52)}<path d="M44 66 Q50 63 56 66" fill="none"/>
    <rect x="25" y="38" width="50" height="7" rx="3" fill="#f5b73b"/>`,

  wing: `<path d="M14 70 Q20 30 60 18 Q90 12 88 30 Q76 36 82 46 Q66 50 72 60 Q56 62 60 72 Q38 76 14 70Z" fill="#9fd8f5"/>
    <path d="M20 66 Q44 48 80 30 M24 68 Q48 56 76 46 M28 70 Q48 64 66 60" fill="none" stroke="#5aa8e0" stroke-width="2"/>`,

  song: `<path d="M34 72 L34 26 L76 18 L76 62" fill="none" stroke-width="5"/>
    <path d="M34 26 L76 18 L76 28 L34 36Z" fill="#4b3b63"/>
    <ellipse cx="26" cy="74" rx="10" ry="8" fill="#b48ef0" transform="rotate(-20 26 74)"/>
    <ellipse cx="68" cy="64" rx="10" ry="8" fill="#f0699f" transform="rotate(-20 68 64)"/>
    <path d="M14 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2Z" fill="#ffd35c" stroke="none"/>`,

  frog: `<ellipse cx="50" cy="64" rx="34" ry="22" fill="#7fd48a"/>
    <circle cx="34" cy="38" r="12" fill="#7fd48a"/><circle cx="66" cy="38" r="12" fill="#7fd48a"/>
    <circle cx="34" cy="38" r="7" fill="#fff"/><circle cx="66" cy="38" r="7" fill="#fff"/>${eye(35, 39, 3.6)}${eye(67, 39, 3.6)}
    <path d="M32 64 Q50 78 68 64" fill="none" stroke-width="3"/>${blush(26, 62)}${blush(74, 62)}
    <path d="M18 80 Q28 76 34 84 M82 80 Q72 76 66 84" fill="#5cbf6a"/>`,

  star: `<path d="M50 10 L61 37 L90 39 L67 57 L75 86 L50 70 L25 86 L33 57 L10 39 L39 37Z" fill="#ffd35c"/>
    ${eye(42, 48, 2.6)}${eye(58, 48, 2.6)}${smile(50, 56, 5)}${blush(36, 56)}${blush(64, 56)}`,

  crab: `<path d="M24 66 L10 74 M26 72 L14 84 M76 66 L90 74 M74 72 L86 84" fill="none" stroke-width="3"/>
    <path d="M28 52 Q16 40 18 26 M72 52 Q84 40 82 26" fill="none" stroke="#f0606f" stroke-width="6"/>
    <path d="M10 26 Q14 10 26 18 L20 26 L28 28 Q22 36 10 26Z" fill="#f0606f"/>
    <path d="M90 26 Q86 10 74 18 L80 26 L72 28 Q78 36 90 26Z" fill="#f0606f"/>
    <ellipse cx="50" cy="62" rx="28" ry="20" fill="#f0606f"/>
    <path d="M42 44 L40 32 M58 44 L60 32" stroke-width="3"/><circle cx="40" cy="30" r="5" fill="#fff"/><circle cx="60" cy="30" r="5" fill="#fff"/>${eye(40, 30, 2.6)}${eye(60, 30, 2.6)}
    ${smile(50, 64, 6)}`,

  drum: `<path d="M18 36 L18 70 Q50 84 82 70 L82 36" fill="#f0699f"/>
    <ellipse cx="50" cy="36" rx="32" ry="11" fill="#fff4f7"/>
    <path d="M18 44 L34 74 L50 46 L66 76 L82 44" fill="none" stroke="#ffd35c" stroke-width="3"/>
    <path d="M30 6 L48 32 M72 8 L56 32" stroke="#c98f5a" stroke-width="4"/><circle cx="30" cy="6" r="4" fill="#fff"/><circle cx="72" cy="8" r="4" fill="#fff"/>`,

  flag: `<path d="M24 10 L24 92" stroke-width="5"/>
    <path d="M26 16 Q46 8 60 18 Q74 28 88 20 L88 54 Q74 62 60 52 Q46 42 26 50Z" fill="#b48ef0"/>
    <path d="M52 26 l3 6 6 1 -4 4 1 6 -6 -3 -6 3 1 -6 -4 -4 6 -1Z" fill="#ffd35c" stroke-width="1.4"/>
    <circle cx="24" cy="9" r="4" fill="#ffd35c"/>`,

  sled: `<path d="M10 72 L82 72 Q94 72 92 60" fill="none" stroke="#a8a3bc" stroke-width="5"/>
    <path d="M28 72 L28 58 M66 72 L66 58" stroke="#a8a3bc" stroke-width="4"/>
    <rect x="18" y="46" width="64" height="13" rx="4" fill="#f0606f"/>
    <path d="M30 46 L30 59 M42 46 L42 59 M54 46 L54 59 M66 46 L66 59" stroke="#d94a5a" stroke-width="2"/>
    <path d="M4 82 Q50 76 96 84" fill="none" stroke="#cfeaff" stroke-width="5"/>`,

  plum: `<path d="M50 30 Q50 18 56 12" fill="none" stroke="#8a5a35" stroke-width="4"/>
    <path d="M54 22 Q70 8 80 20 Q66 30 54 22Z" fill="#7fd48a"/>
    <circle cx="50" cy="58" r="30" fill="#8e5fd0"/><path d="M50 30 Q42 58 50 88" fill="none" stroke="#6b44ad" stroke-width="2"/>${shine(36, 46, 6)}`,

  nest: `<ellipse cx="38" cy="52" rx="10" ry="13" fill="#cfeaff"/><ellipse cx="54" cy="50" rx="10" ry="13" fill="#fff"/><ellipse cx="66" cy="54" rx="9" ry="12" fill="#cfeaff"/>
    <path d="M12 54 Q14 84 50 86 Q86 84 88 54 Q50 64 12 54Z" fill="#b07a48"/>
    <path d="M16 60 Q50 72 84 60 M20 70 Q50 80 80 70 M24 64 L34 76 M48 68 L56 82 M70 64 L64 78" fill="none" stroke="#8a5a35" stroke-width="2"/>`,

  tent: `<path d="M50 14 L90 82 L10 82Z" fill="#7fd48a"/>
    <path d="M50 14 L36 82 L64 82Z" fill="#5cbf6a"/><path d="M50 40 L42 82 L58 82Z" fill="#3b2d4f"/>
    <path d="M50 14 L50 6" stroke-width="3"/><path d="M50 6 L60 9 L50 12Z" fill="#f0699f"/>
    <path d="M4 84 L96 84" stroke="#c9a77a" stroke-width="4"/>`,

  hand: `<path d="M30 86 Q22 70 24 54 L22 36 Q22 30 27 30 Q32 30 32 36 L33 50 L33 22 Q33 16 38 16 Q43 16 43 22 L43 48 L44 16 Q44 10 50 10 Q56 10 56 16 L55 48 L57 22 Q57 16 62 16 Q67 16 67 22 L66 52 L72 42 Q76 36 81 39 Q85 42 82 48 L70 72 Q64 86 52 88Z" fill="#f6c9a8"/>
    <path d="M40 74 Q50 78 60 72" fill="none" stroke-width="1.6"/>`,

  lamp: `<path d="M30 46 L40 14 L60 14 L70 46Z" fill="#ffd1e6"/>
    <path d="M34 36 L66 36" stroke="#f0699f" stroke-width="2"/>
    <path d="M50 46 L50 76" stroke-width="5"/><ellipse cx="50" cy="80" rx="20" ry="6" fill="#b48ef0"/>
    <path d="M26 52 L18 58 M74 52 L82 58 M50 52 L50 58" stroke="#ffd35c" stroke-width="3"/>`,

  belt: `<path d="M6 42 L94 42 L94 58 L6 58Z" fill="#f0699f"/>
    <path d="M12 50 L28 50 M70 50 L88 50" stroke="#ffd1e6" stroke-width="2" stroke-dasharray="3 4"/>
    <rect x="36" y="34" width="28" height="32" rx="6" fill="none" stroke="#ffd35c" stroke-width="6"/>
    <path d="M50 38 L50 62" stroke="#ffd35c" stroke-width="4"/>`,

  milk: `<path d="M28 34 L50 20 L72 34 L72 88 L28 88Z" fill="#fff"/>
    <path d="M28 34 L50 20 L72 34Z" fill="#7fc8f8"/><path d="M44 14 L56 14 L56 22 L44 22Z" fill="#7fc8f8"/>
    <rect x="34" y="48" width="32" height="26" rx="4" fill="#cfeaff"/>
    <path d="M42 64 Q46 54 50 60 Q54 54 58 64" fill="none" stroke="#4f9fe0" stroke-width="2.5"/>`,

  gift: `<rect x="18" y="44" width="64" height="44" rx="4" fill="#b48ef0"/>
    <rect x="14" y="34" width="72" height="14" rx="4" fill="#cdb4ff"/>
    <rect x="44" y="34" width="12" height="54" fill="#ffd35c"/>
    <path d="M50 34 Q30 14 26 26 Q24 36 50 34 Q76 36 74 26 Q70 14 50 34Z" fill="#ffd35c"/>`,

  plant: `<path d="M50 62 L50 30" stroke="#3fae86" stroke-width="4"/>
    <path d="M50 48 Q30 46 26 28 Q44 26 50 48Z M50 40 Q70 38 74 20 Q56 18 50 40Z M50 32 Q42 20 50 8 Q58 20 50 32Z" fill="#7fd48a"/>
    <path d="M28 60 L72 60 L66 90 L34 90Z" fill="#f7953f"/><rect x="24" y="56" width="52" height="10" rx="3" fill="#ffa95c"/>`,

  clock: `<circle cx="50" cy="52" r="34" fill="#fff"/><circle cx="50" cy="52" r="34" fill="none" stroke="#f0699f" stroke-width="6"/>
    <g fill="#4b3b63" stroke="none"><circle cx="50" cy="25" r="2.4"/><circle cx="77" cy="52" r="2.4"/><circle cx="50" cy="79" r="2.4"/><circle cx="23" cy="52" r="2.4"/></g>
    <path d="M50 52 L50 30 M50 52 L36 44" stroke-width="4"/><circle cx="50" cy="52" r="3.5" fill="#f0699f"/>
    <path d="M26 20 L18 12 M74 20 L82 12" stroke-width="5"/>`,

  stop: `<path d="M50 50 L50 96" stroke="#a8a3bc" stroke-width="6"/>
    <path d="M36 12 L64 12 L84 32 L84 60 L64 80 L36 80 L16 60 L16 32Z" fill="#f0606f"/>
    <path d="M38 18 L62 18 L78 34 L78 58 L62 74 L38 74 L22 58 L22 34Z" fill="none" stroke="#fff" stroke-width="3"/>
    <path d="M32 46 L68 46" stroke="#fff" stroke-width="7"/>`,


  cake: `<rect x="18" y="56" width="64" height="28" rx="6" fill="#ffd1e6"/>
    <rect x="24" y="36" width="52" height="22" rx="6" fill="#fff4f7"/>
    <path d="M24 42 Q30 50 36 42 Q42 50 48 42 Q54 50 60 42 Q66 50 72 42 L76 42" fill="none" stroke="#f0699f" stroke-width="3"/>
    <path d="M18 64 Q26 72 34 64 Q42 72 50 64 Q58 72 66 64 Q74 72 82 64" fill="none" stroke="#b48ef0" stroke-width="3"/>
    <rect x="36" y="22" width="5" height="14" fill="#7fc8f8"/><rect x="48" y="20" width="5" height="16" fill="#7fd48a"/><rect x="60" y="22" width="5" height="14" fill="#ffd35c"/>
    <g fill="#ffb347" stroke="none"><ellipse cx="38.5" cy="17" rx="3" ry="4.5"/><ellipse cx="50.5" cy="15" rx="3" ry="4.5"/><ellipse cx="62.5" cy="17" rx="3" ry="4.5"/></g>`,

  bike: `<circle cx="24" cy="64" r="17" fill="none" stroke-width="5"/><circle cx="76" cy="64" r="17" fill="none" stroke-width="5"/>
    <path d="M24 64 L42 40 L66 40 L76 64 M42 40 L52 64 L66 40 M52 64 L24 64" fill="none" stroke="#f0699f" stroke-width="4"/>
    <path d="M38 34 L48 34" stroke-width="5"/><path d="M66 40 L62 26 L72 24" fill="none" stroke-width="4"/>`,

  kite: `<path d="M50 6 L78 36 L50 72 L22 36Z" fill="#7fc8f8"/>
    <path d="M50 6 L50 72 M22 36 L78 36" stroke="#fff" stroke-width="2.5"/>
    <path d="M50 6 L78 36 L50 36Z" fill="#f0699f"/><path d="M22 36 L50 72 L50 36Z" fill="#ffd35c"/>
    <path d="M50 72 Q40 80 50 86 Q60 92 52 98" fill="none" stroke-width="2"/>
    <path d="M44 80 L50 84 L44 88Z M56 88 L50 92 L56 96Z" fill="#b48ef0" stroke-width="1.4"/>`,

  bone: `<path d="M28 40 L72 40 Q74 26 84 28 Q94 30 90 42 Q98 50 90 58 Q94 70 84 72 Q74 74 72 60 L28 60 Q26 74 16 72 Q6 70 10 58 Q2 50 10 42 Q6 30 16 28 Q26 26 28 40Z" fill="#fffaf0"/>`,

  rose: `<path d="M50 52 L50 94" stroke="#3fae86" stroke-width="4"/>
    <path d="M50 72 Q32 62 26 74 Q38 82 50 72Z M50 80 Q66 70 74 80 Q62 88 50 80Z" fill="#7fd48a"/>
    <path d="M26 30 Q26 56 50 58 Q74 56 74 30 Q62 38 50 30 Q38 38 26 30Z" fill="#e8455f"/>
    <path d="M34 24 Q50 8 66 24 Q66 40 50 42 Q34 40 34 24Z" fill="#f0606f"/>
    <path d="M44 28 Q50 20 56 28 Q54 34 48 32" fill="none" stroke="#c8344b" stroke-width="2"/>`,

  cube: `<path d="M50 14 L84 30 L84 70 L50 88 L16 70 L16 30Z" fill="#cfeaff"/>
    <path d="M16 30 L50 46 L84 30 M50 46 L50 88" fill="none"/><path d="M50 14 L84 30 L50 46 L16 30Z" fill="#eef8ff"/>
    ${shine(32, 52, 5)}${eye(60, 60, 2.2)}${eye(72, 54, 2.2)}<path d="M62 68 Q68 68 72 62" fill="none"/>`,

  rope: `<path d="M20 30 Q50 96 80 30" fill="none" stroke="#f7953f" stroke-width="5"/>
    <path d="M20 30 Q50 96 80 30" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="3 5"/>
    <rect x="12" y="10" width="14" height="24" rx="6" fill="#f0699f"/><rect x="74" y="10" width="14" height="24" rx="6" fill="#f0699f"/>`,

  cone: `<path d="M30 48 L50 94 L70 48Z" fill="#e3b07a"/>
    <path d="M34 56 L60 80 M40 50 L66 66 M66 56 L42 80 M58 50 L36 64" fill="none" stroke="#c98f5a" stroke-width="1.8"/>
    <circle cx="50" cy="36" r="17" fill="#ffd1e6"/><circle cx="40" cy="44" r="10" fill="#ffd1e6"/><circle cx="60" cy="44" r="10" fill="#ffd1e6"/>
    <circle cx="50" cy="18" r="5" fill="#f0606f"/>
    <g stroke="none"><rect x="40" y="30" width="5" height="2" rx="1" fill="#7fc8f8" transform="rotate(30 42 31)"/><rect x="56" y="36" width="5" height="2" rx="1" fill="#ffd35c" transform="rotate(-20 58 37)"/><rect x="48" y="42" width="5" height="2" rx="1" fill="#b48ef0"/></g>`,

  whale: `<path d="M14 58 Q12 34 46 34 Q76 34 82 52 Q90 46 96 36 Q98 50 90 58 Q96 64 98 74 Q86 70 80 64 Q72 78 46 78 Q16 78 14 58Z" fill="#5aa8e0"/>
    <path d="M18 64 Q44 76 76 66 Q70 78 46 78 Q22 78 18 64Z" fill="#cfeaff"/>
    ${eye(30, 52, 3)}${smile(28, 62, 5)}${blush(36, 60)}
    <path d="M40 30 Q38 18 30 14 M40 30 Q42 18 50 14 M40 30 L40 16" fill="none" stroke="#7fc8f8" stroke-width="3"/>`,

  grape: `<path d="M50 22 L50 10" stroke="#8a5a35" stroke-width="4"/><path d="M52 16 Q68 4 78 14 Q64 24 52 16Z" fill="#7fd48a"/>
    <g fill="#9be37a"><circle cx="38" cy="32" r="10"/><circle cx="58" cy="32" r="10"/><circle cx="28" cy="48" r="10"/><circle cx="48" cy="48" r="10"/><circle cx="68" cy="48" r="10"/><circle cx="38" cy="64" r="10"/><circle cx="58" cy="64" r="10"/><circle cx="48" cy="80" r="10"/></g>
    ${shine(44, 44, 3)}${shine(34, 60, 3)}`,

  slide: `<path d="M20 90 L20 22 M36 90 L36 22" stroke="#a8a3bc" stroke-width="4"/>
    <path d="M20 34 L36 34 M20 50 L36 50 M20 66 L36 66" stroke="#a8a3bc" stroke-width="3"/>
    <rect x="16" y="16" width="26" height="8" rx="3" fill="#7fc8f8"/>
    <path d="M38 18 Q60 30 70 66 Q74 82 94 86 L94 92 Q66 90 62 70 Q54 36 38 28Z" fill="#ffd35c"/>`,

  flute: `<g transform="rotate(-18 50 50)"><rect x="6" y="44" width="88" height="12" rx="6" fill="#d8d6e6"/>
    <g fill="#4b3b63" stroke="none"><circle cx="30" cy="50" r="2.4"/><circle cx="42" cy="50" r="2.4"/><circle cx="54" cy="50" r="2.4"/><circle cx="66" cy="50" r="2.4"/><circle cx="78" cy="50" r="2.4"/></g>
    <rect x="12" y="44" width="6" height="12" fill="#b48ef0"/></g>
    <path d="M70 18 L70 6 L80 4 L80 16" fill="none" stroke-width="2.5"/><ellipse cx="67" cy="18" rx="4" ry="3" fill="#4b3b63"/><ellipse cx="77" cy="16" rx="4" ry="3" fill="#4b3b63"/>`,

  plate: `<ellipse cx="50" cy="56" rx="42" ry="28" fill="#fff"/>
    <ellipse cx="50" cy="54" rx="28" ry="17" fill="#f6f2fb"/>
    <ellipse cx="50" cy="56" rx="42" ry="28" fill="none" stroke="#7fc8f8" stroke-width="3"/>
    <circle cx="42" cy="52" r="7" fill="#7fd48a"/><circle cx="56" cy="50" r="6" fill="#f0606f"/><path d="M50 60 Q58 64 64 58" fill="none" stroke="#ffd35c" stroke-width="5"/>`,

  smile: `<circle cx="50" cy="50" r="38" fill="#ffd35c"/>${eye(37, 42, 4)}${eye(63, 42, 4)}
    <path d="M28 56 Q50 82 72 56 Q50 66 28 56Z" fill="#fff"/>${blush(26, 58)}${blush(74, 58)}`,

  home: `<path d="M50 14 L88 48 L80 48 L80 86 L20 86 L20 48 L12 48Z" fill="#ffd1e6"/>
    <path d="M50 14 L90 50 L84 54 L50 24 L16 54 L10 50Z" fill="#f0699f"/>
    <rect x="42" y="60" width="16" height="26" rx="3" fill="#b48ef0"/>
    <rect x="26" y="56" width="12" height="12" rx="2" fill="#cfeaff"/><rect x="62" y="56" width="12" height="12" rx="2" fill="#cfeaff"/>
    <rect x="66" y="22" width="8" height="16" fill="#f0699f"/>`,


  shell: `<path d="M50 84 L18 42 Q22 18 50 14 Q78 18 82 42Z" fill="#ffc7b8"/>
    <path d="M50 84 L30 22 M50 84 L42 15 M50 84 L58 15 M50 84 L70 22 M50 84 L20 38 M50 84 L80 38" fill="none" stroke="#e8907c" stroke-width="2"/>
    <path d="M38 80 L50 92 L62 80Z" fill="#ffb3a0"/>${shine(36, 30, 4)}`,

  wave: `<path d="M6 88 L6 62 Q10 26 48 22 Q78 22 84 44 Q70 34 58 40 Q48 46 56 58 Q64 66 74 60 Q76 76 60 84 L94 84 L94 88Z" fill="#5aa8e0"/>
    <path d="M58 40 Q48 46 56 58 Q64 66 74 60" fill="none" stroke="#fff" stroke-width="3"/>
    <path d="M12 74 Q30 70 46 76 M20 60 Q34 52 42 60" fill="none" stroke="#cfeaff" stroke-width="3"/>
    <circle cx="84" cy="34" r="3" fill="#fff" stroke-width="1.2"/><circle cx="90" cy="46" r="2" fill="#fff" stroke-width="1"/>`,

  glue: `<path d="M44 12 L56 12 L58 30 L42 30Z" fill="#f0699f"/>
    <path d="M32 30 L68 30 L72 88 Q50 94 28 88Z" fill="#fff"/>
    <rect x="34" y="46" width="32" height="24" rx="5" fill="#ffd1e6"/>
    <path d="M42 62 Q46 52 50 58 Q54 52 58 62" fill="none" stroke="#f0699f" stroke-width="2.5"/>
    <path d="M50 12 Q50 4 54 4" fill="none" stroke-width="2"/>`,

  pearl: `<path d="M10 56 Q14 82 50 86 Q86 82 90 56Z" fill="#c9b6e3"/>
    <path d="M10 56 Q14 20 50 18 Q86 20 90 56 Q70 50 50 52 Q30 50 10 56Z" fill="#e3d6f3" transform="rotate(-10 50 56)"/>
    <path d="M18 60 Q50 72 82 60" fill="#ffd1e6" stroke-width="1.6"/>
    <circle cx="50" cy="60" r="13" fill="#fff"/>${shine(46, 56, 4)}`,

  crown: `<path d="M16 76 L12 30 L32 50 L50 20 L68 50 L88 30 L84 76Z" fill="#ffd35c"/>
    <rect x="14" y="70" width="72" height="12" rx="4" fill="#f5b73b"/>
    <circle cx="12" cy="28" r="5" fill="#fff"/><circle cx="50" cy="18" r="5" fill="#fff"/><circle cx="88" cy="28" r="5" fill="#fff"/>
    <circle cx="50" cy="56" r="6" fill="#f0699f"/><circle cx="30" cy="62" r="4" fill="#7fc8f8"/><circle cx="70" cy="62" r="4" fill="#7fd48a"/>`,

  paint: `<path d="M50 14 Q88 14 92 46 Q94 66 74 66 Q62 66 64 76 Q66 88 50 88 Q12 86 10 52 Q10 14 50 14Z" fill="#f3d6a0"/>
    <circle cx="30" cy="40" r="7" fill="#f0606f"/><circle cx="48" cy="28" r="7" fill="#ffd35c"/><circle cx="68" cy="32" r="7" fill="#7fd48a"/><circle cx="76" cy="50" r="6" fill="#7fc8f8"/><circle cx="28" cy="62" r="7" fill="#b48ef0"/>
    <circle cx="46" cy="70" r="6" fill="#fffdf6"/>`,

  tail: `<path d="M38 8 Q30 40 44 62 Q52 74 46 84 L60 82 Q54 70 58 60 Q72 36 62 8Z" fill="#7f9cf0"/>
    <path d="M38 8 Q30 40 44 62 L58 60 Q72 36 62 8Z" fill="#5fd3b8" opacity=".55" stroke="none"/>
    <path d="M48 82 Q24 92 14 78 Q30 74 50 78Z M56 82 Q80 94 90 78 Q72 72 54 78Z" fill="#c57ce0"/>
    <path d="M42 20 Q50 16 58 20 M41 32 Q50 28 60 32 M43 44 Q51 40 60 44" fill="none" stroke="#fff" stroke-width="1.8" opacity=".8"/>`,

  boat: `<path d="M50 16 L50 64" stroke-width="3"/><path d="M52 18 L80 60 L52 60Z" fill="#fff"/><path d="M48 26 L26 60 L48 60Z" fill="#ffd1e6"/>
    <path d="M12 64 L88 64 Q82 82 66 82 L34 82 Q18 82 12 64Z" fill="#f7953f"/>
    <path d="M4 88 Q16 82 28 88 T52 88 T76 88 T100 88" fill="none" stroke="#4f9fe0" stroke-width="4"/>`,

  moon: `<path d="M62 12 Q30 16 28 50 Q30 84 64 88 Q40 76 40 50 Q40 24 62 12Z" fill="#ffe58a"/>
    ${eye(40, 46, 2.4)}<path d="M36 56 Q40 60 44 58" fill="none"/>
    <path d="M78 26 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2Z M84 64 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6Z" fill="#ffd35c"/>`,

  bow: `<path d="M50 50 Q22 20 12 36 Q6 52 50 50Z" fill="#f0699f"/><path d="M50 50 Q78 20 88 36 Q94 52 50 50Z" fill="#f0699f"/>
    <path d="M46 52 L30 88 L38 84 L42 92 L50 56 L58 92 L62 84 L70 88 L54 52Z" fill="#f590b8"/>
    <ellipse cx="50" cy="50" rx="8" ry="9" fill="#d9548d"/>`,

  bead: `<path d="M8 40 Q50 80 92 40" fill="none" stroke="#c9b6e3" stroke-width="2"/>
    <circle cx="22" cy="54" r="9" fill="#f0699f"/><circle cx="38" cy="62" r="9" fill="#ffd35c"/><circle cx="54" cy="64" r="9" fill="#7fd48a"/><circle cx="70" cy="60" r="9" fill="#7fc8f8"/><circle cx="84" cy="50" r="8" fill="#b48ef0"/>
    ${shine(52, 61, 3)}`,

  rainbow: `<g fill="none" stroke-width="8" stroke="none"><path d="M10 80 A40 40 0 0 1 90 80" stroke="#f47c8a"/><path d="M18 80 A32 32 0 0 1 82 80" stroke="#ffb35c"/>
    <path d="M26 80 A24 24 0 0 1 74 80" stroke="#ffe066"/><path d="M34 80 A16 16 0 0 1 66 80" stroke="#7fd48a"/></g>
    <ellipse cx="16" cy="82" rx="14" ry="8" fill="#fff"/><ellipse cx="84" cy="82" rx="14" ry="8" fill="#fff"/>`,

  tutu: `<rect x="34" y="14" width="32" height="24" rx="8" fill="#ffd1e6"/>
    <path d="M10 56 Q20 34 34 36 L66 36 Q80 34 90 56 Q80 66 70 58 Q60 68 50 60 Q40 68 30 58 Q20 66 10 56Z" fill="#ffc2dc"/>
    <path d="M18 54 Q26 40 36 42 L64 42 Q74 40 82 54" fill="none" stroke="#f59ac0" stroke-width="2"/>
    <rect x="32" y="34" width="36" height="6" rx="3" fill="#f0699f"/>
    <circle cx="30" cy="50" r="1.6" fill="#fff" stroke="none"/><circle cx="50" cy="52" r="1.6" fill="#fff" stroke="none"/><circle cx="70" cy="50" r="1.6" fill="#fff" stroke="none"/>`,

  sand: `<path d="M30 40 L70 40 L64 82 L36 82Z" fill="#7fc8f8"/><path d="M36 40 Q36 22 50 22 Q64 22 64 40" fill="none" stroke-width="3"/>
    <path d="M30 40 Q50 30 70 40Z" fill="#f3d6a0"/>
    <path d="M4 88 Q26 76 50 86 Q74 76 96 88 L96 96 L4 96Z" fill="#f3d6a0"/>`,

  coral: `<g fill="none" stroke-linecap="round"><path d="M50 92 L50 50 Q48 34 36 24 M50 66 Q66 56 68 38 Q70 30 78 24 M50 56 Q34 54 24 40 M68 46 Q76 48 84 42 M36 30 Q30 22 32 14" stroke="#4b3b63" stroke-width="13"/>
    <path d="M50 92 L50 50 Q48 34 36 24 M50 66 Q66 56 68 38 Q70 30 78 24 M50 56 Q34 54 24 40 M68 46 Q76 48 84 42 M36 30 Q30 22 32 14" stroke="#f48aa6" stroke-width="8"/></g>`,

  ribbon: `<path d="M10 70 Q20 30 40 50 Q60 70 64 40 Q68 14 90 26" fill="none" stroke="#4b3b63" stroke-width="13"/>
    <path d="M10 70 Q20 30 40 50 Q60 70 64 40 Q68 14 90 26" fill="none" stroke="#b48ef0" stroke-width="8"/>
    <path d="M14 66 Q22 40 38 54" fill="none" stroke="#e3d0ff" stroke-width="2"/>`,

  glitter: `<g fill="#ffd35c"><path d="M40 14 l5 15 15 5 -15 5 -5 15 -5 -15 -15 -5 15 -5Z"/><path d="M72 46 l3.5 10 10 3.5 -10 3.5 -3.5 10 -3.5 -10 -10 -3.5 10 -3.5Z" fill="#f0699f"/>
    <path d="M30 64 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3Z" fill="#7fc8f8"/></g>
    <g fill="#b48ef0" stroke="none"><circle cx="66" cy="22" r="3"/><circle cx="16" cy="44" r="2.5"/><circle cx="56" cy="84" r="2.5"/><circle cx="86" cy="80" r="2"/></g>`,

  splash: `<path d="M20 78 Q30 52 40 70 Q46 40 50 30 Q54 40 60 70 Q70 52 80 78Z" fill="#7fc8f8"/>
    <path d="M28 40 Q32 30 36 40 Q32 46 28 40Z M64 36 Q68 24 72 36 Q68 42 64 36Z M14 58 Q17 50 20 58 Q17 62 14 58Z M80 56 Q83 48 86 56 Q83 60 80 56Z" fill="#5aa8e0"/>
    <path d="M4 82 Q50 72 96 82 L96 90 L4 90Z" fill="#5aa8e0"/>`,

  slippers: `<path d="M18 70 Q12 56 26 50 L44 44 Q54 42 56 52 Q56 64 44 70 Q30 76 18 70Z" fill="#ffc2dc"/>
    <path d="M46 62 Q42 48 56 42 L72 36 Q84 34 86 44 Q86 56 74 62 Q60 68 46 62Z" fill="#ffc2dc"/>
    <path d="M28 52 Q40 52 46 46 M58 42 Q70 44 76 38" fill="none" stroke="#f59ac0" stroke-width="2"/>
    <path d="M40 46 Q30 24 20 12 M72 38 Q76 20 88 10 M46 46 Q48 26 40 14" fill="none" stroke="#f0699f" stroke-width="2.5"/>
    <path d="M40 46 Q44 40 50 44 Q46 50 40 46Z" fill="#f0699f"/>`,
};

/* Only aliases that can't be mistaken for another word in the list. */
const PIC_ALIASES = { dance: 'slippers' };

function picFor(word) {
  const key = PICS[word] ? word : PIC_ALIASES[word];
  return key ? PICS[key] : null;
}

function picSVG(word) {
  const inner = picFor(word);
  if (!inner) return '';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#4b3b63" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${inner}</g></svg>`;
}
