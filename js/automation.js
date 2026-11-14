import { modifier } from './rules.js';
import { validateLevel, clampResource } from './validation.js';

// Conferido diretamente no PDF v2.5.2, p.90. O repositório de referência
// usa atributoChavePadrao para PE; o livro exige o atributo da TÉCNICA.
export const SPECIALIZATIONS = {
  'Lutador': { initial:12, fixed:6, die:10, energy:4, page:49 },
  'Especialista em Combate': { initial:12, fixed:6, die:10, energy:4, page:63 },
  'Especialista em Técnica': { initial:10, fixed:5, die:8, energy:6, technique:true, page:78 },
  'Controlador': { initial:10, fixed:5, die:8, energy:5, technique:true, page:90 },
  'Suporte': { initial:10, fixed:5, die:8, energy:5, technique:true, page:102 },
  'Restringido': { initial:16, fixed:7, die:12, energy:0, stamina:4, page:114 },
};

export function calculateSpecialization(sheet) {
  const spec = SPECIALIZATIONS[sheet.specialization.name];
  if (!spec) return null;
  const level = validateLevel(sheet.information.level);
  const score = key => Number(sheet.attributes.values[key]) + Number(sheet.attributes.bonuses[key] || 0);
  const con = modifier(score('constituicao'));
  const techniqueAttribute = sheet.automation?.techniqueAttribute;
  const valid = ['forca','destreza','constituicao','inteligencia','sabedoria','presenca'].includes(techniqueAttribute);
  return {
    hp: spec.initial + con + (level - 1) * (spec.fixed + con),
    energy: spec.technique ? (valid ? spec.energy * level + modifier(score(techniqueAttribute)) : null) : spec.energy * level,
    stamina: (spec.stamina || 0) * level,
    hitDice: `${level}d${spec.die}`,
    summons: 2 + [3,6,9,10,12,15,18].filter(n => level >= n).length,
    extraCommands: [6,12,18].filter(n => level >= n).length,
    source: `Livro v2.5.2, p.${spec.page}; PV subsequentes pelo valor fixo escolhido.`
  };
}

export function calculateController(sheet) {
  return sheet.specialization.name === 'Controlador' ? calculateSpecialization(sheet) : null;
}

export function applyAutomation(sheet) {
  if (!sheet.automation?.enabled) return;
  const result = calculateSpecialization(sheet);
  if (!result) return;
  sheet.resources.hpMax = result.hp;
  sheet.resources.hpCurrent = clampResource(sheet.resources.hpCurrent, result.hp);
  if (result.energy !== null) {
    sheet.resources.energyMax = result.energy;
    sheet.resources.energyCurrent = clampResource(sheet.resources.energyCurrent, result.energy);
  }
  sheet.resources.staminaMax = result.stamina;
  sheet.resources.staminaCurrent = clampResource(sheet.resources.staminaCurrent, result.stamina);
  sheet.specialization.hitDice = result.hitDice;
}
