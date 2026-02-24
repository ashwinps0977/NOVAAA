import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children?: ReactNode;
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
        console.error('❌ Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-red-50 flex items-center justify-center p-4" style={{ fontFamily: 'sans-serif' }}>
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full border border-red-200">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                        <p className="text-gray-600 mb-6">The application crashed. Please share the error below with support:</p>
                        <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto font-mono text-sm max-h-96 overflow-y-auto">
                            <p className="font-bold">{this.state.error?.name}: {this.state.error?.message}</p>
                            <pre className="mt-2 text-xs opacity-80">{this.state.error?.stack}</pre>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-md"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
