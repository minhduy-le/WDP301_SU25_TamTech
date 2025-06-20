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
  message,
  Form,
  Image,
  //   message,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  PlusOutlined,
  FireOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { ColumnType } from "antd/es/table";
import {
  useMaterials,
  type MaterialDto,
  useCreateMaterials,
} from "../../../hooks/materialsApi";
import { useQueryClient } from "@tanstack/react-query";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(dayjs.tz.guess());

const MaterialManagement = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialDto | null>(
    null
  );
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { data: materials, isLoading: isMaterialLoading } = useMaterials();
  const queryClient = useQueryClient();
  const { mutate: createMaterial, isPending: isCreating } =
    useCreateMaterials();

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
      width: 160,
      sorter: (a: MaterialDto, b: MaterialDto) =>
        (a.materialId ?? 0) - (b.materialId ?? 0),
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
                padding: "4px 8px",
                height: "auto",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                borderRadius: 6,
                border: "1px solid #D97B41",
                background: "#FFF9F0",
                transition: "all 0.3s ease",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#D97B41";
                e.currentTarget.style.color = "#FFF9F0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#FFF9F0";
                e.currentTarget.style.color = "#D97B41";
              }}
            >
              Chi tiết
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleAddMaterial = () => {
    form
      .validateFields()
      .then((values) => {
        createMaterial(values, {
          onSuccess: () => {
            message.success("Tạo nguyên liệu thành công!");
            setIsAddModalVisible(false);
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ["materials"] });
          },
          onError: (error: any) => {
            message.error(error.message || "Tạo nguyên liệu thất bại!");
          },
        });
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

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
        /* Your CSS styles remain the same */
        .ant-input-number:focus, .ant-input-number-focused, .ant-input-number:hover,
        .ant-select-focused .ant-select-selector, .ant-select-selector:focus, .ant-select-selector:hover,
        .ant-picker:focus, .ant-picker:hover, .ant-input:focus, .ant-input:hover,
        .ant-input-affix-wrapper:focus, .ant-input-affix-wrapper-focused, .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper:focus-within {
          border-color: #D97B41 !important; box-shadow: none !important;
        }
        .ant-pagination .ant-pagination-item-active, .ant-pagination .ant-pagination-item-active a { border-color: #D97B41 !important; color: #D97B41 !important; }
        .ant-table-column-sorter-up.active svg,
        .ant-table-column-sorter-down.active svg {
          color: #D97B41 !important;
          fill: #D97B41 !important;
        }
      `}</style>

      <div style={{ maxWidth: 1300 }}>
        <h1
          style={{
            fontWeight: 700,
            color: "#A05A2C",
            fontSize: 36,
            marginBottom: 24,
            textAlign: "left",
            paddingTop: 0,
            marginTop: 0,
          }}
        >
          Quản lý Nguyên liệu <FireOutlined />
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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                background: "#D97B41",
                borderColor: "#D97B41",
                fontWeight: 600,
                borderRadius: 6,
                boxShadow: "0 2px 0 rgba(0,0,0,0.043)",
                outline: "none",
              }}
              onClick={() => setIsAddModalVisible(true)}
            >
              Thêm nguyên liệu
            </Button>
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
          centered
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
                column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
                size="default"
                labelStyle={{
                  color: "#A05A2C",
                  fontWeight: 600,
                  background: "#FFF9F0",
                }}
                contentStyle={{ color: cellTextColor, background: "#FFFFFF" }}
              >
                <Descriptions.Item label="Mã nguyên liệu">
                  {selectedMaterial.materialId}
                </Descriptions.Item>
                <Descriptions.Item label="Tên nguyên liệu">
                  {selectedMaterial.name}
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng">
                  {selectedMaterial.quantity}
                </Descriptions.Item>
                <Descriptions.Item label="Barcode">
                  <Image
                    src={selectedMaterial.barcode}
                    alt={selectedMaterial.name}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Tên cửa hàng">
                  {selectedMaterial.Store?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ cửa hàng">
                  {selectedMaterial.Store?.address}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Modal>

        <Modal
          title={
            <span style={{ color: "#D97B41", fontWeight: 700, fontSize: 22 }}>
              Thêm nguyên liệu
            </span>
          }
          open={isAddModalVisible}
          onCancel={() => {
            setIsAddModalVisible(false);
            form.resetFields();
          }}
          centered
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsAddModalVisible(false);
                form.resetFields();
              }}
              style={{
                borderRadius: 6,
              }}
            >
              Hủy
            </Button>,
            <Button
              key="create"
              type="primary"
              onClick={handleAddMaterial}
              loading={isCreating}
              style={{
                background: "#D97B41",
                borderColor: "#D97B41",
                borderRadius: 6,
                outline: "none",
              }}
            >
              Tạo
            </Button>,
          ]}
          width={500}
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
          <Form
            form={form}
            name="addMaterialForm"
            layout="vertical"
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "8px",
              border: "1px solid #f0f0f0",
            }}
            initialValues={{ name: "", quantity: 0 }}
            onFinish={handleAddMaterial}
          >
            <Form.Item
              name="name"
              label="Tên nguyên liệu"
              rules={[
                { required: true, message: "Vui lòng nhập tên nguyên liệu!" },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Input
                placeholder="Nhập tên nguyên liệu"
                style={{ borderRadius: 6, marginBottom: 16 }}
              />
            </Form.Item>
            <Form.Item
              name="quantity"
              label="Số lượng"
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: "Vui lòng nhập số lượng!" },
                {
                  validator: (_, value) =>
                    value > 0
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Số lượng phải lớn hơn hoặc bằng 0!")
                        ),
                },
              ]}
            >
              <Input
                type="number"
                placeholder="Nhập số lượng"
                style={{ borderRadius: 6, marginBottom: 16 }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default MaterialManagement;
