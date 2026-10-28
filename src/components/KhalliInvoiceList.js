import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import api from "../api";

function KhalliInvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState("");
  const [selectedOilType, setSelectedOilType] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, totalItems: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);

  const openEditForm = (invoice) => {
    setEditInvoice({
      id: invoice.id,
      merchant_id: invoice.merchant_id,
      bags: invoice.bags ?? 0,
      description: invoice.description || "",
      oil_type: invoice.oil_type || "Sarso Khalli",
      rate: invoice.rate ?? 0,
      weight: invoice.weight ?? 0,
      other_charges: invoice.other_charges ?? 0,
      date: invoice.date ? String(invoice.date).slice(0, 10) : "",
    });
  };

  const handleEditChange = (field, value) => {
    setEditInvoice((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateInvoice = async () => {
    if (!editInvoice) return;
    try {
      const payload = {
        merchant_id: Number(editInvoice.merchant_id),
        bags: Number(editInvoice.bags || 0),
        description: editInvoice.description,
        oil_type: editInvoice.oil_type,
        rate: Number(editInvoice.rate || 0),
        weight: Number(editInvoice.weight || 0),
        other_charges: Number(editInvoice.other_charges || 0),
        date: editInvoice.date,
      };

      const response = await api.put(`${API_BASE_URL}/khalli-invoice/${editInvoice.id}`, payload);
      const result = response.data;
      if (result.success) {
        alert("Khalli invoice updated successfully");
        setEditInvoice(null);
        fetchInvoices();
      } else {
        alert(result.message || "Failed to update Khalli invoice");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong while updating Khalli invoice");
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm("Are you sure you want to delete this Khalli invoice?")) return;
    try {
      const response = await api.delete(`${API_BASE_URL}/khalli-invoice/${invoiceId}`);
      const result = response.data;
      if (result.success) {
        alert("Khalli invoice deleted successfully");
        fetchInvoices();
      } else {
        alert(result.message || "Failed to delete Khalli invoice");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong while deleting Khalli invoice");
    }
  };

  const fetchMerchants = async () => {
    const response = await api.get(`${API_BASE_URL}/merchants`);
    if (response.data.success) setMerchants(response.data.merchants || []);
  };

  const fetchInvoices = async (overrides = {}) => {
    setLoading(true);
    try {
      const params = {
        page: overrides.page ?? page,
        limit: overrides.limit ?? limit,
        search: overrides.search ?? search,
      };
      if (overrides.merchantId ?? selectedMerchant) params.merchantId = overrides.merchantId ?? selectedMerchant;
      if (overrides.oilType ?? selectedOilType) params.oilType = overrides.oilType ?? selectedOilType;

      const response = await api.get(`${API_BASE_URL}/khalli-invoice`, { params });
      if (response.data.success) {
        setInvoices(response.data.invoices || []);
        setPagination(response.data.pagination || pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchInvoices({ page: 1 }), 300);
    return () => clearTimeout(timeout);
  }, [selectedMerchant, search]);

  useEffect(() => {
    fetchInvoices();
  }, [page, limit]);

  return (
    <main id="main" className="main">
      {editInvoice && (
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Edit Khalli Invoice</h5>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={editInvoice.date}
                  onChange={(e) => handleEditChange("date", e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Bags</label>
                <input
                  type="number"
                  className="form-control"
                  value={editInvoice.bags}
                  onChange={(e) => handleEditChange("bags", e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Rate</label>
                <input
                  type="number"
                  className="form-control"
                  value={editInvoice.rate}
                  onChange={(e) => handleEditChange("rate", e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Weight</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={editInvoice.weight}
                  onChange={(e) => handleEditChange("weight", e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Other Charges</label>
                <input
                  type="number"
                  className="form-control"
                  value={editInvoice.other_charges}
                  onChange={(e) => handleEditChange("other_charges", e.target.value)}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={editInvoice.description}
                  onChange={(e) => handleEditChange("description", e.target.value)}
                />
              </div>
              <div className="col-12 text-end">
                <button type="button" className="btn btn-secondary me-2" onClick={() => setEditInvoice(null)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleUpdateInvoice}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label className="form-label">Merchant</label>
          <select className="form-select" value={selectedMerchant} onChange={(e) => setSelectedMerchant(e.target.value)}>
            <option value="">All Merchants</option>
            {merchants.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Type</label>
          <select className="form-select" value={selectedOilType} onChange={(e) => setSelectedOilType(e.target.value)}>
            <option value="">All Types</option>
            <option value="Sarso Khalli">Sarso Khalli</option>
            <option value="Tilli Khalli">Tilli Khalli</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Search</label>
          <input
            type="text"
            className="form-control"
            placeholder="Description or oil type"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Khalli Invoice List</h5>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Merchant</th>
                    <th>Type</th>
                    <th>Bags</th>
                    <th>Rate</th>
                    <th>Weight</th>
                    <th>Description</th>
                    <th>Total</th>
                    <th>Settled</th>
                    <th>Unsettled</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="text-center">No Khalli invoices</td>
                    </tr>
                  ) : (
                    invoices.map((invoice, index) => (
                      <tr key={invoice.id}>
                        <td>{index + 1}</td>
                        <td>{formatDate(invoice.date)}</td>
                        <td>{invoice.Merchant?.name || invoice.merchant_id}</td>
                        <td>{invoice.oil_type}</td>
                        <td>{invoice.bags ?? 0}</td>
                        <td>{invoice.rate}</td>
                        <td>{invoice.weight}</td>
                        <td>{invoice.description || "-"}</td>
                        <td>{invoice.total_amount}</td>
                        <td>{invoice.settled_amount}</td>
                        <td>{invoice.unsettled_amount}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button type="button" className="btn btn-sm btn-warning" onClick={() => openEditForm(invoice)}>Edit</button>
                            <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDeleteInvoice(invoice.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

export default KhalliInvoiceList;
