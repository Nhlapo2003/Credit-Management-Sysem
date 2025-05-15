<template>
    <div class="payment-history">
      <h2>All Payment History</h2>
  
      <!-- Search and Filter -->
      <div class="search-section">
        <input v-model="searchEmail" placeholder="Search by customer email..." />
      </div>
  
      <!-- Payment Table -->
      <table v-if="filteredPayments.length">
        <thead>
          <tr>
            <th>Customer Email</th>
            <th>Amount Paid</th>
            <th>Payment Method</th>
            <th>Late Fee</th>
            <th>Interest</th>
            <th>Total Amount</th>
            <th>Payment Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in filteredPayments" :key="payment._id">
            <td>{{ payment.customerEmail }}</td>
            <td>{{ payment.amountPaid }}</td>
            <td>{{ payment.paymentMethod }}</td>
            <td>{{ payment.lateFee }}</td>
            <td>{{ payment.interest }}</td>
            <td>{{ payment.totalAmount }}</td>
            <td>{{ formatDate(payment.paymentDate) }}</td>
            <td>
              <button @click="viewPayment(payment)">View</button>
              <button @click="deletePayment(payment._id)" class="delete">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- Total Calculation -->
      <div v-if="filteredPayments.length" class="total-section">
        <h3>Total Calculation:</h3>
        <p><strong>Total Amount Paid:</strong> {{ totalPaid }}</p>
        <p><strong>Total Amount (with Interest):</strong> {{ totalAmount }}</p>
        <p><strong>Total Profit (Interest Earned):</strong> {{ totalProfit }}</p>
        
        <!-- Export Buttons -->
        <button @click="exportToPDF">Export to PDF</button>
        <button @click="exportToExcel">Export to Excel</button>
      </div>
  
      <p v-else>No payment history available.</p>
    </div>
  </template>
  <script>
  import axios from "axios";
  import jsPDF from "jspdf";
  import autoTable from "jspdf-autotable";
  import * as XLSX from "xlsx";
  
  export default {
    data() {
      return {
        payments: [],
        searchEmail: '',
      };
    },
    computed: {
      filteredPayments() {
        if (this.searchEmail.trim() === '') {
          return this.payments;
        }
        return this.payments.filter(payment =>
          payment.customerEmail.toLowerCase().includes(this.searchEmail.toLowerCase())
        );
      },
      totalPaid() {
        return this.filteredPayments.reduce((sum, payment) => sum + payment.amountPaid, 0);
      },
      totalAmount() {
        return this.filteredPayments.reduce((sum, payment) => sum + payment.totalAmount, 0);
      },
      totalProfit() {
        return this.totalAmount - this.totalPaid;
      }
    },
    methods: {
      async fetchAllPayments() {
        try {
          const response = await axios.get("http://localhost:5000/api/credit/payments");
          this.payments = response.data.payments;
        } catch (error) {
          console.error("Error fetching all payments:", error);
        }
      },
      formatDate(date) {
        return new Date(date).toLocaleString();
      },
      async deletePayment(paymentId) {
        if (confirm("Are you sure you want to delete this payment?")) {
          try {
            await axios.delete(`http://localhost:5000/api/credit/payments/${paymentId}`);
            this.payments = this.payments.filter(payment => payment._id !== paymentId);
            alert("Payment deleted successfully.");
          } catch (error) {
            console.error("Error deleting payment:", error);
            alert("Failed to delete payment.");
          }
        }
      },
      exportToPDF() {
        const doc = new jsPDF();
        doc.text("Payment History Report", 10, 10);
        
        autoTable(doc, {
          head: [['Customer Email', 'Amount Paid', 'Total Amount', 'Profit']],
          body: this.filteredPayments.map(payment => [
            payment.customerEmail,
            payment.amountPaid,
            payment.totalAmount,
            payment.totalAmount - payment.amountPaid
          ]),
          startY: 20,
        });
  
        // Add total calculations at the bottom
        doc.text(`Total Amount Paid: ${this.totalPaid}`, 10, doc.lastAutoTable.finalY + 10);
        doc.text(`Total Amount (with Interest): ${this.totalAmount}`, 10, doc.lastAutoTable.finalY + 20);
        doc.text(`Total Profit: ${this.totalProfit}`, 10, doc.lastAutoTable.finalY + 30);
  
        doc.save("Payment_History_Report.pdf");
      },
      exportToExcel() {
        const worksheetData = [
          ["Customer Email", "Amount Paid", "Total Amount", "Profit"],
          ...this.filteredPayments.map(payment => [
            payment.customerEmail,
            payment.amountPaid,
            payment.totalAmount,
            payment.totalAmount - payment.amountPaid
          ]),
          [],
          ["Total Amount Paid", this.totalPaid],
          ["Total Amount (with Interest)", this.totalAmount],
          ["Total Profit", this.totalProfit]
        ];
  
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payment History");
  
        XLSX.writeFile(workbook, "Payment_History_Report.xlsx");
      }
    },
    mounted() {
      this.fetchAllPayments();
    }
  };
  </script>
<style scoped>
.payment-history {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.search-section {
  margin-bottom: 15px;
  text-align: center;
}

.search-section input {
  padding: 8px;
  width: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

th {
  background-color: #4CAF50;
  color: white;
}

h2 {
  text-align: center;
  color: #333;
}

button {
  padding: 5px 10px;
  margin: 2px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #1976D2;
}

button.delete {
  background-color: #F44336;
}

button.delete:hover {
  background-color: #D32F2F;
}

.total-section {
  margin-top: 15px;
  padding: 10px;
  background: #f1f1f1;
  border-radius: 8px;
  text-align: center;
}
</style>
  