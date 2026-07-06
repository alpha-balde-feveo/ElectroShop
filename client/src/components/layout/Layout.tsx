import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  const { pathname } = useLocation();
  const fullBleed = pathname === "/"; // la page d'accueil gère sa propre mise en page

  return (
    <div className="min-h-screen bg-[#05060a] text-white flex flex-col">
      <Header />
      <main
        className={
          fullBleed ? "flex-1" : "flex-1 max-w-6xl mx-auto px-4 py-8 w-full"
        }
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
