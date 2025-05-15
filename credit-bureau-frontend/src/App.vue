<template>
  <div id="app">
    <nav v-if="showNav">
      <router-link class="nav-button" to="/creditor-login">Creditor Login</router-link>
      <router-link class="nav-button" to="/admin">Admin Login</router-link>
      <router-link class="nav-button" to="/credit-request-form">Credit-request-form</router-link>
      
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    showNav() {
      // Show nav only on these paths
      return ['/', '/creditor-login', '/admin'].includes(this.$route.path);
    }
  }
};
</script>

<style>
nav {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.nav-button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
}

.nav-button:hover {
  background-color: #2c8a67;
}
</style>
