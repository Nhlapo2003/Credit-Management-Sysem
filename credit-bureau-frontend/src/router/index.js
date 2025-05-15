import { createRouter, createWebHistory } from 'vue-router';
import CreditRequestForm from '../components/CreditRequestForm.vue';
import CreditRequestList from '../components/CreditRequestList.vue';
import PaymentForm from '../components/PaymentForm.vue';
import CreditorLogin from '../components/Creditor-login.vue';
import CreditorDashboard from '../components/Creditor-Dashboard.vue';
import MonitorScreening from '@/components/Monitor-Screening.vue';
import AdminLogin from '@/components/AdminLogin.vue';
import AddAdmin from '@/components/AddAdmin.vue';
import AdminDashboard from '@/components/Admin-dashboard.vue';
import PaymenyHistory from '@/components/PaymenyHistory.vue';
import Paymentchart from '@/components/Paymentchart.vue';
import RequestStatusChart from '@/components/RequestStatusChart.vue';
const routes = [
  { path: '/credit-request-form', component: CreditRequestForm },
  { path: '/credit-requests', component: CreditRequestList },
  { path: '/payments', component: PaymentForm },
  { path: '/creditor-login', component: CreditorLogin },
  { path: '/creditor-dashboard', component: CreditorDashboard },
  { path: '/admin', component: AdminLogin  },
  { path: '/monitoring', component: MonitorScreening  },
  { path: '/addadmin', component: AddAdmin  },
  { path: '/dash', component: AdminDashboard  },
  {path: '/payment-history', component: PaymenyHistory },
  {path: '/payment-chart', component: Paymentchart },
  {path: '/RequestStatusChart', component: RequestStatusChart  },


  { path: '/', redirect: '/admin' }, // Default route
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
