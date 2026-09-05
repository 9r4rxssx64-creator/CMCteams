# 04 — DESIGN / UX (mesures)

Non mesuré dans cette passe (l'audit du domaine a porté sur l'infra, la surveillance et la sécurité). Ce qui existe et a tourné : `audit:stability` CMCteams — 0 FAIL 0 WARN (render 0 au repos, mutations DOM topbar 24/12/0 sur 6 s ; accueil / admin / monplanning).

À faire (CI, réseau ouvert) : `audit-live.yml` (captures d'écran par surface, artifact 30 j), `seo-audit.yml` (PageSpeed, input `https://kd-mc.com`), `test:a11y` (axe-core, dans `test:ci`). Aucun score n'est estimé ici.
