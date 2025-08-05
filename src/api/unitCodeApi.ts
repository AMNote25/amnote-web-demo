import type { UnitCodeItem } from "../types/unitCode";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = '/api' // Sử dụng proxy của Vite cho đường dẫn API // NHUT TEST
const API_UNITCODE = `${API_BASE_URL}/api/ProductUnitInfo`;

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getAllUnitCode(): Promise<{ status: string; data: UnitCodeItem[]; messages?: string[] }> {
  try {
    console.log("🚀 Calling API:", `${API_UNITCODE}/getAll?Lag=VIET`);
    const response = await fetch(`${API_UNITCODE}/getAll?Lag=VIET`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    console.log("📡 Response status:", response.status, response.statusText);
    console.log("📡 Response headers:", response.headers);

    const result = await response.json();
    console.log("📦 getAllUnitCode result:", result);
    
    if (!response.ok) {
      console.error("❌ API Error:", {
        status: response.status,
        statusText: response.statusText,
        result: result
      });
      const msg = result?.messages?.[0] || "Không thể lấy danh sách hàng đơn vị";
      throw new Error(msg);
    }

    return {
      status: "success",
      data: Array.isArray(result.result) ? result.result.map((item: UnitCodeItem) => ({
        UNIT_CD: item.UNIT_CD || "",
        UNIT_NM: item.UNIT_NM || "",
        ISDEL: item.ISDEL || "0",
        USERID: item.USERID || "",
      })) : [],
      messages: result?.messages
    };
  } catch (error) {
    console.error("💥 getAllUnitCode Error:", error);
    throw error;
  }
}

export async function insertUnitCode(productUnitName: string): Promise<{ status: string; messages?: string[] }> {
  const response = await fetch(`${API_UNITCODE}/insert`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ Lag: "VIET", productUnitName }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = result?.messages?.[0] || "Không thể thêm đơn vị";
    throw new Error(msg);
  }
  return { status: "success", messages: result?.messages };
}

export async function updateUnitCode(productUnitCD: string, productUnitName: string): Promise<{ status: string; messages?: string[] }> {
  const response = await fetch(`${API_UNITCODE}/update`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ Lag: "VIET", productUnitCD, productUnitName }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = result?.messages?.[0] || "Không thể cập nhật đơn vị";
    throw new Error(msg);
  }
  return { status: "success", messages: result?.messages };
}

export async function deleteUnitCode(productUnitCD: string): Promise<{ status: string; messages?: string[] }> {
  const response = await fetch(`${API_UNITCODE}/delete`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ Lag: "VIET", productUnitCD }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = result?.messages?.[0] || "Không thể xóa đơn vị";
    throw new Error(msg);
  }
  return { status: "success", messages: result?.messages };
}
