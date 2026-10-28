import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../config";

function AddKhalliInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [invoiceBags, setInvoiceBags] = useState(0);
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [invoiceDate, setInvoiceDate] = useState("");
  const [previewTotal, setPreviewTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/khalli-deal/${id}`, {
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
        });
        const data = await response.json();
        if (data.success) {
          setDeal(data.deal);
          setInvoiceDate(data.deal.deal_date || new Date().toISOString().slice(0, 10));
          setInvoiceBags(data.deal.remaining_bags || 0);
          setDescription(data.deal.description || "");
        } else {
          alert(data.message || "Unable to load Khalli deal");
        }
      } catch (error) {
        console.error(error);
        alert("Failed to load Khalli deal");
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, [id, token]);

  useEffect(() => {
    if (!deal) return;
    const parsedWeight = parseFloat(weight) || 0;
    const parsedOther = parseFloat(otherCharges) || 0;
    const computed = Math.round((parsedWeight * Number(deal.rate)) / 40 + parsedOther);
    setPreviewTotal(computed);
  }, [weight, otherCharges, deal]);

  const handleSubmit = async () => {
    if (!deal) return;
    setIsSubmitting(true);

    const invoiceBagsValue = Number(invoiceBags);
    const weightValue = Number(weight);
    const otherChargesValue = Number(otherCharges) || 0;

    if (!invoiceBagsValue || invoiceBagsValue <= 0) {
      alert("Please enter invoice bags");
      setIsSubmitting(false);
      return;
    }
    if (invoiceBagsValue > Number(deal.remaining_bags)) {
      alert("Invoice bags cannot exceed remaining bags");
      setIsSubmitting(false);
      return;
    }
    if (!weightValue || weightValue <= 0) {
      alert("Please enter weight");
      setIsSubmitting(false);
      return;
    }
    if (!invoiceDate) {
      alert("Please select invoice date");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/khalli-deal/${id}/generate-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify({
          invoice_bags: invoiceBagsValue,
          weight: weightValue,
          description: description.trim(),
          other_charges: otherChargesValue,
          invoice_date: invoiceDate,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message || "Invoice created successfully");
        navigate("/khalli-invoice-list");
      } else {
        alert(data.message || "Failed to generate invoice");
      }
    } catch (error) {
      console.error(error);
      alert("Unable to generate Khalli invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main id="main" className="main">
        <div className="card">
          <div className="card-body">Loading deal...</div>
        </div>
      </main>
    );
  }

  if (!deal) {
    return (
      <main id="main" className="main">
        <div className="card">
          <div className="card-body">Khalli deal not found.</div>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="main">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Create Khalli Invoice</h5>
          <div className="row g-3">
            <div className="col-6">
              <label className="form-label">Merchant</label>
              <input className="form-control" value={deal.Merchant?.name || deal.merchant_id} readOnly />
            </div>
            <div className="col-6">
              <label className="form-label">Deal Date</label>
              <input className="form-control" value={deal.deal_date} readOnly />
            </div>
            <div className="col-6">
              <label className="form-label">Rate</label>
              <input className="form-control" value={deal.rate} readOnly />
            </div>
            <div className="col-6">
              <label className="form-label">Type</label>
              <input className="form-control" value={deal.oil_type || "Sarso Khalli"} readOnly />
            </div>
            <div className="col-6">
              <label className="form-label">Remaining Bags</label>
              <input className="form-control" value={deal.remaining_bags} readOnly />
            </div>
            <div className="col-6">
              <label className="form-label">Invoice Bags</label>
              <input
                type="number"
                min="1"
                max={deal.remaining_bags}
                className="form-control"
                value={invoiceBags}
                onChange={(e) => setInvoiceBags(e.target.value)}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Weight</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Other Charges</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={otherCharges}
                onChange={(e) => setOtherCharges(e.target.value)}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Invoice Date</label>
              <input
                type="date"
                className="form-control"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Preview Total</label>
              <input className="form-control" value={previewTotal} readOnly />
            </div>
            <div className="text-center">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Invoice"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AddKhalliInvoice;
