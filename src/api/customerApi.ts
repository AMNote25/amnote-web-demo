import type { CustomerItem } from "../types/customer"
import type { CustomerPayload } from "../types/customerPayload"

type ApiCustomer = {
  CUSTOMER_CD: string
  CATEGORY_CD: string
  CUSTOMER_TYPE: string
  CUSTOMER_NM: string
  CUSTOMER_NM_EN: string
  CUSTOMER_NM_KOR: string
  BUYER_NM: string
  CUSTOMER_USER_CD: string
  TAX_CD: string
  BANK_CD: string
  OWNER_NM: string
  BUSINESS_TYPE: string
  KIND_BUSINESS: string
  TEL: string
  FAX: string
  ZIP_CD: string
  ADDRESS: string
  EMAIL: string
}

function mapApiCustomer(apiData: ApiCustomer): CustomerItem {
  return {
    CustomerCD: apiData.CUSTOMER_CD || "",
    CategoryCD: apiData.CATEGORY_CD || "",
    CustomerType: apiData.CUSTOMER_TYPE || "",
    CustomerNM: apiData.CUSTOMER_NM || "",
    CustomerNM_EN: apiData.CUSTOMER_NM_EN || "",
    CustomerNM_KOR: apiData.CUSTOMER_NM_KOR || "",
    BuyerNM: apiData.BUYER_NM || "",
    CustomerUserCD: apiData.CUSTOMER_USER_CD || "",
    TaxCD: apiData.TAX_CD || "",
    BankCD: apiData.BANK_CD || "",
    OwnerNM: apiData.OWNER_NM || "",
    BusinessType: apiData.BUSINESS_TYPE || "",
    KindBusiness: apiData.KIND_BUSINESS || "",
    Tel: apiData.TEL || "",
    Fax: apiData.FAX || "",
    ZipCD: apiData.ZIP_CD || "",
    Address: apiData.ADDRESS || "",
    Email: apiData.EMAIL || "",
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_CUSTOMER = `${API_BASE_URL}/api/CustomerInfo`;

export async function getAllCustomer(): Promise<{ status: string; data?: CustomerItem[]; messages?: string[] }> {
  const token = localStorage.getItem("access_token")

  const response = await fetch(`${API_CUSTOMER}/getAllCustomer`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    // const msg = result?.messages?.[0] || "Không thể lấy danh sách khách hàng";
    // throw new Error(msg)
    return { status: result.status, messages: result?.messages || "Không thể lấy danh sách khách hàng" }
  }

  return {
    status: "success",
    data: Array.isArray(result.result) ? result.result.map(mapApiCustomer) : [],
    messages: result?.messages
  }
}

export async function deleteCustomer(customerCode: string): Promise<{ status: string; messages?: string[] }> {
  const token = localStorage.getItem("access_token")

  const response = await fetch(`${API_CUSTOMER}/delete`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      Lag: "VIET",
      CustomerCD: customerCode 
    }),
  })

  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    // const msg = result?.messages?.[0] || "Không thể xóa khách hàng"
    // throw new Error(msg)
    return { status: result.status, messages: result?.messages || "Không thể xóa khách hàng" }
  }

  return { status: "success", messages: result?.messages }
}

export async function insertCustomer(data: CustomerPayload): Promise<{ status: string; messages?: string[] }> {
  const token = localStorage.getItem("access_token")

  const response = await fetch(`${API_CUSTOMER}/insert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...data, Lag: "VIET" }),
  })

  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    // const msg = result?.messages?.[0] || "Không thể thêm khách hàng";
    // throw new Error(msg);
    return { status: result.status, messages: result?.messages?.[0] || "Không thể thêm khách hàng" }
  }

  return { status: "success", messages: result?.messages }
}

export async function updateCustomer(data: CustomerPayload): Promise<{ status: string; messages?: string[] }> {
  const token = localStorage.getItem("access_token")

  console.log("Update Customer Payload:", { ...data, Lag: "VIET" }); // NHUT TEST

  const response = await fetch(`${API_CUSTOMER}/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...data, Lag: "VIET" }),
  })

  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    return { status: result.status, messages: result?.messages || "Không thể cập nhật khách hàng" }
  }
  
  return { status: "success", messages: result?.messages }
}