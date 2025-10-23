import React, { useEffect, useState } from "react";
import {Link} from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import Pdfdocument from "./Pdfdocument";
import API_BASE_URL from "../config";
function PaymentList(){
    const [merchants,setMerchants]= useState([]);
    const [showTable, setShowTable] = useState(true);
    const[selectedMerchant,setSelectedMerchant] = useState('');
    const[merchantData,setMerchantData] = useState([]);
    const[paymentData,setPaymentData] = useState([]);
    const token = localStorage.getItem("token");
    const getMerchants = async() =>{
        const data = await fetch(`${API_BASE_URL}/merchants`,{
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
        const getPaymentData = async() =>{
          const data = await fetch(`${API_BASE_URL}/payment`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': token,
              }
          });
          let result = await data.json();
          if(result.success){
            console.log(result.payments);
              setPaymentData(result.payments);
          }
        }
    useEffect(()=>{
        getMerchants();
        getPaymentData();
    },[]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleBalance = async() =>{
        // if(!selectedMerchant){
        //     alert('Please Select Merchant');
        //     return false;
        // }
        const response = await fetch(`${API_BASE_URL}/payment?merchantId=${selectedMerchant}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'authorization': token,
          },
        });

        const result = await response.json();
        if(result.success){
            if(result.payments.length > 0){
                setPaymentData(result.payments);
                // setShowTable(true);
            }
            else{
                alert("No Data Found");
                // setShowTable(false);
            }

        }
    };
    const handleDelete = async (paymentId) => {
      if (!window.confirm("Are you sure you want to delete this payment?")) return;
    
      try {
        const token = localStorage.getItem("token"); // or however you store it
    
        const response = await fetch(`${API_BASE_URL}/payment/${paymentId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
        });
    
        const data = await response.json();
    
        if (data.success) {
          alert("Payment deleted successfully!");
          // Optionally, refresh your list:
          getPaymentData();
        } else {
          alert("Failed to delete payment: " + data.message);
        }
      } catch (error) {
        console.error("Error deleting payment:", error);
        alert("Something went wrong!");
      }
    };
    
    const fetchAndGeneratePDF = async () => {
      try {
        if(!selectedMerchant){
          alert('Please Select Merchant');
          return false;
      }
        const response = await fetch(`${API_BASE_URL}/merchant-balance`,{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': JSON.parse(token)
          },
          body: JSON.stringify({ merchantId: selectedMerchant}),
            });
        const data = await response.json();
            console.log(data.data);
        if (!Array.isArray(data.data)) {
          throw new Error('Data format is incorrect');
        }
        var data1 = data.data;
        let date = new Date().toLocaleDateString("en-GB");
        console.log(data1[0].name);
        // Create a PDF and trigger download
        const doc = <Pdfdocument data={data.data} />;
        const asPdf = pdf([]);
        asPdf.updateContainer(doc);
        const blob = await asPdf.toBlob();
        saveAs(blob, data1[0].name+' '+date);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    return(
    <main id="main" className="main">
        <div className="row">
        <div className="col-md-3">
                  <label htmlFor="inputMerchant" className="form-label">Merchant Name</label>
                  <select id="inputMerchant" className="form-select" onChange={(e)=>{setSelectedMerchant(e.target.value);}}>
                    <option value="">Select Merchant</option>
                    {merchants.map((item,index)=>
                        <option key={index} value={item.id}>{item.name}</option>
                    )}
                  </select>
                </div>
                <div className="col-sm-2" style={{marginTop:'2em'}}>
                    <button type="button" className="btn btn-primary rounded-pill" onClick={handleBalance}>Search</button>
                </div>
                
        </div>
        <br/>
        <div className="row">
        <div className="col-sm-4" style={{marginTop:'2em'}}>
          <Link to="/add-payment" type="button" className="btn btn-secondary rounded-pill">Add Entry</Link>
          <button onClick={fetchAndGeneratePDF} type="button" className="btn btn-primary rounded-pill" style={{marginLeft:'2px'}}>Generate Pdf</button>

        </div>
        
        </div>
        <br />
        
        {showTable && <Table data={paymentData} handleDelete = {handleDelete} />}
    </main>



    );
    
}
const Table = ({ data, handleDelete }) => (
    <div className="row">
        

        <div className="col-lg-12">

          

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Payment</h5>

              <table className="table table-bordered datatable">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col" style={{width:'100px'}}>Date</th>
                    <th scope="col">Type</th>
                    <th scope="col">Merchant</th>
                    <th scope="col">Description</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Settled Amount</th>
                    <th scope="col">Unsettled Amount</th>
                    {/* <th scope="col">Opening</th>
                    <th scope="col">Debit</th>
                    <th scope="col">Credit</th>
                    <th scope="col">Closing</th>
                    <th scope="col">Description</th> */}
                    <th scope="col">Action</th>
                    {/* <th scope="col" style={{textAlign:'center'}}>Action</th> */}
                  </tr>
                </thead>
                <tbody>
                    {
                    data.map((item,index)=>
                    <tr key={index}>
                    <th scope="row">{index+1}</th>
                    <td>{formatDate(item.date)}</td>
                    <td>{item.oil_type}</td>
                    <td>{item.Merchant.name}</td>
                    <td>{item.description}</td>
                    <td>{item.amount}</td>
                    <td>{item.settled_amount}</td>
                    <td>{item.unsettled_amount}</td>
                    {/* <td>{item.opening}</td>
                    <td>{item.debit}</td>
                    <td>{item.credit}</td>
                    <td>{item.closing}</td>
                    <td>{item.description}</td> */}
                    <td style={{textAlign:'center'}}><Link to={"/update-balance-sarsoo/"+item.id} type="button" className="btn btn-success rounded-pill btn-sm" style={{fontSize:'10px'}}>Update</Link> <button
                      onClick={() => handleDelete(item.id)}
                      type="button"
                      className="btn btn-danger rounded-pill btn-sm"
                      style={{ fontSize: '10px' }}
                    >
                      Delete
                    </button></td>
                    
                    
                    {/* <td style={{textAlign:'center'}}><Link to={"/merchant/"+item.id} type="button" className="btn btn-success rounded-pill btn-sm" style={{fontSize:'10px'}}>Update</Link><Link onClick={()=>deleteMerchant(item.id)} to="/merchants" type="button" className="btn btn-danger rounded-pill btn-sm" style={{fontSize:'10px',marginLeft:'2px'}}>Delete</Link> </td> */}
                  </tr>
                    )}
                  
                  
                </tbody>
              </table>

            </div>
          </div>

          
        </div>
      </div>
);

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`; // Example format: YYYY-MM-DD
}
export default PaymentList;