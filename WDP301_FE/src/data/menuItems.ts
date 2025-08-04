import type { MenuItem } from '../typings/pos.types'

export const menuItems: MenuItem[] = [
  // Cơm Tấm
  {
    id: '1',
    name: 'Cơm Tấm Sườn Nướng',
    price: 85000,
    description:
      'Sườn heo nướng thơm lừng, cơm tấm dẻo ngon, kèm dưa leo, cà chua và nước mắm pha',
    category: 'rice',
    image:
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '2',
    name: 'Cơm Tấm Bì Chả',
    price: 75000,
    description:
      'Cơm tấm truyền thống với bì heo và chả trứng, ăn kèm rau sống tươi mát',
    category: 'rice',
    image:
      'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '3',
    name: 'Cơm Tấm Đặc Biệt',
    price: 95000,
    description:
      'Combo đặc biệt với sườn nướng, chả trứng, bì và tất cả các món phụ truyền thống',
    category: 'rice',
    image:
      'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '4',
    name: 'Cơm Tấm Gà Nướng',
    price: 80000,
    description:
      'Gà nướng ướp gia vị đậm đà, cơm tấm và các món ăn kèm truyền thống',
    category: 'rice',
    image:
      'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '5',
    name: 'Cơm Tấm Chả Cá',
    price: 90000,
    description: 'Chả cá tự làm thơm ngon, cơm tấm và rau sống tươi mát',
    category: 'rice',
    image:
      'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '6',
    name: 'Cơm Tấm Tôm Nướng',
    price: 100000,
    description:
      'Tôm tươi nướng than hoa, cơm tấm và các món ăn kèm truyền thống',
    category: 'rice',
    image:
      'https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  // Món Phụ
  {
    id: '7',
    name: 'Chả Trứng',
    price: 25000,
    description: 'Chả trứng hấp truyền thống với thịt heo băm',
    category: 'sides',
    image:
      'https://images.pexels.com/photos/1640776/pexels-photo-1640776.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '8',
    name: 'Nem Nướng',
    price: 30000,
    description: 'Nem nướng Nha Trang thơm ngon, ăn kèm bánh tráng và rau thơm',
    category: 'sides',
    image:
      'https://images.pexels.com/photos/2338408/pexels-photo-2338408.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '9',
    name: 'Lạp Xưởng Nướng',
    price: 35000,
    description: 'Lạp xưởng tự làm nướng than hoa thơm lừng',
    category: 'sides',
    image:
      'https://images.pexels.com/photos/1640778/pexels-photo-1640778.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '10',
    name: 'Tôm Chiên Giòn',
    price: 40000,
    description: 'Tôm tươi chiên giòn rụm với lớp bột vàng ươm',
    category: 'sides',
    image:
      'https://images.pexels.com/photos/566345/pexels-photo-566345.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  // Đồ Uống
  {
    id: '11',
    name: 'Nước Ngọt',
    price: 15000,
    description: 'Các loại nước ngọt có gas mát lạnh',
    category: 'drinks',
    image:
      'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '12',
    name: 'Trà Đá',
    price: 10000,
    description: 'Trà đá truyền thống Việt Nam mát lạnh',
    category: 'drinks',
    image:
      'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '13',
    name: 'Nước Cam Tươi',
    price: 25000,
    description: 'Nước cam vắt tươi 100% không đường',
    category: 'drinks',
    image:
      'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '14',
    name: 'Cà Phê Sữa Đá',
    price: 20000,
    description: 'Cà phê phin truyền thống với sữa đặc ngọt ngào',
    category: 'drinks',
    image:
      'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  // Tráng Miệng
  {
    id: '15',
    name: 'Chè Ba Màu',
    price: 20000,
    description: 'Chè ba màu truyền thống với đậu xanh, đậu đỏ và thạch',
    category: 'desserts',
    image:
      'https://images.pexels.com/photos/1640779/pexels-photo-1640779.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '16',
    name: 'Bánh Flan',
    price: 15000,
    description: 'Bánh flan mềm mịn với caramel đậm đà',
    category: 'desserts',
    image:
      'https://images.pexels.com/photos/1640780/pexels-photo-1640780.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
]
