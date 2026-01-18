"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import Button from "./ui/Button";
import Card from "./ui/Card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
          <Card className="max-w-md w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="font-heading text-2xl font-bold text-primary mb-2">
                Something went wrong
              </h2>
              <p className="text-neutral-600 mb-6">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.reload();
                  }}
                  variant="primary"
                >
                  Reload Page
                </Button>
                <Button
                  onClick={() => (window.location.href = "/dashboard")}
                  variant="secondary"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
