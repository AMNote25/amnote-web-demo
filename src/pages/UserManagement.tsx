import type { InventoryItem } from "../types/inventory"
import { getAllInventory } from "../api/inventoryApi"
import React, { useState, useEffect } from "react"
import 'devextreme/dist/css/dx.material.blue.light.css'; // theme
import DataGrid, { ColumnChooser, ColumnChooserSearch, Position, ColumnChooserSelection, Column, Paging, Pager, FilterPanel, FilterRow, HeaderFilter, SearchPanel, Scrolling } from 'devextreme-react/data-grid';
import { RequiredRule, Editing } from 'devextreme-react/data-grid';
import type { RowInsertingEvent, RowUpdatingEvent, RowRemovingEvent } from "devextreme/ui/data_grid";
import { insertInventory, updateInventory ,deleteInventory } from "../api/inventoryApi";
import NotificationModal, { type NotificationType } from "../components/NotificationModal";
// import { TextBox } from 'devextreme-react/text-box';
// import { Validator } from 'devextreme-react/validator';

const pageSizes = [10, 20, 50, 100];

const UserManagement: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [notification, setNotification] = useState<{
      isOpen: boolean
      type: NotificationType
      title: string
      message: string
    }>({
      isOpen: false,
      type: "success",
      title: "",
      message: "",
    })

  // Đóng thông báo notification
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }))
  }

  // Lấy danh sách inventory khi component mount
  useEffect(() => {
    setLoading(true)
    getAllInventory()
      .then((data) => {
      const itemsWithDefault = (data.data || []).map(item => ({
        ...item
      }));
      setItems(itemsWithDefault);
    })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  type RowInsertingEventWithPromise = RowInsertingEvent & { promise?: Promise<void> };

  const onRowInserting = (e: RowInsertingEventWithPromise) => {
    e.promise = (async () => {
      try {
        const result = await insertInventory(e.data);
        if (result.status === "success") {
          setNotification({
            isOpen: true,
            type: "success",
            title: "Thành công!",
            message: "Đã thêm hàng tồn kho thành công!",
          });
          const data = await getAllInventory();
          setItems(data.data || []);
        } else {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Thất bại!",
            message: result.messages?.join("\n") || "Có lỗi xảy ra khi thêm hàng tồn kho!",
          });
          e.cancel = true;
        }
      } catch (error) {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Thất bại!",
          message: error instanceof Error ? error.message : "Có lỗi xảy ra khi thêm hàng tồn kho!",
        });
        e.cancel = true;
      }
    })();
  };

  // Cập nhật dữ liệu khi có thay đổi
  const onRowUpdating = async (e: RowUpdatingEvent) => {
    try {
      const result = await updateInventory({ ...e.oldData, ...e.newData });
      if (result.status === "success") {
        setNotification({
          isOpen: true,
          type: "success",
          title: "Thành công!",
          message: "Đã cập nhật khách hàng thành công!",
        });
      } else {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Thất bại!",
          message: "Có lỗi xảy ra khi cập nhật khách hàng!",
        });
        e.cancel = true
      }

      const data = await getAllInventory();
      setItems(data.data || []);
    } catch (error) {
      console.error("Update error:", error);
      setNotification({
        isOpen: true,
        type: "error",
        title: "Thất bại!",
        message: error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật khách hàng!",
      });
      e.cancel = true;
      
      const data = await getAllInventory();
      setItems(data.data || []);
    }
  };

  const onRowRemoving = async (e: RowRemovingEvent) => {
    try {
      await deleteInventory(e.data.PRODUCT_CD);
      const data = await getAllInventory();
      setItems(data.data || []);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <>
      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={closeNotification}
      />
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
        hoverStateEnabled={true}
        loadPanel={{ enabled: loading }}
        columnWidth={200}
        // Đăng ký đúng type cho handler
        onRowInserting={(onRowInserting as unknown) as (e: RowInsertingEvent) => void}
        onRowUpdating={onRowUpdating}
        onRowRemoving={onRowRemoving}
        allowColumnReordering={false}
        rowAlternationEnabled={false}
        onEditorPreparing={e => {
          if (e.dataField === "PRODUCT_CD" && e.parentType === "dataRow") {
            if (e.row?.isNewRow) {
              e.editorOptions.readOnly = false;
            } else {
              e.editorOptions.readOnly = true;
            }
          }
        }}
      >
        <SearchPanel visible={true} width={240} placeholder="Tìm kiếm..." />

        <ColumnChooser
          height='340px'
          enabled={true}
          mode="select"
        >
          <Position
            my="right top"
            at="right bottom"
            of=".dx-datagrid-column-chooser-button"
          />

          <ColumnChooserSearch
            enabled={true}
            editorOptions={true} />

          <ColumnChooserSelection
            allowSelectAll={true}
            selectByClick={true}
            recursive={true} />
        </ColumnChooser>
        
        <HeaderFilter visible={true} />
        <FilterRow visible={true} />
        <FilterPanel visible={true} />

        <Paging defaultPageSize={10} />
        <Pager
          visible={true}
          allowedPageSizes={pageSizes}
          showPageSizeSelector={true}
        />
        <Column 
          dataField="PRODUCT_CD" 
          caption="Mã sản phẩm" 
           >
          <RequiredRule />
        </Column>
        <Column dataField="PRODUCT_NM" caption="Tên sản phẩm" ><RequiredRule /></Column>
        <Column dataField="PRODUCT_NM_ENG" caption="Tên sản phẩm (EN)" ></Column>
        <Column dataField="PRODUCT_NM_KOR" caption="Tên sản phẩm (KOR)" ></Column>
        <Column dataField="DIVISION_CD" caption="Mã bộ phận" visible={false}></Column>
        <Column dataField="PRODUCTKIND_CD" caption="Mã loại sản phẩm" ><RequiredRule /></Column>
        <Column dataField="DEPARTMENT_CD" caption="Mã phòng ban" visible={false}></Column>
        <Column dataField="InboundUnitCD" caption="MDV nhập kho" visible={false}></Column>
        <Column dataField="OutboundUnitCD" caption="MDV xuất kho" visible={false}></Column>
        <Column dataField="materialInputUnitCD" caption="MDV nhập nguyên liệu" visible={false}></Column>
        <Column dataField="StockUnitCD" caption="MDV tồn kho" ><RequiredRule /></Column>
        <Column 
          dataField="INBOUND_QUANTITY" 
          caption="SL nhập kho"
          allowFiltering={true}
          filterOperations={['=', '<', '>', 'between']}
        >
        </Column>
        <Column 
          dataField="OUTBOUND_QUANTITY" 
          caption="SL xuất kho"
          allowFiltering={true}
          filterOperations={['=', '<', '>', 'between']}
        >
        </Column>
        <Column 
          dataField="MATERIALINPUT_QUANTITY" 
          caption="SL nhập nguyên liệu"
          allowFiltering={true}
          filterOperations={['=', '<', '>', 'between']}
        >
        </Column>
        <Column dataField="STORE_CD" caption="Mã kho" ><RequiredRule /></Column>
        <Column dataField="STANDARD_CD" caption="Mã tiêu chuẩn" ></Column>
        <Column dataField="FITNESS_STOCK" caption="SL tồn kho phù hợp" ></Column>
        <Column dataField="UNIT_PRICE_CC" caption="Đơn giá trong nước" ></Column>
        <Column dataField="UNIT_PRICE_FC" caption="Đơn giá ngoại tệ" ></Column>
        <Column dataField="EX_RATE" caption="Tỷ giá" ></Column>
        <Column dataField="CC_TYPE" caption="Loại tiền trong nước" ></Column>
        <Column dataField="lblFCType" caption="Loại tiền ngoại tệ" ></Column>
        <Column dataField="SUMMARY" caption="Tóm tắt" ></Column>
        <Column dataField="ISUSE" caption="Trạng thái" ></Column>
        <Column dataField="HaveChildBOM" caption="BOM con" visible={false}></Column>
        <Column dataField="ORIGIN" caption="Xuất xứ" ></Column>
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