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
const DetailManageStaff: React.FC = () => {
    const [employee] = useState<Employee>(fakeEmployeeData);
    const [newNote, setNewNote] = useState('');

    const handleSaveNote = () => {
        if (newNote.trim() === '') {
            alert('Vui lòng nhập nội dung ghi chú.');
            return;
        }
        // Trong thực tế, bạn sẽ gọi API để lưu ghi chú này
        alert(`Đã lưu ghi chú mới: "${newNote}"`);
        // Thêm ghi chú mới vào danh sách để UI cập nhật (tạm thời)
        const addedNote: Note = {
            id: Date.now(),
            date: new Date().toLocaleDateString('vi-VN'),
            content: newNote,
            managerName: 'Current Manager' // Lấy tên manager đang đăng nhập
        };
        // Cập nhật state (trong ứng dụng thực)
        console.log(addedNote);
        setNewNote('');
    };

    return (
        <div className="staff-detail-page">
            <style>{`
                :root {
                    --primary-color: #007bff;
                    --secondary-color: #6c757d;
                    --success-color: #28a745;
                    --danger-color: #dc3545;
                    --warning-color: #ffc107;
                    --light-color: #f8f9fa;
                    --dark-color: #343a40;
                    --border-color: #dee2e6;
                    --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .staff-detail-page {
                    font-family: var(--font-family);
                    background-color: #f4f7fa;
                    padding: 30px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .card {
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    padding: 25px;
                    margin-bottom: 25px;
                }
                h2 {
                    font-size: 1.25rem;
                    margin-top: 0;
                    margin-bottom: 20px;
                    color: var(--dark-color);
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 10px;
                }
                
                /* Profile Header */
                .profile-header {
                    display: flex;
                    align-items: center;
                    gap: 25px;
                }
                .profile-avatar {
                    width: 90px;
                    height: 90px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid var(--primary-color);
                }
                .profile-info h1 {
                    margin: 0;
                    font-size: 1.8rem;
                }
                .profile-info p {
                    margin: 5px 0 0 0;
                    color: var(--secondary-color);
                }
                .profile-actions {
                    margin-left: auto;
                    display: flex;
                    gap: 10px;
                }
                .btn {
                    padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer;
                    text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: opacity 0.3s;
                }
                .btn-primary { background-color: var(--primary-color); color: white; }
                .btn-secondary { background-color: #6c757d; color: white; }

                /* KPI Grid */
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                }
                .kpi-item {
                    display: flex;
                    align-items: center;
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                }
                .kpi-icon {
                    width: 40px;
                    height: 40px;
                    color: var(--primary-color);
                    margin-right: 15px;
                }
                .kpi-text .value {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--dark-color);
                }
                .kpi-text .label {
                    font-size: 0.9rem;
                    color: var(--secondary-color);
                }
                
                /* Tables */
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 12px 15px; border-bottom: 1px solid var(--border-color); text-align: left; }
                th { font-size: 0.8rem; text-transform: uppercase; color: var(--secondary-color); }
                .status-hoanthanh { color: var(--success-color); }
                .status-dahuy { color: var(--danger-color); }

                /* Notes Section */
                .note-item {
                    border-bottom: 1px dashed var(--border-color);
                    padding: 15px 0;
                }
                .note-item:last-child { border-bottom: none; }
                .note-content { margin: 0 0 8px 0; }
                .note-meta { font-size: 0.8rem; color: var(--secondary-color); }
                .note-input-area { margin-top: 20px; }
                textarea {
                    width: 100%;
                    padding: 10px;
                    border-radius: 5px;
                    border: 1px solid var(--border-color);
                    font-family: var(--font-family);
                    min-height: 80px;
                    margin-bottom: 10px;
                }
            `}</style>

            {/* --- 1. THÔNG TIN CÁ NHÂN --- */}
            <div className="card profile-header">
                <img src={employee.avatarUrl} alt={employee.name} className="profile-avatar" />
                <div className="profile-info">
                    <h1>{employee.name}</h1>
                    <p>{employee.role} | {employee.email} | {employee.phone}</p>
                </div>
                <div className="profile-actions">
                    <button className="btn btn-secondary">Đặt lại mật khẩu</button>
                    <button className="btn btn-primary">Chỉnh sửa</button>
                </div>
            </div>

            {/* --- 2. HIỆU SUẤT LÀM VIỆC (KPIs) --- */}
            <div className="card">
                <h2>Hiệu suất Tháng này</h2>
                <div className="kpi-grid">
                    {employee.kpis.map((kpi, index) => (
                        <div key={index} className="kpi-item">
                            <kpi.icon className="kpi-icon" />
                            <div className="kpi-text">
                                <div className="value">{kpi.value}</div>
                                <div className="label">{kpi.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- 3. LỊCH LÀM VIỆC & LỊCH SỬ BÁN HÀNG --- */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '25px' }}>
                <div className="card">
                    <h2>Lịch làm việc tuần này</h2>
                    <table>
                        <tbody>
                            {employee.schedule.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <strong>{item.day}</strong><br />
                                        <small>{item.shift} ({item.time})</small>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="card">
                    <h2>Lịch sử Bán hàng gần đây</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID Hóa đơn</th>
                                <th>Ngày giờ</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employee.salesHistory.map(sale => (
                                <tr key={sale.id}>
                                    <td>{sale.id}</td>
                                    <td>{sale.date}</td>
                                    <td>{sale.total.toLocaleString('vi-VN')} VNĐ</td>
                                    <td className={sale.status === 'Hoàn thành' ? 'status-hoanthanh' : 'status-dahuy'}>
                                        {sale.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- 4. GHI CHÚ & PHẢN HỒI --- */}
            <div className="card">
                <h2>Ghi chú & Phản hồi</h2>
                <div className="notes-list">
                    {employee.notes.map(note => (
                        <div key={note.id} className="note-item">
                            <p className="note-content">{note.content}</p>
                            <div className="note-meta">
                                Ghi chú bởi <strong>{note.managerName}</strong> vào ngày {note.date}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="note-input-area">
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder={`Thêm ghi chú mới cho ${employee.name}...`}
                    />
                    <button className="btn btn-primary" onClick={handleSaveNote}>Lưu Ghi Chú</button>
                </div>
            </div>
        </div>
    );
};
export default DetailManageStaff;