/**
 * =============================================================================
 * ABSTRACT NEURAL NETWORK CLASS
 * =============================================================================
 * 
 * Defines the contract for all neural network implementations.
 * Enables polymorphism for different network architectures (FeedForward, RNN, etc).
 * 
 * Subclasses should prioritize object pooling and stable shapes for memory efficiency.
 */

// Base interface for serialized network data
export interface NetworkJSON {
    type: string;
    id?: string;
    [key: string]: unknown;
}

export abstract class NeuralNetwork {
    /**
     * Unique identifier for this network/genome
     */
    readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

    /**
     * Propagate inputs through the network to produce outputs.
     * @param inputs Array of normalized input values
     * @returns Array of output values (0-1)
     */
    abstract predict(inputs: number[]): number[];

    /**
     * Mutate the network weights/biases in place.
     * @param rate Mutation rate (probability per gene)
     */
    abstract mutate(rate: number): void;

    /**
     * Create a deep copy of this network.
     * @returns A new independent instance required for population reproduction
     */
    abstract clone(): NeuralNetwork;

    /**
     * Serialize the network structure to a plain object/JSON.
     */
    abstract toJSON(): NetworkJSON;

    /**
     * Load network weights from a serialized object.
     */
    abstract fromJSON(data: NetworkJSON): void;
}

