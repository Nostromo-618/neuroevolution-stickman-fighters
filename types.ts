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
 * NNArchitecture Interface
 * 
 * Describes the topology of a neural network. The input and output layers
 * are fixed (9 inputs for game state, 8 outputs for fighter actions), but
 * hidden layers are user-configurable via the Visual NN Editor.
 * 
 * Examples:
 * - Default:  { inputNodes: 9, hiddenLayers: [13, 13], outputNodes: 8 }
 * - Wide:     { inputNodes: 9, hiddenLayers: [50], outputNodes: 8 }
 * - Deep:     { inputNodes: 9, hiddenLayers: [20, 15, 10], outputNodes: 8 }
 * 
 * Constraints (enforced by UI):
 * - Hidden layers: 1-5 layers
 * - Nodes per layer: 4-50 nodes
 */
export interface NNArchitecture {
  readonly inputNodes: 12;    // Fixed: game state inputs (9 base + 3 delta)
  hiddenLayers: number[];     // User-configurable: e.g., [13, 13] or [20, 15, 10]
  readonly outputNodes: 8;    // Fixed: fighter action outputs
}

/**
 * Default architecture constant (12→16→16→8)
 */
export const DEFAULT_NN_ARCHITECTURE: NNArchitecture = {
  inputNodes: 12,
  hiddenLayers: [16, 16],
  outputNodes: 8
} as const;

/**
 * NeuralNetworkData Interface
 * 
 * Represents the "brain" of an AI fighter. This is a feedforward neural network
 * supporting 1-5 hidden layers with variable neuron counts per layer.
 * 
 * Example architectures:
 * - Default: 9 → 13 → 13 → 8 (2 hidden layers)
 * - Wide:    9 → 50 → 8 (1 hidden layer)
 * - Deep:    9 → 20 → 15 → 10 → 8 (3 hidden layers)
 * 
 * Weight structure:
 * - layerWeights[0]: input → hidden1 weights
 * - layerWeights[1]: hidden1 → hidden2 weights (if exists)
 * - layerWeights[N-1]: hiddenN → output weights
 * 
 * Bias structure:
 * - biases[0]: biases for hidden layer 1
 * - biases[1]: biases for hidden layer 2 (if exists)
 * - biases[N]: biases for output layer
 * 
 * During evolution, these weights are mutated and crossed over to create
 * new variations, allowing the AI to "learn" through natural selection.
 */
export interface NeuralNetworkData {
  architecture: NNArchitecture;   // The topology this network follows
  layerWeights: number[][][];     // weights[layer][fromNode][toNode]
  biases: number[][];             // biases[layer][node] (one array per layer after input)
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
/**
 * ArcadeStats Interface
 *
 * Tracks session performance across multiple matches (both Training and Arcade modes).
 */
export interface ArcadeStats {
  matchesPlayed: number;  // Total matches played in current session
  p1Wins: number;         // Number of P1 (left fighter) wins
  p2Wins: number;         // Number of P2 (right fighter) wins
}

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
  roundStatus: 'WAITING' | 'COUNTDOWN' | 'FIGHTING' | 'ROUND_END' | 'ENDED'; // Status of the current round
  matchesUntilEvolution: number; // Matches remaining until next evolution (Training mode only)
  arcadeStats: ArcadeStats; // Arcade mode win/loss tracking
  countdownValue: number | null; // Countdown display: 3, 2, 1, 0 (FIGHT!), null (hidden)
  currentMutationRate: number; // Current mutation rate (for display)
  recentBestFitness: number[]; // Recent best fitness values for plateau detection (last 10 generations)
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
 * - 'SIMPLE_AI': Standard 13-node neural network opponent
 * - 'CUSTOM_A': User-written custom Script A
 * - 'CUSTOM_B': User-written custom Script B
 */
export type OpponentType = 'SIMPLE_AI' | 'CUSTOM_A' | 'CUSTOM_B';

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
  opponentType: 'SIMPLE_AI' | 'CUSTOM_A' | 'CUSTOM_B'; // For Training Mode: Who does the AI fight against?
  // Arcade Mode Settings
  player1Type: 'HUMAN' | 'SIMPLE_AI' | 'CUSTOM_A' | 'CUSTOM_B';
  player2Type: 'SIMPLE_AI' | 'CUSTOM_A' | 'CUSTOM_B';
  isRunning: boolean;                // Is the evolution/game loop running?
  backgroundTraining: boolean;       // Continue training in background while playing arcade?
  turboTraining: boolean;            // Use parallel workers for training (no visualization)
  workerCount: number;               // Number of Web Workers for parallel training (1-8)
  intelligentMutation: boolean;      // Use adaptive mutation rate based on generation (default: true)
  autoStopEnabled: boolean;          // Auto-stop training after reaching generation limit (default: true)
  autoStopGeneration: number;        // Generation limit for auto-stop (default: 1000)
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

// =============================================================================
// FITNESS CONFIGURATION TYPES
// =============================================================================

/**
 * FitnessConfig Interface
 *
 * Defines the reward function for AI training. This controls how fighters
 * are scored during evolution, allowing customization of training behavior.
 *
 * Two categories of rewards:
 * 1. Per-frame shaping: Applied every game frame to guide moment-to-moment behavior
 * 2. Match-end bonuses: Applied when a match concludes to reward overall performance
 *
 * All values are additive to the genome's fitness score.
 */
export interface FitnessConfig {
  // PER-FRAME SHAPING REWARDS
  proximityReward400: number;   // Reward when distance < 400px (encourages approach)
  proximityReward200: number;   // Reward when distance < 200px (encourages engagement)
  proximityReward80: number;    // Reward when distance < 80px (encourages close combat)
  facingReward: number;         // Reward for facing opponent direction
  aggressionReward: number;     // Reward for attacking when in range (distance < 100px)
  timePenalty: number;          // Penalty per frame (negative, discourages stalling)
  edgePenalty: number;          // Penalty for being at arena edge (negative)
  centerBonus: number;          // Bonus for controlling arena center
  edgeThreshold: number;        // Distance from edge to trigger edge penalty (pixels)
  centerThreshold: number;      // Distance from center to get center bonus (pixels)

  // MATCH-END BONUSES
  damageMultiplier: number;     // Multiplier for damage dealt to opponent
  healthMultiplier: number;     // Multiplier for remaining health
  koWinBonus: number;           // Bonus for winning by knockout
  timeoutWinBonus: number;      // Bonus for winning by timeout (less than KO)
  stalematePenalty: number;     // Penalty for passive play (negative)
  stalemateThreshold: number;   // Minimum total damage to avoid stalemate penalty
}