import React from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import type { MenuItem } from "../../typings/pos.types";

interface MenuGridProps {
  filteredItems: MenuItem[];
  searchTerm: string;
  priceFilter: string;
  onItemClick: (item: MenuItem) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
  filteredItems,
  searchTerm,
  priceFilter,
  onItemClick,
  onClearFilters,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-amber-600 font-medium">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="text-amber-700">
          {searchTerm || priceFilter !== "all" ? (
            <span className="font-medium">
              Tìm thấy <span className="font-bold">{filteredItems.length}</span>{" "}
              món ăn
              {searchTerm && (
                <span>
                  {" "}
                  cho "<span className="text-amber-600">{searchTerm}</span>"
                </span>
              )}
            </span>
          ) : (
            <span className="font-medium">
              <span className="font-bold">{filteredItems.length}</span> món ăn
              trong danh mục
            </span>
          )}
        </div>

        {(searchTerm || priceFilter !== "all") && (
          <button
            onClick={onClearFilters}
            className="text-amber-600 hover:text-amber-700 font-medium px-3 py-1 rounded hover:bg-amber-50 transition-colors border border-amber-200"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-amber-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Search className="h-12 w-12 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-amber-700 mb-3">
            Không tìm thấy món ăn
          </h3>
          <p className="text-amber-600 mb-6">
            {searchTerm
              ? `Không có món nào phù hợp với "${searchTerm}"`
              : "Thử thay đổi bộ lọc để xem thêm món ăn"}
          </p>
          <button
            onClick={onClearFilters}
            className="bg-amber-100 text-amber-700 px-6 py-2 rounded-lg hover:bg-amber-200 transition-colors font-medium border border-amber-300"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onItemClick(item)}
            className="bg-white rounded-lg border border-amber-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
          >
            <div className="relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
            </div>

            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-bold text-amber-800 mb-2">
                {item.name.toUpperCase()}
              </h3>
              <p
                className="text-amber-600 text-sm mb-3 line-clamp-2"
                style={{
                  minHeight: 40,
                  maxHeight: 40,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
                title={item.description}
              >
                {item.description.length > 120
                  ? item.description.slice(0, 117) + "..."
                  : item.description}
              </p>
              {/* {item.ProductRecipes && item.ProductRecipes.length > 0 && (
                <div className="text-xs text-gray-600 mb-2">
                  <div className="font-medium text-amber-600 mb-1">
                    Nguyên liệu:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {item.product.ProductRecipes.map((recipe) => (
                      <li key={recipe.productRecipeId}>
                        {recipe.Material?.name} – {recipe.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              )} */}
              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="font-bold text-amber-700">
                  {item.price.toLocaleString()}đ
                </span>
                <div className="bg-amber-100 text-amber-700 p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
