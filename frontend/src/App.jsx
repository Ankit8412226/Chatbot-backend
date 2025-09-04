import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './lib/auth.jsx';

// Pages
import ApiKeys from './pages/ApiKeys.jsx';
import ChatTester from './pages/ChatTester.jsx';
import Dashboard from './pages/Dashboard.jsx';
import HandoffCenter from './pages/HandoffCenter.jsx';
import KnowledgeBase from './pages/KnowledgeBase.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import PromptTuner from './pages/PromptTuner.jsx';
import Signup from './pages/Signup.jsx';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Landing />} />

          {/* Protected routes */}
          <Route path="/app" element={
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                  <Dashboard />
                </main>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                  <Dashboard />
                </main>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/api-keys" element={
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                  <ApiKeys />
                </main>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/knowledge-base" element={
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                  <KnowledgeBase />
                </main>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/prompt-tuner" element={
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                  <PromptTuner />
                </main>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/chat-tester" element={
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                  <ChatTester />
                </main>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/handoff-center" element={
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                  <HandoffCenter />
                </main>
              </div>
            </ProtectedRoute>
          } />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
