import { useEffect, useState } from "react";
import PublicHomePage from "./pages/PublicHomePage";
import RpgPathPage from "./pages/rpg/RpgPathPage";

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (currentPath === "/technologies/rpg") {
    return <RpgPathPage />;
  }

  return <PublicHomePage onNavigate={navigateTo} />;
}

export default App;
