"use client";

import { Component, ErrorInfo, ReactNode, createElement } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary that catches rendering errors in its subtree
 * and renders a fallback UI instead of crashing the whole app.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("[ErrorBoundary] Caught an error:", error, errorInfo);
  }

  override render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) return createElement("div", { className: "p-4" }, fallback);

      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-destructive">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error?.message || "An unexpected error occurred."}
          </p>
          {process.env.NODE_ENV === "development" && errorInfo?.componentStack && (
            <details className="mt-4 text-left text-xs text-muted-foreground">
              <summary>Technical details</summary>
              <pre className="mt-2 overflow-x-auto">{errorInfo.componentStack}</pre>
            </details>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Try again
          </button>
        </div>
      );
    }

    return children;
  }
}

/**
 * Wrapper that renders children inside an ErrorBoundary.
 * Used in server component layouts to catch client-side rendering errors.
 */
export function ErrorBoundaryWrapper({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}
