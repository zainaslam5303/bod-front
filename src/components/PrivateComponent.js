import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';


const PrivateComponent = () =>{
    const auth = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    return auth && token ? <Outlet /> : <Navigate to="/login" />
}

export default PrivateComponent;