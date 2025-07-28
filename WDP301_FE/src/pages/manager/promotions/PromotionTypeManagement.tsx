// src/components/PromotionTypeManagement.tsx

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

interface PromotionType {
  promotionTypeId: string;
  name: string;
  isActive: boolean;
  usageCount: number; 
}

interface PromotionTypeManagementProps {
  promotionTypes: PromotionType[];
  setPromotionTypes: React.Dispatch<React.SetStateAction<PromotionType[]>>;
}

const API_URL = "https://wdp301-su25.space/api/promotion-types";

const PromotionTypeManagement: React.FC<PromotionTypeManagementProps> = ({ promotionTypes, setPromotionTypes }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingType, setEditingType] = useState<PromotionType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  const mapPromotionType = (item: any): PromotionType => {
    return {
      promotionTypeId: String(item.promotionTypeId),
      name: item.name,
      isActive: item.isActive,
      usageCount: 0, 
    };
  };

  useEffect(() => {
    const fetchPromotionTypes = async () => {
      try {
        const res = await axios.get(API_URL, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setPromotionTypes(res.data.map(mapPromotionType));
      } catch (err) {
        message.error("Không thể tải danh sách loại khuyến mãi!");
      }
    };
    fetchPromotionTypes();
  }, []);

  const handleAdd = () => {
    setEditingType(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: PromotionType) => {
    setEditingType(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };


  const handleLock = async (record: PromotionType) => {
    Modal.confirm({
      title: `Bạn có chắc chắn muốn khóa loại "${record.name}"?`,
      content: "Loại khuyến mãi này sẽ bị vô hiệu hóa và không thể sử dụng cho chương trình mới.",
      okText: "Khóa",
      okType: "danger",
      okButtonProps: {
        style: {
          outline: "none",
        },
      },
      cancelText: "Hủy",
      cancelButtonProps: {
        style: {
          borderRadius: 6,
          outline: "none",
        },
      },
      onOk: async () => {
        try {
          await axios.delete(`${API_URL}/${record.promotionTypeId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          message.success(`Đã khóa loại khuyến mãi "${record.name}"!`);
          const res = await axios.get(API_URL, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          setPromotionTypes(res.data.map(mapPromotionType));
        } catch (err: any) {
          const errorMessage =
            err?.response?.data?.message ||
            err?.response?.data ||
            "Khóa loại khuyến mãi thất bại!";
          message.error(errorMessage);
        }
      },
    });
  };

  const handleUnlock = async (record: PromotionType) => {
    Modal.confirm({
      title: `Bạn có muốn mở lại loại "${record.name}"?`,
      content: "Loại khuyến mãi này sẽ được kích hoạt trở lại.",
      okText: "Mở lại",
      okType: "primary",
      okButtonProps: {
        style: {
          background: "#388e3c",
          borderColor: "#388e3c",
          outline: "none",
        },
      },
      cancelText: "Hủy",
      cancelButtonProps: {
        style: {
          borderRadius: 6,
          outline: "none",
        },
      },
      onOk: async () => {
        try {
          await axios.put(
            `${API_URL}/${record.promotionTypeId}/activate`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
              },
            }
          );
          message.success(`Đã mở lại loại khuyến mãi "${record.name}"!`);
          const res = await axios.get(API_URL, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          setPromotionTypes(res.data.map(mapPromotionType));
        } catch (err: any) {
          const errorMessage =
            err?.response?.data?.message ||
            err?.response?.data ||
            "Mở lại loại khuyến mãi thất bại!";
          message.error(errorMessage);
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
          `${API_URL}/${editingType.promotionTypeId}`,
          { name: values.name },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          }
        );
        message.success("Đã cập nhật loại khuyến mãi!");
        const res = await axios.get(API_URL, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setPromotionTypes(res.data.map(mapPromotionType));
      } else {
        await axios.post(
          API_URL,
          { name: values.name },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          }
        );
        message.success("Đã thêm loại khuyến mãi!");
        const res = await axios.get(API_URL, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setPromotionTypes(res.data.map(mapPromotionType));
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      console.error("Failed to submit form:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Vui lòng điền đầy đủ thông tin hoặc kiểm tra lại!";
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const promotionTypeMenu = (record: PromotionType): MenuProps["items"] =>
    ([
      record.isActive
        ? {
            key: "edit",
            icon: <EditOutlined />,
            label: "Chỉnh sửa",
            onClick: () => handleEdit(record),
          }
        : null,
      record.isActive
        ? {
            key: "lock",
            danger: true,
            icon: <DeleteOutlined />,
            label: "Khóa",
            onClick: () => handleLock(record),
          }
        : {
            key: "unlock",
            icon: <PlusOutlined style={{ color: '#388e3c' }} />,
            label: <span style={{ color: '#388e3c' }}>Mở lại</span>,
            onClick: () => handleUnlock(record),
          },
    ].filter(Boolean) as MenuProps["items"]);

  // --- Styling ---
  const headerColor = "#A05A2C";
  const cardBgColor = "#FFFDF5";
  const cardBorderColor = "#F5EAD9";

  return (
    <div style={{ maxWidth: 1300, margin: "40px auto 0 auto" }}>
      <style>{`
        .promo-type-card {
            transition: all 0.2s ease-in-out;
            position: relative;
        }
        .promo-type-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(160, 90, 44, 0.12) !important;
        }
        .promo-type-card .ant-dropdown-trigger {
            position: absolute;
            top: 8px;
            right: 8px;
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
        }
        .promo-type-card:hover .ant-dropdown-trigger {
            opacity: 1;
        }
        .ant-input:focus, .ant-input:hover {
            border-color: #D97B41 !important;
            box-shadow: 0 0 0 2px rgba(217, 123, 65, 0.1) !important;
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2
          style={{
            fontWeight: 700,
            color: "#A05A2C",
            fontSize: 28,
            margin: 0,
          }}
        >
          Loại Khuyến mãi
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{
            background: "#D97B41",
            borderColor: "#D97B41",
            fontWeight: 600,
            borderRadius: 6,
            outline: 'none',
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
          {promotionTypes.map((type) => (
            <div
              key={type.promotionTypeId}
              className="promo-type-card"
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
                {!type.isActive && (
                  <span style={{
                    marginLeft: 8,
                    background: "#bbb",
                    color: "#fff",
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontSize: 12,
                    fontWeight: 500,
                  }}>
                    Đã vô hiệu hóa
                  </span>
                )}
              </div>
              <Dropdown
                menu={{ items: promotionTypeMenu(type) }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Button
                  type="text"
                  icon={<MoreOutlined style={{color: '#8D6E63'}} />}
                  size="small"
                  style={{ position: 'absolute', top: 8, right: 8, outline: 'none', border: 'none' }}
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
            {editingType ? "Chỉnh sửa loại khuyến mãi" : "Thêm loại khuyến mãi mới"}
          </span>
        }
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsModalVisible(false)}
            style={{ borderRadius: 6, outline: "none" }}
            disabled={isSubmitting}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleModalOk}
            loading={isSubmitting}
            style={{
              background: "#D97B41",
              borderColor: "#D97B41",
              borderRadius: 6,
              outline: 'none',
            
            }}
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
            label={<span style={{ color: "#A05A2C" }}>Tên loại khuyến mãi</span>}
            rules={[
              { required: true, message: "Vui lòng nhập tên loại khuyến mãi!" },
            ]}
            style={{marginBottom: 0}}
          >
            <Input placeholder="Ví dụ: Giảm giá theo %" style={{ borderRadius: 6, marginBottom: "16px" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionTypeManagement;