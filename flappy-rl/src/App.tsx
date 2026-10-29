import { useCallback, useEffect, useRef, useState } from 'react';
import { QLearningAgent } from './ai/QLearningAgent';
import { ReplayBuffer } from './ai/ReplayBuffer';
import { encodeState } from './ai/StateEncoder';
import {
  loadTrainingCheckpoint,
  saveTrainingCheckpoint,
} from './ai/TrainingStore';
import { rewardFromTransition, trainQLearning } from './ai/trainer';
import type { TrainStats } from './ai/types';
import { GameCanvas } from './components/GameCanvas';
import { GameControls } from './components/GameControls';
import { ModeSelector } from './components/ModeSelector';
import { PhysicsParams } from './components/PhysicsParams';
import { RecordsBar, type SessionRecords } from './components/RecordsBar';
import { Score } from './components/Score';
import { AIController } from './controllers/AIController';
import { HumanController } from './controllers/HumanController';
import { Game } from './game/Game';
import {
  DEFAULT_CONFIG,
  type GameConfig,
  type GameSnapshot,
  type PlayMode,
} from './game/types';
import { it } from './i18n/it';

const TRAIN_MAX_STEPS = 600;
const TRAIN_CHUNK = 5;

export default function App() {
  const gameRef = useRef<Game | null>(null);
  const humanRef = useRef<HumanController | null>(null);
  const aiRef = useRef<AIController | null>(null);
  const agentRef = useRef<QLearningAgent | null>(null);
  const bufferRef = useRef<ReplayBuffer | null>(null);
  const timerRef = useRef<number | null>(null);
  const trainingTimeoutRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const trainingRef = useRef(false);
  const modeRef = useRef<PlayMode>('human');

  const [mode, setMode] = useState<PlayMode>('human');
  const [running, setRunning] = useState(false);
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [configDraft, setConfigDraft] = useState<GameConfig>(DEFAULT_CONFIG);
  const [activeConfig, setActiveConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [records, setRecords] = useState<SessionRecords>({
    human: 0,
    qlearning: 0,
    dqn: 0,
  });
  const [training, setTraining] = useState(false);
  const [episodeTarget, setEpisodeTarget] = useState(400);
  const [trainingTarget, setTrainingTarget] = useState(0);
  const [trainProgress, setTrainProgress] = useState(0);
  const [trainStats, setTrainStats] = useState<TrainStats | null>(null);
  const trainStatsRef = useRef<TrainStats | null>(null);

  modeRef.current = mode;
  runningRef.current = running;

  const stopLoop = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    runningRef.current = false;
    setRunning(false);
  }, []);

  const stopTraining = useCallback(() => {
    if (trainingTimeoutRef.current !== null) {
      window.clearTimeout(trainingTimeoutRef.current);
      trainingTimeoutRef.current = null;
    }
    trainingRef.current = false;
    setTraining(false);
    const agent = agentRef.current;
    const buffer = bufferRef.current;
    if (agent && buffer) {
      saveTrainingCheckpoint(agent, buffer, trainStatsRef.current);
    }
  }, []);

  const startTraining = useCallback(() => {
    const agent = agentRef.current;
    const buffer = bufferRef.current;
    if (!agent || !buffer || trainingRef.current) return;

    const target = Math.min(100000, Math.max(1, Math.floor(episodeTarget)));
    trainingRef.current = true;
    setTraining(true);
    setTrainProgress(0);
    setTrainingTarget(target);
    agent.resetExploration();
    let completed = 0;
    let cumulativeStats = trainStatsRef.current;

    const runChunk = () => {
      if (!trainingRef.current) return;
      const count = Math.min(TRAIN_CHUNK, target - completed);
      const stats = trainQLearning(agent, buffer, {
        episodes: count,
        maxSteps: TRAIN_MAX_STEPS,
        config: DEFAULT_CONFIG,
      });
      completed += count;
      setTrainProgress(completed);
      cumulativeStats = {
        episodes: (cumulativeStats?.episodes ?? 0) + stats.episodes,
        steps: (cumulativeStats?.steps ?? 0) + stats.steps,
        bestScore: Math.max(cumulativeStats?.bestScore ?? 0, stats.bestScore),
        lastScore: stats.lastScore,
        tableSize: stats.tableSize,
      };
      trainStatsRef.current = cumulativeStats;
      setTrainStats(cumulativeStats);
      saveTrainingCheckpoint(agent, buffer, cumulativeStats);

      if (completed >= target) {
        agent.hp.epsilon = 0.02;
        trainingRef.current = false;
        trainingTimeoutRef.current = null;
        setTraining(false);
      } else {
        trainingTimeoutRef.current = window.setTimeout(runChunk, 0);
      }
    };

    trainingTimeoutRef.current = window.setTimeout(runChunk, 0);
  }, [episodeTarget]);

  const noteRecord = useCallback((playMode: PlayMode, score: number) => {
    if (playMode === 'dqn') return;
    setRecords((prev) => {
      const key = playMode === 'human' ? 'human' : 'qlearning';
      if (score <= prev[key]) return prev;
      return { ...prev, [key]: score };
    });
  }, []);

  const tick = useCallback(() => {
    const game = gameRef.current;
    const human = humanRef.current;
    const ai = aiRef.current;
    const agent = agentRef.current;
    const buffer = bufferRef.current;
    if (!game || !human || !ai || !agent || !buffer) return;

    const prevSnap = game.snapshot();
    const prevScore = prevSnap.score;
    const playMode = modeRef.current;

    const action =
      playMode === 'qlearning'
        ? ai.selectAction(prevSnap, true)
        : human.getAction();

    const alive = game.step(action);
    const nextSnap = game.snapshot();
    setSnapshot(nextSnap);

    if (playMode === 'qlearning') {
      const scored = nextSnap.score > prevScore;
      const exp = {
        state: encodeState(prevSnap),
        action,
        reward: rewardFromTransition(alive, scored),
        nextState: encodeState(nextSnap),
        done: !alive,
      };
      buffer.push(exp);
      agent.learn(exp);
    }

    if (!alive) {
      noteRecord(playMode, nextSnap.score);
      if (playMode === 'qlearning') {
        saveTrainingCheckpoint(agent, buffer, trainStatsRef.current);
      }
      stopLoop();
    }
  }, [noteRecord, stopLoop]);

  const tickRef = useRef(tick);
  tickRef.current = tick;

  const start = useCallback(() => {
    if (runningRef.current) return;
    const game = gameRef.current;
    if (!game || !game.bird.alive) return;

    runningRef.current = true;
    setRunning(true);
    timerRef.current = window.setInterval(
      () => tickRef.current(),
      game.config.tickMs,
    );
  }, []);

  const restart = useCallback(() => {
    stopLoop();
    const game = gameRef.current;
    if (!game) return;
    game.applyConfig(configDraft);
    game.reset();
    humanRef.current?.reset();
    setActiveConfig({ ...game.config });
    setSnapshot(game.snapshot());
  }, [configDraft, stopLoop]);

  const flap = useCallback(() => {
    if (modeRef.current !== 'human') return;
    humanRef.current?.requestFlap();
    if (!runningRef.current && gameRef.current?.bird.alive) {
      start();
    }
  }, [start]);

  const changeMode = useCallback(
    (next: PlayMode) => {
      if (next === 'dqn') return;
      setMode(next);
      restart();
    },
    [restart],
  );

  useEffect(() => {
    const game = new Game(DEFAULT_CONFIG);
    const human = new HumanController();
    const agent = new QLearningAgent();
    const buffer = new ReplayBuffer(8000);
    const checkpoint = loadTrainingCheckpoint();
    agent.table.restore(checkpoint?.table);
    buffer.restore(checkpoint?.experiences);
    trainStatsRef.current = checkpoint?.stats ?? null;
    setTrainStats(trainStatsRef.current);
    const ai = new AIController(agent);

    gameRef.current = game;
    humanRef.current = human;
    agentRef.current = agent;
    bufferRef.current = buffer;
    aiRef.current = ai;
    setSnapshot(game.snapshot());

    return () => {
      trainingRef.current = false;
      if (trainingTimeoutRef.current !== null) {
        window.clearTimeout(trainingTimeoutRef.current);
      }
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      human.dispose();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') &&
        !runningRef.current &&
        gameRef.current?.bird.alive &&
        modeRef.current === 'human'
      ) {
        start();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [start]);

  if (!snapshot) {
    return (
      <div className="container py-5 text-center text-muted">{it.loading}</div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <header className="text-center mb-3">
        <h1 className="h3 mb-1">{it.title}</h1>
        <p className="text-muted small mb-0">{it.subtitle}</p>
      </header>

      {training && (
        <div className="alert alert-info py-2">
          {it.training}: {it.trainingRun} {trainProgress}/{episodeTarget}
        </div>
      )}
      {!training && trainProgress > 0 && trainProgress < trainingTarget && (
        <div className="alert alert-warning py-2">
          {it.trainingStopped}: {trainProgress}/{trainingTarget}
        </div>
      )}
      {!training && trainStats && (
        <div className="alert alert-success py-2 small mb-3">
          {it.training}: {it.trainingDone} — {it.episodes} {trainStats.episodes},{' '}
          {it.qStates} {trainStats.tableSize}, {it.trainBest}{' '}
          {trainStats.bestScore}
          <div>{it.trainingSaved}</div>
        </div>
      )}

      <div className="d-flex flex-wrap gap-2 align-items-end justify-content-center mb-3">
        <div>
          <label className="form-label small mb-1" htmlFor="training-episodes">
            {it.episodeTarget}
          </label>
          <input
            id="training-episodes"
            className="form-control form-control-sm"
            type="number"
            min={1}
            max={100000}
            step={100}
            value={episodeTarget}
            onChange={(event) =>
              setEpisodeTarget(
                Math.min(100000, Math.max(1, Number(event.target.value) || 1)),
              )
            }
            disabled={training}
          />
        </div>
        <button
          type="button"
          className="btn btn-sm btn-success"
          onClick={startTraining}
          disabled={training}
        >
          {it.startTraining}
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={stopTraining}
          disabled={!training}
        >
          {it.stopTraining}
        </button>
      </div>

      <RecordsBar records={records} />

      <div className="text-center">
        <ModeSelector mode={mode} onChange={changeMode} disabled={training} />
      </div>

      <Score
        score={snapshot.score}
        dx={snapshot.dx}
        dy={snapshot.dy}
        lastAction={snapshot.lastAction}
        alive={snapshot.bird.alive}
        velY={snapshot.bird.velY}
        horizontalSpeed={snapshot.horizontalSpeed}
      />

      <GameCanvas snapshot={snapshot} config={activeConfig} />

      <GameControls
        running={running}
        alive={snapshot.bird.alive && !training}
        humanMode={mode === 'human'}
        onStart={start}
        onRestart={restart}
        onFlap={flap}
      />

      {!snapshot.bird.alive && (
        <p className="text-center text-danger mt-3 mb-0 fw-semibold">
          {it.crash}: {snapshot.score} {it.replayHint}
        </p>
      )}

      <PhysicsParams
        draft={configDraft}
        onChange={setConfigDraft}
        onApply={restart}
        disabled={running || training}
      />
    </div>
  );
}
