"use client";

import { useEffect } from "react";

/**
 * Installs global error handlers for uncaught errors and unhandled promise rejections
 * that occur outside of React's error boundary (e.g. in event handlers, timers, promises).
 * Errors are logged to the console and reported via window.dispatchEvent so they can be
 * observed by monitoring tools.
 */
export function GlobalErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent | string) => {
      const error =
        typeof event === "string" ? new Error(event) : event.error || new Error(event.message || String(event));
      console.error("[GlobalErrorHandler] Uncaught error:", error);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("[GlobalErrorHandler] Unhandled promise rejection:", event.reason);
    };

    window.addEventListener("error", handleError as EventListener);
    window.addEventListener("unhandledrejection", handleRejection as EventListener);

    return () => {
      window.removeEventListener("error", handleError as EventListener);
      window.removeEventListener("unhandledrejection", handleRejection as EventListener);
    };
  }, []);

  return null;
}
