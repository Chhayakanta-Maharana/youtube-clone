import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-red-50 text-red-900">
          <div className="max-w-2xl p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <pre className="text-sm whitespace-pre-wrap">{this.state.error?.toString()}</pre>
            <details className="mt-3 text-sm text-gray-600">
              {this.state.info?.componentStack}
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
