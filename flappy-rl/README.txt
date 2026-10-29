Flappy Bird + Q-learning (frontend)
===================================

Progetto di stage: clone di Flappy Bird giocabile nel browser, con un agente
che impara a giocare tramite Q-learning (equazione di Bellman). Tutto avviene
lato client (React + TypeScript): logica di gioco, grafica, controllo umano
e addestramento dell'agente.

Versione di Node.js
-------------------
Node.js richiesto: 22.16.0 (vedi anche il file .nvmrc)

Verificare la versione installata:

    node -v

Dovrebbe stampare: v22.16.0

Installare e usare nvm (Node Version Manager)
---------------------------------------------
nvm permette di installare e selezionare una versione precisa di Node
senza sovrascrivere quella di sistema.

Windows (nvm-windows):
  1. Scaricare l'installer da:
     https://github.com/coreybutler/nvm-windows/releases
  2. Installare, poi aprire un nuovo terminale (PowerShell o cmd).
  3. Nella cartella del progetto (flappy-rl):

     nvm install 22.16.0
     nvm use 22.16.0
     node -v

macOS / Linux (nvm):
  1. Installare nvm:

     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

  2. Chiudere e riaprire il terminale, poi:

     nvm install 22.16.0
     nvm use
     node -v

  Il comando "nvm use" (senza numero) legge automaticamente il file .nvmrc.

Installazione del progetto
---------------------------
Windows (nvm-windows): nvm-windows non legge automaticamente .nvmrc.
Specificare quindi la versione:

  cd flappy-rl
  nvm use 22.16.0
  npm install
  npm run dev

macOS / Linux (nvm): dalla cartella del repository:

  cd flappy-rl
  nvm use
  npm install
  npm run dev

Aprire nel browser l'URL indicato da Vite (di solito http://localhost:5173/).

Altri comandi:

    npm run build     compilazione TypeScript + bundle di produzione
    npm run preview   anteprima del build

Come si gioca
-------------
- Modalità Umano: Spazio, freccia su o W per saltare (flap).
- Gravità e spinta sono modificabili nel pannello parametri. La spinta
  predefinita è 1 per rendere il controllo più accessibile.
- La velocità orizzontale aumenta di un delta parametrizzabile ogni N punti
  (come il T-Rex di Chrome).
- I record umano e Q-learning restano in memoria finché la scheda del browser
  è aperta. Il record Deep Q-learning è riservato alla futura implementazione.

Intelligenza artificiale
------------------------
L'addestramento Q-learning si avvia manualmente dal pannello dedicato:
si sceglie il numero di episodi, l'agente riavvia automaticamente la partita
tra un episodio e il successivo e l'utente può interrompere il processo.
Il training procede in piccoli blocchi per mantenere reattiva l'interfaccia.

  stato  = altezza uccello, dx, dy, velocità verticale (discretizzati)
  azione = Idle (0) oppure Salto (1)
  Q(s,a) ← Q(s,a) + α [ r + γ max_a' Q(s',a') − Q(s,a) ]

La Q-table e gli ultimi 8.000 passaggi del ReplayBuffer vengono salvati nel
localStorage del browser. Ogni caricamento riprende il modello e aggiunge
400 episodi di training. Il ReplayBuffer raccoglie i dati, mentre il Q-learning
tabellare aggiorna la Q-table online tramite Bellman.

Per cancellare il modello salvato e ripartire da zero, eseguire nella console
del browser:

  localStorage.removeItem('flappy-rl-training-v2')

Poi ricaricare la pagina.

Struttura (src/)
----------------
  components/   canvas, comandi, punteggio, parametri
  game/         Game, Bird, Pipe, physics
  controllers/  HumanController, AIController
  ai/           StateEncoder, QTable, QLearningAgent, trainer, ReplayBuffer
  i18n/         stringhe interfaccia (italiano)
