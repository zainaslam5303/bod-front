import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

// Styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  shopHeader: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
    textDecoration: "underline",
  },
  sectionTitle: {
    fontSize: 12,
    marginTop: 15,
    marginBottom: 5,
    textDecoration: "underline",
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #ccc",
  },
  tableHeader: {
    fontWeight: "bold",
    backgroundColor: "#f2f2f2",
  },
  cell: {
    flex: 1,
    padding: 4,
  },
  totalRow: {
    fontWeight: "bold",
    backgroundColor: "#f9f9f9",
  },
  grandTotal: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 10,
    borderTop: "1pt solid #000",
    paddingTop: 4,
  },
});

const Pdfdocument = ({ data }) => {
  if (!data || data.length === 0) return null;

  const merchantName = data[0].Merchant?.name || "Unknown Merchant";
  const currentDate = new Date().toLocaleDateString("en-GB");

  // Group by oil_type
  const grouped = data.reduce((acc, item) => {
    if (!acc[item.oil_type]) acc[item.oil_type] = [];
    acc[item.oil_type].push(item);
    return acc;
  }, {});

  // Calculate total across all invoices
  const grandTotal = data.reduce(
    (sum, inv) => sum + inv.unsettled_amount,
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ✅ Shop name at top */}
        <Text style={styles.shopHeader}>BOD</Text>

        <Text style={styles.title}>Merchant Invoice Summary</Text>

        <Text>Merchant: {merchantName}</Text>
        <Text>Date: {currentDate}</Text>

        {Object.keys(grouped).map((oilType) => {
          const invoices = grouped[oilType];
          const totalAmount = invoices.reduce(
            (sum, inv) => sum + inv.unsettled_amount,
            0
          );

          return (
            <View key={oilType}>
              <Text style={styles.sectionTitle}>{oilType} Invoices</Text>

              {/* Table Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.cell, { flex: 0.3 }]}>#</Text>
                <Text style={[styles.cell, { flex: 1.5 }]}>Description</Text>
                <Text style={[styles.cell, { flex: 0.5 }]}>Rate</Text>
                <Text style={[styles.cell, { flex: 0.5 }]}>Weight</Text>
                <Text style={[styles.cell, { flex: 0.7 }]}>Other Charges</Text>
                <Text style={[styles.cell, { flex: 0.8 }]}>Remaining Amount</Text>
                <Text style={[styles.cell, { flex: 0.8 }]}>Date</Text>
              </View>

              {/* Table Rows */}
              {invoices.map((inv, index) => (
                <View key={inv.id} style={styles.tableRow}>
                  <Text style={[styles.cell, { flex: 0.3 }]}>{index + 1}</Text>
                  <Text style={[styles.cell, { flex: 1.5 }]}>{inv.description}</Text>
                  <Text style={[styles.cell, { flex: 0.5 }]}>{inv.rate}</Text>
                  <Text style={[styles.cell, { flex: 0.5 }]}>{inv.weight}</Text>
                  <Text style={[styles.cell, { flex: 0.7 }]}>{inv.other_charges}</Text>
                  <Text style={[styles.cell, { flex: 0.8 }]}>
                    {inv.unsettled_amount.toLocaleString()}
                  </Text>
                  <Text style={[styles.cell, { flex: 0.8 }]}>{formatDate(inv.date)}</Text>
                </View>
              ))}

              {/* Total per oil type */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={[styles.cell, { flex: 3.5 }]}>Subtotal ({oilType})</Text>
                <Text style={[styles.cell, { flex: 0.8 }]}>
                  {totalAmount.toLocaleString()}
                </Text>
                <Text style={[styles.cell, { flex: 0.8 }]}></Text>
              </View>
            </View>
          );
        })}

        {/* ✅ Final grand total */}
        <Text style={styles.grandTotal}>
          Grand Total: {grandTotal.toLocaleString()}
        </Text>

        <Text
          style={{
            marginTop: 15,
            fontSize: 9,
            textAlign: "center",
            color: "#555",
          }}
        >
          Generated on {currentDate}
        </Text>
      </Page>
    </Document>
  );
};
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${date.getFullYear()}`;
}
export default Pdfdocument;
