import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Games from './pages/Games';
import Users from './pages/Users';
import Tickets from './pages/Tickets';
import LiveChat from './pages/LiveChat';
import Regions from './pages/Regions';
import Settings from './pages/Settings';
import Billboards from './pages/Billboards';
import Coupons from './pages/Coupons';
import Reports from './pages/Reports';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<Orders />} />
        <Route path="games" element={<Games />} />
        <Route path="users" element={<Users />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="live-chat" element={<LiveChat />} />
        <Route path="billboards" element={<Billboards />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="regions" element={<Regions />} />
        <Route path="settings" element={<Settings />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}