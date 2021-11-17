import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import AddDevice from '../views/AddDevice.vue'
import DeviceDashboard from '../views/DeviceDashboard.vue'
import CreateAccount from '../views/CreateAccount.vue'
import store from '../store/index'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/addDevice',
    name: 'AddDevice',
    component: AddDevice
  },
  {
    path: '/dashboard/:id',
    name: 'DeviceDashboard',
    component: DeviceDashboard
  },
  {
    path: '/createAccount',
    name: 'CreateAccount',
    component: CreateAccount
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
router.beforeEach(async (to, from, next) => {
  const loggedInRoutes = ['/dashboard', '/addDevice', '/dashboard/'];
  const loggedOutRoutes = ['/login', '/createAccount', '/'];
  console.log(store);
  if(store.state.loggedIn === undefined) {
    await store.dispatch('isLoggedIn');
  }
  if(loggedInRoutes.some((v)=> to.path.startsWith(v))) {
    if(store.state.loggedIn) {
      next();
    } else {
      console.log('not allowed');
      next(false);
    }
  } else if(loggedOutRoutes.some((v)=>to.path.startsWith(v))) {
    if(!store.state.loggedIn) {
      next();
    } else {
      console.log('not allowed, already logged in');
      next('/dashboard');
    }
  }
})
export default router
