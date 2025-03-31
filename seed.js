const mongoose = require("mongoose");
const userSchema = require("./schemas/user");
const roleSchema = require("./schemas/role");
const categorySchema = require("./schemas/category");
const productSchema = require("./schemas/product");
const constants = require("./utils/constants");
const bcrypt = require("bcrypt");

// Kết nối database
mongoose
  .connect(constants.MONGODB_URI)
  .then(() => console.log("Đã kết nối database"))
  .catch((err) => console.error("Lỗi kết nối database:", err));

// Dữ liệu mẫu cho roles
const roles = [{ name: "admin" }, { name: "mod" }, { name: "user" }];

// Hàm hash password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Dữ liệu mẫu cho users
const users = [
  {
    username: "admin",
    password: await hashPassword("admin123"),
    email: "admin@example.com",
    role: "admin",
  },
  {
    username: "moderator",
    password: await hashPassword("mod123"),
    email: "mod@example.com",
    role: "mod",
  },
  {
    username: "user1",
    password: await hashPassword("user123"),
    email: "user1@example.com",
    role: "user",
  },
];

// Dữ liệu mẫu cho categories
const categories = [
  { name: "Điện thoại" },
  { name: "Laptop" },
  { name: "Máy tính bảng" },
  { name: "Phụ kiện" },
];

// Dữ liệu mẫu cho products
const products = [
  {
    name: "iPhone 13",
    price: 999.99,
    quantity: 50,
    category: "Điện thoại",
  },
  {
    name: "MacBook Pro M1",
    price: 1299.99,
    quantity: 30,
    category: "Laptop",
  },
  {
    name: "iPad Pro 12.9",
    price: 799.99,
    quantity: 25,
    category: "Máy tính bảng",
  },
  {
    name: "Tai nghe AirPods Pro",
    price: 249.99,
    quantity: 100,
    category: "Phụ kiện",
  },
];

// Hàm seed database
async function seedDatabase() {
  try {
    // Xóa dữ liệu cũ
    await Promise.all([
      roleSchema.deleteMany({}),
      userSchema.deleteMany({}),
      categorySchema.deleteMany({}),
      productSchema.deleteMany({}),
    ]);

    // Thêm dữ liệu mới
    const createdRoles = await roleSchema.insertMany(roles);
    console.log("Đã thêm roles");

    const createdUsers = await userSchema.insertMany(users);
    console.log("Đã thêm users");

    const createdCategories = await categorySchema.insertMany(categories);
    console.log("Đã thêm categories");

    // Cập nhật category ID cho products
    const productsWithCategoryIds = products.map((product) => {
      const category = createdCategories.find(
        (cat) => cat.name === product.category
      );
      return {
        ...product,
        category: category._id,
      };
    });

    await productSchema.insertMany(productsWithCategoryIds);
    console.log("Đã thêm products");

    console.log("Đã hoàn thành seed database");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi khi seed database:", error);
    process.exit(1);
  }
}

// Chạy seed
seedDatabase();
