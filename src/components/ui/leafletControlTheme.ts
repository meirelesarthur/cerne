import { t } from '../../design/tokens'

const STYLE_ID = 'gb-leaflet-controls'

/**
 * Estiliza o controle de zoom nativo do Leaflet (`.leaflet-control-zoom`) no
 * visual "glass" do sistema — vidro esverdeado translúcido, cantos
 * arredondados, ícone claro — em vez do quadrado branco cru do Leaflet.
 *
 * Fonte única: injeta uma `<style>` global uma única vez (idempotente — cada
 * mapa chama isto na própria montagem) e vale para todo mapa do projeto que
 * use o controle de zoom padrão (`FarmAreasMap`, `MapView`, `Step3Mapa`), sem
 * precisar reescrever CSS por tela. Escopo restrito a `.leaflet-control-zoom`
 * — não toca a toolbar de desenho do `leaflet-draw` (`.leaflet-draw-toolbar`),
 * que é um controle à parte.
 */
export function ensureLeafletControlTheme() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
  const el = document.createElement('style')
  el.id = STYLE_ID
  // `!important` é necessário: o Leaflet tem uma regra `.leaflet-touch .leaflet-bar`
  // (2 classes) que redefine box-shadow/border/tamanho em dispositivos com touch —
  // especificidade maior que `.leaflet-control-zoom` sozinho, então sem isso o
  // controle volta ao cromo branco cru sempre que `L.Browser.touch` é true
  // (notebooks com tela touch, não só celular).
  el.textContent = [
    '.leaflet-control-zoom {',
    '  border: none !important;',
    `  border-radius: ${t.radius.xl}px !important;`,
    '  overflow: hidden;',
    `  background: ${t.color.gb.surface} !important;`,
    '  backdrop-filter: blur(20px);',
    '  -webkit-backdrop-filter: blur(20px);',
    `  box-shadow: ${t.shadow.cardDarkHover} !important;`,
    '}',
    '.leaflet-control-zoom a, .leaflet-control-zoom a:hover, .leaflet-control-zoom a:focus {',
    `  width: ${t.size.iconBtn.md}px !important;`,
    `  height: ${t.size.iconBtn.md}px !important;`,
    `  line-height: ${t.size.iconBtn.md}px !important;`,
    '  background: transparent !important;',
    `  color: ${t.color.neutral[0]} !important;`,
    '  border: none !important;',
    `  font-size: ${t.font.size.lg}px !important;`,
    `  font-weight: ${t.font.weight.medium};`,
    '  transition: background-color 0.15s ease;',
    '}',
    `.leaflet-control-zoom a:hover { background: rgba(255,255,255,0.14) !important; }`,
    `.leaflet-control-zoom-in { border-bottom: 1px solid rgba(255,255,255,0.16); }`,
    '@media (prefers-reduced-motion: reduce) { .leaflet-control-zoom a { transition: none; } }',
  ].join('\n')
  document.head.appendChild(el)
}
