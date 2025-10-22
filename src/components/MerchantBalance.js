import React, { useEffect, useState } from "react";
import {Link} from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import Pdfdocument from "./Pdfdocument";
function MerchantBalance(){
    const [merchants,setMerchants]= useState([]);
    const [showTable, setShowTable] = useState(true);
    const[selectedMerchant,setSelectedMerchant] = useState('');
    // const[merchantData,setMerchantData] = useState([]);
    const[merchant_balance,setMerchantBalance] = useState([]);
    const[type, setType] = useState('');
    const token = localStorage.getItem("token");
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
        const getMerchantData = async() =>{
          const data = await fetch('http://localhost:5000/invoice/merchant-balance',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': token,
              }
          });
          let result = await data.json();
          if(result.success){
            setMerchantBalance(result.data);
          }
        }
    useEffect(()=>{
        getMerchants();
        getMerchantData();
    },[]) // eslint-disable-line react-hooks/exhaustive-deps
    
    const handleBalance = async() =>{
        // if(!selectedMerchant){
        //     alert('Please Select Merchant');
        //     return false;
        // }
        const response = await fetch(`http://localhost:5000/ledger?merchantId=${selectedMerchant}&oilType=${type}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'authorization': token,
          },
        });

        const result = await response.json();
        if(result.success){
            if(result.ledger.length > 0){
                // setLedgerData(result.ledger);
                // setShowTable(true);
            }
            else{
                alert("No Data Found");
                // setShowTable(false);
            }

        }
    };
    // const handleDelete = async (paymentId) => {
    //   if (!window.confirm("Are you sure you want to delete this payment?")) return;
    
    //   try {
    //     const token = localStorage.getItem("token"); // or however you store it
    
    //     const response = await fetch(`http://localhost:5000/payment/${paymentId}`, {
    //       method: "DELETE",
    //       headers: {
    //         "Content-Type": "application/json",
    //         authorization: token,
    //       },
    //     });
    
    //     const data = await response.json();
    
    //     if (data.success) {
    //       alert("Payment deleted successfully!");
    //       // Optionally, refresh your list:
    //     //   getPaymentData();
    //     } else {
    //       alert("Failed to delete payment: " + data.message);
    //     }
    //   } catch (error) {
    //     console.error("Error deleting payment:", error);
    //     alert("Something went wrong!");
    //   }
    // };
    
    const fetchAndGeneratePDF = async (merchant_id) => {
      try {
      //   if(!selectedMerchant){
      //     alert('Please Select Merchant');
      //     return false;
      // }
      // console.log(merchant_id);
      // alert(merchant_id);
      // return false;
        // const response = await fetch('http://localhost:5000/merchant-balance',{
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'authorization': token,
        //   },
        //   body: JSON.stringify({ merchantId: selectedMerchant}),
        //     });
        const response = await fetch(`http://localhost:5000/invoice?merchantId=${merchant_id}&settleCheck=1`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": token || "",
                },
                });
        // console.log(response);
        const data = await response.json();

        if (!Array.isArray(data.invoices)) {
          throw new Error('Data format is incorrect');
        }
        var data1 = data.invoices;
        let date = new Date().toLocaleDateString("en-GB");
        // Create a PDF and trigger download
        const doc = <Pdfdocument data={data1} />;
        const asPdf = pdf([]);
        asPdf.updateContainer(doc);
        const blob = await asPdf.toBlob();
        saveAs(blob, data1[0]?.Merchant?.name+'_'+date);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    return(
    <main id="main" className="main">
        <div className="row">
       
                {/* <div className="col-sm-2" style={{marginTop:'2em'}}>
                    <button type="button" className="btn btn-primary rounded-pill" onClick={handleBalance}>Search</button>
                </div> */}
                
        </div>
        <br/>
        <div className="row">
        <div className="col-sm-4" style={{marginTop:'2em'}}>
          {/* <Link to="/add-payment" type="button" className="btn btn-secondary rounded-pill">Add Entry</Link>
          <button onClick={fetchAndGeneratePDF} type="button" className="btn btn-primary rounded-pill" style={{marginLeft:'2px'}}>Generate Pdf</button> */}

        </div>
        
        </div>
        <br />
        
        {showTable && <Table data={merchant_balance} fetchAndGeneratePDF={fetchAndGeneratePDF} />}
    </main>



    );
    
}
const Table = ({ data,fetchAndGeneratePDF}) => (
    <div className="row">
        

        <div className="col-lg-12">

          

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Remaining Merchant Balance</h5>

              <table className="table table-bordered datatable">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Merchant Name</th>
                    <th scope="col">Sarso</th>
                    <th scope="col">Pakwan</th>
                    <th scope="col">Tilli</th>
                    <th scope="col">Total</th>
                    <th scope="col">Action</th>
                    
                  </tr>
                </thead>
                <tbody>
                    {
                    data.map((item,index)=>
                    <tr key={index}>
                    <th scope="row">{index+1}</th>
                    
                    <td>{item.merchant_name}</td>
                    <td>{Number(item.sarsoo).toLocaleString("en-US")}</td>
                    <td>{Number(item.pakwan).toLocaleString("en-US")}</td>
                    <td>{Number(item.tilli).toLocaleString("en-US")}</td>
                    <td>{Number(item.total).toLocaleString("en-US")}</td>
                    <td><button onClick={() => fetchAndGeneratePDF(item.merchant_id)} type="button" className="btn btn-primary rounded-pill" style={{marginLeft:'2px'}}>Generate Pdf</button></td>
                    
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
export default MerchantBalance;