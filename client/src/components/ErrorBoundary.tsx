import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * Enterprise Error Boundary with structured logging and user-friendly fallbacks
 * Captures React errors, logs them with context, and provides recovery options
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Structured error logging
    const errorReport = {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      sessionId: this.getSessionId()
    };

    // Log to console for development
    console.error('🚨 React Error Boundary Caught Error:', errorReport);

    // Send to monitoring service in production
    this.sendErrorReport(errorReport);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private getUserId(): string | null {
    try {
      // Try to get user ID from session storage or context
      return sessionStorage.getItem('userId') || localStorage.getItem('userId');
    } catch {
      return null;
    }
  }

  private getSessionId(): string {
    try {
      let sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('sessionId', sessionId);
      }
      return sessionId;
    } catch {
      return `fallback_${Date.now()}`;
    }
  }

  private async sendErrorReport(errorReport: any) {
    try {
      // Only send in production to avoid development noise
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/errors/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(errorReport)
        });
      }
    } catch (reportingError) {
      console.error('Failed to send error report:', reportingError);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl font-semibold">
                Qualcosa è andato storto
              </CardTitle>
              <CardDescription>
                Si è verificato un errore imprevisto. I nostri tecnici sono stati notificati automaticamente.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {this.props.showDetails && this.state.error && (
                <details className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
                  <summary className="cursor-pointer font-medium mb-2">
                    Dettagli tecnici
                  </summary>
                  <div className="space-y-2 text-xs">
                    <div>
                      <strong>ID Errore:</strong> {this.state.errorId}
                    </div>
                    <div>
                      <strong>Tipo:</strong> {this.state.error.name}
                    </div>
                    <div>
                      <strong>Messaggio:</strong> {this.state.error.message}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Stack Componenti:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                ID di riferimento: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{this.state.errorId}</code>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              <Button onClick={this.handleRetry} className="w-full" variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Riprova
              </Button>
              <div className="flex space-x-2 w-full">
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <Button onClick={this.handleReload} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Ricarica
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * Hook for manual error reporting from functional components
 */
export function useErrorHandler() {
  const reportError = React.useCallback((error: Error, context?: Record<string, any>) => {
    const errorReport = {
      errorId: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      type: 'manual'
    };

    console.error('🔴 Manual Error Report:', errorReport);

    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorReport)
      }).catch(reportingError => {
        console.error('Failed to send manual error report:', reportingError);
      });
    }
  }, []);

  return { reportError };
}

export default ErrorBoundary;