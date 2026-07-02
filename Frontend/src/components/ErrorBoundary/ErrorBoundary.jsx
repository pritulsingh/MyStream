import { Component } from "react"

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <main className="grid min-h-screen place-items-center bg-ink px-5 text-white">
          <section className="max-w-2xl border border-flame/40 bg-panel p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-flame">Runtime error</p>
            <h1 className="mt-3 text-3xl font-black">MyStream could not render</h1>
            <p className="mt-4 break-words border border-line bg-ink p-4 font-mono text-sm text-white/72">
              {this.state.error.message}
            </p>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
