/**
 * =============================================================================
 * TYPES.TS - Core Type Definitions
 * =============================================================================
 * 
 * This file defines all TypeScript interfaces and enums used throughout the
 * NeuroFight Evolution project. These types provide type safety and serve as
 * documentation for the data structures used in the game.
 * 
 * The types are organized into categories:
 * 1. Fighter Actions - Possible states/actions a fighter can be in
 * 2. Neural Network - Structure of the AI brain
 * 3. Genome - A complete AI "individual" with its brain and stats
 * 4. Game State - Current state of a match
 * 5. Settings - User-configurable training parameters
 * 6. Input - Player/AI control signals
 */

// =============================================================================
// FIGHTER ACTIONS
// =============================================================================

/**
 * FighterAction Enum
 * 
 * Represents all possible states a fighter can be in during combat.
 * The numeric values (0-7) are important because they map directly to:
 * 1. Neural network outputs (8 output nodes, one per action)
 * 2. Animation states in the renderer
 * 
 * The AI's neural network outputs a probability (0-1) for each action,
 * and actions with probability > 0.5 are activated.
 */
export enum FighterAction {
  IDLE = 0,        // Standing still, default state
  MOVE_LEFT = 1,   // Walking/running left
  MOVE_RIGHT = 2,  // Walking/running right
  JUMP = 3,        // Jumping (costs significant energy)
  CROUCH = 4,      // Ducking down
  PUNCH = 5,       // Quick attack, lower damage, faster
  KICK = 6,        // Strong attack, higher damage, slower
  BLOCK = 7        // Defensive stance, reduces incoming damage
}

// =============================================================================
// NEURAL NETWORK TYPES
// =============================================================================

/**
 * NeuralNetwork Interface
 * 
 * Represents the "brain" of an AI fighter. This is a simple feedforward
 * neural network with one hidden layer:
 * 
 *   INPUT (9 nodes) → HIDDEN (13 nodes) → OUTPUT (8 nodes)
 * 
 * The weights determine how signals flow through the network:
 * - inputWeights: Connections from input layer to hidden layer [9x13 matrix]
 * - outputWeights: Connections from hidden layer to output [13x8 matrix]
 * - biases: Offset values added at each neuron [13 hidden + 8 output = 21 total]
 * 
 * During evolution, these weights are mutated and crossed over to create
 * new variations, allowing the AI to "learn" through natural selection.
 */
export interface NeuralNetworkData {
  inputWeights: number[][];   // 9 inputs × 16 hidden neurons
  outputWeights: number[][];  // 16 hidden × 8 output neurons
  biases: number[];           // 24 bias values (16 hidden + 8 output)
}

/**
 * Genome Interface
 * 
 * A "genome" in evolutionary computing represents a complete individual.
 * In our case, each genome is an AI fighter with:
 * - A neural network (its brain)
 * - Fitness score (how well it performed - higher = better)
 * - Match statistics
 * 
 * During evolution:
 * 1. Genomes compete in fights
 * 2. Winners get higher fitness scores
 * 3. Top performers are selected to "reproduce"
 * 4. Their neural networks are combined (crossover) and modified (mutation)
 * 5. This creates the next generation
 */
export interface Genome {
  id: string;              // Unique identifier (e.g., "gen5-3" = generation 5, individual 3)
  network: NeuralNetworkData;  // The AI's neural network
  fitness: number;         // Accumulated fitness score (higher = better)
  matchesWon: number;      // Number of matches won by this genome
}

// =============================================================================
// GAME STATE TYPES
// =============================================================================

/**
 * GameState Interface
 * 
 * Represents the current state of a match, displayed in the UI.
 * This is updated every frame and drives the HUD (health bars, timer, etc.)
 */
export interface GameState {
  player1Health: number;    // P1 health (0-100)
  player2Health: number;    // P2 health (0-100)
  player1Energy: number;    // P1 energy for actions (0-100)
  player2Energy: number;    // P2 energy for actions (0-100)
  timeRemaining: number;    // Seconds left in the match
  generation: number;       // Current generation number in training
  bestFitness: number;      // Highest fitness achieved so far
  matchActive: boolean;     // Whether a match is currently in progress
  winner: 'Player 1' | 'Player 2' | null;  // Match result
  roundStatus: 'WAITING' | 'FIGHTING' | 'ENDED'; // Status of the current round
}

// =============================================================================
// SETTINGS TYPES
// =============================================================================

/**
 * GameMode Type
 * 
 * Two modes of operation:
 * - TRAINING: AI vs AI, automated matches, population evolves
 * - ARCADE: Human vs AI, play against the best trained fighter
 */
export type GameMode = 'TRAINING' | 'ARCADE';

/**
 * OpponentType - Who the player/AI fights against in TRAINING mode
 * 
 * - 'AI': Neural network controlled opponent (the trained or random NN)
 * - 'CUSTOM_A': User-written custom Script A
 * - 'CUSTOM_B': User-written custom Script B
 */
export type OpponentType = 'AI' | 'CUSTOM_A' | 'CUSTOM_B';

/**
 * TrainingSettings Interface
 * 
 * User-configurable parameters that control the training process.
 * These can be adjusted in real-time through the Dashboard UI.
 */
export interface TrainingSettings {
  populationSize: number;     // Number of AI genomes per generation (default: 48)
  mutationRate: number;       // Probability of mutating each weight (0-1)
  hiddenLayers: number[];
  fps: number;
  simulationSpeed: number;           // Physics steps per frame (1 = normal, >1 = fast forward)
  gameMode: GameMode;                // 'TRAINING' or 'ARCADE'
  opponentType: 'AI' | 'CUSTOM_A' | 'CUSTOM_B'; // For Training Mode: Who does the AI fight against?
  // Arcade Mode Settings
  player1Type: 'HUMAN' | 'AI' | 'CUSTOM_A' | 'CUSTOM_B';
  player2Type: 'AI' | 'CUSTOM_A' | 'CUSTOM_B';
  isRunning: boolean;                // Is the evolution/game loop running?
  backgroundTraining: boolean;       // Continue training in background while playing arcade?
}

// =============================================================================
// INPUT TYPES
// =============================================================================

/**
 * InputState Interface
 * 
 * Represents the control signals for a fighter at a given moment.
 * Can come from:
 * - Human player (keyboard/gamepad via InputManager)
 * - AI player (neural network output converted to booleans)
 * 
 * Note: Multiple inputs can be true simultaneously (e.g., moving + punching)
 */
export interface InputState {
  left: boolean;     // Move left (Arrow Left, A, or D-pad left)
  right: boolean;    // Move right (Arrow Right, D, or D-pad right)
  up: boolean;       // Jump (Arrow Up, W, Space, or A button)
  down: boolean;     // Crouch (Arrow Down, S, or D-pad down)
  action1: boolean;  // Punch (J, Space, X button)
  action2: boolean;  // Kick (K, B button)
  action3: boolean;  // Block (L, Shift, RB/RT)
}