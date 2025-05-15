<template>
  <div class="p-6 max-w-7xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Borrower Application Dashboard</h1>

    <!-- Search -->
    <div class="flex flex-wrap gap-4 mb-4">
      <input v-model="searchTerm" placeholder="Search by name or email" class="p-2 border rounded w-64" />
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="text-center mb-4">Loading borrowers...</div>

    <!-- Error Message -->
    <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>

    <!-- Table -->
    <table v-if="!loading && !error" class="w-full border-collapse bg-white shadow">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-4 py-2">Name</th>
          <th class="border px-4 py-2">Email</th>
          <th class="border px-4 py-2">Amount</th>
          <th class="border px-4 py-2">Score</th>
          <th class="border px-4 py-2">Status</th>
          <th class="border px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="borrower in filteredBorrowers" :key="borrower._id">
          <td class="border px-4 py-2">{{ borrower.customerName }}</td>
          <td class="border px-4 py-2">{{ borrower.customerEmail }}</td>
          <td class="border px-4 py-2">M{{ borrower.amountRequested }}</td>
          <td class="border px-4 py-2">{{ borrower.calculatedScore }}</td>
          <td class="border px-4 py-2">{{ borrower.status || 'Pending' }}</td>
          <td class="border px-4 py-2 space-x-2">
            <button class="bg-green-500 text-white px-2 py-1 rounded" @click="updateStatus(borrower._id, 'Approved')">Approve</button>
            <button class="bg-red-500 text-white px-2 py-1 rounded" @click="updateStatus(borrower._id, 'Rejected')">Reject</button>
            <button class="bg-blue-500 text-white px-2 py-1 rounded" @click="viewDetails(borrower)">Monitor</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="mt-4 flex justify-between items-center">
      <button @click="prevPage" :disabled="page === 1" class="px-4 py-1 bg-gray-200 rounded">Previous</button>
      <span>Page {{ page }}</span>
      <button @click="nextPage" :disabled="end >= filteredBorrowers.length" class="px-4 py-1 bg-gray-200 rounded">Next</button>
    </div>

    <!-- Borrower Monitoring Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded shadow-lg max-w-md w-full overflow-y-auto max-h-[90vh]">
        <h3 class="text-xl font-bold mb-4">Monitoring Borrower: {{ selectedBorrower.customerName }}</h3>
        <p><strong>Email:</strong> {{ selectedBorrower.customerEmail }}</p>
        <p><strong>Requested Amount:</strong> ₹{{ selectedBorrower.amountRequested }}</p>
        <p><strong>Credit Purpose:</strong> {{ selectedBorrower.creditPurpose }}</p>

        <p class="italic text-sm text-gray-600 mt-2">
          Credit information such as a person’s previous loan performance is a powerful tool to predict future behavior.
        </p>

        <h4 class="mt-4 font-semibold">Documents:</h4>
        <ul>
          <li v-for="document in selectedBorrower.documents" :key="document">
            <button @click="downloadDocument(document)" class="text-blue-500 underline">
              Download Document
            </button>
          </li>
        </ul>

        <h4 class="mt-4 font-semibold">Status History:</h4>
        <ul>
          <li v-for="history in selectedBorrower.statusHistory" :key="history.date">
            <strong>{{ history.status }}</strong> - {{ formatDate(history.date) }}
          </li>
        </ul>

        <h3 class="mt-4 font-semibold">Payment History</h3>
        <table v-if="user.payments && user.payments.length" class="mt-2 w-full text-sm">
          <thead>
            <tr>
              <th class="border px-2 py-1">Amount Paid</th>
              <th class="border px-2 py-1">Method</th>
              <th class="border px-2 py-1">Late Fee</th>
              <th class="border px-2 py-1">Interest</th>
              <th class="border px-2 py-1">Total</th>
              <th class="border px-2 py-1">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in user.payments" :key="payment.paymentDate">
              <td class="border px-2 py-1">{{ payment.amountPaid }}</td>
              <td class="border px-2 py-1">{{ payment.paymentMethod }}</td>
              <td class="border px-2 py-1">{{ payment.lateFee }}</td>
              <td class="border px-2 py-1">{{ payment.interest }}</td>
              <td class="border px-2 py-1">{{ payment.totalAmount }}</td>
              <td class="border px-2 py-1">{{ formatDate(payment.paymentDate) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="mt-2 text-gray-500">No payment history found.</div>

        <div class="mt-4 flex justify-end">
          <button @click="closeModal" class="bg-red-500 text-white px-4 py-2 rounded">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const borrowers = ref([]);
const searchTerm = ref('');
const page = ref(1);
const perPage = 10;
const loading = ref(false);
const error = ref('');
const showModal = ref(false);
const selectedBorrower = ref(null);
const user = ref({ payments: [] });

const fetchBorrowers = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await axios.get('http://localhost:5000/api/credit/borrowers');
    borrowers.value = res.data;
  } catch (err) {
    error.value = 'Failed to load borrowers, please try again later.';
    console.error('Failed to fetch borrowers:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchBorrowers);

const start = computed(() => (page.value - 1) * perPage);
const end = computed(() => start.value + perPage);

const filteredBorrowers = computed(() => {
  return borrowers.value
    .filter(b =>
      b.customerName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      b.customerEmail.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
    .slice(start.value, end.value);
});

const nextPage = () => {
  if (end.value < borrowers.value.length) page.value++;
};

const prevPage = () => {
  if (page.value > 1) page.value--;
};

const updateStatus = async (id, status) => {
  try {
    await axios.put(`http://localhost:5000/api/credit/${id}/status`, { status });
    await fetchBorrowers();
  } catch (err) {
    console.error('Error updating status:', err);
  }
};

// ✅ FIXED: Use borrower's _id instead of user.value._id
const fetchPaymentHistory = async (id) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/credit/${id}`);
    user.value = response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
  }
};

// ✅ Call fetchPaymentHistory with correct id
const viewDetails = async (borrower) => {
  selectedBorrower.value = {
    ...borrower,
    statusHistory: borrower.statusHistory || [{ status: borrower.status, date: new Date() }]
  };
  showModal.value = true;
  await fetchPaymentHistory(borrower._id);
};

const downloadDocument = async (documentId) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/credit/documents/${documentId}`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', documentId);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading document:", error);
  }
};

const closeModal = () => {
  showModal.value = false;
  selectedBorrower.value = null;
};

const formatDate = (date) => new Date(date).toLocaleString();
</script>

<style scoped>
/* Layout and Typography */
/* Layout and Typography */
h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1f2937; /* Gray-800 */
}

input[type="text"] {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db; /* Gray-300 */
  border-radius: 6px;
  width: 16rem;
  transition: border 0.2s ease;
}

input[type="text"]:focus {
  outline: none;
  border-color: #3b82f6; /* Blue-500 */
}

/* Table Styling */
table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  overflow: hidden;
}

th,
td {
  border-bottom: 1px solid #e5e7eb; /* Gray-200 */
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.95rem;
}

thead {
  background-color: #f9fafb; /* Light gray */
  font-weight: 600;
  color: #374151; /* Gray-700 */
}

tbody tr:hover {
  background-color: #f3f4f6; /* Hover gray */
}

/* Buttons */
button {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s ease, transform 0.1s ease;
}

button:hover {
  transform: scale(1.02);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Button Variants */
.bg-green-500 {
  background-color: #22c55e;
}

.bg-green-500:hover {
  background-color: #16a34a;
}

.bg-red-500 {
  background-color: #ef4444;
}

.bg-red-500:hover {
  background-color: #dc2626;
}

.bg-blue-500 {
  background-color: #3b82f6;
}

.bg-blue-500:hover {
  background-color: #2563eb;
}

.bg-gray-200 {
  background-color: #e5e7eb;
}

.bg-gray-200:hover {
  background-color: #d1d5db;
}

.text-white {
  color: #fff;
}

.text-blue-500 {
  color: #3b82f6;
}

.text-blue-500:hover {
  color: #1d4ed8;
}

.text-red-500 {
  color: #ef4444;
}

/* Pagination */
.pagination {
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination button {
  padding: 0.5rem 1rem;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.modal-content h3,
.modal-content h4 {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.modal-content p {
  margin-bottom: 0.5rem;
}

.modal-content ul {
  margin: 0.5rem 0 1rem 1rem;
  list-style: disc;
}

.modal-content table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.modal-content th,
.modal-content td {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  text-align: left;
}
/* Modal Backdrop */
.fixed.inset-0 {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 50;
}

/* Modal Container */
.modal-container {
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Headings */
.modal-container h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.modal-container h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

/* Paragraphs */
.modal-container p {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

/* Italic note */
.modal-container p.italic {
  font-style: italic;
  font-size: 0.875rem;
  color: #6b7280;
}

/* Document Download Links */
.modal-container ul li button {
  background: none;
  color: #3b82f6;
  text-decoration: underline;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0;
  margin: 0.25rem 0;
}

.modal-container ul li button:hover {
  color: #1d4ed8;
}

/* Status History */
.modal-container ul {
  list-style: disc;
  padding-left: 1.5rem;
}

/* Table Styling */
.modal-container table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.75rem;
  font-size: 0.875rem;
}

.modal-container th,
.modal-container td {
  border: 1px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.modal-container thead {
  background-color: #f3f4f6;
}

.modal-container tbody tr:nth-child(even) {
  background-color: #f9fafb;
}

/* Close Button */
.modal-container .close-btn {
  background-color: #ef4444;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.modal-container .close-btn:hover {
  background-color: #dc2626;
}


</style>

