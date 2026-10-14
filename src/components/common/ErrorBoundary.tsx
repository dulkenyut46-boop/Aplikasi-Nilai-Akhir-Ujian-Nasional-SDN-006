import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary tertangkap:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    if (window.confirm('Pulihkan data aplikasi ke pengaturan awal? Ini akan membersihkan cache peramban yang bermasalah.')) {
      try {
        // Only clear storage keys used by this app
        const keysToRemove = [
          'sdn006_un_students_v2',
          'sdn006_un_students_v1',
          'sdn006_photo_db',
        ];
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch (e) {
        // ignore
      }
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Terjadi Kendala Teknis Saat Memuat Tampilan
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                Aplikasi mendeteksi adanya kendala saat memproses tampilan atau memori peramban. Anda dapat memuat ulang halaman secara aman.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-zinc-50 dark:bg-zinc-850 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-rose-600 dark:text-rose-400 max-h-24 overflow-y-auto">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Muat Ulang Halaman
              </button>

              <button
                type="button"
                onClick={this.handleResetStorage}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Pulihkan Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
