import { useContext, createContext, useState, ReactNode, useEffect } from 'react';
import useAsyncStorage from '../hooks/useAsyncStorage';

export interface BalancesSettings {
  showZeroBalances: boolean;
}

export interface BalancesSettingsContextType {
  balancesSettings: BalancesSettings;
  updateBalancesSettings: (callback: (balancesSettings: BalancesSettings) => BalancesSettings) => void;
}

const BalancesSettingsContext = createContext<BalancesSettingsContextType | undefined>(undefined);
const { Provider } = BalancesSettingsContext;

export function BalancesSettingsProvider({ children }: { children: ReactNode }) {
  const [balancesSettings, setBalancesSettings] = useState<BalancesSettings>({
    showZeroBalances: false,
  });
  const { loadKey,storeKey } = useAsyncStorage();

  const updateBalancesSettings = (callback: (balancesSettings: BalancesSettings) => BalancesSettings) => {
    setBalancesSettings((balancesSettings) => {
      const newBalancesSettings = callback(balancesSettings);
      storeKey('@balancesSettings', newBalancesSettings);
      return newBalancesSettings;
    });
  };

  const loadBalancesSettings = async () => {
    const balancesSettings = await loadKey('@balancesSettings');
    if(!balancesSettings) return;
    setBalancesSettings(balancesSettings);
  };

  useEffect(() => {
    loadBalancesSettings();
  }, []);



  return (
    <Provider value={{ balancesSettings, updateBalancesSettings }}>
      {children}
    </Provider>
  );
}

export function useBalancesSettings() {
  const context = useContext(BalancesSettingsContext);
  if (context === undefined) {
    throw new Error(
      'useBalancesSettings must be used within a BalancesSettingsProvider'
    );
  }
  return context;
}
