import React, { useEffect, useState } from "react";
import {Link} from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import Pdfdocument from "./Pdfdocument";
import API_BASE_URL from "../config";
import { useNavigate } from 'react-router-dom';
function ManualAdjustment(){
    const navigate = useNavigate(); 
    const [invoice_id,setInvoiceId] = useState(0);
    const [invoice, setInvoice] = useState([]);
    const [type, setType] = useState('');
    const [merchant_id, setMerchantId] = useState(0);
    const [payment, setPayment] = useState([]);
    const [payment_id, setPaymentId] = useState(0);

    const [merchants,setMerchants]= useState([]);

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
        const getMerchantData = async() =>{
          const data = await fetch(`${API_BASE_URL}/invoice/merchant-balance`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': token,
              }
          });
          let result = await data.json();
          if(result.success){
            
          }
        }
    useEffect(()=>{
        getMerchants();
        // getMerchantData();
    },[]) // eslint-disable-line react-hooks/exhaustive-deps
    
    
    return(
    <main id="main" className="main">
        <form className="row g-3">
                        <div className="col-6">
                            <label htmlFor="Merchant" className="form-label">Merchant</label>
                            <select id="inputState" className="form-select" onChange={(e) => setMerchantId(e.target.value)}>
                                <option defaultValue>Choose...</option>
                                {merchants.map((item, index) =>
                                    <option key={index} value={item.id}>{item.name}</option>
                                )}
                            </select>
                        </div>
                        <div className="col-6">
                            <label htmlFor="OilType" className="form-label">Type</label>
                            <select id="inputState" className="form-select" onChange={(e) => setType(e.target.value)}>
                                <option defaultValue>Choose...</option>
                                {/* {merchants.map((item, index) =>
                                    <option key={index} value={item.id}>{item.name}</option>
                                )} */}
                                <option value="Sarso">Sarso</option>
                                <option value="Pakwan">Pakwan</option>
                                <option value="Tilli">Tilli</option>
                            </select>
                        </div>
                       
                        <div className="col-6">
                            <label htmlFor="inputInvoice" className="form-label">Invoice</label>
                            <select id="inputInvoice" className="form-select" onChange={(e) => setInvoiceId(e.target.value)}>
                                <option defaultValue>Choose...</option>
                                {invoice.map((item, index) =>
                                    <option key={index} value={item.id}>{item.name}</option>
                                )}
                            </select>
                        </div>

                        <div className="col-6">
                            <label htmlFor="inputPayment" className="form-label">Payment</label>
                            <select id="inputPayment" className="form-select" onChange={(e) => setPaymentId(e.target.value)}>
                                <option defaultValue>Choose...</option>
                                {payment.map((item, index) =>
                                    <option key={index} value={item.id}>{item.name}</option>
                                )}
                            </select>
                        </div>
                        
                       

                        <div className="text-center">
                            <button type="button" className="btn btn-primary" >Adjust</button>
                            <button type="reset" className="btn btn-secondary" style={{ marginLeft: '2px' }}>Reset</button>
                        </div>
        </form>
    </main>



    );
    
}


function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`; // Example format: YYYY-MM-DD
}
export default ManualAdjustment;