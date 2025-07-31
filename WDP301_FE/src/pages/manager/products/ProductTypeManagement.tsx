
import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Card,
  Dropdown,
  message,
  type MenuProps,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import axios from "axios";

interface ProductType {
  productTypeId: number;
  name: string;
  isActive: boolean;
}

interface ProductTypeManagementProps {
  onChanged?: () => void;
}

const API_URL = "https://wdp301-su25.space/api/product-types";

const ProductTypeManagement: React.FC<ProductTypeManagementProps> = ({ onChanged }) => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingType, setEditingType] = useState<ProductType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProductTypes();
  }, []);

  const fetchProductTypes = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProductTypes(res.data);
    } catch (error) {
      message.error("Không thể tải danh sách loại sản phẩm!");
    }
  };
  

  const handleAdd = () => {
    setEditingType(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: ProductType) => {
    if (record.name === "Thức uống") {
      message.warning("Không thể chỉnh sửa loại 'Thức uống'!");
      return;
    }
    setEditingType(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (record: ProductType) => {
    Modal.confirm({
      title: `Xác nhận xóa loại "${record.name}"?`,
      content: "Thao tác này sẽ ẩn loại sản phẩm khỏi hệ thống.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          const response = await axios.delete(`${API_URL}/${record.productTypeId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
  
          if (response.status === 200) {
            message.success(`Đã xóa loại sản phẩm "${record.name}"`);
            fetchProductTypes();
            if (onChanged) onChanged();
          }
        } catch (error: any) {
          if (axios.isAxiosError(error)) {
            const status = error.response?.status;
  
            if (status === 400) {
              message.error("Không thể xóa: Loại sản phẩm đang được sử dụng.");
            } else if (status === 401) {
              message.error("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
            } else {
              message.error("Xóa thất bại. Vui lòng thử lại sau.");
            }
          } else {
            message.error("Lỗi không xác định.");
          }
        }
      },
    });
  };
  
  const handleModalOk = async () => {
    setIsSubmitting(true);
    try {
      const values = await form.validateFields();
      if (editingType) {
        await axios.put(
          `${API_URL}/${editingType.productTypeId}`,
          { name: values.name },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        message.success("Đã cập nhật loại sản phẩm!");
      } else {
        await axios.post(
          API_URL,
          { name: values.name },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        message.success("Đã thêm loại sản phẩm mới!");
      }
  
      fetchProductTypes();
      setIsModalVisible(false);
      form.resetFields();
      if (onChanged) onChanged();
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        const errMsg =
          error.response.data?.message || "Lỗi không xác định từ máy chủ.";
        message.error(errMsg);
      } else {
        message.error("Vui lòng nhập đầy đủ thông tin!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const productTypeMenu = (record: ProductType): MenuProps["items"] =>
    ([
      // Không cho phép chỉnh sửa loại "Thức uống"
      record.name !== "Thức uống" && {
        key: "edit",
        icon: <EditOutlined />,
        label: "Chỉnh sửa",
        onClick: () => handleEdit(record),
      },
      record.isActive && {
        key: "delete",
        danger: true,
        icon: <DeleteOutlined />,
        label: "Xóa",
        onClick: () => handleDelete(record),
      },
    ].filter(Boolean) as MenuProps["items"]);

  // --- Styling ---
  const headerColor = "#A05A2C";
  const cardBgColor = "#FFFDF5";
  const cardBorderColor = "#F5EAD9";

  return (
    <div style={{ maxWidth: 1300, margin: "40px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: headerColor, fontSize: 28, fontWeight: 700 }}>Loại Sản phẩm</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{
            background: "#D97B41",
            borderColor: "#D97B41",
            fontWeight: 600,
            borderRadius: 6,
            outline: "none",
          }}
        >
          Thêm loại mới
        </Button>
      </div>
      <Card
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 6px 16px rgba(160, 90, 44, 0.08)",
          padding: "24px",
          border: `1px solid #E9C97B`,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "24px",
          }}
        >
          {productTypes.map((type) => (
            <div
              key={type.productTypeId}
              className="product-type-card"
              style={{
                backgroundColor: type.isActive ? cardBgColor : "#f5f5f5",
                border: `1px solid ${type.isActive ? cardBorderColor : "#ccc"}`,
                color: type.isActive ? headerColor : "#aaa",
                opacity: type.isActive ? 1 : 0.7,
                position: "relative",
                borderRadius: 12,
                padding: "32px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                height: 100,
                boxShadow: "0 4px 8px rgba(160, 90, 44, 0.06)",
                justifyContent: 'center',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 18, color: type.isActive ? headerColor : "#aaa" }}>
                {type.name}
              </div>
              {!type.isActive && (
                <div style={{
                  marginTop: 8,
                  background: "#bbb",
                  color: "#fff",
                  borderRadius: 4,
                  padding: "2px 8px",
                  fontSize: 12,
                  fontWeight: 500,
                  display: 'inline-block',
                  textAlign: 'center',
                }}>
                  Đã vô hiệu hóa
                </div>
              )}
              {type.isActive ? (
                <Dropdown
                  menu={{ items: productTypeMenu(type) }}
                  placement="bottomRight"
                  trigger={["click"]}
                >
                  <Button
                    type="text"
                    icon={<MoreOutlined style={{ color: "#8D6E63" }} />}
                    size="small"
                    style={{ position: 'absolute', top: 8, right: 8, outline: 'none', border: 'none' }}
                  />
                </Dropdown>
              ) : (
                <Button
                  type="text"
                  icon={<PlusOutlined style={{ color: "#388e3c", fontSize: 17 }} />}
                  size="small"
                  style={{ position: 'absolute', top: 8, right: 8, outline: 'none', border: 'none' }}
                  onClick={async () => {
                    try {
                      await axios.put(
                        `${API_URL}/${type.productTypeId}/activate`,
                        {},
                        {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                          },
                        }
                      );
                      message.success("Đã mở lại loại sản phẩm!");
                      fetchProductTypes();
                      if (onChanged) onChanged();
                    } catch (error) {
                      message.error("Mở lại loại sản phẩm thất bại!");
                    }
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </Card>
      <Modal
        open={isModalVisible}
        title={
          <span style={{ color: "#A05A2C", fontWeight: 600, fontSize: 22 }}>
            {editingType ? "Chỉnh sửa loại sản phẩm" : "Thêm loại sản phẩm mới"}
          </span>
        }
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)} disabled={isSubmitting}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSubmitting}
            onClick={handleModalOk}
            style={{ background: "#D97B41", borderColor: "#D97B41", borderRadius: 6, outline: 'none' }}
          >
            {editingType ? "Cập nhật" : "Thêm mới"}
          </Button>,
        ]}
        destroyOnClose
        styles={{ body: { background: "#FFF9F0" } }}
      >
        <Form form={form} layout="vertical" initialValues={{ name: "" }}>
          <Form.Item
            name="name"
            label={<span style={{ color: "#A05A2C" }}>Tên loại sản phẩm</span>}
            rules={[{ required: true, message: "Vui lòng nhập tên loại sản phẩm!" }]}
          >
            <Input placeholder="Ví dụ: Món canh" style={{ borderRadius: 6 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductTypeManagement;
