<template>
    <div class="payment-form">
      <h2>Pay Your Bill</h2>
      <label>Amount Due: {{ baseAmount }}</label>
      <input type="number" v-model="amountPaid" placeholder="Amount to Pay" required />
      
      <label>Late Fee (Optional)</label>
      <input type="number" v-model="lateFee" placeholder="Late Fee" />
  
      <label>Interest Rate (Optional, %)</label>
      <input type="number" v-model="interestRate" placeholder="Interest Rate" />
  
      <label>Payment Method</label>
      <select v-model="paymentMethod">
        <option value="Cash">Cash</option>
        <option value="Credit Card">Credit Card</option>
        <option value="Online Payment">Online Payment</option>
      </select>
  
      <button @click="makePayment">Submit Payment</button>
  
      <h3>Total Payment: {{ calculateTotal() }}</h3>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    props: ['creditRequestId', 'baseAmount'],
    data() {
      return {
        amountPaid: '',
        lateFee: 0,
        interestRate: 20,
        paymentMethod: 'Cash',
      };
    },
    methods: {
      calculateTotal() {
        const base = parseFloat(this.amountPaid || 0);
        const fee = parseFloat(this.lateFee || 0);
        const interest = (base * (this.interestRate / 100)) || 0;
        return base + fee + interest;
      },
      async makePayment() {
        try {
          const totalAmount = this.calculateTotal();
          await axios.post(`http://localhost:5000/api/credit/pay/${this.creditRequestId}`, {
            amountPaid: this.amountPaid,
            paymentMethod: this.paymentMethod,
            lateFee: this.lateFee,
            interest: (this.amountPaid * (this.interestRate / 100))
          });
  
          alert("Payment Successful. Total Amount Paid: " + totalAmount);
          this.$emit("paymentSuccess");
        } catch (error) {
          console.error("Payment Error:", error);
          alert("Payment failed. Try again.");
        }
      }
    }
  };
  </script>
  
  <style>
  .payment-form {
    max-width: 400px;
    margin: auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  </style>
  