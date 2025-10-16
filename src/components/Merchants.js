import React, { useEffect, useState } from "react";
import {Link} from 'react-router-dom';
function Merchants(){
    const [merchants,setMerchants] = useState([]);
    const token = localStorage.getItem("token");
    useEffect(()=>{
        getMerchants();
    },[])// eslint-disable-line react-hooks/exhaustive-deps

    const getMerchants = async() =>{
        const data = await fetch('http://localhost:5000/merchants',{
            headers: {
                'Content-Type': 'application/json',
                'authorization': token,
              }
        });
        let result = await data.json();
        if(result.success){
            setMerchants(result.merchants);
        }
    }

    const deleteMerchant = async(id)=>{
      if(window.confirm('Are you sure you want to delete it?')){
      const data = await fetch('http://localhost:5000/merchants/'+id,{
            headers: {
                'Content-Type': 'application/json',
                'authorization': token,
              },
              method: 'delete',
        });
        let result = await data.json();
        if(result.success){
            alert(result.message);
                     getMerchants();
        }else{
          alert(result.message);
        }
      }else{
        return false;
      }
    };
    return(
        <>
        <main id="main" className="main">

    <div className="pagetitle">
      <h1>Merchants</h1>
      <nav>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="index.html">Home</a></li>
          <li className="breadcrumb-item active">Merchant</li>
        </ol>
      </nav>
    </div>
    <div className="container my-2">
      <div className="pull-right">
    <Link to="/add-merchant" type="button" className="btn btn-primary float-right" >Add</Link>
      </div>
    </div>
    <section className="section">
      <div className="row">
        

        <div className="col-lg-12">

          

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Table with hoverable rows</h5>

              <table className="table table-hover">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Mobile Number</th>
                    <th scope="col">Created Date</th>
                    <th scope="col" style={{textAlign:'center'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                    {
                    merchants.map((item,index)=>
                    <tr key={index}>
                    <th scope="row">{index+1}</th>
                    <td>{item.name}</td>
                    <td>{item.mobile_number}</td>
                    <td>{formatDate(item.created_date)}</td>
                    <td style={{textAlign:'center'}}><Link to={"/merchant/"+item.id} type="button" className="btn btn-success rounded-pill btn-sm" style={{fontSize:'10px'}}>Update</Link><Link onClick={()=>deleteMerchant(item.id)} to="/merchants" type="button" className="btn btn-danger rounded-pill btn-sm" style={{fontSize:'10px',marginLeft:'2px'}}>Delete</Link> </td>
                  </tr>
                    )}
                  
                  
                </tbody>
              </table>

            </div>
          </div>

          
        </div>
      </div>
    </section>

  </main>
  </>
    )
}
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}
export default Merchants;