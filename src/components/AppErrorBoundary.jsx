import { Component, useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

// Shown while the boundary is tripped. During logout this lasts a few
// milliseconds (until the route change to /login resets the boundary); if
// nothing recovers it, offer a reload instead of leaving a blank page.
const ErrorFallback = () => {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStuck(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!stuck) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <p className="text-sm text-gray-700">Something went wrong on this page.</p>
      <button
        type="button"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </div>
  );
};

// A render error anywhere below used to unmount the whole app, which is what a
// blank page after logout was: logout resets the store before the route
// changes, and any page still mounted that choked on the reset state took
// everything down until a manual refresh. `resetKey` (the route) clears the
// error as soon as the user is sent somewhere else, e.g. to /login.
export default class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Render error caught by AppErrorBoundary:", error, info);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    return this.state.hasError ? <ErrorFallback /> : this.props.children;
  }
}
