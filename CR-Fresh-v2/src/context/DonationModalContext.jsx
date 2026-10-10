import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const DonationModalContext = createContext(null);

export function DonationModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialTier, setInitialTier] = useState(0);

  const openModal = useCallback((tierIndex = 0) => {
    setInitialTier(tierIndex);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, initialTier, openModal, closeModal }),
    [isOpen, initialTier, openModal, closeModal]
  );

  return (
    <DonationModalContext.Provider value={value}>
      {children}
    </DonationModalContext.Provider>
  );
}

export function useDonationModal() {
  const ctx = useContext(DonationModalContext);
  if (!ctx) {
    throw new Error('useDonationModal must be used within a DonationModalProvider');
  }
  return ctx;
}
