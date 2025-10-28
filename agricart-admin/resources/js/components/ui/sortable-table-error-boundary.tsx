import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class SortableTableErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo
        });
        
        this.props.onError?.(error, errorInfo);
        
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('SortableTable Error:', error);
            console.error('Error Info:', errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="p-6 space-y-4">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Table Error</AlertTitle>
                        <AlertDescription>
                            Something went wrong while rendering the table. 
                            {this.state.error?.message && (
                                <span className="block mt-2 text-sm font-mono">
                                    {this.state.error.message}
                                </span>
                            )}
                        </AlertDescription>
                    </Alert>
                    
                    <div className="flex gap-2">
                        <Button 
                            onClick={this.handleRetry}
                            variant="outline"
                            size="sm"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                        
                        <Button 
                            onClick={() => window.location.reload()}
                            variant="outline"
                            size="sm"
                        >
                            Reload Page
                        </Button>
                    </div>
                    
                    {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                        <details className="mt-4 p-4 bg-muted rounded-lg">
                            <summary className="cursor-pointer font-medium">
                                Error Details (Development)
                            </summary>
                            <pre className="mt-2 text-xs overflow-auto">
                                {this.state.error?.stack}
                                {'\n\n'}
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}