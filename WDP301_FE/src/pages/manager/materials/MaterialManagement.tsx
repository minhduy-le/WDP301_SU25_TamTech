/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { Table, Space, Button, Input, Card, Modal, Descriptions, Tooltip, message, Form, Image } from "antd";
import { SearchOutlined, EyeOutlined, PlusOutlined, FireOutlined } from "@ant-design/icons";
import type { ColumnType } from "antd/es/table";
import {
  useMaterials,
  type MaterialDto,
  useCreateMaterials,
  useIncreaseMaterialQuantity,
} from "../../../hooks/materialsApi";
import { useQueryClient } from "@tanstack/react-query";

// Không cần import BarcodeScanner nữa

const MaterialManagement = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialDto | null>(null);
  const [form] = Form.useForm();
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { data: materials, isLoading: isMaterialLoading } = useMaterials();
  const queryClient = useQueryClient();
  const { mutate: createMaterial, isPending: isCreating } = useCreateMaterials();
  const { mutate: increaseMaterialQuantity } = useIncreaseMaterialQuantity();

  // --- STYLING CONSTANTS ---
  const evenRowBgColor = "#FFFDF5";
  const tableBorderColor = "#E9C97B";

  const handleOpenDetailModal = (record: MaterialDto) => {
    setSelectedMaterial(record);
    setIsDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedMaterial(null);
  };

  // --- HÀM XỬ LÝ MÃ VẠCH TỪ MÁY QUÉT ---
  const handleScan = useCallback(
    (scannedCode: string) => {
      // Chỉ xử lý nếu có một nguyên liệu đang được chọn (modal đang mở)
      if (!selectedMaterial) {
        return;
      }

      const getBarcodeValueFromUrl = (url: string): string | null => {
        try {
          const urlPart = url.split("?")[0];
          const decodedUrl = decodeURIComponent(urlPart);
          const filename = decodedUrl.split("/").pop();
          return filename ? filename.replace(".png", "") : null;
        } catch (e) {
          console.error("Lỗi khi phân tích URL barcode:", e);
          return null;
        }
      };

      const expectedBarcodeValue = getBarcodeValueFromUrl(selectedMaterial.barcode);

      if (scannedCode.trim() === expectedBarcodeValue) {
        message.loading({ content: "Đang cập nhật số lượng...", key: "update_quantity" });
        increaseMaterialQuantity(
          { materialId: selectedMaterial.materialId! },
          {
            onSuccess: () => {
              message.success({
                content: `Đã cập nhật số lượng cho: ${selectedMaterial.name}`,
                key: "update_quantity",
                duration: 2,
              });
              queryClient.invalidateQueries({ queryKey: ["materials"] });
              handleCloseDetailModal();
            },
            onError: (error: any) => {
              message.error({ content: error.message || "Cập nhật thất bại!", key: "update_quantity", duration: 2 });
            },
          }
        );
      } else {
        // Thông báo lỗi nếu quét sai mã
        message.error("Mã vạch không khớp với nguyên liệu đang xem!", 3);
      }
    },
    [selectedMaterial, increaseMaterialQuantity, queryClient]
  );

  // --- HOOK LẮNG NGHE SỰ KIỆN TỪ MÁY QUÉT (KEYBOARD) ---
  useEffect(() => {
    // Chỉ lắng nghe khi modal chi tiết đang mở
    if (!isDetailModalVisible) {
      return;
    }

    let scannedChars = "";
    let timeoutId: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (scannedChars.length > 2) {
          handleScan(scannedChars);
        }
        scannedChars = "";
        e.preventDefault();
        return;
      }

      if (e.key.length === 1) {
        scannedChars += e.key;
      }

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        scannedChars = "";
      }, 100);
    };

    window.addEventListener("keydown", handleKeyDown);

    // Dọn dẹp listener khi component unmount hoặc modal đóng
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isDetailModalVisible, handleScan]);

  const columns: ColumnType<MaterialDto>[] = [
    {
      title: "Mã",
      dataIndex: "materialId",
      key: "materialId",
      width: 80,
      sorter: (a, b) => (a.materialId ?? 0) - (b.materialId ?? 0),
    },
    {
      title: "Tên nguyên liệu",
      dataIndex: "name",
      key: "name",
      width: 250,
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết & Quét">
            <Button
              type="primary"
              ghost
              icon={<EyeOutlined />}
              onClick={() => handleOpenDetailModal(record)}
              style={{ color: "#D97B41", borderColor: "#D97B41" }}
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
    <div style={{ minHeight: "100vh", background: "#FFF9F0", padding: "20px 30px 30px 60px" }}>
      <style>{`
         /* CSS Styles can be kept as they are */
      `}</style>
      <div style={{ maxWidth: 1300 }}>
        <h1 style={{ fontWeight: 700, color: "#A05A2C", fontSize: 36, marginBottom: 24, textAlign: "left" }}>
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
                placeholder="Tìm theo ID, Tên..."
                prefix={<SearchOutlined style={{ color: "#A05A2C" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 280, borderRadius: 6, borderColor: "#E9C97B", height: 32 }}
                allowClear
              />
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ background: "#D97B41", borderColor: "#D97B41", fontWeight: 600, borderRadius: 6 }}
              onClick={() => setIsAddModalVisible(true)}
            >
              Thêm nguyên liệu
            </Button>
          </div>

          <Table
            className="material-table"
            columns={columns}
            dataSource={materials}
            loading={isMaterialLoading}
            rowKey="materialId"
            rowClassName={(_, index) => (index % 2 === 0 ? "even-row-material" : "odd-row-material")}
            scroll={{ x: 980 }}
            sticky
          />
        </Card>

        {/* Detail Modal */}
        <Modal
          title={<span style={{ color: "#D97B41", fontWeight: 700, fontSize: 22 }}>Chi tiết nguyên liệu</span>}
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
                <Descriptions.Item label="Mã">{selectedMaterial.materialId}</Descriptions.Item>
                <Descriptions.Item label="Tên">{selectedMaterial.name}</Descriptions.Item>
                <Descriptions.Item label="Số lượng">{selectedMaterial.quantity}</Descriptions.Item>
                <Descriptions.Item label="Barcode">
                  <Image
                    src={selectedMaterial.barcode}
                    alt={selectedMaterial.name}
                    style={{ display: "block", margin: "auto", maxWidth: "100%" }}
                  />
                </Descriptions.Item>
              </Descriptions>
              <div style={{ textAlign: "center", marginTop: "16px", color: "#888", fontStyle: "italic" }}>
                Sẵn sàng quét...
              </div>
            </div>
          )}
        </Modal>

        {/* Add Material Modal */}
        <Modal
          title={<span style={{ color: "#D97B41", fontWeight: 700, fontSize: 22 }}>Thêm nguyên liệu</span>}
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
            >
              Hủy
            </Button>,
            <Button
              key="create"
              type="primary"
              onClick={handleAddMaterial}
              loading={isCreating}
              style={{ background: "#D97B41", borderColor: "#D97B41" }}
            >
              Tạo
            </Button>,
          ]}
          width={500}
        >
          <Form form={form} name="addMaterialForm" layout="vertical" onFinish={handleAddMaterial}>
            <Form.Item
              name="name"
              label="Tên nguyên liệu"
              rules={[{ required: true, message: "Vui lòng nhập tên nguyên liệu!" }]}
            >
              <Input placeholder="Nhập tên nguyên liệu" />
            </Form.Item>
            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng!" },
                {
                  validator: (_, value) =>
                    value >= 0 ? Promise.resolve() : Promise.reject(new Error("Số lượng phải lớn hơn hoặc bằng 0!")),
                },
              ]}
            >
              <Input type="number" placeholder="Nhập số lượng" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default MaterialManagement;
