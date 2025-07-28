import { useState, useMemo } from "react";
import {
  Table,
  Space,
  Button,
  Input,
  Card,
  Modal,
  Descriptions,
  Tooltip,
  Image,
} from "antd";
import { SearchOutlined, EyeOutlined, FireOutlined } from "@ant-design/icons";
import type { ColumnType } from "antd/es/table";
import {
  useMaterialProcess,
  type MaterialDto,
} from "../../../hooks/materialsApi";
import dayjs from "dayjs";

// Không cần import BarcodeScanner nữa

const MaterialProcessManagement = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialDto | null>(
    null
  );
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { data: materials, isLoading: isMaterialLoading } =
    useMaterialProcess();

  const headerColor = "#A05A2C";
  const headerBgColor = "#F9E4B7";
  const evenRowBgColor = "#FFFDF5";
  const oddRowBgColor = "#FFF7E6";
  const cellTextColor = "#5D4037";
  const borderColor = "#F5EAD9";
  const tableBorderColor = "#E9C97B";

  const handleOpenDetailModal = (record: MaterialDto) => {
    setSelectedMaterial(record);
    setIsDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedMaterial(null);
  };

  const filteredMaterials = useMemo(
    () =>
      materials?.filter((material) => {
        const matchesSearch =
          material.name.toLowerCase().includes(searchText.toLowerCase()) ||
          material.materialId?.toString().includes(searchText);
        return matchesSearch && material.isProcessExpired === true;
      }),
    [materials, searchText]
  );

  const columns: ColumnType<MaterialDto>[] = [
    {
      title: "Mã nguyên liệu",
      dataIndex: "materialId",
      key: "materialId",
      width: 120,
      sorter: (a, b) => (a.materialId ?? 0) - (b.materialId ?? 0),
    },
    {
      title: "Tên nguyên liệu",
      dataIndex: "name",
      key: "name",
      width: 150,
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => (
        <Tooltip title={name}>
          <span style={{ fontWeight: 600, color: "#D97B41" }}>{name}</span>
        </Tooltip>
      ),
    },
    {
      title: "Số ký(g)",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Hạn bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      width: 140,
      sorter: (a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)),
      render: (startDate: Date) =>
        dayjs(startDate).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      title: "Hạn kết thúc",
      dataIndex: "expireDate",
      key: "expireDate",
      width: 140,
      sorter: (a, b) => dayjs(a.expireDate).diff(dayjs(b.expireDate)),
      render: (expireDate: Date) =>
        dayjs(expireDate).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="middle" style={{ columnGap: 10 }}>
          <Tooltip title="Xem chi tiết & Quét">
            <Button
              type="primary"
              ghost
              icon={<EyeOutlined style={{ color: "#D97B41", fontSize: 17 }} />}
              onClick={() => handleOpenDetailModal(record)}
              style={{ outline: "none", boxShadow: "none", border: "none" }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFF9F0",
        padding: "20px 30px 30px 60px",
      }}
    >
      <style>{`
        .ant-table-thead > tr > th { background-color: ${headerBgColor} !important; color: ${headerColor} !important; font-weight: bold !important; border-right: 1px solid ${borderColor} !important; border-bottom: 2px solid ${tableBorderColor} !important; }
        .ant-table-thead > tr > th.ant-table-cell-fix-right:last-child { border-right: none !important; }
        .promo-table .ant-table-tbody > tr.even-row-promo > td { background-color: ${evenRowBgColor}; color: ${cellTextColor}; border-right: 1px solid ${borderColor}; border-bottom: 1px solid ${borderColor}; }
        .promo-table .ant-table-tbody > tr.odd-row-promo > td { background-color: ${oddRowBgColor}; color: ${cellTextColor}; border-right: 1px solid ${borderColor}; border-bottom: 1px solid ${borderColor}; }
        .promo-table .ant-table-tbody > tr > td:last-child:not(.ant-table-selection-column) { border-right: none; }
        .promo-table .ant-table-tbody > tr:hover > td { background-color: #FDEBC8 !important; }
        .promo-table .ant-table-cell-fix-right { background: inherit !important; }
        .promo-table .ant-table-thead > tr > th.ant-table-cell-fix-right { background-color: ${headerBgColor} !important; }
        .ant-input-number:focus, .ant-input-number-focused, .ant-input-number:hover,
        .ant-select-focused .ant-select-selector, .ant-select-selector:focus, .ant-select-selector:hover,
        .ant-picker:focus, .ant-picker:hover, .ant-input:focus, .ant-input:hover,
        .ant-input-affix-wrapper:focus, .ant-input-affix-wrapper-focused, .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper:focus-within {
          border-color: #D97B41 !important; box-shadow: none !important;
        }
        .ant-pagination .ant-pagination-item-active, .ant-pagination .ant-pagination-item-active a { border-color: #D97B41 !important; color: #D97B41 !important; }
        .ant-select-selector { border-color: #E9C97B !important; }
        .ant-select-selector:hover { border-color: #D97B41 !important; }
        .expired-row td { color: red !important; }
        .expired-row td span { color: red !important; }
      `}</style>
      <div style={{ maxWidth: 1300 }}>
        <h1
          style={{
            fontWeight: 700,
            color: "#A05A2C",
            fontSize: 36,
            marginBottom: 24,
            textAlign: "left",
          }}
        >
          Quản lý Nguyên liệu đã xử lý
          <FireOutlined />
        </h1>
        <Card
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 6px 16px rgba(30, 64, 175, 0.08)",
            padding: "16px 24px",
            border: `1px solid ${tableBorderColor}`,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              marginBottom: 24,
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Space wrap className="order-search">
              <Input
                placeholder="Tìm theo mã, tên..."
                prefix={<SearchOutlined style={{ color: "#A05A2C" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: 280,
                  borderRadius: 6,
                  borderColor: "#E9C97B",
                  height: 32,
                }}
                allowClear
              />
            </Space>
          </div>

          <Table
            className="material-table"
            columns={columns}
            dataSource={filteredMaterials}
            loading={isMaterialLoading}
            rowKey="materialId"
            style={{
              borderRadius: 8,
              border: `1px solid ${tableBorderColor}`,
              overflow: "hidden",
            }}
            rowClassName={(record, index) =>
              record.isExpired
                ? "expired-row"
                : index % 2 === 0
                ? "even-row-material"
                : "odd-row-material"
            }
            scroll={{ x: 980 }}
            sticky
          />
        </Card>

        <Modal
          title={
            <span style={{ color: "#D97B41", fontWeight: 700, fontSize: 22 }}>
              Chi tiết nguyên liệu
            </span>
          }
          open={isDetailModalVisible}
          onCancel={handleCloseDetailModal}
          centered
          footer={[
            <Button key="close" onClick={handleCloseDetailModal}>
              Đóng
            </Button>,
          ]}
          width={500}
        >
          {selectedMaterial && (
            <div>
              <Descriptions
                bordered
                column={1}
                size="middle"
                labelStyle={{ width: "150px", background: evenRowBgColor }}
              >
                <Descriptions.Item label="Mã">
                  {selectedMaterial.materialId}
                </Descriptions.Item>
                <Descriptions.Item label="Tên">
                  {selectedMaterial.name}
                </Descriptions.Item>
                <Descriptions.Item label="Số ký(g)">
                  {selectedMaterial.quantity}
                </Descriptions.Item>
                <Descriptions.Item label="Barcode">
                  <Image
                    src={selectedMaterial.barcode}
                    alt={selectedMaterial.name}
                    style={{
                      display: "block",
                      margin: "auto",
                      maxWidth: "100%",
                    }}
                  />
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MaterialProcessManagement;
