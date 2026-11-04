# Esecuzione autonoma degli agenti — specifica

**Stato:** specifica iniziale; implementazione bloccata dall'integrazione concorrente nell'albero di lavoro.

Questa specifica guida [feat-autonomous-agent-execution.md](../../../.gavin-root/plans/feat-autonomous-agent-execution.md). Il suo obiettivo non è aggiungere un flag di auto-approvazione globale, ma lasciare che i task di sviluppo procedano senza approvazioni operative ripetute, mantenendo due confini non negoziabili: nessun commit senza permesso esplicito e nessuna modifica al sistema operativo.

## Evidenze e vincoli attuali

- Gavin considera le sessioni degli agenti visibili e mantenibili oltre la vita della finestra; i normali terminali manuali non devono diventare automatici.
- `AgentProfile` distingue `prompt_args`, `prompt_injection` e `headless_args`. Headless è verificato solo per alcuni profili e per specifici flussi; non è sinonimo di auto-approvazione sicura (`app/src-tauri/src/agent_setup.rs`, `app/src/lib/cards/cardRun.ts`).
- Oggi il supporto varia per CLI: Cline e Copilot non dichiarano un percorso headless verificato; Codex headless specifica `workspace-write` e `--ask-for-approval never`; Antigravity usa `--dangerously-skip-permissions`; Cursor mantiene deliberatamente separato il consenso MCP; opencode seleziona un agente Gavin specifico per il run nascosto di commit; Kimi headless usa la propria policy `auto`. Questi flag non hanno semantica uniforme e non provano un divieto di commit o di scritture OS.
- L'audit della superficie agenti documenta che shell, protocollo e MCP ampliano la capacità di un agente oltre una singola API di tool e che i processi agenti operano con i privilegi dell'utente (`docs/security/03-agent-surface.md`). Un prompt, una blacklist testuale di comandi o la sola modalità TUI non costituiscono un confine di sicurezza.
- Di conseguenza, la policy richiesta non può essere garantita finché il processo dell'agente non è confinato da un sandbox con limiti di filesystem e processo verificati per il sistema operativo, o da un meccanismo equivalente. Un profilo privo di tale enforcement non può essere dichiarato “autonomo protetto”.

## Matrice iniziale dei profili

Questa matrice descrive ciò che Gavin compone oggi dai dati di profilo. È un audit della configurazione, non una garanzia che ogni CLI esegua la policy correttamente dopo un aggiornamento; il controllo contro la versione installata resta obbligatorio.

| Profilo | Avvio visibile / prompt | Headless configurato oggi | Limite per l'autonomia richiesta |
|---|---|---|---|
| Cline CLI | `cline --auto-approve false` con prompt | Non configurato | I tool non sono approvati automaticamente; nessun percorso Gavin headless verificato. |
| GitHub Copilot CLI | `copilot -i` | Non configurato | Nessun percorso headless/prompt non interattivo verificato in Gavin. |
| Claude Code | TUI con prompt posizionale | `-p`, grant ristretto a `Bash(git *)` | La riga headless è per il flusso di commit, non per sviluppo generale; va definita una policy che escluda il commit. |
| Codex CLI | TUI con prompt posizionale | `exec --sandbox workspace-write --ask-for-approval never` | Candidato per task autonomi nel workspace, ma l'accesso a `.git` e al sistema operativo richiede un confine host ulteriore. |
| Antigravity CLI | Prompt interattivo | `--dangerously-skip-permissions --prompt=` | Auto-approval ampia, non compatibile da sola con i divieti richiesti. |
| Cursor Agent | Prompt posizionale, `--trust`; consenso MCP separato | `-p --trust` | Auto-approvazione MCP resta condizionata al consenso; il confinamento OS/commit non è dimostrato. |
| OpenCode | TUI con prompt `--prompt=` | `run --agent gavin-commit --auto` | Profilo agente speciale per commit nascosto; `--auto` non è una policy generale di sviluppo sicura. |
| Kimi Code | TUI; prompt via handshake MCP | `--prompt=` con policy CLI `auto` | La denylist CLI non prova da sola l'impossibilità di commit o modifiche OS. |
| Custom | Configurazione dipendente dall'utente | Non configurato | Non esiste una capability verificata comune; non dichiarabile autonomo protetto senza prove e sandbox. |

## Regole di prodotto

1. **Autonomia visibile:** i lanci Gavin di card e rail consegnano il prompt e fanno procedere in sequenza implementazione e verifiche senza approvare ogni azione ordinaria. Restano visibili e interrompibili. L'interazione manuale aperta dall'utente non cambia.
2. **Confine workspace:** autorizzare solo letture e scritture pertinenti al workspace e comandi di progetto. Il sandbox deve negare scritture fuori dal workspace, accesso alle credenziali non necessarie e mutazioni persistenti dell'ambiente macchina/utente. Per i workspace con worktree, la policy deve elencare il checkout e il worktree consentiti, non l'intero disco.
3. **Commit vietato per default e non inferibile:** negare `git commit` attraverso ogni percorso. Una richiesta esplicita apre un gate Gavin separato che mostra checkout, branch, diff e messaggio; soltanto un'approvazione umana per quella specifica operazione può autorizzarlo. Timeout e impostazioni “auto” non valgono come approvazione.
4. **No OS mutations:** installazioni globali, servizi, modifiche a privilegi/permessi, startup items, configurazioni macchina/utente e scritture fuori dal workspace sono negate dal sandbox, non solo descritte nel prompt. Se il sandbox non può distinguere in modo affidabile una dipendenza locale del progetto da una modifica globale, fermare l'azione e segnalare il limite.
5. **Scelta di modalità per capability:** sessione visibile, prompt consegnato, permessi automatici e processo headless sono capability indipendenti. Registrare per CLI/versione quali sono supportate, i permessi concessi e il sandbox usato. Non riutilizzare i flag headless dei flussi di commit per l'esecuzione di task.
6. **Fail closed:** se un profilo non supporta la policy richiesta o il sandbox non si avvia, non lanciarlo in modalità più permissiva con una semplice avvertenza; bloccare l'avvio autonomo e spiegare la capability mancante.

## Domanda d'implementazione e timeout

- Una domanda è eleggibile al timeout solo se è una scelta d'implementazione reversibile, interna all'obiettivo e alle autorizzazioni già concesse.
- Requisiti ambigui che cambiano prodotto, dati, policy, privacy, accesso, dipendenze esterne o scope non sono scelte inferibili: il task si sospende e resta in attesa.
- Presentare domanda, opzioni, raccomandazione e scadenza di cinque minuti nella superficie Decisions/Attention; avviare il timer quando la domanda è realmente visibile e notificata.
- Persistire nel daemon l'identificatore del run/domanda, timestamp assoluto di scadenza, stato e risposta. Riavvio e riconnessione non devono riavviare il timer né consentire due decisioni concorrenti.
- Alla scadenza, applicare la scelta reversibile più conservativa coerente con card, PRD, specifiche/ADR, convenzioni del repo e test. Se nessuna scelta rimane nel perimetro, sospendere quel task, non inventare un requisito.
- Ogni scelta automatica è scritta nel registro durevole prima di passarla all'agente. Risposte tardive sono annotate e non cancellano la decisione già presa.

## Registro delle ipotesi e revisione

Il registro è append-only e associato a workspace, card e run. Ogni voce contiene domanda, opzioni, scelta, motivazione, riferimenti di progetto usati, ora di scadenza, ora della decisione e verifiche/test successivi. Non include credenziali o dati segreti. Una rettifica aggiunge una nuova voce collegata a quella precedente.

Il riepilogo del run e la Review mostrano le ipotesi, i file toccati e i test, con azioni dell'utente per accettare o annotare una correzione. Il lavoro non può risultare completato se un'ipotesi presa automaticamente non è stata registrata.

La scelta del supporto persistente (nuove righe nel log di workspace esistente oppure registro dedicato associato al run) richiede ispezione dell'integrazione attiva del Workspace Log e non va decisa modificando in parallelo i suoi file.

## Sequenza d'implementazione e gate

### A — Capability e sandbox

- Matrice versionata dei profili e dei permessi verificati.
- Sandbox host per ciascun sistema operativo supportato, con allowlist workspace, denylist `.git` in scrittura, denylist del resto del filesystem e processi figli confinati.
- Verificare che agenti e sotto-processi non possano disabilitare il sandbox o raggiungere le directory negate. Se il sistema non offre un confinement adeguato senza privilegi/installazioni OS, quella combinazione resta non supportata.
- **Gate:** prove avversariali tentano scrittura in `.git`, home, directory di sistema, configurazioni globali e uso di processi figli; tutte devono essere negate, mentre scrittura/test nel workspace funzionano.

### B — Autorizzazione centrale e modalità autonoma

- Integrare la policy nel daemon/shared launch path, includendo card, rail, MCP, scheduler, resume e Best-of-N.
- Introdurre modalità autonoma solo per combinazioni profilo/sistema con Gate A superato; conservare visibilità/interrompibilità e modalità supervisionata.
- Bloccare commit nel confine di processo e fornire un gate di approvazione per-run, esplicito e non persistente.
- **Gate:** tutti i punti d'ingresso applicano la stessa policy e nessun percorso di retry o fan-out la allenta.

### C — Decisioni temporizzate e audit

- Implementare il ciclo di vita della domanda, timer persistente di cinque minuti, risposta umana, scadenza e serializzazione delle decisioni.
- Collegare il registro al run/card e alla Review senza incorporare segreti; gestire migrazione SQLite contro schema precedente.
- **Gate:** test su risposta prima/dopo timeout, crash/restart, duplicati e più agenti simultanei; la registrazione è atomica rispetto alla ripresa del prompt.

### D — Verifica end-to-end

- Suite d'integrazione su ogni sistema operativo e profilo dichiarato supportato.
- Simulare richieste di commit e modifiche OS da shell, MCP, tool dell'agente, child process, resume e rail.
- Controllare in app la sequenza visibile domanda → risposta automatica al timeout → ipotesi in Review e l'approvazione esplicita del commit.

## Criteri di rilascio

- Zero commit senza autorizzazione esplicita per quel commit.
- Zero scritture OS o fuori dal workspace per un agente in modalità autonoma protetta.
- Capability non verificate bloccano il lancio protetto invece di degradare silenziosamente.
- Le decisioni d'implementazione idonee proseguono dopo cinque minuti; domande fuori perimetro restano sospese.
- Ogni decisione automatica è durevole, attribuita al run e rivedibile dall'utente.
- Nessun task viene dichiarato concluso senza riepilogo di diff e verifiche.

## Blocco di implementazione nel checkout corrente

Al momento dell'esecuzione, il checkout condiviso aveva modifiche non mie in `app/src-tauri/src/session.rs`, `app/src-tauri/src/workspace_settings.rs`, `crates/protocol/src/lib.rs` e `crates/daemon/src/server.rs`, oltre a una nuova `crates/daemon/src/launch_policy.rs` e nuove superfici UI correlate. Questi sono proprio i punti centrali che l'integrazione B/C dovrebbe modificare. Per non sovrascrivere o incorporare modifiche non verificate, questa sessione ha completato la specifica e sospende l'integrazione del codice finché il proprietario di quelle modifiche non le renda disponibili.
