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

export interface OtpAuthPayload {
  recipient: string;
  otp: string;
}

export interface SendOtpPayload {
  recipient: string;
  channel: 'phone' | 'email';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AppRole;
  address?: string | null;
  city?: string | null;
  pincode?: string | null;
  profileImage?: string | null;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
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

export interface BusinessStats {
  businessId: string;
  totalOrders: number;
  revenue: number;
  pendingOrders: number;
  activeRiders: number;
}

export interface BusinessInput {
  businessName: string;
  address: string;
  city: string;
  pincode: string;
  gstNumber?: string;
}

export interface BusinessRegistrationFormInput {
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
  serviceArea: string;
  businessType: 'laundry' | 'dry_clean';
  idProof: File;
  shopImage: File;
}

export interface BusinessRegistrationResponse {
  id: string;
  name: string;
  owner: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AdminBusinessRegistrationItem {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
  serviceArea: string;
  businessType: 'laundry' | 'dry_clean';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  documents: {
    idProofUrl: string | null;
    shopImageUrl: string | null;
  };
}

export interface AdminBusinessApprovalResult {
  registrationId: string;
  status: 'approved' | 'rejected';
  businessId?: string;
  loginPhone?: string;
  loginMode?: 'otp';
  businessPortalEnabled?: boolean;
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

export interface BusinessOrderListItem extends OrderListItem {
  items: OrderItem[];
}

export interface CouponItem {
  id: string;
  businessId?: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  validFrom: string;
  validTill: string;
  isActive: boolean;
}

export interface CouponInput {
  businessId?: string;
  code: string;
  discountType: CouponItem['discountType'];
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  validFrom: string;
  validTill: string;
}

export interface CreateOrderInput {
  businessId: string;
  pickupSlot: string;
  deliverySlot: string;
  pickupDate: string;
  deliveryDate: string;
  pickupAddress?: string;
  contactPhone?: string;
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

export async function registerWithOtpRequest(payload: RegisterPayload & OtpAuthPayload) {
  const response = await api.post<ApiEnvelope<AuthResponse>>('/auth/register-otp', payload);
  return response.data.data;
}

export async function meRequest() {
  const response = await api.get<ApiEnvelope<AuthUser>>('/auth/me');
  return response.data.data;
}

export async function loginWithOtpRequest(payload: OtpAuthPayload) {
  const response = await api.post<ApiEnvelope<AuthResponse>>('/auth/login-otp', payload);
  return response.data.data;
}

export async function sendOtpRequest(payload: SendOtpPayload) {
  const response = await api.post<ApiEnvelope<{ recipient: string; channel: string; expiresInMinutes: number }>>(
    '/auth/send-otp',
    payload,
  );
  return response.data.data;
}

export async function verifyOtpRequest(payload: OtpAuthPayload & { channel: 'phone' | 'email' }) {
  const response = await api.post<ApiEnvelope<{ recipient: string; verified: boolean }>>('/auth/verify-otp', payload);
  return response.data.data;
}

export async function getProfileRequest() {
  const response = await api.get<ApiEnvelope<UserProfile>>('/users/profile');
  return response.data.data;
}

export async function updateProfileRequest(payload: UpdateProfilePayload) {
  const response = await api.patch<ApiEnvelope<UserProfile>>('/users/profile', payload);
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

export async function getBusinessStatsRequest(businessId: string) {
  const response = await api.get<ApiEnvelope<BusinessStats>>(`/businesses/${businessId}/stats`);
  return response.data.data;
}

export async function createBusiness(payload: BusinessInput) {
  const response = await api.post<ApiEnvelope<Business>>('/businesses', payload);
  return response.data.data;
}

export async function submitBusinessRegistrationRequest(payload: BusinessRegistrationFormInput) {
  const formData = new FormData();
  formData.append('businessName', payload.businessName);
  formData.append('ownerName', payload.ownerName);
  formData.append('phone', payload.phone);
  formData.append('address', payload.address);
  formData.append('serviceArea', payload.serviceArea);
  formData.append('businessType', payload.businessType);
  formData.append('idProof', payload.idProof);
  formData.append('shopImage', payload.shopImage);

  const response = await api.post<ApiEnvelope<BusinessRegistrationResponse>>('/business/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}

export async function getAdminBusinesses() {
  const response = await api.get<ApiEnvelope<Business[]>>('/admin/businesses');
  return response.data.data;
}

export async function getAdminBusinessRegistrations() {
  const response = await api.get<ApiEnvelope<AdminBusinessRegistrationItem[]>>('/admin/business-registrations');
  return response.data.data;
}

export async function getAdminBusinessRegistrationDetails(id: string) {
  const response = await api.get<ApiEnvelope<AdminBusinessRegistrationItem>>(`/admin/business-registrations/${id}`);
  return response.data.data;
}

export async function approveBusinessRegistrationRequest(id: string) {
  const response = await api.patch<ApiEnvelope<AdminBusinessApprovalResult>>(`/business/${id}/approve`);
  return response.data.data;
}

export async function rejectBusinessRegistrationRequest(id: string) {
  const response = await api.patch<ApiEnvelope<AdminBusinessApprovalResult>>(`/business/${id}/reject`);
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

export async function updateServiceRequest(id: string, payload: Partial<ServiceInput>) {
  const response = await api.patch<ApiEnvelope<ServiceItem>>(`/services/${id}`, payload);
  return response.data.data;
}

export async function removeService(id: string) {
  const response = await api.delete<ApiEnvelope<{ id: string; removed: boolean }>>(`/services/${id}`);
  return response.data.data;
}

export async function createOrderRequest(payload: CreateOrderInput) {
  const notes = [
    payload.pickupAddress ? `Pickup Address: ${payload.pickupAddress}` : '',
    payload.contactPhone ? `Contact Phone: ${payload.contactPhone}` : '',
    payload.specialInstructions ?? '',
  ]
    .filter(Boolean)
    .join(' | ');

  const response = await api.post<ApiEnvelope<OrderDetails>>('/orders', {
    businessId: payload.businessId,
    pickupSlot: payload.pickupSlot,
    deliverySlot: payload.deliverySlot,
    pickupDate: payload.pickupDate,
    deliveryDate: payload.deliveryDate,
    items: payload.items,
    couponCode: payload.couponCode,
    specialInstructions: notes || undefined,
  });
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
  const response = await api.get<ApiEnvelope<{ filters: Record<string, string | undefined>; items: BusinessOrderListItem[] }>>(
    '/business/orders',
  );
  return response.data.data.items;
}

export async function updateBusinessOrderStatus(id: string, status: OrderListItem['status']) {
  const response = await api.patch<ApiEnvelope<{ orderId: string; status: string }>>(
    `/orders/${id}/status`,
    { status },
  );
  return response.data.data;
}

export async function getCouponsRequest() {
  const response = await api.get<ApiEnvelope<CouponItem[]>>('/coupons');
  return response.data.data;
}

export async function createCouponRequest(payload: CouponInput) {
  const response = await api.post<ApiEnvelope<CouponItem>>('/coupons', payload);
  return response.data.data;
}

export async function updateCouponRequest(id: string, payload: CouponInput) {
  const response = await api.patch<ApiEnvelope<CouponItem>>(`/coupons/${id}`, payload);
  return response.data.data;
}

export async function removeCouponRequest(id: string) {
  const response = await api.delete<ApiEnvelope<{ id: string; deleted: boolean }>>(`/coupons/${id}`);
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
