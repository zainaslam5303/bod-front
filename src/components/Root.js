import React, { useEffect } from "react";
import Login from "./Login";
import {Routes,Route,useNavigate, Link} from 'react-router-dom';
// import PrivateComponent from "./PrivateComponent";
import Merchants from "./Merchants";
import UpdateMerchant from "./UpdateMerchant";
import AddMerchant from "./AddMerchant";
import InvoiceList from "./InvoiceList";
import AddInvoice from "./AddInvoice";
import UpdateBalanceSarsoo from "./UpdateBalanceSarsoo";
import PaymentList from "./PaymentList";
import AddPayment from "./AddPayment";
import LedgerList from "./LedgerList";
import MerchantBalance from "./MerchantBalance";
import API_BASE_URL from "../config";
import ManualAdjustment from "./ManualAdjustment";
function Dashboard(){
  const user = localStorage.getItem("user");
  const userD = JSON.parse(user);
  // console.log(userD);
  // const token = localStorage.getItem("token");
  // console.log(token);
  const navigate = useNavigate();
  const handleBar = () =>{
    const body = document.body;
    body.classList.toggle('toggle-sidebar');
  }
  const logout = () =>{
    localStorage.clear();
    navigate('/login');
}
const handleAuth = async () => {
  const token = localStorage.getItem("token");
  if (!token) return logout(); // no token → logout

  const auth = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'authorization': token
    }
  });

  const data = await auth.json();
  // console.log("VERIFY RESPONSE =>", data);

  if (!data.success) {
    logout(); // token invalid → logout
  } else {
    console.log("User verified ✅", data.user);
  }
}

  useEffect(()=>{
    handleAuth();
    
},[])// eslint-disable-line react-hooks/exhaustive-deps


  return(
    
    
    
      <>
      {user ? <div>
        <header id="header" className="header fixed-top d-flex align-items-center">

<div className="d-flex align-items-center justify-content-between">
  <a href="index.html" className="logo d-flex align-items-center">
    <img src="assets/img/logo.png" alt="" />
    <span className="d-none d-lg-block">BOD</span>
  </a>
  <i className="bi bi-list toggle-sidebar-btn" onClick={handleBar}></i>
</div>



<nav className="header-nav ms-auto">
  <ul className="d-flex align-items-center">

    

    

    

    <li className="nav-item dropdown pe-3">

      <a href="#23" className="nav-link nav-profile d-flex align-items-center pe-0" data-bs-toggle="dropdown">
        {/* <img src="assets/img/profile-img.jpg" alt="Profile" className="rounded-circle"/> */}
        <span className="d-none d-md-block dropdown-toggle ps-2">{userD.first_name} {userD.last_name}</span>
      </a>

      <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
        <li className="dropdown-header">
          <h6>{userD.first_name} {userD.last_name}</h6>
        </li>
        <li>
          <hr className="dropdown-divider"/>
        </li>

        <li>
          <a className="dropdown-item d-flex align-items-center" href="users-profile.html">
            <i className="bi bi-person"></i>
            <span>My Profile</span>
          </a>
        </li>
        <li>
          <hr className="dropdown-divider"/>
        </li>

        <li>
          <a className="dropdown-item d-flex align-items-center" href="users-profile.html">
            <i className="bi bi-gear"></i>
            <span>Account Settings</span>
          </a>
        </li>
        <li>
          <hr className="dropdown-divider"/>
        </li>

        
        <li>
          <hr className="dropdown-divider"/>
        </li>

        <li>
          {/* <a className="dropdown-item d-flex align-items-center" href="#"> */}
          <Link className="dropdown-item d-flex align-items-center" to="/login" onClick={logout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Sign Out</span>
            </Link>
          {/* </a> */}
        </li>

      </ul>
    </li>

  </ul>
</nav>

</header>

<aside id="sidebar" className="sidebar">

<ul className="sidebar-nav" id="sidebar-nav">

  <li className="nav-item">
    <Link className="nav-link collapsed" to="/">
      <i className="bi bi-grid"></i>
      <span>Dashboard</span>
      </Link>
  </li>
  <li className="nav-item">
    <Link className="nav-link collapsed" to="/merchants">
      <i className="bi bi-person-fill"></i>
      <span>Merchants</span>
      </Link>
  </li>
  
  <li className="nav-item">
    <Link className="nav-link collapsed" to="/invoice-list">
      <i className="bi bi-calculator"></i>
      <span>Invoice</span>
      </Link>
  </li>

  <li className="nav-item">
    <Link className="nav-link collapsed" to="/payment-list">
      <i className="bi bi-cash"></i>
      <span>Payment</span>
      </Link>
  </li>

  <li className="nav-item">
    <Link className="nav-link collapsed" to="/ledger-list">
      <i className="bi-list-columns-reverse"></i>
      <span>Ledger</span>
      </Link>
  </li>

  <li className="nav-item">
    <Link className="nav-link collapsed" to="/merchant-balance">
      <i className="bi bi-cash-stack"></i>
      <span>Merchant Balance</span>
      </Link>
  </li>

  <li className="nav-item">
    <Link className="nav-link collapsed" to="/manual-adjustment">
      <i className="bi bi-sliders"></i>
      <span>Manual Adjustment</span>
      </Link>
  </li>

</ul>

</aside>
<Routes>
      {/* <Route element={<PrivateComponent />}> */}
        
      <Route path='/' element={<main id="main" className="main"><h1 style={{textAlign:'center'}}>Welcome to BOD Account Management System</h1></main>} />
      <Route path='/merchants' element={<Merchants/> } />
      <Route path='/add-merchant' element={<AddMerchant/>} />
      <Route path='/merchant/:id' element={<UpdateMerchant/>} />
      <Route path='/invoice-list' element={<InvoiceList/>} />
      <Route path='/add-invoice' element={<AddInvoice />} />
      <Route path='/payment-list' element={<PaymentList/>} />
      <Route path='/add-payment' element={<AddPayment />} />
      <Route path='/ledger-list' element={<LedgerList/>} />
      <Route path='/merchant-balance' element={<MerchantBalance/>} />
      <Route path='/manual-adjustment' element={<ManualAdjustment/>} />
      {/* <Route path='/add-payment' element={<AddPayment />} /> */}
      <Route path='/update-balance-sarsoo/:id' element={<UpdateBalanceSarsoo/>} />
      <Route path ='*' element ={<main id="main" className="main"><h1 style={{textAlign:'center'}}>404 Error Not Found</h1></main>}/>
      {/* <Route path='/' element={<h1>Home</h1>} />
      <Route path='/about' element={<h1>About</h1>} />
      <Route path='/update' element={<h1>Update</h1>} />
      <Route path='/contact' element={<h1>Contact</h1>} />
      <Route path='/logout' element={<h1>Logout</h1>} /> */}
      {/* </Route> */}
      {/* <Route path='/register' element={<Signup />} /> */}
      <Route path='/login' element={<Login />} />
     </Routes>

  <footer id="footer" className="footer">
    <div className="copyright">
      &copy; Copyright <strong><span>Zain Aslam</span></strong>. All Rights Reserved
    </div>
    
  </footer></div>
   :
    <div>
      <Routes>
       <Route path='/login' element={<Login />} />
    
    </Routes></div>}
  

  
    </>
  );
}
export default Dashboard;