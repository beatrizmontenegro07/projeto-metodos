const { Profissional } = require('../profissional');
const { Especialidade } = require('../especialidade');

class MapeadorFhirProfissional {
  /**
   * Converte uma entidade de domínio Profissional para um recurso FHIR R4 Practitioner.
   * @param {Profissional} profissional
   * @returns {Object} Recurso FHIR R4 Practitioner
   */
  static paraFhir(profissional) {
    const identifier = [];

    if (profissional.numeroRegistro) {
      const displayConselho = profissional.ufRegistro
        ? `${profissional.conselho}-${profissional.ufRegistro}`
        : profissional.conselho;

      identifier.push({
        system: `http://portal.cfm.org.br/${profissional.conselho.toLowerCase()}`,
        value: profissional.numeroRegistro,
        assigner: {
          display: displayConselho,
        },
      });
    }

    if (profissional.cpf) {
      identifier.push({
        system: 'urn:oid:2.16.840.1.113883.13.236',
        value: profissional.cpf,
      });
    }

    const qualification = (profissional.especialidades || []).map((esp) => {
      const item = {
        code: {
          text: esp.nome,
        },
      };
      if (esp.rqe) {
        item.identifier = [
          {
            system: 'http://portal.cfm.org.br/rqe',
            value: esp.rqe,
          },
        ];
      }
      return item;
    });

    return {
      resourceType: 'Practitioner',
      id: String(profissional.id),
      active: profissional.ativo,
      name: [
        {
          use: 'official',
          text: profissional.nomeCompleto,
        },
      ],
      identifier,
      qualification,
    };
  }

  /**
   * Converte um recurso FHIR R4 Practitioner para uma entidade de domínio Profissional.
   * @param {Object} fhir
   * @returns {Profissional}
   */
  static deFhir(fhir) {
    if (!fhir || fhir.resourceType !== 'Practitioner') {
      throw new Error('Recurso FHIR inválido: deve ser do tipo Practitioner.');
    }

    const nomeOficial = (fhir.name || [])[0] || {};
    const registroId = (fhir.identifier || []).find((id) =>
      id.assigner?.display || id.system?.includes('cfm.org.br') || id.system?.includes('coren'),
    );

    let conselho = 'CRM';
    let ufRegistro;
    let numeroRegistro = registroId ? registroId.value : '';

    if (registroId?.assigner?.display) {
      const partes = registroId.assigner.display.split('-');
      conselho = partes[0] || 'CRM';
      ufRegistro = partes[1];
    }

    const especialidades = (fhir.qualification || [])
      .map((q) => {
        const rqeId = q.identifier?.find((id) => id.system?.includes('rqe'));
        return new Especialidade({
          nome: q.code?.text,
          rqe: rqeId ? rqeId.value : null,
        });
      })
      .filter((e) => Boolean(e.nome));

    const cpfId = (fhir.identifier || []).find((id) => id.system?.includes('113883.13.236'));

    return new Profissional({
      id: fhir.id ? Number(fhir.id) || fhir.id : undefined,
      nomeCompleto: nomeOficial.text || '',
      cpf: cpfId ? cpfId.value : undefined,
      conselho,
      numeroRegistro,
      ufRegistro,
      especialidades,
      ativo: fhir.active !== undefined ? fhir.active : true,
    });
  }
}

module.exports = { MapeadorFhirProfissional };

