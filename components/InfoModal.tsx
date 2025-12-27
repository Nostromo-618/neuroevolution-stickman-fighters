import React, { useState } from 'react';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'MODES' | 'CONTROLS' | 'ABOUT'>('MODES');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[80vh]">

                {/* Sidebar / Tabs */}
                <div className="bg-slate-950 p-4 border-b md:border-b-0 md:border-r border-slate-800 flex flex-row md:flex-col gap-2 md:w-48 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('MODES')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold text-left transition-all ${activeTab === 'MODES' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        Game Modes
                    </button>
                    <button
                        onClick={() => setActiveTab('CONTROLS')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold text-left transition-all ${activeTab === 'CONTROLS' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        Controls
                    </button>
                    <button
                        onClick={() => setActiveTab('ABOUT')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold text-left transition-all ${activeTab === 'ABOUT' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        About
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-teal-400 tracking-tight">
                            {activeTab === 'MODES' && 'Single Match vs Evolving'}
                            {activeTab === 'CONTROLS' && 'Command List'}
                            {activeTab === 'ABOUT' && 'About NeuroFight'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="space-y-4 text-slate-300 leading-relaxed text-sm">

                        {/* --- MODES CONTENT --- */}
                        {activeTab === 'MODES' && (
                            <div className="space-y-6">
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-3 h-3 rounded-full bg-slate-500"></span>
                                        <h3 className="text-lg font-bold text-white">Single Match (Arcade)</h3>
                                    </div>
                                    <p className="mb-2">
                                        Think of this as <strong>"Exhibition Mode"</strong>. Matches play out one at a time at normal speed.
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs ml-2">
                                        <li><strong>Human vs AI:</strong> Show off your skills against the best trained generic model.</li>
                                        <li><strong>AI vs AI:</strong> Watch two specific setups fight a single duel.</li>
                                        <li><strong>No Evolution:</strong> The population does NOT evolve here (unless background training is active).</li>
                                    </ul>
                                </div>

                                <div className="bg-slate-800/50 p-4 rounded-xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                                        <h3 className="text-lg font-bold text-white">Evolving (Training)</h3>
                                    </div>
                                    <p className="mb-2">
                                        This is <strong>"Active Laboratory Mode"</strong>. The system churns through hundreds of matches to improve the AI.
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs ml-2">
                                        <li><strong>Survival of the Fittest:</strong> Rounds are fast. Weak AIs are discarded. Winners reproduce.</li>
                                        <li><strong>Rapid Evolution:</strong> Use this mode to actually TRAIN the neural network.</li>
                                        <li><strong>Visuals:</strong> You see a glimpse of the training process, but the goal is data, not a cinematic fight.</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* --- CONTROLS CONTENT --- */}
                        {activeTab === 'CONTROLS' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-800 rounded border border-slate-700">
                                    <h4 className="font-bold text-teal-500 mb-2 border-b border-slate-700 pb-1">MOVEMENT</h4>
                                    <div className="flex justify-between text-xs py-1"><span>Move Left/Right</span> <span className="font-mono text-white bg-slate-700 px-1 rounded">A / D</span></div>
                                    <div className="flex justify-between text-xs py-1"><span>Jump</span> <span className="font-mono text-white bg-slate-700 px-1 rounded">W / Space</span></div>
                                    <div className="flex justify-between text-xs py-1"><span>Crouch</span> <span className="font-mono text-white bg-slate-700 px-1 rounded">S</span></div>
                                </div>

                                <div className="p-3 bg-slate-800 rounded border border-slate-700">
                                    <h4 className="font-bold text-red-500 mb-2 border-b border-slate-700 pb-1">COMBAT</h4>
                                    <div className="flex justify-between text-xs py-1"><span>Punch (Fast)</span> <span className="font-mono text-white bg-slate-700 px-1 rounded">J / Z</span></div>
                                    <div className="flex justify-between text-xs py-1"><span>Kick (Strong)</span> <span className="font-mono text-white bg-slate-700 px-1 rounded">K / X</span></div>
                                    <div className="flex justify-between text-xs py-1"><span>Block</span> <span className="font-mono text-white bg-slate-700 px-1 rounded">L / Shift</span></div>
                                </div>
                            </div>
                        )}

                        {/* --- ABOUT CONTENT --- */}
                        {activeTab === 'ABOUT' && (
                            <div className="text-center pt-4">
                                <h3 className="text-xl font-bold text-white mb-2">NeuroEvolution Fighter</h3>
                                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                                    A demonstration of genetic algorithms and neural networks applied to a real-time fighting game.
                                    Watch AI agents learn from scratch how to move, attack, and defend without any pre-programmed knowledge.
                                </p>
                                <a
                                    href="https://github.com/Nostromo-618/neuroevolution-stickman-fighters"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold transition-all"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                                    View on GitHub
                                </a>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;
