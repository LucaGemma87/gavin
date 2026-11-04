---
kind: plan
title: Esecuzione autonoma degli agenti con limiti non aggirabili
status: In Progress
priority: high
---

## Obiettivo

Permettere agli agenti avviati da Gavin di completare in autonomia la maggior parte delle attività di sviluppo nel workspace: leggere e modificare il progetto, eseguire comandi di progetto e test, correggere gli errori e verificare il risultato. Gli agenti chiedono all'utente solo quando una scelta d'implementazione non è determinabile dal contesto; se non arriva risposta entro cinque minuti, scelgono la soluzione più coerente con le istruzioni e le best practice, registrano l'ipotesi e continuano.

Due limiti sono assoluti:

1. **Nessun commit senza permesso esplicito dell'utente.** Il timeout non è consenso.
2. **Nessuna modifica al sistema operativo.** Gli agenti non installano o rimuovono software a livello macchina/utente, non alterano servizi, permessi, configurazioni globali o file fuori dal workspace. Un timeout non può autorizzarle.

## Distinzione fondamentale: autonomia non significa invisibilità

La filosofia attuale di Gavin privilegia sessioni PTY visibili, così l'utente può seguire e interrompere il lavoro. Non è necessario eliminare i terminali per rendere autonomo il lavoro: la modalità autonoma deve togliere le pause interattive non necessarie, mantenendo visibili sessione, stato, comandi, modifiche e verifiche.

Le modalità headless/no-TUI sono un'altra scelta. Gavin possiede già argomenti headless verificati per alcuni profili e li usa in flussi nascosti circoscritti; altri profili, tra cui Cline CLI e Copilot CLI, non hanno al momento un percorso headless verificato nella tabella. Non applicare un flag generico `--auto` a tutti i CLI: capability, sandbox e semantica dei permessi vanno verificate per profilo e versione. Vedere `app/src-tauri/src/agent_setup.rs`, `app/src/lib/cards/cardRun.ts` e la specifica approvata `docs/superpowers/specs/2026-08-25-agent-default-model-design.md`.

## Comportamento desiderato

- Gli avvii Gavin per card e step di rail usano una modalità autonoma, visibile e limitata al workspace; i normali terminali aperti dall'utente restano interattivi.
- L'agente può esaminare il repository, scrivere i file del progetto, eseguire build/test/lint e ripetere le correzioni necessarie senza chiedere approvazione a ogni operazione.
- Per ogni profilo Gavin usa soltanto una modalità di esecuzione e permessi documentata e verificata. Quando possibile, abilita scrittura nel workspace con sandbox/allowlist e nega l'accesso in scrittura fuori da esso.
- La visibilità del terminale non equivale a una richiesta di approvazione per ogni tool. Le richieste di conferma intrinseche del CLI vanno configurate con permessi limitati, non rimosse indiscriminatamente.
- Commit e modifiche al sistema operativo sono negati dal controllo di Gavin in tutti i percorsi, anche se il CLI li auto-approva, la richiesta arriva via MCP, il comando è in un rail o scade un timer.
- A fine lavoro l'agente riporta riepilogo, file cambiati, verifiche eseguite/non eseguite, ipotesi adottate e ogni limite incontrato. Non committa.

## Piano per fasi

### P0 — Definire la policy e la matrice delle capacità

- [x] Formalizzare le classi di operazioni: modifiche e comandi circoscritti al workspace; decisioni d'implementazione; commit; operazioni di sistema operativo; azioni non verificabili o fuori ambito.
- [x] Definire in termini verificabili cosa è “sistema operativo”: installazione/configurazione a livello macchina o utente, servizi/processi persistenti, permessi e privilegi, startup/login items, registro/variabili globali e scritture fuori dal workspace.
- [ ] Auditare per ogni profilo e versione CLI i modi interattivi, headless, auto-approval, sandbox, permessi dei tool, supporto MCP e comportamento quando un'autorizzazione manca. Le fonti devono essere documentazione ufficiale o test contro il binario; nessun flag dedotto dal nome.
- [x] Distinguere “sessione visibile”, “prompt consegnato automaticamente”, “tool autorizzato automaticamente” e “processo headless”: sono capability separate.
- [ ] **Criterio di uscita:** matrice per profilo con capability verificate, limiti e modalità alternativa; capability non verificate risultano non supportate, mai implicitamente autorizzate.

### P1 — Applicare l'autonomia in un punto centrale con confini effettivi

- [ ] Introdurre una policy di esecuzione Gavin: gli avvii di card e rail sono autonomi per impostazione predefinita; mantenere disponibile una modalità più supervisionata per workspace che la preferiscono e i normali terminali manuali.
- [ ] Centralizzare il controllo nel daemon/percorso comune di lancio, non solo nei pulsanti dell'interfaccia: card, rail, tool agentici, avvii MCP, resume, scheduler e Best-of-N devono ricevere la stessa policy.
- [ ] Usare per ogni agente sandbox/permessi supportati dal relativo CLI per consentire il lavoro nel workspace e negare scritture di sistema e commit. Verificare che il confine regga su ogni sistema operativo supportato; se Gavin non può applicarlo, non dichiarare quel profilo autonomo. Non affidarsi al solo prompt o alla visibilità del terminale.
- [ ] Bloccare anche i tentativi indiretti di commit (shell, tool nativi, MCP o rail); chiedere il permesso con un'azione esplicita che mostri branch, diff e messaggio. Senza risposta, lasciare il lavoro non committato.
- [ ] Negare le modifiche al sistema operativo senza offrire un pulsante di approvazione automatica né trasformare il divieto in un'ipotesi.
- [ ] Non installare automaticamente CLI, runtime o software globali. Le dipendenze di progetto si gestiscono solo nel workspace e con i file di progetto interessati visibili nel diff.
- [ ] **Criterio di uscita:** test avversariali provano che prompt injection, shell, MCP, fallback, resume e scadenza del timer non superano i due limiti assoluti.

### P2 — Rendere automatico il lavoro ordinario senza perdere osservabilità

- [ ] Aggiungere una modalità “Autonomo” distinta dal terminale manuale: avvia il task, consegna il prompt, abilita solo i tool necessari entro il confine e prosegue attraverso le normali fasi implementazione/verifica.
- [ ] Mantenere sessione e output consultabili nei terminali/pagine di Gavin; mostrare stato, tool/comandi in corso, diff e verifiche. L'utente deve poter interrompere il run.
- [ ] Usare headless solo per task finiti dove il profilo lo supporta e la fine del processo è verificata; mantenere i run con supervisione/interazione visibili quando serve. La scelta headless non deve aggirare i gate.
- [ ] Riconoscere la modalità autonoma solo dove Gavin può provare che il profilo applica i limiti richiesti. Per gli altri profili, spiegare il limite e non dichiarare l'esecuzione protetta/autonoma.
- [ ] **Criterio di uscita:** una card di sviluppo completa edit, test e report senza click di approvazione ordinari, con la sessione sempre visibile/interrompibile e senza effetti fuori workspace.

### P3 — Domande d'implementazione con attesa di cinque minuti

- [ ] Classificare una domanda come decisione d'implementazione solo se riguarda una scelta tecnica reversibile entro obiettivo, requisiti e limiti già autorizzati. Non usare il timer per ottenere requisiti mancanti, credenziali, accesso o permessi.
- [ ] Quando l'agente formula una domanda idonea, mostrarla in Decisions/Attention con contesto, opzioni, raccomandazione e conto alla rovescia di cinque minuti; notificare l'utente.
- [ ] Avviare il conto alla rovescia quando la richiesta è stata effettivamente presentata; persistere scadenza e stato nel daemon per gestire riavvii senza azzerare il tempo.
- [ ] Se arriva una risposta entro cinque minuti, passare la risposta all'agente e annullare la decisione automatica.
- [ ] Alla scadenza senza risposta, scegliere l'opzione meno rischiosa e più reversibile coerente, nell'ordine, con richiesta esplicita, card/PRD, specifiche e ADR, convenzioni del repository, test e pratica consolidata. Se la scelta uscirebbe da tale ambito, non inventare un requisito: fermare solo quel task e spiegare il blocco.
- [ ] Registrare la decisione automatica prima di proseguire; una risposta tardiva non cancella la registrazione. Se il lavoro non è ancora iniziato, consentire all'utente di sostituire la scelta; se è iniziato, registrare la correzione e fermarsi/riadattarsi senza perdere le modifiche.
- [ ] **Criterio di uscita:** test con risposta prima della scadenza, scadenza, riavvio del daemon, risposte duplicate/tardive e più domande dimostrano una sola decisione coerente e nessuna autorizzazione implicita.

### P4 — Registro delle ipotesi e revisione post-implementazione

- [ ] Definire un registro durevole e append-only associato al workspace e al run/card, consultabile dalla card e dalla Review. Non sovrascrivere una scelta passata: aggiungere una voce di correzione.
- [ ] Per ogni ipotesi salvare almeno: domanda, scelta adottata, alternative considerate, motivazione e fonti di progetto, ora della domanda e scadenza, profilo/run/card, file interessati e verifiche conseguenti. Escludere credenziali e contenuti sensibili non necessari.
- [ ] Al completamento mostrare le ipotesi nel riepilogo Review, con link alla diff e ai test, e permettere all'utente di accettarle o annotare una correzione.
- [ ] **Criterio di uscita:** le ipotesi restano leggibili dopo la chiusura/riapertura dell'app e sono collegate al lavoro che le ha usate; l'agente non può dichiarare completato un run con decisioni automatiche non registrate.

### P5 — Validare la flotta end-to-end

- [ ] Provare profili supportati e non supportati su card, rail sequenziali/paralleli, tool, avvio MCP, resume e Best-of-N.
- [ ] Verificare che test/build/lint possano essere eseguiti automaticamente, che domande d'implementazione usino il timer e che l'utente possa interrompere qualsiasi run.
- [ ] Dimostrare che nessun percorso produce un commit senza permesso e che nessun agente può installare/configurare componenti di sistema o scrivere fuori workspace.
- [ ] Verificare che un blocco di sistema o un fallimento di autorizzazione non venga classificato come scelta d'implementazione da decidere dopo cinque minuti.
- [ ] **Criterio di uscita:** copertura automatizzata di tutti i percorsi e delle due invarianti, più un controllo umano in app della sequenza domanda → scadenza → ipotesi in Review.

## Principi di decisione automatica

1. Non cambiare l'obiettivo richiesto né ampliare lo scope della card.
2. Preferire la soluzione più piccola, convenzionale, reversibile e coperta da test.
3. Riutilizzare architettura, helper, specifiche e decisioni già presenti; non introdurre dipendenze o servizi non necessari.
4. Se due soluzioni restano equivalenti, scegliere quella con minori privilegi, effetti esterni e manutenzione.
5. Annotare in modo comprensibile cosa è stato assunto e perché; l'utente può correggere la decisione in Review.
6. La scadenza non è mai consenso a commit, modifica OS, accesso a credenziali o azioni oltre i limiti.

## Misure di successo

- La grande maggioranza dei task di sviluppo completabili nel workspace arriva a implementazione e verifica senza approvazioni operative ripetute.
- Il 100% delle decisioni automatiche scadute è registrato e collegato al run.
- Zero commit senza autorizzazione esplicita; zero modifiche al sistema operativo; zero scritture fuori workspace.
- Ogni capability di auto-approval dichiarata per un profilo è verificata contro la versione supportata del CLI.
- L'utente può vedere, interrompere, riprendere e revisionare le sessioni e le ipotesi dalla UI di Gavin.

## Collegamenti

- La filosofia di Gavin rende il lavoro degli agenti visibile e mantiene il controllo umano sulle azioni irreversibili: `.gavin-root/PRD.md`.
- L'auto-resume esistente distingue le cause e consente solo tentativi limitati con consenso preventivo: `docs/superpowers/specs/2026-09-02-auto-resume-design.md`.
- Il modello di attesa/domande e l'inbox sono le superfici da integrare, non da duplicare: `docs/superpowers/specs/2026-09-21-typesafe-turn-verdict-experiment.md` e le funzionalità Decisions/Attention.

## Avanzamento esecuzione (2026-11-04)

- Completata la definizione dei confini e la distinzione tra TUI, consegna prompt, auto-approvazione e headless.
- Specifica e matrice iniziale: [2026-11-04-autonomous-agent-execution.md](../../docs/superpowers/specs/2026-11-04-autonomous-agent-execution.md).
- **Bloccato prima dell'integrazione:** il checkout condiviso contiene modifiche non mie in `session.rs`, `workspace_settings.rs`, `crates/protocol/src/lib.rs` e `crates/daemon/src/server.rs`, oltre a una nuova `crates/daemon/src/launch_policy.rs` e superfici UI correlate. Questi sono punti centrali necessari alla policy comune. Non li ho modificati né sovrascritti. Riprendere dopo aver isolato quelle modifiche; prima del rilascio serve inoltre un sandbox host verificato, perché i profili attuali non garantiscono da soli i divieti di commit e scrittura OS.
