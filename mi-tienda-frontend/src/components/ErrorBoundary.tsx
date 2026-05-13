import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    return this.state.hasError
      ? this.props.fallback || (
          <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-border/20 bg-card/30 p-8 text-center">
            <div>
              <p className="text-sm font-medium text-foreground">Error al cargar esta sección</p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        )
      : this.props.children
  }
}
