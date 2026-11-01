---
kind: plan
title: Rilevare il limite gratuito giornaliero di Cline
status: Done
priority: medium
---

## Obiettivo

Per il profilo Cline, riconoscere il messaggio esplicito di limite giornaliero del modello gratuito e classificarlo come `usage-limit`, evitando retry automatici contro un limite esaurito. La quota residua dell'account resta `Unsupported`: Gavin non seleziona o cambia automaticamente modello e non effettua fallback verso un modello a pagamento. Riprendere queste funzionalità solo quando esistono interfacce supportate e dati verificabili.

## Stato attuale verificato

- Il profilo `cline` in `app/src-tauri/src/agent_setup.rs` usa il comando `cline` e il flag `--model`, ma non dichiara modelli predefiniti, catalogo dinamico, sonda di quota o log di token per sessione.
- `app/src-tauri/src/agent_usage.rs` misura quote account tramite route tipizzate e verificate. Per Cline la risposta attuale è `Unsupported`; non va sostituita con una percentuale stimata o con la quota di un altro profilo.
- Il consumo di una singola conversazione e la quota disponibile dell'account sono misure diverse. Un eventuale log di token della sessione non prova quanta quota gratuita resta nell'account.
- La risoluzione modello esistente privilegia la configurazione workspace rispetto al default globale e compone `--model` soltanto nel comando di avvio. Il catalogo statico attuale non è concepito per quote e disponibilità che cambiano nel tempo.
- La specifica approvata sul default modello, `docs/superpowers/specs/2026-08-25-agent-default-model-design.md`, è stata aggiornata per documentare i limiti verificati e le decisioni di questa estensione.
- Il CLI Cline verificato riconosce i modelli gratuiti tramite l'endpoint interno `/api/v1/ai/cline/recommended-models` e segnala il raggiungimento del limite giornaliero per modello. L'endpoint del catalogo non è documentato come API stabile, e il catalogo non certifica capacità o idoneità per attività; Gavin non lo chiamerà né dedurrà una graduatoria.
- Non è stata trovata una fonte supportata per la quota numerica residua Cline. La quota rimane `Unsupported`; si può invece riconoscere e classificare il messaggio Cline quando il limite giornaliero di un modello è già stato raggiunto.

## Decisioni di progetto da mantenere

1. **Nessun residuo inventato.** Non è stata verificata un'interfaccia supportata per leggere la quota account Cline; resta `Unsupported`. Token di sessione e consumo locale non rappresentano la quota residua.
2. **Nessuna dipendenza da cataloghi interni.** Il catalogo Cline osservato usa un endpoint non documentato come API stabile e non fornisce criteri verificati di idoneità; Gavin non lo usa né deduce gratuità, capacità o priorità dal nome o dall'ordine.
3. **Nessun cambio modello automatico.** Gavin conserva la scelta esplicita e non seleziona né sostituisce modelli Cline in base a dati non verificabili.
4. **Nessun fallback a pagamento.** L'esaurimento del limite o l'indisponibilità dei dati non autorizzano Gavin a passare silenziosamente a un modello a pagamento.
5. **Riconoscere solo il limite osservato.** I messaggi espliciti del CLI sul limite giornaliero del modello gratuito sono `usage-limit`, così auto-resume e la gestione Headroom delle sessioni compresse non riprovano contro quel limite.
6. **Riaprire il perimetro solo con fonti supportate.** Quota numerica, catalogo stabile e selezione per attività richiedono API documentate e dati verificabili prima di una futura implementazione.

## Piano di implementazione

- [x] **Verificare Cline e la quota gratuita.** Il CLI segnala limiti giornalieri per modello ma non fornisce tramite un'interfaccia supportata una quota residua consultabile. Il catalogo è servito da un endpoint interno non stabile e non contiene criteri di idoneità per attività. Nemotron e la selezione automatica restano fuori.
- [x] **Aggiornare la specifica approvata.** Aggiungere le decisioni che restringono questa estensione al riconoscimento del limite osservato e mantengono `Unsupported` per le quote non misurabili.
- [x] **Rilevare il limite Cline per modello.** Aggiunti i messaggi espliciti del CLI ai pattern di failure Cline e classificati `usage-limit`, così auto-resume e Headroom non ritentano contro un limite esaurito.
- [x] **Testare e documentare il comportamento.** I test Rust mirati sul limite e sull'attribuzione Headroom passano; la specifica documenta che quota residua, selezione automatica e fallback non sono supportati.

## Criteri di accettazione

- Il limite giornaliero per modello comunicato da Cline è riconosciuto come `usage-limit`, evitando tentativi automatici contro il limite.
- La quota numerica dell'account resta `Unsupported`; il consumo per sessione non viene presentato come quota residua.
- Gavin non cambia automaticamente modello e non effettua fallback verso un modello a pagamento.
- La documentazione esplicita che selezione per idoneità, catalogo stabile e residuo numerico non sono disponibili tramite interfacce supportate verificate.
