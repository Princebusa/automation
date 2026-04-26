import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Box, Zap, Repeat } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-yellow-50 text-black font-sans selection:bg-pink-500 selection:text-white pb-0">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 border-b-4 border-black bg-white">
        <div className="text-3xl font-bold tracking-tighter cursor-pointer">flowSync<span className="text-pink-500"></span></div>
        <div className="space-x-6 flex items-center">
          {isAuthenticated ? (
            <Link to="/dashboard" className="px-6 py-2 bg-blue-400 neo-btn rounded-none">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="font-bold hover:underline text-lg">Log in</Link>
              <Link to="/register" className="px-6 py-2 bg-pink-400 neo-btn rounded-none text-lg">
                Start building
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-24 md:py-32 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <h1 className="text-6xl md:text-8xl font-black leading-[1.05] tracking-tight uppercase">
            Automate <br />
            <span className="bg-yellow-300 px-2 border-4 border-black shadow-[4px_4px_0_0_#000]">Everything.</span> <br />
            Without limits.
          </h1>
          <p className="text-xl md:text-2xl font-bold max-w-2xl bg-white border-4 border-black p-4 shadow-[4px_4px_0_0_#000] inline-block">
            Connect your favorite apps and APIs in minutes. Build powerful workflows without writing a single line of backend code.
          </p>
          <div className="flex flex-wrap gap-4 pt-6">
            <Link to={isAuthenticated ? "/dashboard" : "/register"} className="px-8 py-4 bg-blue-400 text-2xl neo-btn rounded-none flex items-center gap-2">
              Get Started Free <ArrowRight className="w-8 h-8" />
            </Link>
          </div>
        </div>
        
        {/* Decorative Graphic */}
        <div className="flex-1 hidden md:flex items-center justify-center relative">
           <div className="w-96 h-96 bg-pink-400 border-4 border-black rounded-full absolute shadow-[16px_16px_0_0_#000] animate-[pulse_4s_infinite]"></div>
           <div className="w-80 h-80 bg-yellow-400 border-4 border-black rounded-full absolute mix-blend-multiply right-0 top-10"></div>
           <div className="w-72 h-72 bg-blue-400 border-4 border-black rounded-full absolute mix-blend-multiply left-10 bottom-0"></div>
           
           <div className="absolute z-10 bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_#000] rotate-3 hover:rotate-0 transition-transform">
             <span className="text-4xl font-black tracking-tight">⚙️ WORKFLOW.</span>
           </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t-4 border-black bg-white py-24 border-b-4">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl md:text-6xl font-black uppercase mb-16 text-center">Why use this clone?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-pink-300 border-4 border-black p-8 shadow-[8px_8px_0_0_#000] transition-transform hover:-translate-y-2">
              <div className="bg-white border-4 border-black w-16 h-16 flex items-center justify-center mb-6">
                <Box className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black uppercase mb-4 leading-tight">Visual<br/>Node Editor</h3>
              <p className="text-lg font-bold opacity-90">Drag, drop, and connect nodes on an infinite canvas to visually map out your logic.</p>
            </div>

            <div className="bg-blue-300 border-4 border-black p-8 shadow-[8px_8px_0_0_#000] transition-transform hover:-translate-y-2">
              <div className="bg-white border-4 border-black w-16 h-16 flex items-center justify-center mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black uppercase mb-4 leading-tight">Live<br/>Execution</h3>
              <p className="text-lg font-bold opacity-90">Watch your automation run in real-time with WebSockets highlighting each executing step.</p>
            </div>

            <div className="bg-yellow-300 border-4 border-black p-8 shadow-[8px_8px_0_0_#000] transition-transform hover:-translate-y-2">
              <div className="bg-white border-4 border-black w-16 h-16 flex items-center justify-center mb-6">
                <Repeat className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black uppercase mb-4 leading-tight">Infinite<br/>Scale</h3>
              <p className="text-lg font-bold opacity-90">Powered by an independent worker process that perpetually scales without blocking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white p-12 text-center">
        <h2 className="text-4xl md:text-6xl font-black uppercase mb-6 text-yellow-300">Start automating now.</h2>
        <p className="font-bold text-gray-300 text-xl border-t border-gray-800 pt-8 mt-8">A resume project building an end-to-end workflow clone.</p>
      </footer>
    </div>
  );
}
