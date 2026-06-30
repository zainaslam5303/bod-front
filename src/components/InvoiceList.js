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
    const[invoiceData,setInvoiceData] = useState([]);
    const[type, setType] = useState('');
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [pagination, setPagination] = useState({ page: 1, limit: 25, totalItems: 0, totalPages: 1 });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editInvoice, setEditInvoice] = useState(null);
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
    const getInvoiceData = async (overrides = {}) => {
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

        const data = await api.get(`${API_BASE_URL}/invoice`, { params });
        const result = data.data;
        if (result.success) {
          setInvoiceData(result.invoices || []);
          if (result.pagination) {
            setPagination(result.pagination);
          }
          setShowTable(true);
        } else {
          setInvoiceData([]);
          setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 1 }));
        }
      } finally {
        setLoading(false);
      }
    };
    useEffect(()=>{
        getMerchants();
    },[]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      const timeout = setTimeout(() => {
        getInvoiceData();
      }, 350);

      return () => clearTimeout(timeout);
    }, [page, limit, search, selectedMerchant, type]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleBalance = async() =>{
      setPage(1);
      await getInvoiceData({ page: 1 });
    };
    const handleDelete = async (invoiceId) => {
      if (!window.confirm("Are you sure you want to delete this invoice?")) return;
      try {
        const response = await api.delete(`${API_BASE_URL}/invoice/${invoiceId}`);
        const result = response.data;
        if (result.success) {
          alert("Invoice deleted successfully");
          if (invoiceData.length === 1 && page > 1) {
            setPage((prev) => Math.max(1, prev - 1));
          } else {
            getInvoiceData();
          }
        } else {
          alert(result.message || "Failed to delete invoice");
        }
      } catch (error) {
        console.error("Delete invoice error:", error);
        alert("Something went wrong while deleting invoice");
      }
    };

    const handleViewSettlements = async (invoiceId) => {
      try {
        setLoadingSettlements(true);
        const response = await api.get(`${API_BASE_URL}/invoice/${invoiceId}/settlements`);
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

    const openEditForm = (item) => {
      setEditInvoice({
        id: item.id,
        merchant_id: item.merchant_id,
        oil_type: item.oil_type || "",
        date: item.date ? String(item.date).slice(0, 10) : "",
        description: item.description || "",
        weight: item.weight ?? 0,
        rate: item.rate ?? 0,
        other_charges: item.other_charges ?? 0,
        settled_amount: Number(item.settled_amount || 0),
      });
    };

    const handleEditChange = (field, value) => {
      setEditInvoice((prev) => ({ ...prev, [field]: value }));
    };

    const handleUpdateInvoice = async () => {
      if (!editInvoice) return;
      try {
        setSaving(true);
        const payload = {
          merchant_id: Number(editInvoice.merchant_id),
          oil_type: editInvoice.oil_type,
          date: editInvoice.date,
          description: editInvoice.description,
          other_charges: Number(editInvoice.other_charges || 0),
          weight: Number(editInvoice.weight || 0),
          rate: Number(editInvoice.rate || 0),
        };
        const response = await api.put(`${API_BASE_URL}/invoice/${editInvoice.id}`, payload);
        const result = response.data;
        if (result.success) {
          alert("Invoice updated successfully");
          setEditInvoice(null);
          getInvoiceData();
        } else {
          alert(result.message || "Failed to update invoice");
        }
      } catch (error) {
        console.error("Update invoice error:", error);
        alert("Something went wrong while updating invoice");
      } finally {
        setSaving(false);
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
        <div className="row g-3">
        <div className="col-md-3">
          <label htmlFor="invoiceMerchant" className="form-label">Merchant Name</label>
          <select
            id="invoiceMerchant"
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
          <label htmlFor="invoiceType" className="form-label">Type</label>
          <select
            id="invoiceType"
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
          <label htmlFor="invoiceSearch" className="form-label">Search</label>
          <input
            id="invoiceSearch"
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
          <Link to="/add-invoice" type="button" className="btn btn-secondary rounded-pill">Add Entry</Link>
          {/* <button onClick={fetchAndGeneratePDF} type="button" className="btn btn-primary rounded-pill" style={{marginLeft:'2px'}}>Generate Pdf</button> */}

        </div>
        
        </div>
        <br />
        {editInvoice && (
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Edit Invoice #{editInvoice.id}</h5>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Merchant</label>
                  <select
                    className="form-select"
                    value={editInvoice.merchant_id}
                    onChange={(e) => handleEditChange("merchant_id", e.target.value)}
                  >
                    <option value="">Select Merchant</option>
                    {merchants.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={editInvoice.oil_type}
                    onChange={(e) => handleEditChange("oil_type", e.target.value)}
                  >
                    <option value="Sarso">Sarso</option>
                    <option value="Pakwan">Pakwan</option>
                    <option value="Tilli">Tilli</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={editInvoice.date}
                    onChange={(e) => handleEditChange("date", e.target.value)}
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editInvoice.description}
                    onChange={(e) => handleEditChange("description", e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Weight</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editInvoice.weight}
                    disabled={editInvoice.settled_amount !== 0}
                    onChange={(e) => handleEditChange("weight", e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Rate</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editInvoice.rate}
                    disabled={editInvoice.settled_amount !== 0}
                    onChange={(e) => handleEditChange("rate", e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Other Charges</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editInvoice.other_charges}
                    onChange={(e) => handleEditChange("other_charges", e.target.value)}
                  />
                </div>
                <div className="col-md-6 d-flex align-items-end">
                  <small className="text-muted">
                    Weight/rate editable only when settled amount is zero.
                  </small>
                </div>
              </div>
              <div className="mt-3 d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleUpdateInvoice}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditInvoice(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {showTable && (
          <Table
            data={invoiceData}
            page={pagination.page || page}
            limit={pagination.limit || limit}
            totalItems={pagination.totalItems || 0}
            totalPages={pagination.totalPages || 1}
            loading={loading}
            onEdit={openEditForm}
            onDelete={handleDelete}
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
                    <h5 className="modal-title">Invoice Settlements</h5>
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
                                <td>{settlement.invoice_id}</td>
                                <td>{settlement.payment_id || '-'}</td>
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
  onEdit,
  onDelete,
  onViewSettlements,
  onPageChange,
  onLimitChange,
}) => {
  return(
    <div className="row">
        

        <div className="col-lg-12">

          

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Invoice</h5>
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
                  Loading invoices...
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
                    <th scope="col" style={{textAlign:'center'}}>Weight</th>
                    <th scope="col" style={{textAlign:'center'}}>Rate</th>
                    <th scope="col" style={{textAlign:'center'}}>Other Charges</th>
                    <th scope="col" style={{textAlign:'center'}}>Total</th>
                    <th scope="col" style={{textAlign:'center'}}>Settled Amount</th>
                    <th scope="col" style={{textAlign:'center'}}>Unsettled Amount</th>
                    <th scope="col" style={{textAlign:'center'}}>Action</th>
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
                    <td style={{textAlign:'center'}}>{item.weight}</td>
                    <td style={{textAlign:'center'}}>{item.rate}</td>
                    <td style={{textAlign:'center'}}>{item.other_charges}</td>
                    <td style={{textAlign:'center'}}>{item.total_amount}</td>
                    <td style={{textAlign:'center'}}>{item.settled_amount}</td>
                    <td style={{textAlign:'center'}}>{item.unsettled_amount}</td>
                    <td style={{textAlign:'center'}}>
                      <div className="btn-group" role="group">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => onViewSettlements(item.id)}
                        >
                          <i className="fas fa-eye me-1"></i>
                          View
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-success btn-sm"
                          onClick={() => onEdit(item)}
                        >
                          <i className="fas fa-pen me-1"></i>
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => onDelete(item.id)}
                        >
                          <i className="fas fa-trash me-1"></i>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                    )}
                  {(!loading && data.length === 0) && (
                    <tr>
                      <td colSpan="12" style={{ textAlign: "center" }}>No data found</td>
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