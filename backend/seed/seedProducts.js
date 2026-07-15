import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

dotenv.config();

const products = [
  {
    name: "Wireless Noise Cancelling Headphones",
    slug: "wireless-noise-cancelling-headphones",
    description:
      "Over-ear wireless headphones with active noise cancellation, 30-hour battery life, and premium sound quality.",
    price: 4999,
    discountPrice: 3999,
    category: "Electronics",
    brand: "SoundWave",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"],
    stock: 50,
    isFeatured: true,
  },
  {
    name: "Smart Fitness Watch",
    slug: "smart-fitness-watch",
    description:
      "Track heart rate, sleep, steps, and workouts with this water-resistant smart fitness watch with a 7-day battery.",
    price: 2999,
    discountPrice: 2499,
    category: "Electronics",
    brand: "FitTrack",
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"],
    stock: 80,
    isFeatured: true,
  },
  {
    name: "Mechanical Gaming Keyboard",
    slug: "mechanical-gaming-keyboard",
    description: "RGB backlit mechanical keyboard with hot-swappable switches, built for gaming and typing comfort.",
    price: 3499,
    discountPrice: 0,
    category: "Electronics",
    brand: "KeyForge",
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600"],
    stock: 40,
    isFeatured: false,
  },
  {
    name: "Men's Running Shoes",
    slug: "mens-running-shoes",
    description: "Lightweight breathable running shoes with cushioned soles for all-day comfort.",
    price: 1999,
    discountPrice: 1499,
    category: "Footwear",
    brand: "StrideX",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"],
    stock: 100,
    isFeatured: true,
  },
  {
    name: "Stainless Steel Water Bottle",
    slug: "stainless-steel-water-bottle",
    description: "Insulated stainless steel bottle keeps drinks cold for 24 hours or hot for 12 hours. 1L capacity.",
    price: 699,
    discountPrice: 499,
    category: "Home & Kitchen",
    brand: "HydroLife",
    images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600"],
    stock: 150,
    isFeatured: false,
  },
  {
    name: "Backpack for Laptop & Travel",
    slug: "backpack-for-laptop-and-travel",
    description: "Water-resistant 30L backpack with padded laptop compartment, USB charging port, and anti-theft zippers.",
    price: 1799,
    discountPrice: 1299,
    category: "Bags",
    brand: "UrbanCarry",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"],
    stock: 60,
    isFeatured: true,
  },
  {
    name: "Bluetooth Portable Speaker",
    slug: "bluetooth-portable-speaker",
    description: "Compact waterproof Bluetooth speaker with 12-hour playtime and deep bass.",
    price: 1499,
    discountPrice: 999,
    category: "Electronics",
    brand: "SoundWave",
    images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600"],
    stock: 70,
    isFeatured: false,
  },
  {
    name: "Cotton Casual T-Shirt",
    slug: "cotton-casual-t-shirt",
    description: "100% cotton breathable t-shirt, available in multiple colors, perfect for everyday wear.",
    price: 499,
    discountPrice: 349,
    category: "Clothing",
    brand: "BasicWear",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600"],
    stock: 200,
    isFeatured: false,
  },
  {
    name: "27-inch 4K Monitor",
    slug: "27-inch-4k-monitor",
    description: "Ultra HD 4K IPS monitor with 99% sRGB coverage, HDR support, and adjustable stand. Great for design and coding.",
    price: 24999,
    discountPrice: 21999,
    category: "Electronics",
    brand: "ViewPro",
    images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600"],
    stock: 25,
    isFeatured: true,
  },
  {
    name: "Wireless Mouse",
    slug: "wireless-mouse",
    description: "Ergonomic wireless mouse with silent clicks, adjustable DPI, and a 12-month battery life.",
    price: 899,
    discountPrice: 649,
    category: "Electronics",
    brand: "KeyForge",
    images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600"],
    stock: 120,
    isFeatured: false,
  },
  {
    name: "Women's Yoga Leggings",
    slug: "womens-yoga-leggings",
    description: "High-waisted, squat-proof yoga leggings with four-way stretch fabric and a hidden waistband pocket.",
    price: 1299,
    discountPrice: 999,
    category: "Clothing",
    brand: "FlexFit",
    images: ["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600"],
    stock: 90,
    isFeatured: true,
  },
  {
    name: "Ceramic Coffee Mug Set (Set of 4)",
    slug: "ceramic-coffee-mug-set",
    description: "Set of 4 handcrafted ceramic mugs, microwave and dishwasher safe, 350ml capacity each.",
    price: 999,
    discountPrice: 799,
    category: "Home & Kitchen",
    brand: "HomeCraft",
    images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600"],
    stock: 75,
    isFeatured: false,
  },
  {
    name: "Leather Wallet for Men",
    slug: "leather-wallet-for-men",
    description: "Genuine leather bifold wallet with RFID-blocking technology, 8 card slots, and a coin pocket.",
    price: 1199,
    discountPrice: 849,
    category: "Bags",
    brand: "UrbanCarry",
    images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=600"],
    stock: 65,
    isFeatured: false,
  },
  {
    name: "Air Fryer 4L",
    slug: "air-fryer-4l",
    description: "Compact 4-litre air fryer with digital touch panel, 8 preset cooking modes, and oil-free frying.",
    price: 4499,
    discountPrice: 3599,
    category: "Home & Kitchen",
    brand: "HomeCraft",
    images: ["https://images.unsplash.com/photo-1648223673812-fca5c56b3f31?w=600"],
    stock: 35,
    isFeatured: true,
  },
  {
    name: "Sunglasses UV Protection",
    slug: "sunglasses-uv-protection",
    description: "Polarized unisex sunglasses with 100% UV400 protection and a scratch-resistant lens coating.",
    price: 799,
    discountPrice: 549,
    category: "Accessories",
    brand: "StrideX",
    images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600"],
    stock: 110,
    isFeatured: false,
  },
];

// ---------- Bulk generated catalog (~100 products) ----------
// 30% Computer Parts | 40% Electronics | 10% T-Shirts | 10% Lights | 10% Other
const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const computerParts = [
  { name: "Intel Core i5 12400F Processor", brand: "Intel", price: 12999, img: "1591405351990-4726e331f141" },
  { name: "AMD Ryzen 5 5600X Processor", brand: "AMD", price: 15999, img: "1555617981-dac3880eac6e" },
  { name: "NVIDIA RTX 4060 Graphics Card", brand: "NVIDIA", price: 32999, img: "1591488320449-011701bb6704" },
  { name: "AMD Radeon RX 6600 Graphics Card", brand: "AMD", price: 24999, img: "1587831990711-23ca6441447b" },
  { name: "16GB DDR4 RAM (3200MHz)", brand: "Corsair", price: 3499, img: "1562976540-1502c2145186" },
  { name: "32GB DDR4 RAM Kit (2x16GB)", brand: "Corsair", price: 6999, img: "1601275639647-c78ccec3a9d6" },
  { name: "1TB NVMe SSD", brand: "Samsung", price: 5999, img: "1591799264318-7e6ef8ddb7ea" },
  { name: "2TB NVMe SSD", brand: "Samsung", price: 10999, img: "1600861195091-690c92f1339c" },
  { name: "500GB SATA SSD", brand: "WD", price: 2799, img: "1587202372616-b43abea06c2a" },
  { name: "B550 Motherboard (AM4)", brand: "ASUS", price: 8999, img: "1518770660439-4636190af475" },
  { name: "Z690 Motherboard (LGA1700)", brand: "MSI", price: 14999, img: "1591799264318-1d7215e9d6c1" },
  { name: "650W 80+ Bronze PSU", brand: "Corsair", price: 4499, img: "1587202372634-32705e3bf49c" },
  { name: "750W 80+ Gold PSU", brand: "Corsair", price: 6499, img: "1591405351990-6dbee9271ac4" },
  { name: "Mid Tower ATX Cabinet", brand: "NZXT", price: 3999, img: "1587202372775-e229f172b9d7" },
  { name: "RGB Mid Tower Cabinet", brand: "Cooler Master", price: 4999, img: "1587202372982-52d5c74e1e5f" },
  { name: "120mm CPU Air Cooler", brand: "Cooler Master", price: 1999, img: "1587202372598-c9e3d5e5a9c1" },
  { name: "240mm AIO Liquid Cooler", brand: "NZXT", price: 6999, img: "1624705013573-6c8dda6b8e5b" },
  { name: "PCIe Wi-Fi 6 Adapter Card", brand: "TP-Link", price: 2499, img: "1544197150-b99a580bb7a8" },
  { name: "USB 3.0 4-Port Hub", brand: "Anker", price: 899, img: "1587202372582-9f1de5b1c53f" },
  { name: "HDMI 2.1 Cable (2m)", brand: "Amazon Basics", price: 499, img: "1625948515291-69613efd103f" },
  { name: "SATA to USB Adapter Cable", brand: "UGREEN", price: 699, img: "1625961332771-3f40b0e2bdcf" },
  { name: "Thermal Paste (High Performance)", brand: "Arctic", price: 599, img: "1518770660439-4636190af475" },
  { name: "Case Fan 120mm RGB (3-pack)", brand: "Cooler Master", price: 2299, img: "1587202372775-e229f172b9d7" },
  { name: "M.2 SSD Heatsink", brand: "Corsair", price: 899, img: "1591799264318-7e6ef8ddb7ea" },
  { name: "External 1TB Portable HDD", brand: "WD", price: 3999, img: "1600861195091-690c92f1339c" },
  { name: "External 2TB Portable HDD", brand: "Seagate", price: 5999, img: "1600861195136-fe1e6ec84c2c" },
  { name: "128GB USB 3.1 Pendrive", brand: "SanDisk", price: 1299, img: "1618410320928-25228d811631" },
  { name: "256GB microSD Card", brand: "SanDisk", price: 1899, img: "1618410320928-a9e1e2c8b98d" },
  { name: "PCIe Gen4 NVMe SSD 1TB", brand: "Western Digital", price: 7999, img: "1587202372616-b43abea06c2a" },
  { name: "Graphics Card Support Bracket", brand: "Cooler Master", price: 599, img: "1587202372982-52d5c74e1e5f" },
];

const electronics = [
  { name: "Smartphone 128GB (6.5-inch AMOLED)", brand: "Redmi", price: 15999, img: "1511707171634-5f897ff02aa9" },
  { name: "Smartphone 256GB (Triple Camera)", brand: "Samsung", price: 24999, img: "1592286927505-1def25115481" },
  { name: "Budget Smartphone 64GB", brand: "Realme", price: 9999, img: "1598965675045-45c5e72c7d05" },
  { name: "10-inch Android Tablet", brand: "Lenovo", price: 12999, img: "1544244015-0df4b3ffc6b0" },
  { name: "iPad-style Tablet 11-inch", brand: "Samsung", price: 27999, img: "1561154464-82e9adf32764" },
  { name: "13-inch Laptop (i5, 8GB RAM)", brand: "HP", price: 42999, img: "1496181133206-80ce9b88a853" },
  { name: "15.6-inch Gaming Laptop (RTX 3050)", brand: "ASUS", price: 68999, img: "1603302576837-37561b2e2302" },
  { name: "14-inch Ultrabook (Ryzen 5)", brand: "Lenovo", price: 45999, img: "1588872657578-7efd1f1555ed" },
  { name: "Smart LED TV 43-inch", brand: "Mi", price: 21999, img: "1593359677879-a4bb92f829d1" },
  { name: "Smart LED TV 55-inch 4K", brand: "Samsung", price: 39999, img: "1509281373149-e957c6296406" },
  { name: "Soundbar with Subwoofer", brand: "JBL", price: 6999, img: "1545454675-3531b543be5d" },
  { name: "True Wireless Earbuds", brand: "boAt", price: 1499, img: "1590658268037-6bf12165a8df" },
  { name: "Over-Ear Studio Headphones", brand: "Sony", price: 5999, img: "1505740420928-5e560c06d30e" },
  { name: "Gaming Headset with Mic", brand: "Logitech", price: 2999, img: "1599669454699-248893623440" },
  { name: "Smartwatch with GPS", brand: "Noise", price: 3499, img: "1523275335684-37898b6baf30" },
  { name: "Fitness Band", brand: "Mi", price: 1799, img: "1557935728-e6d1eaabe558" },
  { name: "Digital Camera 24MP", brand: "Canon", price: 32999, img: "1502920917128-1aa500764cbd" },
  { name: "Action Camera 4K", brand: "GoPro", price: 24999, img: "1526170375885-4d8ecf77b99f" },
  { name: "Home Security Camera (WiFi)", brand: "TP-Link", price: 2299, img: "1558002038-1055907dd693" },
  { name: "Video Doorbell Camera", brand: "Ring", price: 6999, img: "1558618047-3c8c76ca7d13" },
  { name: "Bluetooth Portable Speaker Mini", brand: "JBL", price: 1999, img: "1608043152269-423dbba4e7e1" },
  { name: "Party Speaker with Lights", brand: "Sony", price: 8999, img: "1545454675-3531b543be5d" },
  { name: "Power Bank 20000mAh", brand: "Anker", price: 1999, img: "1609592424881-b9d5b5b1f5a3" },
  { name: "Fast Charger 65W GaN", brand: "Anker", price: 2499, img: "1583863788434-e58a36330cf0" },
  { name: "Wireless Charging Pad", brand: "Belkin", price: 1499, img: "1591290619762-c5ed587bc21c" },
  { name: "Home Wi-Fi Router AC1200", brand: "TP-Link", price: 2499, img: "1544197150-b99a580bb7a8" },
  { name: "Mesh Wi-Fi System (2-pack)", brand: "TP-Link", price: 6999, img: "1606904825846-647eb07f5be2" },
  { name: "Electric Kettle 1.8L", brand: "Philips", price: 1499, img: "1602143407151-7111542de6e8" },
  { name: "Induction Cooktop", brand: "Prestige", price: 2299, img: "1585659722983-3a675dabf23d" },
  { name: "Handheld Vacuum Cleaner", brand: "Eureka Forbes", price: 3999, img: "1567694913366-2244a6d5b1b3" },
  { name: "Robot Vacuum Cleaner", brand: "Mi", price: 15999, img: "1518632275313-16354c05c05f" },
  { name: "Electric Trimmer", brand: "Philips", price: 999, img: "1585232351009-aa87416fca90" },
  { name: "Hair Dryer 1800W", brand: "Philips", price: 1299, img: "1522338140262-f46f5913618a" },
  { name: "Digital Weighing Scale", brand: "Dr Trust", price: 799, img: "1576678927484-cc907957088c" },
  { name: "Electric Toothbrush", brand: "Oral-B", price: 1999, img: "1607613009820-a29f7bb81c04" },
  { name: "Mini Projector Portable", brand: "BenQ", price: 8999, img: "1596526131083-e8c633c948d2" },
  { name: "USB Webcam 1080p", brand: "Logitech", price: 2499, img: "1587202372582-9f1de5b1c53f" },
  { name: "27-inch Full HD Monitor", brand: "Dell", price: 11999, img: "1527443224154-c4a3942d3acf" },
  { name: "24-inch Curved Monitor", brand: "Samsung", price: 13999, img: "1547082299-de196ea013d6" },
  { name: "Mechanical Keyboard Wireless", brand: "Logitech", price: 3999, img: "1587829741301-dc798b83add3" },
  { name: "Ergonomic Wireless Mouse", brand: "Logitech", price: 1299, img: "1527864550417-7fd91fc51a46" },
];

const tshirts = [
  { name: "Graphic Print T-Shirt", brand: "BasicWear", price: 599, img: "1521572163474-6864f9cf17ab" },
  { name: "Polo T-Shirt Cotton", brand: "BasicWear", price: 799, img: "1586790170083-2f9ceadc732d" },
  { name: "Oversized Streetwear T-Shirt", brand: "UrbanThread", price: 899, img: "1521572163474-6864f9cf17ab" },
  { name: "V-Neck Plain T-Shirt", brand: "BasicWear", price: 449, img: "1503341504253-dff4815485f1" },
  { name: "Full Sleeve Henley T-Shirt", brand: "UrbanThread", price: 899, img: "1618354691373-d851c5c3a990" },
  { name: "Striped Casual T-Shirt", brand: "BasicWear", price: 649, img: "1554568218-0f1715e72254" },
  { name: "Sports Dry-Fit T-Shirt", brand: "FlexFit", price: 799, img: "1571945153237-4929e783af4a" },
  { name: "Round Neck Plain T-Shirt (Pack of 3)", brand: "BasicWear", price: 1199, img: "1576566588028-4147f3842f27" },
  { name: "Denim Print T-Shirt", brand: "UrbanThread", price: 749, img: "1503341504253-dff4815485f1" },
  { name: "Anime Graphic T-Shirt", brand: "UrbanThread", price: 699, img: "1622445275576-721325763afe" },
];

const lights = [
  { name: "Smart LED Bulb (WiFi, Color)", brand: "Wipro", price: 599, img: "1550985616-10810253b84d" },
  { name: "LED Strip Lights 5m (RGB)", brand: "Philips", price: 999, img: "1610296669228-602fa827fc1f" },
  { name: "Ceiling Panel Light 18W", brand: "Havells", price: 449, img: "1524484485831-a92ffc0de03f" },
  { name: "Rechargeable Emergency Light", brand: "Havells", price: 799, img: "1519710164239-da123dc03ef4" },
  { name: "Solar Garden Lights (Set of 4)", brand: "Philips", price: 1299, img: "1558618666-fcd25c85cd64" },
  { name: "Study Table LED Lamp", brand: "Wipro", price: 699, img: "1543198126-a8ad8e47bd60" },
  { name: "Motion Sensor LED Light", brand: "Havells", price: 549, img: "1519710164239-da123dc03ef4" },
  { name: "Decorative Fairy Lights (10m)", brand: "Generic", price: 399, img: "1512909006721-3d6018887383" },
  { name: "Smart Wi-Fi Plug with LED Indicator", brand: "Mi", price: 799, img: "1558002038-1055907dd693" },
  { name: "Diwali String Lights (Warm White)", brand: "Generic", price: 349, img: "1512909006721-3d6018887383" },
];

const otherItems = [
  { name: "Yoga Mat Anti-Slip", brand: "FlexFit", price: 899, category: "Sports", img: "1592432678016-e910b452f9a2" },
  { name: "Adjustable Dumbbell Set", brand: "FlexFit", price: 2999, category: "Sports", img: "1638536532686-d610adfc8e5c" },
  { name: "Camping Tent (2-Person)", brand: "Wildcraft", price: 3499, category: "Outdoor", img: "1504280390367-361c6d9f38f4" },
  { name: "Insulated Lunch Box", brand: "HomeCraft", price: 599, category: "Home & Kitchen", img: "1600335895229-6e75511892c8" },
  { name: "Scented Candles Gift Set", brand: "Generic", price: 799, category: "Home & Kitchen", img: "1602874801007-bd458bb1b8b6" },
  { name: "Notebook Diary Set (Pack of 3)", brand: "Generic", price: 349, category: "Stationery", img: "1531346878377-a5be20888e57" },
  { name: "Board Game - Strategy Edition", brand: "Generic", price: 1499, category: "Toys & Games", img: "1610890716171-6b1bb98ffd09" },
  { name: "Kids Building Blocks Set", brand: "Generic", price: 999, category: "Toys & Games", img: "1587654780291-39c9404d746b" },
  { name: "Car Phone Mount Holder", brand: "UGREEN", price: 499, category: "Accessories", img: "1601972599720-36938d4ecd31" },
  { name: "Travel Toiletry Organizer Bag", brand: "UrbanCarry", price: 699, category: "Bags", img: "1553062407-98eeb64c6a62" },
];

const buildBulkProducts = () => {
  const bulk = [];

  computerParts.forEach((item, i) => {
    bulk.push({
      name: item.name,
      slug: slugify(`${item.name}-${i}`),
      description: `${item.name} from ${item.brand}. Reliable performance and build quality, ideal for upgrading or building a new PC.`,
      price: item.price,
      discountPrice: Math.random() > 0.5 ? Math.round(item.price * 0.88) : 0,
      category: "Computer Parts",
      brand: item.brand,
      images: [`https://images.unsplash.com/photo-${item.img}?w=600`],
      stock: Math.floor(Math.random() * 80) + 10,
      isFeatured: i < 3,
    });
  });

  electronics.forEach((item, i) => {
    bulk.push({
      name: item.name,
      slug: slugify(`${item.name}-${i}`),
      description: `${item.name} by ${item.brand} — dependable everyday electronics with solid reviews and after-sales support.`,
      price: item.price,
      discountPrice: Math.random() > 0.5 ? Math.round(item.price * 0.85) : 0,
      category: "Electronics",
      brand: item.brand,
      images: [`https://images.unsplash.com/photo-${item.img}?w=600`],
      stock: Math.floor(Math.random() * 100) + 10,
      isFeatured: i < 4,
    });
  });

  tshirts.forEach((item, i) => {
    bulk.push({
      name: item.name,
      slug: slugify(`${item.name}-${i}`),
      description: `${item.name} made from breathable, durable fabric. Machine washable and available in multiple colors.`,
      price: item.price,
      discountPrice: Math.random() > 0.5 ? Math.round(item.price * 0.75) : 0,
      category: "Clothing",
      brand: item.brand,
      images: [`https://images.unsplash.com/photo-${item.img}?w=600`],
      stock: Math.floor(Math.random() * 150) + 20,
      isFeatured: i < 2,
    });
  });

  lights.forEach((item, i) => {
    bulk.push({
      name: item.name,
      slug: slugify(`${item.name}-${i}`),
      description: `${item.name} from ${item.brand}. Energy efficient, long-lasting, easy to install.`,
      price: item.price,
      discountPrice: Math.random() > 0.5 ? Math.round(item.price * 0.8) : 0,
      category: "Lighting",
      brand: item.brand,
      images: [`https://images.unsplash.com/photo-${item.img}?w=600`],
      stock: Math.floor(Math.random() * 90) + 15,
      isFeatured: i < 2,
    });
  });

  otherItems.forEach((item, i) => {
    bulk.push({
      name: item.name,
      slug: slugify(`${item.name}-${i}`),
      description: `${item.name} by ${item.brand}. A handy addition for everyday life, built to last.`,
      price: item.price,
      discountPrice: Math.random() > 0.5 ? Math.round(item.price * 0.82) : 0,
      category: item.category,
      brand: item.brand,
      images: [`https://images.unsplash.com/photo-${item.img}?w=600`],
      stock: Math.floor(Math.random() * 70) + 10,
      isFeatured: false,
    });
  });

  return bulk;
};

const bulkProducts = buildBulkProducts();
products.push(...bulkProducts);

const seedData = async () => {
  try {
    await connectDB();

    await Product.deleteMany();
    await Product.insertMany(products);
    console.log(`${products.length} products seeded successfully`);

    const adminExists = await User.findOne({ email: "admin@codealpha.tech" });
    if (!adminExists) {
      await User.create({
        name: "Admin",
        email: "admin@codealpha.tech",
        password: "admin123",
        role: "admin",
      });
      console.log("Admin user created: admin@codealpha.tech / admin123");
    } else {
      console.log("Admin user already exists");
    }

    console.log("Seeding complete");
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedData();