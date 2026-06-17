# -*- coding: utf-8 -*-
"""
Gera as 7 ilustrações no estilo Xiaohei (SVG desenhado à mão) e remonta o
documento "Processo de UX Ponta a Ponta — v2.0" como HTML, pronto para
impressão em PDF via Edge headless.

Estilo (references/style-dna.md): branco puro, traço preto trêmulo, muito
espaço em branco, poucas anotações manuscritas em vermelho/laranja/azul.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "assets", "ux-ponta-a-ponta-illustrations")
os.makedirs(ASSETS, exist_ok=True)

INK = "#15130f"        # traço preto principal / corpo do Xiaohei
RED = "#d83a2c"        # alerta / problema / resultado
ORANGE = "#ef8a1f"     # fluxo / caminho / setas
BLUE = "#2f6fc4"       # explicação secundária / estado / IA

# ---------------------------------------------------------------- helpers ----

def defs(seed):
    return f'''<defs>
  <filter id="rough" x="-6%" y="-6%" width="112%" height="112%">
    <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="2" seed="{seed}" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="3.1"/>
  </filter>
  <filter id="rough2" x="-6%" y="-6%" width="112%" height="112%">
    <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="{seed+3}" result="n2"/>
    <feDisplacementMap in="SourceGraphic" in2="n2" scale="2"/>
  </filter>
</defs>'''


def stroke(d, w=3.2, color=INK, dash=None, cap="round"):
    da = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linecap="{cap}" stroke-linejoin="round"{da}/>'


def lab(x, y, text, color=INK, size=27, rot=0, anchor="start", weight=400):
    tr = f' transform="rotate({rot} {x} {y})"' if rot else ""
    return (f'<text x="{x}" y="{y}" fill="{color}" font-family="Caveat, Segoe Script, cursive" '
            f'font-size="{size}" font-weight="{weight}" text-anchor="{anchor}"{tr}>{text}</text>')


def arrowhead(x, y, ang, color=ORANGE, s=14):
    # triângulo simples apontando na direção 'ang' (graus)
    return (f'<g transform="translate({x} {y}) rotate({ang})">'
            f'<path d="M0,0 L-{s},-{s*0.55:.0f} L-{s},{s*0.55:.0f} Z" fill="{color}"/></g>')


def xiaohei(tx, ty, s=1.0, flip=False, seed_local=True):
    """Criatura preta sólida, olhos de pontinho branco, perninhas finas."""
    sx = -s if flip else s
    body = f'<path d="M43,6 C20,6 13,29 16,58 C18,87 25,111 43,111 C61,111 68,87 70,58 C73,29 66,6 43,6 Z" fill="{INK}"/>'
    eyes = (f'<circle cx="34" cy="50" r="5.4" fill="#fff"/>'
            f'<circle cx="53" cy="50" r="5.4" fill="#fff"/>')
    legs = (stroke("M35,109 L31,127", 4) + stroke("M31,127 L40,128", 4) +
            stroke("M51,109 L55,127", 4) + stroke("M55,127 L64,128", 4))
    return (f'<g transform="translate({tx} {ty}) scale({sx} {s})" filter="url(#rough)">'
            f'{body}{eyes}{legs}</g>')


def arm(d, w=4):
    return stroke(d, w)


def wrap(inner, seed, w=1000, h=560):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="{w}" height="{h}" role="img">'
            f'<rect width="{w}" height="{h}" fill="#ffffff"/>'
            f'{defs(seed)}{inner}</svg>')


# ------------------------------------------------------------- figura 1 ------
# Capa: o circuito não encerra na entrega — Xiaohei devolve a "entrega" ao início.

def fig1():
    g = '<g filter="url(#rough)">'
    # trilho oval (laranja) com lacuna embaixo, sentido horário
    g += stroke("M250,420 C120,420 70,300 130,200 C195,92 360,80 500,80 "
                "C640,80 805,92 870,200 C930,300 880,420 750,420",
                7, ORANGE)
    g += '</g>'
    g += arrowhead(255, 418, 150, ORANGE, 16)  # ponta apontando para o início (esq.)
    # nós dos 5 estágios (ticks pretos pequenos)
    nodes = [(150, 235, "descobrir"), (330, 95, "construir"), (560, 88, "entregar"),
             (790, 130, "documentar"), (905, 305, "medir")]
    g2 = '<g filter="url(#rough2)">'
    for x, y, _ in nodes:
        g2 += f'<circle cx="{x}" cy="{y}" r="6" fill="{INK}"/>'
    g2 += '</g>'
    g += g2
    for x, y, t in nodes:
        dy = -14 if y < 200 else 30
        g += lab(x, y + dy, t, INK, 24, anchor="middle")
    # Xiaohei na lacuna, carregando a caixa "entrega" de volta ao início (vai p/ esq.)
    g += xiaohei(470, 330, 0.92, flip=True)
    g += arm("M512,355 C520,330 530,322 545,322")   # braço dir. erguido
    g += arm("M476,360 C470,335 462,326 450,324")    # braço esq. erguido
    g += '<g filter="url(#rough)">' + stroke("M438,300 h70 v40 h-70 Z", 3.2) + '</g>'
    g += lab(473, 326, "entrega", INK, 22, anchor="middle")
    # anotações (poucas e curtas)
    g += lab(500, 50, "não termina na entrega", RED, 30, anchor="middle")
    g += lab(250, 470, "de volta ao início", ORANGE, 25, anchor="middle")
    return wrap(g, 7)


# ------------------------------------------------------------- figura 2 ------
# Os seis pilares — Xiaohei empilha 6 caixas; as 2 do topo marcadas NOVO.

def fig2():
    g = ""
    boxes = [
        (300, 430, 360, 56, "tokens", INK),
        (320, 374, 320, 56, "@gb/ui — núcleo", INK),
        (335, 318, 290, 56, "governança federada", INK),
        (350, 262, 260, 56, "contexto p/ IA", INK),
        (368, 206, 224, 56, "documentação viva", BLUE),
        (384, 150, 192, 56, "medição contínua", BLUE),
    ]
    gb = '<g filter="url(#rough)">'
    for x, y, w, h, _, _ in boxes:
        gb += stroke(f"M{x},{y} h{w} v{h} h-{w} Z", 3.2)
    gb += '</g>'
    g += gb
    for x, y, w, h, t, c in boxes:
        g += lab(x + w / 2, y + 37, t, c, 25, anchor="middle")
    # selos NOVO nas duas do topo
    g += lab(600, 196, "NOVO", RED, 26, rot=-8)
    g += lab(584, 140, "NOVO", RED, 26, rot=-8)
    # Xiaohei num banquinho colocando a caixa do topo
    g += '<g filter="url(#rough)">' + stroke("M150,470 h70 v18 h-70 Z", 3.2) + '</g>'  # banquinho
    g += xiaohei(150, 350, 1.05)
    g += arm("M196,378 C235,360 270,300 300,210")  # braço apoiando a pilha
    g += lab(120, 330, "UX empilha", INK, 26)
    g += lab(700, 470, "uma definição, muitos consumidores", ORANGE, 27, rot=-2)
    return wrap(g, 11)


# ------------------------------------------------------------- figura 3 ------
# O que faltava: (esq.) espelho-Figma rachado pesando; (dir.) tabuão que acaba no ar.

def fig3():
    g = ""
    # divisória central
    g += stroke("M500,70 L500,500", 2.2, INK, dash="3 10")
    # --- esquerda: Xiaohei esmagado pelo espelho rachado ---
    g += '<g filter="url(#rough)">'
    g += stroke("M150,120 h170 v150 h-170 Z", 3.4)         # moldura espelho
    g += stroke("M170,140 L300,250", 2)                     # rachadura
    g += stroke("M300,150 L185,250", 2)
    g += stroke("M150,120 L320,270", 2)
    g += '</g>'
    g += lab(235, 110, "figma-espelho", INK, 24, anchor="middle")
    g += xiaohei(195, 280, 0.8)
    g += arm("M210,300 C200,285 205,278 235,275")          # braços segurando peso acima
    g += arm("M250,300 C262,285 270,278 290,275")
    g += '<g filter="url(#rough2)"><circle cx="160" cy="320" r="3" fill="' + BLUE + '"/>'
    g += '<circle cx="300" cy="330" r="3" fill="' + BLUE + '"/></g>'
    g += lab(140, 360, "suor", BLUE, 22, rot=-10)
    g += lab(235, 470, "desatualizado — pesa e ninguém usa", RED, 26, anchor="middle")
    # --- direita: Xiaohei na ponta do tabuão que termina no ar ---
    g += '<g filter="url(#rough)">'
    g += stroke("M560,300 h230", 6)                         # tabuão
    g += stroke("M560,300 v60", 4)                          # base/suporte esq.
    g += '</g>'
    g += lab(600, 290, "entrega", INK, 24)
    g += xiaohei(760, 230, 0.78)
    g += stroke("M820,330 C840,360 845,400 842,440", 2, INK, dash="2 9")  # olhando p/ baixo (vazio)
    g += lab(820, 470, "...e depois? sem dados", RED, 26, anchor="middle")
    g += lab(700, 130, "dois problemas sem dono", INK, 28, anchor="middle")
    return wrap(g, 19)


# ------------------------------------------------------------- figura 4 ------
# A bancada: braço-máquina "claude" entrega a peça já no padrão; UX (Xiaohei) monta.

def fig4():
    g = ""
    # bancada
    g += '<g filter="url(#rough)">' + stroke("M120,430 h760", 5)
    g += stroke("M170,430 v70", 4) + stroke("M830,430 v70", 4) + '</g>'
    # entrada: ideia/tela antiga (esquerda)
    g += '<g filter="url(#rough)">' + stroke("M120,360 m0,-30 a36,30 0 1,0 0.1,0 Z", 3) + '</g>'
    g += lab(120, 305, "ideia / tela antiga", INK, 23, anchor="middle")
    g += arrowhead(330, 360, 0, ORANGE, 14)
    g += stroke("M180,360 H318", 6, ORANGE)
    # braço-máquina "claude" descendo do topo
    g += '<g filter="url(#rough)">'
    g += stroke("M600,70 H760", 5) + stroke("M680,70 V150", 5)
    g += stroke("M680,150 l-22,26 M680,150 l22,26", 4)     # garra
    g += '</g>'
    g += lab(700, 60, "claude", BLUE, 28)
    g += lab(700, 200, "entrega a peça pronta", ORANGE, 25, anchor="middle")
    # peça já no padrão (centro/baixo)
    g += '<g filter="url(#rough)">' + stroke("M610,250 h140 v90 h-140 Z", 3.2) + '</g>'
    g += lab(680, 290, "componente", INK, 24, anchor="middle")
    g += lab(680, 320, "story + 2 temas", INK, 21, anchor="middle")
    g += lab(770, 360, "zero hardcode", BLUE, 23, rot=4)
    # Xiaohei (UX) na bancada inspecionando a peça
    g += xiaohei(410, 330, 0.95)
    g += arm("M456,360 C500,350 540,320 600,300")          # mão na peça
    g += lab(360, 320, "UX monta e decide", INK, 26)
    return wrap(g, 5)


# ------------------------------------------------------------- figura 5 ------
# Um poço "tokens", canos puxando p/ figma e supernova; válvula de mão única.

def fig5():
    g = ""
    # poço
    g += '<g filter="url(#rough)">'
    g += f'<path d="M210,330 q90,-40 180,0 l0,150 q-90,30 -180,0 Z" fill="{INK}"/>'  # corpo cheio
    g += stroke("M210,330 q90,-40 180,0 l0,150 q-90,30 -180,0 Z", 3.4)   # corpo do poço
    g += stroke("M210,330 q90,40 180,0", 2.6)                            # boca
    g += stroke("M205,330 q95,-70 190,0", 3.2)                           # telhadinho arco
    g += stroke("M205,330 v-26 M395,330 v-26", 3.4)                      # postes
    g += '</g>'
    g += lab(300, 410, "tokens", "#fff", 30, anchor="middle", weight=700)
    g += lab(300, 300, "1 definição", INK, 25, anchor="middle")
    # manivela + Xiaohei
    g += xiaohei(120, 320, 0.92)
    g += arm("M166,350 C185,335 198,322 208,312")
    g += stroke("M208,312 l24,-6", 3.4)   # manivela
    # canos subindo p/ direita -> dois copos
    g += stroke("M380,360 C520,330 560,250 640,210", 7, ORANGE)
    g += stroke("M380,400 C540,400 620,360 700,330", 7, ORANGE)
    g += arrowhead(642, 210, -35, ORANGE, 14)
    g += arrowhead(702, 330, -25, ORANGE, 14)
    # copos
    g += '<g filter="url(#rough)">' + stroke("M620,180 h70 l-8,70 h-54 Z", 3) + '</g>'
    g += lab(655, 165, "figma", INK, 24, anchor="middle")
    g += '<g filter="url(#rough)">' + stroke("M690,300 h70 l-8,70 h-54 Z", 3) + '</g>'
    g += lab(725, 285, "supernova", INK, 24, anchor="middle")
    # válvula de mão única no cano de cima
    g += '<g filter="url(#rough2)"><circle cx="520" cy="285" r="15" fill="none" stroke="' + RED + '" stroke-width="3"/></g>'
    g += stroke("M512,293 l16,-16", 3, RED)
    g += lab(540, 470, "puxado automático — nunca ao contrário", RED, 27, anchor="middle")
    g += lab(470, 250, "puxa", ORANGE, 23, rot=-18)
    return wrap(g, 14)


# ------------------------------------------------------------- figura 6 ------
# PostHog: Xiaohei com estetoscópio na tela, escutando onde dói (rage clicks).

def fig6():
    g = ""
    # tela (monitor) inclinada como "paciente"
    g += '<g filter="url(#rough)">'
    g += stroke("M430,150 h360 v230 h-360 Z", 3.4)
    g += stroke("M590,380 v40 M520,420 h140", 4)   # pé do monitor
    g += '</g>'
    g += lab(610, 135, "a tela em uso", INK, 24, anchor="middle")
    # faíscas de rage click dentro da tela
    g += '<g filter="url(#rough2)">'
    for (x, y) in [(520, 230), (700, 300), (640, 200)]:
        g += stroke(f"M{x},{y} l10,-14 M{x},{y} l14,4 M{x},{y} l-6,12 M{x},{y} l-12,-6", 3, ORANGE)
    g += '</g>'
    g += lab(700, 300, "rage click", ORANGE, 23)
    # marca vermelha "onde dói"
    g += stroke("M515,250 l24,24 M539,250 l-24,24", 4, RED)
    g += lab(470, 250, "dói aqui", RED, 24, anchor="end")
    # Xiaohei com estetoscópio encostado na tela
    g += xiaohei(250, 300, 1.0)
    g += arm("M296,330 C340,320 390,300 432,280")     # braço com o "ouvido" na tela
    g += '<g filter="url(#rough2)"><circle cx="432" cy="278" r="12" fill="none" stroke="' + INK + '" stroke-width="3"/></g>'
    g += stroke("M250,300 C150,300 130,380 180,420", 2, BLUE, dash="2 9")  # fio do achado
    # clipboard achado -> backlog
    g += '<g filter="url(#rough)">' + stroke("M150,420 h120 v70 h-120 Z", 3) + '</g>'
    g += lab(210, 450, "achado", INK, 22, anchor="middle")
    g += lab(210, 478, "vira backlog", BLUE, 22, anchor="middle")
    g += lab(610, 470, "observar sem atrapalhar — a evidência guia o próximo sprint", INK, 26, anchor="middle")
    return wrap(g, 23)


# ------------------------------------------------------------- figura 7 ------
# A constituição que propaga: Xiaohei ergue o pote @gb/tokens; catraca "lint" barra hardcode.

def fig7():
    g = ""
    # pote selado no alto, erguido pelo Xiaohei
    g += xiaohei(120, 250, 1.0)
    g += arm("M150,250 C150,210 175,180 210,175")     # braço esq. erguido
    g += arm("M196,255 C210,215 235,185 270,178")      # braço dir. erguido
    g += '<g filter="url(#rough)">'
    g += f'<path d="M205,120 h95 v60 h-95 Z" fill="{INK}"/>'  # pote cheio
    g += stroke("M205,120 h95 v60 h-95 Z", 3.4)        # pote
    g += stroke("M218,120 v-14 h69 v14", 3)            # tampa selada
    g += '</g>'
    g += lab(252, 158, "@gb/tokens", "#fff", 22, anchor="middle", weight=700)
    g += lab(252, 100, "1 definição p/ toda a GB", INK, 24, anchor="middle")
    # escorre para baixo: @gb/ui -> projetos
    g += stroke("M300,180 C420,210 430,250 440,290", 7, ORANGE)
    g += arrowhead(441, 292, 75, ORANGE, 13)
    g += '<g filter="url(#rough)">' + stroke("M420,300 h150 v54 h-150 Z", 3.2) + '</g>'
    g += lab(495, 334, "@gb/ui", INK, 24, anchor="middle")
    g += stroke("M495,354 V410", 7, ORANGE)
    g += arrowhead(495, 412, 90, ORANGE, 13)
    g += '<g filter="url(#rough)">' + stroke("M410,420 h170 v54 h-170 Z", 3.2) + '</g>'
    g += lab(495, 454, "projetos GB", INK, 24, anchor="middle")
    g += lab(560, 230, "propaga por bump", ORANGE, 24, rot=18)
    # catraca lint barrando hardcode (direita)
    g += '<g filter="url(#rough)">'
    g += stroke("M720,250 v160", 5)                    # poste catraca
    g += stroke("M720,300 h120", 5)                    # braço da catraca (barra)
    g += '</g>'
    g += lab(740, 240, "lint", INK, 26)
    g += xiaohei(700, 380, 0.62)                       # guardião pequeno
    # hardcode tentando entrar e sendo barrado
    g += '<g filter="url(#rough)">' + stroke("M880,280 h90 v44 h-90 Z", 3) + '</g>'
    g += lab(925, 308, "#059669", INK, 22, anchor="middle")
    g += stroke("M895,270 l30,30 M925,270 l-30,30", 4, RED)
    g += lab(925, 360, "hardcode barrado", RED, 24, anchor="middle")
    g += stroke("M870,302 H846", 6, ORANGE, dash="3 8")
    return wrap(g, 31)


FIGS = {
    "01-circuito-nao-fecha-na-entrega": fig1(),
    "02-seis-pilares": fig2(),
    "03-o-que-faltava": fig3(),
    "04-claude-na-bancada": fig4(),
    "05-poco-tokens-muitos-canos": fig5(),
    "06-posthog-onde-doi": fig6(),
    "07-constituicao-que-propaga": fig7(),
}

for name, svg in FIGS.items():
    with open(os.path.join(ASSETS, name + ".svg"), "w", encoding="utf-8") as f:
        f.write(svg)

print("SVGs gerados:", len(FIGS))

# ============================================================== documento ====
import re

def figure(key, caption):
    return (f'<figure class="xh">{FIGS[key]}'
            f'<figcaption>{caption}</figcaption></figure>')

DOC = r"""
<!-- ============================== CAPA ============================== -->
<section class="page cover">
  <div class="brandbar"><span class="logo">◐ CERNE</span><span class="brandsub">GB AGRITECH · UX &amp; DESIGN SYSTEM</span></div>
  <div class="cover-body">
    <p class="eyebrow">Documento técnico interno · v2.0</p>
    <h1 class="cover-title">Processo de UX<br>Ponta a Ponta</h1>
    <p class="cover-lead">Code-First, Documentação Viva e Melhoria Contínua</p>
    <p class="cover-desc">O código permanece como fonte única da verdade — e o ciclo passa a se fechar
      com documentação automatizada (Supernova&nbsp;+&nbsp;Figma) e medição contínua de uso (PostHog).
      UX deixa de terminar na entrega: vira um circuito.</p>
    [[FIG:01-circuito-nao-fecha-na-entrega|O circuito: a entrega não encerra o processo — alimenta a próxima volta.]]
    <table class="meta">
      <tr><th>Autoria</th><td>Arthur Meireles — UX, GB Agritech</td></tr>
      <tr><th>Base técnica</th><td>Projeto CERNE (React + TypeScript + Chakra UI 3 + tokens) · Supernova · PostHog</td></tr>
      <tr><th>Versão</th><td>2.0 — Junho/2026 · substitui a v1.0 (Processo de UX Code-First)</td></tr>
      <tr><th>Classificação</th><td>Documento técnico interno — Confidencial</td></tr>
    </table>
  </div>
  <div class="pagefoot"><span>Confidencial — uso interno GB Agritech</span></div>
</section>

<!-- ============================== SEÇÃO 1 ============================== -->
<section class="page">
  <header class="ph"><span class="sec">Seção 1</span><h2>Sumário Executivo</h2></header>
  <div class="callout"><b>Onde estamos × para onde vamos.</b> <u>Em produção hoje:</u> tokens centralizados em código
    como fonte única (<code>src/design/tokens.ts</code>), catálogo de componentes em <code>src/components/ui/</code>,
    Storybook, Tailwind e o contexto para IA (Leis e Regras). <u>Alvo desta v2 (a construir):</u> exportar os tokens
    no padrão W3C&nbsp;DTCG, reconstruir o núcleo sobre Chakra&nbsp;UI&nbsp;3 com recipes, distribuir os pacotes
    <code>@gb/tokens</code> / <code>@gb/ui</code> / <code>@gb/lint</code>, documentar no Supernova e instrumentar com
    PostHog. Os marcos descritos adiante são o <strong>destino arquitetural</strong>, não o estado atual.</div>
  <p>A v1.0 deste documento consolidou o processo <em>code-first</em>: os tokens como fonte única em código, um
    catálogo de componentes curados, Storybook e o contexto para IA (as Leis do CERNE). Esse alicerce está em
    produção. A <strong>formalização</strong> desse núcleo — tokens no padrão W3C&nbsp;DTCG, componentes
    reconstruídos sobre Chakra&nbsp;UI&nbsp;3 e distribuídos como pacotes <code>@gb/*</code> versionados — é a
    <strong>arquitetura-alvo</strong> desta v2 (Seções&nbsp;7 e&nbsp;8), validada pela pesquisa de indústria como o
    padrão consolidado de 2025–2026.</p>
  <p>Esta v2.0 estende o processo nas duas pontas que a v1 deixava em aberto: <strong>o que acontece depois da
    entrega</strong>. A resposta tem três movimentos:</p>
  <table class="t">
    <thead><tr><th>Extensão</th><th>O que muda</th><th>Ferramenta</th></tr></thead>
    <tbody>
      <tr><td><b>Claude no time de UX</b></td><td>O Claude deixa de ser ferramenta só dos devs: o próprio time de UX o usa para produzir tokens, componentes, telas, stories e auditorias — sob as Leis do CERNE.</td><td>Claude Code + skill <code>gb-design-system</code></td></tr>
      <tr><td><b>Documentação como subproduto</b></td><td>Após a entrega, a documentação é montada no Supernova e no Figma puxando os tokens automaticamente do código — documentar deixa de onerar o time.</td><td>Supernova (free) + Tokens Studio + Figma</td></tr>
      <tr><td><b>Melhoria contínua</b></td><td>Telemetria de uso real (replays, funis, surveys, feature flags) fecha o ciclo: o que o usuário faz na tela vira insumo do próximo sprint de UX.</td><td>PostHog (free)</td></tr>
    </tbody>
  </table>

  <h3>Os seis pilares do processo</h3>
  [[FIG:02-seis-pilares|Camada sobre camada: os quatro pilares da v1 sustentam os dois novos — documentar e medir.]]
  <ul class="pillars">
    <li><b>Tokens como constituição</b> — valores de design vivem em código como fonte única (hoje em <code>tokens.ts</code>); <span class="tag">ALVO</span> versioná-los no padrão W3C&nbsp;DTCG para servir todos os produtos da GB.</li>
    <li><b>Núcleo de componentes <code>@gb/ui</code></b> <span class="tag">ALVO</span> — primitivas curadas a serem reconstruídas sobre Chakra&nbsp;UI&nbsp;3 (recipes e slot recipes) e distribuídas como pacote npm versionado: uma correção no núcleo propaga para todos os consumidores. Hoje as primitivas vivem em <code>src/components/ui/</code>.</li>
    <li><b>Governança federada</b> — UX é a fonte central dos tokens; devs criam componentes livremente, e os melhores são promovidos ao núcleo com aprovação de UX.</li>
    <li><b>Contexto para IA</b> — Leis e receitas de composição empacotadas como contexto legível por agentes, permitindo construir telas novas com consistência mesmo sem Figma.</li>
    <li><span class="tag">NOVO</span> <b>Documentação viva</b> — Supernova conectado ao código e ao Figma; tokens fluem automaticamente, documentação nasce depois da entrega, sem retrabalho manual.</li>
    <li><span class="tag">NOVO</span> <b>Medição contínua</b> — PostHog instrumenta o produto; dados de comportamento real alimentam hipóteses, experimentos e o backlog de UX.</li>
  </ul>

  <div class="callout"><b>Custo de entrada: R$&nbsp;0.</b> Todo o ferramental novo desta versão opera em planos
    gratuitos no primeiro momento — Supernova Free (até 5 usuários, 1 design system, 20 páginas de documentação) e
    PostHog Free (1M eventos, 5 mil session replays e 1.500 respostas de survey por mês). Upgrade só quando a
    fricção justificar, com critérios definidos na Seção&nbsp;9.</div>
  <div class="pagefoot"><span>Confidencial — uso interno GB Agritech</span></div>
</section>

<!-- ============================== SEÇÃO 2 ============================== -->
<section class="page">
  <header class="ph"><span class="sec">Seção 2</span><h2>Contexto e o Que Faltava</h2></header>
  <p>O fluxo tradicional — desenhar no Figma e repassar para implementação — foi invertido no CERNE: o código nasce
    com alta fidelidade e governança (as Leis do projeto), e o Figma deixou de ser entregável obrigatório. A v1
    resolveu a <em>produção</em>: como construir telas consistentes em escala, com IA, sem mockup.</p>
  [[FIG:03-o-que-faltava|Dois problemas sem dono: a documentação-espelho pesava e o processo terminava num beco sem dados.]]
  <p>Dois problemas, porém, permaneciam sem dono:</p>
  <h3>1 — A documentação onerava o time</h3>
  <p>Converter o que existe em código para o Figma era um passo manual, custoso e que quebrava os vínculos com o
    design system. O resultado: um Figma-espelho sempre desatualizado, com percepção (correta) de baixo valor. A
    consequência prática era documentação adiada ou abandonada — e o conhecimento do sistema concentrado em quem o
    construiu (<em>bus-factor</em>).</p>
  <h3>2 — O processo terminava na entrega</h3>
  <p>Não havia mecanismo sistemático para saber se a tela entregue funciona para o usuário: onde ele trava, o que
    ignora, que fluxo abandona. Sem telemetria, a priorização de UX dependia de feedback anedótico — e melhorias
    eram reativas, não contínuas.</p>
  <div class="callout danger"><b>O risco central continua o mesmo.</b> No instante em que se regenera em vez de
    distribuir, bifurca-se a fonte da verdade. O valor de um design system é <em>"uma definição, muitos
    consumidores"</em>. Tudo nesta arquitetura — inclusive as camadas novas de documentação e telemetria — existe
    para preservar essa fonte única: Supernova e Figma <b>consomem</b> os tokens do código; nunca os definem.</div>
  <p>A v2 fecha essas duas pontas com o mesmo princípio da v1: automatizar o que é mecânico para que o time gaste
    energia apenas no que exige julgamento. Documentar vira pipeline; medir vira instrumentação; e o julgamento de
    UX passa a operar sobre dados.</p>
  <div class="pagefoot"><span>Confidencial — uso interno GB Agritech</span></div>
</section>

<!-- ============================== SEÇÃO 3 ============================== -->
<section class="page">
  <header class="ph"><span class="sec">Seção 3</span><h2>O Ciclo Ponta a Ponta</h2></header>
  <p>O processo deixa de ser uma linha (descobrir → desenhar → entregar) e vira um <strong>circuito de cinco
    estágios</strong>. Cada estágio tem um responsável claro, ferramentas definidas e um critério de saída.</p>
  [[FIG:01-circuito-nao-fecha-na-entrega|Descobrir → construir → entregar → documentar → medir — e o achado da medição reabastece o descobrir.]]
  <table class="t">
    <thead><tr><th>#</th><th>Estágio</th><th>O que acontece</th><th>Ferramentas</th></tr></thead>
    <tbody>
      <tr><td>1</td><td><b>Descobrir</b></td><td>Insumos do ciclo: tela antiga como especificação (migração), dados do PostHog (replays, funis, surveys) e demandas de produto. UX define hipótese e escopo.</td><td>PostHog · produto legado</td></tr>
      <tr><td>2</td><td><b>Construir</b></td><td>UX + Claude compõem a solução sobre o design system: tokens, primitivas do <code>@gb/ui</code>, receitas de composição. Zero hardcode, dois temas, todos os estados.</td><td>Claude + skill · <code>@gb/ui</code> · <code>@gb/tokens</code></td></tr>
      <tr><td>3</td><td><b>Entregar</b></td><td>CI valida (<code>@gb/lint</code>, type-check, stories). Commit convencional, revisão, merge. Componentes novos viram candidatos a promoção ao núcleo.</td><td>CI · Storybook · pipeline de promoção</td></tr>
      <tr><td>4</td><td><b>Documentar</b></td><td>Depois da entrega: tokens fluem do código para o Figma (Tokens Studio) e para o Supernova; páginas de documentação montadas sobre dados vivos, não screenshots.</td><td>Supernova · Tokens Studio · Figma</td></tr>
      <tr><td>5</td><td><b>Medir</b></td><td>PostHog captura uso real. Ritual mensal de leitura (replays, funis, rage clicks, surveys) gera achados priorizados que reabastecem o estágio 1.</td><td>PostHog</td></tr>
    </tbody>
  </table>
  <div class="callout"><b>Definition of Done ampliado.</b> Uma entrega só está completa quando: (a) passou no lint de
    tokens; (b) tem story no Storybook; (c) os eventos de uso relevantes estão instrumentados; (d) a documentação
    foi atualizada no ciclo de release. Documentação e instrumentação deixam de ser "depois, se der tempo".</div>
  <div class="pagefoot"><span>Confidencial — uso interno GB Agritech</span></div>
</section>

<!-- ============================== SEÇÃO 4 ============================== -->
<section class="page">
  <header class="ph"><span class="sec">Seção 4</span><h2>Claude como Copiloto do Time de UX</h2></header>
  <p>Na v1, a IA aparecia principalmente do lado dos desenvolvedores — o Claude consumindo o catálogo e as receitas
    para montar telas. Na v2, o movimento se completa: o próprio time de UX opera com Claude em toda a cadeia de
    produção do design system. O UX deixa de "especificar para alguém construir" e passa a construir diretamente,
    com a IA executando o mecânico e o UX exercendo o julgamento.</p>
  [[FIG:04-claude-na-bancada|A bancada: o UX monta e decide; o Claude entrega as peças já no padrão das Leis.]]
  <table class="t">
    <thead><tr><th>Frente</th><th>Como funciona</th></tr></thead>
    <tbody>
      <tr><td><b>Tokens</b></td><td>Evoluir <code>tokens.ts</code>, gerar o <code>tokens.json</code> DTCG, propagar mudanças e preparar o changelog do bump de versão do <code>@gb/tokens</code>.</td></tr>
      <tr><td><b>Componentes</b></td><td>Criar primitivas novas em <code>src/components/ui/</code> já com: tokens em todos os valores, suporte aos dois temas, story do Storybook, acessibilidade e todos os estados (loading, vazio, erro, denso, esparso).</td></tr>
      <tr><td><b>Telas</b></td><td>Compor listagens e CRUDs inteiros seguindo as receitas canônicas (Regras B e C), importando apenas o catálogo — o equivalente funcional do mockup, direto em código.</td></tr>
      <tr><td><b>Auditoria (AI-linting)</b></td><td>Varrer PRs e o código existente contra as Leis: hardcode, primitiva reinventada, tema faltando, estado não implementado. Sinaliza antes da revisão humana.</td></tr>
      <tr><td><b>Documentação</b></td><td>Gerar o conteúdo das páginas do Supernova (uso, anatomia, do/don't de cada componente) a partir do código e das stories — o UX revisa, não redige do zero.</td></tr>
      <tr><td><b>Promoção</b></td><td>Normalizar componentes criados pelos devs (tokenizar, completar estados) antes da publicação no <code>@gb/ui</code> — a engenharia reversa da federação, automatizada.</td></tr>
    </tbody>
  </table>
  <h3>O contrato que torna isso confiável</h3>
  <p>O que impede a IA de gerar inconsistência é exatamente o investimento da v1: o <code>CLAUDE.md</code> com as Leis
    e Regras de composição, os tokens como vocabulário fechado e o catálogo como único caminho de construção. O
    Claude opera dentro dessa moldura — e o <code>@gb/lint</code> no CI verifica o resultado independentemente de
    quem (ou o quê) escreveu o código. Apenas <b>32%</b> dos profissionais confiam em output de IA sem contexto de
    design system; com a moldura, o output nasce conforme.</p>
  <div class="callout danger"><b>Papel humano não negociável.</b> O Claude executa; o UX decide. Hierarquia de
    informação, fluxo, terminologia, trade-offs de densidade, decisões de produto — nada disso é delegável. A
    revisão de UX continua sendo o portão de qualidade de toda promoção ao núcleo e de toda tela nova. A IA remove o
    custo de produção, não o julgamento.</div>
  <div class="pagefoot"><span>Confidencial — uso interno GB Agritech</span></div>
</section>

<!-- ============================== SEÇÃO 5 ============================== -->
<section class="page">
  <header class="ph"><span class="sec">Seção 5</span><h2>Documentação Viva — Supernova + Figma</h2></header>
  <p>A regra de ouro da documentação na v2: <strong>documenta-se depois da entrega, puxando do código</strong>.
    Nenhuma página de documentação contém valores digitados à mão — tokens, variáveis e exemplos vêm de fontes vivas
    (repositório, Figma variables, Storybook). Se o token muda no código, a documentação reflete a mudança no
    próximo sync, sem reescrita.</p>
  [[FIG:05-poco-tokens-muitos-canos|Um poço, muitos canos: Figma e Supernova bebem dos tokens do código — nunca o contrário.]]
  <table class="t">
    <thead><tr><th>#</th><th>Passo</th><th>Ferramenta</th></tr></thead>
    <tbody>
      <tr><td>1</td><td><code>tokens.ts</code> gera <code>tokens.json</code> no padrão W3C&nbsp;DTCG (<code>$value</code>/<code>$type</code>) — automatizado no build, com ajuda do Claude.</td><td>Style Dictionary / script</td></tr>
      <tr><td>2</td><td>Tokens Studio sincroniza o <code>tokens.json</code> do Git com as Figma Variables — o Figma passa a falar a língua dos tokens sem digitação manual.</td><td>Tokens Studio (plugin)</td></tr>
      <tr><td>3</td><td>Supernova importa as variáveis do Figma (recurso do plano free) e o Storybook do CERNE como data sources.</td><td>Supernova</td></tr>
      <tr><td>4</td><td>Páginas de documentação montadas no editor do Supernova referenciam os tokens e componentes importados — dados vivos, não screenshots.</td><td>Supernova</td></tr>
    </tbody>
  </table>
  <table class="t">
    <thead><tr><th>O que o plano Free do Supernova cobre</th><th>Limite Free</th></tr></thead>
    <tbody>
      <tr><td>Usuários (full seats)</td><td>5</td></tr>
      <tr><td>Design systems / versões</td><td>1 / 1</td></tr>
      <tr><td>Data sources Figma / Storybook</td><td>3 / 1</td></tr>
      <tr><td>Páginas de documentação</td><td>20</td></tr>
      <tr><td>Pipelines de automação</td><td>1</td></tr>
      <tr><td>Site de documentação</td><td>Privado</td></tr>
      <tr><td>Import de Figma Variables</td><td>Incluído</td></tr>
      <tr><td>Sync automático de data sources</td><td>Não (Pro)</td></tr>
    </tbody>
  </table>
  <div class="callout"><b>Limite mais relevante do free.</b> A atualização automática das fontes de dados é recurso
    Pro. No primeiro momento isso não fere o processo: o sync manual entra como passo obrigatório do checklist de
    release (junto do bump do <code>@gb/tokens</code>). Se a frequência de releases tornar esse passo um gargalo — ou
    se 20 páginas deixarem de bastar — esses são os dois gatilhos objetivos para avaliar o upgrade (Seção&nbsp;9).</div>
  <h3>O novo papel do Figma</h3>
  <p>O Figma sai de "entregável obrigatório" para <em>vitrine e laboratório</em>: recebe as variáveis
    automaticamente via Tokens Studio, serve de superfície para exploração visual quando útil (conceitos, marketing,
    onboarding de designers) e alimenta o Supernova como data source. O que não muda: o Figma nunca é onde um token
    nasce ou é editado — mudança de token nasce no código, com bump de versão e changelog. Manter o Figma
    <em>downstream</em> é o que o mantém barato.</p>
  <div class="pagefoot"><span>Confidencial — uso interno GB Agritech</span></div>
</section>

<!-- ============================== SEÇÃO 6 ============================== -->
<section class="page">
  <header class="ph"><span class="sec">Seção 6</span><h2>Melhoria Contínua — PostHog</h2></header>
  <p>O PostHog fecha o circuito: instrumenta o CERNE e devolve comportamento real de uso — onde o produtor trava no
    cadastro de fazenda, que filtros ninguém usa, onde acontecem cliques de raiva. A priorização de UX passa a operar
    sobre evidência, e cada melhoria entregue é verificável na volta seguinte do ciclo.</p>
  [[FIG:06-posthog-onde-doi|Observar sem atrapalhar: replays e funis mostram onde dói; o achado vira backlog.]]
  <table class="t">
    <thead><tr><th>Produto</th><th>Limite Free (por mês)</th><th>Uso no processo</th></tr></thead>
    <tbody>
      <tr><td>Product Analytics</td><td>1 milhão de eventos</td><td>Funis (cadastros multi-step), retenção, paths entre telas, web analytics.</td></tr>
      <tr><td>Session Replay</td><td>5.000 gravações</td><td>Ver o uso real: hesitação, rage clicks, campos refeitos, abandono. Retenção de 1 mês no free.</td></tr>
      <tr><td>Surveys</td><td>1.500 respostas</td><td>Micro-pesquisas contextuais (ex.: CSAT pós-cadastro de safra).</td></tr>
      <tr><td>Feature Flags / Experiments</td><td>1 milhão de requests</td><td>Rollout gradual de telas migradas e testes A/B de variações de fluxo.</td></tr>
      <tr><td>Error Tracking</td><td>100 mil exceções</td><td>Erros de UI correlacionados com replays.</td></tr>
    </tbody>
  </table>
  <p class="fine">Free tier com reset mensal, sem cartão; 1 projeto, retenção de dados de 1 ano, membros de time
    ilimitados. Setup trivial: <code>posthog-js</code> inicializado no <code>main.tsx</code> — sem configuração
    adicional de build no Vite (&lt; 30&nbsp;min).</p>
  <h3>O ritual de leitura</h3>
  <ul>
    <li><b>Mensal — Revisão de UX baseada em dados:</b> 60–90&nbsp;min; o time lê os funis das jornadas críticas, assiste a uma amostra de replays das telas novas e revisa surveys. Saída: 3–5 achados priorizados que entram no estágio Descobrir do próximo ciclo.</li>
    <li><b>Por release — Verificação de hipótese:</b> toda melhoria de UX relevante declara, antes de sair, qual métrica deve mover (ex.: "reduzir abandono no passo 2 do cadastro de fazenda"). Na revisão seguinte, confere-se. Sem isso, melhoria contínua vira opinião contínua.</li>
    <li><b>Contínuo — Alertas:</b> picos de erro e quedas bruscas de conversão em fluxos críticos geram notificação, não esperam o ritual.</li>
  </ul>
  <h3>Métricas de produto que passam a existir</h3>
  <ul>
    <li>Taxa de conclusão e tempo por etapa dos cadastros multi-step (Fazenda, Safra).</li>
    <li>Rage clicks e dead clicks por tela (atrito de interface).</li>
    <li>Adoção de telas migradas vs. produto legado (acompanha a migração).</li>
    <li>Uso real de filtros, busca e ações em massa nas listagens (informa o que promover ou simplificar no design system).</li>
  </ul>
  <div class="callout danger"><b>Privacidade e LGPD — pré-requisito, não detalhe.</b> Session replay grava interação
    de usuários reais. Antes de ativar: mascaramento de inputs habilitado por padrão (dados pessoais, documentos,
    e-mails nunca gravados), captura restrita ao necessário, aviso de privacidade atualizado e validado com o
    jurídico, e acesso ao PostHog restrito ao time (princípio do menor privilégio). Anonimização e
    <code>person_profiles: 'identified_only'</code> na configuração inicial.</div>
  <div class="pagefoot"><span>Confidencial — uso interno GB Agritech</span></div>
</section>

<!-- ============================== SEÇÃO 7 ============================== -->
<section class="page">
  <header class="ph"><span class="sec">Seção 7</span><h2>Arquitetura-Alvo</h2></header>
  <p>A base-alvo do design system proprietário GB é o <b>Chakra&nbsp;UI&nbsp;3</b>: o tema passa a ser um
    <code>SystemConfig</code> alimentado pelos tokens (via <code>defineTokens</code> /
    <code>defineSemanticTokens</code>) — um esqueleto já existe em <code>src/theme.ts</code> (<code>createSystem</code>) —
    e os componentes do núcleo passam a ser construídos com recipes e slot recipes. A distribuição é por pacote npm
    versionado — o modelo que
    melhor serve "uma definição, muitos consumidores": uma correção no núcleo propaga para todos os projetos por
    bump de versão, sem cópias divergentes.</p>
  [[FIG:07-constituicao-que-propaga|A constituição que propaga: o pote de tokens escorre para o núcleo e os projetos; o lint barra o hardcode.]]
  <pre class="arch">@gb/tokens (npm | semver | TRAVADO)        ← a constituição: 1 definição p/ toda a GB
   │  tokens.json (DTCG) → script gera: Chakra tokens/semanticTokens ·
   │  Tailwind preset (transição CERNE) · CSS vars
   ▼
@gb/ui (npm | Chakra UI 3)                 ← núcleo curado: SystemConfig
   │  mergeConfigs(defaultConfig, gbConfig) + recipes / slot recipes
   ▼
Projetos GB (CERNE, futuros)               ← createSystem(gbConfig); devs criam livremente
   │  enforcement: @gb/lint + strictTokens + typegen --strict no CI
   │  Claude: skill gb-design-system + MCP oficial do Chakra
   ▼
Pipeline de promoção (dev cria → UX aprova → normaliza → publica no @gb/ui)
   ▼
Documentação viva: tokens.json → Tokens Studio → Figma Variables → Supernova
   ▼
PostHog (uso real) ─────────────────────► realimenta o backlog de UX</pre>
  <table class="t">
    <thead><tr><th>Camada</th><th>Formato</th><th>Modelo</th><th>Quem controla</th></tr></thead>
    <tbody>
      <tr><td>Tokens</td><td><code>@gb/tokens</code> (npm, semver)</td><td>Dependência travada; atualização central propaga</td><td>UX — estrito</td></tr>
      <tr><td>Núcleo de componentes</td><td><code>@gb/ui</code> (npm, Chakra UI 3)</td><td>Pacote versionado; recipes tematizáveis, extensão por props</td><td>UX cura; devs consomem</td></tr>
      <tr><td>Componentes de projeto</td><td>Código no repo do dev</td><td>Federado, livre — sobre as primitivas do Chakra + tema GB</td><td>Devs criam; UX promove</td></tr>
      <tr><td>Enforcement</td><td><code>@gb/lint</code> + strictTokens</td><td>Obrigatório em todo repo GB (CI)</td><td>UX define a regra</td></tr>
      <tr><td>Receitas de tela</td><td>Skill <code>gb-design-system</code></td><td>Claude carrega sob demanda</td><td>UX mantém</td></tr>
      <tr><td>Documentação</td><td>Supernova + Figma Variables</td><td>Downstream do código; sync por release</td><td>UX cura</td></tr>
      <tr><td>Telemetria</td><td>PostHog (<code>posthog-js</code>)</td><td>Instrumentação contínua; leitura ritualizada</td><td>UX + produto</td></tr>
    </tbody>
  </table>
  <h3>Por que Chakra UI 3 favorece o processo</h3>
  <ul>
    <li><b>strictTokens nativo</b> — com <code>strictTokens: true</code> no SystemConfig, o TypeScript só aceita valores de token nas props de estilo. A Lei&nbsp;3 (tokenização) ganha enforcement em tempo de compilação, antes mesmo do lint.</li>
    <li><b>chakra typegen</b> — gera tipos dos tokens e recipes do tema GB: autocomplete do vocabulário do design system na IDE de todo dev (e do Claude).</li>
    <li><b>Semantic tokens e temas</b> — <code>defineSemanticTokens</code> com condições (<code>base</code> / <code>_dark</code>) resolve light + GBMode no nível do tema, eliminando lógica de tema espalhada por componente.</li>
    <li><b>MCP oficial</b> — o <code>@chakra-ui/react-mcp</code> dá ao Claude acesso estruturado a props, exemplos e tema dos componentes Chakra; somado à skill GB, cobre descoberta sem custo de manutenção nosso.</li>
    <li><b>Recipes como contrato</b> — variantes e tamanhos declarados em recipe são o contrato visual do componente; estender é adicionar variante na recipe do <code>@gb/ui</code>, nunca patch local (Lei&nbsp;2 preservada).</li>
  </ul>
  <div class="callout"><b>Lacuna conhecida do ecossistema.</b> Não existe (jun/2026) conversor oficial publicado de
    W3C&nbsp;DTCG para o formato de tokens do Chakra&nbsp;v3. O mapeamento, porém, é direto
    (<code>$value</code>/<code>$type</code> → <code>{ value }</code>): um script utilitário de ~50 linhas, de
    propriedade da GB, versionado dentro do <code>@gb/tokens</code> e gerado/mantido com o Claude. Risco baixo e
    controlado.</div>
  <div class="pagefoot"><span>Confidencial — uso interno GB Agritech</span></div>
</section>

<!-- ============================== SEÇÃO 8 ============================== -->
<section class="page">
  <header class="ph"><span class="sec">Seção 8</span><h2>Plano de Implementação</h2></header>
  <p>Oito frentes — as seis da v1 (revisadas para Chakra) e duas novas. Sequência recomendada: 1 → 2 → 3+4 em
    paralelo → 5 e 6 contínuos; a frente 8 (telemetria) pode começar já na primeira semana, e a 7 (documentação)
    entra após a primeira leva de componentes estabilizar. A frente 1 continua destravando todas as outras.</p>
  <h3>Frente 1 — <code>@gb/tokens</code>: a pedra angular</h3>
  <p><code>tokens.ts</code> → <code>tokens.json</code> (DTCG) → script gera três saídas: tokens/semanticTokens do
    Chakra (<code>defineTokens</code>/<code>defineSemanticTokens</code>), Tailwind preset (transição do CERNE atual) e
    CSS vars. Publicado como pacote npm versionado; todo projeto GB consome a mesma definição por construção.</p>
  <h3>Frente 2 — <code>@gb/lint</code> + strictTokens: o controle da federação</h3>
  <p>A Lei de tokenização vira tripla barreira: strictTokens no tema (compilação), <code>chakra typegen --strict</code>
    (tipos) e ESLint/Stylelint no CI (valores hardcoded). Criar componente continua livre — mas o que se cria é
    forçado a falar a língua dos tokens.</p>
  <h3>Frente 3 — <code>@gb/ui</code>: o núcleo curado sobre Chakra</h3>
  <p>Pacote npm com o SystemConfig GB (<code>mergeConfigs(defaultConfig, gbConfig)</code>) e as primitivas curadas
    reconstruídas sobre Chakra&nbsp;v3 com recipes/slot recipes. Semear com as mais reusadas do catálogo CERNE:
    Button, FormField, FormSelect, Card, Badge, DataTable, Modal, PageCard. Os snippets do Chakra CLI servem de
    ponto de partida de composição quando útil.</p>
  <h3>Frente 4 — Skill <code>gb-design-system</code> + MCP: o que substitui o Figma na construção</h3>
  <p>Empacotar Leis, Regras de composição (listagem e CRUD), contratos de componente e referência de tokens. O Claude
    de qualquer dev (e do UX) carrega a skill e monta telas novas sem Figma. O MCP oficial do Chakra complementa com
    props e exemplos das primitivas base. Versionada junto com os tokens.</p>
  <h3>Frente 5 — Pipeline de promoção: a engenharia reversa formalizada</h3>
  <ul>
    <li>Dev cria o componente no projeto, sobre o tema GB.</li>
    <li>UX revisa contra critérios fixos: tokenizado, dois temas (semantic tokens), story, acessibilidade, todos os estados.</li>
    <li>Normalização: o Claude audita e propõe a versão em recipe/slot recipe — automatizável.</li>
    <li>Publicação no <code>@gb/ui</code> com bump semver: vira <em>commons</em> compartilhado.</li>
  </ul>
  <h3>Frente 6 — A migração</h3>
  <p>A tela antiga é a especificação (conteúdo e comportamento). Dev + Claude + skill + <code>@gb/ui</code>
    reconstroem cada tela; telas pós-migração apoiam-se 100% nas receitas. A migração alimenta o núcleo: componentes
    novos viram candidatos a promoção.</p>
  <h3>Frente 7 — Documentação viva <span class="tag">NOVO</span></h3>
  <ul>
    <li>Criar o workspace Supernova (free) e conectar data sources: arquivo Figma de variables + Storybook do CERNE.</li>
    <li>Configurar Tokens Studio sincronizando o <code>tokens.json</code> do Git com as Figma Variables.</li>
    <li>Curar as 20 páginas: visão geral, fundações (cor, tipo, espaço), 1 página por família de componentes, receitas de composição, governança.</li>
    <li>Claude gera o primeiro rascunho do conteúdo a partir do código e das stories; UX revisa e publica.</li>
    <li>Sync manual dos data sources entra no checklist de release (limite do plano free — 2&nbsp;min por release).</li>
  </ul>
  <h3>Frente 8 — Telemetria e melhoria contínua <span class="tag">NOVO</span></h3>
  <ul>
    <li>Semana 1: <code>posthog-js</code> no <code>main.tsx</code> com mascaramento de inputs e <code>person_profiles: 'identified_only'</code>; validação de privacidade com o jurídico.</li>
    <li>Instrumentar as jornadas críticas: cadastros multi-step, listagens, busca e filtros.</li>
    <li>Ativar session replay e error tracking; definir os 3 primeiros funis.</li>
    <li>Agendar o ritual mensal de revisão de UX baseada em dados (Seção&nbsp;6).</li>
  </ul>
  <div class="pagefoot"><span>Confidencial — uso interno GB Agritech</span></div>
</section>

<!-- ============================== SEÇÃO 9 ============================== -->
<section class="page">
  <header class="ph"><span class="sec">Seção 9</span><h2>Governança e Modelo de Contribuição</h2></header>
  <p>O modelo permanece federado — tokens centralizados e estritos; componentes flexíveis na borda, com caminho de
    promoção ao núcleo — e ganha dois domínios novos: documentação e dados de uso. A governança continua sendo
    produto versionado, não documento.</p>
  <h3>Controles obrigatórios</h3>
  <table class="t">
    <thead><tr><th>Controle</th><th>O que faz</th><th>Modo de falha que previne</th></tr></thead>
    <tbody>
      <tr><td>Token-lint + strictTokens no CI</td><td>Bloqueia valores hardcoded fora dos tokens — em compilação, tipos e lint</td><td>Drift visual entre produtos</td></tr>
      <tr><td>Propriedade explícita</td><td>UX é dono dos tokens e do <code>@gb/ui</code>; devs donos dos componentes de projeto</td><td>"Quem percebeu" conserta</td></tr>
      <tr><td>Versionamento (semver)</td><td>Mudança de token ou de núcleo = bump = changelog = propaga</td><td>Atualizações silenciosas e quebras</td></tr>
      <tr><td>Pipeline de promoção</td><td>Critério fixo para um componente virar núcleo</td><td>Sprawl de componentes redundantes</td></tr>
      <tr><td>Documentação no DoD</td><td>Release só fecha com sync do Supernova/Figma executado</td><td>Documentação-espelho desatualizada</td></tr>
      <tr><td>Privacidade por padrão</td><td>Mascaramento de replay, menor privilégio de acesso, conformidade LGPD revisada</td><td>Exposição de dados pessoais de usuários</td></tr>
      <tr><td>Decisão baseada em dados</td><td>Melhoria de UX declara métrica-alvo antes; ritual mensal confere</td><td>Melhoria contínua virar opinião contínua</td></tr>
      <tr><td>AI-linting (evoluir p/)</td><td>Agente audita PRs contra as Leis antes da revisão humana</td><td>Revisão manual cara e tardia</td></tr>
    </tbody>
  </table>
  <h3>Gatilhos objetivos de upgrade (sair do free quando — e só quando)</h3>
  <table class="t">
    <thead><tr><th>Ferramenta</th><th>Gatilho</th><th>O que o pago destrava</th></tr></thead>
    <tbody>
      <tr><td>Supernova Pro</td><td>Sync manual virou gargalo (releases frequentes) ou 20 páginas insuficientes ou necessidade de site público / viewers</td><td>Sync automático de data sources, mais páginas e pipelines, viewer seats</td></tr>
      <tr><td>PostHog pago</td><td>Estouro consistente de 1M eventos/mês ou 5 mil replays — sinal de adoção, não de custo</td><td>Cobrança por uso acima do free; retenção maior de replays</td></tr>
    </tbody>
  </table>
  <div class="callout"><b>Reposicionamento de discurso.</b> Internamente na GB, vender isto não como "tooling de UX",
    mas como a precondição para que a IA gere código confiável em escala — e, com a v2, como o mecanismo que prova
    valor com dados: cada ciclo entrega evidência de melhoria, não percepção.</div>
  <div class="pagefoot"><span>Confidencial — uso interno GB Agritech</span></div>
</section>

<!-- ============================== SEÇÃO 10 ============================== -->
<section class="page">
  <header class="ph"><span class="sec">Seção 10</span><h2>Riscos, Controles e Métricas de Saúde</h2></header>
  <table class="t">
    <thead><tr><th>Risco</th><th>Impacto</th><th>Controle</th></tr></thead>
    <tbody>
      <tr><td>Bifurcação da fonte da verdade</td><td>N design systems divergentes</td><td>Tokens centrais + semver + lint + strictTokens</td></tr>
      <tr><td>Sprawl de componentes</td><td>Redundância e inconsistência</td><td>Pipeline de promoção + "consultar o <code>@gb/ui</code> antes de criar"</td></tr>
      <tr><td>Drift de tokens</td><td>Inconsistência visual entre produtos</td><td><code>@gb/lint</code> obrigatório no CI</td></tr>
      <tr><td>Documentação desatualizada</td><td>Supernova/Figma viram espelho morto (problema da v1 de volta)</td><td>Sync no checklist de release + documentação no DoD + dados vivos (nunca screenshots)</td></tr>
      <tr><td>Dependência do operador (bus-factor)</td><td>Conhecimento na cabeça do UX</td><td>Leis e processo documentados + Storybook + Supernova publicado</td></tr>
      <tr><td>Limites dos planos free</td><td>Gargalo de sync, páginas ou eventos</td><td>Gatilhos objetivos de upgrade (Seção 9); curadoria de páginas; amostragem de replays</td></tr>
      <tr><td>Privacidade (LGPD) na telemetria</td><td>Exposição de dados pessoais; risco legal</td><td>Mascaramento por padrão, anonimização, acesso restrito, revisão jurídica antes de ativar</td></tr>
      <tr><td>Lock-in de ferramenta de docs</td><td>Migração custosa se o Supernova mudar</td><td>Conteúdo curto e curado; tokens em DTCG (portável a 10+ ferramentas); export offline</td></tr>
      <tr><td>Lacuna DTCG → Chakra</td><td>Script próprio a manter</td><td>~50 linhas, versionado no <code>@gb/tokens</code>, coberto por teste</td></tr>
      <tr><td>Over-engineering de IA/MCP</td><td>Custo de contexto e manutenção</td><td>Começar com CLI + skill; MCP do Chakra é mantido pelo ecossistema, não por nós</td></tr>
    </tbody>
  </table>
  <h3>Métricas de saúde do sistema</h3>
  <ul>
    <li><b>Cobertura de tokens</b> — % de valores de design vindos de tokens, por repositório (tendência: 100%).</li>
    <li><b>Tempo de promoção</b> — da criação de um componente à publicação no <code>@gb/ui</code>.</li>
    <li><b>Violações de lint</b> barradas no CI por sprint (tendência decrescente).</li>
    <li><b>Adoção</b> — nº de produtos GB consumindo <code>@gb/tokens</code> e <code>@gb/ui</code>.</li>
    <li><b>Frescor da documentação</b> <span class="tag">NOVO</span> — releases com sync executado / total de releases (meta: 100%).</li>
    <li><b>Saúde de uso</b> <span class="tag">NOVO</span> — conclusão dos fluxos críticos, rage clicks por tela, adoção das telas migradas (PostHog).</li>
    <li><b>Ciclo fechado</b> <span class="tag">NOVO</span> — % de melhorias de UX entregues com hipótese declarada e verificada no ritual seguinte.</li>
  </ul>
  <div class="pagefoot"><span>Confidencial — uso interno GB Agritech</span></div>
</section>

<!-- ============================== SEÇÃO 11 ============================== -->
<section class="page">
  <header class="ph"><span class="sec">Seção 11</span><h2>Glossário</h2></header>
  <table class="t gloss">
    <thead><tr><th>Termo</th><th>Definição</th></tr></thead>
    <tbody>
      <tr><td>Design token</td><td>Valor nomeado de design (cor, espaço, raio, tipografia) que substitui literais hardcoded.</td></tr>
      <tr><td>W3C DTCG</td><td>Design Tokens Community Group; formato-padrão (JSON com <code>$value</code>/<code>$type</code>) estável desde out/2025.</td></tr>
      <tr><td>SSOT</td><td>Single Source of Truth — a fonte única e autoritativa de uma definição.</td></tr>
      <tr><td>Chakra UI v3</td><td>Biblioteca de componentes React com theming por tokens (<code>createSystem</code>); base do design system proprietário GB.</td></tr>
      <tr><td>Recipe / slot recipe</td><td>Mecanismo do Chakra para declarar variantes e estilos de um componente (simples ou multi-parte) no tema.</td></tr>
      <tr><td>Semantic token</td><td>Token que resolve para valores diferentes por condição (ex.: light vs. GBMode), definido no tema.</td></tr>
      <tr><td>strictTokens</td><td>Opção do Chakra que faz o TypeScript aceitar apenas tokens nas props de estilo.</td></tr>
      <tr><td>Style Dictionary</td><td>Ferramenta que transforma um arquivo de tokens em múltiplos formatos (CSS, Tailwind etc.); lê DTCG desde a v4.</td></tr>
      <tr><td>Tokens Studio</td><td>Plugin Figma que sincroniza variáveis com um arquivo de tokens em Git.</td></tr>
      <tr><td>Supernova</td><td>Plataforma que conecta código, Figma e Storybook para gerar documentação viva de design system.</td></tr>
      <tr><td>PostHog</td><td>Plataforma open-source de product analytics: eventos, session replay, feature flags, experiments e surveys.</td></tr>
      <tr><td>Session replay</td><td>Gravação anonimizada e mascarada da interação do usuário com a interface.</td></tr>
      <tr><td>Feature flag</td><td>Chave de ativação remota que permite rollout gradual e testes A/B sem novo deploy.</td></tr>
      <tr><td>Rage click</td><td>Cliques repetidos e rápidos no mesmo elemento — sinal clássico de atrito de interface.</td></tr>
      <tr><td>MCP</td><td>Model Context Protocol — protocolo que dá a agentes de IA contexto e ferramentas estruturadas.</td></tr>
      <tr><td>Federação</td><td>Modelo onde times criam componentes localmente, com promoção curada ao núcleo compartilhado.</td></tr>
      <tr><td>Flywheel</td><td>Ciclo virtuoso: o design system melhora a IA, que reforça o design system — agora com dados de uso fechando a volta.</td></tr>
    </tbody>
  </table>
  <div class="pagefoot"><span>Confidencial — uso interno GB Agritech</span></div>
</section>

<!-- ============================== SEÇÃO 12 ============================== -->
<section class="page">
  <header class="ph"><span class="sec">Seção 12</span><h2>Referências</h2></header>
  <ul class="refs">
    <li>W3C Design Tokens Community Group — especificação estável v2025.10 · <span>design-tokens.github.io/community-group</span></li>
    <li>Chakra UI v3 — Theming (createSystem, tokens, semantic tokens, recipes) · <span>chakra-ui.com/docs/theming/overview</span></li>
    <li>Chakra UI — CLI (typegen, snippet, eject) · <span>chakra-ui.com/docs/get-started/cli</span></li>
    <li>Chakra UI — MCP Server oficial · <span>npmjs.com/package/@chakra-ui/react-mcp</span></li>
    <li>Supernova — Pricing e recursos do plano Free · <span>supernova.io/pricing</span></li>
    <li>Supernova — Documentação (data sources Figma e Storybook) · <span>learn.supernova.io</span></li>
    <li>Tokens Studio for Figma — sync de tokens via Git · <span>tokens.studio</span></li>
    <li>PostHog — Pricing (free tier) · <span>posthog.com/pricing</span></li>
    <li>PostHog — biblioteca React/JS · <span>posthog.com/docs/libraries/react</span></li>
    <li>Figma — Design Systems and AI: Why MCP Servers Are the Unlock · <span>figma.com/blog/design-systems-ai-mcp</span></li>
    <li>Design Token SSOT: Figma or Code? — Design Systems Collective · <span>designsystemscollective.com</span></li>
    <li>Figma is not the source of truth for design tokens — Artur Sopelnik · <span>artursopelnik.de</span></li>
  </ul>
  <p class="fine">Documento gerado a partir do desenho de processo validado com a equipe de UX da GB Agritech, da v1.0
    (Processo de UX Code-First) e de verificação das capacidades das ferramentas citadas. Dados de planos gratuitos
    conferidos em junho/2026 — sujeitos a alteração pelos fornecedores. Ilustrações no estilo Xiaohei (traço à mão,
    fundo branco) desenhadas especialmente para esta edição.</p>
  <div class="pagefoot"><span>Confidencial — uso interno GB Agritech</span></div>
</section>
"""

# substitui marcadores [[FIG:key|legenda]] pelas figuras
def _figrepl(m):
    return figure(m.group(1), m.group(2))
DOC = re.sub(r"\[\[FIG:([\w-]+)\|([^\]]+)\]\]", _figrepl, DOC)

CSS = """
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; }
body { font-family: 'Outfit', system-ui, sans-serif; color: #1c2522; font-size: 11pt; line-height: 1.5; }
.page { position: relative; width: 210mm; min-height: 297mm; padding: 22mm 20mm 24mm; page-break-after: always; }
.page:last-child { page-break-after: auto; }

.brandbar { display:flex; align-items:center; justify-content:space-between;
  margin:-22mm -20mm 14mm; padding:10mm 20mm 7mm;
  background:linear-gradient(105deg,#047857,#059669 60%,#10b981);
  color:#eafff6; }
.logo { font-weight:700; font-size:15pt; letter-spacing:.5px; }
.brandsub { font-size:9pt; letter-spacing:2px; opacity:.9; text-transform:uppercase; }

.cover { display:flex; flex-direction:column; }
.eyebrow { color:#059669; font-weight:600; letter-spacing:1px; text-transform:uppercase; font-size:9.5pt; margin:6mm 0 2mm; }
.cover-title { font-size:40pt; line-height:1.05; font-weight:700; color:#0f2e22; margin:0 0 4mm; letter-spacing:-1px; }
.cover-lead { font-size:15pt; color:#047857; font-weight:600; margin:0 0 5mm; }
.cover-desc { font-size:11.5pt; color:#3a4a44; max-width:150mm; margin:0 0 6mm; }
table.meta { border-collapse:collapse; margin-top:8mm; font-size:10pt; }
table.meta th { text-align:left; color:#059669; font-weight:600; padding:2.5mm 8mm 2.5mm 0; vertical-align:top; white-space:nowrap; }
table.meta td { padding:2.5mm 0; border-bottom:1px solid #e8efe9; }

.ph { border-bottom:2px solid #059669; padding-bottom:3mm; margin-bottom:6mm; }
.ph .sec { display:inline-block; background:#ecfdf5; color:#047857; font-weight:600; font-size:8.5pt;
  letter-spacing:1.5px; text-transform:uppercase; padding:1mm 3mm; border-radius:3px; }
.ph h2 { margin:2mm 0 0; font-size:21pt; color:#0f2e22; font-weight:700; letter-spacing:-.5px; }
h3 { color:#065f46; font-size:13pt; margin:7mm 0 2mm; font-weight:600; }
p { margin:0 0 3mm; }
em { color:#047857; font-style:italic; }
code { font-family:'JetBrains Mono','SFMono-Regular',Consolas,monospace; font-size:9.2pt;
  background:#f1f6f2; color:#0b6b4f; padding:.3mm 1.4mm; border-radius:3px; }

ul { margin:0 0 3mm; padding-left:6mm; }
li { margin:0 0 1.8mm; }
ul.pillars li { list-style:none; position:relative; padding-left:5mm; margin-bottom:2.4mm; }
ul.pillars li::before { content:"◆"; color:#10b981; position:absolute; left:0; font-size:8pt; top:1.2mm; }
.tag { background:#fde68a; color:#92400e; font-size:7.5pt; font-weight:700; letter-spacing:.5px;
  padding:.4mm 1.6mm; border-radius:3px; vertical-align:middle; }

table.t { width:100%; border-collapse:collapse; margin:4mm 0 5mm; font-size:9.6pt; }
table.t thead th { background:#065f46; color:#eafff6; text-align:left; padding:2.4mm 3mm; font-weight:600; font-size:9pt; }
table.t td { padding:2.4mm 3mm; border-bottom:1px solid #e6efe8; vertical-align:top; }
table.t tbody tr:nth-child(even){ background:#f8fbf9; }
table.t.gloss td:first-child { font-weight:600; color:#065f46; white-space:nowrap; width:40mm; }

.callout { background:#f0fdf8; border-left:4px solid #10b981; padding:3.5mm 4mm; border-radius:0 4px 4px 0;
  margin:4mm 0; font-size:10pt; color:#21413a; }
.callout.danger { background:#fff5f3; border-left-color:#e5533c; color:#5a2419; }
.fine { font-size:9pt; color:#5a6b64; }

pre.arch { background:#0f2e22; color:#c9f5e2; font-family:'JetBrains Mono',Consolas,monospace; font-size:8.4pt;
  line-height:1.55; padding:5mm; border-radius:6px; overflow:hidden; white-space:pre; margin:4mm 0; }

figure.xh { margin:5mm 0; padding:3mm; background:#fff; border:1px solid #e3ece5; border-radius:8px;
  page-break-inside:avoid; box-shadow:0 1px 0 #eef4f0; }
figure.xh svg { width:100%; height:auto; display:block; }
figure.xh figcaption { font-size:9pt; color:#5a6b64; text-align:center; margin-top:2mm; font-style:italic; }

.pagefoot { position:absolute; left:20mm; right:20mm; bottom:12mm; display:flex; justify-content:space-between;
  border-top:1px solid #e8efe9; padding-top:2.5mm; font-size:8pt; color:#8a988f; }
"""

HTML = ("<!doctype html><html lang=\"pt-BR\"><head><meta charset=\"utf-8\">"
        "<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">"
        "<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>"
        "<link href=\"https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&"
        "family=Caveat:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap\" rel=\"stylesheet\">"
        f"<style>{CSS}</style></head><body>{DOC}</body></html>")

with open(os.path.join(HERE, "_doc.html"), "w", encoding="utf-8") as f:
    f.write(HTML)
print("HTML gerado: _doc.html")
