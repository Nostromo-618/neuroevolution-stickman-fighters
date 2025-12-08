// Worker Pool Manager
// Manages multiple Web Workers for parallel match simulation

import { Genome } from '../types';

interface MatchJob {
  jobId: number;
  genome1: Genome;
  genome2: Genome;
  spawn1X: number;
  spawn2X: number;
}

interface MatchResult {
  jobId: number;
  genome1Fitness: number;
  genome2Fitness: number;
  genome1Won: boolean;
  genome2Won: boolean;
  genome1Health: number;
  genome2Health: number;
}

type WorkerPoolCallback = (results: MatchResult[]) => void;

export class WorkerPool {
  private workers: Worker[] = [];
  private workerCount: number;
  private pendingJobs: MatchJob[] = [];
  private activeJobs: Map<number, MatchJob[]> = new Map();
  private results: MatchResult[] = [];
  private callback: WorkerPoolCallback | null = null;
  private expectedResults: number = 0;
  private isProcessing: boolean = false;
  private readyWorkers: Set<number> = new Set();

  constructor(workerCount?: number) {
    // Use available cores, but cap at 8 to avoid overhead
    this.workerCount = workerCount ?? Math.min(navigator.hardwareConcurrency || 4, 8);
    this.initWorkers();
  }

  private initWorkers() {
    for (let i = 0; i < this.workerCount; i++) {
      // Create worker from the TrainingWorker module
      const worker = new Worker(
        new URL('./TrainingWorker.ts', import.meta.url),
        { type: 'module' }
      );
      
      const workerId = i;
      
      worker.onmessage = (e: MessageEvent) => {
        this.handleWorkerMessage(workerId, e.data);
      };
      
      worker.onerror = (error) => {
        console.error(`Worker ${workerId} error:`, error);
      };
      
      this.workers.push(worker);
    }
  }

  private handleWorkerMessage(workerId: number, data: { type: string; results?: MatchResult[] }) {
    if (data.type === 'ready') {
      this.readyWorkers.add(workerId);
      return;
    }
    
    if (data.type === 'matchResults' && data.results) {
      // Collect results
      this.results.push(...data.results);
      
      // Check if all jobs are complete
      if (this.results.length >= this.expectedResults) {
        this.isProcessing = false;
        
        if (this.callback) {
          const cb = this.callback;
          this.callback = null;
          cb(this.results);
        }
      }
    }
  }

  /**
   * Run a batch of matches in parallel across workers
   */
  async runMatches(jobs: MatchJob[]): Promise<MatchResult[]> {
    return new Promise((resolve) => {
      if (jobs.length === 0) {
        resolve([]);
        return;
      }

      this.results = [];
      this.expectedResults = jobs.length;
      this.isProcessing = true;
      this.callback = resolve;

      // Distribute jobs evenly across workers
      const jobsPerWorker = Math.ceil(jobs.length / this.workerCount);
      
      for (let i = 0; i < this.workerCount; i++) {
        const start = i * jobsPerWorker;
        const end = Math.min(start + jobsPerWorker, jobs.length);
        const workerJobs = jobs.slice(start, end);
        
        if (workerJobs.length > 0) {
          this.workers[i].postMessage({ type: 'runMatches', jobs: workerJobs });
        }
      }
    });
  }

  /**
   * Create match jobs from a population
   */
  static createJobsFromPopulation(population: Genome[]): MatchJob[] {
    const jobs: MatchJob[] = [];
    const popSize = population.length;
    
    for (let i = 0; i < popSize; i += 2) {
      let p1Idx = i;
      let p2Idx = i + 1;
      
      // Handle odd population
      if (p2Idx >= popSize) {
        p2Idx = Math.floor(Math.random() * p1Idx);
      }
      
      // Randomize spawn positions
      const spawnOffset1 = Math.random() * 100 - 50;
      const spawnOffset2 = Math.random() * 100 - 50;
      
      jobs.push({
        jobId: i / 2,
        genome1: population[p1Idx],
        genome2: population[p2Idx],
        spawn1X: 280 + spawnOffset1,
        spawn2X: 470 + spawnOffset2
      });
    }
    
    return jobs;
  }

  /**
   * Apply match results back to the population
   */
  static applyResults(population: Genome[], jobs: MatchJob[], results: MatchResult[]): void {
    // Create a map of jobId to result for quick lookup
    const resultMap = new Map<number, MatchResult>();
    for (const result of results) {
      resultMap.set(result.jobId, result);
    }
    
    // Apply fitness to each genome
    for (const job of jobs) {
      const result = resultMap.get(job.jobId);
      if (!result) continue;
      
      // Find genomes in population and update fitness
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
   * Get the number of workers
   */
  getWorkerCount(): number {
    return this.workerCount;
  }

  /**
   * Check if pool is ready
   */
  isReady(): boolean {
    return this.readyWorkers.size === this.workerCount;
  }

  /**
   * Check if currently processing
   */
  isBusy(): boolean {
    return this.isProcessing;
  }

  /**
   * Terminate all workers
   */
  terminate() {
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
    this.readyWorkers.clear();
  }
}

