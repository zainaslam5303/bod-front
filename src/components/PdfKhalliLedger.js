import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 18, fontSize: 8, lineHeight: 1.4 },
  title: { fontSize: 16, textAlign: "center", marginBottom: 12, fontWeight: "bold" },
  subtitle: { fontSize: 10, marginBottom: 10 },
  table: { width: "100%", borderWidth: 1, borderColor: "#d0d0d0", marginBottom: 10 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f0f0f0", borderBottomWidth: 1, borderColor: "#d0d0d0" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#d0d0d0" },
  tableCell: { padding: 4, borderRightWidth: 1, borderColor: "#d0d0d0", textAlign: "center" },
  tableCellLast: { borderRightWidth: 0 },
  dealRow: { backgroundColor: "#000000" },
  dealText: { color: "#ffffff", fontWeight: "bold" },
  totalRow: { backgroundColor: "#f2f2f2", fontWeight: "bold" },
});

const PdfKhalliLedger = ({ data }) => {
  const merchantName = data[0]?.Merchant?.name || "Merchant";

  const buildRows = (items = []) => {
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

  const ledgerData = buildRows(data);

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Khalli Ledger Report</Text>
        <Text style={styles.subtitle}>Merchant: {merchantName}</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { width: "14.28%" }]}>Type</Text>
            <Text style={[styles.tableCell, { width: "14.28%" }]}>Date</Text>
            <Text style={[styles.tableCell, { width: "21.42%" }]}>Description</Text>
            <Text style={[styles.tableCell, { width: "14.28%" }]}>Opening</Text>
            <Text style={[styles.tableCell, { width: "14.28%" }]}>Debit</Text>
            <Text style={[styles.tableCell, { width: "14.28%" }]}>Credit</Text>
            <Text style={[styles.tableCell, styles.tableCellLast, { width: "14.28%" }]}>Closing</Text>
          </View>

          {ledgerData.rows.map((row, index) => (
            <View key={`${row.type}-${row.date || index}-${row.description || index}`} style={[styles.tableRow, row.type === "deal" ? styles.dealRow : null]}>
              <Text style={[styles.tableCell, { width: "14.28%" }, row.type === "deal" ? styles.dealText : null]}>{row.type}</Text>
              <Text style={[styles.tableCell, { width: "14.28%" }, row.type === "deal" ? styles.dealText : null]}>{formatDate(row.date)}</Text>
              <Text style={[styles.tableCell, { width: "21.42%" }, row.type === "deal" ? styles.dealText : null]}>{row.description || "—"}</Text>
              <Text style={[styles.tableCell, { width: "14.28%" }, row.type === "deal" ? styles.dealText : null]}>{row.opening}</Text>
              <Text style={[styles.tableCell, { width: "14.28%" }, row.type === "deal" ? styles.dealText : null]}>{row.debit}</Text>
              <Text style={[styles.tableCell, { width: "14.28%" }, row.type === "deal" ? styles.dealText : null]}>{row.credit}</Text>
              <Text style={[styles.tableCell, styles.tableCellLast, { width: "14.28%" }, row.type === "deal" ? styles.dealText : null]}>{row.closing}</Text>
            </View>
          ))}

          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.tableCell, { width: "71.42%" }]}>Final Closing Balance</Text>
            <Text style={[styles.tableCell, { width: "14.28%" }]}></Text>
            <Text style={[styles.tableCell, { width: "14.28%" }]}>{ledgerData.finalClosing}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

export default PdfKhalliLedger;
