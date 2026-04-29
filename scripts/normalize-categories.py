#!/usr/bin/env python3
"""
Normalize rule categories from 828 free-form strings to 14 canonical RuleCategory values.
Writes the result back to data/rules.json in-place.
"""
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
RULES_PATH = ROOT / 'data' / 'rules.json'

CANONICAL = {
    'biometric_data', 'prohibited_uses', 'impact_assessment', 'human_review',
    'data_rights', 'transparency', 'synthetic_media', 'enforcement',
    'risk_classification', 'training_data', 'foundation_models', 'consent',
    'employment_ai', 'general_governance',
}

# (keywords list, canonical_value) — first match wins, tested on lowercased input
MAPPING = [
    (['biometric', 'facial recognition', 'fingerprint', 'retina scan', 'iris scan',
      'face recognition', 'face id', 'liveness detection'],
     'biometric_data'),

    (['foundation model', 'gpai', 'general purpose ai', 'general-purpose ai',
      'large language model', 'llm ', ' llm', 'frontier model', 'advanced ai model',
      'model provider', 'model developer', 'ai model developer'],
     'foundation_models'),

    (['employment', 'worker', 'workplace', 'hiring', 'recruitment', 'job applicant',
      'labor', 'labour', 'hr ai', 'human resources', 'automated hiring',
      'algorithmic management', 'employee monitoring'],
     'employment_ai'),

    (['deepfake', 'deep fake', 'synthetic media', 'ai-generated content', 'ai generated content',
      'content labeling', 'content labelling', 'content label', 'watermark',
      'disinformation', 'misinformation', 'political advertising', 'election content',
      'election deepfake', 'political ad', 'ai disclosure / political', 'ai labeling',
      'ai labelling', 'ai content label', 'synthetic content', 'generated media',
      'performer rights', 'performer-rights', 'voice cloning', 'likeness protection',
      'digital persona', 'digital likeness', 'impersonation', 'virtual performer',
      'ai voice', 'image synthesis', 'csam', 'ncii', 'non-consensual', 'intimate image',
      'right of publicity', 'posthumous rights', 'digital impersonation',
      'ai-generated disinformation', 'ai-generated csam', 'ai content disclosure',
      'ai-generated content disclosure', 'ai minor protection / dark patterns'],
     'synthetic_media'),

    (['prohibited practice', 'prohibited use', 'prohibited act', 'prohibited ai',
      'banned use', 'forbidden', 'unlawful use', 'proscribed', 'social scoring',
      'social credit', 'predictive policing', 'real-time biometric', 'mass surveillance',
      'dark pattern', 'foreign adversary', 'national security prohibition',
      'ai-generated csam prohibition'],
     'prohibited_uses'),

    (['impact assessment', 'dpia', ' pia ', 'fria', 'conformity assessment',
      'bias audit', 'algorithmic audit', 'algorithmic-audit', 'audit requirement',
      'pre-deployment assessment', 'safety evaluation', 'security assessment',
      'model evaluation', 'pre-deployment review', 'annual audit'],
     'impact_assessment'),

    (['human review', 'human oversight', 'human in the loop', 'human-in-the-loop',
      'right to appeal', 'right to contest', 'right to challenge', 'right to explanation',
      'meaningful human control', 'human intervention', 'automated decision appeal',
      'explainability', 'human_review', 'human control', 'right to human'],
     'human_review'),

    (['risk assessment', 'risk classification', 'risk tier', 'risk categor',
      'high-risk ai', 'high risk ai', 'risk level', 'safety tier', 'risk-based',
      'risk framework', 'tiered regulation', 'risk score', 'risk class'],
     'risk_classification'),

    (['data subject right', 'individual rights', 'consumer rights protection',
      'user rights', 'right to access', 'right to deletion', 'right to erasure',
      'right to portability', 'right to correction', 'right to object',
      'opt-out right', 'access right', 'deletion right', 'data portability',
      'rectification', 'data rights', 'data_rights'],
     'data_rights'),

    (['opt-in', 'informed consent', 'explicit consent', 'user consent',
      'data consent', 'consent requirement', 'consent mechanism', 'consent-based'],
     'consent'),

    (['transparency', 'disclosure requirement', 'notice requirement',
      'adverse action notif', 'adverse-action-notif', 'chatbot disclosure',
      'identity disclosure', 'labeling requirement', 'labelling requirement',
      'documentation requirement', 'reporting requirement', 'label requirement',
      'ai disclosure', 'transparency and notice', 'transparency-notice',
      'transparency-disclosure', 'transparency / training', 'right to know',
      'training data documentation', 'training data disclosure', 'public disclosure',
      'government accountability'],
     'transparency'),

    (['enforcement', 'penalty', 'penalties', 'fine ', ' fine', 'fines',
      'liability', 'civil damages', 'criminal liability', 'sanction',
      'remedies', 'market surveillance', 'enforcement mechanism',
      'safe harbor', 'legal liability', 'developer liability', 'private right of action',
      'enforcement/market', 'enforcement and remedies', 'enforcement-and-remedies',
      'data broker enforcement', 'ai enforcement'],
     'enforcement'),

    (['training data', 'training dataset', 'model training data', 'data quality',
      'data provenance', 'data accuracy', 'data poisoning', 'data governance',
      'data security', 'data processing', 'cross-border data', 'data localization',
      'data sharing', 'data access', 'data broker', 'special categor',
      'sensitive data', 'personal data', 'personal information', 'privacy',
      'data protection', "children's data", 'child data', 'medical data',
      'health data', 'healthcare data', 'financial data', 'smart contract',
      'data minimization', 'data processor', 'data controller',
      'data-processing', 'direct marketing', 'data_rights' + 'x',
      'contract fairness - data', 'data access - '],
     'training_data'),
]

def normalize(cat: str) -> str:
    if cat in CANONICAL:
        return cat
    c = cat.lower().strip()
    for keywords, canonical in MAPPING:
        for kw in keywords:
            if kw in c:
                return canonical
    return 'general_governance'

def main():
    with open(RULES_PATH) as f:
        rules = json.load(f)

    before: dict[str, int] = {}
    after: dict[str, int] = {}
    changed = 0

    for rule in rules:
        old = rule.get('category', '')
        new = normalize(old)
        before[old] = before.get(old, 0) + 1
        after[new] = after.get(new, 0) + 1
        if old != new:
            rule['category'] = new
            changed += 1

    print(f'Rules processed: {len(rules)}')
    print(f'Categories changed: {changed}')
    print(f'Distinct categories before: {len(before)}')
    print(f'Distinct categories after: {len(after)}')
    print()
    print('After distribution:')
    for k, v in sorted(after.items(), key=lambda x: -x[1]):
        print(f'  {v:4d}  {k}')

    with open(RULES_PATH, 'w') as f:
        json.dump(rules, f, indent=2, ensure_ascii=False)
    print(f'\nWrote {RULES_PATH}')

if __name__ == '__main__':
    main()
