// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_BASE_URL = '/api' // Sử dụng proxy của Vite cho đường dẫn API // NHUT TEST

export type CategoryOption = {
  FIELD_VALUE: string
  DESCFIELD: string
}

export async function getCustomerCategoryOptions(): Promise<CategoryOption[]> {
  const token = localStorage.getItem("access_token")

  const response = await fetch(`${API_BASE_URL}/api/CustomerInfo/getSelectTypeCustomer`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) throw new Error("Không thể lấy danh mục loại khách hàng")
  const data = await response.json()

  return Array.isArray(data.result) ? data.result : []
}
