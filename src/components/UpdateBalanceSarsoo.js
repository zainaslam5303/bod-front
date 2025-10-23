import React, { useState, useEffect } from "react";
import { useNavigate,useParams } from 'react-router-dom';
import API_BASE_URL from "../config";


function UpdateBalanceSarsoo() {
    const navigate = useNavigate(); 
    // const [merchants, setMerchants] = useState([]);
    const [merchant_id, setMerchantId] = useState('');
    const [merchant, setMerchant] = useState('');
    const [option, setOption] = useState('');
    const [optionName,setOptionName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [weight, setWeight] = useState(0);
    const [rate, setRate] = useState(0);
    const [other_charges, setOtherCharges] = useState(0);
    const [total, setTotal] = useState((rate * weight));
    const [description, setDescription] = useState('');
    const [opening, setOpening] = useState(0);
    const [showFields, setShowFields] = useState(true); // State to control visibility of weight and quantity fields
    const [showOpening,setShowOpening] =useState(true);
    const token = localStorage.getItem("token");
    const params = useParams();
    const balanceId = params.id;

    const getBalanceDetails = async() =>{
        const response = await fetch(`${API_BASE_URL}/get-balance-details-sarsoo/`+balanceId, {
  
  headers: {
    'Content-Type': 'application/json',
    'authorization': token,
    },
    });
    const data = await response.json();
    if(data.success){
        let balanceDetails =data.result[0];
        setMerchant(balanceDetails.name);
        if(balanceDetails.debit === 0 || balanceDetails.debit === null){
            setWeight(1);
            setQuantity('');
            setShowFields(false);
            setOption('2');
            setOptionName('Credit');
        }else{
            setShowFields(true);
            setOption('1');
            setOptionName('Debit');
            setQuantity(balanceDetails.quantity);
            setWeight(balanceDetails.weight);
        }
        setTotal(balanceDetails.total);
        setRate(balanceDetails.rate);
        setOtherCharges(balanceDetails.other_charges);
        setOpening(balanceDetails.opening);
        setDescription(balanceDetails.description);
        setMerchantId(balanceDetails.merchant_id);
        setShowOpening(data.showOpening);
    }else{
        alert(data.result);
        navigate('/invoice-list');
    }
    
    }
    const handleMerchantBalanceSarsoo = async () => {
        // if(!merchant_id){
        //   alert("Please Select Merchant");
        //   return false;
        // }
        // if(!option){
        //   alert("Please Select Option");
        //   return false;
        // }
        if(!rate){
          alert("Please Enter Rate");
          return false;
        }
        if(!description){
          alert("Please Enter Description");
          return false;
        }
        if(option === 2){
          setWeight(null);
          setQuantity(null);
        }else{
          if(!weight){
            alert("Please enter weight");
            return false;
          }
        }
        
        const response = await fetch(`${API_BASE_URL}/update-balance-details-sarsoo/`+balanceId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'authorization': JSON.parse(token)
            },
            body: JSON.stringify({ option,opening,quantity, weight, rate, other_charges, total, description,merchant_id }),
        });
        const data = await response.json();
        if(data.success){
          console.log(data);
          alert(data.message);
          navigate('/invoice-list');
        }else{
        //   console.log(data);
          alert(data.message);
          return false;
        }
    };

    // const getMerchants = async () => {
    //     const data = await fetch('http://localhost:5000/merchants', {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'authorization': token,
    //         }
    //     });
    //     let result = await data.json();
    //     if (result.success) {
    //         setMerchants(result.merchants);
    //     }
    // };

    useEffect(() => {
        // getMerchants();
        getBalanceDetails();
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
                    <h5 className="card-title">Add Entry Sarsoo</h5>

                    <form className="row g-3">
                        <div className="col-md-4">
                            <label htmlFor="Merchant" className="form-label">Merchant</label>
                            {/* <select id="inputState" className="form-select" onChange={(e) => setMerchantId(e.target.value)}>
                                <option defaultValue>Choose...</option>
                                {merchants.map((item, index) =>
                                    <option key={index} value={item.id}>{item.name}</option>
                                )}
                            </select> */}
                            <input type="text" className="form-control" value={merchant} id="inputMerchant" disabled />

                        </div>
                        <div className="col-md-4">
                            <label htmlFor="DebitCredit" className="form-label">Select Option</label>
                            {/* <select id="inputState" className="form-select" onChange={handleOptionChange}>
                                <option defaultValue>Choose...</option>
                                <option value={1}>Debit</option>
                                <option value={2}>Credit</option>
                            </select> */}
                            <input type="text" className="form-control" value={optionName} id="inputMerchant" disabled />
                        </div>
                        {showFields && (
                            <>
                                <div className="col-12">
                                    <label htmlFor="inputQuantity" className="form-label">Quantity</label>
                                    <input type="text" className="form-control" value={quantity} id="inputQuantity" onChange={(e) => setQuantity(e.target.value)} />
                                </div>
                                <div className="col-12">
                                    <label htmlFor="inputWeight" className="form-label">Weight</label>
                                    <input type="text" className="form-control" value={weight} id="inputWeight" onChange={(e) => setWeight(e.target.value)} />
                                </div>
                            </>
                        )}
                        {showOpening && (
                            <>
                            <div className="col-12">
                                <label htmlFor="inputOpening" className="form-label">Opening</label>
                                <input type="text" className="form-control" value={opening} id="inputOpening" onChange={(e) => setOpening(e.target.value)} />
                            </div>
                            </>
                        )}
                        
                        <div className="col-12">
                            <label htmlFor="inputRate" className="form-label">Rate</label>
                            <input type="text" className="form-control" value={rate} id="inputRate" onChange={(e) => setRate(e.target.value)} />
                        </div>
                        <div className="col-12">
                            <label htmlFor="inputOtherCharges" className="form-label">Other Charges</label>
                            <input type="text" className="form-control" value={other_charges} id="inputOtherCharges" onChange={(e) => setOtherCharges(e.target.value)} />
                        </div>
                        <div className="col-12">
                            <label htmlFor="inputTotal" className="form-label">Total</label>
                            <input type="text" value={total} className="form-control" id="inputTotal" readOnly />
                        </div>
                        <div className="col-12">
                            <label htmlFor="inputDescription" className="form-label">Description</label>
                            <input type="text" className="form-control" value={description} id="inputDescription" required onChange={(e) => setDescription(e.target.value)} />
                        </div>

                        <div className="text-center">
                            <button type="button" className="btn btn-primary" onClick={handleMerchantBalanceSarsoo}>Submit</button>
                            <button type="reset" className="btn btn-secondary" style={{ marginLeft: '2px' }}>Reset</button>
                        </div>
                    </form>

                </div>
            </div>
        </main>
    )
}

export default UpdateBalanceSarsoo;