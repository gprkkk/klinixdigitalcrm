import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'

const Login = lazy(() => import('./pages/Login'))
const Layout = lazy(() => import('./components/Layout'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Agenda = lazy(() => import('./pages/Agenda'))
const Clients = lazy(() => import('./pages/Clients'))
const ClientDetail = lazy(() => import('./pages/ClientDetail'))
const Professionals = lazy(() => import('./pages/Professionals'))
const Services = lazy(() => import('./pages/Services'))
const Reviews = lazy(() => import('./pages/Reviews'))
const Messages = lazy(() => import('./pages/Messages'))

function PageFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-slate-500">Carregando...</div>
    </div>
  )
}

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <Lazy>
            <Login />
          </Lazy>
        }
      />
      <Route
        path="/app"
        element={
          <Lazy>
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          </Lazy>
        }
      >
        <Route
          index
          element={
            <Lazy>
              <Dashboard />
            </Lazy>
          }
        />
        <Route
          path="agenda"
          element={
            <Lazy>
              <Agenda />
            </Lazy>
          }
        />
        <Route
          path="clientes"
          element={
            <Lazy>
              <Clients />
            </Lazy>
          }
        />
        <Route
          path="clientes/:id"
          element={
            <Lazy>
              <ClientDetail />
            </Lazy>
          }
        />
        <Route
          path="profissionais"
          element={
            <Lazy>
              <Professionals />
            </Lazy>
          }
        />
        <Route
          path="servicos"
          element={
            <Lazy>
              <Services />
            </Lazy>
          }
        />
        <Route
          path="avaliacoes"
          element={
            <Lazy>
              <Reviews />
            </Lazy>
          }
        />
        <Route
          path="mensagens"
          element={
            <Lazy>
              <Messages />
            </Lazy>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
