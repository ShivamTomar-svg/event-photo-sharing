import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CreateEventModal } from '../events/CreateEventModal';

export const AppLayout: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFB]">
      <Navbar onOpenCreateEvent={() => setIsCreateModalOpen(true)} />
      <main className="flex-1">
        <Outlet context={{ openCreateModal: () => setIsCreateModalOpen(true) }} />
      </main>
      <Footer />

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={() => {
          setIsCreateModalOpen(false);
          // Dispatch custom event so active pages (dashboard or events) refresh data
          window.dispatchEvent(new CustomEvent('event:created'));
        }}
      />
    </div>
  );
};
