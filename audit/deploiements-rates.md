# 🧾 Déploiements ratés — la cause exacte, écrite ici

> Ce fichier est rempli **automatiquement** par `.github/workflows/journal-deploiements.yml`
> **uniquement quand une mise en ligne échoue**. Il existe parce que l'assistant ne peut pas
> lire les journaux de la CI : le connecteur GitHub Actions a été refusé par GitHub
> (2026-09-06). Le workflow lit le journal à sa place et dépose l'essentiel ici.
>
> Rien ici quand tout va bien — c'est normal, et c'est bon signe.

## ❌ Deploy KDMC RAG (mémoire Apex) — 10/09/2026 10:15 UTC

- **Branche** : `claude/verify-cmcteams-light-data-rzlvau` · **Commit** : `46c43dfc` · **Run** : `34465020679`
- **Ce qui a lâché** : deploy › Créer l'index Vectorize (idempotent) — et DIRE s'il n'existe pas
- **Journal complet** : https://github.com/9r4rxssx64-creator/CMCteams/actions/runs/34465020679
- **Ce que la machine a dit** :

```
^[[36;1m# not found [code 10159] » parce que cette création échouait EN SILENCE (|| true, journal^[[0m
^[[36;1m  { grep -iE 'error|✘|failed|code|permission|authoriz|plan' /tmp/vec.log || true; } | tail -10 | while IFS= read -r L; do echo "::error::vectorize create ▸ $L"; done^[[0m
^[[36;1m  tail -8 /tmp/vecget.log | while IFS= read -r L; do echo "::error::vectorize get ▸ $L"; done^[[0m
^[[36;1m  echo "::error::L'index Vectorize apex-memory N'EXISTE PAS sur le compte et n'a pas pu être créé (voir lignes ci-dessus : droit manquant du jeton CLOUDFLARE_API_TOKEN sur Vectorize, ou plan). Le worker kdmc-rag a un binding VEC dessus → wrangler deploy refusera (code 10159). Rien n'est déployé."^[[0m
^[[31m✘ ^[[41;31m[^[[41;97mERROR^[[41;31m]^[[0m ^[[1mA request to the Cloudflare API (/accounts/<id>/vectorize/v2/indexes) failed.^[[0m
  Authentication error [code: 10000]
  To learn more about this error, visit: ^[[4mhttps://developers.cloudflare.com/api/resources/vectorize/subresources/indexes/methods/create^[[0m
##[error]vectorize create ▸ ^[[31m✘ ^[[41;31m[^[[41;97mERROR^[[41;31m]^[[0m ^[[1mA request to the Cloudflare API (/accounts/<id>/vectorize/v2/indexes) failed.^[[0m
##[error]vectorize create ▸   Authentication error [code: 10000]
##[error]vectorize create ▸   To learn more about this error, visit: ^[[4mhttps://developers.cloudflare.com/api/resources/vectorize/subresources/indexes/methods/create^[[0m
##[error]vectorize create ▸ Please ensure it has the correct permissions for this operation.
##[error]vectorize create ▸ 🔓 To see token permissions visit https://dash.cloudflare.com/profile/api-tokens
##[error]vectorize create ▸ 🎢 Membership roles in "9r4rxssx64@privaterelay.appleid.com's Account": Contact account super admin to change your permissions.
##[error]vectorize get ▸ │ Account Name                                  │ Account ID                       │
##[error]vectorize get ▸ ├───────────────────────────────────────────────┼──────────────────────────────────┤
##[error]vectorize get ▸ │ 9r4rxssx64@privaterelay.appleid.com's Account │ *** │
##[error]vectorize get ▸ └───────────────────────────────────────────────┴──────────────────────────────────┘
##[error]vectorize get ▸ 🔓 To see token permissions visit https://dash.cloudflare.com/profile/api-tokens
##[error]vectorize get ▸ 🎢 Membership roles in "9r4rxssx64@privaterelay.appleid.com's Account": Contact account super admin to change your permissions.
##[error]vectorize get ▸ - Super Administrator - All Privileges
##[error]vectorize get ▸ 🪵  Logs were written to "/home/runner/.config/.wrangler/logs/wrangler-2026-09-10_10-15-21_288.log"
##[error]L'index Vectorize apex-memory N'EXISTE PAS sur le compte et n'a pas pu être créé (voir lignes ci-dessus : droit manquant du jeton CLOUDFLARE_API_TOKEN sur Vectorize, ou plan). Le worker kdmc-rag a un binding VEC dessus → wrangler deploy refusera (code 10159). Rien n'est déployé.
##[error]Process completed with exit code 1.
```
