/**
 * =============================================================================
 * USE NN EDITOR COMPOSABLE
 * =============================================================================
 *
 * Composable for managing the Rete.js Neural Network visual editor.
 * Uses Rete.js with custom Vue layer nodes for the columnar visual design.
 *
 * Implementation: Option B - Layers as Custom Nodes
 * - Each layer is a Rete.js node rendered with CustomLayerNode.vue
 * - Neurons are circles rendered inside each layer node
 * - Connections are drawn between adjacent layers
 *
 * Stability Rules Applied:
 * - Rule 1: Simple control flow
 * - Rule 5: Type assertions on layer operations
 * - Rule 6: No globals, all state is local
 * - Rule 9: Immutable architecture updates
 */

import { ref, computed, shallowRef, markRaw } from 'vue';
import { NodeEditor, ClassicPreset, type GetSchemes } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import { VuePlugin, Presets as VuePresets, type VueArea2D } from 'rete-vue-plugin';
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

const layerSocket = new LayerSocket();

/**
 * Custom layer node representing a neural network layer.
 * The nodeCount property controls how many neuron circles are displayed.
 */
class LayerNode extends ClassicPreset.Node {
    width = 100;
    height = 350;

    public nodeCount: number;
    public readonly layerType: 'input' | 'hidden' | 'output';
    public readonly layerIndex: number | undefined;

    constructor(
        label: string,
        nodeCount: number,
        layerType: 'input' | 'hidden' | 'output',
        layerIndex?: number
    ) {
        super(label);
        this.nodeCount = nodeCount;
        this.layerType = layerType;
        this.layerIndex = layerIndex;

        // Add output socket (connections to next layer)
        if (layerType !== 'output') {
            this.addOutput('out', new ClassicPreset.Output(layerSocket, 'Out'));
        }

        // Add input socket (connections from previous layer)
        if (layerType !== 'input') {
            this.addInput('in', new ClassicPreset.Input(layerSocket, 'In'));
        }
    }
}

class LayerConnection extends ClassicPreset.Connection<LayerNode, LayerNode> { }

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

type Schemes = GetSchemes<LayerNode, LayerConnection>;
// @ts-ignore - VueArea2D expects ClassicScheme but our custom Schemes work at runtime
type AreaExtra = VueArea2D<Schemes>;

// =============================================================================
// COMPOSABLE
// =============================================================================

export function useNNEditor() {
    // =========================================================================
    // STATE
    // =========================================================================

    /** Current architecture being edited */
    const architecture = ref<NNArchitecture>(getCurrentArchitecture());

    /** Rete.js editor instance */
    const editorRef = shallowRef<NodeEditor<Schemes> | null>(null);

    /** Rete.js area plugin (for zoom/pan) */
    const areaRef = shallowRef<AreaPlugin<Schemes, AreaExtra> | null>(null);

    /** Rete.js Vue render plugin */
    const renderRef = shallowRef<VuePlugin<Schemes, AreaExtra> | null>(null);

    /** Whether editor is initialized */
    const isInitialized = ref(false);

    /** True if architecture differs from saved version */
    const isDirty = ref(false);

    /** Whether to show connection lines */
    const showConnections = ref(true);

    // =========================================================================
    // COMPUTED
    // =========================================================================

    /** Human-readable architecture summary (e.g., "9 → 13 → 13 → 8") */
    const architectureSummary = computed(() => formatArchitecture(architecture.value));

    /** Total trainable parameters */
    const parameterCount = computed(() => calculateParameterCount(architecture.value));

    /** Can add more hidden layers? */
    const canAddLayer = computed(() =>
        architecture.value.hiddenLayers.length < NN_CONSTRAINTS.MAX_HIDDEN_LAYERS
    );

    /** Can remove hidden layers? */
    const canRemoveLayer = computed(() =>
        architecture.value.hiddenLayers.length > NN_CONSTRAINTS.MIN_HIDDEN_LAYERS
    );

    // =========================================================================
    // EDITOR INITIALIZATION
    // =========================================================================

    /**
     * Initializes the Rete.js editor in the provided container element.
     * @param container - The HTML element to mount the editor in
     * @param customNodeComponent - The Vue component to use for rendering nodes
     */
    async function initEditor(
        container: HTMLElement,
        customNodeComponent: ReturnType<typeof defineComponent>
    ): Promise<void> {
        if (isInitialized.value) {
            console.warn('NN Editor already initialized');
            return;
        }

        // Create editor
        const editor = new NodeEditor<Schemes>();
        editorRef.value = markRaw(editor);

        // Create area plugin for zoom/pan
        const area = new AreaPlugin<Schemes, AreaExtra>(container);
        areaRef.value = markRaw(area);

        // Create connection plugin
        // @ts-ignore - ConnectionPlugin types are incompatible with custom Schemes but work at runtime
        const connection = new ConnectionPlugin<Schemes, AreaExtra>();
        // @ts-ignore - ClassicPreset types are incompatible with custom Schemes but work at runtime
        connection.addPreset(ConnectionPresets.classic.setup());

        // Create Vue render plugin with custom node component
        const render = new VuePlugin<Schemes, AreaExtra>();
        renderRef.value = markRaw(render);

        // Add classic preset with customization for our layer nodes
        // @ts-ignore - VuePresets types are incompatible with custom Schemes but work at runtime
        render.addPreset(VuePresets.classic.setup({
            customize: {
                node() {
                    // Use our custom layer node component for all nodes
                    return customNodeComponent;
                }
            }
        }));

        // Register plugins
        editor.use(area);
        area.use(connection);
        area.use(render);

        // Enable useful extensions
        AreaExtensions.simpleNodesOrder(area);
        AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
            accumulating: AreaExtensions.accumulateOnCtrl()
        });

        // Listen for custom events from our node component
        area.addPipe((context) => {
            // Handle custom events emitted from CustomLayerNode
            return context;
        });

        // Build initial graph from current architecture
        await buildGraphFromArchitecture();

        // Zoom to fit all nodes
        await zoomToFit();

        isInitialized.value = true;
    }

    /**
     * Builds the node graph from the current architecture.
     */
    async function buildGraphFromArchitecture(): Promise<void> {
        const editor = editorRef.value;
        const area = areaRef.value;

        if (!editor || !area) return;

        // Clear existing nodes and connections
        for (const conn of editor.getConnections()) {
            await editor.removeConnection(conn.id);
        }
        for (const node of editor.getNodes()) {
            await editor.removeNode(node.id);
        }

        // Create layer nodes
        const nodes: LayerNode[] = [];

        // Input layer
        const inputNode = new LayerNode('Input', architecture.value.inputNodes, 'input');
        await editor.addNode(inputNode);
        nodes.push(inputNode);

        // Hidden layers
        for (let i = 0; i < architecture.value.hiddenLayers.length; i++) {
            const count = architecture.value.hiddenLayers[i] ?? 13;
            const hiddenNode = new LayerNode(`H${i + 1}`, count, 'hidden', i);
            await editor.addNode(hiddenNode);
            nodes.push(hiddenNode);
        }

        // Output layer
        const outputNode = new LayerNode('Output', architecture.value.outputNodes, 'output');
        await editor.addNode(outputNode);
        nodes.push(outputNode);

        // Create connections between adjacent layers
        for (let i = 0; i < nodes.length - 1; i++) {
            const from = nodes[i];
            const to = nodes[i + 1];
            if (from && to) {
                const conn = new LayerConnection(from, 'out', to, 'in');
                await editor.addConnection(conn);
            }
        }

        // Position nodes in a horizontal layout
        const spacing = 160;
        const startX = 50;
        const centerY = 50;

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node) {
                await area.translate(node.id, { x: startX + i * spacing, y: centerY });
            }
        }
    }

    /**
     * Zooms the view to fit all nodes.
     */
    async function zoomToFit(): Promise<void> {
        const editor = editorRef.value;
        const area = areaRef.value;

        if (!editor || !area) return;

        const nodes = editor.getNodes();
        if (nodes.length > 0) {
            await AreaExtensions.zoomAt(area, nodes);
        }
    }

    // =========================================================================
    // LAYER OPERATIONS
    // =========================================================================

    /**
     * Adds a new hidden layer to the architecture.
     */
    async function addHiddenLayer(): Promise<void> {
        if (!canAddLayer.value) return;

        architecture.value = {
            ...architecture.value,
            hiddenLayers: [...architecture.value.hiddenLayers, 13]
        };
        isDirty.value = true;
        await buildGraphFromArchitecture();
        await zoomToFit();
    }

    /**
     * Removes the last hidden layer from the architecture.
     */
    async function removeHiddenLayer(): Promise<void> {
        if (!canRemoveLayer.value) return;

        const newLayers = [...architecture.value.hiddenLayers];
        newLayers.pop();

        architecture.value = {
            ...architecture.value,
            hiddenLayers: newLayers
        };
        isDirty.value = true;
        await buildGraphFromArchitecture();
        await zoomToFit();
    }

    /**
     * Clones a hidden layer (duplicates it with the same neuron count).
     */
    async function cloneHiddenLayer(layerIndex: number): Promise<void> {
        if (!canAddLayer.value) return;
        if (layerIndex < 0 || layerIndex >= architecture.value.hiddenLayers.length) return;

        const nodeCount = architecture.value.hiddenLayers[layerIndex] ?? 13;
        const newLayers = [...architecture.value.hiddenLayers];
        newLayers.splice(layerIndex + 1, 0, nodeCount);

        architecture.value = {
            ...architecture.value,
            hiddenLayers: newLayers
        };
        isDirty.value = true;
        await buildGraphFromArchitecture();
        await zoomToFit();
    }

    // =========================================================================
    // NEURON OPERATIONS
    // =========================================================================

    /**
     * Adds a single neuron to a hidden layer.
     */
    async function addNeuronToLayer(layerIndex: number): Promise<boolean> {
        if (layerIndex < 0 || layerIndex >= architecture.value.hiddenLayers.length) return false;

        const currentCount = architecture.value.hiddenLayers[layerIndex] ?? 0;
        if (currentCount >= NN_CONSTRAINTS.MAX_NODES_PER_LAYER) return false;

        const newLayers = [...architecture.value.hiddenLayers];
        newLayers[layerIndex] = currentCount + 1;

        architecture.value = {
            ...architecture.value,
            hiddenLayers: newLayers
        };
        isDirty.value = true;
        await buildGraphFromArchitecture();
        return true;
    }

    /**
     * Removes a single neuron from a hidden layer.
     */
    async function removeNeuronFromLayer(layerIndex: number): Promise<boolean> {
        if (layerIndex < 0 || layerIndex >= architecture.value.hiddenLayers.length) return false;

        const currentCount = architecture.value.hiddenLayers[layerIndex] ?? 0;
        if (currentCount <= NN_CONSTRAINTS.MIN_NODES_PER_LAYER) return false;

        const newLayers = [...architecture.value.hiddenLayers];
        newLayers[layerIndex] = currentCount - 1;

        architecture.value = {
            ...architecture.value,
            hiddenLayers: newLayers
        };
        isDirty.value = true;
        await buildGraphFromArchitecture();
        return true;
    }

    // =========================================================================
    // PERSISTENCE
    // =========================================================================

    /**
     * Resets architecture to default (9→13→13→8).
     */
    async function resetToDefault(): Promise<void> {
        architecture.value = { ...DEFAULT_NN_ARCHITECTURE };
        isDirty.value = true;
        await buildGraphFromArchitecture();
        await zoomToFit();
    }

    /**
     * Saves the current architecture to localStorage.
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
    async function loadSavedArchitecture(): Promise<void> {
        const saved = loadArchitecture();
        if (saved) {
            architecture.value = saved;
            isDirty.value = false;
            await buildGraphFromArchitecture();
            await zoomToFit();
        }
    }

    /**
     * Resets the dirty flag.
     */
    function resetDirty(): void {
        isDirty.value = false;
    }

    /**
     * Toggles connection line visibility.
     */
    function toggleConnections(): void {
        showConnections.value = !showConnections.value;
        // TODO: Implement connection visibility toggle via area pipe
    }

    // =========================================================================
    // CLEANUP
    // =========================================================================

    /**
     * Destroys the editor and cleans up resources.
     */
    function destroyEditor(): void {
        if (areaRef.value) {
            areaRef.value.destroy();
            areaRef.value = null;
        }
        editorRef.value = null;
        renderRef.value = null;
        isInitialized.value = false;
    }

    // =========================================================================
    // RETURN
    // =========================================================================

    return {
        // State
        architecture,
        isInitialized,
        isDirty,
        showConnections,

        // Computed
        architectureSummary,
        parameterCount,
        canAddLayer,
        canRemoveLayer,

        // Editor lifecycle
        initEditor,
        destroyEditor,
        zoomToFit,

        // Layer operations
        addHiddenLayer,
        removeHiddenLayer,
        cloneHiddenLayer,

        // Neuron operations
        addNeuronToLayer,
        removeNeuronFromLayer,

        // Persistence
        resetToDefault,
        saveCurrentArchitecture,
        loadSavedArchitecture,
        resetDirty,
        toggleConnections,

        // Constants
        NN_CONSTRAINTS
    };
}
