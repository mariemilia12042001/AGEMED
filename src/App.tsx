import React from "react";
import { HashRouter } from "react-router-dom";
import { AppStateProvider } from "./context/AppContext";
import LeftSidebar from "./components/LeftSidebar";
import PhoneFrame from "./components/PhoneFrame";
import AppRouter from "./routes/AppRouter";

export default function App() {
  return (
    <AppStateProvider>
      <HashRouter>
        <div id="main_container" className="flex flex-col md:flex-row min-h-screen bg-[#F0EFEA] text-neutral-900 font-sans">
          
          {/* LEFT SIMULATION CONTROLLER SIDEBAR PANEL */}
          <LeftSidebar />

          {/* RIGHT CENTERED PHONE EMULATOR AREA */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-[#FAF8F5] md:bg-[#E8E6E0] overflow-y-auto">
            <div className="my-auto">
              <PhoneFrame>
                <AppRouter />
              </PhoneFrame>
            </div>
          </div>

        </div>
      </HashRouter>
    </AppStateProvider>
  );
}
