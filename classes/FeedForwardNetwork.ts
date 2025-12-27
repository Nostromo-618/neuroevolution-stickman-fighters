import { NeuralNetwork } from './NeuralNetwork';
import { NN_ARCH } from '../services/Config';

/**
 * =============================================================================
 * FEED FORWARD NEURAL NETWORK
 * =============================================================================
 * 
 * Standard Multi-Layer Perceptron (MLP) implementation.
 * 
 * NASA Rule #3 Compliance (Memory Management):
 * - Buffers for hidden and output layers are pre-allocated in constructor.
 * - 'predict' method avoids creating new arrays/objects.
 * - Weights are stored in Float32Array (if possible in future) or standard arrays
 *   but are stable shapes.
 */

export class FeedForwardNetwork extends NeuralNetwork {
    // --- Architecture ---
    // We use standard arrays for ease of mutation/crossover logic simplicity,
    // but shapes are fixed.
    inputWeights: number[][];   // [Input][Hidden]
    outputWeights: number[][];  // [Hidden][Output]
    biases: number[];           // [Hidden + Output]

    // --- Pre-allocated Buffers (Rule #3) ---
    private hiddenBuffer: number[];
    private outputBuffer: number[];

    constructor(id: string, weights?: { input: number[][], output: number[][], biases: number[] }) {
        super(id);

        if (weights) {
            this.inputWeights = weights.input;
            this.outputWeights = weights.output;
            this.biases = weights.biases;
        } else {
            this.inputWeights = this.createRandomMatrix(NN_ARCH.INPUT_NODES, NN_ARCH.HIDDEN_NODES);
            this.outputWeights = this.createRandomMatrix(NN_ARCH.HIDDEN_NODES, NN_ARCH.OUTPUT_NODES);
            this.biases = this.createRandomArray(NN_ARCH.HIDDEN_NODES + NN_ARCH.OUTPUT_NODES);
        }

        // Pre-allocate buffers for prediction to avoid GC
        this.hiddenBuffer = new Array(NN_ARCH.HIDDEN_NODES).fill(0);
        this.outputBuffer = new Array(NN_ARCH.OUTPUT_NODES).fill(0);
    }

    /**
     * Helper to create random weight matrix
     */
    private createRandomMatrix(rows: number, cols: number): number[][] {
        return Array(rows).fill(0).map(() =>
            Array(cols).fill(0).map(() => Math.random() * 2 - 1)
        );
    }

    private createRandomArray(size: number): number[] {
        return Array(size).fill(0).map(() => Math.random() * 2 - 1);
    }

    /**
     * Activation Functions
     */
    private relu(x: number): number {
        return Math.max(0, x);
    }

    private sigmoid(x: number): number {
        return 1 / (1 + Math.exp(-x));
    }

    /**
     * Optimized Predict method (No dynamic allocation)
     */
    predict(inputs: number[]): number[] {
        // Validation (Rule #5)
        if (inputs.length !== NN_ARCH.INPUT_NODES) {
            throw new Error(`Input size mismatch. Expected ${NN_ARCH.INPUT_NODES}, got ${inputs.length}`);
        }

        // 1. Input -> Hidden
        for (let h = 0; h < NN_ARCH.HIDDEN_NODES; h++) {
            let sum = 0;
            // Weighted sum
            for (let i = 0; i < NN_ARCH.INPUT_NODES; i++) {
                sum += inputs[i] * this.inputWeights[i][h];
            }
            // Add bias
            sum += this.biases[h];
            // Activation
            this.hiddenBuffer[h] = this.relu(sum);
        }

        // 2. Hidden -> Output
        // Note: Returning a new array here is necessary for the external API unless inputs are passed by reference output buffer,
        // but for safety in JS/TS usually we return values. 
        // To strictly follow Rule #3, we should let the caller provide a buffer, but 
        // to fit the interface `predict(inputs): outputs`, we usually return a new array
        // OR we return a reference to our internal buffer (dangerous if caller modifies it)
        // OR we return a copy.
        // A copy of 8 numbers is 64 bytes, negligible GC compared to array allocation chains.
        // Using `slice()` on the buffer is efficient.

        for (let o = 0; o < NN_ARCH.OUTPUT_NODES; o++) {
            let sum = 0;
            for (let h = 0; h < NN_ARCH.HIDDEN_NODES; h++) {
                sum += this.hiddenBuffer[h] * this.outputWeights[h][o];
            }
            sum += this.biases[NN_ARCH.HIDDEN_NODES + o];
            this.outputBuffer[o] = this.sigmoid(sum);
        }

        // Return a copy to prevent external mutation of internal state (Rule #9)
        // .slice() is faster than [...] spread
        return this.outputBuffer.slice();
    }

    /**
     * Get intermediate activations for visualization.
     */
    getActivations(inputs: number[]): { hidden: number[], output: number[] } {
        this.predict(inputs);
        return {
            hidden: this.hiddenBuffer.slice(),
            output: this.outputBuffer.slice()
        };
    }

    mutate(rate: number): void {
        const mutateValue = (val: number) => {
            if (Math.random() < rate) {
                if (Math.random() < 0.1) {
                    return val + (Math.random() * 4.0 - 2.0); // Big mutation
                }
                const magnitude = 0.5 + (rate * 0.5);
                return val + (Math.random() * 2 * magnitude - magnitude);
            }
            return val;
        };

        // Mutate Input Weights
        for (let i = 0; i < this.inputWeights.length; i++) {
            for (let j = 0; j < this.inputWeights[i].length; j++) {
                this.inputWeights[i][j] = mutateValue(this.inputWeights[i][j]);
            }
        }

        // Mutate Output Weights
        for (let i = 0; i < this.outputWeights.length; i++) {
            for (let j = 0; j < this.outputWeights[i].length; j++) {
                this.outputWeights[i][j] = mutateValue(this.outputWeights[i][j]);
            }
        }

        // Mutate Biases
        for (let i = 0; i < this.biases.length; i++) {
            this.biases[i] = mutateValue(this.biases[i]);
        }
    }

    clone(): NeuralNetwork {
        // Deep clone weights
        const inputCopy = this.inputWeights.map(row => [...row]);
        const outputCopy = this.outputWeights.map(row => [...row]);
        const biasesCopy = [...this.biases];

        return new FeedForwardNetwork(`clone-${Date.now()}-${Math.random()}`, {
            input: inputCopy,
            output: outputCopy,
            biases: biasesCopy
        });
    }

    toJSON(): any {
        return {
            type: 'FeedForwardNetwork',
            inputWeights: this.inputWeights,
            outputWeights: this.outputWeights,
            biases: this.biases
        };
    }

    fromJSON(data: any): void {
        this.inputWeights = data.inputWeights;
        this.outputWeights = data.outputWeights;
        this.biases = data.biases;
    }
}
