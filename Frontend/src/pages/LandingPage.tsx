import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Upload, Shield, Zap, BarChart3, Heart, Github, Twitter } from 'lucide-react';
import Button from '../components/Button';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Upload,
      title: 'Expiry-based Links',
      description: '24 hours or custom expiry time for your shared files',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Shield,
      title: 'Privacy & Security First',
      description: 'Your files are secure with end-to-end protection',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'Instant Upload & Download',
      description: 'Lightning-fast file transfers up to 50MB',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: BarChart3,
      title: 'Track File Status',
      description: 'Monitor download counts and file activity',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Simple. Secure.
              </span>
              <br />
              <span className="text-gray-800">
                Self-Destructing
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                File Sharing
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-2">
              QuickShare – Built under Arvana
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Share files securely with automatic expiry. Upload once, share anywhere, 
              and let your files disappear when they should.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-16 flex justify-center"
          >
            <Link to="/upload">
              <Button size="lg" className="text-xl px-12 py-4">
                <Upload className="w-6 h-6" />
                Upload a File
              </Button>
            </Link>
          </motion.div>

          {/* Floating Animation Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 -z-10">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, x: 0 }}
                  animate={{
                    y: [-20, 20, -20],
                    x: [-10, 10, -10],
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`absolute w-20 h-20 rounded-full bg-gradient-to-r ${
                    i % 2 === 0 ? 'from-blue-200 to-purple-200' : 'from-cyan-200 to-pink-200'
                  } opacity-20`}
                  style={{
                    left: `${20 + (i * 15)}%`,
                    top: `${30 + (i * 10)}%`,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/50 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Why Choose QuickShare?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the perfect blend of simplicity, security, and speed in file sharing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 mx-auto`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-3xl p-12 text-white relative overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Share Securely?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of users who trust QuickShare for their file sharing needs.
              </p>
              <Link to="/upload">
                <Button variant="secondary" size="lg" className="bg-white text-gray-800 hover:bg-gray-100">
                  Start Sharing Now
                </Button>
              </Link>
            </div>
            
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 20 + i * 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute w-32 h-32 border-2 border-white rounded-full"
                  style={{
                    left: `${i * 15}%`,
                    top: `${i * 10}%`,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  Q
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">QuickShare</h3>
                  <p className="text-sm text-gray-400">Built under Arvana</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6">
                Simple, secure, and self-destructing file sharing for everyone.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex justify-center space-x-6 mb-8"
            >
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Github className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="border-t border-gray-800 pt-8"
            >
              <p className="text-gray-400 flex items-center justify-center space-x-2">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500" />
                <span>by Arvana</span>
              </p>
              <p className="text-gray-500 text-sm mt-2">
                © 2025 QuickShare. All rights reserved.
              </p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;