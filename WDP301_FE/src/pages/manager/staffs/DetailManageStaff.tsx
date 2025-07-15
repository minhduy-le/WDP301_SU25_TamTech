import React, { useState } from 'react';

interface KPI {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface ScheduleItem {
    day: string;
    shift: string;
    time: string;
}

interface Sale {
    id: string;
    date: string;
    total: number;
    status: 'Hoàn thành' | 'Đã hủy';
}

interface Note {
    id: number;
    date: string;
    content: string;
    managerName: string;
}

interface Employee {
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    avatarUrl: string;
    status: 'Đang làm việc' | 'Đang nghỉ phép';
    kpis: KPI[];
    schedule: ScheduleItem[];
    salesHistory: Sale[];
    notes: Note[];
}

interface AccountDetailProps {
  account: {
    id: number;
    fullName: string;
    email: string;
    phone_number: string;
    date_of_birth: string;
    note: string | null;
    role: string;
    isActive: boolean;
  };
}

const DollarIcon = (props: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const ReceiptIcon = (props: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
    </svg>
);

const StarIcon = (props: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
);


// --- FAKE DATA (Dữ liệu giả cho nhân viên được chọn) ---
const fakeEmployeeData: Employee = {
    id: 'NV001',
    name: 'Nguyễn Văn An',
    role: 'Nhân viên Phục vụ',
    email: 'an.nguyen@email.com',
    phone: '0901 234 567',
    avatarUrl: 'https://placehold.co/100x100/EFEFEF/333333?text=NA',
    status: 'Đang làm việc',
    kpis: [
        { label: 'Doanh thu tháng này', value: '35,500,000 VNĐ', icon: DollarIcon },
        { label: 'Số hóa đơn', value: '250', icon: ReceiptIcon },
        { label: 'Đánh giá trung bình', value: '4.8 / 5', icon: StarIcon },
    ],
    schedule: [
        { day: 'Thứ Hai, 09/06', shift: 'Ca Sáng', time: '07:00 - 15:00' },
        { day: 'Thứ Ba, 10/06', shift: 'Ca Sáng', time: '07:00 - 15:00' },
        { day: 'Thứ Tư, 11/06', shift: 'Ca Tối', time: '15:00 - 23:00' },
        { day: 'Thứ Sáu, 13/06', shift: 'Ca Tối', time: '15:00 - 23:00' },
        { day: 'Chủ Nhật, 15/06', shift: 'Ca Sáng', time: '07:00 - 15:00' },
    ],
    salesHistory: [
        { id: 'HD00125', date: '10/06/2025 12:30', total: 150000, status: 'Hoàn thành' },
        { id: 'HD00121', date: '10/06/2025 11:45', total: 250000, status: 'Hoàn thành' },
        { id: 'HD00115', date: '09/06/2025 20:10', total: 95000, status: 'Hoàn thành' },
        { id: 'HD00112', date: '09/06/2025 19:30', total: 180000, status: 'Đã hủy' },
    ],
    notes: [
        { id: 1, date: '01/06/2025', content: 'Có thái độ tốt với khách hàng, chủ động giới thiệu món mới.', managerName: 'Trần Văn Mạnh' },
        { id: 2, date: '25/05/2025', content: 'Cần chú ý hơn trong việc kiểm tra lại order trước khi gửi vào bếp.', managerName: 'Trần Văn Mạnh' },
    ],
};

// --- COMPONENT CHÍNH ---
const DetailManageStaff: React.FC<AccountDetailProps> = ({ account }) => {
  return (
    <div className="staff-detail-page">
      <style>{`
        :root {
          --primary-color: #d97706;
          --primary-hover: #b45309;
          --secondary-color: #78716c;
          --success-color: #16a34a;
          --danger-color: #dc2626;
          --warning-color: #d97706;
          --light-color: #fafaf9;
          --dark-color: #44403c;
          --border-color: #e7e5e4;
          --card-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          --font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        .staff-detail-page {
          font-family: var(--font-family);
          background-color: #f5f5f4;
          padding: 2rem;
          max-width: 500px;
          margin: 0 auto;
          min-height: 100px;
        }
        .card {
          background-color: white;
          border-radius: 1rem;
          box-shadow: var(--card-shadow);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid var(--border-color);
        }
        .profile-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          background: linear-gradient(to right, #ffffff, #fafaf9);
          border: 1px solid var(--border-color);
        }
        .profile-info h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--dark-color);
        }
        .profile-info p {
          margin: 0.5rem 0 0 0;
          color: var(--secondary-color);
          font-size: 1rem;
        }
        .profile-info .label {
          font-weight: 600;
          color: #a05a2c;
          margin-right: 8px;
        }
      `}</style>
      <div className="card profile-header">
        <div className="profile-info">
          <h1>{account.fullName}</h1>
          <p><span className="label">Email:</span> {account.email}</p>
          <p><span className="label">Số điện thoại:</span> {account.phone_number}</p>
          <p><span className="label">Ngày sinh:</span> {account.date_of_birth}</p>
          <p><span className="label">Vai trò:</span> {account.role}</p>
          <p><span className="label">Trạng thái:</span> {account.isActive ? 'Đang làm việc' : 'Đã nghỉ'}</p>
        </div>
      </div>
    </div>
  );
};

export default DetailManageStaff;