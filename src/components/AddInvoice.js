import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../config";

function AddInvoice() {
    const navigate = useNavigate(); 
    const [merchants, setMerchants] = useState([]);
    const [merchant_id, setMerchantId] = useState('');
    const [oil_type, setType] = useState('');
    // const [option, setOption] = useState('');
    // const [quantity, setQuantity] = useState('');
    const [weight, setWeight] = useState(0);
    const [rate, setRate] = useState(0);
    const [other_charges, setOtherCharges] = useState(0);
    const [total_amount, setTotal] = useState((rate * weight));
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    // const [showFields, setShowFields] = useState(true); // State to control visibility of weight and quantity fields
    const token = localStorage.getItem("token");

    const handleInvoice = async () => {
        if(!merchant_id){
          alert("Please Select Merchant");
          return false;
        }
        if(!oil_type){
          alert("Please Select Type");
          return false;
        }
        if(!rate){
          alert("Please Enter Rate");
          return false;
        }
        if(!description){
          alert("Please Enter Description");
          return false;
        }
        if(!date){
            alert("Please Enter Date");
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
        
        const response = await fetch(`${API_BASE_URL}/invoice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': token
            },
            body: JSON.stringify({ merchant_id, oil_type, weight, rate, other_charges, total_amount, description,date }),
        });
        const data = await response.json();
        if(data.success){
          console.log(data);
          alert(data.message);
          navigate('/invoice-list');
        }else{
          console.log(data);
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

    useEffect(() => {
        getMerchants();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const parsedRate = parseFloat(rate) || 0;
        const parsedWeight = parseFloat(weight) || 0;
        const parsedOtherCharges = parseFloat(other_charges) || 0;
        setTotal((parsedRate * parsedWeight) + parsedOtherCharges);
    }, [rate, weight, other_charges]);// eslint-disable-line react-hooks/exhaustive-deps

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
                    <h5 className="card-title">Add Invoice</h5>

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
                        {/* <div className="col-md-4">
                            <label htmlFor="DebitCredit" className="form-label">Select Option</label>
                            <select id="inputState" className="form-select" onChange={handleOptionChange}>
                                <option defaultValue>Choose...</option>
                                <option value={1}>Debit</option>
                                <option value={2}>Credit</option>
                            </select>
                        </div> */}
                        <div class="col-6">
                            <label for="inputDate" className="form-label">Date</label>
                            <input type="date" class="form-control" id="inputDate" required onChange={(e) => setDate(e.target.value)}/>
                        </div>
                        <div className="col-6">
                            <label htmlFor="inputDescription" className="form-label">Description</label>
                            <input type="text" className="form-control" id="inputDescription" required onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div className="col-6">
                            <label htmlFor="inputWeight" className="form-label">Weight</label>
                            <input type="text" className="form-control" id="inputWeight" onChange={(e) => setWeight(e.target.value)} />
                        </div>
                        
                        <div className="col-6">
                            <label htmlFor="inputRate" className="form-label">Rate</label>
                            <input type="text" className="form-control" id="inputRate" onChange={(e) => setRate(e.target.value)} />
                        </div>
                        <div className="col-6">
                            <label htmlFor="inputOtherCharges" className="form-label">Other Charges</label>
                            <input type="number" value={other_charges} className="form-control" id="inputOtherCharges" onChange={(e) => setOtherCharges(e.target.value)} />
                        </div>
                        <div className="col-6">
                            <label htmlFor="inputTotal" className="form-label">Total</label>
                            <input type="text" value={total_amount} className="form-control" id="inputTotal" readOnly />
                        </div>

                        <div className="text-center">
                            <button type="button" className="btn btn-primary" onClick={handleInvoice}>Submit</button>
                            <button type="reset" className="btn btn-secondary" style={{ marginLeft: '2px' }}>Reset</button>
                        </div>
                    </form>

                </div>
            </div>
        </main>
    )
}

export default AddInvoice;
