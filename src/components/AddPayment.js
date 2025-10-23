import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../config";

function AddPayment() {
    const navigate = useNavigate(); 
    const [merchants, setMerchants] = useState([]);
    const [merchant_id, setMerchantId] = useState('');
    const [oil_type, setType] = useState('');
    // const [option, setOption] = useState('');
    // const [quantity, setQuantity] = useState('');
    // const [weight, setWeight] = useState(0);
    // const [rate, setRate] = useState(0);
    // const [other_charges, setOtherCharges] = useState(0);
    const [amount, setAmount] = useState(0);
    const [description, setDescription] = useState('');
    const [payment_type, setPaymentType] = useState('');
    const [invoice_id, setInvoiceId] = useState(0);
    const [invoices, setInvoices] = useState([]);
    const [invoice_amount, setInvoiceAmount] = useState(0);
    const [date, setDate] = useState('');
    // const [showFields, setShowFields] = useState(true); // State to control visibility of weight and quantity fields
    const token = localStorage.getItem("token");

    const handlePayment = async () => {
        if(!merchant_id){
          alert("Please Select Merchant");
          return false;
        }
        if(!oil_type){
          alert("Please Select Type");
          return false;
        }
        if(!description){
          alert("Please Enter Description");
          return false;
        }
        if(!payment_type){
            alert("Please Select Payment Type");
          return false;
        }
        if(!date){
            alert("Please Select Date");
            return false;
        }
        // if(option === 2){
        //   setWeight(null);
        //   setQuantity(null);
        // }else{
        //   if(!weight){
        //     alert("Please enter weight");
        //     return false;
        //   }
        // }
        
        const response = await fetch(`${API_BASE_URL}/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': token
            },
            body: JSON.stringify({ merchant_id, oil_type, amount, description,invoice_id,payment_type,date }),
        });
        const data = await response.json();
        if(data.success){
          alert(data.message);
          navigate('/payment-list');
        }else{
          alert(data.message);
          return false;
        }
    };

    const getMerchants = async () => {
        const data = await fetch(`${API_BASE_URL}/merchants`, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': token,
            }
        });
        let result = await data.json();
        if (result.success) {
            setMerchants(result.merchants);
        }
    };
    const handlePaymentTypeChange = async (e) => {
        const selectedOption = e.target.value;
        setPaymentType(selectedOption);
        if(selectedOption === "invoice"){
    
        // if (!selectedId || selectedId === "Choose...") {
        //   setInvoices([]);
        //   return;
        // }
            try {
                const token = localStorage.getItem("token"); // if you use JWT auth
                if(!merchant_id){
                    alert("Kindly select merchant");
                    document.getElementById("inputPaymentType").value = "0";
                    return ;
                }
                if(!oil_type || oil_type === 'Choose...'){
                    alert("Kindly Select Type");
                    document.getElementById("inputPaymentType").value = "0";
                    return ;
                }
                const response = await fetch(`${API_BASE_URL}/invoice?merchantId=${merchant_id}&settleCheck=1&oilType=${oil_type}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": token || "",
                },
                });
        
                const data = await response.json();
                setInvoices(data.invoices);
                document.getElementById("invoice").classList.remove("d-none");
                document.getElementById("invoiceAmount").classList.remove("d-none");

            } catch (error) {
                console.error("Error fetching invoices:", error);
            }
        }else{
            const invoiceDiv = document.getElementById("invoice");
            if (invoiceDiv && !invoiceDiv.classList.contains("d-none")) {
                invoiceDiv.classList.add("d-none");
            }
            const invoiceAmountDiv = document.getElementById("invoiceAmount");
            if (invoiceAmountDiv && !invoiceAmountDiv.classList.contains("d-none")) {
                invoiceAmountDiv.classList.add("d-none");
            }
            document.getElementById("inputInvoice").value = "0";
            document.getElementById("inputAmount").value = "0";
            document.getElementById("inputInvoiceAmount").value = "0";

        }
    };
    const handleInvoiceChange = async(e)=>{
        const invoice_id = e.target.value;
        if(invoice_id && invoice_id !== 0){
            setInvoiceId(invoice_id);
            const selectedInvoice = invoices.find(inv => inv.id === parseInt(invoice_id)); // ya === invoice_id agar string hai
            if (selectedInvoice) {
                setInvoiceAmount(selectedInvoice.unsettled_amount); 
                setAmount(selectedInvoice.unsettled_amount);
            }
        }else{
            setInvoiceAmount(0);
            setAmount(0);
        }
        
        
    };
    useEffect(() => {
        getMerchants();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    // useEffect(() => {
    //     const parsedRate = parseFloat(rate) || 0;
    //     const parsedWeight = parseFloat(weight) || 0;
    //     const parsedOtherCharges = parseFloat(other_charges) || 0;
    //     setTotal((parsedRate * parsedWeight) + parsedOtherCharges);
    // }, [rate, weight, other_charges]);// eslint-disable-line react-hooks/exhaustive-deps

    // const handleOptionChange = (e) => {
    //     const selectedOption = e.target.value;
    //     setOption(selectedOption);
    //     if (selectedOption === '2') { // If Credit is selected
    //         setWeight(1);
    //         setQuantity('');
    //         setShowFields(false);
    //     } else {
    //         setShowFields(true);
    //     }
    // };

    return (
        <main id="main" className="main">
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">Add Payment</h5>

                    <form className="row g-3">
                        <div className="col-6">
                            <label htmlFor="Merchant" className="form-label">Merchant</label>
                            <select id="inputMerchant" className="form-select" onChange={(e) => setMerchantId(e.target.value)}>
                                <option defaultValue value="0">Choose...</option>
                                {merchants.map((item, index) =>
                                    <option key={index} value={item.id}>{item.name}</option>
                                )}
                            </select>
                        </div>
                        <div class="col-6">
                            <label for="inputDate" className="form-label">Date</label>
                            <input type="date" class="form-control" id="inputDate" required onChange={(e) => setDate(e.target.value)}/>
                        </div>
                        <div className="col-6">
                            <label htmlFor="OilType" className="form-label">Type</label>
                            <select id="inputState" className="form-select" onChange={(e) => setType(e.target.value)}>
                                <option defaultValue value="0">Choose...</option>
                                {/* {merchants.map((item, index) =>
                                    <option key={index} value={item.id}>{item.name}</option>
                                )} */}
                                <option value="Sarso">Sarso</option>
                                <option value="Pakwan">Pakwan</option>
                                <option value="Tilli">Tilli</option>
                            </select>
                        </div>
                        {/* <div className="col-md-4">
                            <label htmlFor="DebitCredit" className="form-label">Select Option</label>
                            <select id="inputState" className="form-select" onChange={handleOptionChange}>
                                <option defaultValue>Choose...</option>
                                <option value={1}>Debit</option>
                                <option value={2}>Credit</option>
                            </select>
                        </div> */}
                        <div className="col-6" id="invoiceDescription">
                            <label htmlFor="inputDescription" className="form-label">Payment Description</label>
                            <input type="text" value={description} className="form-control" id="inputInvoiceDescription" onChange={(e) => setDescription(e.target.value)}/>
                        </div>
                        <div className="col-6">
                            <label htmlFor="PaymentType" className="form-label">Payment Type</label>
                            <select id="inputPaymentType" className="form-select" onChange={handlePaymentTypeChange}>
                                <option defaultValue>Choose...</option>
                                {/* {merchants.map((item, index) =>
                                    <option key={index} value={item.id}>{item.name}</option>
                                )} */}
                                <option value="general">General</option>
                                <option value="invoice">Invoice</option>
                            </select>
                        </div>
                        
                        <div className="col-6 d-none" id="invoice">
                            <label htmlFor="Invoice" className="form-label">Invoice</label>
                            <select id="inputInvoice" className="form-select" onChange={handleInvoiceChange}>
                                <option defaultValue value="0">Choose...</option>
                                {invoices.map((item, index) =>
                                    <option key={index} value={item.id}>{formatDate(item.created_date)+' '+item.description}</option>
                                )}
                                {/* <option value="general">General</option>
                                <option value="invoice">Invoice</option> */}
                            </select>
                        </div>
                        <div className="col-6 d-none" id="invoiceAmount">
                            <label htmlFor="inputAmount" className="form-label">Invoice Amount</label>
                            <input type="number" value={invoice_amount} className="form-control" id="inputInvoiceAmount" readOnly disabled/>
                        </div>
                        <div className="col-6">
                            <label htmlFor="inputAmount" className="form-label">Amount</label>
                            <input type="number" value={amount} className="form-control" id="inputAmount" onChange={(e) => setAmount(e.target.value)} />
                        </div>

                        <div className="text-center">
                            <button type="button" className="btn btn-primary" onClick={handlePayment}>Submit</button>
                            <button type="reset" className="btn btn-secondary" style={{ marginLeft: '2px' }}>Reset</button>
                        </div>
                    </form>

                </div>
            </div>
        </main>
    )
}
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`; // Example format: YYYY-MM-DD
}
export default AddPayment;
