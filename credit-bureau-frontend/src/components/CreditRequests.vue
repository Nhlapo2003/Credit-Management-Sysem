<template>
    <div>
      <h2>Credit Requests Review</h2>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Amount Requested</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in creditRequests" :key="request._id">
            <td>{{ request.customerName }}</td>
            <td>{{ request.amountRequested }}</td>
            <td>{{ request.status }}</td>
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
      await this.loadCreditRequests();
    },
    methods: {
      async loadCreditRequests() {
        try {
          const res = await axios.get('http://localhost:5000/api/credit/requests');
          this.creditRequests = res.data;
        } catch (error) {
          alert('Error loading requests');
        }
      }
    }
  };
  </script>
  
  <style>
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 10px;
    border: 1px solid #ddd;
  }
  </style>
  