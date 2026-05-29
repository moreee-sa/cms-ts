# cms-ts
## Installazione dipendenze
```bash
bun install
```

## Avvio
Se si vuole avviare in dev mode
```bash
bun run dev
```

Se si vuole avviare la dist
```bash
bun run build
bun run start
```

## Errore bundle
E' stato aggiunto nello script build `--external express` che serve ad escludere express dal bundle finale.
Se si vuole includere express nel bundle finale, rimuovi `--external express` e aggiungi `--target=bun`