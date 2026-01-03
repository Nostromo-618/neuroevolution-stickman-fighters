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
