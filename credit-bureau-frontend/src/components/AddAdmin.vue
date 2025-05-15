<template>
    <div class="add-admin">
      <h2>Add New Admin</h2>
      <input v-model="username" type="text" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="addAdmin">Add Admin</button>
      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        username: '',
        password: '',
        message: ''
      };
    },
    methods: {
      async addAdmin() {
        try {
          const response = await axios.post('http://localhost:5000/admin/register', {
            username: this.username,
            password: this.password
          });
          this.message = response.data.message || 'Admin added successfully!';
          this.username = '';
          this.password = '';
        } catch (error) {
          this.message = 'Failed to add admin';
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .add-admin {
    max-width: 400px;
    margin: auto;
    padding: 20px;
    background: #eef;
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
    background: #007acc;
    color: white;
    border: none;
    border-radius: 5px;
  }
  .message {
    margin-top: 10px;
    color: green;
  }
  </style>
  