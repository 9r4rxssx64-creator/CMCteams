# DPA — Data Processing Agreement Firebase Realtime Database

**Version** : 1.0 (2026-04-30)
**Apex AI** : v12.537+
**Article référence** : RGPD Art. 28

## 1. Parties

- **Responsable de traitement** : Kevin DESARZENS (KDMC), Monaco
- **Sous-traitant** : Google LLC (Mountain View, CA, USA)
- **Service** : Firebase Realtime Database (`kdmc-clients-default-rtdb.firebaseio.com`)

## 2. Nature et finalité

- **Nature** : Sync cross-device des données partagées admin Kevin
- **Finalité** : Continuité expérience entre iPhone, iPad, Mac
- **Catégories** : Settings admin, KB facts, audit logs, lessons learned, conversations admin (PAS user-specific depuis v12.535)
- **Durée** : 30 jours après dernière connexion

## 3. Sous-traitants

Google Cloud Platform :
- Région data : `europe-west1` (Belgique) ✅ EU
- CDN : Google Cloud CDN

## 4. Mesures techniques

### Chiffrement
- **Transport** : TLS 1.3
- **Repos** : Google chiffre tout au repos (AES-256)

### Contrôle d'accès
- Apex : Anonymous read-only via SDK Firebase
- Admin Kevin : write via SDK Firebase + auth optionnelle
- Firebase Rules à durcir Phase 5 : `.read: auth.uid === $uid`

### Anti-fuite cross-user (v12.272 + v12.298 + v12.535)
- `FB_LOCAL` strict : 30 keys per-device (PIN, settings, theme, sessions)
- `FB_LOCAL_PREFIXES` : 17 patterns per-user (`ax_user_chat_`, `ax_user_locations_`, etc.)
- `FB_FIX` : seulement données vraiment shared admin

## 5. Droits des personnes

| Droit | Implémentation |
|---|---|
| Accès | `axExportMyDataRGPD()` lit Firebase via fbLoadAll |
| Effacement | `axDeleteAccountTotal()` + delete Firebase keys |
| Portabilité | Export JSON full Firebase |

## 6. Notification de violation

Firebase déclare les breaches sur https://status.firebase.google.com.
Apex relais via `axDetectPotentialBreach()` + `axNotifyKevin()`.

## 7. Transferts

- Region `europe-west1` ✅ pas de transfert hors EU pour data
- Métadonnées Google (logs, auth) peuvent transiter US : SCC + Privacy Shield successor

## 8. Audit

- Google Cloud publie SOC 1/2/3 + ISO 27001/27017/27018 + GDPR
- DPA Firebase : https://firebase.google.com/terms/data-processing-terms

---

**Statut** : Document de référence v1.0.
