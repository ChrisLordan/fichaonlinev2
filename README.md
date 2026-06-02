# Feiticeiros & Maldições — Ficha Online

Site estático e 100% offline para criação, edição e gerenciamento de fichas do RPG
**Feiticeiros & Maldições v2.5**. As fichas são salvas nos **cookies do navegador**
— sem servidor, sem banco de dados, sem login.

## Como usar

### Opção 1: abrir direto (file://)
Acesse `index.html` no navegador. Funciona na maioria dos casos.

### Opção 2: servidor local (recomendado)
Cookies podem ter comportamento diferente em `file://`. Use um servidor simples:

```bash
cd fichaonlinev2
python3 -m http.server 8765
```

Depois abra `http://localhost:8765/` no navegador.

Em Termux / Android, use:
```bash
cd /storage/emulated/0/Documents/fichaonlinev2
python3 -m http.server 8765
```

## Funcionalidades

- **Tela inicial** com dois botões: *Criar ficha* e *Acessar fichas*
- **Wizard de criação** com 6 passos (Identificação → Origem → Atributos →
  Especialização → Clã → Confirmar)
  - 3 métodos de atributo: Fixos, Compra (17pts), Rolagem (4d6 descarta menor)
- **Editor completo** com 10 abas:
  - Identificação, Aspectos, Atributos, Recursos (PV/PE/Integ./Estamina),
    Perícias & TR, Ataques & CDs, Técnica & Feitiços,
    Habilidades (sub-abas: Origem / Esp. / Talentos / Aptidões / Treinamentos),
    Inventário, Anotações
- **Modo Combate** com tracker de PV/PE, recursos de classe (Empolgação, Pontos
  de Preparo, Estamina, Exaustão), chips de Condições e painel de rolagem de
  dados (d4/d6/d8/d10/d12/d20/d100) com histórico
- **Invocações** com cards editáveis (Shikigami, Projeções, Animais, etc.)
- **Auto-save** com debounce de 400 ms e indicador visual
- **Exportar/Importar JSON** para backup e transferência entre dispositivos

## Persistência

- Cada ficha é serializada em JSON, **compactada por substituição de chaves
  repetidas** (mapa de até 43 chaves) e dividida em **chunks de 3500 chars**
  para caber no limite de 4KB por cookie
- Cada ficha usa tipicamente 1 cookie de dados + 1 cookie de metadados
- Suporta até ~50 fichas em um único navegador (limite do navegador)
- Faça **exportação periódica** em JSON para backup

## Estrutura

```
fichaonlinev2/
├── index.html
├── assets/
│   └── favicon.svg
├── css/
│   ├── base.css        # variáveis, tipografia, reset
│   ├── layout.css      # header, tabs, landing
│   ├── components.css  # botões, cards, inputs, modal, dice, …
│   └── print.css       # impressão A4
└── js/
    ├── app.js          # roteador hash + ciclo de vida
    ├── data/           # regras e cálculos puros
    │   ├── calculos.js
    │   ├── origens.js
    │   ├── clans.js
    │   ├── especializacoes.js
    │   ├── equipamentos.js
    │   ├── aptidoes.js
    │   └── pericias.js
    ├── storage/
    │   └── cookies.js  # persistência com split + compressão
    ├── ui/
    │   ├── toast.js
    │   ├── modais.js
    │   └── tabs.js
    └── sheets/
        ├── home.js
        ├── list.js
        ├── wizard.js
        ├── editor.js
        ├── combat.js
        └── summons.js
```

## Limitações conhecidas

- Cookies têm ~4 KB por entrada. Fichas com muitos feitiços/itens podem
  ser limitadas
- Cookies são por-domínio + por-navegador. Limpar cookies do navegador
  apaga todas as fichas — **use a exportação JSON para backup**
- Sem sincronização entre dispositivos/navegadores (use export/import)
- Sistema 100% client-side; nenhuma regra veta múltiplas janelas
  simultâneas no mesmo navegador

## Aviso

Feiticeiros & Maldições é um projeto de fãs para fãs, sem fins lucrativos.
Baseado na obra *Jujutsu Kaisen* de Gege Akutami.
