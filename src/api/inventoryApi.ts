import type { InventoryItem } from "../types/inventory"
import type { InventoryPayload } from "../types/inventoryPayload"

// Kiểu dữ liệu trả về từ API (snake_case)
// type ApiInventory = {
//   PRODUCT_CD: string;
//   DivisionCD: string;
//   PRODUCTKIND_CD: string;
//   DepartmentCD: string;
//   PRODUCT_NM: string;
//   PRODUCT_NM_ENG: string;
//   PRODUCT_NM_KOR: string;
//   InboundUnitCD: string;
//   OutboundUnitCD: string;
//   materialInputUnitCD: string;
//   StockUnitCD: string;
//   InboundQuantity: number;
//   OutboundQuantity: number;
//   MaterialInputQuantity: number;
//   StoreCD: string;
//   StandardCD: string;
//   FitnessStock: string;
//   UnitPrice: string;
//   FcUnitPirce: string;
//   ExRate: string;
//   lblCCType: string;
//   lblFCType: string;
//   txtSummary: string;
//   rgUseNotUse: string;
//   HaveChildBOM: string;
//   Origin: string;
// }

export function mapApiInventory(apiData: InventoryItem): InventoryPayload{
  return {
    DivisionCD: apiData.DIVISION_CD || "",
    PRODUCTKIND_CD: apiData.PRODUCTKIND_CD || "",
    DepartmentCD: apiData.DEPARTMENT_CD || "",
    PRODUCT_CD: apiData.PRODUCT_CD || "",
    PRODUCT_NM: apiData.PRODUCT_NM || "",
    PRODUCT_NM_ENG: apiData.PRODUCT_NM_ENG || "",
    PRODUCT_NM_KOR: apiData.PRODUCT_NM_KOR || "",
    InboundUnitCD: "",
    OutboundUnitCD: "",
    materialInputUnitCD: "",
    StockUnitCD: "",
    InboundQuantity: apiData.INBOUND_QUANTITY || 0,
    OutboundQuantity: apiData.OUTBOUND_QUANTITY || 0,
    MaterialInputQuantity: apiData.MATERIALINPUT_QUANTITY || 0,
    StoreCD: apiData.STORE_CD || "",
    StandardCD: apiData.STANDARD_CD || "",
    FitnessStock: apiData.FITNESS_STOCK || 0,
    UnitPrice: apiData.UNIT_PRICE_CC || 0,
    FcUnitPirce: apiData.UNIT_PRICE_FC || 0,
    ExRate: apiData.EX_RATE || 0,
    lblCCType: apiData.CC_TYPE || "",
    lblFCType: apiData.FC_TYPE || "",
    txtSummary: apiData.SUMMARY || "",
    rgUseNotUse: apiData.ISUSE || "",
    HaveChildBOM: "",
    Origin: apiData.ORIGIN || "",
  }
}

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_BASE_URL = '/api' // Sử dụng proxy của Vite cho đường dẫn API // NHUT TEST
const API_PRODUCT = `${API_BASE_URL}/api/ProductInfo`;

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function deleteInventory(productCode: string): Promise<{ status: string; messages?: string[] }> {
  const response = await fetch(`${API_PRODUCT}/delete`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ Lag: "VIET", PRODUCT_CD: productCode }),
  });
  const result = await response.json().catch(() => ({}))
  if (!response.ok) { 
    const msg = result?.messages?.[0] || "Không thể xóa hàng tồn kho";
    throw new Error(msg);
  }
  return { status: "success", messages: result?.messages };
}

export async function insertInventory(payload: InventoryPayload): Promise<{ status: string; messages?: string[] }> {
  const response = await fetch(`${API_PRODUCT}/insert`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ...payload, Lag: "VIET" }),
  });

  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const msg = result?.messages?.[0] || "Không thể thêm hàng tồn kho";
    throw new Error(msg);
  }

  return { status: "success", messages: result?.messages };
}

export async function updateInventory(payload: InventoryPayload): Promise<{ status: string; messages?: string[] }> {
  const response = await fetch(`${API_PRODUCT}/update`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ...payload, Lag: "VIET" }),
  });

  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const msg = result?.messages?.[0] || "Không thể cập nhật hàng tồn kho";
    throw new Error(msg);
  }
  
  return { status: "success", messages: result?.messages };
}

export async function getAllInventory(): Promise<{ status: string; data?: InventoryItem[]; messages?: string[] }> {
  const response = await fetch(`${API_PRODUCT}/getDataProduct`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (!response.ok) {
    const msg = result?.messages?.[0] || "Không thể lấy danh sách hàng tồn kho";
    throw new Error(msg);
  }

  return {
    status: "success",
    data: Array.isArray(result.result) ? result.result.map(mapApiInventory) : [],
    messages: result?.messages
  };
}
