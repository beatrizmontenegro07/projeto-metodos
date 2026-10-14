const { Paciente } = require('../paciente');
const { Telefone } = require('../telefone');

const OID_CPF = 'urn:oid:2.16.840.1.113883.13.236';
const OID_CNS = 'urn:oid:2.16.840.1.113883.13.237';

class MapeadorFhirPaciente {
  /**
   * Converte uma entidade de domínio Paciente para um recurso FHIR R4 Patient.
   * @param {Paciente} paciente
   * @returns {Object} Recurso FHIR R4 Patient
   */
  static paraFhir(paciente) {
    const identifier = [];

    if (paciente.cpf) {
      identifier.push({
        system: OID_CPF,
        value: paciente.cpf,
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'TAX',
              display: 'CPF',
            },
          ],
        },
      });
    }

    if (paciente.cns) {
      identifier.push({
        system: OID_CNS,
        value: paciente.cns,
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'HC',
              display: 'CNS',
            },
          ],
        },
      });
    }

    const telecom = [];
    if (Array.isArray(paciente.telefones)) {
      paciente.telefones.forEach((telefone) => {
        telecom.push({
          system: 'phone',
          value: telefone.numero,
          use: telefone.tipo || 'mobile',
        });
      });
    }

    if (paciente.email) {
      telecom.push({
        system: 'email',
        value: paciente.email,
      });
    }

    const partesNome = paciente.nomeCompleto.trim().split(/\s+/);
    const dado = partesNome.slice(0, -1).join(' ') || partesNome[0];
    const familia = partesNome.length > 1 ? partesNome[partesNome.length - 1] : undefined;

    const fhirResource = {
      resourceType: 'Patient',
      id: String(paciente.id),
      active: paciente.ativo,
      name: [
        {
          use: 'official',
          text: paciente.nomeCompleto,
          family: familia,
          given: [dado],
        },
      ],
      telecom,
      gender: paciente.genero,
      birthDate: paciente.dataNascimento,
      identifier,
    };

    if (paciente.endereco) {
      const linha = [paciente.endereco.logradouro, paciente.endereco.numero, paciente.endereco.complemento]
        .filter(Boolean)
        .join(', ');

      fhirResource.address = [
        {
          use: 'home',
          line: [linha],
          district: paciente.endereco.bairro,
          city: paciente.endereco.cidade,
          state: paciente.endereco.uf,
          postalCode: paciente.endereco.cep,
        },
      ];
    }

    return fhirResource;
  }

  /**
   * Converte um recurso FHIR R4 Patient para uma entidade de domínio Paciente.
   * @param {Object} fhir
   * @returns {Paciente}
   */
  static deFhir(fhir) {
    if (!fhir || fhir.resourceType !== 'Patient') {
      throw new Error('Recurso FHIR inválido: deve ser do tipo Patient.');
    }

    const cpfId = (fhir.identifier || []).find(
      (id) => id.system === OID_CPF || id.type?.coding?.some((c) => c.code === 'TAX'),
    );
    const cnsId = (fhir.identifier || []).find(
      (id) => id.system === OID_CNS || id.type?.coding?.some((c) => c.code === 'HC'),
    );

    const nomeOficial = (fhir.name || [])[0] || {};
    const telefones = (fhir.telecom || [])
      .filter((t) => t.system === 'phone')
      .map((t) => new Telefone({ numero: t.value, tipo: t.use || 'mobile' }));
    const emailObj = (fhir.telecom || []).find((t) => t.system === 'email');

    let endereco;
    if (fhir.address && fhir.address.length > 0) {
      const addr = fhir.address[0];
      endereco = {
        logradouro: addr.line?.[0] || '',
        bairro: addr.district || '',
        cidade: addr.city || '',
        uf: addr.state || '',
        cep: addr.postalCode || '',
      };
    }

    return new Paciente({
      id: fhir.id ? Number(fhir.id) || fhir.id : undefined,
      cpf: cpfId ? cpfId.value : undefined,
      cns: cnsId ? cnsId.value : undefined,
      nomeCompleto: nomeOficial.text || [nomeOficial.given?.join(' '), nomeOficial.family].filter(Boolean).join(' '),
      dataNascimento: fhir.birthDate,
      genero: fhir.gender,
      telefones,
      email: emailObj ? emailObj.value : undefined,
      endereco,
      ativo: fhir.active !== undefined ? fhir.active : true,
    });
  }
}

module.exports = { MapeadorFhirPaciente, OID_CPF, OID_CNS };

