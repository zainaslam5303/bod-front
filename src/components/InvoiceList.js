import React, { useEffect, useState } from "react";
import {Link} from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import Pdfdocument from "./Pdfdocument";
import API_BASE_URL from "../config";
import api from '../api';
function InvoiceList(){
    const [merchants,setMerchants]= useState([]);
    const [showTable, setShowTable] = useState(true);
    const[selectedMerchant,setSelectedMerchant] = useState('');
    const[merchantData,setMerchantData] = useState([]);
    const[invoiceData,setInvoiceData] = useState([]);
    const[type, setType] = useState('');
    const token = localStorage.getItem("token");
    const getMerchants = async() =>{
        const data = await api.get(`${API_BASE_URL}/merchants`);
        let result = data.data;
        if(result.success){
            setMerchants(result.merchants);
        }
    }
        const getInvoiceData = async() =>{
          const data = await api.get(`${API_BASE_URL}/invoice`);
          let result = data.data;
          if(result.success){
            // console.log(result.invoices);
              setInvoiceData(result.invoices);
          }
        }
    useEffect(()=>{
        getMerchants();
        getInvoiceData();
    },[]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleBalance = async() =>{
        // if(!selectedMerchant){
        //     alert('Please Select Merchant');
        //     return false;
        // }
        const response = await api.get(`${API_BASE_URL}/invoice?merchantId=${selectedMerchant}&oilType=${type}`);

        const result = response.data;
        if(result.success){
            if(result.invoices.length > 0){
                setInvoiceData(result.invoices);
                // setShowTable(true);
            }
            else{
                alert("No Data Found");
                // setShowTable(false);
            }

        }
    };
    const handleDelete = async (invoiceId) => {
      if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    
      try {
        const token = localStorage.getItem("token"); // or however you store it
    
        const response = await api.delete(`${API_BASE_URL}/invoice/${invoiceId}`);
    
        const data = response.data;
    
        if (data.success) {
          alert("Invoice deleted successfully!");
          // Optionally, refresh your list:
          getInvoiceData();
        } else {
          alert("Failed to delete invoice: " + data.message);
        }
      } catch (error) {
        console.error("Error deleting invoice:", error);
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
            // console.log(data.data);
        if (!Array.isArray(data.data)) {
          throw new Error('Data format is incorrect');
        }
        var data1 = data.data;
        let date = new Date().toLocaleDateString("en-GB");
        // console.log(data1[0].name);
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
        {/* <div className="row">
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
                    <option value="Sarso">Sarso</option>
                    <option value="Pakwan">Pakwan</option>
                    <option value="Tilli">Tilli</option>
                  </select>
                </div>
                <div className="col-sm-2" style={{marginTop:'2em'}}>
                    <button type="button" className="btn btn-primary rounded-pill" onClick={handleBalance}>Search</button>
                </div>
                
        </div>
        <br/> */}
        <div className="row">
        <div className="col-sm-4" style={{marginTop:'2em'}}>
          <Link to="/add-invoice" type="button" className="btn btn-secondary rounded-pill">Add Entry</Link>
          <button onClick={fetchAndGeneratePDF} type="button" className="btn btn-primary rounded-pill" style={{marginLeft:'2px'}}>Generate Pdf</button>

        </div>
        
        </div>
        <br />
        
        {showTable && <Table data={invoiceData} handleDelete = {handleDelete} />}
    </main>



    );
    
}
const Table = ({ data, handleDelete }) => {
  useEffect(() => {
    // Initialize only when data is available and table exists
    const tableEl = document.querySelector(".datatable");
    if (!tableEl || data.length === 0) return;
  
    // Destroy previous datatable safely (if exists)
    try {
      if (tableEl.dataTable) {
        tableEl.dataTable.destroy();
        tableEl.dataTable = null;
      }
    } catch (err) {
      console.warn("DataTable destroy failed:", err);
    }
  
    // Initialize new datatable
    let newTable = null;
    const typeFilter = document.querySelector("#typeFilter");
    const merchantFilter = document.querySelector("#merchantFilter");
  
    try {
      newTable = new window.simpleDatatables.DataTable(tableEl, {
        perPage: 25,
        perPageSelect: [10, 25, 50, 100, 500, 1000],
      });
      tableEl.dataTable = newTable;
  
      // guard: if filters not present, skip wiring
      if (typeFilter && merchantFilter) {
        // handler reference so we can remove it later
        const applyFilters = () => {
          const typeValue = (typeFilter.value || "").toLowerCase();
          const merchantValue = (merchantFilter.value || "").toLowerCase();
  
          // Get rendered rows from tbody
          const rows = tableEl.tBodies[0].rows; // HTMLCollection
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            // cells: adjust indexes if your columns change
            const type = (row.cells[2]?.textContent || "").toLowerCase();
            const merchant = (row.cells[3]?.textContent || "").toLowerCase();
  
            const matchesType = !typeValue || type.includes(typeValue);
            const matchesMerchant = !merchantValue || merchant.includes(merchantValue);
  
            row.style.display = matchesType && matchesMerchant ? "" : "none";
          }
        };
  
        // attach listeners
        typeFilter.addEventListener("input", applyFilters);
        merchantFilter.addEventListener("input", applyFilters);
  
        // apply initial filter (optional)
        applyFilters();
  
        // store references on element so cleanup can access them (or capture in closure)
        typeFilter._dtHandler = applyFilters;
        merchantFilter._dtHandler = applyFilters;
      }
    } catch (err) {
      console.error("DataTable init failed:", err);
    }
  
    // Cleanup on unmount
    return () => {
      try {
        // remove event listeners if added
        const tf = document.querySelector("#typeFilter");
        const mf = document.querySelector("#merchantFilter");
        if (tf && tf._dtHandler) tf.removeEventListener("input", tf._dtHandler);
        if (mf && mf._dtHandler) mf.removeEventListener("input", mf._dtHandler);
  
        // destroy datatable
        if (tableEl && tableEl.dataTable) {
          tableEl.dataTable.destroy();
          tableEl.dataTable = null;
        }
      } catch (err) {
        console.warn("Cleanup destroy failed:", err);
      }
    };
  }, [data]);
  
  
  return(
    <div className="row">
        

        <div className="col-lg-12">

          

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Invoice</h5>
              <div className="mb-3 d-flex gap-3">
              <input
                id="merchantFilter"
                type="text"
                placeholder="Filter by Merchant"
                className="form-control"
                style={{ maxWidth: "250px" }}
              />
              <input
                id="typeFilter"
                type="text"
                placeholder="Filter by Type"
                className="form-control"
                style={{ maxWidth: "200px" }}
              />
            </div>
              <table className="table table-bordered datatable">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col" style={{width:'100px'}}>Date</th>
                    <th scope="col">Type</th>
                    <th scope="col">Merchant</th>
                    <th scope="col">Description</th>
                    <th scope="col" style={{textAlign:'center'}}>Weight</th>
                    <th scope="col" style={{textAlign:'center'}}>Rate</th>
                    <th scope="col" style={{textAlign:'center'}}>Other Charges</th>
                    <th scope="col" style={{textAlign:'center'}}>Total</th>
                    <th scope="col" style={{textAlign:'center'}}>Settled Amount</th>
                    <th scope="col" style={{textAlign:'center'}}>Unsettled Amount</th>
                    {/* <th scope="col">Opening</th>
                    <th scope="col">Debit</th>
                    <th scope="col">Credit</th>
                    <th scope="col">Closing</th>
                    <th scope="col">Description</th> */}
                    {/* <th scope="col" style={{textAlign:'center'}}>Action</th> */}
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
                    <td style={{textAlign:'center'}}>{item.weight}</td>
                    <td style={{textAlign:'center'}}>{item.rate}</td>
                    <td style={{textAlign:'center'}}>{item.other_charges}</td>
                    <td style={{textAlign:'center'}}>{item.total_amount}</td>
                    <td style={{textAlign:'center'}}>{item.settled_amount}</td>
                    <td style={{textAlign:'center'}}>{item.unsettled_amount}</td>
                    {/* <td>{item.opening}</td>
                    <td>{item.debit}</td>
                    <td>{item.credit}</td>
                    <td>{item.closing}</td>
                    <td>{item.description}</td> */}
                    {/* <td style={{textAlign:'center'}}><Link to={"/update-balance-sarsoo/"+item.id} type="button" className="btn btn-success rounded-pill btn-sm" style={{fontSize:'10px'}}>Update</Link> <button
                      onClick={() => handleDelete(item.id)}
                      type="button"
                      className="btn btn-danger rounded-pill btn-sm"
                      style={{ fontSize: '10px' }}
                    >
                      Delete
                    </button></td> */}
                    
                    
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
};

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`; // Example format: YYYY-MM-DD
}
export default InvoiceList;