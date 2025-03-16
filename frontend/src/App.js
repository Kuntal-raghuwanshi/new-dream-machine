import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatWindow from './components/ChatWindow';
import LandingPage from './components/LandingPage';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<ChatWindow />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App; 