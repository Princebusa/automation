import { apiGetAllWorkflows, apiCreateWorkflow, apiExecuteWorkflow, apiStopWorkflowExecution } from "../lib/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { Plus, Play, ExternalLink, LogOut } from 'lucide-react';

export default function dashboard() {
  const { logout } = useAuth();
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchWorkflows = async () => {
      const users = await apiGetAllWorkflows();
      setData(users);
    };
    
    fetchWorkflows();

    // Refresh workflow list every 5 seconds to catch status updates from the backend/executor
    const interval = setInterval(fetchWorkflows, 5000);

    return () => clearInterval(interval);
  }, []);

  const createNewWorkflow = async () => {
    setLoading(true);
    try {
      const newWorkflow = {
        name: `Workflow ${data.length + 1}`,
        nodes: [],
        edges: []
      };
      const response = await apiCreateWorkflow(newWorkflow);
      navigate(`/workflow/${response._id}`);
    } catch (error) {
      console.error('Failed to create workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const result = await apiExecuteWorkflow(workflowId);
      // Don't alert here to avoid blocking UI during polling
      console.log('Execution started:', result);
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      alert('Failed to execute workflow.');
    }
  };

  const stopWorkflow = async (workflowId: string) => {
    try {
      await apiStopWorkflowExecution(workflowId);
    } catch (error) {
      console.error('Failed to stop workflow:', error);
      alert('Failed to stop workflow.');
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 text-black p-6 md:p-12 font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Navbar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6 bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_#000]">
        <h2 className="text-4xl font-black uppercase tracking-tight flex items-center gap-3">
          n8n<span className="text-pink-500">.clone</span> <span className="text-2xl text-gray-500 bg-gray-200 px-2 py-1 border-2 border-black">Dashboard</span>
        </h2>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={createNewWorkflow}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 font-bold uppercase border-4 border-black text-lg
              ${loading ? 'bg-gray-300 opacity-75' : 'bg-blue-400 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all'}`}
          >
            <Plus className="w-6 h-6" /> {loading ? 'Creating...' : 'New Workflow'}
          </button>
          
          <button 
            onClick={() => logout()}
            className="flex items-center gap-2 px-6 py-3 bg-red-400 font-bold uppercase border-4 border-black text-lg hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
          >
            <LogOut className="w-6 h-6" /> Logout
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      {data.length === 0 ? (
        <div className="bg-white border-4 border-black p-12 text-center shadow-[12px_12px_0_0_#000] max-w-2xl mx-auto mt-24">
          <div className="text-8xl mb-6">🏜️</div>
          <h3 className="text-4xl font-black uppercase mb-4">It's quiet here.</h3>
          <p className="text-xl font-bold mb-8">You haven't built any workflows yet. Click the shiny blue button to start automating!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {data.map((itm: any, index: number) => {
            // Cycle through vibrant background colors for each card
            const bgColors = ['bg-pink-300', 'bg-blue-300', 'bg-yellow-300', 'bg-green-300'];
            const cardBg = bgColors[index % bgColors.length];

            return (
              <div 
                key={itm._id || index} 
                className={`${cardBg} border-4 border-black p-6 shadow-[8px_8px_0_0_#000] flex flex-col justify-between hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[16px_16px_0_0_#000] transition-all duration-200 cursor-default`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-3xl font-black uppercase leading-tight">{itm.name || `Workflow ${index + 1}`}</h3>
                    <div className="bg-white border-4 border-black px-2 py-1 text-sm font-bold shadow-[2px_2px_0_0_#000]">
                       {itm.nodes?.length || 0} Nodes
                    </div>
                  </div>
                  <p className="text-sm font-bold bg-white/50 border-2 border-black inline-block px-2 py-1 mb-6 truncate max-w-full">
                    ID: {itm._id}
                  </p>
                </div>
                
                <div className="flex gap-4 mt-4">
                  <button 
                    onClick={() => navigate(`/workflow/${itm._id}`)}
                    className="flex-1 flex justify-center items-center gap-2 py-3 bg-white border-4 border-black font-black uppercase hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
                  >
                    <ExternalLink className="w-5 h-5" /> Open
                  </button>
                  <button 
                    onClick={() => itm.isRunning ? stopWorkflow(itm._id) : executeWorkflow(itm._id)}
                    className={`flex-1 flex justify-center items-center gap-2 py-3 border-4 border-black font-black uppercase
                      ${itm.isRunning ? 'bg-red-500 hover:bg-red-400' : 'bg-black text-white hover:bg-gray-800'} 
                      hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_0_#fff] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all`}
                  >
                    {itm.isRunning ? (
                      'Stop'
                    ) : (
                      <><Play className="w-5 h-5 fill-white" /> Run</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
