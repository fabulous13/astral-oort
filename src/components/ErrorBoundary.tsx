import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: '#ff4444', background: '#000', height: '100vh', fontFamily: 'monospace' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>ERREUR CRITIQUE DU SYSTÈME</h1>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
