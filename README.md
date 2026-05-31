# cms-ts
Backend CMS giornalistico con autenticazione JWT, WordPress headless e integrazione AI (Google Gemini con Google Search).

---

## Requisiti
- [Laragon](https://laragon.org/) — per hostare WordPress in locale
- [Bun](https://bun.sh/) v1.3.14+
- [Bruno](https://www.usebruno.com/) — per testare le API

## Configurazione Laragon
### WordPress
1. Apri Laragon e avvia tutti i servizi
2. Menu → Creazione veloce → WordPress
3. Segui le istruzioni per creare l'account amministratore
4. Abilita HTTPS: Menu → Apache → SSL → Enabled

### Password delle applicazioni (admin)
Necessaria per permettere a cms-ts di creare utenti e password applicazione via API.

1. Pannello WordPress → Utenti → Il tuo profilo (account admin)
2. Scorri fino a **Password delle applicazioni**
3. Dai un nome (es. `cms-admin`) e genera la password
4. Conservala nel `.env` come `WP_ADMIN_PASSWORD`

---

## Installazione CMS-TS
```bash
bun install
```

Copia il file `.env.example` e compila le variabili:

---

## Database
La prima volta è necessario creare il database `cms_user` su MySQL (tramite phpMyAdmin o da terminale), poi eseguire:

```bash
bun run initdb
```

Questo comando crea automaticamente le tabelle necessarie.

---

## Avvio
Sviluppo:
```bash
bun run dev
```

Produzione:
```bash
bun run start
```

---

## Endpoint
Base URL: `http://localhost:3000/cms/v1`

| Metodo | Endpoint | Auth | Descrizione |
|--------|----------|------|-------------|
| `GET` | `/` | No | Stato dell'API |
| `GET` | `/posts` | No | Lista articoli da WordPress |
| `POST` | `/posts` | Si | Crea articolo su WordPress |
| `POST` | `/posts/preview` | Si | Preview AI dell'articolo tramite Gemini e Google Search |
| `POST` | `/auth/register` | No | Registra utente |
| `POST` | `/auth/login` | No | Login, restituisce cookie JWT |

---

## Flusso di lavoro
```
1. Registrazione → crea utente su WordPress + Application Password + salva nel DB
2. Login → verifica credenziali → JWT nel cookie (30 giorni)
3. Scrittura articolo → POST /posts → salva su WordPress
4. Preview AI → POST /posts/preview → Gemini migliora il testo con Google Search
5. Pubblicazione → L'autore sceglie tra testo originale o versione AI
```

---

## Integrazione AI
L'endpoint `/posts/preview` invia il contenuto dell'articolo a Google Gemini con Google Search attivo. Il modello arricchisce il testo con informazioni aggiornate da fonti online, senza salvare nulla su WordPress finché l'autore non approva.

> Per le REST API di WordPress: [REST API Handbook](https://developer.wordpress.org/rest-api/reference/)