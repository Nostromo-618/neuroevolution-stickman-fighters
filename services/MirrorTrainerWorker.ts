/**
 * =============================================================================
 * MIRROR TRAINER WORKER - Web Worker for Real-Time Mirror AI Training
 * =============================================================================
 * 
 * This worker handles backpropagation training off the main thread to prevent
 * any frame drops during gameplay.
 * 
 * Message Protocol:
 * - Main → Worker: { type: 'train', network, samples, config }
 * - Worker → Main: { type: 'trained', network } | { type: 'error', message }
 * 
 * =============================================================================
 */

import { trainMirrorNetwork, applyRecencyWeights } from './MirrorTrainer';
import type { NeuralNetworkData } from '../types';
import type { TrainingSample, TrainingConfig } from './MirrorTrainer';

// =============================================================================
// MESSAGE TYPES
// =============================================================================

interface TrainMessage {
    type: 'train';
    network: NeuralNetworkData;
    samples: Omit<TrainingSample, 'weight'>[];
    config: TrainingConfig;
}

interface TrainedMessage {
    type: 'trained';
    network: NeuralNetworkData;
}

interface ErrorMessage {
    type: 'error';
    message: string;
}

type IncomingMessage = TrainMessage;
type OutgoingMessage = TrainedMessage | ErrorMessage;

// =============================================================================
// WORKER MESSAGE HANDLER
// =============================================================================

self.onmessage = (event: MessageEvent<IncomingMessage>) => {
    const { data } = event;

    if (data.type === 'train') {
        try {
            // Apply recency weights to samples
            const weightedSamples = applyRecencyWeights(data.samples, data.config.recencyDecay);

            // Train the network
            const trainedNetwork = trainMirrorNetwork(
                data.network,
                weightedSamples,
                data.config
            );

            // Send back the trained network
            const response: TrainedMessage = {
                type: 'trained',
                network: trainedNetwork
            };
            self.postMessage(response);

        } catch (error) {
            const response: ErrorMessage = {
                type: 'error',
                message: error instanceof Error ? error.message : 'Unknown training error'
            };
            self.postMessage(response);
        }
    }
};

// Signal worker is ready
self.postMessage({ type: 'ready' });
