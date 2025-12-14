/**
 * =============================================================================
 * SCRIPT EDITOR - Monaco Code Editor Modal
 * =============================================================================
 * 
 * Full-screen modal overlay containing a Monaco Editor for writing custom
 * fighter AI scripts. Features:
 * - JavaScript syntax highlighting
 * - Error display
 * - Save to localStorage
 * - Export/Import JSON files
 * - Reset to default template
 * 
 * LAZY LOADING:
 * Monaco Editor (~2MB) is loaded lazily only when this component mounts.
 * This keeps the main bundle small until the user actually uses the editor.
 * 
 * =============================================================================
 */

import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import type { OnMount } from '@monaco-editor/react';
import {
    getDefaultTemplate,
    loadScript,
    saveScript,
    exportScript,
    importScript,
    compileScript
} from '../services/CustomScriptRunner';

// Lazy load Monaco Editor - only loads when component mounts
const Editor = lazy(() => import('@monaco-editor/react').then(mod => ({ default: mod.default })));

// Loading fallback for Monaco
const EditorFallback = () => (
    <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1e1e1e',
        color: '#888',
        gap: '12px'
    }}>
        <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #a855f7',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }} />
        <span>Loading Code Editor...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
);

// =============================================================================
// COMPONENT PROPS
// =============================================================================

interface ScriptEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (code: string) => void;
}

// =============================================================================
// SCRIPT EDITOR COMPONENT
// =============================================================================

const ScriptEditor: React.FC<ScriptEditorProps> = ({ isOpen, onClose, onSave }) => {
    const [code, setCode] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load saved script or default template on open
    useEffect(() => {
        if (isOpen) {
            const savedCode = loadScript();
            setCode(savedCode || getDefaultTemplate());
            setError(null);
        }
    }, [isOpen]);

    // Validate code on change
    useEffect(() => {
        if (code) {
            const result = compileScript(code);
            setError(result.error);
        }
    }, [code]);

    // Handle editor mount - configure Monaco
    const handleEditorMount: OnMount = (editor, monaco) => {
        // Add custom type definitions for autocomplete
        monaco.languages.typescript.javascriptDefaults.addExtraLib(`
      interface FighterState {
        /** Horizontal position (0 = left edge, ~800 = right edge) */
        x: number;
        /** Vertical position (0 = top, ~380 = ground level) */
        y: number;
        /** Horizontal velocity (negative = left, positive = right) */
        vx: number;
        /** Vertical velocity (negative = up, positive = down) */
        vy: number;
        /** Current health points (0-100) */
        health: number;
        /** Current energy points (0-100) */
        energy: number;
        /** Current action state (0=idle, 1=move_left, 2=move_right, 3=jump, 4=crouch, 5=punch, 6=kick, 7=block) */
        state: number;
        /** Facing direction (-1 = left, 1 = right) */
        direction: -1 | 1;
        /** Frames until next action available */
        cooldown: number;
        /** Fighter hitbox width */
        width: number;
        /** Fighter hitbox height */
        height: number;
      }

      interface Actions {
        /** Move left */
        left: boolean;
        /** Move right */
        right: boolean;
        /** Jump */
        up: boolean;
        /** Crouch */
        down: boolean;
        /** Punch (action1) */
        action1: boolean;
        /** Kick (action2) */
        action2: boolean;
        /** Block (action3) */
        action3: boolean;
      }

      /**
       * Your fighter AI function - called 60 times per second
       * @param self Your fighter's current state
       * @param opponent Enemy fighter's current state
       * @returns Object with action booleans
       */
      declare function decide(self: FighterState, opponent: FighterState): Actions;
    `, 'fighter-types.d.ts');

        // Focus editor
        editor.focus();
    };

    // Save and close
    const handleSave = useCallback(() => {
        setIsSaving(true);
        saveScript(code);
        onSave(code);
        setIsSaving(false);
        onClose();
    }, [code, onSave, onClose]);

    // Reset to default template
    const handleReset = useCallback(() => {
        if (confirm('Reset to default template? Your changes will be lost.')) {
            const template = getDefaultTemplate();
            setCode(template);
            saveScript(template);
        }
    }, []);

    // Export script as JSON
    const handleExport = useCallback(() => {
        exportScript(code);
    }, [code]);

    // Import script from JSON file
    const handleImport = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            const importedCode = importScript(content);
            if (importedCode) {
                setCode(importedCode);
            } else {
                alert('Invalid script file. Please select a valid exported script.');
            }
        };
        reader.readAsText(file);

        // Reset input so same file can be selected again
        e.target.value = '';
    }, []);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            // Escape to close
            if (e.key === 'Escape') {
                onClose();
            }
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, handleSave]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                padding: '20px',
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                color: 'white',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#a855f7'
                    }}>
                        ✏️ Custom Fighter Script Editor
                    </h2>
                    <span style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        backgroundColor: '#1e293b',
                        padding: '4px 8px',
                        borderRadius: '4px'
                    }}>
                        JavaScript
                    </span>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        fontSize: '24px',
                        cursor: 'pointer',
                        padding: '4px 8px',
                    }}
                    title="Close (Esc)"
                >
                    ✕
                </button>
            </div>

            {/* Editor */}
            <div style={{
                flex: 1,
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #334155'
            }}>
                <Suspense fallback={<EditorFallback />}>
                    <Editor
                        height="100%"
                        defaultLanguage="javascript"
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        onMount={handleEditorMount}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 2,
                            wordWrap: 'on',
                            padding: { top: 12 },
                        }}
                    />
                </Suspense>
            </div>

            {/* Footer */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
                gap: '12px',
            }}>
                {/* Error Display */}
                <div style={{
                    flex: 1,
                    color: error ? '#ef4444' : '#22c55e',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    backgroundColor: '#1e293b',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {error || '✓ Script is valid'}
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleReset}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#475569',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                        }}
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleImport}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#475569',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                        }}
                    >
                        Import
                    </button>
                    <button
                        onClick={handleExport}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#475569',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                        }}
                    >
                        Export
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!!error || isSaving}
                        style={{
                            padding: '8px 20px',
                            backgroundColor: error ? '#475569' : '#a855f7',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: error ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            opacity: error ? 0.5 : 1,
                        }}
                    >
                        {isSaving ? 'Saving...' : 'Save & Close'}
                    </button>
                </div>

                {/* Hidden file input for import */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </div>
        </div>
    );
};

export default ScriptEditor;
