// src/MyDocument.js

import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 20
  },
  heading: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10
  },
  subheading: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10
  },
  vendorName: {
    fontSize: 12,
    textAlign: 'left',
    marginBottom: 10
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    margin: '10px 0'
  },
  tableRow: {
    flexDirection: 'row'
  },
  tableColHeader: {
    width: '8%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    backgroundColor: '#f2f2f2',
    padding: 5
  },
  tableColHeaderDesc: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    backgroundColor: '#f2f2f2',
    padding: 5
  },
  tableColDesc: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    padding: 5
  },
  tableCol: {
    width: '8%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    padding: 5
  },
  tableCellHeader: {
    fontSize: 6,
    fontWeight: 'bold'
  },
  tableCell: {
    fontSize: 5
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2'
  },
  totalCell: {
    fontSize: 5,
    fontWeight: 'bold',
    padding: 3
  }
});

const PdfDocument = ({ data }) => {
  const totalDebit = data.reduce((sum, item) => sum + (parseFloat(item.debit) || 0), 0);
  const totalCredit = data.reduce((sum, item) => sum + (parseFloat(item.credit) || 0), 0);
  let date = new Date().toLocaleDateString("en-GB");
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>BOD</Text>
        <Text style={styles.subheading}>Sarsoo Merchant Ledger</Text>
        <Text style={styles.vendorName}>Merchant Name: {data[0].name}</Text>
        <Text style={styles.vendorName}>Date: {date}</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Date</Text>
            </View>
            <View style={styles.tableColHeaderDesc}>
              <Text style={styles.tableCellHeader}>Description</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Quantity</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Weight</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Rate</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Other Charges</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Total</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Opening</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Debit</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Credit</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Closing</Text>
            </View>
          </View>
          {data.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{formatDate(item.created_date)}</Text>
              </View>
              <View style={styles.tableColDesc}>
                <Text style={styles.tableCell}>{item.description}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.quantity}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.weight}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.rate}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.other_charges}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.total}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.opening}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.debit}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.credit}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.closing}</Text>
              </View>
            </View>
          ))}
          <View style={styles.totalRow}>
            <View style={styles.tableCol}>
              {/* <Text style={styles.totalCell}></Text> */}
            </View>
            <View style={styles.tableColDesc}>
              {/* <Text style={styles.totalCell}></Text> */}
            </View>
            <View style={styles.tableCol}>
              {/* <Text style={styles.totalCell}></Text> */}
            </View>
            <View style={styles.tableCol}>
              {/* <Text style={styles.totalCell}></Text> */}
            </View>
            <View style={styles.tableCol}>
              {/* <Text style={styles.totalCell}></Text> */}
            </View>
            <View style={styles.tableCol}>
              {/* <Text style={styles.totalCell}></Text> */}
            </View>
            <View style={styles.tableCol}>
              {/* <Text style={styles.totalCell}>Total</Text> */}
            </View>
            <View style={styles.tableCol}>
              {/* <Text style={styles.totalCell}></Text> */}
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.totalCell}>{totalDebit.toFixed(2)}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.totalCell}>{totalCredit.toFixed(2)}</Text>
            </View>
            <View style={styles.tableCol}>
              {/* <Text style={styles.totalCell}></Text> */}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`; // Example format: DD-MM-YYYY
}

export default PdfDocument;
