import React from 'react';

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