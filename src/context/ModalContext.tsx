import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Database } from '../lib/types';

type Tarea = Database['public']['Tables']['tareas']['Row'];

interface ModalContextType {
  isTaskModalOpen: boolean;
  editingTarea: Tarea | null;
  openTaskModal: (tarea?: Tarea) => void;
  closeTaskModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTarea, setEditingTarea] = useState<Tarea | null>(null);

  const openTaskModal = (tarea?: Tarea) => {
    setEditingTarea(tarea ?? null);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTarea(null);
  };

  return (
    <ModalContext.Provider value={{ isTaskModalOpen, editingTarea, openTaskModal, closeTaskModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
