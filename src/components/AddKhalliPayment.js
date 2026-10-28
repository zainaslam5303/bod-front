import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import API_BASE_URL from "../config";
import api from "../api";
import KhalliTypeSelect from "./KhalliTypeSelect";

function AddKhalliPayment() {
  const navigate = useNavigate();
  const [merchants, setMerchants] = useState([]);
  const [merchant_id, setMerchantId] = useState(0);
  const [payment_type, setPaymentType] = useState("general");
  const [invoice_id, setInvoiceId] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("Received By Cash");
  const [date, setDate] = useState("");
  const [oil_type, setOilType] = useState("Sarso Khalli");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMerchants = async () => {
      const response = await api.get(`${API_BASE_URL}/merchants`);
      if (response.data.success) setMerchants(response.data.merchants || []);
    };
    fetchMerchants();
  }, []);

  const loadInvoices = async (merchantId, oilTypeValue = oil_type) => {
    try {
      const response = await api.get(`${API_BASE_URL}/khalli-invoice`, {
        params: {
          merchantId,
          oilType: oilTypeValue,
          settleCheck: 1,
          search: "",
          page: 1,
          limit: 100,
        },
      });
      if (response.data.success) {
        const unsettledInvoices = (response.data.invoices || []).filter(
          (invoice) => Number(invoice.unsettled_amount || 0) > 0
        );
        setInvoices(unsettledInvoices);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMerchantChange = (selected) => {
    const merchantId = selected?.value || 0;
    setMerchantId(merchantId);
    if (merchantId) loadInvoices(merchantId, oil_type);
  };

  const handleOilTypeChange = (value) => {
    setOilType(value);
    if (merchant_id) loadInvoices(merchant_id, value);
  };

  const handlePaymentTypeChange = (e) => {
    const value = e.target.value;
    setPaymentType(value);
    if (value !== "invoice") {
      setInvoiceId(0);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (!merchant_id) {
      alert("Please select merchant");
      setIsSubmitting(false);
      return;
    }
    if (!amount || amount <= 0) {
      alert("Please enter amount");
      setIsSubmitting(false);
      return;
    }
    if (!date) {
      alert("Please select date");
      setIsSubmitting(false);
      return;
    }
    if (payment_type === "invoice" && !invoice_id) {
      alert("Please select an invoice");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/khalli-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify({
          merchant_id,
          oil_type,
          amount,
          description,
          payment_type,
          invoice_id: payment_type === "invoice" ? invoice_id : null,
          date,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        navigate("/khalli-payment-list");
      } else {
        alert(data.message || "Failed to save payment");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const merchantOptions = merchants.map((item) => ({ value: item.id, label: item.name }));

  return (
    <main id="main" className="main">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Add Khalli Payment</h5>
          <div className="row g-3">
            <div className="col-6">
              <label className="form-label">Merchant</label>
              <Select
                options={merchantOptions}
                placeholder="Choose Merchant..."
                onChange={handleMerchantChange}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Payment Type</label>
              <select className="form-select" value={payment_type} onChange={handlePaymentTypeChange}>
                <option value="general">General</option>
                <option value="invoice">Invoice</option>
              </select>
            </div>
            {payment_type === "invoice" && (
              <div className="col-6">
                <label className="form-label">Khalli Invoice</label>
                <select
                  className="form-select"
                  value={invoice_id}
                  onChange={(e) => {
                    const selectedInvoiceId = e.target.value;
                    setInvoiceId(selectedInvoiceId);

                    const selectedInvoice = invoices.find(
                      (invoice) => Number(invoice.id) === Number(selectedInvoiceId)
                    );

                    if (selectedInvoice) {
                      setAmount(selectedInvoice.unsettled_amount);
                    } else {
                      setAmount(0);
                    }
                  }}
                >
                  <option value={0}>Choose...</option>
                  {invoices.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.date} - {invoice.oil_type} - {invoice.description} ({invoice.unsettled_amount})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-6">
              <label className="form-label">Amount</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="col-6">
              <KhalliTypeSelect value={oil_type} onChange={handleOilTypeChange} />
            </div>
            <div className="col-6" />
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="text-center">
              <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AddKhalliPayment;
