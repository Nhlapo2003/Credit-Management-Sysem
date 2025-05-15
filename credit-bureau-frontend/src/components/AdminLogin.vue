 // eslint-disable-next-line
/* eslint-disable */
<template>
    <div class="admin-login">
      <h2>Admin Login</h2>
      <input v-model="username" type="text" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="login">Login</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        username: '',
        password: '',
        errorMessage: ''
      };
    },
    methods: {
      async login() {
        try {
          await axios.post('http://localhost:5000/admin/login', {

            username: this.username,
            password: this.password
          });
          alert('Login successful');
          this.$router.push('/dash'); 
          // Redirect to admin dashboard or save session if needed
        } catch (err) {
          this.errorMessage = 'Invalid username or password';
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .admin-login {
    max-width: 400px;
    margin: auto;
    padding: 20px;
    background: #f4f4f4;
    border-radius: 10px;
    text-align: center;
  }
  input {
    display: block;
    margin: 10px auto;
    padding: 8px;
    width: 90%;
  }
  button {
    padding: 10px 20px;
    background: #42b983;
    color: white;
    border: none;
    border-radius: 5px;
  }
  .error {
    color: red;
    margin-top: 10px;
  }
  </style>
  