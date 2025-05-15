<template>
    <div class="login-container">
      <h2>Customer Login</h2>
      <form @submit.prevent="login">
        <input
          v-model="customerName"
          placeholder="Customer Name"
          required
        />
        <input
          v-model="customerEmail"
          type="email"
          placeholder="Customer Email"
          required
        />
        <button type="submit">Login</button>
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">{{ success }}</p>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  
  const router = useRouter()
  
  const customerName = ref('')
  const customerEmail = ref('')
  const error = ref('')
  const success = ref('')
  
  const login = async () => {
    try {
      const res = await axios.post('http://localhost:5000/login', {
        customerName: customerName.value,
        customerEmail: customerEmail.value
      })
      success.value = res.data.message
      error.value = ''
  
      // Save user and redirect
      localStorage.setItem('user', JSON.stringify(res.data.user))
      router.push('/creditor-dashboard')
  
    } catch (err) {
      success.value = ''
      error.value = err.response?.data?.message || 'Login failed'
    }
  }
  </script>
  
  
  <style scoped>
  .login-container {
    max-width: 400px;
    margin: auto;
    padding: 2rem;
    background: #f5f5f5;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
  }
  input {
    display: block;
    width: 100%;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: 4px;
  }
  button {
    padding: 0.5rem 1rem;
    background: #333;
    color: white;
    border: none;
    border-radius: 4px;
  }
  .error {
    color: red;
  }
  .success {
    color: green;
  }
  </style>
  