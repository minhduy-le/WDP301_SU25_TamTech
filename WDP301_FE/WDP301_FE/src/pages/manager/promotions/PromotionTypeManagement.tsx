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
  icon?: React.ReactNode; 
  usageCount: number; 
}

const API_URL = "https://wdp301-su25.space/api/promotion-types";

// --- Component ---
const PromotionTypeManagement: React.FC = () => {
  const [promotionTypes, setPromotionTypes] = useState<PromotionType[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingType, setEditingType] = useState<PromotionType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Map API data to PromotionType with icon
  const mapPromotionType = (item: any): PromotionType => {
    return {
      promotionTypeId: String(item.promotionTypeId),
      name: item.name,
      icon: undefined, // Không dùng icon nữa
      usageCount: 0, // Không hiển thị usageCount
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

  // --- Handlers ---
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

  const handleDelete = (record: PromotionType) => {
    if (record.usageCount > 0) {
        Modal.warning({
            title: 'Không thể xóa loại khuyến mãi này',
            content: `Loại "${record.name}" đang được sử dụng bởi ${record.usageCount} chương trình. Vui lòng gỡ bỏ khỏi các chương trình đang áp dụng trước khi xóa.`,
            okText: "Đã hiểu"
        })
        return;
    }

    Modal.confirm({
      title: `Bạn có chắc chắn muốn xóa loại "${record.name}"?`,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        setPromotionTypes((prev) =>
          prev.filter((pt) => pt.promotionTypeId !== record.promotionTypeId)
        );
        message.success(`Đã xóa loại khuyến mãi "${record.name}"!`);
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
    } catch (error) {
      console.error("Failed to submit form:", error);
      message.error("Vui lòng điền đầy đủ thông tin hoặc kiểm tra lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const promotionTypeMenu = (record: PromotionType): MenuProps["items"] => [
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
                backgroundColor: cardBgColor,
                border: `1px solid ${cardBorderColor}`,
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
              <div style={{ fontWeight: 600, color: headerColor, fontSize: 18 }}>
                {type.name}
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
            style={{ borderRadius: 6 }}
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