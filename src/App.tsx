import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { useAuth } from './context/AuthContext';
import { useModal } from './context/ModalContext';
import { TaskFormModal } from './components/ui/TaskFormModal';
import Auth from './pages/Auth';
import Panel from './pages/Panel';
import Tareas from './pages/Tareas';

// Temporary inline components 
const Seguimientos = () => <div className="mt-20 p-8"><h1 className="text-3xl font-headline font-bold">Seguimientos</h1></div>;
const Calendario = () => <div className="mt-20 p-8"><h1 className="text-3xl font-headline font-bold">Calendario</h1></div>;
const Proyectos = () => <div className="mt-20 p-8"><h1 className="text-3xl font-headline font-bold">Equipo</h1></div>;
const Informes = () => <div className="mt-20 p-8"><h1 className="text-3xl font-headline font-bold">Reportes</h1></div>;

const App = () => {
  const { session, isLoading } = useAuth();
  const { isTaskModalOpen, closeTaskModal } = useModal();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-headline font-bold text-slate-500">Cargando...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      {/* Background is handled by body styles in index.css matching code.html */}
      <Sidebar />
      
      <main className="ml-[220px] p-8 pb-12 w-[calc(100%-220px)] relative z-10">
        <TopBar />
        
        <Routes>
          <Route path="/" element={<Navigate to="/panel" replace />} />
          <Route path="/panel" element={<Panel />} />
          <Route path="/tareas" element={<Tareas />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/seguimientos" element={<Seguimientos />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/informes" element={<Informes />} />
        </Routes>
      </main>

      <TaskFormModal isOpen={isTaskModalOpen} onClose={closeTaskModal} />
    </BrowserRouter>
  );
};

export default App;
