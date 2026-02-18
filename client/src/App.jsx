import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Home from './pages/Home';
import MOUEditor from './pages/MOUEditor';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mou" element={<MOUEditor />} />

      </Routes>
      <Analytics />
    </Router>
  );
}

export default App;
