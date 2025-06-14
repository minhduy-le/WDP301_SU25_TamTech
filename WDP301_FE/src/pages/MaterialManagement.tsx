/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Table,
  Space,
  Button,
  Input,
  Card,
  Modal,
  Descriptions,
  Tooltip,
  //   message,
} from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { ColumnType } from "antd/es/table";
import { useMaterials, type MaterialDto } from "../hooks/materialsApi";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(dayjs.tz.guess());

const MaterialManagement = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialDto | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { data: materials, isLoading: isMaterialLoading } = useMaterials();

  const headerColor = "#A05A2C";
  const headerBgColor = "#F9E4B7";
  const evenRowBgColor = "#FFFDF5";
  const oddRowBgColor = "#FFF7E6";
  const cellTextColor = "#5D4037";
  const borderColor = "#F5EAD9";
  const tableBorderColor = "#E9C97B";

  const columns = [
    {
      title: "Mã nguyên liệu",
      dataIndex: "materialId",
      key: "materialId",
      width: 100,
      sorter: (a: MaterialDto, b: MaterialDto) => a.materialId - b.materialId,
    },
    {
      title: "Tên nguyên liệu",
      dataIndex: "name",
      key: "name",
      width: 200,
      ellipsis: true,
      sorter: (a: MaterialDto, b: MaterialDto) => a.name.localeCompare(b.name),
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 150,
      sorter: (a: MaterialDto, b: MaterialDto) => a.quantity - b.quantity,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 220,
      align: "center" as const,
      render: (_: any, record: MaterialDto) => (
        <Space size={12}>
          <Tooltip title="Chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedMaterial(record);
                setIsModalVisible(true);
              }}
              style={{
                color: "#D97B41",
                fontWeight: 600,
                padding: 0,
                outline: "none",
                boxShadow: "none",
                border: "none",
              }}
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
        .material-table .ant-table-thead > tr > th,
        .material-table .ant-table-thead > tr > th.ant-table-cell-fix-right,
        .material-table .ant-table-thead > tr > th.ant-table-cell-fix-left {
          background-color: ${headerBgColor} !important;
          color: ${headerColor} !important;
          font-weight: bold !important;
          border-right: 1px solid ${borderColor} !important;
          border-bottom: 2px solid ${tableBorderColor} !important;
        }
        .material-table .ant-table-thead > tr > th:last-child {
            border-right: none !important;
        }
        .material-table .ant-table-thead > tr > th.ant-table-cell-fix-right.ant-table-cell-fix-right-last {
           border-right: none !important;
        }
        .material-table .ant-table-tbody > tr.even-row-material > td {
          background-color: ${evenRowBgColor};
          color: ${cellTextColor};
          border-right: 1px solid ${borderColor};
          border-bottom: 1px solid ${borderColor};
        }
        .material-table .ant-table-tbody > tr.odd-row-material > td {
          background-color: ${oddRowBgColor};
          color: ${cellTextColor};
          border-right: 1px solid ${borderColor};
          border-bottom: 1px solid ${borderColor};
        }
        .material-table .ant-table-tbody > tr > td:last-child:not(.ant-table-selection-column) {
           border-right: none;
        }
        .material-table .ant-table-tbody > tr:hover > td {
          background-color: #FDEBC8 !important;
        }
        .material-table .ant-table-tbody > tr.even-row-material > td.ant-table-cell-fix-right,
        .material-table .ant-table-tbody > tr.odd-row-material > td.ant-table-cell-fix-right,
        .material-table .ant-table-tbody > tr:hover > td.ant-table-cell-fix-right {
           background: inherit !important;
        }
      `}</style>

      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <h1
          style={{
            fontWeight: 800,
            color: "#A05A2C",
            fontSize: 36,
            marginBottom: 24,
            textAlign: "left",
          }}
        >
          Quản lý Nguyên liệu
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
                placeholder="Tìm theo ID, Tên khách..."
                prefix={<SearchOutlined style={{ color: "#A05A2C" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: 280,
                  borderRadius: 6,
                  borderColor: "#E9C97B",
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                allowClear
              />
            </Space>
          </div>

          <Table
            className="material-table"
            columns={columns as ColumnType<MaterialDto>[]}
            dataSource={materials}
            loading={isMaterialLoading}
            rowKey="materialId"
            style={{
              borderRadius: 8,
              border: `1px solid ${tableBorderColor}`,
              overflow: "hidden",
            }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? "even-row-material" : "odd-row-material"
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
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          // footer={[
          //   <Button
          //     key="back"
          //     onClick={() => setIsModalVisible(false)}
          //     style={{
          //       borderRadius: 6,
          //       borderColor: "#3B82F6",
          //       color: "#3B82F6",
          //     }}
          //   >
          //     Đóng
          //   </Button>,
          // ]}
          footer={null}
          width={1000}
          styles={{
            body: {
              background: "#FFF9F0",
              borderRadius: "0 0 12px 12px",
              padding: "24px",
            },
            header: {
              borderBottom: `1px solid ${tableBorderColor}`,
              paddingBottom: 16,
              marginBottom: 0,
            },
          }}
          style={{ borderRadius: 12, top: 20 }}
        >
          {selectedMaterial && (
            <Card
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.08)",
                border: `1px solid ${tableBorderColor}`,
                padding: 16,
              }}
            >
              <Descriptions
                bordered
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                size="default"
                labelStyle={{
                  color: "#A05A2C",
                  fontWeight: 600,
                  background: "#FFF9F0",
                  // width: "160px",
                }}
                contentStyle={{ color: cellTextColor, background: "#FFFFFF" }}
              >
                <Descriptions.Item label="Mã nguyên liệu">
                  {selectedMaterial.materialId}
                </Descriptions.Item>
                <Descriptions.Item label="Tên">
                  {selectedMaterial.name}
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng">
                  {selectedMaterial.quantity}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MaterialManagement;
