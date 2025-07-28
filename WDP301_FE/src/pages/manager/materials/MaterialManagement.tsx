/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useMemo } from "react";
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
  DatePicker,
  Image,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  PlusOutlined,
  FireOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnType } from "antd/es/table";
import {
  useMaterials,
  type MaterialDto,
  useCreateMaterials,
  useIncreaseMaterialQuantity,
  useUpdateMaterial,
  useDeleteMaterial,
  type UpdateMaterialDto,
  useUpdateExpiredProcessMaterial,
} from "../../../hooks/materialsApi";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { SquareX } from "lucide-react";

// Không cần import BarcodeScanner nữa

const MaterialManagement = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialDto | null>(
    null
  );
  const [addForm] = Form.useForm<MaterialDto>();
  const [editForm] = Form.useForm<UpdateMaterialDto>();
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isUpdateProcessModalVisible, setIsUpdateProcessModalVisible] =
    useState(false);
  const [searchText, setSearchText] = useState("");
  const { data: materials, isLoading: isMaterialLoading } = useMaterials();
  const queryClient = useQueryClient();
  const { mutate: createMaterial, isPending: isCreating } =
    useCreateMaterials();
  const { mutate: updateMaterial, isPending: isUpdating } = useUpdateMaterial();
  const { mutate: deleteMaterial, isPending: isDeleting } = useDeleteMaterial();
  const {
    mutate: updateProcessMaterial,
    isPending: isUpdatingProcessMaterial,
  } = useUpdateExpiredProcessMaterial();
  const { mutate: increaseMaterialQuantity } = useIncreaseMaterialQuantity();

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

  const handleOpenEditModal = (record: MaterialDto) => {
    setSelectedMaterial(record);
    editForm.setFieldsValue({
      name: record.name,
      quantity: record.quantity,
      expireDate: record.expireDate ? dayjs(record.expireDate) : undefined,
    });
    setIsEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
    setSelectedMaterial(null);
  };

  const handleOpenDeleteModal = (record: MaterialDto) => {
    setSelectedMaterial(record);
    setIsDeleteModalVisible(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalVisible(false);
    setSelectedMaterial(null);
  };

  const handleOpenUpdateProcessModal = (record: MaterialDto) => {
    setSelectedMaterial(record);
    setIsUpdateProcessModalVisible(true);
  };

  const handleCloseUpdateProcessModal = () => {
    setIsUpdateProcessModalVisible(false);
    setSelectedMaterial(null);
  };

  const handleEdit = (values: UpdateMaterialDto) => {
    if (!selectedMaterial?.materialId) return;
    const updatedData = {
      ...values,
      expireDate: values.expireDate ? values.expireDate : undefined,
      timeExpired: values.expireDate
        ? dayjs(values.expireDate).format("HH:mm:ss")
        : undefined,
    };
    updateMaterial(
      { materialId: selectedMaterial.materialId, data: updatedData },
      {
        onSuccess: () => {
          message.success("Cập nhật nguyên liệu thành công!");
          handleCloseEditModal();
          queryClient.invalidateQueries({ queryKey: ["materials"] });
        },
        onError: (error) => {
          message.error(error.message || "Cập nhật thất bại!");
        },
      }
    );
  };

  const handleDelete = (materialId: number | undefined) => {
    if (!materialId) return;
    deleteMaterial(materialId, {
      onSuccess: () => {
        message.success("Xóa nguyên liệu thành công!");
        handleCloseDeleteModal();
        queryClient.invalidateQueries({ queryKey: ["materials"] });
      },
      onError: (error) => {
        message.error(error.message || "Xóa thất bại!");
      },
    });
  };

  const handleUpdateProcess = (materialId: number | undefined) => {
    if (!materialId) return;
    updateProcessMaterial(materialId, {
      onSuccess: () => {
        message.success("Xử lý nguyên liệu hết hạn thành công!");
        handleCloseUpdateProcessModal();
        queryClient.invalidateQueries({ queryKey: ["materials"] });
      },
      onError: (error) => {
        message.error(error.message || "Xử lý nguyên liệu hết hạn thất bại!");
      },
    });
  };

  const filteredMaterials = useMemo(
    () =>
      materials?.filter((material) => {
        const matchesSearch =
          material.name.toLowerCase().includes(searchText.toLowerCase()) ||
          material.materialId?.toString().includes(searchText);
        return matchesSearch;
      }),
    [materials, searchText]
  );

  // --- HÀM XỬ LÝ MÃ VẠCH TỪ MÁY QUÉT ---
  const handleScan = useCallback(
    (scannedCode: string) => {
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

      const expectedBarcodeValue = getBarcodeValueFromUrl(
        selectedMaterial.barcode
      );

      if (scannedCode.trim() === expectedBarcodeValue) {
        message.loading({
          content: "Đang cập nhật số lượng...",
          key: "update_quantity",
        });
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
              message.error({
                content: error.message || "Cập nhật thất bại!",
                key: "update_quantity",
                duration: 2,
              });
            },
          }
        );
      } else {
        message.error("Mã vạch không khớp với nguyên liệu đang xem!", 3);
      }
    },
    [selectedMaterial, increaseMaterialQuantity, queryClient]
  );

  // --- HOOK LẮNG NGHE SỰ KIỆN TỪ MÁY QUÉT (KEYBOARD) ---
  useEffect(() => {
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

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isDetailModalVisible, handleScan]);

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
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#A05A2C", fontSize: 17 }} />}
              onClick={() => handleOpenEditModal(record)}
              style={{ outline: "none", boxShadow: "none", border: "none" }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined style={{ fontSize: 17 }} />}
              onClick={() => handleOpenDeleteModal(record)}
              style={{ outline: "none", boxShadow: "none", border: "none" }}
            />
          </Tooltip>
          {record.isExpired === true && record.isProcessExpired === false && (
            <Tooltip title="Xử lý hết hạn">
              <Button
                type="text"
                danger
                icon={<SquareX style={{ fontSize: 17 }} />}
                onClick={() => handleOpenUpdateProcessModal(record)}
                style={{ outline: "none", boxShadow: "none", border: "none" }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const handleAddMaterial = () => {
    addForm
      .validateFields()
      .then((values) => {
        const materialData = {
          ...values,
          expireDate: values.expireDate,
          timeExpired: values.expireDate
            ? dayjs(values.expireDate).format("HH:mm:ss")
            : undefined,
        };
        createMaterial(materialData, {
          onSuccess: () => {
            message.success("Tạo nguyên liệu thành công!");
            setIsAddModalVisible(false);
            addForm.resetFields();
            queryClient.invalidateQueries({ queryKey: ["materials"] });
          },
          onError: (error) => {
            const errorMessage = (error as unknown as { responseValue: string })
              .responseValue;
            if (
              errorMessage ===
              "Quantity must be greater than 0 and less than 10000"
            ) {
              message.error("Số lượng phải lớn hơn 0 và nhỏ hơn 10000");
            } else {
              message.error(errorMessage);
            }
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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                background: "#D97B41",
                borderColor: "#D97B41",
                fontWeight: 600,
                borderRadius: 6,
              }}
              onClick={() => setIsAddModalVisible(true)}
            >
              Thêm nguyên liệu
            </Button>
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
                <Descriptions.Item label="Số lượng">
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
              <div
                style={{
                  textAlign: "center",
                  marginTop: "16px",
                  color: "#888",
                  fontStyle: "italic",
                }}
              >
                Sẵn sàng quét...
              </div>
            </div>
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
            addForm.resetFields();
          }}
          centered
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsAddModalVisible(false);
                addForm.resetFields();
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
          <Form
            form={addForm}
            name="addMaterialForm"
            layout="vertical"
            onFinish={handleAddMaterial}
          >
            <Form.Item
              name="name"
              label="Tên nguyên liệu"
              rules={[
                { required: true, message: "Vui lòng nhập tên nguyên liệu!" },
              ]}
            >
              <Input placeholder="Nhập tên nguyên liệu" />
            </Form.Item>
            <Form.Item
              name="quantity"
              label="Số ký(g)"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng!" },
                {
                  validator: (_, value) =>
                    value > 0 && value < 10000
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Số lượng phải lớn hơn 0 và nhỏ hơn 10000")
                        ),
                },
              ]}
            >
              <Input type="number" placeholder="Nhập số lượng" />
            </Form.Item>
            <Form.Item
              name="expireDate"
              label="Ngày hết hạn"
              rules={[
                { required: true, message: "Vui lòng chọn ngày hết hạn!" },
              ]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm:ss"
                disabledDate={(current) =>
                  current && current <= dayjs().endOf("day")
                }
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={
            <span style={{ color: "#D97B41", fontWeight: 700, fontSize: 22 }}>
              Chỉnh sửa nguyên liệu
            </span>
          }
          open={isEditModalVisible}
          onCancel={handleCloseEditModal}
          centered
          footer={[
            <Button key="cancel" onClick={handleCloseEditModal}>
              Hủy
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={() => editForm.submit()}
              loading={isUpdating}
              style={{ background: "#D97B41", borderColor: "#D97B41" }}
            >
              Lưu
            </Button>,
          ]}
          width={500}
        >
          <Form<UpdateMaterialDto>
            form={editForm}
            name="editMaterialForm"
            layout="vertical"
            onFinish={handleEdit}
            initialValues={
              selectedMaterial
                ? {
                    name: selectedMaterial.name,
                    quantity: selectedMaterial.quantity,
                    expireDate: selectedMaterial.expireDate
                      ? dayjs(selectedMaterial.expireDate)
                      : null,
                  }
                : undefined
            }
          >
            <Form.Item
              name="name"
              label="Tên nguyên liệu"
              rules={[
                { required: true, message: "Vui lòng nhập tên nguyên liệu!" },
              ]}
            >
              <Input placeholder="Nhập tên nguyên liệu" />
            </Form.Item>
            <Form.Item
              name="quantity"
              label="Số ký(g)"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng!" },
                {
                  validator: (_, value) =>
                    value > 0 && value < 10000
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Số lượng phải lớn hơn 0 và nhỏ hơn 10000")
                        ),
                },
              ]}
            >
              <Input type="number" placeholder="Nhập số lượng" />
            </Form.Item>
            <Form.Item
              name="expireDate"
              label="Ngày hết hạn"
              rules={[
                { required: true, message: "Vui lòng chọn ngày hết hạn!" },
              ]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm:ss"
                disabledDate={(current) =>
                  current && current <= dayjs().endOf("day")
                }
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={
            <span style={{ color: "#D97B41", fontWeight: 700, fontSize: 22 }}>
              Xác nhận xóa
            </span>
          }
          open={isDeleteModalVisible}
          onCancel={handleCloseDeleteModal}
          centered
          footer={[
            <Button key="cancel" onClick={handleCloseDeleteModal}>
              Hủy
            </Button>,
            <Button
              key="delete"
              type="primary"
              danger
              onClick={() => handleDelete(selectedMaterial?.materialId)}
              loading={isDeleting}
            >
              Xóa
            </Button>,
          ]}
          width={400}
        >
          <p>Bạn có chắc chắn muốn xóa nguyên liệu này không?</p>
        </Modal>

        <Modal
          title={
            <span style={{ color: "#D97B41", fontWeight: 700, fontSize: 22 }}>
              Xác nhận xử lý nguyên liệu hết hạn
            </span>
          }
          open={isUpdateProcessModalVisible}
          onCancel={handleCloseUpdateProcessModal}
          centered
          footer={[
            <Button key="cancel" onClick={handleCloseUpdateProcessModal}>
              Hủy
            </Button>,
            <Button
              key="delete"
              type="primary"
              danger
              onClick={() => handleUpdateProcess(selectedMaterial?.materialId)}
              loading={isUpdatingProcessMaterial}
            >
              Cập nhật
            </Button>,
          ]}
          width={400}
        >
          <p>Bạn có chắc chắn muốn xứ lý nguyên liệu này không?</p>
        </Modal>
      </div>
    </div>
  );
};

export default MaterialManagement;
