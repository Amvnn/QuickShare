import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import DownloadPage from './pages/DownloadPage';
import DownloadSearchPage from './pages/DownloadSearchPage';
import StatusPage from './pages/StatusPage';
import { FileProvider } from './context/FileContext';

function App() {
  return (
    <FileProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
          {/* Background Elements */}
          <div className="fixed inset-0 -z-10">
            {/* Floating Orbs */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.2, 1],
                  x: [0, 50, 0],
                  y: [0, -30, 0],
                }}
                transition={{
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatType: "reverse" as const
                }}
                className={`absolute rounded-full blur-xl ${
                  i % 4 === 0 ? 'bg-blue-200' :
                  i % 4 === 1 ? 'bg-purple-200' :
                  i % 4 === 2 ? 'bg-cyan-200' : 'bg-pink-200'
                }`}
                style={{
                  width: `${60 + i * 20}px`,
                  height: `${60 + i * 20}px`,
                  left: `${10 + (i * 12)}%`,
                  top: `${15 + (i * 8)}%`,
                  zIndex: -1
                }}
              />
            ))}
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.02]" style={{ zIndex: -1 }}>
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }} />
            </div>
            
            {/* Gradient Overlays */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-transparent rounded-full blur-3xl" style={{ zIndex: -1 }} />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-300/20 to-transparent rounded-full blur-3xl" style={{ zIndex: -1 }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-200/10 via-pink-200/10 to-yellow-200/10 rounded-full blur-3xl" style={{ zIndex: -1 }} />
          </div>
          
          <Navbar />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/download" element={<DownloadSearchPage />} />
              <Route path="/download/:fileId" element={<DownloadPage />} />
              <Route path="/status/:fileId" element={<StatusPage />} />
            </Routes>
          </motion.main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg',
              duration: 4000,
            }}
          />
        </div>
      </Router>
    </FileProvider>
  );
}

export default App;