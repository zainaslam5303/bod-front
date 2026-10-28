import React, { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import API_BASE_URL from "../config";
import PdfKhalliLedger from "./PdfKhalliLedger";
import KhalliTypeSelect from "./KhalliTypeSelect";

function KhalliLedgerList() {
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState("");
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [oilType, setOilType] = useState("Sarso Khalli");
  const token = localStorage.getItem("token");

  const buildLedgerRows = (items = []) => {
    let runningBalance = 0;
    const rows = [];

    const sortedItems = [...items].sort((a, b) => new Date(a.deal_date) - new Date(b.deal_date));

    sortedItems.forEach((deal) => {
      const dealOpening = runningBalance;
      rows.push({
        type: "deal",
        date: deal.deal_date,
        description: deal.description || `Deal #${deal.id}`,
        opening: dealOpening,
        debit: 0,
        credit: 0,
        closing: dealOpening,
      });

      const invoices = deal.invoices || (deal.invoice ? [deal.invoice] : []);
      invoices.forEach((invoice) => {
        const invoiceOpening = runningBalance;
        const invoiceDebit = Number(invoice.total_amount || 0);
        const invoiceClosing = invoiceOpening + invoiceDebit;
        rows.push({
          type: "invoice",
          date: invoice.date,
          description: invoice.description || `Invoice #${invoice.id}`,
          opening: invoiceOpening,
          debit: invoiceDebit,
          credit: 0,
          closing: invoiceClosing,
        });
        runningBalance = invoiceClosing;

        const payments = invoice.Payments || (deal.payments || []).filter((payment) => payment.invoice_id === invoice.id);
        payments.forEach((payment) => {
          const paymentOpening = runningBalance;
          const paymentCredit = Number(payment.amount || 0);
          const paymentClosing = paymentOpening - paymentCredit;
          rows.push({
            type: "payment",
            date: payment.date,
            description: payment.description || `Payment #${payment.id}`,
            opening: paymentOpening,
            debit: 0,
            credit: paymentCredit,
            closing: paymentClosing,
          });
          runningBalance = paymentClosing;
        });
      });
    });

    return { rows, finalClosing: runningBalance };
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

  const loadLedger = async () => {
    if (!selectedMerchant) {
      alert("Please select a merchant");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/khalli-ledger?merchantId=${selectedMerchant}&oilType=${oilType}`,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setDeals(result.deals || []);
      } else {
        alert(result.message || "Failed to load Khalli ledger");
      }
    } catch (err) {
      console.error(err);
      alert("Unable to load Khalli ledger");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!selectedMerchant) {
      alert("Please select a merchant before generating PDF");
      return;
    }
    if (!deals.length) {
      alert("No ledger data to export");
      return;
    }
    try {
      const doc = <PdfKhalliLedger data={deals} />;
      const asPdf = pdf([]);
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();
      const merchantName = deals[0]?.Merchant?.name || selectedMerchant;
      const date = new Date().toISOString().slice(0, 10);
      saveAs(blob, `Khalli_Ledger_${merchantName}_${date}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF");
    }
  };

  return (
    <main id="main" className="main">
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <label className="form-label">Merchant</label>
          <select
            className="form-select"
            value={selectedMerchant}
            onChange={(e) => setSelectedMerchant(e.target.value)}
          >
            <option value="">Choose Merchant</option>
            {merchants.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <KhalliTypeSelect value={oilType} onChange={setOilType} />
        </div>
        <div className="col-md-2 align-self-end">
          <button className="btn btn-primary w-100" onClick={loadLedger} disabled={loading}>
            {loading ? "Loading..." : "Load Ledger"}
          </button>
        </div>
        <div className="col-md-3 align-self-end text-end">
          <button className="btn btn-success w-100" onClick={downloadPDF}>
            Download PDF
          </button>
        </div>
      </div>

      {deals.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            {loading ? "Loading deals..." : "No Khalli deals found. Search to view ledger details."}
          </div>
        </div>
      ) : (() => {
        const ledgerData = buildLedgerRows(deals);
        return (
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-bordered mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Opening</th>
                      <th>Debit</th>
                      <th>Credit</th>
                      <th>Closing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerData.rows.map((row, index) => (
                      <tr
                        key={`${row.type}-${row.date || index}-${row.description || index}`}
                        className={row.type === "deal" ? "table-dark text-white" : ""}
                      >
                        <td>{row.type}</td>
                        <td>{formatDate(row.date)}</td>
                        <td>{row.description || "—"}</td>
                        <td>{row.opening}</td>
                        <td>{row.debit}</td>
                        <td>{row.credit}</td>
                        <td>{row.closing}</td>
                      </tr>
                    ))}
                    <tr className="table-secondary fw-bold">
                      <td colSpan="6" className="text-end">Final Closing Balance</td>
                      <td>{ledgerData.finalClosing}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

export default KhalliLedgerList;
