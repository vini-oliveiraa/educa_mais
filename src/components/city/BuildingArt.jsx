/**
 * Sprites isométricos das edificações — SVG gerado por código.
 *
 * Por que não usar banco de imagens: um pack isométrico decente ou pesa vários
 * MB em PNG, ou vem com licença que exige atribuição em cada tela. Compondo as
 * peças a partir de três primitivas (diamante, caixa e telhado) o resultado
 * pesa poucos kB, fica nítido em qualquer densidade de tela, é 100% nosso e
 * pode ser recolorido por token de CSS.
 *
 * Sistema de coordenadas: a origem (0,0) é o CENTRO do losango do terreno.
 * Tudo cresce para cima (y negativo).
 */

const HW = 32 // meia largura do tile
const HH = 16 // meia altura do tile

/** Losango (face superior de um tile), com `f` = fração do tile ocupada. */
function diamond(f, y = 0) {
  const w = HW * f
  const h = HH * f
  return `0,${y - h} ${w},${y} 0,${y + h} ${-w},${y}`
}

/** As três faces visíveis de uma caixa isométrica. */
function boxFaces(f, height, y0 = 0) {
  const w = HW * f
  const h = HH * f
  const top = y0 - height
  return {
    top: `0,${top - h} ${w},${top} 0,${top + h} ${-w},${top}`,
    left: `${-w},${y0} 0,${y0 + h} 0,${top + h} ${-w},${top}`,
    right: `0,${y0 + h} ${w},${y0} ${w},${top} 0,${top + h}`,
  }
}

/** Caixa pronta, com as faces já sombreadas. */
function Box({ f, height, y = 0, color, dark, light }) {
  const faces = boxFaces(f, height, y)
  return (
    <>
      <polygon points={faces.left} fill={dark} />
      <polygon points={faces.right} fill={color} />
      <polygon points={faces.top} fill={light} />
    </>
  )
}

/** Telhado piramidal sobre uma caixa de fração `f` e topo em `y`. */
function Roof({ f, y, height, color, dark }) {
  const w = HW * f
  const h = HH * f
  const apex = y - height
  return (
    <>
      <polygon points={`${-w},${y} 0,${y + h} 0,${apex}`} fill={dark} />
      <polygon points={`0,${y + h} ${w},${y} 0,${apex}`} fill={color} />
      <polygon points={`${-w},${y} 0,${y - h} 0,${apex}`} fill={color} opacity="0.75" />
      <polygon points={`${w},${y} 0,${y - h} 0,${apex}`} fill={dark} opacity="0.7" />
    </>
  )
}

/** Sombra elíptica, para a construção não parecer flutuando. */
function Shadow({ f = 0.9 }) {
  return <ellipse cx="0" cy="2" rx={HW * f} ry={HH * f} fill="rgba(0,0,0,.22)" />
}

function Tree({ x = 0, y = 0, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-2.5" y="-14" width="5" height="15" rx="2" fill="#7b5230" />
      <ellipse cx="0" cy="-20" rx="11" ry="9" fill="#2f9e52" />
      <ellipse cx="-5" cy="-24" rx="7.5" ry="6.5" fill="#3cb963" />
      <ellipse cx="5" cy="-25" rx="6.5" ry="6" fill="#49cf71" />
    </g>
  )
}

function Windows({ cols = 3, rows = 3, top, f, color = '#9fd8ff' }) {
  const items = []
  const w = HW * f
  for (let c = 0; c < cols; c++) {
    for (let rw = 0; rw < rows; rw++) {
      const px = -w * 0.55 + (c * w) / 2.6
      const py = top + 10 + rw * 11
      items.push(
        <rect key={`l${c}-${rw}`} x={px} y={py} width="7" height="7" rx="1.5" fill={color} opacity="0.85" />,
      )
    }
  }
  return <g>{items}</g>
}

/* ------------------------------------------------------------------------ */
/* Catálogo de sprites                                                      */
/* ------------------------------------------------------------------------ */

const ART = {
  arvore: () => (
    <>
      <Shadow f={0.5} />
      <ellipse cx="0" cy="0" rx={HW * 0.55} ry={HH * 0.55} fill="#3f8a46" />
      <Tree s={1.15} />
    </>
  ),

  canteiro: () => (
    <>
      <Shadow f={0.6} />
      <Box f={0.72} height={5} color="#8a6240" dark="#6b4a30" light="#5d8a3c" />
      {[[-10, -7], [0, -3], [10, -7], [-5, -10], [6, -11]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y - 3} r="3" fill={['#ff6b9d', '#ffd93d', '#ff8c42', '#c77dff', '#ff6b9d'][i]} />
      ))}
    </>
  ),

  lago: () => (
    <>
      <polygon points={diamond(0.95)} fill="#1a5c8a" />
      <polygon points={diamond(0.82, -1)} fill="#2e8fc4" />
      <polygon points={diamond(0.5, -2)} fill="#5bc0e8" opacity="0.7" />
      <ellipse cx="-8" cy="-2" rx="5" ry="2" fill="#bfe9ff" opacity="0.6" />
    </>
  ),

  parque: () => (
    <>
      <Shadow />
      <polygon points={diamond(0.95)} fill="#3fa155" />
      <polygon points={diamond(0.45, -1)} fill="#c9a06a" />
      <Tree x={-14} y={-2} s={0.8} />
      <Tree x={13} y={-5} s={0.7} />
      <g transform="translate(0 -4)">
        <rect x="-9" y="-16" width="2.5" height="16" fill="#d94f4f" />
        <rect x="6.5" y="-16" width="2.5" height="16" fill="#d94f4f" />
        <rect x="-10" y="-18" width="20" height="3" rx="1.5" fill="#f2b705" />
        <rect x="-3" y="-13" width="6" height="2" rx="1" fill="#4a90d9" />
      </g>
    </>
  ),

  casa: () => (
    <>
      <Shadow />
      <Box f={0.78} height={22} color="#f0dcae" dark="#cdb183" light="#fff2cf" />
      <Roof f={0.88} y={-22} height={18} color="#e2574c" dark="#b63c33" />
      <rect x="-5" y="-16" width="10" height="14" rx="1.5" fill="#8a5a3b" />
      <rect x="-14" y="-18" width="7" height="7" rx="1.5" fill="#9fd8ff" />
      <rect x="7.5" y="-18" width="7" height="7" rx="1.5" fill="#9fd8ff" />
    </>
  ),

  sobrado: () => (
    <>
      <Shadow />
      <Box f={0.8} height={38} color="#e8e2f0" dark="#c4bed4" light="#f8f5ff" />
      <Roof f={0.9} y={-38} height={16} color="#4a7fd4" dark="#35609f" />
      <rect x="-5" y="-15" width="10" height="13" rx="1.5" fill="#6b4a30" />
      <Windows cols={3} rows={2} top={-36} f={0.8} />
      <rect x={-HW * 0.8} y="-24" width={HW * 1.6} height="2.5" fill="#b9b2c9" />
    </>
  ),

  predio: () => (
    <>
      <Shadow />
      <Box f={0.78} height={72} color="#8fa6c4" dark="#6d8099" light="#b7cbe4" />
      <Windows cols={3} rows={6} top={-70} f={0.78} color="#ffe9a8" />
      <Box f={0.42} height={8} y={-72} color="#6d8099" dark="#55657a" light="#92a8c2" />
    </>
  ),

  poste: () => (
    <>
      <Shadow f={0.35} />
      <rect x="-1.8" y="-40" width="3.6" height="40" rx="1.8" fill="#52607a" />
      <path d="M0 -40 q0 -8 9 -8" stroke="#52607a" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <circle cx="10" cy="-47" r="5" fill="#ffe9a8" />
      <circle cx="10" cy="-47" r="10" fill="#ffe9a8" opacity="0.2" />
    </>
  ),

  fonte: () => (
    <>
      <Shadow />
      <polygon points={diamond(0.9)} fill="#c9c4bb" />
      <Box f={0.62} height={7} color="#ddd8cf" dark="#b5b0a7" light="#efeae1" />
      <ellipse cx="0" cy="-7" rx={HW * 0.48} ry={HH * 0.48} fill="#3aa0d8" />
      <rect x="-2" y="-24" width="4" height="18" rx="2" fill="#ddd8cf" />
      <circle cx="0" cy="-26" r="4.5" fill="#79d3f5" opacity="0.9" />
      <circle cx="-7" cy="-16" r="2.4" fill="#9fe2ff" opacity="0.8" />
      <circle cx="7" cy="-16" r="2.4" fill="#9fe2ff" opacity="0.8" />
    </>
  ),

  loja: () => (
    <>
      <Shadow />
      <Box f={0.82} height={26} color="#f2c14e" dark="#cb9a2c" light="#ffd978" />
      <polygon points={`${-HW * 0.84},-26 0,${-26 + HH * 0.84} ${HW * 0.84},-26 0,${-26 - HH * 0.84}`} fill="#2f6f9e" />
      <g>
        {[-18, -9, 0, 9].map((x, i) => (
          <rect key={i} x={x} y="-24" width="7" height="6" fill={i % 2 ? '#ffffff' : '#e2574c'} opacity="0.95" />
        ))}
      </g>
      <rect x="-9" y="-16" width="18" height="13" rx="1.5" fill="#6fc1e8" />
      <rect x="-12" y="-33" width="24" height="7" rx="2" fill="#2f6f9e" />
    </>
  ),

  padaria: () => (
    <>
      <Shadow />
      <Box f={0.82} height={26} color="#f5d7a1" dark="#cfae78" light="#ffeccb" />
      <Roof f={0.9} y={-26} height={12} color="#a9663d" dark="#854e2c" />
      <rect x="-11" y="-18" width="22" height="13" rx="2" fill="#8c5a33" />
      <circle cx="0" cy="-12" r="4.5" fill="#f2c14e" />
      <rect x="-14" y="-24" width="28" height="4" rx="2" fill="#e2574c" />
    </>
  ),

  hospital: () => (
    <>
      <Shadow />
      <Box f={0.84} height={42} color="#e9eef5" dark="#c4ccd8" light="#ffffff" />
      <Windows cols={3} rows={3} top={-40} f={0.84} color="#9fd8ff" />
      <rect x="-3.5" y="-56" width="7" height="16" rx="2" fill="#e2574c" />
      <rect x="-9" y="-50" width="18" height="6.5" rx="2" fill="#e2574c" />
      <rect x="-7" y="-13" width="14" height="11" rx="1.5" fill="#6fc1e8" />
    </>
  ),

  estadio: () => (
    <>
      <Shadow />
      <polygon points={diamond(0.98)} fill="#c7cdd6" />
      <ellipse cx="0" cy="-6" rx={HW * 0.82} ry={HH * 0.82} fill="#8e97a6" />
      <ellipse cx="0" cy="-9" rx={HW * 0.6} ry={HH * 0.6} fill="#3fa155" />
      <ellipse cx="0" cy="-9" rx={HW * 0.28} ry={HH * 0.28} fill="none" stroke="#eef5ff" strokeWidth="1.2" />
      {[-26, -13, 13, 26].map((x, i) => (
        <g key={i}>
          <rect x={x - 1} y="-30" width="2" height="24" fill="#6b7384" />
          <rect x={x - 4} y="-34" width="8" height="5" rx="1.5" fill="#ffe9a8" />
        </g>
      ))}
    </>
  ),

  biblioteca: () => (
    <>
      <Shadow />
      <Box f={0.86} height={30} color="#d8c8a8" dark="#b3a184" light="#efe3c9" />
      {[-18, -9, 0, 9, 17].map((x, i) => (
        <rect key={i} x={x} y="-28" width="4.5" height="26" rx="1" fill="#f3ead4" />
      ))}
      <polygon
        points={`${-HW * 0.95},-30 0,${-30 + HH * 0.95} ${HW * 0.95},-30 0,${-30 - HH * 0.95}`}
        fill="#b6a68a"
      />
      <Roof f={0.95} y={-30} height={13} color="#8c7a5c" dark="#6e5f47" />
    </>
  ),

  escola: () => (
    <>
      <Shadow />
      <Box f={0.86} height={34} color="#f0b24b" dark="#c88d2d" light="#ffd27a" />
      <Roof f={0.94} y={-34} height={14} color="#3f6fb5" dark="#2d528c" />
      <Windows cols={3} rows={2} top={-32} f={0.86} color="#bfe9ff" />
      <rect x="-6" y="-14" width="12" height="12" rx="1.5" fill="#7a4f2e" />
      <rect x="-0.8" y="-62" width="1.8" height="14" fill="#9aa5bb" />
      <polygon points="1,-62 14,-58 1,-54" fill="#2ee6a8" />
    </>
  ),

  laboratorio: () => (
    <>
      <Shadow />
      <Box f={0.84} height={32} color="#cfd8e8" dark="#a9b3c6" light="#e9f0fb" />
      <Windows cols={3} rows={2} top={-30} f={0.84} color="#7ce0c0" />
      <ellipse cx="0" cy="-32" rx={HW * 0.5} ry={HH * 0.9} fill="#7cc7e8" opacity="0.95" />
      <rect x="-1.5" y="-54" width="3" height="12" fill="#8e97a6" />
      <circle cx="0" cy="-56" r="3.5" fill="#2ee6a8" />
    </>
  ),

  observatorio: () => (
    <>
      <Shadow />
      <Box f={0.6} height={34} color="#b9c3d4" dark="#95a0b2" light="#d8e0ec" />
      <ellipse cx="0" cy="-34" rx={HW * 0.62} ry={HH * 1.25} fill="#e5ebf5" />
      <path d={`M -4 -34 L -4 ${-34 - HH * 1.1} L 4 ${-34 - HH * 1.1} L 4 -34 Z`} fill="#2a3450" />
      <rect x="-2" y="-62" width="12" height="4" rx="2" transform="rotate(-28)" fill="#6b7384" />
    </>
  ),

  'centro-espacial': () => (
    <>
      <Shadow />
      <polygon points={diamond(0.95)} fill="#9aa3b4" />
      <Box f={0.58} height={10} color="#7c8698" dark="#626b7c" light="#9ba5b8" />
      <g transform="translate(0 -10)">
        <path d="M0 -46 q7 14 7 26 h-14 q0 -12 7 -26z" fill="#eef3ff" />
        <path d="M0 -46 q7 14 7 26 h-7 z" fill="#c9d3e6" />
        <path d="M-7 -20 l-6 10 h6z" fill="#e2574c" />
        <path d="M7 -20 l6 10 h-6z" fill="#b63c33" />
        <circle cx="0" cy="-28" r="3.4" fill="#29c6f7" />
        <ellipse cx="0" cy="-8" rx="7" ry="3.5" fill="#ff9f45" opacity="0.9" />
      </g>
      <rect x="18" y="-44" width="3" height="44" fill="#6b7384" />
    </>
  ),

  monumento: () => (
    <>
      <Shadow />
      <Box f={0.78} height={8} color="#c9c4bb" dark="#a7a299" light="#e2ddd4" />
      <Box f={0.5} height={10} y={-8} color="#b5b0a7" dark="#948f87" light="#d2cdc4" />
      <path d="M-7 -18 L0 -72 L7 -18 Z" fill="#ffd978" />
      <path d="M0 -72 L7 -18 L0 -18 Z" fill="#e0a92e" />
      <path
        d="M0 -84 l3.2 6.6 7.2 1 -5.2 5.1 1.2 7.2L0 -67.5 l-6.4 3.4 1.2 -7.2 -5.2 -5.1 7.2 -1z"
        fill="#29c6f7"
      />
    </>
  ),
}

/** Sprite de uma edificação, pronto para ser posicionado no grid. */
export default function BuildingArt({ type }) {
  const Art = ART[type]
  if (!Art) return null
  return <Art />
}

/** Mesmo sprite, isolado num SVG — usado nos cards da loja. */
export function BuildingPreview({ type, width = 62, height = 52 }) {
  return (
    <svg viewBox="-36 -78 72 92" width={width} height={height} aria-hidden="true">
      <BuildingArt type={type} />
    </svg>
  )
}

export { HW, HH, diamond }
