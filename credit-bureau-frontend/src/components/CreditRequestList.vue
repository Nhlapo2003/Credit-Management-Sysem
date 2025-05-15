<template>
  <div class="credit-request-list">
    <h2>All Credit Requests</h2>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Amount</th>
          <th>Purpose</th>
          <th>Credit Score</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="request in creditRequests" :key="request._id">
          <td>{{ request.customerName }}</td>
          <td>{{ request.customerEmail }}</td>
          <td>{{ request.amountRequested }}</td>
          <td>{{ request.creditPurpose }}</td>
          <td>{{ request.calculatedScore }}</td>
          <td>{{ request.status }}</td> <!-- Display status here -->
          <td>
           
            <button @click="deleteRequest(request._id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      creditRequests: []
    };
  },
  async created() {
    await this.fetchCreditRequests();
  },
  methods: {
    async fetchCreditRequests() {
      try {
        const response = await axios.get('http://localhost:5000/api/credit/requests');
        this.creditRequests = response.data;
      } catch (error) {
        console.error("Error fetching credit requests:", error);
        alert("Failed to load credit requests.");
      }
    },
    viewRequest(request) {
      alert(`Viewing request for ${request.customerName}`);
    },
    async updateStatus(request, status) {
      try {
        await axios.put(`http://localhost:5000/api/credit/update/${request._id}`, { status });
        // Update the status in the local array
        request.status = status;
      } catch (error) {
        console.error("Error updating status:", error);
        alert("Failed to update the status.");
      }
    },
    async deleteRequest(id) {
      if (confirm("Are you sure you want to delete this request?")) {
        try {
          await axios.delete(`http://localhost:5000/api/credit/delete/${id}`);
          this.fetchCreditRequests();
        } catch (error) {
          console.error("Error deleting request:", error);
          alert("Failed to delete the request.");
        }
      }
    }
  }
};
</script>

<style scoped>
.credit-request-list {
  max-width: 800px;
  margin: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #42b983;
  color: #fff;
}

button {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
  font-weight: bold;
}

button:hover {
  opacity: 0.8;
}

button:focus {
  outline: none;
}

.view-btn {
  background-color: #007bff;
  color: white;
}

.approve-btn {
  background-color: #28a745;
  color: white;
}

.reject-btn {
  background-color: #dc3545;
  color: white;
}

.pending-btn {
  background-color: #ffc107;
  color: white;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}
</style>
