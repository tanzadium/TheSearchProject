import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LiveDemoPage from './pages/LiveDemoPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LiveDemoPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;