'use client';

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="size-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Xatolik yuz berdi</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Sahifani yuklashda muammo bo&apos;ldi. Iltimos qayta urinib ko&apos;ring.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="rounded-xl"
          >
            <RefreshCw className="size-4 mr-2" />
            Qayta yuklash
          </Button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="mt-4 max-w-full overflow-auto rounded-lg bg-muted p-4 text-left text-xs text-muted-foreground">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
