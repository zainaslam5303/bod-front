import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config";
import api from "../api";

function KhalliPaymentList() {
  const [payments, setPayments] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState("");
  const [selectedOilType, setSelectedOilType] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, totalItems: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  const fetchMerchants = async () => {
    const response = await api.get(`${API_BASE_URL}/merchants`);
    if (response.data.success) setMerchants(response.data.merchants || []);
  };

  const fetchPayments = async (overrides = {}) => {
    setLoading(true);
    try {
      const params = {
        page: overrides.page ?? page,
        limit: overrides.limit ?? limit,
        search: overrides.search ?? search,
      };
      if (overrides.merchantId ?? selectedMerchant) params.merchantId = overrides.merchantId ?? selectedMerchant;
      if (overrides.oilType ?? selectedOilType) params.oilType = overrides.oilType ?? selectedOilType;

      const response = await api.get(`${API_BASE_URL}/khalli-payment`, { params });
      if (response.data.success) {
        setPayments(response.data.payments || []);
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
    const timeout = setTimeout(() => fetchPayments({ page: 1 }), 300);
    return () => clearTimeout(timeout);
  }, [selectedMerchant, search]);

  useEffect(() => {
    fetchPayments();
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
        <div className="col-md-6">
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Khalli Payment List</h5>
            <Link to="/add-khalli-payment" className="btn btn-primary btn-sm">
              Add Khalli Payment
            </Link>
          </div>
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
                    <th>Amount</th>
                    <th>Settled</th>
                    <th>Unsettled</th>
                    <th>Payment Type</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">No Khalli payments</td>
                    </tr>
                  ) : (
                    payments.map((payment, index) => (
                      <tr key={payment.id}>
                        <td>{index + 1}</td>
                        <td>{formatDate(payment.date)}</td>
                        <td>{payment.Merchant?.name || payment.merchant_id}</td>
                        <td>{payment.oil_type}</td>
                        <td>{payment.amount}</td>
                        <td>{payment.settled_amount}</td>
                        <td>{payment.unsettled_amount}</td>
                        <td>{payment.payment_type}</td>
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

export default KhalliPaymentList;
