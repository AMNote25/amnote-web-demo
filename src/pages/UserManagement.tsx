import type { InventoryItem } from "../types/inventory"
import { getAllInventory } from "../api/inventoryApi"
import React, { useState, useEffect } from "react"
import 'devextreme/dist/css/dx.material.blue.light.css'; // theme
import DataGrid, { Column, Paging, FilterRow, HeaderFilter, SearchPanel, Scrolling } from 'devextreme-react/data-grid';
import { RequiredRule, Editing } from 'devextreme-react/data-grid';
// import { TextBox } from 'devextreme-react/text-box';
// import { Validator } from 'devextreme-react/validator';

// interface User {
//   id: number;
//   name: string;
//   email: string;
// }

// const users: User[] = [
//   { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com' },
//   { id: 2, name: 'Trần Thị B', email: 'b@example.com' },
//   { id: 3, name: 'Lê Văn C', email: 'c@example.com' },
// ];

// interface Inventory {
//   PRODUCT_CD: string;
//   PRODUCT_NM: string;
//   PRODUCT_NM_ENG: string;
//   DIVISION_CD: string; // DivisionCD
//   PRODUCTKIND_CD: string;
//   DEPARTMENT_CD: string; // DepartmentCD
//   INBOUND_QUANTITY: number; // InboundQuantity
//   OUTBOUND_QUANTITY: number; // OutboundQuantity
//   MATERIALINPUT_QUANTITY: number; // MaterialInputQuantity
//   STORE_CD: string; // StoreCD
//   STANDARD_CD: string; // StandardCD
//   FITNESS_STOCK: number; // FitnessStock
//   UNIT_PRICE_CC: number; // UnitPrice
//   UNIT_PRICE_FC: number; // FcUnitPirce
//   EX_RATE: number; // ExRate
//   CC_TYPE: string // lblCCType - Loại tiền trong nước
//   FC_TYPE: string // lblFCType - Loại tiền nước ngoài
//   SUMMARY: string; // txtSummary - Ghi chú/tóm tắt
//   ISUSE: string // rgUseNotUse - Trạng thái sử dụng (0: Không sử dụng, 1: Sử dụng)
//   ORIGIN: string // Origin - Xuất xứ
//   InboundUnitCD: string; // CHỈ CÓ TRONG API POST/UPDATE
//   OutboundUnitCD: string; // CHỈ CÓ TRONG API POST/UPDATE
//   materialInputUnitCD: string; // CHỈ CÓ TRONG API POST/UPDATE
//   StockUnitCD: string; // CHỈ CÓ TRONG API POST/UPDATE
//   HaveChildBOM: string; // CHỈ CÓ TRONG API POST/UPDATE
// }



const UserManagement: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<InventoryItem[]>([])

  // Lấy danh sách inventory khi component mount
  useEffect(() => {
    setLoading(true)
    getAllInventory()
      .then((data) => setItems(data.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      {/* <TextBox
        id="address"
        stylingMode="outlined"
        hoverStateEnabled={false}
        // focusStateEnabled={false}
      >
        <Validator>
          <RequiredRule />
        </Validator>
      </TextBox> */}

      <DataGrid
        dataSource={items}
        keyExpr="PRODUCT_CD"
        showBorders={true}
        hoverStateEnabled={true}                          // Hiển thị hiệu ứng hover khi di chuột
        loadPanel={{ enabled: loading }}                  // Hiển thị loading khi đang tải dữ liệu
        // columnAutoWidth={true}
        columnWidth={200}

        allowColumnReordering={false}                     // Cho phép kéo thả cột để thay đổi vị trí của cột
        rowAlternationEnabled={false}                     // true để có màu nền xen kẽ
      >
        <SearchPanel visible={true} width={240} placeholder="Tìm kiếm..." />
        <FilterRow visible={true} />
        <HeaderFilter visible={true} />
        <Paging defaultPageSize={10} />
        <Column dataField="PRODUCT_CD" caption="Mã sản phẩm" allowEditing={false} ><RequiredRule /></Column>
        <Column dataField="PRODUCT_NM" caption="Tên sản phẩm" ><RequiredRule /></Column>
        <Column dataField="PRODUCT_NM_ENG" caption="Tên sản phẩm (EN)" visible={false}><RequiredRule /></Column>
        <Column dataField="PRODUCT_NM_KOR" caption="Tên sản phẩm (KOR)" visible={false}><RequiredRule /></Column>
        <Column dataField="DIVISION_CD" caption="Mã bộ phận" ><RequiredRule /></Column>
        <Column dataField="PRODUCTKIND_CD" caption="Mã loại sản phẩm" ><RequiredRule /></Column>
        <Column dataField="DEPARTMENT_CD" caption="Mã phòng ban" ><RequiredRule /></Column>
        <Column dataField="InboundUnitCD" caption="MDV nhập kho" ><RequiredRule /></Column>
        <Column dataField="OutboundUnitCD" caption="MDV xuất kho" visible={false}><RequiredRule /></Column>
        <Column dataField="materialInputUnitCD" caption="MDV nhập nguyên liệu" visible={false}><RequiredRule /></Column>
        <Column dataField="StockUnitCD" caption="MDV tồn kho" visible={false}><RequiredRule /></Column>
        <Column dataField="INBOUND_QUANTITY" caption="SL nhập kho" ><RequiredRule /></Column>
        <Column dataField="OUTBOUND_QUANTITY" caption="SL xuất kho" ><RequiredRule /></Column>
        <Column dataField="MATERIALINPUT_QUANTITY" caption="SL nhập nguyên liệu" ><RequiredRule /></Column>
        <Column dataField="STORE_CD" caption="Mã kho" ><RequiredRule /></Column>
        <Column dataField="STANDARD_CD" caption="Mã tiêu chuẩn" ><RequiredRule /></Column>
        <Column dataField="FITNESS_STOCK" caption="SL tồn kho phù hợp" ><RequiredRule /></Column>
        <Column dataField="UNIT_PRICE_CC" caption="Đơn giá trong nước" ><RequiredRule /></Column>
        <Column dataField="UNIT_PRICE_FC" caption="Đơn giá ngoại tệ" ><RequiredRule /></Column>
        <Column dataField="EX_RATE" caption="Tỷ giá" ><RequiredRule /></Column>
        <Column dataField="CC_TYPE" caption="Loại tiền trong nước" ><RequiredRule /></Column>
        <Column dataField="lblFCType" caption="Loại tiền ngoại tệ" ><RequiredRule /></Column>
        <Column dataField="SUMMARY" caption="Tóm tắt" ><RequiredRule /></Column>
        <Column dataField="ISUSE" caption="Trạng thái" ><RequiredRule /></Column>
        <Column dataField="HaveChildBOM" caption="BOM con" visible={false}><RequiredRule /></Column>
        <Column dataField="ORIGIN" caption="Xuất xứ" ><RequiredRule /></Column>
        <Scrolling columnRenderingMode="virtual" />
        <Editing
            mode="popup"
            allowUpdating={true}
            allowDeleting={true}
            allowAdding={true}
        />
      </DataGrid>
      
    </>
  );
};

export default UserManagement;