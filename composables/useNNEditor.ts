/**
 * =============================================================================
 * USE NN EDITOR COMPOSABLE
 * =============================================================================
 *
 * Composable for managing the Rete.js Neural Network visual editor.
 * Handles editor initialization, architecture manipulation, and state persistence.
 */

import { ref, computed, shallowRef } from 'vue';
import { NodeEditor, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import { VuePlugin, Presets as VuePresets } from 'rete-vue-plugin';
import type { NNArchitecture } from '../types';
import { DEFAULT_NN_ARCHITECTURE } from '../types';
import {
    saveArchitecture,
    loadArchitecture,
    getCurrentArchitecture,
    formatArchitecture,
    calculateParameterCount,
    NN_CONSTRAINTS,
    isValidArchitecture
} from '../services/NNArchitecturePersistence';

// =============================================================================
// NODE DEFINITIONS
// =============================================================================

class LayerSocket extends ClassicPreset.Socket {
    constructor() {
        super('layer');
    }
}

/**
 * Base class for layer nodes in the NN editor
 */
class LayerNode extends ClassicPreset.Node {
    public nodeCount: number;
    public readonly layerType: 'input' | 'hidden' | 'output';
    public readonly isEditable: boolean;

    constructor(
        label: string,
        nodeCount: number,
        layerType: 'input' | 'hidden' | 'output',
        isEditable: boolean = false
    ) {
        super(label);
        this.nodeCount = nodeCount;
        this.layerType = layerType;
        this.isEditable = isEditable;

        // Add output socket (for connections to next layer)
        if (layerType !== 'output') {
            this.addOutput('out', new ClassicPreset.Output(new LayerSocket(), 'Out'));
        }

        // Add input socket (for connections from previous layer)
        if (layerType !== 'input') {
            this.addInput('in', new ClassicPreset.Input(new LayerSocket(), 'In'));
        }
    }
}

class InputLayerNode extends LayerNode {
    constructor() {
        super('Input', 9, 'input', false);
    }
}

class HiddenLayerNode extends LayerNode {
    public layerIndex: number;

    constructor(nodeCount: number, layerIndex: number) {
        super(`Hidden ${layerIndex + 1}`, nodeCount, 'hidden', true);
        this.layerIndex = layerIndex;
    }
}

class OutputLayerNode extends LayerNode {
    constructor() {
        super('Output', 8, 'output', false);
    }
}

// =============================================================================
// COMPOSABLE
// =============================================================================

// Note: Rete.js v2.x has complex generic constraints that conflict with custom node types.
// Using 'any' bypasses these while maintaining full runtime functionality.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EditorSchemes = any;

export function useNNEditor() {
    // Architecture state
    const architecture = ref<NNArchitecture>(getCurrentArchitecture());

    // Editor instances (shallowRef to avoid deep reactivity)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editorRef = shallowRef<NodeEditor<EditorSchemes> | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const areaRef = shallowRef<AreaPlugin<EditorSchemes, any> | null>(null);

    // UI state
    const isInitialized = ref(false);
    const isDirty = ref(false); // True if architecture differs from saved

    // Computed values
    const architectureSummary = computed(() => formatArchitecture(architecture.value));
    const parameterCount = computed(() => calculateParameterCount(architecture.value));
    const canAddLayer = computed(() =>
        architecture.value.hiddenLayers.length < NN_CONSTRAINTS.MAX_HIDDEN_LAYERS
    );
    const canRemoveLayer = computed(() =>
        architecture.value.hiddenLayers.length > NN_CONSTRAINTS.MIN_HIDDEN_LAYERS
    );

    // ==========================================================================
    // EDITOR INITIALIZATION
    // ==========================================================================

    /**
     * Initializes the Rete.js editor in the provided container element.
     */
    async function initEditor(container: HTMLElement): Promise<void> {
        if (isInitialized.value) {
            console.warn('NN Editor already initialized');
            return;
        }

        // Create editor
        const editor = new NodeEditor<EditorSchemes>();
        editorRef.value = editor;

        // Create area plugin
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const area = new AreaPlugin<EditorSchemes, any>(container);
        areaRef.value = area;

        // Create connection plugin
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const connection = new ConnectionPlugin<EditorSchemes, any>();
        connection.addPreset(ConnectionPresets.classic.setup());

        // Create Vue render plugin
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const render = new VuePlugin<EditorSchemes, any>();
        render.addPreset(VuePresets.classic.setup());

        // Register plugins
        editor.use(area);
        area.use(connection);
        area.use(render);

        // Enable zoom/pan
        AreaExtensions.simpleNodesOrder(area);
        AreaExtensions.zoomAt(area, editor.getNodes());

        // Build initial graph from architecture
        await buildGraphFromArchitecture();

        isInitialized.value = true;
    }

    /**
     * Builds the node graph from the current architecture.
     */
    async function buildGraphFromArchitecture(): Promise<void> {
        const editor = editorRef.value;
        const area = areaRef.value;

        if (!editor || !area) return;

        // Clear existing nodes
        for (const node of editor.getNodes()) {
            await editor.removeNode(node.id);
        }

        // Create nodes
        const inputNode = new InputLayerNode();
        await editor.addNode(inputNode);

        const hiddenNodes: HiddenLayerNode[] = [];
        for (let i = 0; i < architecture.value.hiddenLayers.length; i++) {
            const nodeCount = architecture.value.hiddenLayers[i] ?? 13;
            const hiddenNode = new HiddenLayerNode(nodeCount, i);
            await editor.addNode(hiddenNode);
            hiddenNodes.push(hiddenNode);
        }

        const outputNode = new OutputLayerNode();
        await editor.addNode(outputNode);

        // Create connections
        const allNodes = [inputNode, ...hiddenNodes, outputNode];
        for (let i = 0; i < allNodes.length - 1; i++) {
            const from = allNodes[i];
            const to = allNodes[i + 1];
            if (from && to) {
                const connection = new ClassicPreset.Connection(from, 'out', to, 'in');
                await editor.addConnection(connection);
            }
        }

        // Position nodes horizontally
        const spacing = 200;
        const startX = 50;
        const centerY = 150;

        for (let i = 0; i < allNodes.length; i++) {
            const node = allNodes[i];
            if (node) {
                await area.translate(node.id, { x: startX + i * spacing, y: centerY });
            }
        }

        // Zoom to fit
        AreaExtensions.zoomAt(area, allNodes);
    }

    // ==========================================================================
    // ARCHITECTURE MANIPULATION
    // ==========================================================================

    /**
     * Adds a new hidden layer to the architecture.
     */
    function addHiddenLayer(): void {
        if (!canAddLayer.value) return;

        // Add layer with default size of 13 nodes
        architecture.value = {
            ...architecture.value,
            hiddenLayers: [...architecture.value.hiddenLayers, 13]
        };
        isDirty.value = true;

        // Rebuild graph
        buildGraphFromArchitecture();
    }

    /**
     * Removes a hidden layer from the architecture.
     */
    function removeHiddenLayer(index: number): void {
        if (!canRemoveLayer.value) return;
        if (index < 0 || index >= architecture.value.hiddenLayers.length) return;

        const newLayers = [...architecture.value.hiddenLayers];
        newLayers.splice(index, 1);

        architecture.value = {
            ...architecture.value,
            hiddenLayers: newLayers
        };
        isDirty.value = true;

        // Rebuild graph
        buildGraphFromArchitecture();
    }

    /**
     * Sets the node count for a specific layer.
     */
    function setLayerSize(layerIndex: number, size: number): void {
        if (layerIndex < 0 || layerIndex >= architecture.value.hiddenLayers.length) return;

        // Clamp size to valid range
        const clampedSize = Math.max(
            NN_CONSTRAINTS.MIN_NODES_PER_LAYER,
            Math.min(NN_CONSTRAINTS.MAX_NODES_PER_LAYER, size)
        );

        const newLayers = [...architecture.value.hiddenLayers];
        newLayers[layerIndex] = clampedSize;

        architecture.value = {
            ...architecture.value,
            hiddenLayers: newLayers
        };
        isDirty.value = true;

        // Update node in editor if initialized
        if (editorRef.value) {
            buildGraphFromArchitecture();
        }
    }

    /**
     * Resets architecture to default (9→13→13→8).
     */
    function resetToDefault(): void {
        architecture.value = { ...DEFAULT_NN_ARCHITECTURE };
        isDirty.value = true;
        buildGraphFromArchitecture();
    }

    // ==========================================================================
    // PERSISTENCE
    // ==========================================================================

    /**
     * Saves the current architecture to localStorage.
     * Returns true if save was successful.
     */
    function saveCurrentArchitecture(): boolean {
        if (!isValidArchitecture(architecture.value)) {
            console.error('Cannot save invalid architecture');
            return false;
        }

        try {
            saveArchitecture(architecture.value);
            isDirty.value = false;
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Loads architecture from localStorage.
     */
    function loadSavedArchitecture(): void {
        const saved = loadArchitecture();
        if (saved) {
            architecture.value = saved;
            isDirty.value = false;
            buildGraphFromArchitecture();
        }
    }

    /**
     * Resets the dirty flag after a successful save.
     * Called by parent component after save completes.
     */
    function resetDirty(): void {
        isDirty.value = false;
    }

    // ==========================================================================
    // CLEANUP
    // ==========================================================================

    /**
     * Destroys the editor and cleans up resources.
     */
    function destroyEditor(): void {
        if (areaRef.value) {
            areaRef.value.destroy();
            areaRef.value = null;
        }
        editorRef.value = null;
        isInitialized.value = false;
    }

    return {
        // State
        architecture,
        isInitialized,
        isDirty,

        // Computed
        architectureSummary,
        parameterCount,
        canAddLayer,
        canRemoveLayer,

        // Methods
        initEditor,
        destroyEditor,
        addHiddenLayer,
        removeHiddenLayer,
        setLayerSize,
        resetToDefault,
        saveCurrentArchitecture,
        loadSavedArchitecture,
        resetDirty,

        // Constants
        NN_CONSTRAINTS
    };
}
