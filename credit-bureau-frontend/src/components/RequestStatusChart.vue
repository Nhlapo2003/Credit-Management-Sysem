<template>
    <div>
      <DoughnutChart :data="chartData" :options="chartOptions" />
    </div>
  </template>
  
  <script>
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    DoughnutController,
  } from 'chart.js';
  import { Doughnut } from 'vue-chartjs';
  
  ChartJS.register(Title, Tooltip, Legend, ArcElement, DoughnutController);
  
  export default {
    name: 'RequestStatusChart',
    components: {
      DoughnutChart: Doughnut // ✅ Register properly
    },
    props: {
      approved: Number,
      rejected: Number,
      pending: Number,
    },
    computed: {
      chartData() {
        return {
          labels: ['Approved', 'Rejected', 'Pending'],
          datasets: [
            {
              label: 'Requests',
              backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
              data: [this.approved, this.rejected, this.pending],
            },
          ],
        };
      },
      chartOptions() {
        return {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
            },
            title: {
              display: true,
              text: 'Credit Request Status Breakdown',
            },
          },
        };
      },
    },
  };
  </script>
  