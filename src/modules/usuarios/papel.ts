export const PAPEIS = ["ADMINISTRADOR", "RECEPCIONISTA", "MEDICO", "PACIENTE"] as const;

export type Papel = (typeof PAPEIS)[number];

export function ehPapelValido(valor: unknown): valor is Papel {
  return PAPEIS.includes(valor as Papel);
}
