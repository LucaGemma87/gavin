# Applicazioni agentiche e runtime per modelli gratuiti/locali

**Verifica delle fonti:** 3 novembre 2026
**Scopo:** confrontare applicazioni e runtime affini a Gavin, verificando punti di forza riutilizzabili e limiti che contano per un uso gratuito o locale. Le affermazioni rimandano alla documentazione ufficiale dei rispettivi progetti.

## Sintesi

Il vantaggio di Gavin non dovrebbe essere un altro catalogo di modelli, ma una flotta di agenti visibile e coordinata con una policy economica applicata a ogni avvio. Le soluzioni confrontate mostrano cinque spunti concreti: l'onboarding locale guidato di Cline Desktop, la varietà di provider e agenti di OpenCode, i ruoli e i controlli espliciti di Continue, il flusso Git focalizzato di Aider e la delega a modalità specializzate di Roo Code.

Distinguere sempre **software gratuito**, **modello open-weight**, **inferenza locale** e **quota cloud gratuita**. Nessuno implica automaticamente gli altri; le offerte cloud possono avere limiti o cambiare. Inferenza locale evita il costo per richiesta del provider, ma usa le risorse del dispositivo e richiede di scaricare i modelli.

## Applicazioni e agenti

| Prodotto | Punti di forza documentati | Limiti e cautele | Lezione per Gavin |
|---|---|---|---|
| **Cline Desktop** | Offre sessioni parallele, attività pianificate e un percorso guidato per scaricare/selezionare modelli da Ollama o LM Studio, avviare il runtime e osservare memoria, contesto, quantizzazione, capacità e licenza. ([Desktop](https://docs.cline.bot/usage/cline-desktop), [modelli locali](https://docs.cline.bot/usage/cline-desktop-local-models)) | Le offerte gratuite sono limitate e variabili; la documentazione descrive anche piani, crediti e chiavi proprie dopo l'esaurimento della quota. L'accesso gratuito non è la stessa cosa di inferenza locale. ([modelli gratuiti](https://docs.cline.bot/getting-started/free-models)) | Rendere installazione, caricamento e requisiti del modello comprensibili senza nascondere la quota o la licenza. |
| **OpenCode** | Harness CLI con un ampio catalogo di provider, configurazione esplicita provider/modello, modelli locali, agenti primari e sub-agenti configurabili, e server MCP locali o remoti. ([Modelli](https://opencode.ai/docs/models/), [provider](https://opencode.ai/docs/providers/), [agenti](https://opencode.ai/docs/agents/), [MCP](https://opencode.ai/docs/mcp-servers/)) | Le autorizzazioni configurabili non sono una garanzia di non spesa. La documentazione descrive permessi predefiniti e l'opzione `--auto`, che approva le richieste non negate esplicitamente. ([permessi](https://opencode.ai/docs/permissions/)) | Riutilizzare provider/runtime interoperabili dove utile; mantenere in Gavin la policy economica e i controlli centralizzati. |
| **Continue** | Estensione IDE e CLI con Chat, Plan in sola lettura e Agent con strumenti; in Agent i permessi sui tool vengono richiesti per impostazione predefinita. I modelli hanno ruoli diversi e il prodotto evidenzia incompatibilità con le capacità agentiche richieste. Supporta Ollama e MCP. ([Agent mode](https://docs.continue.dev/ide-extensions/agent/quick-start), [modelli](https://docs.continue.dev/customize/models), [Ollama](https://docs.continue.dev/customize/model-providers/top-level/ollama), [MCP](https://docs.continue.dev/customize/mcp-tools)) | Le capacità dipendono da modello e provider; il catalogo da solo non prova il supporto ai tool. La configurazione locale può richiedere attenzione a contesto e memoria. ([Ollama](https://docs.continue.dev/customize/model-providers/top-level/ollama)) | Instradare per ruolo/tipo di task e verificare le capacità prima di raccomandare un modello. |
| **Aider** | CLI focalizzata su Git: selezione dei file di contesto, repo-map, revisione delle modifiche, commit e annullamento (`/undo`); permette di cambiare modello e usare modelli locali. La guida raccomanda di limitare il contesto per ridurre token e costo. ([Uso](https://aider.chat/docs/usage.html)) | Flusso da terminale, non desktop; qualità e capacità agentiche variano con il modello scelto. ([Uso](https://aider.chat/docs/usage.html)) | Preservare un contesto mirato e un flusso Git comprensibile, senza perdere la supervisione del risultato. |
| **Roo Code** | La modalità Boomerang/Orchestrator delega a modalità specializzate e restituisce un riepilogo al genitore. ([Boomerang Tasks](https://docs.roocode.com/features/boomerang-tasks)) | L'handoff descritto non equivale a una flotta visibile schedulata. La documentazione avverte che l'auto-approvazione può causare perdita di dati o peggio, in particolare con azioni terminali. ([Boomerang Tasks](https://docs.roocode.com/features/boomerang-tasks), [auto-approvazione](https://docs.roocode.com/features/auto-approving-actions)) | Prendere ispirazione da ruoli e sintesi tra agenti, ma non aggirare i gate e le richieste di conferma di Gavin. |

## Runtime locali e provider gratuiti

- **Ollama** espone un server/API locale; le chiamate locali non richiedono API key, mentre le richieste cloud la richiedono. Documenta tool calling, incluso il parallel tool calling. La pagina prezzi separa l'uso locale senza tariffa del servizio dall'uso cloud a consumo. ([API](https://docs.ollama.com/api/introduction), [tool calling](https://docs.ollama.com/capabilities/tool-calling), [prezzi](https://ollama.com/pricing))
- **LM Studio** combina un'app desktop, gestione dei modelli e un server locale con API REST e compatibilità API OpenAI. La documentazione segnala che l'autenticazione API è disattivata per impostazione predefinita; per esporre il server oltre la macchina locale va configurato un token. ([server](https://lmstudio.ai/docs/developer/core/server), [REST quickstart](https://lmstudio.ai/docs/developer/rest/quickstart), [compatibilità OpenAI](https://lmstudio.ai/docs/developer/openai-compat))
- **OpenRouter** è un provider ospitato, non inferenza locale. Il catalogo permette filtri per parametri supportati, incluse capacità legate all'uso di tool; le varianti `:free` sono voci identificabili. L'endpoint ufficiale per la chiave espone contatori di richieste gratuite e budget, ma i limiti possono essere condivisi e le richieste gratuite possono fallire se il saldo è negativo. ([modelli](https://openrouter.ai/docs/guides/overview/models), [limiti](https://openrouter.ai/docs/api_reference/limits))

## Indicazioni per Gavin

1. **Partire dal locale:** prototipare un setup verificabile con un runtime già disponibile (OpenCode/Ollama o LM Studio), chiedendo consenso per installazione e download e dichiarando RAM, spazio e capacità del modello.
2. **Etichettare con provenienza:** distinguere locale, quota cloud gratuita, quota d'abbonamento, a pagamento e sconosciuto. La compatibilità OpenAI/MCP aiuta a integrare, ma non certifica capacità, privacy o costo.
3. **Governare la flotta:** applicare policy e limiti alle card, ai rail, ai tool e al fan-out Best-of-N; mostrare la quota esposta prima dei lanci paralleli.
4. **Raccomandare in base al lavoro:** confrontare modelli per task e capacità misurata, non in base a un catalogo o all'etichetta “free”.
5. **Non confondere sicurezza con prezzo:** permessi e conferme limitano azioni dell'agente; non dimostrano che un'inferenza remota sia gratuita.

## Fonti e limiti

Le fonti sono pagine ufficiali dei prodotti citati; i limiti, i modelli, i piani e le condizioni possono cambiare dopo la data di verifica. Prima di implementare una specifica integrazione va riletta la documentazione corrente, in particolare per quote, prezzi, raccolta dati e licenze dei pesi.

Per l'analisi di Gavin e il piano di prodotto, vedere [2026-11-01-free-agents-and-models.md](./2026-11-01-free-agents-and-models.md).
