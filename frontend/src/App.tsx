import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clientes } from './pages/Clientes';
import { Graficos } from './pages/Graficos';
import { Lembretes } from './pages/Lembretes';
import { HistoricoVeiculo } from './pages/HistoricoVeiculo';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <Layout>
              <Clientes />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/graficos"
        element={
          <ProtectedRoute>
            <Layout>
              <Graficos />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/lembretes"
        element={
          <ProtectedRoute>
            <Layout>
              <Lembretes />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/veiculos/:id/historico"
        element={
          <ProtectedRoute>
            <Layout>
              <HistoricoVeiculo />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
