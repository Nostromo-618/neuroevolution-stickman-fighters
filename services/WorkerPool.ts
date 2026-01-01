/**
 * =============================================================================
 * WORKER POOL - Parallel Training Coordinator
 * =============================================================================
 * 
 * This module manages a pool of Web Workers for parallel match simulation.
 * It distributes match jobs across multiple CPU cores and collects results.
 * 
 * WORKER POOL PATTERN
 * -------------------
 * Instead of creating/destroying workers for each task:
 * 1. Create a fixed pool of workers at startup
 * 2. Distribute jobs across available workers
 * 3. Collect results as workers complete
 * 4. Reuse workers for next batch
 * 
 * Benefits:
 * - No overhead of creating/destroying workers
 * - Automatic load balancing
 * - Scales with CPU cores
 * - Clean async/await interface
 * 
 * PARALLELIZATION STRATEGY
 * ------------------------
 * Jobs are divided evenly among workers:
 * 
 *   Example: 12 matches, 4 workers
 *   Worker 0: matches 0-2
 *   Worker 1: matches 3-5
 *   Worker 2: matches 6-8
 *   Worker 3: matches 9-11
 * 
 * Each worker runs its matches sequentially, but all workers
 * run in parallel. This is efficient because:
 * - Match simulation is CPU-bound
 * - No shared state between matches
 * - Each core can run at 100%
 * 
 * =============================================================================
 */

import type { Genome } from '../types';
import TrainingWorker from './TrainingWorker.ts?worker';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Match job - describes one match to simulate
 */
interface MatchJob {
  jobId: number;       // Unique ID for matching results
  genome1: Genome;     // First fighter's genome
  genome2: Genome;     // Second fighter's genome
  spawn1X: number;     // Spawn position for fighter 1
  spawn2X: number;     // Spawn position for fighter 2
}

/**
 * Match result - outcome from simulated match
 */
interface MatchResult {
  jobId: number;
  genome1Fitness: number;
  genome2Fitness: number;
  genome1Won: boolean;
  genome2Won: boolean;
  genome1Health: number;
  genome2Health: number;
}

/**
 * Callback type for result collection
 */
type WorkerPoolCallback = (results: MatchResult[]) => void;

// =============================================================================
// WORKER POOL CLASS
// =============================================================================

/**
 * WorkerPool
 * 
 * Manages a pool of Web Workers for parallel match simulation.
 * Provides a clean Promise-based interface for running batches of matches.
 * 
 * Usage:
 * ```
 * const pool = new WorkerPool();
 * await pool.runMatches(jobs);
 * pool.terminate();  // When done
 * ```
 */
export class WorkerPool {
  /** Array of active Web Workers */
  private workers: Worker[] = [];

  /** Number of workers in the pool */
  private workerCount: number;

  /** Queue of pending jobs (not currently used, reserved for future) */
  private pendingJobs: MatchJob[] = [];

  /** Map of active jobs per worker (for tracking) */
  private activeJobs: Map<number, MatchJob[]> = new Map();

  /** Collected results from current batch */
  private results: MatchResult[] = [];

  /** Callback to invoke when batch completes */
  private callback: WorkerPoolCallback | null = null;

  /** Expected number of results for current batch */
  private expectedResults: number = 0;

  /** Whether currently processing a batch */
  private isProcessing: boolean = false;

  /** Set of worker IDs that have signaled ready */
  private readyWorkers: Set<number> = new Set();

  /**
   * Creates a new WorkerPool
   * 
   * @param workerCount - Number of workers (default: hardware cores, max 8)
   */
  constructor(workerCount?: number) {
    // Use available CPU cores, but cap at 8 to avoid overhead
    // More workers = more parallelism, but also more memory & context switching
    this.workerCount = workerCount ?? Math.min(navigator.hardwareConcurrency || 4, 8);
    this.initWorkers();
  }

  /**
   * Initializes the worker pool
   * 
   * Creates Web Worker instances from TrainingWorker.ts.
   * Each worker runs in a separate thread.
   */
  private initWorkers() {
    for (let i = 0; i < this.workerCount; i++) {
      // Create worker from the TrainingWorker module
      // Vite handles bundling the worker code correctly
      const worker = new TrainingWorker();

      const workerId = i;
      if (!worker) throw new Error('Worker creation failed');

      // Set up message handler for this worker
      worker.onmessage = (messageEvent: MessageEvent) => {
        this.handleWorkerMessage(workerId, messageEvent.data);
      };

      // Log errors from workers
      worker.onerror = (error: ErrorEvent) => {
        console.error(`Worker ${workerId} error:`, error);
      };

      this.workers.push(worker);
    }
  }

  /**
   * Handles messages received from workers
   * 
   * @param workerId - Which worker sent the message
   * @param data - Message payload
   */
  private handleWorkerMessage(workerId: number, data: { type: string; results?: MatchResult[] }) {
    if (data.type === 'ready') {
      // Worker initialized and ready for jobs
      this.readyWorkers.add(workerId);
      return;
    }

    if (data.type === 'matchResults' && data.results) {
      // Collect results from this worker
      this.results.push(...data.results);

      // Check if all expected results are in
      if (this.results.length >= this.expectedResults) {
        this.isProcessing = false;

        // Invoke callback with all results
        if (this.callback) {
          const cb = this.callback;
          this.callback = null;
          cb(this.results);
        }
      }
    }
  }

  /**
   * Runs a batch of matches in parallel across workers
   * 
   * DISTRIBUTION ALGORITHM:
   * 1. Divide jobs evenly: ceil(totalJobs / workerCount)
   * 2. Assign each worker a slice of jobs
   * 3. Send jobs to workers in parallel
   * 4. Wait for all results to return
   * 
   * @param jobs - Array of match jobs to run
   * @returns Promise resolving to all match results
   */
  async runMatches(jobs: MatchJob[]): Promise<MatchResult[]> {
    return new Promise((resolve) => {
      if (jobs.length === 0) {
        resolve([]);
        return;
      }

      // Reset state for new batch
      this.results = [];
      this.expectedResults = jobs.length;
      this.isProcessing = true;
      this.callback = resolve;

      // Calculate jobs per worker
      const jobsPerWorker = Math.ceil(jobs.length / this.workerCount);

      // Distribute jobs to workers
      for (let i = 0; i < this.workerCount; i++) {
        const start = i * jobsPerWorker;
        const end = Math.min(start + jobsPerWorker, jobs.length);
        const workerJobs = jobs.slice(start, end);

        // Only send if worker has jobs to do
        if (workerJobs.length > 0) {
          this.workers[i].postMessage({ type: 'runMatches', jobs: workerJobs });
        }
      }
    });
  }

  /**
   * Creates match jobs from a population
   * 
   * PAIRING STRATEGY:
   * - Fighters are paired sequentially: 0 vs 1, 2 vs 3, etc.
   * - Odd population: last genome fights random opponent
   * - Spawn positions have random offsets for variety
   * 
   * @param population - Array of genomes to create matches from
   * @returns Array of match jobs
   */
  static createJobsFromPopulation(population: Genome[]): MatchJob[] {
    const jobs: MatchJob[] = [];
    const popSize = population.length;

    for (let i = 0; i < popSize; i += 2) {
      let p1Idx = i;
      let p2Idx = i + 1;

      // Handle odd population size
      if (p2Idx >= popSize) {
        p2Idx = Math.floor(Math.random() * p1Idx);
      }

      // Randomize spawn positions for training variety
      // This prevents AI from memorizing specific positions
      const spawnOffset1 = Math.random() * 100 - 50;  // -50 to +50
      const spawnOffset2 = Math.random() * 100 - 50;

      // Deep clone genomes to strip Vue reactive proxies (required for postMessage)
      jobs.push({
        jobId: i / 2,
        genome1: JSON.parse(JSON.stringify(population[p1Idx])),
        genome2: JSON.parse(JSON.stringify(population[p2Idx])),
        spawn1X: 280 + spawnOffset1,  // Left side
        spawn2X: 470 + spawnOffset2   // Right side
      });
    }

    return jobs;
  }

  /**
   * Applies match results back to the population
   * 
   * After matches complete, this updates each genome's fitness
   * and matchesWon counters based on their results.
   * 
   * @param population - The genome array to update
   * @param jobs - Original job array (for ID matching)
   * @param results - Results from runMatches()
   */
  static applyResults(population: Genome[], jobs: MatchJob[], results: MatchResult[]): void {
    // Create lookup map for O(1) result access
    const resultMap = new Map<number, MatchResult>();
    for (const result of results) {
      resultMap.set(result.jobId, result);
    }

    // Apply fitness to each genome that participated
    for (const job of jobs) {
      const result = resultMap.get(job.jobId);
      if (!result) continue;

      // Find genomes in population by ID and update
      const g1 = population.find(g => g.id === job.genome1.id);
      const g2 = population.find(g => g.id === job.genome2.id);

      if (g1) {
        g1.fitness += result.genome1Fitness;
        if (result.genome1Won) g1.matchesWon++;
      }

      if (g2) {
        g2.fitness += result.genome2Fitness;
        if (result.genome2Won) g2.matchesWon++;
      }
    }
  }

  /**
   * Returns the number of workers in the pool
   */
  getWorkerCount(): number {
    return this.workerCount;
  }

  /**
   * Checks if all workers are initialized and ready
   */
  isReady(): boolean {
    return this.readyWorkers.size === this.workerCount;
  }

  /**
   * Checks if currently processing a batch of matches
   */
  isBusy(): boolean {
    return this.isProcessing;
  }

  /**
   * Terminates all workers and cleans up
   * 
   * Call this when you're done with the pool to free resources.
   */
  terminate() {
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
    this.readyWorkers.clear();
  }
}
