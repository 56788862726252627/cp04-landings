/**
 * FisioNova Premium V2 Pilot — Entry point
 * Demo comercial · Datos ficticios · NO producción
 */
import { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import { FisioNovaPilotApp } from './FisioNovaPilotApp.jsx';

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace', background: '#fff1f2', minHeight: '100vh' }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <h2 style={{ color: '#dc2626', fontSize: 18, marginBottom: 8 }}>
              FisioNova V2 Pilot — Error de renderizado
            </h2>
            <pre style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: 16, fontSize: 12, whiteSpace: 'pre-wrap', color: '#7f1d1d', overflowX: 'auto' }}>
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
            <p style={{ color: '#94a3b8', fontSize: 11, marginTop: 12 }}>Demo V2 Pilot · Datos ficticios</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>
      <FisioNovaPilotApp />
    </RootErrorBoundary>
  </StrictMode>
);
