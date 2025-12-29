import { apiGetAllWorkflows } from "../lib/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function dashboard() {
  const [data, setData] = useState<any>([]);

  const navigate = useNavigate()
  useEffect(() => {
    apiGetAllWorkflows().then((users) => setData(users));
  }, []);
  console.log(data);
  return (
    <div>
      {data.map((itm: any, key: number) => {
        return (
          <div key={key}>
            <p>{itm._id}</p>
            <button onClick={()=>{
                navigate(`/workflow/${itm._id}`)
            }}>
                open
            </button>
          </div>
        );
      })}
    </div>
  );
}
