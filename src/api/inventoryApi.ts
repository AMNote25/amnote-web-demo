import type { InventoryItem } from "../types/inventory"
import type { InventoryPayload } from "../types/inventoryPayload"

// Kiểu dữ liệu trả về từ API (snake_case)
type ApiInventory = {
  PRODUCT_CD: string;
  DivisionCD: string;
  PRODUCTKIND_CD: string;
  DepartmentCD: string;
  PRODUCT_NM: string;
  PRODUCT_NM_ENG: string;
  PRODUCT_NM_KOR: string;
  InboundUnitCD: string;
  OutboundUnitCD: string;
  materialInputUnitCD: string;
  StockUnitCD: string;
  InboundQuantity: number;
  OutboundQuantity: number;
  MaterialInputQuantity: number;
  StoreCD: string;
  StandardCD: string;
  FitnessStock: string;
  UnitPrice: string;
  FcUnitPirce: string;
  ExRate: string;
  lblCCType: string;
  lblFCType: string;
  txtSummary: string;
  rgUseNotUse: string;
  HaveChildBOM: string;
  Origin: string;
}

function mapApiInventory(apiData: ApiInventory): InventoryItem {
  return {
    DIVISION_CD: apiData.DivisionCD || "",
    DIVISION_NM: "", // Không có trong payload, cần bổ sung nếu API trả về
    PRODUCTKIND_CD: apiData.PRODUCTKIND_CD || "",
    PRODUCTKIND_NM: "", // Không có trong payload
    PRODUCTKIND_NM_ENG: "", // Không có trong payload
    PRODUCTKIND_NM_KOR: "", // Không có trong payload
    PRODUCTKIND_NM_CHINA: "", // Không có trong payload
    PTK_SORT: 0, // Không có trong payload
    DEPARTMENT_CD: apiData.DepartmentCD || "",
    DEPARTMENT_USER_CD: null, // Không có trong payload
    DEP_NAME_KOR: "", // Không có trong payload
    DEP_NAME_ENG: "", // Không có trong payload
    DEP_NAME_VIET: "", // Không có trong payload
    DEP_NAME_JAPAN: "", // Không có trong payload
    DEP_NAME_CHINA: "", // Không có trong payload
    PRODUCT_CD: apiData.PRODUCT_CD || "",
    PRODUCT_NM: apiData.PRODUCT_NM || "",
    PRODUCT_NM_ENG: apiData.PRODUCT_NM_ENG || "",
    PRODUCT_NM_KOR: apiData.PRODUCT_NM_KOR || "",
    PRODUCT_NM_CHINA: "", // Không có trong payload
    PRODUCT_CODE: "", // Không có trong payload
    MR_CD: "", // Không có trong payload
    INBOUND_UNIT: apiData.InboundUnitCD || "",
    IN_UNIT: null, // Không có trong payload
    OUTBOUND_UNIT: apiData.OutboundUnitCD || "",
    OUT_UNIT: null, // Không có trong payload
    MATERIALINPUT_UNIT: apiData.materialInputUnitCD || "",
    MATERIALUNIT_UNIT: null, // Không có trong payload
    STOCK_UNIT: apiData.StockUnitCD || "",
    STOCKUNIT: "", // Không có trong payload
    STORE_CD: apiData.StoreCD || "",
    STORE_NM: null, // Không có trong payload
    STORE_NM_ENG: null, // Không có trong payload
    STORE_NM_KOR: null, // Không có trong payload
    STORE_NM_CHINA: null, // Không có trong payload
    FITNESS_STOCK: Number(apiData.FitnessStock) || 0,
    STANDARD_CD: apiData.StandardCD || "",
    STANDARD_NM: null, // Không có trong payload
    UNIT_PRICE_CC: Number(apiData.UnitPrice) || 0,
    UNIT_PRICE_FC: Number(apiData.FcUnitPirce) || 0,
    EX_RATE: Number(apiData.ExRate) || 0,
    SUMMARY: apiData.txtSummary || "",
    ISUSE: apiData.rgUseNotUse || "",
    USERID: "", // Không có trong payload
    CC_TYPE: apiData.lblCCType || "",
    FC_TYPE: apiData.lblFCType || "",
    INBOUND_QUANTITY: apiData.InboundQuantity ?? null,
    OUTBOUND_QUANTITY: apiData.OutboundQuantity ?? null,
    MATERIALINPUT_QUANTITY: apiData.MaterialInputQuantity ?? null,
    ORIGIN: apiData.Origin || "",
    AUDIT_NOTE: "", // Không có trong payload
    VAT_RATE: 0, // Không có trong payload
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_PRODUCT = `${API_BASE_URL}/api/ProductInfo`;

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
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
