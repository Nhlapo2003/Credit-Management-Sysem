<template>
  <div class="dashboard">
    <!-- Navigation Bar -->
    <nav class="navbar">
      <router-link class="nav-item" to="/dash">Dashboard</router-link>
      <router-link class="nav-item" to="/credit-requests">Credit Requests</router-link>
      <router-link class="nav-item" to="/monitoring">Monitoring</router-link>
      <router-link class="nav-item" to="/payment-history">Payment History</router-link>
      <router-link class="nav-item" to="/addadmin">Add Admin</router-link>
      <button class="logout-btn" @click="logout">Logout</button>
    </nav>

    <h1>Credit Bureau</h1>

    <div class="stats">
      <div class="stat-card">
        <h3>Total Credit Requests</h3>
        <p>{{ totalRequests }}</p>
      </div>
      <div class="stat-card">
        <h3>Approved Requests</h3>
        <p>{{ totalApproved }}</p>
      </div>
      <div class="stat-card">
        <h3>Rejected Requests</h3>
        <p>{{ totalRejected }}</p>
      </div>
      <div class="stat-card">
        <h3>Pending Requests</h3>
        <p>{{ totalPending }}</p>
      </div>
      
    </div>

    <h2>Charts Overview</h2>
    <div class="charts">
      <div class="chart-card">
        <h3>Request Status Breakdown</h3>
        <RequestStatusChart
          :approved="totalApproved"
          :rejected="totalRejected"
          :pending="totalPending"
        />
      </div>

      <div class="chart-card">
        <h3>Payments Overview</h3>
        <PaymentChart />
      </div>
    </div>

    <h2>Recent Credit Requests</h2>
    <table>
      <thead>
        <tr>
          <th>Customer Name</th>
          <th>Email</th>
          <th>Requested Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="request in recentRequests" :key="request._id">
          <td>{{ request.customerName }}</td>
          <td>{{ request.customerEmail }}</td>
          <td>{{ request.amountRequested }} LSL</td>
          <td :class="statusClass(request.status)">{{ request.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import RequestStatusChart from './RequestStatusChart.vue';
import PaymentChart from './Paymentchart.vue';
import axios from 'axios';

export default {
  components: {
    RequestStatusChart,
    PaymentChart
  },
  data() {
    return {
      totalRequests: 0,
      totalApproved: 0,
      totalRejected: 0,
      totalPending: 0,
      totalPayments: 0,
      recentRequests: [],
    };
  },
  methods: {
    async fetchDashboardData() {
      try {
        const res = await axios.get("http://localhost:5000/api/credit/dashboard");
        const requests = res.data.requests;
        const payments = res.data.payments;

        this.totalRequests = requests.length;
        this.totalApproved = requests.filter(r => r.status === "Approved").length;
        this.totalRejected = requests.filter(r => r.status === "Rejected").length;
        this.totalPending = requests.filter(r => r.status === "Pending").length;
        this.totalPayments = payments.reduce((sum, p) => sum + p.totalAmount, 0);
        this.recentRequests = requests.slice(0, 5);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    },
    statusClass(status) {
      return {
        Approved: 'text-green-500',
        Rejected: 'text-red-500',
        Pending: 'text-yellow-500',
      }[status] || 'text-gray-500';
    },
    logout() {
      localStorage.removeItem('isAdminLoggedIn');
      this.$router.push('/admin');
    },
  },
  mounted() {
    this.fetchDashboardData();
  }
};
</script>

<style scoped>
/* Chart Section */
.charts {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 30px;
}

.chart-card {
  flex: 0 0 45%;
  max-width: 400px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease forwards;
}

.chart-card h3 {
  margin-bottom: 16px;
  font-size: 18px;
  color: #333;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .charts {
    flex-direction: column;
    align-items: center;
  }
}

/* Navigation Bar */
.navbar {
  display: flex;
  background-color: #2c3e50;
  padding: 10px 20px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-radius: 8px;
}

.nav-item {
  color: white;
  text-decoration: none;
  margin-right: 15px;
  font-weight: bold;
  transition: color 0.3s;
}

.nav-item:hover {
  color: #18bc9c;
}

.logout-btn {
  background-color: #e74c3c;
  border: none;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.logout-btn:hover {
  background-color: #c0392b;
}

/* Dashboard Stats */
.dashboard {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}

.stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.stat-card h3 {
  margin-bottom: 8px;
}

.stat-card p {
  font-size: 24px;
  font-weight: bold;
}

/* Table Styling */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  padding: 10px;
  text-align: center;
  border: 1px solid #ddd;
}

th {
  background-color: #4CAF50;
  color: white;
}

.text-green-500 {
  color: #4CAF50;
}

.text-red-500 {
  color: #F44336;
}

.text-yellow-500 {
  color: #FFC107;
}

.text-gray-500 {
  color: #9E9E9E;
}
</style>
