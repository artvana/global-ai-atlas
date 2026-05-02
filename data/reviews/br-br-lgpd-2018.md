# Brazil LGPD (Lei Geral de Proteção de Dados)
**ID**: `br-br-lgpd-2018`  
**TIER 1 — Comprehensive & Binding (full review required)**  

## ✅ Automated Checks — No Flags

## Database Claims

> Verify each field. The most consequential are marked ★.

| Field | Current Value |
|-------|--------------|
| ★ Status | `in_force` |
| ★ Instrument Binding | `True` |
| ★ Instrument Type | `statute` |
| ★ Scope | `comprehensive` |
| Enacted Date | `2018-08-14` |
| Effective Date | `2020-09-18` |
| Jurisdiction | `Brazil` |
| Legal Family | `hybrid` |
| Primary Category | `data_protection` |
| Who Regulated | `developers, deployers` |
| ★ Max Penalty | 2% of Brazil revenues per legal entity per infraction, capped at BRL 50M (~$9.5M USD) per infraction |
| Max Penalty (USD approx) | 9500000 |
| ★ Private Right of Action | `True` |
| Risk Classification System | `False` |
| Prohibited Categories | `False` |
| Impact Assessment Required | `True` |
| Human Review Right | `True` |
| AI Interaction Disclosure | `False` |
| Biometric Protection | `True` |
| Instrument Binding (again) | `True` |
| AI Specific | `False` |
| Rules Extracted | 8 |
| Official URL | https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm |
| Last Verified | 2026-04-27 |

## Summary (verify for accuracy)

Brazil's comprehensive data protection law (LGPD) establishes GDPR-aligned rights and obligations applicable to all data processing including AI systems. Article 20 grants data subjects the right to review decisions made solely by automated means and to request disclosure of the criteria and procedures used. ANPD has been actively enforcing since 2021.

## Key Obligations (verify completeness and accuracy)

- Article 20: data subjects may request human review of solely automated decisions and disclosure of criteria used
- Legal basis required for processing (10 lawful bases including consent and legitimate interest)
- Data subject rights: access, correction, deletion, portability, information about processing
- DPIAs required for high-risk processing
- Data breach notification to ANPD
- DPO appointment required for certain controllers

## Law Text (excerpt)

```
**Presid�ncia da Rep�blica****Secretaria-Geral****Subchefia para Assuntos Jur�dicos**

****







Disp�e sobre a prote��o de dados pessoais e altera a Lei n� 12.965, de 23 de abril de 2014 (Marco Civil da Internet).

Lei Geral de Prote��o de Dados Pessoais (LGPD).           

**O PRESIDENTE DA REP�BLICA** Fa�o saber que o Congresso Nacional decreta e eu sanciono a seguinte Lei:

CAP�TULO I  
DISPOSI��ES PRELIMINARES

Art. 1� Esta Lei disp�e sobre o tratamento de dados pessoais, inclusive nos meios digitais, por pessoa natural ou por pessoa jur�dica de direito p�blico ou privado, com o objetivo de proteger os direitos fundamentais de liberdade e de privacidade e o livre desenvolvimento da personalidade da pessoa natural.

Par�grafo �nico. As normas gerais contidas nesta Lei s�o de interesse nacional e devem ser observadas pela Uni�o, Estados, Distrito Federal e Munic�pios.            

Art. 2� A disciplina da prote��o de dados pessoais tem como fundamentos:

I - o respeito � privacidade;

II - a autodetermina��o informativa;

III - a liberdade de express�o, de informa��o, de comunica��o e de opini�o;

IV - a inviolabilidade da intimidade, da honra e da imagem;

V - o desenvolviment
…
```

---

## Corrections

> Fill in only fields that need to change. Leave blank if the current value is correct.
> After completing all corrections, set `review_complete: true`.

```yaml
id: br-br-lgpd-2018
review_complete: false
reviewed_by:
notes:

# Core legal determinations (★ fields above)
status:
instrument_binding:
instrument_type:
scope:
enacted_date:
effective_date:
legal_family:
max_penalty:
max_penalty_usd_approx:

# Provisions (true/false)
private_right_of_action:
risk_classification_system:
prohibited_categories:
impact_assessment_required:
human_review_right:
ai_interaction_disclosure:

# Free-text corrections
summary:
key_obligations_add:    # items to add (one per line, prefix with -)
key_obligations_remove: # items to remove (one per line, prefix with -)
notable:
```