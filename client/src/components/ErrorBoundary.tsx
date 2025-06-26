import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKey?: string | number;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

/**
 * Enterprise Error Boundary with structured logging and user-friendly fallbacks
 * Captures React errors, logs them with context, and provides recovery options
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Aggiorna lo state per mostrare il fallback UI
    return {
      hasError: true,
      error,
      errorId: generateErrorId()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log dell'errore
    this.logError(error, errorInfo);
    
    // Callback personalizzato
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Aggiorna lo state con le informazioni dell'errore
    this.setState({
      error,
      errorInfo
    });
  }

  componentDidUpdate(prevProps: Props) {
    // Reset dell'errore se cambia la resetKey
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // Log strutturato dell'errore
    console.error('React Error Boundary caught an error:', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // In produzione, invia l'errore al server
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToServer(error, errorInfo);
    }
  };

  private reportErrorToServer = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          errorId: this.state.errorId,
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name
          },
          errorInfo: {
            componentStack: errorInfo.componentStack
          },
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      });
    } catch (reportError) {
      console.error('Failed to report error to server:', reportError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Fallback personalizzato
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback di default
      return (
        <ErrorFallback
          error={this.state.error}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
        />
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
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
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

// ============================================================================
// COMPONENTE FALLBACK
// ============================================================================

interface ErrorFallbackProps {
  error?: Error;
  errorId?: string;
  onRetry: () => void;
  onReload: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorId, onRetry, onReload }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          {/* Icona errore */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* Titolo */}
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ops! Qualcosa è andato storto
          </h3>

          {/* Messaggio */}
          <p className="text-sm text-gray-500 mb-4">
            Si è verificato un errore imprevisto. Il nostro team è stato notificato.
          </p>

          {/* Error ID per debugging */}
          {errorId && (
            <p className="text-xs text-gray-400 mb-4">
              ID Errore: {errorId}
            </p>
          )}

          {/* Dettagli errore in sviluppo */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="text-left mb-4">
              <summary className="text-sm text-gray-600 cursor-pointer mb-2">
                Dettagli errore (solo sviluppo)
              </summary>
              <pre className="text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto max-h-32">
                {error.message}
                {'\n'}
                {error.stack}
              </pre>
            </details>
          )}

          {/* Azioni */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onRetry}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Riprova
            </button>
            <button
              onClick={onReload}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Ricarica pagina
            </button>
          </div>

          {/* Link di supporto */}
          <div className="mt-4">
            <a
              href="/support"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Contatta il supporto
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ERROR BOUNDARY SPECIALIZZATI
// ============================================================================

// Error Boundary per componenti specifici
export class ComponentErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: generateErrorId()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Component Error:', {
      component: errorInfo.componentStack?.split('\n')[1]?.trim() || 'Unknown',
      error: error.message,
      errorId: this.state.errorId
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 rounded-md bg-red-50">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-red-400 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="text-sm text-red-800">
              Errore nel caricamento del componente
            </span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error Boundary per route
export class RouteErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: generateErrorId()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Route Error:', {
      route: window.location.pathname,
      error: error.message,
      errorId: this.state.errorId
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Pagina non disponibile
            </h2>
            <p className="text-gray-600 mb-4">
              Si è verificato un errore nel caricamento della pagina.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Torna alla home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// HOOK PER ERRORI ASINCRONI
// ============================================================================

export const useAsyncError = () => {
  const [, setError] = React.useState();
  return React.useCallback((e: Error) => {
    setError(() => {
      throw e;
    });
  }, []);
};

export default ErrorBoundary;