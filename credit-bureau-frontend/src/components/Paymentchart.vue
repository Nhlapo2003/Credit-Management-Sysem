<template>
    <div class="chart-container">
      <h2>Payment Method Distribution</h2>
  
      <!-- Date Range Filters -->
      <div class="date-filter">
        <label>From: </label>
        <input type="date" v-model="startDate" @change="updateChart" />
        <label>To: </label>
        <input type="date" v-model="endDate" @change="updateChart" />
      </div>
  
      <canvas id="paymentChart"></canvas>
    </div>
  </template>
  
  <script>
  import { Chart, registerables } from "chart.js";
  Chart.register(...registerables);
  
  export default {
    name: "PaymentChart",
    data() {
      return {
        paymentChart: null,
        paymentData: [],
        filteredData: [],
        startDate: "",
        endDate: ""
      };
    },
    async mounted() {
      await this.fetchPaymentData();
      this.renderChart();
    },
    methods: {
      async fetchPaymentData() {
        try {
          const response = await fetch("http://localhost:5000/api/credit/payments");
          const data = await response.json();
          this.paymentData = data.payments;
          this.filteredData = [...this.paymentData]; // Initialize filtered data
        } catch (error) {
          console.error("Error fetching payment data:", error);
        }
      },
      updateChart() {
        this.filteredData = this.paymentData.filter((payment) => {
          const paymentDate = new Date(payment.paymentDate).getTime();
          const start = this.startDate ? new Date(this.startDate).getTime() : null;
          const end = this.endDate ? new Date(this.endDate).getTime() : null;
          return (
            (!start || paymentDate >= start) &&
            (!end || paymentDate <= end)
          );
        });
        this.renderChart();
      },
      renderChart() {
        const paymentMethods = ["Cash", "Credit Card", "Online Payment"];
        const paymentCounts = paymentMethods.map((method) =>
          this.filteredData.filter((payment) => payment.paymentMethod === method).length
        );
  
        const ctx = document.getElementById("paymentChart").getContext("2d");
        if (this.paymentChart) this.paymentChart.destroy(); // Destroy old chart
  
        this.paymentChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: paymentMethods,
            datasets: [
              {
                label: "Payments Count",
                data: paymentCounts,
                backgroundColor: ["#4CAF50", "#2196F3", "#FF9800"],
                borderColor: ["#388E3C", "#1976D2", "#F57C00"],
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: true
              },
              tooltip: {
                callbacks: {
                  label: (context) => `Total: ${context.raw}`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    }
  };
  </script>
  
  <style scoped>
  .chart-container {
    max-width: 800px;
    margin: auto;
    padding: 20px;
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
    text-align: center;
  }
  
  .date-filter {
    margin-bottom: 15px;
    display: flex;
    justify-content: center;
    gap: 10px;
    align-items: center;
  }
  
  canvas {
    max-width: 100%;
  }
  </style>
  