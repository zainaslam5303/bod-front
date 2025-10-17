import React, { useEffect, useState } from "react";
import {Link} from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import Pdfdocument from "./Pdfdocument";
// import Ledger from "../../../bod-back/models/Ledger";
function LedgerList(){
    const [merchants,setMerchants]= useState([]);
    const [showTable, setShowTable] = useState(true);
    const[selectedMerchant,setSelectedMerchant] = useState('');
    // const[merchantData,setMerchantData] = useState([]);
    const[ledgerData,setLedgerData] = useState([]);
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
        const getPaymentData = async() =>{
          const data = await fetch('http://localhost:5000/payment',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': token,
              }
          });
          let result = await data.json();
          if(result.success){
            console.log(result.payments);
              setLedgerData(result.payments);
          }
        }
    useEffect(()=>{
        getMerchants();
        // getPaymentData();
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
                setLedgerData(result.ledger);
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
    
    const fetchAndGeneratePDF = async () => {
      try {
        if(!selectedMerchant){
          alert('Please Select Merchant');
          return false;
      }
        const response = await fetch('http://localhost:5000/merchant-balance',{
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
                <div className="col-md-3">
                  <label htmlFor="inputType" className="form-label">Type</label>
                  <select id="inputType" className="form-select" onChange={(e)=>{setType(e.target.value);}}>
                    <option value="">Select Type</option>
                    <option value="Sarsoo">Sarsoo</option>
                    <option value="Pakwan">Pakwan</option>
                    <option value="Tilli">Tilli</option>
                  </select>
                </div>
                <div className="col-sm-2" style={{marginTop:'2em'}}>
                    <button type="button" className="btn btn-primary rounded-pill" onClick={handleBalance}>Search</button>
                </div>
                
        </div>
        <br/>
        <div className="row">
        <div className="col-sm-4" style={{marginTop:'2em'}}>
          {/* <Link to="/add-payment" type="button" className="btn btn-secondary rounded-pill">Add Entry</Link>
          <button onClick={fetchAndGeneratePDF} type="button" className="btn btn-primary rounded-pill" style={{marginLeft:'2px'}}>Generate Pdf</button> */}

        </div>
        
        </div>
        <br />
        
        {showTable && <Table data={ledgerData} />}
    </main>



    );
    
}
const Table = ({ data, handleDelete }) => (
    <div className="row">
        

        <div className="col-lg-12">

          

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Ledger</h5>

              <table className="table table-bordered datatable">
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col" style={{ width: '100px' }}>Date</th>
                    <th scope="col">Description</th>
                    <th scope="col">Opening</th>
                    <th scope="col">Debit</th>
                    <th scope="col">Credit</th>
                    <th scope="col">Closing</th>
                    </tr>
                </thead>
                <tbody>
                {(() => {
  let runningBalance = 0;
  let grouped = [];

  // Step 1: Group by invoice_id (so we can put payments under their invoices)
  data.forEach(item => {
    if (item?.Invoice?.id) {
      // if this is an invoice, create a new group
      grouped.push({
        invoice: item,
        payments: []
      });
    } else if (item?.Payment?.invoice_id) {
      // find that invoice group
      const targetGroup = grouped.find(
        g => g.invoice?.invoice_id === item.Payment.invoice_id
      );
      if (targetGroup) {
        targetGroup.payments.push(item);
      } else {
        // if payment has no matching invoice, treat as standalone
        grouped.push({ invoice: null, payments: [item] });
      }
    } else {
      // neither invoice nor payment (maybe adjustment etc.)
      grouped.push({ invoice: item, payments: [] });
    }
  });

  // Step 2: Render grouped items in order
  return grouped.flatMap((group, groupIndex) => {
    const rows = [];

    const itemsToRender = group.invoice ? [group.invoice, ...group.payments] : group.payments;

    itemsToRender.forEach((item, index) => {
      const debit = parseInt(item.debit) || 0;
      const credit = parseInt(item.credit) || 0;

      const opening = runningBalance;
      const closing = opening + credit - debit;
      runningBalance = closing;

      rows.push(
        <tr key={`${groupIndex}-${index}`}>
          <th scope="row">{rows.length + 1}</th>
          <td>{formatDate(item?.Invoice?.date || item?.Payment?.date)}</td>
          <td>{item.description}</td>
          <td>{opening}</td>
          <td>{debit}</td>
          <td>{credit}</td>
          <td>{closing}</td>
        </tr>
      );
    });

    return rows;
  });
})()}

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
export default LedgerList;