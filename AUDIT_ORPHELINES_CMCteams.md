# 🧹 AUDIT — Fonctions orphelines CMCteams (`index.html`)

> Généré 2026-06-06 — branche `claude/cmcteams-crew-review-QZUyo` — audit architecture (règle #28 *Declaration ≠ Deployment*).
> **Méthode** : tokenisation complète du HTML, comptage exact des call-sites (onclick inclus). **Aucune suppression faite** — ce rapport sert à décider (règle #59 « vérifier avant d'agir » + « réactiver ce qu'on a désactivé »).

## Synthèse
- **1408** fonctions nommées · **126** avec 0 call-site · **0 vue `v*` orpheline** (routage sain ✅).
- **Catégorie A** — doublons morts confirmés (version vivante existe) : **7** → sûrs à retirer.
- **Catégorie B** — référencées en string (dispatch dynamique) : **0**.
- **Catégorie C** — défini, 0 référence nulle part : **123** → à décider 1-par-1 (câbler ou retirer).

⚠️ Ces fonctions **ne s'exécutent pas** → 0 impact runtime/perf. Le seul gain d'un retrait = taille du fichier. Le risque = casser une édition sur un fichier de 1,8 Mo. **Donc : pas de suppression de masse.**

---

## ✅ A) Doublons morts — SÛRS à retirer (vérifiés)
La version vivante existe et est appelée ; l'orpheline est l'ancienne.

| Orpheline (morte) | Remplacée par (vivante) |
|---|---|
| `_idbGet` | `cmcIdbGet` (3 appels) |
| `_idbSet` | `cmcIdbSet` (4 appels) |
| `_idbDelete` | (famille `cmcIdb*`) |
| `_idbSize` | (famille `cmcIdb*`) |
| `setTheme` | `_setTheme` (vivant) |
| `compressStr` / `decompressStr` | `_cmcCompress` / `_cmcDecompress` (LZ-string, vivants) |
| `cmcTripleSave` | triple-save inline `ls()`+`fbWrite`+`cmcIdbSet` (wrapper jamais branché) |

→ **Action proposée** : retrait groupé après validation Kevin. Gain : lisibilité, pas de perf.

---

## 📌 C) Défini mais jamais référencé (123) — à décider

### C1 — Features user-facing probablement VOULUES (bouton/route manquant → à CÂBLER, pas supprimer)
Ces noms décrivent des fonctionnalités que Kevin a demandées par le passé ; leur point d'entrée UI a disparu. **Ne pas supprimer sans demander.**
- **Export calendrier** : `exportICS`, `exportTeamICS`, `addEvent`, `removeEvent`
- **QR code** : `showQRCode`, `cmcGenerateQRImage`, `cmcGenerateQRUrl`, `scanQRCodeFromVideo`
- **Scan/photo planning** : `cmcScanPlanningCamera`, `cmcAttachVisualPlanning`, `uploadAppPhoto`, `removeAppPhoto`
- **Visio** : `_cmcStartVideoCall`, `_cmcJoinVideoCall`
- **PIN / FaceID** : `savePinCode`, `removePinCode`
- **Favoris** : `toggleFavEmp`, `toggleFavView`, `isFavEmp`
- **EmailJS** : `saveEmailJSConfig`, `removeEmailJSConfig`, `testEmailJS`
- **Templates planning** : `applyTemplate`, `deleteTemplate`
- **Partage / import** : `webShare`, `doImportJSON`
- **RGPD / géoloc** : `revokeGeolocConsent`, `cmcCguStatus`
- **Échanges / demandes** : `adminRespondRequest`
- **Affluence** : `getAffluenceForDay`, `toggleAffluenceDay`

### C2 — Helpers internes morts (probable vrai code mort, faible risque à retirer)
- UI utils : `chipButton`, `plaqueButton`, `statusBadge`, `emptyState`, `loginProgress`, `_renderReactionPicker`, `_renderReactions`
- Couleurs/labels : `getDeptColor`, `getDeptIcon`, `getDeptLabel`, `getCasinoColor`, `getCasinoIcon`, `getVenueColor`, `getFamShort`, `getGroupeLabel`, `getRoleShiftCodes`
- Divers : `_throttle`, `onceVisible`, `onVisibilityChange`, `isSlowNetwork`, `looksLikeName`, `_matchName`, `isCodeOrDay`, `toSvgCoords`, `splitTwoEmpLines`, `_pwStrength`, `getEP`, `pitRotDur`, `teamById`, `teamForMonthLabel`, `empsByTeam`, `getVisitStats`, `getGhostHistoryForUid`, `chTeam`

### C3 — Migrations / one-shots obsolètes (passées, retirables)
- `_v705TotalWipe`, `_v707RedetectBoot`, `_v715RedetectBoot`, `migrateEmployees`, `_migratePwToV2`, `reloadSeed`, `_restoreFamiliesFromDefEmp`, `_cleanOverridesNow`

### C-divers — à inspecter individuellement
`_checkDeviceAnomaly`, `_cmcBootForceUpdateCheck`, `_cmcLessonOnImportFail`, `_cmcMapLongStart`, `_cmcMapLongEnd`, `_confirmValidateNewUser`, `_validateImportSums`, `agentActionGotoConflicts`, `axManualDeepClean`, `bulletinCodeLabel`, `checkPasswordsExpiry`, `cmcImportBanner`, `cmcIsCadresUnifiedMode`, `cmcLessonApplyByCategory`, `cmcLessonIncrementApplied`, `cmcLessonsByCategory`, `cmcMemoryGet`, `cmcMemoryLoadShared`, `cmcReadEncrypted`, `cmcStoreEncrypted`, `cmcRequestTotalAudit`, `cmcResetFeatureForUser`, `cmcSetFeatureForUser`, `cmcSectorByCellCode`, `cmcSectorBySection`, `cmcSetConsumptionLevel`, `cmcStartShiftTracking`, `cmcStopShiftTracking`, `conventionCongeJours`, `detectTableHybrid`, `empMatchesActiveCasino`, `fbPushAll`, `isInsideGeofence`, `logPasswordAccess`, `parseCMCPlanningFromItems`, `pitAiForecastSkills`, `saveCagnottes`, `saveChefsT`, `saveComment`, `superVerifyCurrentImport`, `toggleBgPaused`, `_stopBgSlideshow`, `toggleGroupeOuvert`, `toggleVisitor`, `updateDocNotes`

---

## ▶️ Prochaine étape recommandée
1. **Câbler C1** (features voulues) : ajouter les boutons/routes manquants — gain fonctionnel réel.
2. **Retirer A + C2 + C3** après validation Kevin — nettoyage sûr.
3. **Inspecter C-divers** 1-par-1.

> Rien n'est supprimé tant que Kevin n'a pas tranché par catégorie. Dis « câble C1 » ou « retire A+C2+C3 » pour lancer.
