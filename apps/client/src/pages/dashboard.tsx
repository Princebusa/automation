import {apiGetAllWorkflows} from '../lib/api'
import { useEffect } from 'react'

export default function  dashboard(){
    useEffect( ()=>{
        apiGetAllWorkflows().then((users) => console.log(users));
        
    },[])
return <div>
hi
</div>
}