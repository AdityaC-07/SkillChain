import React from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled React error', error, info)
  }

  reload = () => {
    window.location.reload()
  }

  render(){
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
          <div className="max-w-xl w-full bg-white border border-slate-200 shadow rounded p-8 text-center">
            <h1 className="text-3xl font-heading mb-3 text-navy-900">Something went wrong</h1>
            <p className="text-slate-600 mb-6">The app encountered an unexpected error. Try reloading the page and if the issue continues, contact support.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button onClick={this.reload} className="px-5 py-3 bg-amber text-white rounded shadow hover:bg-amber-600">Reload</button>
              <a href="/" className="px-5 py-3 border border-slate-300 rounded hover:bg-slate-100">Go home</a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
