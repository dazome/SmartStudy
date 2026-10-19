import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function MainLayout() {
  return (
    <div className="min-vh-100 bg-light">

      <Navbar />

      <div className="d-flex">

        <Sidebar />

        <main
          className="flex-grow-1 p-4"
          style={{
            minWidth: 0
          }}
        >
          <Outlet />
        </main>

      </div>

    </div>
  );
}