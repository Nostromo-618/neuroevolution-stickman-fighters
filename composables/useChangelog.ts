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
    },
    {
        version: '1.3.1',
        date: '2025-12-21',
        changes: {
            changed: [
                'Mobile responsive improvements with smaller title on mobile',
                'Hidden keyboard controls legend on mobile (touch buttons shown instead)'
            ]
        }
    },
    {
        version: '1.3.0',
        date: '2025-12-21',
        changes: {
            changed: [
                'Replaced confusing \"Custom\" with explicit Script A and Script B buttons',
                'Script B now uses distinct teal color',
                'HUD labels show actual player type with matching colors'
            ],
            fixed: [
                'Toast notification spam when selecting script modes'
            ]
        }
    },
    {
        version: '1.2.3',
        date: '2025-12-21',
        changes: {
            changed: [
                'Export now saves generation number for continuation',
                'Import shows detailed error messages for incompatible files',
                'Import seeds 25% of population for better gene preservation'
            ]
        }
    },
    {
        version: '1.2.2',
        date: '2025-12-21',
        changes: {
            changed: [
                'Rich Fitness Shaping with incremental rewards',
                'Stronger selection pressure: top 25% instead of 50%',
                'Larger base mutations and 10% chance of big mutations',
                'Hidden layer increased from 10 to 16 neurons'
            ]
        }
    },
    {
        version: '1.2.0',
        date: '2025-12-21',
        changes: {
            added: [
                'Multi-Slot Script Editor with Script A and Script B tabs',
                'Flexible Arcade Mode with explicit P1/P2 selection',
                'Script vs Script Battles to test strategies'
            ]
        }
    },
    {
        version: '1.1.0',
        date: '2025-12-20',
        changes: {
            added: [
                'Initial support for Custom Scripting via Monaco Editor',
                'Web Worker isolation for user scripts'
            ]
        }
    }
]

export function useChangelog() {
    return {
        changelog: changelogData,
        getLatestVersion: () => changelogData[0]?.version || '2.0.0',
        getVersionEntry: (version: string) => {
            return changelogData.find(entry => entry.version === version)
        }
    }
}
