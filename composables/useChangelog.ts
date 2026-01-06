export interface ChangelogEntry {
    version: string
    date: string
    changes: {
        added?: string[]
        fixed?: string[]
        changed?: string[]
        removed?: string[]
    }
}

export const changelogData: ChangelogEntry[] = [
    {
        version: '3.0.0',
        date: '2026-01-06',
        changes: {
            added: [
                'Visual Neural Network Designer with Rete.js-powered zoomable/pannable canvas',
                'Columnar layer design: layers as draggable nodes with neurons as numbered circles',
                'Visual connection lines between neurons with Show/Hide toggle',
                'Add/remove neurons with +/- buttons directly on hidden layer nodes',
                'Clone layer button to duplicate hidden layers with same neuron count',
                'Color-coded layers: cyan (input), purple (hidden), green (output)',
                'Lock icons on fixed input/output layers to indicate non-editable status',
                'Educational Theory Glossary panel explaining NN concepts',
                'Real-time parameter count display showing network complexity',
                'Architecture persistence across browser sessions'
            ],
            changed: [
                'Neural network creation now respects custom architectures from the designer',
                'Training population resets when applying new architecture',
                'Header logo/title now opens About modal on click'
            ],
            fixed: [
                'NN Editor architecture changes now correctly persist after browser refresh',
                'Confirmation dialog displays actual edited architecture instead of stale data',
                '"Unsaved" indicator clears after applying changes',
                'Favicon now displays correctly in production builds'
            ]
        }
    },
    {
        version: '2.0.8',
        date: '2026-01-05',
        changes: {
            added: [
                'NN Fitness Editor: Customize the AI reward function with 16 tunable parameters',
                'Per-frame shaping rewards: proximity, aggression, facing, positioning, edge/time penalties',
                'Match-end bonuses: damage/health multipliers, win bonuses, stalemate penalties',
                'Monaco-based editor with real-time validation and syntax highlighting',
                'Import/Export fitness configurations to experiment with different training strategies',
                'LocalStorage persistence for custom fitness functions across sessions'
            ],
            changed: [
                'Fitness calculation now uses configurable parameters instead of hardcoded values',
                'Changes apply immediately to live training with toast notification',
                'Background/turbo workers use new fitness config on next training start'
            ],
            fixed: [
                'Fitness Editor now displays saved configuration instead of always showing defaults',
                'Removed duplicate toast notification when saving fitness config',
                'Added accessibility labels for screen reader compatibility'
            ]
        }
    },
    {
        version: '2.0.7',
        date: '2026-01-05',
        changes: {
            added: [
                'Full training state persistence: Resume exactly where you left off after page refresh',
                'Auto-save of population, best genome, fitness history, and generation counter',
                'Settings are now persisted and restored on page load'
            ],
            changed: [
                'Script Editor now uses light theme in light mode (was always dark)',
                'Script Editor uses VS Code default font (Cascadia Code/Consolas) with ligatures'
            ],
            fixed: [
                'Fixed crossover type error when loading persisted genomes in Turbo mode'
            ]
        }
    },
    {
        version: '2.0.6',
        date: '2026-01-04',
        changes: {
            added: [
                'Smart Adaptive Mutation: Combined strategy with plateau detection and periodic oscillation',
                'Mutation rate now spikes to 20% when fitness stagnates for 5 generations',
                'Periodic +5% mutation boost every 25 generations to escape local minima',
                'Fitness Chart now displays both Fitness (teal) and Mutation Rate (amber) lines',
                'Dual Y-axis chart with legend and improved tooltips'
            ],
            changed: [
                'Training Mode: Fitness Chart relocated below Neural Network visualization (left column)',
                'Arcade Mode: Fitness Chart remains in right column for compact layout',
                'Live Training max speed increased from 100x to 500x'
            ],
            fixed: [
                'Fixed bug where training opponent selection remained disabled after resetting a match against a Script opponent'
            ]
        }
    },
    {
        version: '2.0.5',
        date: '2026-01-04',
        changes: {
            changed: [
                'Auto-stop modal "Don\'t Interrupt Again" button now has visible cyan outline for better clarity',
                'Improved milestone display in auto-stop modal with light/dark theme support'
            ]
        }
    },
    {
        version: '2.0.4',
        date: '2026-01-04',
        changes: {
            fixed: [
                'Auto-stop modal no longer loops when clicking "Stop Training" - Training Mode now pauses, Arcade Mode continues',
                'Opponent selection controls now correctly stay disabled during paused matches',
                'Prevented mid-match configuration changes that could corrupt game state',
                'Enforced pristine-state-only changes with three-condition validation (matchesPlayed, isRunning, roundStatus)'
            ]
        }
    },
    {
        version: '2.0.3',
        date: '2026-01-04',
        changes: {
            added: [
                'Synchronous script execution for perfect timing fairness with AI',
                'AST-based infinite loop detection prevents dangerous code from freezing the game',
                'Compile-time safety checks block while(true), for(;;) without break statements'
            ],
            fixed: [
                'Critical timing bug: Custom scripts now compete fairly at all simulation speeds (1x-99x)',
                'High-speed simulation bias eliminated - Script vs AI outcomes now consistent',
                'Script editor prevents saving code with infinite loops'
            ],
            changed: [
                'Custom scripts execute synchronously on main thread instead of async Web Worker',
                'Script execution now achieves 1:1 timing parity with neural network AI'
            ]
        }
    },
    {
        version: '2.0.2',
        date: '2026-01-03',
        changes: {
            fixed: [
                'Script fighters now work correctly on first match load in Arcade mode',
                'Resolved async race condition in custom script worker initialization'
            ]
        }
    },
    {
        version: '2.0.1',
        date: '2026-01-03',
        changes: {
            added: [
                'New mobile-specific navigation menu with labeled icons'
            ],
            changed: [
                'Responsive navbar header that collapses into hamburger on mobile'
            ],
            fixed: [
                'Navbar title overlapping with action icons on small screens',
                'Added close button to About modal for easier navigation on mobile devices'
            ]
        }
    },
    {
        version: '2.0.0',
        date: '2026-01-03',
        changes: {
            added: [
                'Dual hidden layer neural network architecture for smarter AI',
                'Training auto-stop feature when target generation is reached',
                'Debug verbosity toggle for simulation diagnostics',
                'Dark and light theme modes with system preference detection'
            ],
            changed: [
                'Complete rewrite from React to Nuxt 4 with Vue 3',
                'UI rebuilt with Nuxt UI component library',
                'Darker arena colors for better fighter visibility',
                'Improved mutation and simulation parameter controls',
                'Enhanced script editor user experience',
                'Refreshed game HUD design',
                'ECharts replaces Recharts for fitness visualization'
            ],
            fixed: [
                'Arcade mode intermittent freezes resolved',
                'Background training stability improvements',
                'Worker thread blocking issues fixed',
                'Monaco Editor initialization timing',
                'Match state management and control flow'
            ]
        }
    }
]

export function useChangelog() {
    return {
        changelog: changelogData,
        getLatestVersion: () => changelogData[0]?.version || '2.0.1',
        getVersionEntry: (version: string) => {
            return changelogData.find(entry => entry.version === version)
        }
    }
}
