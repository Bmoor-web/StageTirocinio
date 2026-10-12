import { useCallback, useEffect, useRef, useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameControls } from './components/GameControls';
import { ModeSelector } from './components/ModeSelector';
import { Score } from './components/Score';
import { HumanController } from './controllers/HumanController';
import { Game } from './game/Game';
import {
  DEFAULT_CONFIG,
  type GameSnapshot,
  type PlayMode,
} from './game/types';

function emptySnapshot(game: Game): GameSnapshot {
  return game.snapshot();
}

export default function App() {
  const gameRef = useRef<Game | null>(null);
  const controllerRef = useRef<HumanController | null>(null);
  const timerRef = useRef<number | null>(null);

  const [mode, setMode] = useState<PlayMode>('human');
  const [running, setRunning] = useState(false);
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);

  // Init moteur + contrôleur humain
  useEffect(() => {
    const game = new Game(DEFAULT_CONFIG);
    gameRef.current = game;
    const controller = new HumanController();
    controllerRef.current = controller;
    setSnapshot(emptySnapshot(game));

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
      controller.dispose();
    };
  }, []);

  const stopLoop = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
  }, []);

  const tick = useCallback(() => {
    const game = gameRef.current;
    const controller = controllerRef.current;
    if (!game || !controller) return;

    const action = controller.getAction();
    const alive = game.step(action);
    setSnapshot(game.snapshot());

    if (!alive) {
      stopLoop();
    }
  }, [stopLoop]);

  const start = useCallback(() => {
    if (running) return;
    const game = gameRef.current;
    if (!game || !game.bird.alive) return;

    setRunning(true);
    timerRef.current = window.setInterval(tick, game.config.tickMs);
  }, [running, tick]);

  const restart = useCallback(() => {
    stopLoop();
    const game = gameRef.current;
    const controller = controllerRef.current;
    if (!game) return;
    game.reset();
    controller?.reset();
    setSnapshot(game.snapshot());
  }, [stopLoop]);

  const flap = useCallback(() => {
    controllerRef.current?.requestFlap();
    // Auto-start au premier flap si pas encore lancé
    if (!running && gameRef.current?.bird.alive) {
      start();
    }
  }, [running, start]);

  // Espace démarre aussi la partie si elle n'a pas commencé
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') &&
        !running &&
        gameRef.current?.bird.alive
      ) {
        start();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, start]);

  if (!snapshot) {
    return (
      <div className="container py-5 text-center text-muted">Chargement…</div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 640 }}>
      <header className="text-center mb-3">
        <h1 className="h3 mb-1">Flappy Bird — Q-learning</h1>
        <p className="text-muted small mb-0">
          Version humaine (base). Espace / ↑ / W pour flapper.
        </p>
      </header>

      <div className="text-center">
        <ModeSelector mode={mode} onChange={setMode} />
      </div>

      <Score
        score={snapshot.score}
        dx={snapshot.dx}
        dy={snapshot.dy}
        lastAction={snapshot.lastAction}
        alive={snapshot.bird.alive}
      />

      <GameCanvas snapshot={snapshot} config={DEFAULT_CONFIG} />

      <GameControls
        running={running}
        alive={snapshot.bird.alive}
        onStart={start}
        onRestart={restart}
        onFlap={flap}
      />

      {!snapshot.bird.alive && (
        <p className="text-center text-danger mt-3 mb-0 fw-semibold">
          Crash ! Score final : {snapshot.score} — clique Rejouer.
        </p>
      )}
    </div>
  );
}
