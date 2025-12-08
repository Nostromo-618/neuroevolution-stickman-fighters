export enum FighterAction {
  IDLE = 0,
  MOVE_LEFT = 1,
  MOVE_RIGHT = 2,
  JUMP = 3,
  CROUCH = 4,
  PUNCH = 5,
  KICK = 6,
  BLOCK = 7
}

export interface NeuralNetwork {
  inputWeights: number[][];
  outputWeights: number[][];
  biases: number[];
}

export interface Genome {
  id: string;
  network: NeuralNetwork;
  fitness: number;
  matchesWon: number;
}

export interface GameState {
  player1Health: number;
  player2Health: number;
  player1Energy: number;
  player2Energy: number;
  timeRemaining: number;
  generation: number;
  bestFitness: number;
  matchActive: boolean;
  winner: 'Player 1' | 'Player 2' | null;
}

export type GameMode = 'TRAINING' | 'ARCADE';

export interface TrainingSettings {
  populationSize: number;
  mutationRate: number;
  simulationSpeed: number; // 1x, 2x, 10x, Max
  gameMode: GameMode;
  isRunning: boolean;
  backgroundTraining: boolean; // Train AI in background while playing arcade
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  action1: boolean; // Punch (X)
  action2: boolean; // Kick (B)
  action3: boolean; // Block (Trigger)
}