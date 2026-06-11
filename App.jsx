import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import EnterDetails from "./pages/EnterDetails";
import OnlineRoom from "./pages/OnlineRoom";
import LocalTwo from "./pages/LocalTwo";
import VsAI from "./pages/VsAI";
import "./index.css";

function AppLayout({ children }) {
  return (
    <div className="app-root">
      <header className="app-header">
        {/* Title row with logo + title */}
        <div className="app-header-title-row">
          <div className="app-logo">
            <span className="app-logo-mark">TT</span>
          </div>

          <h1 className="app-title">Tic Tac Toe Hub</h1>
        </div>

        <nav className="app-nav">
          <Link to="/" className="nav-link">
            Enter Details
          </Link>
          <Link to="/online" className="nav-link">
            Online Room
          </Link>
          <Link to="/local-two" className="nav-link">
            2 Players
          </Link>
          <Link to="/vs-ai" className="nav-link">
            Play vs AI
          </Link>
        </nav>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<EnterDetails />} />
          <Route path="/online" element={<OnlineRoom />} />
          <Route path="/local-two" element={<LocalTwo />} />
          <Route path="/vs-ai" element={<VsAI />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;