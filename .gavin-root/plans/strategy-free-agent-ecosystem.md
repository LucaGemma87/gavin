---
order: 6144
kind: plan
title: Rendere Gavin la scelta migliore per agenti e modelli gratuiti
status: In Progress
priority: high
---

## Obiettivo

Fare di Gavin il coordinatore desktop più affidabile per usare agenti e modelli ospitati senza costi a sorpresa: quote gratuite e abbonamenti quando documentati, e mai un passaggio silenzioso a una via a pagamento.

Non costruire un altro catalogo indistinto di modelli. Il vantaggio di Gavin è governare una flotta visibile — sessioni, card, rail, worktree, limiti e revisioni — con una policy economica coerente su ogni avvio.

## Punto di partenza

Gavin ha già profili per diversi CLI e profili personalizzati, selezione di modello e livello di ragionamento, routing per complessità, catene di fallback basate sull'uso, lettura dei limiti supportati, token per alcune sessioni, Best-of-N e orchestrazione visibile. Headroom riduce il contesto inviato ai modelli, ma non rende gratuito il provider.

Il vuoto principale è la provenienza economica effettiva di un lancio: Gavin non distingue in modo trasversale e verificabile quota gratuita del provider, quota inclusa in un abbonamento, consumo a pagamento e stato sconosciuto. Le quote gratuite ruotano e possono essere condivise; un modello con un nome noto non prova né gratuità né disponibilità né capacità di usare gli strumenti.

Analisi di Gavin: [ricerca Gavin e agenti/modelli gratuiti](../../docs/research/2026-11-01-free-agents-and-models.md). Confronto delle soluzioni: [applicazioni agentiche e provider](../../docs/research/2026-11-03-agent-apps-local-runtime-comparison.md).

## Stato dell'implementazione (audit del 2026-11-04)

**Il piano non è completato.** Nel codice ci sono policy di lancio, conferma per i costi sconosciuti, preview, letture di alcuni limiti d'uso e contatori di token. Manca ancora il dato che rende affidabile l'obiettivo del piano: una classificazione economica verificata per provider/modello, con fonte e freschezza, applicata alla policy e registrata sul run. Le caselle già spuntate nella fase P0 documentano decisioni e superfici implementate, non attestano che l'intero patto economico sia garantito.

**Superfici effettivamente presenti:**

- La policy `ask` / `no_paid_requests` esiste a livello app e workspace; il daemon controlla i lanci agent gestiti prima di creare la sessione. La preview redige i comandi e dichiara provider e stato economico non verificati.
- Il daemon e la UI passano però sempre l'entitlement `Unknown`. I verdetti per quota gratuita/inclusa o pagata esistono come logica e test, ma non sono alimentati da un classificatore reale. Con `no_paid_requests`, un costo sconosciuto resta avviabile dopo approvazione monouso; il blocco dei costi noti come pagati non protegge da una route che non viene classificata.
- Gavin legge finestre d'uso di alcuni CLI/account e scopre i cataloghi modello di Codex, OpenCode e Kimi. Questi probe/cataloghi attestano dati esposti dai rispettivi CLI, non provano che una specifica richiesta sia coperta da quota gratuita o abbonamento.
- La cronologia legge token e modelli dai transcript supportati e mostra i token separatamente dai risparmi Headroom. Non è un ledger monetario e non attribuisce al run la policy o la provenienza economica.
- `modelBenchmark.ts` definisce i tipi e le regole pure per soglie, freschezza e ordinamento. Non esegue task, non salva run e non fornisce raccomandazioni alla UI.

| Fase | Stato nel codice |
|---|---|
| P0 — policy e preview | **Parziale.** App e workspace hanno una policy, la UI chiede conferma per `Unknown` e il daemon applica il gate ai lanci agent gestiti. La preview mostra comando redatto, profilo/modello quando riconoscibili, fallback, concorrenza e stato economico ignoto. Il classificatore runtime passa sempre `Unknown`, quindi le vie gratuite/incluse/pagate non sono distinte; un'approvazione monouso consente anche una route che potrebbe essere a pagamento. Mancano registrazione sul run e copertura d'integrazione di tutti i percorsi. |
| P1 — accesso cloud gratuito | **Parziale.** Sono presenti probe di finestre d'uso per profili selezionati; non c'è una procedura guidata per configurare provider cloud gratuiti né una verifica end-to-end che mostri quota gratuita effettiva, ambito, fonte e aggiornamento. |
| P2 — catalogo e provenienza | **Parziale.** Sono implementate discovery di modelli per Codex, OpenCode e Kimi. Mancano un catalogo integrato con capacità e metadati economici verificati, fonti e scadenze; la disponibilità di un modello non prova che la richiesta sia gratuita. |
| P3 — quote e budget | **Parziale.** I probe d'uso e i token letti dai transcript sono misure separate; il limite di concorrenza è generale. Non risultano ledger monetario, budget per provider, prenotazione di quote condivise o controllo economico per fallback e fan-out Best-of-N. |
| P4 — benchmark | **Solo logica di supporto.** Esistono tipi per task, candidati, risultati e raccomandazioni e funzioni per soglie, freschezza e ranking; mancano runner, suite di task eseguibile, persistenza e superficie UI. Il modello dati include anche lo stato `"local"`, ma non implementa inferenza locale, che resta fuori ambito. |

Evidenze principali: [launchPolicy.ts](../../app/src/lib/agents/launchPolicy.ts), [launch_policy.rs](../../crates/daemon/src/launch_policy.rs), [launchPreview.ts](../../app/src/lib/agents/launchPreview.ts), [agentUsage.ts](../../app/src/lib/agents/agentUsage.ts), [agent_setup.rs](../../app/src-tauri/src/agent_setup.rs), [agent_tokens.rs](../../app/src-tauri/src/agent_tokens.rs), [modelBenchmark.ts](../../app/src/lib/agents/modelBenchmark.ts).

**Verifiche:** i test frontend mirati già eseguiti passano (**140 test su 7 file**: policy, preview, usage, fallback, benchmark e Best-of-N). Il test Rust mirato passa: `cargo test -p gavin-daemon --bin gavin-daemon launch_policy --locked -j 1` (**6 passati**). Un tentativo Rust più ampio e un tentativo frontend aggiuntivo si sono fermati prima dell'esecuzione per spazio insufficiente su disco (`OS error 112` / `ENOSPC`); non hanno riportato fallimenti di test.

## Cosa imparare dalle altre soluzioni

- **OpenCode:** ampiezza di provider e agenti specializzati/sub-agenti. Gavin deve mantenere la propria policy di spesa e supervisione.
- **Cline:** accesso semplice a più provider e offerte gratuite. Le offerte sono limitate e variabili: Gavin non deve dipendere da API private né trattare il catalogo come prova della quota.
- **Continue:** distingue ruoli e modalità (pianificazione e agente). Gavin può usare un routing per tipo di lavoro, non soltanto una graduatoria di modelli.
- **Roo Code:** delega a modalità specializzate con passaggio di sintesi. Il pattern può ispirare ruoli e handoff; approvazioni automatiche non devono aggirare i controlli centrali di Gavin.
- **Provider gratuiti:** le quote cloud sono soggette a limiti, condizioni e modifiche del provider; non equivalgono a un accesso gratuito garantito.

## Piano per fasi

### P0 — Definire e far rispettare il patto “nessun costo a sorpresa”

- [x] Definire gli stati economici separati: `quota gratuita provider`, `quota inclusa abbonamento`, `a pagamento`, `sconosciuto`; ogni stato deve indicare fonte e data di verifica.
- [x] Definire policy globali, per workspace e per singolo avvio, includendo un'opzione esplicita “nessuna richiesta a pagamento”.
- [x] [Applicare la decisione al punto di lancio condiviso: card, rail, tool, commit nascosto, MCP, resume/fallback e Best-of-N. In modalità rigorosa, uno stato sconosciuto blocca l'avvio finché non viene autorizzato.](./applicare-la-decisione-al-punto-di-lancio-condiviso-card-rail-tool-commit-nascosto-mcp-resume-fallback-e-best-of-n-in-modalit-rigorosa-uno-stato-sconosciuto-blocca-l-avvio-finch-non-viene-autorizzato.md)
- [x] [Mostrare prima dell'avvio il comando effettivo, provider/modello, stato economico, fallback previsto e impatto della concorrenza. Non esporre né registrare credenziali.](./mostrare-prima-dell-avvio-il-comando-effettivo-provider-modello-stato-economico-fallback-previsto-e-impatto-della-concorrenza-non-esporre-n-registrare-credenziali.md)
- [ ] [Registrare sul run il profilo e il modello realmente usati, la policy applicata e la provenienza della classificazione, senza sovrapporre token, quota e denaro.](./registrare-sul-run-il-profilo-e-il-modello-realmente-usati-la-policy-applicata-e-la-provenienza-della-classificazione-senza-sovrapporre-token-quota-e-denaro.md)
- [ ] [**Criterio di uscita:** test d'integrazione coprono ogni percorso di avvio e provano che “nessuna richiesta a pagamento” non possa raggiungere una via non autorizzata.](./criterio-di-uscita-test-d-integrazione-coprono-ogni-percorso-di-avvio-e-provano-che-nessuna-richiesta-a-pagamento-non-possa-raggiungere-una-via-non-autorizzata.md)

### P1 — Rendere verificabile l'accesso a quote gratuite cloud

- [ ] [Semplificare la configurazione dei provider ospitati con accesso gratuito documentato, riutilizzando profili e CLI supportati anziché implementare un runtime d'inferenza.](./semplificare-la-configurazione-dei-provider-ospitati-con-accesso-gratuito-documentato-riutilizzando-profili-e-cli-supportati-anzich-implementare-un-runtime-d-inferenza.md)
- [ ] [Verificare quota, disponibilità e capacità attraverso interfacce ufficiali; mostrare ambito (account, chiave o progetto), limiti, fonte e data di aggiornamento.](./verificare-quota-disponibilit-e-capacit-attraverso-interfacce-ufficiali-mostrare-ambito-account-chiave-o-progetto-limiti-fonte-e-data-di-aggiornamento.md)
- [ ] [Chiedere consenso prima di configurare un provider esterno o usare una quota condivisa; non presumere che “free” o un modello `:free` garantisca disponibilità ininterrotta o assenza di condizioni.](./chiedere-consenso-prima-di-configurare-un-provider-esterno-o-usare-una-quota-condivisa-non-presumere-che-free-o-un-modello-free-garantisca-disponibilit-ininterrotta-o-assenza-di-condizioni.md)
- [ ] [**Criterio di uscita:** un utente può configurare un provider cloud gratuito documentato e vedere limiti e stato reali senza modifiche manuali a file o credenziali.](./criterio-di-uscita-un-utente-pu-configurare-un-provider-cloud-gratuito-documentato-e-vedere-limiti-e-stato-reali-senza-modifiche-manuali-a-file-o-credenziali.md)

### P2 — Aggiungere catalogo e quote con provenienza

- [ ] [Estendere il catalogo esistente con provider, capacità (strumenti, contesto, streaming), stato economico, URL della fonte, istante di verifica e scadenza; non dedurre le proprietà dal nome del modello.](./estendere-il-catalogo-esistente-con-provider-capacit-strumenti-contesto-streaming-stato-economico-url-della-fonte-istante-di-verifica-e-scadenza-non-dedurre-le-propriet-dal-nome-del-modello.md)
- [ ] [Procedere solo con integrazioni documentate e verificabili, in priorità ai cataloghi già disponibili e a provider con endpoint ufficiali di modelli/quote. Separare le quote per chiave, progetto o account secondo la fonte.](./procedere-solo-con-integrazioni-documentate-e-verificabili-in-priorit-ai-cataloghi-gi-disponibili-e-a-provider-con-endpoint-ufficiali-di-modelli-quote-separare-le-quote-per-chiave-progetto-o-account-secondo-la-fonte.md)
- [ ] [Mostrare i dati scaduti o non disponibili come sconosciuti. Non usare endpoint privati o scraping di UI per attestare una quota.](./mostrare-i-dati-scaduti-o-non-disponibili-come-sconosciuti-non-usare-endpoint-privati-o-scraping-di-ui-per-attestare-una-quota.md)
- [ ] [Mantenere esplicita la scelta del modello e richiedere consenso quando un cambio modifica capacità, contesto o comportamento.](./mantenere-esplicita-la-scelta-del-modello-e-richiedere-consenso-quando-un-cambio-modifica-capacit-contesto-o-comportamento.md)
- [ ] [**Criterio di uscita:** ogni stato “gratuito” è accompagnato da fonte attendibile e freschezza; la perdita della fonte non diventa un'autorizzazione implicita.](./criterio-di-uscita-ogni-stato-gratuito-accompagnato-da-fonte-attendibile-e-freschezza-la-perdita-della-fonte-non-diventa-un-autorizzazione-implicita.md)

### P3 — Proteggere quote e budget della flotta

- [ ] Separare nelle viste economiche spesa monetaria, quota consumata e token.
- [ ] [Impostare limiti per provider e budget massimo, anche pari a zero; mostrare chiaramente quando un limite non è interrogabile.](./impostare-limiti-per-provider-e-budget-massimo-anche-pari-a-zero-mostrare-chiaramente-quando-un-limite-non-interrogabile.md)
- [ ] [Limitare concorrenza e fan-out in base alle quote condivise; prima di Best-of-N mostrare numero di candidati, profili/modelli e quota esposta.](./limitare-concorrenza-e-fan-out-in-base-alle-quote-condivise-prima-di-best-of-n-mostrare-numero-di-candidati-profili-modelli-e-quota-esposta.md)
- [ ] [Consentire fallback solo verso una allow-list compatibile con la policy. Un 429 generico non prova l'esaurimento della quota e non autorizza un fallback a pagamento.](./consentire-fallback-solo-verso-una-allow-list-compatibile-con-la-policy-un-429-generico-non-prova-l-esaurimento-della-quota-e-non-autorizza-un-fallback-a-pagamento.md)
- [ ] [Attribuire risparmi e consumo al profilo realmente eseguito, non soltanto al default del workspace; gestire i run storici senza attribuzione come stima esplicita.](./attribuire-risparmi-e-consumo-al-profilo-realmente-eseguito-non-soltanto-al-default-del-workspace-gestire-i-run-storici-senza-attribuzione-come-stima-esplicita.md)
- [ ] [**Criterio di uscita:** scenari simulati di quota esaurita, provider indisponibile e dato scaduto non superano mai i limiti impostati.](./criterio-di-uscita-scenari-simulati-di-quota-esaurita-provider-indisponibile-e-dato-scaduto-non-superano-mai-i-limiti-impostati.md)

### P4 — Raccomandare modelli in base a risultati misurati

- [ ] [Costruire un benchmark versionato di task Gavin (modifica semplice, cambi multi-file, test, uso MCP/strumenti) ed eseguire i candidati in worktree isolati dallo stesso commit.](./costruire-un-benchmark-versionato-di-task-gavin-modifica-semplice-cambi-multi-file-test-uso-mcp-strumenti-ed-eseguire-i-candidati-in-worktree-isolati-dallo-stesso-commit.md)
- [ ] [Misurare completamento, test superati, rilavorazioni, tentativi, latenza e quota/spesa per tipo di task, confrontando modelli con quota cloud gratuita con un riferimento a pagamento.](./misurare-completamento-test-superati-rilavorazioni-tentativi-latenza-e-quota-spesa-per-tipo-di-task-confrontando-modelli-con-quota-cloud-gratuita-con-un-riferimento-a-pagamento.md)
- [ ] [Mostrare raccomandazioni specifiche per attività con campione, data e versione del benchmark; consentire di disattivarle.](./mostrare-raccomandazioni-specifiche-per-attivit-con-campione-data-e-versione-del-benchmark-consentire-di-disattivarle.md)
- [ ] [**Criterio di uscita:** nessuna etichetta “consigliato” senza evidenza recente e una soglia di qualità concordata; il costo basso non è presentato come equivalenza di qualità.](./criterio-di-uscita-nessuna-etichetta-consigliato-senza-evidenza-recente-e-una-soglia-di-qualit-concordata-il-costo-basso-non-presentato-come-equivalenza-di-qualit.md)
- [x] Decision: Quale deve essere la policy predefinita per i nuovi lanci quando Gavin non può verificare il costo?
  Options: A) Mantenere il comportamento attuale: consentire anche gli stati sconosciuti, mostrandoli come tali B) No paid requests: bloccare per impostazione predefinita pagato e sconosciuto C) Chiedere conferma per ogni lancio pagato o sconosciuto
  Answer (2026-11-03): si chiedere conferma per ogni lancio pagato o sconosciuto
- [x] Decision: In modalità «No paid requests», come trattare comandi o script personalizzati non classificabili che potrebbero avviare un CLI esterno?
  Options: A) Bloccarli tutti, inclusi i tool command/script B) Chiedere un'autorizzazione esplicita per ogni lancio non classificabile C) Applicare la policy solo ai lanci agent gestiti da Gavin; i comandi arbitrari restano fuori ambito
  Answer (2026-11-03): chiedere un'autorizzazione esplicita per ogni lancio non classibicabile

## Misure di successo

- Nessun avvio a pagamento o sconosciuto quando è attiva la policy rigorosa.
- Il 100% dei modelli presentati come gratuiti ha provenienza e controllo di freschezza verificabili.
- Primo avvio con un provider gratuito documentato in meno di cinque minuti mediana, senza modifiche manuali ai file di configurazione.
- Quote e consumo di ogni run sono attribuiti al profilo effettivo o marcati come non verificati.
- Le raccomandazioni mostrano qualità del lavoro accettato, non solo token o prezzo.

## Vincoli e decisioni da mantenere

- Per l'ambito di questo piano, l'esclusione dell'inferenza locale prevale sulla raccomandazione "local-model-first" nel report `docs/research/2026-11-01-free-agents-and-models.md`.
- “Gratuito” non è un'entitlement permanente; limiti e condizioni dei provider cambiano.
- Software open source e CLI gratuiti possono comunque richiedere inferenza a pagamento.
- L'uso di agenti e modelli in locale è fuori ambito: il piano riguarda esclusivamente provider ospitati e quote gratuite/abbonamenti documentati.
- Non usare endpoint non documentati per selezionare modelli o dichiarare quote. Per Cline, mantenere la decisione già presa: riconoscere il limite esplicito, non inventare quota residua e non selezionare automaticamente un modello.
- La policy deve governare tutti i lanci nel daemon, non essere replicata nelle singole schermate.
