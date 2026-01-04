import { apiGetAllWorkflows, apiCreateWorkflow, apiExecuteWorkflow } from "../lib/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {useAuth } from '../contexts/AuthContext'

export default function dashboard() {
  const {logout} = useAuth()
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);

  const navigate = useNavigate()
  
  useEffect(() => {
    apiGetAllWorkflows().then((users) => setData(users));
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
    setExecuting(workflowId);
    try {
      const result = await apiExecuteWorkflow(workflowId);
      alert(`Workflow execution result: ${result.success ? 'Success' : 'Failed'}\n${result.error || ''}`);
      console.log('Workflow execution result:', result);
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      alert('Failed to execute workflow. Check console for details.');
    } finally {
      setExecuting(null);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>My Workflows</h2>
        <div>
          <button 
            onClick={createNewWorkflow}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '10px'
            }}
          >
            {loading ? 'Creating...' : 'Create New Workflow'}
          </button>
          <button onClick={()=>logout()}>Logout</button>
        </div>
      </div>
      
      {data.length === 0 ? (
        <p>No workflows found. Create your first workflow!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {data.map((itm: any, key: number) => {
            return (
              <div key={key} style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: '#f9f9f9'
              }}>
                <h3>{itm.name || `Workflow ${key + 1}`}</h3>
                <p>ID: {itm._id}</p>
                <div style={{ marginTop: '15px' }}>
                  <button 
                    onClick={() => navigate(`/workflow/${itm._id}`)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '10px'
                    }}
                  >
                    Open
                  </button>
                  <button 
                    onClick={() => executeWorkflow(itm._id)}
                    disabled={executing === itm._id}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: executing === itm._id ? '#6c757d' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: executing === itm._id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {executing === itm._id ? 'Executing...' : 'Execute'}
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
