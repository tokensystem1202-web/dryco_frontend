import axios from 'axios';

export type AppRole = 'customer' | 'business' | 'admin';

export interface ApiEnvelope<T> {
  data: T;
  timestamp: string;
  path: string;
}

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  role: AppRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: AppRole;
  city?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Business {
  id: string;
  userId: string;
  businessName: string;
  address: string;
  city: string;
  pincode: string;
  gstNumber?: string | null;
  isApproved: boolean;
  isActive: boolean;
  commissionRate: number;
  rating: number;
  totalOrders: number;
}

export interface BusinessInput {
  businessName: string;
  address: string;
  city: string;
  pincode: string;
  gstNumber?: string;
}

export interface ServiceItem {
  id: string;
  businessId: string;
  name: string;
  category: 'wash' | 'dry_clean' | 'iron' | 'wash_iron';
  pricePerUnit: number;
  unit: string;
  description?: string | null;
  isActive: boolean;
}

export interface ServiceInput {
  businessId: string;
  name: string;
  category: ServiceItem['category'];
  pricePerUnit: number;
  unit: string;
  description?: string;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  customerId: string;
  businessId: string;
  riderId?: string | null;
  status:
    | 'requested'
    | 'accepted'
    | 'picked_up'
    | 'cleaning'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  pickupSlot: string;
  deliverySlot: string;
  pickupDate: string;
  deliveryDate: string;
  subtotal: number;
  discountAmount: number;
  couponCode?: string | null;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialInstructions?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  serviceId: string;
  itemName: string;
  category: ServiceItem['category'];
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface OrderDetails extends OrderListItem {
  items: OrderItem[];
  timeline: Array<{ label: string; status: string; at: string }>;
}

export interface CreateOrderInput {
  businessId: string;
  pickupSlot: string;
  deliverySlot: string;
  pickupDate: string;
  deliveryDate: string;
  items: Array<{
    serviceId: string;
    itemName: string;
    category: ServiceItem['category'];
    quantity: number;
    pricePerUnit: number;
  }>;
  couponCode?: string;
  specialInstructions?: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  trend: string;
  tone?: 'blue' | 'green' | 'purple' | 'orange';
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}

export async function loginRequest(payload: LoginPayload) {
  const response = await api.post<ApiEnvelope<AuthResponse>>('/auth/login', payload);
  return response.data.data;
}

export async function registerRequest(payload: RegisterPayload) {
  const response = await api.post<ApiEnvelope<AuthResponse>>('/auth/register', payload);
  return response.data.data;
}

export async function meRequest() {
  const response = await api.get<ApiEnvelope<AuthUser>>('/auth/me');
  return response.data.data;
}

export async function getApprovedBusinesses() {
  const response = await api.get<ApiEnvelope<{ filters: Record<string, string | undefined>; items: Business[] }>>(
    '/businesses',
  );
  return response.data.data.items;
}

export async function getMyBusiness() {
  const response = await api.get<ApiEnvelope<Business | null>>('/businesses/my');
  return response.data.data;
}

export async function createBusiness(payload: BusinessInput) {
  const response = await api.post<ApiEnvelope<Business>>('/businesses', payload);
  return response.data.data;
}

export async function getAdminBusinesses() {
  const response = await api.get<ApiEnvelope<Business[]>>('/admin/businesses');
  return response.data.data;
}

export async function approveBusinessRequest(id: string, approved: boolean) {
  const response = await api.patch<ApiEnvelope<Business>>(`/admin/businesses/${id}/approve`, {
    approved,
  });
  return response.data.data;
}

export async function getBusinessServices(businessId: string) {
  const response = await api.get<ApiEnvelope<ServiceItem[]>>(`/services/business/${businessId}`);
  return response.data.data;
}

export async function createService(payload: ServiceInput) {
  const response = await api.post<ApiEnvelope<ServiceItem>>('/services', payload);
  return response.data.data;
}

export async function removeService(id: string) {
  const response = await api.delete<ApiEnvelope<{ id: string; removed: boolean }>>(`/services/${id}`);
  return response.data.data;
}

export async function createOrderRequest(payload: CreateOrderInput) {
  const response = await api.post<ApiEnvelope<OrderDetails>>('/orders', payload);
  return response.data.data;
}

export async function getCustomerOrders() {
  const response = await api.get<ApiEnvelope<{ customerId: string; items: OrderListItem[] }>>('/orders');
  return response.data.data.items;
}

export async function getOrderDetails(id: string) {
  const response = await api.get<ApiEnvelope<OrderDetails>>(`/orders/${id}`);
  return response.data.data;
}

export async function cancelOrderRequest(id: string) {
  const response = await api.post<ApiEnvelope<{ id: string; status: string }>>(`/orders/${id}/cancel`);
  return response.data.data;
}

export async function getBusinessOrders() {
  const response = await api.get<ApiEnvelope<{ filters: Record<string, string | undefined>; items: OrderListItem[] }>>(
    '/business/orders',
  );
  return response.data.data.items;
}

export async function updateBusinessOrderStatus(id: string, status: OrderListItem['status']) {
  const response = await api.patch<ApiEnvelope<{ orderId: string; status: string }>>(
    `/business/orders/${id}/status`,
    { status },
  );
  return response.data.data;
}

export async function getAdminOrders() {
  const response = await api.get<ApiEnvelope<{ filters: Record<string, string | undefined>; items: OrderListItem[] }>>(
    '/admin/orders',
  );
  return response.data.data.items;
}

export const dashboardMetrics: Record<AppRole, DashboardMetric[]> = {
  customer: [
    { label: 'Active Orders', value: '0', trend: 'No real orders yet', tone: 'blue' },
    { label: 'Monthly Savings', value: '₹0', trend: 'No active subscription yet', tone: 'green' },
    { label: 'Pickup Reliability', value: '--', trend: 'Real data appears after deliveries', tone: 'purple' },
  ],
  business: [
    { label: 'Orders Today', value: '0', trend: 'Waiting for real orders', tone: 'blue' },
    { label: 'Revenue', value: '₹0', trend: 'No completed orders yet', tone: 'green' },
    { label: 'Riders Active', value: '0', trend: 'Add riders to start dispatching', tone: 'orange' },
  ],
  admin: [
    { label: 'Platform GMV', value: '₹0', trend: 'No delivered orders yet', tone: 'green' },
    { label: 'Active Businesses', value: '0', trend: 'Approve real businesses to see growth', tone: 'blue' },
    { label: 'Commissions', value: '₹0', trend: 'Commission starts after deliveries', tone: 'orange' },
  ],
};
