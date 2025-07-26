
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
}

const API_URL = "https://wdp301-su25.space/api/product-types";

const ProductTypeManagement: React.FC = () => {
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
    setEditingType(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (record: ProductType) => {
    Modal.confirm({
      title: `Bạn có chắc muốn xóa loại "${record.name}"?`,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await axios.delete(`${API_URL}/${record.productTypeId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          message.success(`Đã xóa loại sản phẩm "${record.name}"!`);
          fetchProductTypes();
        } catch (error) {
          message.error("Không thể xóa loại sản phẩm.");
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
    } catch (error) {
      message.error("Vui lòng nhập đầy đủ thông tin!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const productTypeMenu = (record: ProductType): MenuProps["items"] => [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Chỉnh sửa",
      onClick: () => handleEdit(record),
    },
    {
      key: "delete",
      danger: true,
      icon: <DeleteOutlined />,
      label: "Xóa",
      onClick: () => handleDelete(record),
    },
  ];

  return (
    <div style={{ maxWidth: 1300, margin: "40px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: "#A05A2C", fontSize: 28, fontWeight: 700 }}>Loại Sản phẩm</h2>
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
          padding: 24,
          border: "1px solid #E9C97B",
          boxShadow: "0 6px 16px rgba(160, 90, 44, 0.08)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "24px" }}>
          {productTypes.map((type) => (
            <div
              key={type.productTypeId}
              className="product-type-card"
              style={{
                background: "#FFFDF5",
                border: "1px solid #F5EAD9",
                borderRadius: 12,
                padding: "32px 16px",
                textAlign: "center",
                boxShadow: "0 4px 8px rgba(160, 90, 44, 0.06)",
                position: "relative",
              }}
            >
              <div style={{ fontWeight: 600, color: "#A05A2C", fontSize: 18 }}>
                {type.name}
              </div>
              <Dropdown
                menu={{ items: productTypeMenu(type) }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Button
                  type="text"
                  icon={<MoreOutlined style={{ color: "#8D6E63" }} />}
                  size="small"
                  style={{ position: "absolute", top: 8, right: 8 }}
                />
              </Dropdown>
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
