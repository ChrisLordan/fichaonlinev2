/* =========================================================
   STORAGE — Persistência em cookies com split e compressão
   Limite: ~4KB por cookie, ~50 cookies por domínio
   Estratégia: índice central + 1-3 cookies por ficha
   ========================================================= */

const INDEX_KEY = "fm_chars_index";
const ACTIVE_KEY = "fm_active";
const CHAR_PREFIX = "fm_char_";
const SCHEMA_VERSION = "2.5";

/* ---------- Helpers básicos ---------- */

function setCookie(name, value, days = 365) {
  const maxAge = days * 24 * 60 * 60;
  const encoded = encodeURIComponent(value);
  const totalSize = name.length + 1 + encoded.length;
  if (totalSize > 4096) {
    console.warn(`[fm][cookie] OVERFLOW: ${name} = ${totalSize} bytes (limite 4096)`);
  }
  document.cookie = `${name}=${encoded}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function getCookie(name) {
  const target = `${name}=`;
  const parts = document.cookie.split(";");
  for (let p of parts) {
    p = p.trim();
    if (p.startsWith(target)) {
      return decodeURIComponent(p.slice(target.length));
    }
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

/* ---------- Compressão / descompressão ----------
   Implementação simples baseada em LZ-String estilo JSON.
   Para simplicidade, usamos um compressor nativo:
   - Repetições de strings (chaves) são comuns em JSON.
   - Como ~4KB é o limite, manteremos compactação leve.
*/

const KEY_MAP = {
  '"identificacao":': '"\u0001":',
  '"aspectos":': '"\u0002":',
  '"aparencia":': '"\u0003":',
  '"atributos":': '"\u0004":',
  '"pontos":': '"\u0005":',
  '"defesa":': '"\u0006":',
  '"pericias":': '"\u0007":',
  '"testesResistencia":': '"\u0008":',
  '"ataques":': '"\u0009":',
  '"tecnica":': '"\u000a":',
  '"cd":': '"\u000b":',
  '"origemDetalhes":': '"\u000c":',
  '"especializacaoDetalhes":': '"\u000d":',
  '"treinamentos":': '"\u000e":',
  '"aptidoes":': '"\u000f":',
  '"talentos":': '"\u0010":',
  '"inventario":': '"\u0011":',
  '"apostilas":': '"\u0012":',
  '"anotacoes":': '"\u0013":',
  '"invocacoes":': '"\u0014":',
  '"combateEstado":': '"\u0015":',
  '"forca":': '"\u0016":',
  '"destreza":': '"\u0017":',
  '"constituicao":': '"\u0018":',
  '"inteligencia":': '"\u0019":',
  '"sabedoria":': '"\u001a":',
  '"presenca":': '"\u001b":',
  '"nome":': '"\u001c":',
  '"nivel":': '"\u001d":',
  '"origem":': '"\u001e":',
  '"especializacao":': '"\u001f":',
  '"pvMax":': '"\u0020":',
  '"pvAtual":': '"\u0021":',
  '"peMax":': '"\u0022":',
  '"peAtual":': '"\u0023":',
  '"treino":': '"\u0024":',
  '"mestre":': '"\u0025":',
  '"outros":': '"\u0026":',
  '"bonus":': '"\u0027":',
  '"dano":': '"\u0028":',
  '"descricao":': '"\u0029":',
  '"true":': '"\u002a"',
  '"false":': '"\u002b"',
};

const KEY_MAP_REV = Object.fromEntries(
  Object.entries(KEY_MAP).map(([k, v]) => [v, k])
);

function compact(json) {
  let s = json;
  for (const [k, v] of Object.entries(KEY_MAP)) {
    s = s.split(k).join(v);
  }
  return s;
}

function uncompact(s) {
  let out = s;
  for (const [k, v] of Object.entries(KEY_MAP_REV)) {
    out = out.split(k).join(v);
  }
  return out;
}

/* ---------- API de caracteres ---------- */

export function listChars() {
  const raw = getCookie(INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn("fm: index corrompido, resetando", e);
    setCookie(INDEX_KEY, "[]");
    return [];
  }
}

function writeIndex(arr) {
  setCookie(INDEX_KEY, JSON.stringify(arr));
}

export function getActiveId() {
  const raw = getCookie(ACTIVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw).id || null;
  } catch {
    return null;
  }
}

export function setActiveId(id) {
  setCookie(ACTIVE_KEY, JSON.stringify({ id }));
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function readChunked(id) {
  const metaRaw = getCookie(CHAR_PREFIX + id + "_meta");
  if (!metaRaw) return null;
  let meta;
  try {
    meta = JSON.parse(metaRaw);
  } catch {
    return null;
  }
  const parts = [];
  for (let i = 0; i < meta.parts; i++) {
    const raw = getCookie(CHAR_PREFIX + id + "_p" + i);
    if (raw == null) return null;
    parts.push(raw);
  }
  const joined = parts.join("");
  try {
    return JSON.parse(uncompact(joined));
  } catch (e) {
    console.error("fm: falha ao decodificar ficha", id, e);
    return null;
  }
}

function writeChunked(id, data) {
  const json = JSON.stringify(data);
  const compressed = compact(json);

  // Cada cookie aceita ~4KB. URL-encoded expande ~1.5x e UTF-8 multi-byte até 3x.
  // 1500 chars comprimidos = ~2250 URL-encoded, com margem para nome do cookie (~25 chars).
  const CHUNK = 1500;
  const parts = [];
  for (let i = 0; i < compressed.length; i += CHUNK) {
    parts.push(compressed.slice(i, i + CHUNK));
  }

  // Limpa chunks antigos (até 60 chunks * 1500 = 90KB de dados)
  for (let i = 0; i < 60; i++) {
    deleteCookie(CHAR_PREFIX + id + "_p" + i);
  }

  for (let i = 0; i < parts.length; i++) {
    setCookie(CHAR_PREFIX + id + "_p" + i, parts[i]);
  }

  setCookie(
    CHAR_PREFIX + id + "_meta",
    JSON.stringify({
      v: SCHEMA_VERSION,
      parts: parts.length,
      size: compressed.length,
      updatedAt: Date.now(),
    })
  );
}

export function getChar(id) {
  const data = readChunked(id);
  if (!data) return null;
  if (!data.v) data.v = SCHEMA_VERSION;
  return data;
}

export function saveChar(data) {
  if (!data.id) data.id = makeId();
  data.v = SCHEMA_VERSION;
  data.updatedAt = Date.now();
  writeChunked(data.id, data);

  // Atualiza índice
  const idx = listChars();
  const idf = data.identificacao || {};
  const entry = {
    id: data.id,
    nome: idf.nome || "Sem nome",
    nivel: idf.nivel || 1,
    origem: idf.origem || "—",
    especializacao: idf.especializacao || "—",
    updatedAt: data.updatedAt,
  };
  const existing = idx.findIndex((c) => c.id === data.id);
  if (existing >= 0) idx[existing] = entry;
  else idx.push(entry);
  writeIndex(idx);
  return data.id;
}

export function deleteChar(id) {
  // Remove todos os chunks
  for (let i = 0; i < 20; i++) {
    deleteCookie(CHAR_PREFIX + id + "_p" + i);
  }
  deleteCookie(CHAR_PREFIX + id + "_meta");

  const idx = listChars().filter((c) => c.id !== id);
  writeIndex(idx);

  if (getActiveId() === id) setActiveId(null);
}

export function duplicateChar(id) {
  const original = getChar(id);
  if (!original) return null;
  const copy = JSON.parse(JSON.stringify(original));
  copy.id = makeId();
  copy.identificacao = copy.identificacao || {};
  copy.identificacao.nome = (copy.identificacao.nome || "Ficha") + " (cópia)";
  return saveChar(copy);
}

export function createEmpty() {
  return {
    v: SCHEMA_VERSION,
    id: makeId(),
    identificacao: {
      nome: "",
      jogador: "",
      campanha: "",
      nivel: 1,
      maestria: 2,
      exp: 0,
      origem: "Inato",
      especializacao: "",
      especializacoes: [],
      clan: "",
      tecnica: "",
      grau: "4°",
    },
    pontosAtributoGastos: 0, // conta pontos gastos de level-up (+2 a cada 4 nv)
    aspectos: {
      personalidade: "",
      ideais: "",
      ligacoes: "",
      complicacoes: "",
      dominioInato: "",
    },
    aparencia: {
      imagemBase64: "",
      idade: "",
      altura: "",
      peso: "",
      genero: "",
      cabelos: "",
      olhos: "",
      pele: "",
      roupas: "",
      marcas: "",
    },
    atributos: {
      forca: 10,
      destreza: 10,
      constituicao: 10,
      inteligencia: 10,
      sabedoria: 10,
      presenca: 10,
    },
    pontos: {
      pvMax: 10,
      pvAtual: 10,
      pvTemp: 0,
      peMax: 5,
      peAtual: 5,
      peTemp: 0,
      integridadeMax: 10,
      integridadeAtual: 10,
    },
    defesa: {
      valor: 10,
      equipamento: 0,
      outros: 0,
      deslocamento: 9,
      iniciativaOutros: 0,
      deslocamentoOutros: 0,
    },
    pericias: {},
    testesResistencia: {},
    ataques: [
      { nome: "Corpo-a-corpo", atributo: "forca", bonus: 0, dano: "1d8", critico: 20, tipo: "Ct", alcance: "1,5m", propriedades: "" },
      { nome: "À distância", atributo: "destreza", bonus: 0, dano: "1d6", critico: 20, tipo: "Pf", alcance: "9m", propriedades: "" },
      { nome: "Amaldiçoado", atributo: "presenca", bonus: 0, dano: "1d8", critico: 20, tipo: "En", alcance: "9m", propriedades: "" },
    ],
    tecnica: {
      nome: "",
      atributoChave: "presenca",
      descricao: "",
      maxTecnicas: 1,
      feiticos: [],
      expansaoDominio: { nome: "", tipo: "", tecnicaGarantida: false, descricao: "" },
    },
    cd: {
      especializacao: { atributo: "forca", outros: 0 },
      amaldicoado: { atributo: "presenca", outros: 0 },
    },
    origemDetalhes: { caracteristicas: [] },
    especializacaoDetalhes: { estilo: "", habilidades: [], estilos: [] },
    treinamentos: {
      compreensao: [false, false, false, false, false],
      potencialFisico: [false, false, false, false, false],
      controleEnergia: [false, false, false, false, false],
      treinoDominios: [false, false, false, false, false],
      treinoResistencia: [false, false, false, false, false],
      energiaReversa: [false, false, false, false, false],
    },
    aptidoes: {
      aura: 0,
      controle: 0,
      dominio: 0,
      barreira: 0,
      energiaReversa: 0,
      completas: { aura: false, controle: false, dominio: false, barreira: false, energiaReversa: false },
    },
    talentos: [],
    inventario: { itens: [], limite: 8, ocupado: 0 },
    apostilas: { idiomas: "", ferramentas: "", outros: "" },
    anotacoes: { caracteristicas: "", anotacoes: "", inspiracao: false },
    invocacoes: [],
    combateEstado: { empolgacao: 0, pontosPreparo: 0, exaustao: 0, condicoes: [] },
  };
}

/* ---------- Exportar / Importar JSON manual ---------- */

export function exportChar(id) {
  const data = getChar(id);
  if (!data) return null;
  const json = JSON.stringify(data, null, 2);
  return json;
}

export function importChar(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data.identificacao) data.identificacao = {};
    if (!data.id) data.id = makeId();
    // Marcar como importado
    data.identificacao._imported = true;
    return saveChar(data);
  } catch (e) {
    console.error("fm: import falhou", e);
    return null;
  }
}

/* ---------- Info de uso ---------- */

export function storageInfo() {
  const idx = listChars();
  let totalSize = 0;
  let count = 0;
  for (const c of idx) {
    for (let i = 0; i < 20; i++) {
      const raw = getCookie(CHAR_PREFIX + c.id + "_p" + i);
      if (raw) {
        totalSize += raw.length;
        count++;
      } else break;
    }
  }
  return {
    fichas: idx.length,
    cookies: count,
    bytes: totalSize,
    kb: (totalSize / 1024).toFixed(1),
  };
}
