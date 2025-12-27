import React, { useRef, useEffect } from 'react';
import { Fighter } from '../services/GameEngine';
import { HIDDEN_NODES, OUTPUT_NODES, relu, sigmoid } from '../services/NeuralNetwork';

interface NeuralNetworkVisualizerProps {
    fighter: Fighter | null;
    width?: number;
    height?: number;
    className?: string;
}

const NeuralNetworkVisualizer: React.FC<NeuralNetworkVisualizerProps> = ({
    fighter,
    width = 600, // Increased default width for the specific layout slot
    height = 200,
    className = ""
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Constants for visualization
    const INPUT_LABELS = ['Dist X', 'Dist Y', 'My HP', 'Op HP', 'Op Act', 'My En', 'Face', 'Op CD', 'Op En'];
    const OUTPUT_LABELS = ['Idle', 'Left', 'Right', 'Jump', 'Crouch', 'Punch', 'Kick', 'Block'];

    // Dynamic Spacing based on width/height
    // Space between layers

    const NODE_RADIUS = 4;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const render = () => {
            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // If no fighter or no AI, just show empty placeholder
            if (!fighter || !fighter.genome) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.font = '14px Inter, sans-serif';
                const text = "Waiting for Neural Network...";
                const textWidth = ctx.measureText(text).width;
                ctx.fillText(text, (width - textWidth) / 2, height / 2);
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            if (!fighter || !fighter.genome) {
                // ... (existing code for empty state handled above)
                return;
            }

            const network = fighter.genome.network;
            const inputs = fighter.lastInputs || new Array(9).fill(0);

            let hiddenOutputs: number[] = [];
            let finalOutputs: number[] = [];

            // Common data for both paths
            const inputWeights = network.inputWeights;
            const outputWeights = network.outputWeights;
            // biases only needed for fallback calculation

            // We cast to any because we handle both Data interface and Class instance
            const netInstance = network as any;

            if (typeof netInstance.getActivations === 'function') {
                const activations = netInstance.getActivations(inputs);
                hiddenOutputs = activations.hidden;
                finalOutputs = activations.output;
            } else {
                // FALLBACK: Manual calculation for legacy/worker data
                const biases = network.biases;

                for (let h = 0; h < HIDDEN_NODES; h++) {
                    let sum = 0;
                    for (let i = 0; i < inputs.length; i++) {
                        sum += inputs[i] * inputWeights[i][h];
                    }
                    sum += biases[h];
                    hiddenOutputs.push(relu(sum));
                }

                for (let o = 0; o < OUTPUT_NODES; o++) {
                    let sum = 0;
                    for (let h = 0; h < HIDDEN_NODES; h++) {
                        sum += hiddenOutputs[h] * outputWeights[h][o];
                    }
                    sum += biases[HIDDEN_NODES + o];
                    finalOutputs.push(sigmoid(sum));
                }
            }

            // --- DRAW VISUALIZATION ---

            // Positioning
            const inputX = 60; // More padding for labels
            const hiddenX = width / 2;
            const outputX = width - 60;

            const inputStep = height / (inputs.length + 1);
            const hiddenStep = height / (HIDDEN_NODES + 1);
            const outputStep = height / (OUTPUT_NODES + 1);

            // Helper to Map Value to Color
            const getNodeColor = (value: number) => {
                // Active = Bright Cyan/White, Inactive = Dim Gray
                const brightness = Math.min(1, Math.max(0.2, value)); // Min 0.2 opacity
                return `rgba(0, 255, 255, ${brightness})`;
            };

            const getLineColor = (weight: number, activation: number) => {
                const strength = Math.abs(weight) * activation;
                // Non-linear opacity: squares the strength to suppress weak clean signals
                const opacity = Math.min(1, Math.pow(strength, 1.5) * 0.8);

                if (opacity < 0.02) return 'transparent';

                return weight > 0
                    ? `rgba(0, 240, 255, ${opacity})` // Bright Cyan
                    : `rgba(255, 40, 40, ${opacity})`; // Bright Red
            };

            // Enable additive blending for glowing lines
            ctx.globalCompositeOperation = 'screen';

            // 1. Draw Input -> Hidden Connections
            for (let i = 0; i < inputs.length; i++) {
                const y1 = (i + 1) * inputStep;
                for (let h = 0; h < HIDDEN_NODES; h++) {
                    const y2 = (h + 1) * hiddenStep;
                    const weight = inputWeights[i][h];
                    const color = getLineColor(weight, Math.abs(inputs[i])); // Use absolute input for visualization intensity

                    if (color !== 'transparent') {
                        ctx.beginPath();
                        ctx.moveTo(inputX, y1);
                        ctx.lineTo(hiddenX, y2);
                        ctx.strokeStyle = color;
                        // Thinner lines: 0.5 multiplier, min 0.1
                        ctx.lineWidth = Math.max(0.1, Math.abs(weight) * 0.5);
                        ctx.stroke();
                    }
                }
            }

            // 2. Draw Hidden -> Output Connections
            for (let h = 0; h < HIDDEN_NODES; h++) {
                const y1 = (h + 1) * hiddenStep;
                for (let o = 0; o < OUTPUT_NODES; o++) {
                    const y2 = (o + 1) * outputStep;
                    const weight = outputWeights[h][o];
                    const color = getLineColor(weight, hiddenOutputs[h]);

                    if (color !== 'transparent') {
                        ctx.beginPath();
                        ctx.moveTo(hiddenX, y1);
                        ctx.lineTo(outputX, y2);
                        ctx.strokeStyle = color;
                        ctx.lineWidth = Math.max(0.1, Math.abs(weight) * 0.5);
                        ctx.stroke();
                    }
                }
            }

            // Restore blending for text and nodes
            ctx.globalCompositeOperation = 'source-over';

            // 3. Draw Input Nodes & Labels
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.font = '10px Inter, monospace';

            for (let i = 0; i < inputs.length; i++) {
                const y = (i + 1) * inputStep;

                // Node
                ctx.beginPath();
                ctx.arc(inputX, y, NODE_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = getNodeColor(Math.abs(inputs[i]));
                ctx.fill();
                ctx.strokeStyle = '#333';
                ctx.stroke();

                // Label
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillText(INPUT_LABELS[i], inputX - 10, y);
            }

            // 4. Draw Hidden Nodes
            for (let h = 0; h < HIDDEN_NODES; h++) {
                const y = (h + 1) * hiddenStep;

                ctx.beginPath();
                ctx.arc(hiddenX, y, NODE_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = getNodeColor(hiddenOutputs[h]);
                ctx.fill();
            }

            // 5. Draw Output Nodes & Labels
            ctx.textAlign = 'left';

            for (let o = 0; o < OUTPUT_NODES; o++) {
                const y = (o + 1) * outputStep;

                // Node
                ctx.beginPath();
                ctx.arc(outputX, y, NODE_RADIUS + (finalOutputs[o] > 0.5 ? 2 : 0), 0, Math.PI * 2); // Pulse if active
                ctx.fillStyle = finalOutputs[o] > 0.5 ? '#00FFFF' : getNodeColor(finalOutputs[o]); // Bright cyan if active
                ctx.fill();
                ctx.strokeStyle = '#333';
                ctx.stroke();

                // Label
                ctx.fillStyle = finalOutputs[o] > 0.5 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)';
                ctx.font = finalOutputs[o] > 0.5 ? 'bold 10px Inter, monospace' : '10px Inter, monospace';
                ctx.fillText(OUTPUT_LABELS[o], outputX + 10, y);
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [fighter, width, height]);

    return (
        <div className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-4 shadow-2xl relative ${className}`}>
            <div className="absolute top-2 left-0 right-0 text-center pointer-events-none">
                <span className="text-xs text-white/30 uppercase tracking-[0.2em] font-bold">Neural Network Architecture</span>
            </div>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="block w-full h-auto"
            />
        </div>
    );
};

export default NeuralNetworkVisualizer;
