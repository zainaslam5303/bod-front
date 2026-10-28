import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config";
import api from "../api";

function KhalliDealList() {
  const [merchants, setMerchants] = useState([]);
  const [deals, setDeals] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState("");
  const [selectedOilType, setSelectedOilType] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, totalItems: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  const fetchMerchants = async () => {
    const response = await fetch(`${API_BASE_URL}/merchants`, {
      headers: {
        "Content-Type": "application/json",
        authorization: localStorage.getItem("token"),
      },
    });
    const result = await response.json();
    if (result.success) setMerchants(result.merchants || []);
  };

  const fetchDeals = async (overrides = {}) => {
    setLoading(true);
    try {
      const params = {
        page: overrides.page ?? page,
        limit: overrides.limit ?? limit,
        search: overrides.search ?? search,
      };
      if (overrides.merchantId ?? selectedMerchant) params.merchantId = overrides.merchantId ?? selectedMerchant;
      if (overrides.status ?? status) params.status = overrides.status ?? status;
      if (overrides.oilType ?? selectedOilType) params.oilType = overrides.oilType ?? selectedOilType;

      const response = await api.get(`${API_BASE_URL}/khalli-deal`, { params });
      const result = response.data;
      if (result.success) {
        setDeals(result.deals || []);
        setPagination(result.pagination || { page: 1, limit: 25, totalItems: 0, totalPages: 1 });
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
    const timeout = setTimeout(() => {
      fetchDeals({ page: 1 });
    }, 300);
    return () => clearTimeout(timeout);
  }, [selectedMerchant, status, search]);

  useEffect(() => {
    fetchDeals();
  }, [page, limit]);


  return (
    <main id="main" className="main">
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
        <div className="col-md-3">
          <label className="form-label">Status</label>
          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="partially_invoiced">Partially Invoiced</option>
            <option value="invoiced">Invoiced</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Search</label>
          <input
            type="text"
            className="form-control"
            placeholder="Description or oil type"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <Link to="/add-khalli-deal" className="btn btn-primary w-100">
            Add Khalli Deal
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Khalli Deal List</h5>
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
                    <th>Remaining</th>
                    <th>Rate</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center">No deals found</td>
                    </tr>
                  ) : (
                    deals.map((deal, index) => (
                      <tr key={deal.id}>
                        <td>{index + 1}</td>
                        <td>{formatDate(deal.deal_date)}</td>
                        <td>{deal.Merchant?.name || deal.merchant_id}</td>
                        <td>{deal.oil_type || "Khalli"}</td>
                        <td>{deal.bags}</td>
                        <td>{deal.remaining_bags}</td>
                        <td>{deal.rate}</td>
                        <td>{deal.status}</td>
                        <td>
                          {deal.status === "pending" || deal.status === "partially_invoiced" ? (
                            <Link to={`/add-khalli-invoice/${deal.id}`} className="btn btn-sm btn-success">
                              Create Invoice
                            </Link>
                          ) : (
                            <span className="badge bg-secondary">Done</span>
                          )}
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

export default KhalliDealList;
