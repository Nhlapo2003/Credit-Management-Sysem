<template>
  <div class="dashboard">
    <h2>Welcome, {{ user.customerName }}</h2>
    <p>Email: {{ user.customerEmail }}</p>
    <p>Requested Amount: {{ user.amountRequested }}</p>
    <p>Purpose: {{ user.creditPurpose }}</p>
    <p>Score: {{ user.calculatedScore }}</p>
    <p>Status: <span :class="statusClass">{{ user.status || 'Pending' }}</span></p>

    <!-- Approval and Due Date Display -->
    <p v-if="user.status === 'Approved'">
      <strong>Approval Date:</strong> {{ formatDate(user.approvalDate) }}<br>
      <strong>Due Date:</strong> {{ formatDate(user.dueDate) }}
    </p>

    <!-- Payment Form Trigger -->
    <button v-if="user.status === 'Approved' && !showPaymentForm" @click="togglePaymentForm">
      Payback Loan
    </button>

    <!-- Payment Form -->
    <div v-if="showPaymentForm" class="payment-form">
      <h3>Pay Your Loan</h3>
      <label>Total Amount Due: {{ calculateRemainingAmount() }}</label>
      <input type="number" v-model="amountPaid" placeholder="Amount to Pay" required />

      <label>Late Fee</label>
      <input type="number" v-model="lateFee" placeholder="Late Fee" />

      <label>Interest Rate (%)</label>
      <input type="number" v-model="interestRate" placeholder="Interest Rate" />

      <label>Payment Method</label>
      <select v-model="paymentMethod">
        <option value="Cash">Cash</option>
        <option value="Credit Card">Credit Card</option>
        <option value="Online Payment">Online Payment</option>
      </select>

      <h3>Total Payment: {{ calculateTotal() }}</h3>
      <button @click="makePayment">Submit Payment</button>
    </div>

    <!-- Payment History Table -->
    <h3>Payment History</h3>
    <table v-if="user.payments && user.payments.length">
      <tr>
        <th>Amount Paid</th>
        <th>Payment Method</th>
        <th>Late Fee</th>
        <th>Interest</th>
        <th>Total</th>
        <th>Date</th>
      </tr>
      <tr v-for="payment in user.payments" :key="payment.paymentDate">
        <td>{{ payment.amountPaid }}</td>
        <td>{{ payment.paymentMethod }}</td>
        <td>{{ payment.lateFee }}</td>
        <td>{{ payment.interest }}</td>
        <td>{{ payment.totalAmount }}</td>
        <td>{{ formatDate(payment.paymentDate) }}</td>
      </tr>
    </table>

    <button class="logout-btn" @click="logout">Logout</button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const user = ref({});
const showPaymentForm = ref(false);
const amountPaid = ref(0);
const lateFee = ref(0);
const interestRate = ref(20);
const paymentMethod = ref('Cash');

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

onMounted(async () => {
  const data = localStorage.getItem('user');
  if (!data) {
    router.push('/');
  } else {
    user.value = JSON.parse(data);
    await fetchPaymentHistory();
  }
});

const fetchPaymentHistory = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/api/credit/${user.value._id}`);
    user.value = response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
  }
};

const togglePaymentForm = () => {
  showPaymentForm.value = !showPaymentForm.value;
};

const calculateRemainingAmount = () => {
  const totalPaid = user.value.payments?.reduce((acc, p) => acc + p.amountPaid, 0) || 0;
  return user.value.amountRequested - totalPaid;
};

const calculateTotal = () => {
  const base = parseFloat(amountPaid.value || 0);
  const fee = parseFloat(lateFee.value || 0);
  const interest = (base * (interestRate.value / 100)) || 0;
  return base + fee + interest;
};

const makePayment = async () => {
  try {
    const totalAmount = calculateTotal();
    const paymentData = {
      amountPaid: amountPaid.value,
      paymentMethod: paymentMethod.value,
      lateFee: lateFee.value,
      interest: (amountPaid.value * (interestRate.value / 100)).toFixed(2),
      totalAmount: totalAmount,
      paymentDate: new Date().toISOString()
    };

    await axios.post(`http://localhost:5000/api/credit/pay/${user.value._id}`, paymentData);
    user.value.payments.push(paymentData);

    alert(`Payment Successful. Total Amount Paid: ${totalAmount}`);
    showPaymentForm.value = false;
    amountPaid.value = 0;
    lateFee.value = 0;
  } catch (error) {
    console.error("Payment Error:", error);
    alert("Payment failed. Try again.");
  }
};

const logout = () => {
  localStorage.removeItem('user');
  router.push('/');
};

const statusClass = computed(() => {
  switch (user.value.status) {
    case 'Approved':
      return 'text-green-600 font-bold';
    case 'Rejected':
      return 'text-red-600 font-bold';
    default:
      return 'text-orange-500 font-bold';
  }
});
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  background: #f7f7f7;
  max-width: 800px;
  margin: 2rem auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

p {
  font-size: 1rem;
  color: #555;
  margin-bottom: 0.8rem;
}

.text-green-600 {
  color: #4CAF50;
}

.text-red-600 {
  color: #F44336;
}

.text-orange-500 {
  color: #FF9800;
}

button {
  background-color: #007bff;
  color: #fff;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin: 0.5rem 0;
}

button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.payment-form {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.payment-form label {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  display: block;
  font-weight: 500;
}

.payment-form input,
.payment-form select {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.payment-form input:focus,
.payment-form select:focus {
  border-color: #007bff;
  outline: none;
}

h3 {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 1rem;
  color: #333;
}

.payment-history {
  margin-top: 2rem;
  width: 100%;
}

.payment-history table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.payment-history th,
.payment-history td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.payment-history th {
  background-color: #f8f8f8;
  font-weight: bold;
}

.payment-history tr:nth-child(even) {
  background-color: #fafafa;
}

.logout-btn {
  background-color: #f44336;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  margin-top: 2rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.logout-btn:hover {
  background-color: #d32f2f;
  transform: translateY(-2px);
}
</style>
