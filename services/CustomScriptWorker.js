/**
 * =============================================================================
 * CUSTOM SCRIPT WORKER - Sandboxed User Script Execution
 * =============================================================================
 * 
 * This Web Worker executes user-written JavaScript code in an isolated
 * environment. Workers run in a separate thread and have NO access to:
 * - The DOM (document, window)
 * - Page globals
 * - Parent page JavaScript context
 * 
 * This provides security isolation - malicious user scripts cannot
 * access or modify the page.
 * 
 * COMMUNICATION:
 * Parent sends: { type: 'execute', code: string, self: FighterState, opponent: FighterState }
 * Worker responds: { type: 'result', success: boolean, action?: InputState, error?: string }
 * 
 * =============================================================================
 */

// The worker receives messages from the main thread
self.onmessage = function (e) {
    const { type, code, self: selfState, opponent } = e.data;

    if (type === 'compile') {
        // Compile and validate the user's code
        try {
            const wrappedCode = `
        ${code}
        return typeof decide === 'function' ? decide : null;
      `;
            const factory = new Function(wrappedCode);
            const decideFn = factory();

            if (!decideFn) {
                self.postMessage({
                    type: 'compiled',
                    success: false,
                    error: 'No "decide" function found. Make sure you define: function decide(self, opponent) { ... }'
                });
                return;
            }

            // Store the function for later execution
            self._decideFn = decideFn;
            self.postMessage({ type: 'compiled', success: true });
        } catch (err) {
            self.postMessage({
                type: 'compiled',
                success: false,
                error: `Syntax Error: ${err.message}`
            });
        }
    }

    if (type === 'execute') {
        // Execute the stored function with fighter states
        if (!self._decideFn) {
            self.postMessage({
                type: 'result',
                success: false,
                error: 'No script compiled',
                action: { left: false, right: false, up: false, down: false, action1: false, action2: false, action3: false }
            });
            return;
        }

        try {
            const result = self._decideFn(selfState, opponent);

            // Sanitize output to ensure valid InputState
            const action = {
                left: Boolean(result?.left),
                right: Boolean(result?.right),
                up: Boolean(result?.up),
                down: Boolean(result?.down),
                action1: Boolean(result?.action1),
                action2: Boolean(result?.action2),
                action3: Boolean(result?.action3),
            };

            self.postMessage({ type: 'result', success: true, action });
        } catch (err) {
            self.postMessage({
                type: 'result',
                success: false,
                error: err.message,
                action: { left: false, right: false, up: false, down: false, action1: false, action2: false, action3: false }
            });
        }
    }
};
