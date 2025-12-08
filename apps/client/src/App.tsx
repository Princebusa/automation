import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./component/dashboard";
import '@xyflow/react/dist/style.css';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
