import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('LEADION - Erro não tratado:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Ops! Ocorreu uma instabilidade</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              O LEADION protegeu seus dados locais. Você pode recarregar a interface com segurança.
            </p>
            {this.state.error && (
              <div className="p-3 bg-neutral-950 rounded-lg text-left text-xs font-mono text-rose-300/90 overflow-x-auto max-h-32 border border-neutral-800">
                {this.state.error.message}
              </div>
            )}
            <div className="pt-2">
              <Button variant="primary" size="md" onClick={this.handleReset} leftIcon={<RotateCcw className="w-4 h-4" />}>
                Recarregar Aplicação
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

