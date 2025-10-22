import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 10 },
  table: { display: "table", width: "auto", marginTop: 10 },
  row: { flexDirection: "row" },
  cell: { border: 1, padding: 4, flexGrow: 1, textAlign: "center" },
  header: { backgroundColor: "#eee", fontWeight: "bold" },
});

const PdfLedger = ({ data }) => {
  let runningBalance = 0;
  let grouped = [];

  const merchantName = data[0].Merchant?.name || "Unknown Merchant";
  // same grouping logic as table
  data.forEach(item => {
    if (item?.Invoice?.id) {
      grouped.push({ invoice: item, payments: [] });
    } else if (item?.Payment?.invoice_id) {
      const targetGroup = grouped.find(
        g => g.invoice?.invoice_id === item.Payment.invoice_id
      );
      if (targetGroup) targetGroup.payments.push(item);
      else grouped.push({ invoice: null, payments: [item] });
    } else grouped.push({ invoice: item, payments: [] });
  });

  let counter = 0;

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={{ fontSize: 14, textAlign: "center", marginBottom: 10 }}>
          Ledger Report
        </Text>
        <Text>Merchant: {merchantName}</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.row, styles.header]}>
            <Text style={[styles.cell, { width: 25 }]}>#</Text>
            <Text style={[styles.cell, { width: 60 }]}>Date</Text>
            <Text style={[styles.cell, { width: 120 }]}>Description</Text>
            <Text style={[styles.cell, { width: 60 }]}>Opening</Text>
            <Text style={[styles.cell, { width: 50 }]}>Debit</Text>
            <Text style={[styles.cell, { width: 50 }]}>Credit</Text>
            <Text style={[styles.cell, { width: 60 }]}>Closing</Text>
          </View>

          {/* Table Rows */}
          {grouped.flatMap((group, groupIndex) => {
            const rows = [];
            const items = group.invoice ? [group.invoice, ...group.payments] : group.payments;

            items.forEach((item, index) => {
              counter++;
              const debit = parseInt(item.debit) || 0;
              const credit = parseInt(item.credit) || 0;
              const opening = runningBalance;
              const closing = opening + credit - debit;
              runningBalance = closing;

              rows.push(
                <View style={styles.row} key={`${groupIndex}-${index}`}>
                  <Text style={[styles.cell, { width: 25 }]}>{counter}</Text>
                  <Text style={[styles.cell, { width: 60 }]}>
                    {formatDate(item?.Invoice?.date || item?.Payment?.date)}
                  </Text>
                  <Text style={[styles.cell, { width: 120 }]}>{item.description}</Text>
                  <Text style={[styles.cell, { width: 60 }]}>{opening}</Text>
                  <Text style={[styles.cell, { width: 50 }]}>{debit}</Text>
                  <Text style={[styles.cell, { width: 50 }]}>{credit}</Text>
                  <Text style={[styles.cell, { width: 60 }]}>{closing}</Text>
                </View>
              );
            });

            return rows;
          })}
        </View>
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

export default PdfLedger;
