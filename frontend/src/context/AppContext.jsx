import { createContext, useContext, useState, useCallback } from "react";
import { getPatients } from "../services/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [patients, setPatients]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPatients = useCallback(async (query = "") => {
    setLoading(true);
    try {
      const { data } = await getPatients(query);
      setPatients(data);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AppContext.Provider value={{ patients, loading, searchQuery, setSearchQuery, fetchPatients }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);