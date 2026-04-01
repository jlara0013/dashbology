import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { useAuth } from './context/AuthContext';
import { useModal } from './context/ModalContext';
import { TaskFormModal } from './components/ui/TaskFormModal';
import Auth from './pages/Auth';
import Panel from './pages/Panel';
import Tareas from './pages/Tareas';

import Calendario from './pages/Calendario';
import Proyectos from './pages/Proyectos';
import ProyectoDetalle from './pages/ProyectoDetalle';
import Reportes from './pages/Reportes';
import Seguimientos from './pages/Seguimientos';
import Ajustes from './pages/Ajustes';

import { FloatingTimer } from './components/ui/FloatingTimer';

const App = () => {
  const { session, isLoading } = useAuth();
  const { isTaskModalOpen, closeTaskModal } = useModal();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-headline font-bold text-slate-500">Cargando...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      {/* Background is handled by body styles in index.css matching code.html */}
      <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <main className="md:ml-[220px] md:w-[calc(100%-220px)] w-full p-4 md:p-8 pb-12 relative z-10">
        <TopBar onMobileMenuToggle={() => setIsMobileOpen(o => !o)} />

        <Routes>
          <Route path="/" element={<Navigate to="/panel" replace />} />
          <Route path="/panel" element={<Panel />} />
          <Route path="/tareas" element={<Tareas />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/seguimientos" element={<Seguimientos />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/proyectos/:id" element={<ProyectoDetalle />} />
          <Route path="/informes" element={<Reportes />} />
          <Route path="/ajustes" element={<Ajustes />} />
        </Routes>
      </main>

      <TaskFormModal isOpen={isTaskModalOpen} onClose={closeTaskModal} />
      <FloatingTimer />
    </BrowserRouter>
  );
};

export default App;
