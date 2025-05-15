<template>
  <div class="credit-process">
    <h2>Advanced Credit Request - Step {{ currentStep }} of 5</h2>

    <!-- Step 1: Customer Info -->
    <div v-if="currentStep === 1">
      <h3>Step 1: Customer Information</h3>
      <input type="text" v-model="form.customerName" placeholder="Customer Name" required />
      <input type="email" v-model="form.customerEmail" placeholder="Customer Email" required />
      <p v-if="form.customerEmail && emailExists" class="warning">
        ⚠️ A previous unpaid credit request exists with this email.
      </p>
      <input type="text" v-model="form.accountNumber" placeholder="Account Number" required />
    </div>

    <!-- Step 2: Credit Details -->
    <div v-if="currentStep === 2">
      <h3>Step 2: Credit Details</h3>
      <input type="number" v-model="form.amountRequested" placeholder="Credit Amount" required />
      <input type="text" v-model="form.creditPurpose" placeholder="Purpose of Credit" required />
    </div>

    <!-- Step 3: Upload -->
    <div v-if="currentStep === 3">
      <h3>Step 3: Document Upload</h3>
      <input type="file" @change="handleDocumentUpload" multiple />
    </div>

    <!-- Step 4: Evaluation -->
    <div v-if="currentStep === 4">
      <h3>Step 4: Credit Evaluation</h3>
      <p>Your calculated credit score: {{ calculatedScore }}</p>
    </div>

    <!-- Step 5: Review -->
    <div v-if="currentStep === 5">
      <h3>Step 5: Review & Submit</h3>
      <ul>
        <li><strong>Name:</strong> {{ form.customerName }}</li>
        <li><strong>Email:</strong> {{ form.customerEmail }}</li>
        <li><strong>Account Number:</strong> {{ form.accountNumber }}</li>
        <li><strong>Amount:</strong> {{ form.amountRequested }}</li>
        <li><strong>Purpose:</strong> {{ form.creditPurpose }}</li>
        <li><strong>Documents:</strong> {{ uploadedDocuments.length }} uploaded</li>
        <li><strong>Credit Score:</strong> {{ calculatedScore }}</li>
      </ul>
      <button @click="submitCreditRequest">Submit Request</button>
    </div>

    <!-- Navigation -->
    <div class="navigation-buttons">
      <button v-if="currentStep > 1" @click="previousStep">Previous</button>
      <button v-if="currentStep < 5" @click="checkDebtBeforeNext">Next</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      currentStep: 1,
      form: {
        customerName: '',
        customerEmail: '',
        accountNumber: '',
        amountRequested: '',
        creditPurpose: ''
      },
      uploadedDocuments: [],
      calculatedScore: 0,
      creditRequests: [],
      hasUnpaidDebt: false
    };
  },
  computed: {
    emailExists() {
      return this.creditRequests.some(
        (request) =>
          request.customerEmail === this.form.customerEmail &&
          request.status === 'Unpaid'
      );
    }
  },
  created() {
    this.fetchCreditRequests();
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

    calculateRemainingAmount(request) {
      const totalPaid = request.payments?.reduce((acc, p) => acc + p.amountPaid, 0) || 0;
      return request.amountRequested - totalPaid;
    },

    async checkDebtBeforeNext() {
      if (this.currentStep === 1) {
        await this.fetchCreditRequests();
        const existing = this.creditRequests.find((request) => {
          return (
            request.customerEmail === this.form.customerEmail &&
            request.status === "Approved" &&
            this.calculateRemainingAmount(request) > 0
          );
        });

        if (existing) {
          alert(
            `You have an unpaid debt of LSL${this.calculateRemainingAmount(existing)}. Please settle it before applying again.`
          );
          return;
        }
      }

      // No debt or not step 1, continue
      this.nextStep();
    },

    nextStep() {
      if (this.currentStep < 5) {
        if (this.currentStep === 4) this.calculateCreditScore();
        this.currentStep++;
      }
    },

    previousStep() {
      if (this.currentStep > 1) this.currentStep--;
    },

    handleDocumentUpload(event) {
      this.uploadedDocuments = Array.from(event.target.files);
    },

  calculateCreditScore() {
  if (!this.selectedBorrower || !this.selectedBorrower.payments) {
    this.calculatedScore = 300; // Default minimum
    return;
  }

  const payments = this.selectedBorrower.payments;
  const totalPayments = payments.length;
  let onTimePayments = 0;
  let totalLateFees = 0;
  let totalPaid = 0;

  payments.forEach(payment => {
    if (!payment.lateFee || payment.lateFee === 0) {
      onTimePayments++;
    } else {
      totalLateFees += payment.lateFee;
    }
    totalPaid += payment.totalAmount || 0;
  });

  const paymentPunctuality = onTimePayments / totalPayments;
  const lateFeeImpact = totalLateFees / (totalPaid || 1);

  // Base score starts from 600
  let score = 600;

  // Reward punctuality
  score += paymentPunctuality * 100;

  // Penalize late fees
  score -= lateFeeImpact * 50;

  // Clamp the score between 300 and 850
  this.calculatedScore = Math.min(Math.max(Math.floor(score), 300), 850);
}
,

    async submitCreditRequest() {
      if (this.emailExists) {
        alert('You cannot submit a new credit request with unpaid debt.');
        return;
      }

      try {
        const formData = new FormData();
        formData.append("customerName", this.form.customerName);
        formData.append("customerEmail", this.form.customerEmail);
        formData.append("accountNumber", this.form.accountNumber);
        formData.append("amountRequested", this.form.amountRequested);
        formData.append("creditPurpose", this.form.creditPurpose);
        this.uploadedDocuments.forEach((file) => {
          formData.append("documents", file);
        });
        formData.append("calculatedScore", this.calculatedScore);
        formData.append("status", "Pending");

        await axios.post('http://localhost:5000/api/credit/submit', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        alert('Credit request submitted successfully');
        this.resetForm();
      } catch (error) {
        alert('Error submitting request');
        console.error(error);
      }
    },

    resetForm() {
      this.currentStep = 1;
      this.form = {
        customerName: '',
        customerEmail: '',
        accountNumber: '',
        amountRequested: '',
        creditPurpose: ''
      };
      this.uploadedDocuments = [];
      this.calculatedScore = 0;
      this.hasUnpaidDebt = false;
    }
  }
};
</script>

<style scoped>
.credit-process {
  max-width: 500px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

h3 {
  margin-bottom: 10px;
}

input {
  display: block;
  margin-bottom: 10px;
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
}

.navigation-buttons {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
}

button {
  padding: 8px 12px;
  border: none;
  background-color: #42b983;
  color: #fff;
  cursor: pointer;
  border-radius: 5px;
}

button:hover {
  background-color: #36a173;
}

.warning {
  color: red;
  font-size: 14px;
}
</style>
