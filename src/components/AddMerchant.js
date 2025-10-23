
import React, { useState } from "react";
import {Link, useNavigate} from 'react-router-dom';
import API_BASE_URL from "../config";
function AddMerchant(){
    const navigate = useNavigate(); 
    const token = localStorage.getItem("token");
    const [name, setName] = useState('');
    const [mobile_number, setmobile_number] = useState('');
    const handleMerchant = async() =>{
        if(!name && !mobile_number){
            alert("Name can't be empty");
        }
        if(isNaN(mobile_number)){
            alert('Phone Number should be Number');
            return false;
        }
        const response = await fetch(`${API_BASE_URL}/merchants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': token,
      },
      body: JSON.stringify({ name, mobile_number }),
    });
    const data = await response.json();
    if(data.success){
        alert(data.message);
        navigate('/merchants');
    }
    else{
        alert(data.message);
        return false;
    }

    }

    return(
        <main id="main" className="main">

    <div className="pagetitle">
      <h1>Form Layouts</h1>
      <nav>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item">Forms</li>
          <li className="breadcrumb-item active">Layouts</li>
        </ol>
      </nav>
    </div>
    <section className="section">
      <div className="row">
       

        <div className="col-lg-12">

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Create Merchant</h5>

              <form className="row g-3">
                <div className="col-12">
                  <label htmlFor="inputNanme4" className="form-label">Name</label>
                  <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} id="inputNanme4" required/>
                </div>
                <div className="col-12">
                  <label htmlFor="inputMob" className="form-label">Mobile Number</label>
                  <input type="text" className="form-control" value={mobile_number} onChange={(e) => setmobile_number(e.target.value)} id="inputMob"/>
                </div>
                
                <div className="text-center">
                  <button type="button" className="btn btn-primary" onClick={handleMerchant}>Submit</button>
                  <button type="reset" className="btn btn-secondary" style={{marginLeft:'5px'}}>Reset</button>
                </div>
              </form>

            </div>
          </div>

        

        </div>
      </div>
    </section>

  </main>
    );
}

export default AddMerchant;