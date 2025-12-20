import React from 'react';

interface GoodbyeScreenProps {
    onReturn: () => void;
}

const GoodbyeScreen: React.FC<GoodbyeScreenProps> = ({ onReturn }) => {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
            <div className="max-w-md w-full space-y-8">
                <div className="space-y-4">
                    <div className="inline-block p-4 rounded-full bg-slate-900 border border-slate-700 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2 2m-2-2v6m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
                        Farewell
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        We're sorry to see you go. To protect both you and the project, accepting the disclaimer is required to use this application.
                    </p>
                </div>

                <div className="pt-8 space-y-4">
                    <p className="text-slate-500 text-sm">
                        Changed your mind? You can always return and review the terms again.
                    </p>
                    <button
                        onClick={onReturn}
                        className="px-8 py-3 rounded-xl bg-slate-900 border border-slate-700 text-blue-400 font-semibold hover:bg-slate-800 hover:border-blue-500/50 hover:text-blue-300 transition-all active:scale-95 shadow-lg shadow-blue-500/5"
                    >
                        Return to Disclaimer
                    </button>
                </div>

                <div className="pt-12">
                    <p className="text-slate-600 text-xs">
                        © 2025 NeuroEvolution: Stickman Fighters Team
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GoodbyeScreen;
