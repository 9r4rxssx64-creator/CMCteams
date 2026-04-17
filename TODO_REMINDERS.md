# 🗓 TODO — Tâches à faire bientôt

> **Lecture obligatoire à chaque session par Claude.**
> Liste dynamique des choses à faire que Kevin a demandées en cours mais pas encore exécutées.

---

## 🔴 PRIORITÉ CRITIQUE

### 1. Constitution monégasque dans l'app
**Demande Kevin (2026-04-17)** :
> "Intègre la constitution monégasque à l'app dans sa base de données et en consultation comme la convention"

**Action** : ajouter dans vConvention un onglet "Constitution" avec les articles clés de la Constitution de Monaco (1962, révisée 2002). Format : même structure que CONVENTION.articles.

---

## 🟡 PRIORITÉ HAUTE

### 2. Nettoyage des projets Vercel
**Demande Kevin (2026-04-16)** : supprimer tous sauf `kdmc-bot-2026`

### 3. Régénérer token Telegram
Token visible dans captures d'écran → régénérer via @BotFather

### 4. Ajouter 4 secrets GitHub Actions
Pour activer les crons fréquents de l'agent autonome

### 5. Backup chiffré tokens sur Drive (sécurité 3-2-1)

### 6. Créer repos GitHub IA-KDMC + e-KDMC

---

## 🟢 AMÉLIORATIONS IDENTIFIÉES (audits subagents 2026-04-17)

### Sécurité
- [ ] innerHTML sans esc() aux lignes 2862, 8054, 14424 → auditer et sanitiser

### UX Premium (à faire en v9.149+)
- [ ] Drag & drop planning shifts
- [ ] Shift+Click multi-select bulk edit
- [ ] Inline edit on double-click (employé fields)
- [ ] Filter chips clickables (équipe, famille, code)
- [ ] Live presence avatars sur vues partagées

### Data Viz
- [ ] Heatmap densité planning 12 mois (SVG/Canvas)
- [ ] Sparkline tendance absences par employé

---

*Dernière mise à jour : 2026-04-17 v9.148*
