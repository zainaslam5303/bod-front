import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import API_BASE_URL from "../config";
import KhalliTypeSelect from "./KhalliTypeSelect";

function AddKhalliDeal() {
  const navigate = useNavigate();
  const [merchants, setMerchants] = useState([]);
  const [merchant_id, setMerchantId] = useState(0);
  const [oil_type, setOilType] = useState("Sarso Khalli");
  const [bags, setBags] = useState(0);
  const [rate, setRate] = useState(0);
  const [description, setDescription] = useState("");
  const [deal_date, setDealDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (!merchant_id || merchant_id === 0) {
      alert("Please select merchant");
      setIsSubmitting(false);
      return;
    }
    if (!bags || bags <= 0) {
      alert("Please enter bags");
      setIsSubmitting(false);
      return;
    }
    if (!rate || rate <= 0) {
      alert("Please enter rate");
      setIsSubmitting(false);
      return;
    }
    if (!deal_date) {
      alert("Please select deal date");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/khalli-deal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify({
          merchant_id,
          oil_type,
          bags,
          rate,
          description,
          deal_date,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        alert(data.message || "Unable to save Khalli deal");
        setIsSubmitting(false);
        return;
      }
      alert("Khalli deal created successfully");
      navigate("/khalli-deal-list");
    } catch (error) {
      console.error(error);
      alert("Failed to create Khalli deal");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchMerchants = async () => {
      const response = await fetch(`${API_BASE_URL}/merchants`, {
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      });
      const result = await response.json();
      if (result.success) setMerchants(result.merchants || []);
    };
    fetchMerchants();
  }, [token]);

  const merchantOptions = merchants.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  return (
    <main id="main" className="main">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Add Khalli Deal</h5>
          <div className="row g-3">
            <div className="col-6">
              <label className="form-label">Merchant</label>
              <Select
                options={merchantOptions}
                placeholder="Choose Merchant..."
                onChange={(selected) => setMerchantId(selected?.value || 0)}
              />
            </div>
            <div className="col-6">
              <KhalliTypeSelect value={oil_type} onChange={setOilType} />
            </div>
            <div className="col-6">
              <label className="form-label">Deal Date</label>
              <input
                type="date"
                className="form-control"
                value={deal_date}
                onChange={(e) => setDealDate(e.target.value)}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Bags</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={bags}
                onChange={(e) => setBags(e.target.value)}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Rate</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="text-center">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AddKhalliDeal;
