import { Component, type ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { resetDemoData } from '@/utils/storage';

/** Last-resort fallback so a render error never leaves a blank screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex h-dvh">
        <EmptyState
          icon={<TriangleAlert />}
          title="Something went wrong"
          description="An unexpected error occurred. Reload to try again, or reset the demo data if it keeps happening."
          action={
            <div className="flex gap-2">
              <Button size="sm" onClick={() => window.location.reload()}>Reload</Button>
              <Button size="sm" variant="secondary" onClick={resetDemoData}>Reset data</Button>
            </div>
          }
        />
      </div>
    );
  }
}
