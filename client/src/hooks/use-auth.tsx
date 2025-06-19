// Simple auth utilities for user dashboard
export function useAuth() {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };
  
  const user = { id: 1, name: "Utente" }; // Simplified for now
  
  return { user, logout };
}