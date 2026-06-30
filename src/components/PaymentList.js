import React, { useEffect, useState } from "react";
import {Link} from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import Pdfdocument from "./Pdfdocument";
import API_BASE_URL from "../config";
import api from "../api";
function PaymentList(){
    const [merchants,setMerchants]= useState([]);
    const [showTable, setShowTable] = useState(true);
    const[selectedMerchant,setSelectedMerchant] = useState('');
    const[paymentData,setPaymentData] = useState([]);
    const [type, setType] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [pagination, setPagination] = useState({ page: 1, limit: 25, totalItems: 0, totalPages: 1 });
    const [loading, setLoading] = useState(false);
    const [showSettlementsModal, setShowSettlementsModal] = useState(false);
    const [settlements, setSettlements] = useState([]);
    const [loadingSettlements, setLoadingSettlements] = useState(false);
    const token = localStorage.getItem("token");
    const getMerchants = async() =>{
        const data = await api.get(`${API_BASE_URL}/merchants`);
        let result = data.data;
        if(result.success){
            setMerchants(result.merchants);
        }
    }
    const getPaymentData = async(overrides = {}) =>{
      try {
        setLoading(true);
        const params = {
          page: overrides.page ?? page,
          limit: overrides.limit ?? limit,
          search: overrides.search ?? search,
        };
        const merchantId = overrides.merchantId ?? selectedMerchant;
        const oilType = overrides.oilType ?? type;
        if (merchantId) params.merchantId = merchantId;
        if (oilType) params.oilType = oilType;

        const data = await api.get(`${API_BASE_URL}/payment`, { params });
        const result = data.data;
        if(result.success){
            setPaymentData(result.payments || []);
            if (result.pagination) {
              setPagination(result.pagination);
            }
            setShowTable(true);
        } else {
          setPaymentData([]);
          setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 1 }));
        }
      } finally {
        setLoading(false);
      }
    }
    useEffect(()=>{
        getMerchants();
    },[]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      const timeout = setTimeout(() => {
        getPaymentData();
      }, 350);
      return () => clearTimeout(timeout);
    }, [page, limit, search, selectedMerchant, type]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleBalance = async() =>{
      setPage(1);
      await getPaymentData({ page: 1 });
    };

    const handleViewSettlements = async (paymentId) => {
      try {
        setLoadingSettlements(true);
        const response = await api.get(`${API_BASE_URL}/payment/${paymentId}/settlements`);
        const result = response.data;
        if (result.success) {
          setSettlements(result.settlements || []);
          setShowSettlementsModal(true);
        } else {
          alert(result.message || "Failed to load settlements");
        }
      } catch (error) {
        console.error("View settlements error:", error);
        alert("Something went wrong while loading settlements");
      } finally {
        setLoadingSettlements(false);
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
                <div className="col-sm-2" style={{marginTop:'2em'}}>
                    <button type="button" className="btn btn-primary rounded-pill" onClick={handleBalance}>Search</button>
                </div>
                
        </div>
        <br/> */}
        <div className="row g-3">
        <div className="col-md-3">
          <label htmlFor="paymentMerchant" className="form-label">Merchant Name</label>
          <select
            id="paymentMerchant"
            className="form-select"
            value={selectedMerchant}
            onChange={(e)=>{ setSelectedMerchant(e.target.value); setPage(1); }}
          >
            <option value="">All Merchants</option>
            {merchants.map((item,index)=>
              <option key={index} value={item.id}>{item.name}</option>
            )}
          </select>
        </div>
        <div className="col-md-2">
          <label htmlFor="paymentType" className="form-label">Type</label>
          <select
            id="paymentType"
            className="form-select"
            value={type}
            onChange={(e)=>{ setType(e.target.value); setPage(1); }}
          >
            <option value="">All Types</option>
            <option value="Sarso">Sarso</option>
            <option value="Pakwan">Pakwan</option>
            <option value="Tilli">Tilli</option>
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="paymentSearch" className="form-label">Search</label>
          <input
            id="paymentSearch"
            type="text"
            className="form-control"
            placeholder="Merchant, type, description..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="col-md-3 d-flex align-items-end gap-2">
          <button type="button" className="btn btn-primary rounded-pill" onClick={handleBalance}>Search</button>
          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill"
            onClick={() => {
              setSelectedMerchant("");
              setType("");
              setSearch("");
              setPage(1);
            }}
          >
            Reset
          </button>
        </div>
        </div>
        <div className="row">
        <div className="col-sm-4" style={{marginTop:'2em'}}>
          <Link to="/add-payment" type="button" className="btn btn-secondary rounded-pill">Add Entry</Link>
          {/* <button onClick={fetchAndGeneratePDF} type="button" className="btn btn-primary rounded-pill" style={{marginLeft:'2px'}}>Generate Pdf</button> */}

        </div>
        
        </div>
        <br />
        
        {showTable && (
          <Table
            data={paymentData}
            page={pagination.page || page}
            limit={pagination.limit || limit}
            totalItems={pagination.totalItems || 0}
            totalPages={pagination.totalPages || 1}
            loading={loading}
            onViewSettlements={handleViewSettlements}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        )}

        {/* Settlements Modal */}
        {showSettlementsModal && (
          <>
            <div 
              className="modal-backdrop fade show" 
              style={{ animation: 'fadeIn 0.3s ease' }}
              onClick={() => setShowSettlementsModal(false)}
            />
            <div className="modal fade show d-block" tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content" style={{ animation: 'slideIn 0.3s ease' }}>
                  <div className="modal-header">
                    <h5 className="modal-title">Payment Settlements</h5>
                    <button type="button" className="btn-close" onClick={() => setShowSettlementsModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    {loadingSettlements ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : settlements.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <i className="bi bi-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
                        No settlements found
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover table-striped">
                          <thead className="table-light">
                            <tr>
                              <th>#</th>
                              <th>Invoice ID</th>
                              <th>Payment ID</th>
                              <th>Settled Amount</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {settlements.map((settlement, index) => (
                              <tr key={index} style={{ animation: `fadeInRow 0.3s ease ${index * 0.05}s both` }}>
                                <td>{index + 1}</td>
                                <td>{settlement.invoice_id || '-'}</td>
                                <td>{settlement.payment_id}</td>
                                <td className="text-success fw-bold">{settlement.settled_amount?.toLocaleString()}</td>
                                <td>{settlement.created_date ? formatDate(settlement.created_date) : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowSettlementsModal(false)}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
    </main>



    );
    
}
const Table = ({
  data,
  page,
  limit,
  totalItems,
  totalPages,
  loading,
  onViewSettlements,
  onPageChange,
  onLimitChange,
}) => {
  return(
    <div className="row">
        

        <div className="col-lg-12">

          

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Payment</h5>
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <div>
                  Showing {data.length} of {totalItems} records
                </div>
                <div className="d-flex align-items-center gap-2">
                  <label htmlFor="pageLimit" className="mb-0">Rows</label>
                  <select
                    id="pageLimit"
                    className="form-select form-select-sm"
                    style={{ width: "90px" }}
                    value={limit}
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                  >
                    {[10, 25, 50, 100].map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>
              {loading && (
                <div className="alert alert-info py-2" role="alert">
                  Loading payments...
                </div>
              )}
              <div className="table-responsive">
              <table className="table table-bordered">
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
                    <th scope="col" style={{textAlign:'center'}}>Action</th>
                    {/* <th scope="col">Opening</th>
                    <th scope="col">Debit</th>
                    <th scope="col">Credit</th>
                    <th scope="col">Closing</th>
                    <th scope="col">Description</th> */}
                    {/* <th scope="col">Action</th> */}
                    {/* <th scope="col" style={{textAlign:'center'}}>Action</th> */}
                  </tr>
                </thead>
                <tbody>
                    {
                    data.map((item,index)=>
                    <tr key={index}>
                    <th scope="row">{(page - 1) * limit + index + 1}</th>
                    <td>{formatDate(item.date)}</td>
                    <td>{item.oil_type}</td>
                    <td>{item.Merchant?.name}</td>
                    <td>{item.description}</td>
                    <td>{item.amount}</td>
                    <td>{item.settled_amount}</td>
                    <td>{item.unsettled_amount}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => onViewSettlements(item.id)}
                      >
                        <i className="fas fa-eye me-1"></i>
                        View
                      </button>
                    </td>
                  </tr>
                    )}
                  {(!loading && data.length === 0) && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center" }}>No data found</td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  Page {page} of {Math.max(totalPages, 1)}
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page <= 1 || loading}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages || loading}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </div>
  )
};

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`; // Example format: YYYY-MM-DD
}
export default PaymentList;