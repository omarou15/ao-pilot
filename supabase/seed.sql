-- Seed: DJM Corp company for beta testing
-- Address: 26 rue Berthollet, 94110 Arcueil
-- Contact: contact@djm-corp.fr / +33 6 29 76 30 29

INSERT INTO companies (name, siret, address, default_margin)
VALUES (
  'DJM Corp',
  '',
  '26 rue Berthollet, 94110 Arcueil',
  30.00
)
ON CONFLICT DO NOTHING;
