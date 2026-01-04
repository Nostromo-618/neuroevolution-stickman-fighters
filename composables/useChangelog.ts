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
