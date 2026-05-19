import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation Dictionaries
const resources = {
  en: {
    translation: {
      // Login
      login: {
        title: "Welcome Back",
        subtitle: "Sign in to manage your inventory",
        email: "Email Address",
        password: "Password",
        signIn: "Sign In",
        creating: "Creating test user...",
        selectLanguage: "Select Language"
      },
      // Dashboard Header
      header: {
        title: "Grocify",
        subtitle: "Welcome to Grocify",
        dailyRevenue: "Daily Revenue",
        todayPnL: "Today's P&L",
        dailyCost: "Daily Cost",
        refresh: "Refresh",
        addItem: "Add Item"
      },
      // Profile Dropdown
      profile: {
        theme: "Theme",
        language: "Language",
        logout: "Logout",
        light: "Light",
        dark: "Dark"
      },
      // Stats Cards
      stats: {
        totalValue: "Total Value",
        uniqueItems: "Unique Items",
        lowStock: "Low Stock",
        outOfStock: "Out of Stock",
        expiringSoon: "Expiring Soon",
        viewAnalytics: "Click to view analytics →",
        viewItems: "Click to view items →",
        viewAlerts: "Click to view alerts →"
      },
      // Analytics Chart
      analytics: {
        title: "Revenue Analytics",
        subtitle: "Revenue, cost & profit trends",
        week: "Week",
        month: "Month",
        year: "Year"
      },
      // Low Stock List
      lowStockList: {
        title: "Low Stock Alerts",
        quickRestock: "Quick Restock",
        restock: "Restock",
        left: "left",
        min: "min"
      },
      // Inventory Table
      inventory: {
        title: "Inventory Management",
        searchPlaceholder: "Search by name, SKU, or supplier...",
        allCategories: "All Categories",
        emptyTitle: "No Inventory Items Found",
        emptySub: "Try clearing your search query or adjust your filters.",
        colProduct: "Product details",
        colCategory: "Category",
        colPrice: "Price",
        colStock: "Stock Level",
        colActions: "Actions",
        deleteConfirm: "Are you sure you want to permanently delete \"{{name}}\" from the inventory?"
      },
      // Modal
      modal: {
        editTitle: "Edit Inventory Item",
        addTitle: "Add New Grocery Item",
        name: "Product Name*",
        category: "Category*",
        unit: "Unit/Package Size*",
        price: "Price (₹)*",
        stock: "Current Stock Quantity*",
        minStock: "Min Stock Threshold*",
        sku: "SKU (leave blank to auto-generate)",
        supplier: "Supplier",
        expiry: "Expiry Date",
        imageUrl: "Image URL",
        desc: "Description",
        cancel: "Cancel",
        save: "Save Changes",
        create: "Create Item"
      },
      // Details View
      details: {
        back: "Back",
        productsRequire: "{{count}} products require manager attention",
        productsTotal: "{{count}} products in total",
        allClearTitle: "All Clear!",
        allClearSub: "No products currently fit this status. Keep up the great work!",
        colProduct: "Product",
        colCategory: "Category",
        colSku: "SKU",
        colExpiry: "Expiry Date",
        colStock: "Stock Level",
        colActions: "Actions",
        expired: "Expired",
        daysLeft: "{{days}}d left",
        min: "min",
        deleteConfirm: "Delete \"{{name}}\"?"
      },
      // POS Checkout
      pos: {
        title: "Point of Sale Checkout",
        search: "Search by name or SKU...",
        noItems: "No matching items found in stock.",
        cart: "Current Order",
        success: "Sale Completed!",
        emptyCart: "Cart is empty",
        subtotal: "Subtotal",
        tax: "Tax (5%)",
        total: "Total",
        checkout: "Complete Sale"
      },
      // Categories
      categories: {
        "Fruits & Vegetables": "Fruits & Vegetables",
        "Dairy & Eggs": "Dairy & Eggs",
        "Bakery & Bread": "Bakery & Bread",
        "Beverages": "Beverages",
        "Pantry & Grains": "Pantry & Grains",
        "Snacks & Sweets": "Snacks & Sweets",
        "Meat & Seafood": "Meat & Seafood",
        "Household & Cleaning": "Household & Cleaning",
        "All": "All Categories"
      },
      // Common Products
      products: {
        "Organic Gala Apples": "Organic Gala Apples",
        "Fresh Organic Bananas": "Fresh Organic Bananas",
        "Organic Baby Spinach": "Organic Baby Spinach",
        "Vine-Ripened Roma Tomatoes": "Vine-Ripened Roma Tomatoes",
        "Organic Haas Avocados": "Organic Haas Avocados",
        "Fresh Blueberries": "Fresh Blueberries",
        "Organic Whole Milk": "Organic Whole Milk",
        "Large Grade A Brown Eggs": "Large Grade A Brown Eggs",
        "Greek Non-Fat Yogurt (Plain)": "Greek Non-Fat Yogurt (Plain)",
        "Salted Butter Twins": "Salted Butter Twins",
        "Shredded Sharp Cheddar": "Shredded Sharp Cheddar",
        "Unsweetened Almond Milk": "Unsweetened Almond Milk",
        "Sourdough Bread Round": "Sourdough Bread Round",
        "Whole Wheat Sliced Bread": "Whole Wheat Sliced Bread",
        "Butter Croissants": "Butter Croissants",
        "Organic Tortillas (Flour)": "Organic Tortillas (Flour)",
        "100% Orange Juice (Pulp-Free)": "100% Orange Juice (Pulp-Free)",
        "Sparkling Water (Lime)": "Sparkling Water (Lime)",
        "Organic Green Tea Bags": "Organic Green Tea Bags",
        "Medium Roast Ground Coffee": "Medium Roast Ground Coffee",
        "Long Grain Jasmine Rice": "Long Grain Jasmine Rice",
        "Organic Quinoa (White)": "Organic Quinoa (White)",
        "Organic Penne Rigate": "Organic Penne Rigate",
        "Extra Virgin Olive Oil": "Extra Virgin Olive Oil",
        "Creamy Peanut Butter": "Creamy Peanut Butter",
        "Organic Honey (Clover)": "Organic Honey (Clover)",
        "Canned Black Beans": "Canned Black Beans",
        "Classic Potato Chips": "Classic Potato Chips",
        "Roasted & Salted Mixed Nuts": "Roasted & Salted Mixed Nuts",
        "72% Dark Chocolate Bar": "72% Dark Chocolate Bar",
        "Oat Honey Granola Bars": "Oat Honey Granola Bars",
        "Boneless Chicken Breasts": "Boneless Chicken Breasts",
        "Lean Ground Beef (85/15)": "Lean Ground Beef (85/15)",
        "Fresh Salmon Fillet": "Fresh Salmon Fillet",
        "Thick-Cut Applewood Bacon": "Thick-Cut Applewood Bacon",
        "Dish Soap (Lavender)": "Dish Soap (Lavender)",
        "Ultra Strong Paper Towels": "Ultra Strong Paper Towels",
        "Liquid Laundry Detergent": "Liquid Laundry Detergent",
        "Multi-Surface Spray Cleaner": "Multi-Surface Spray Cleaner",
        "Tall Kitchen Trash Bags": "Tall Kitchen Trash Bags",
        "Fresh Strawberries": "Fresh Strawberries",
        "Organic Carrots": "Organic Carrots",
        "Organic Crown Broccoli": "Organic Crown Broccoli",
        "Yellow Onions": "Yellow Onions",
        "Russet Potatoes": "Russet Potatoes",
        "Grass-Fed Ribeye Steak": "Grass-Fed Ribeye Steak",
        "Roasted Deli Turkey Slices": "Roasted Deli Turkey Slices",
        "Gluten-Free Granola": "Gluten-Free Granola",
        "Natural Sea Salt Popcorn": "Natural Sea Salt Popcorn",
        "Pure Maple Syrup": "Pure Maple Syrup"
      }
    }
  },
  hi: {
    translation: {
      login: {
        title: "वापसी पर स्वागत है",
        subtitle: "अपनी इन्वेंट्री प्रबंधित करने के लिए साइन इन करें",
        email: "ईमेल पता",
        password: "पासवर्ड",
        signIn: "साइन इन करें",
        creating: "परीक्षण उपयोगकर्ता बनाया जा रहा है...",
        selectLanguage: "भाषा चुनें"
      },
      header: {
        title: "ग्रोसिफाई",
        subtitle: "ग्रोसिफाई में आपका स्वागत है",
        dailyRevenue: "दैनिक राजस्व",
        todayPnL: "आज का लाभ और हानि",
        dailyCost: "दैनिक लागत",
        refresh: "रीफ्रेश करें",
        addItem: "आइटम जोड़ें"
      },
      profile: {
        theme: "थीम",
        language: "भाषा",
        logout: "लॉग आउट",
        light: "लाइट",
        dark: "डार्क"
      },
      stats: {
        totalValue: "कुल मूल्य",
        uniqueItems: "अद्वितीय आइटम",
        lowStock: "कम स्टॉक",
        outOfStock: "स्टॉक खत्म",
        expiringSoon: "जल्द समाप्त होने वाला",
        viewAnalytics: "एनालिटिक्स देखने के लिए क्लिक करें →",
        viewItems: "आइटम देखने के लिए क्लिक करें →",
        viewAlerts: "अलर्ट देखने के लिए क्लिक करें →"
      },
      analytics: {
        title: "राजस्व एनालिटिक्स",
        subtitle: "राजस्व, लागत और लाभ के रुझान",
        week: "सप्ताह",
        month: "महीना",
        year: "वर्ष"
      },
      lowStockList: {
        title: "कम स्टॉक अलर्ट",
        quickRestock: "त्वरित रीस्टॉक",
        restock: "रीस्टॉक",
        left: "शेष",
        min: "न्यूनतम"
      },
      inventory: {
        title: "इन्वेंट्री प्रबंधन",
        searchPlaceholder: "नाम, SKU या आपूर्तिकर्ता द्वारा खोजें...",
        allCategories: "सभी श्रेणियां",
        emptyTitle: "कोई इन्वेंट्री आइटम नहीं मिला",
        emptySub: "अपनी खोज क्वेरी साफ़ करने का प्रयास करें या अपने फ़िल्टर समायोजित करें।",
        colProduct: "उत्पाद विवरण",
        colCategory: "श्रेणी",
        colPrice: "कीमत",
        colStock: "स्टॉक स्तर",
        colActions: "क्रियाएँ",
        deleteConfirm: "क्या आप वाकई इन्वेंट्री से \"{{name}}\" को स्थायी रूप से हटाना चाहते हैं?"
      },
      modal: {
        editTitle: "इन्वेंट्री आइटम संपादित करें",
        addTitle: "नया किराना आइटम जोड़ें",
        name: "उत्पाद का नाम*",
        category: "श्रेणी*",
        unit: "इकाई/पैकेज का आकार*",
        price: "कीमत (₹)*",
        stock: "वर्तमान स्टॉक मात्रा*",
        minStock: "न्यूनतम स्टॉक सीमा*",
        sku: "SKU (स्वतः जनरेट करने के लिए खाली छोड़ें)",
        supplier: "आपूर्तिकर्ता",
        expiry: "समाप्ति तिथि",
        imageUrl: "छवि URL",
        desc: "विवरण",
        cancel: "रद्द करें",
        save: "परिवर्तन सहेजें",
        create: "आइटम बनाएँ"
      },
      details: {
        back: "वापस",
        productsRequire: "{{count}} उत्पादों पर प्रबंधक के ध्यान की आवश्यकता है",
        productsTotal: "कुल {{count}} उत्पाद",
        allClearTitle: "सब साफ़!",
        allClearSub: "वर्तमान में कोई उत्पाद इस स्थिति में फिट नहीं है। बहुत बढ़िया!",
        colProduct: "उत्पाद",
        colCategory: "श्रेणी",
        colSku: "SKU",
        colExpiry: "समाप्ति तिथि",
        colStock: "स्टॉक स्तर",
        colActions: "क्रियाएँ",
        expired: "समाप्त",
        daysLeft: "{{days}} दिन शेष",
        min: "न्यूनतम",
        deleteConfirm: "\"{{name}}\" हटाएँ?"
      },
      pos: {
        title: "पॉइंट ऑफ़ सेल चेकआउट",
        search: "नाम या SKU द्वारा खोजें...",
        noItems: "स्टॉक में कोई मेल खाने वाला आइटम नहीं मिला।",
        cart: "वर्तमान आदेश",
        success: "बिक्री पूरी हुई!",
        emptyCart: "कार्ट खाली है",
        subtotal: "उप-योग",
        tax: "कर (5%)",
        total: "कुल",
        checkout: "बिक्री पूरी करें"
      },
      categories: {
        "Fruits & Vegetables": "फल और सब्जियाँ",
        "Dairy & Eggs": "डेयरी और अंडे",
        "Bakery & Bread": "बेकरी और ब्रेड",
        "Beverages": "पेय पदार्थ",
        "Pantry & Grains": "पेंट्री और अनाज",
        "Snacks & Sweets": "स्नैक्स और मिठाइयाँ",
        "Meat & Seafood": "मांस और समुद्री भोजन",
        "Household & Cleaning": "घरेलू और सफाई",
        "All": "सभी श्रेणियां"
      },
      products: {
        "Organic Gala Apples": "जैविक गाला सेब",
        "Fresh Organic Bananas": "ताजे जैविक केले",
        "Organic Baby Spinach": "जैविक बेबी पालक",
        "Vine-Ripened Roma Tomatoes": "पके हुए रोमा टमाटर",
        "Organic Haas Avocados": "जैविक हास एवोकैडो",
        "Fresh Blueberries": "ताजी ब्लूबेरी",
        "Organic Whole Milk": "जैविक पूरा दूध",
        "Large Grade A Brown Eggs": "बड़े ग्रेड ए ब्राउन अंडे",
        "Greek Non-Fat Yogurt (Plain)": "ग्रीक नॉन-फैट दही (सादा)",
        "Salted Butter Twins": "नमकीन मक्खन ट्विन्स",
        "Shredded Sharp Cheddar": "कटा हुआ शार्प चेडर",
        "Unsweetened Almond Milk": "बिना चीनी का बादाम का दूध",
        "Sourdough Bread Round": "खट्टा ब्रेड गोल",
        "Whole Wheat Sliced Bread": "साबुत गेहूं की कटी हुई ब्रेड",
        "Butter Croissants": "मक्खन क्रोइसैन",
        "Organic Tortillas (Flour)": "जैविक टॉर्टिला (आटा)",
        "100% Orange Juice (Pulp-Free)": "100% संतरे का रस (पल्प-फ्री)",
        "Sparkling Water (Lime)": "स्पार्कलिंग वॉटर (लाइम)",
        "Organic Green Tea Bags": "जैविक ग्रीन टी बैग",
        "Medium Roast Ground Coffee": "मीडियम रोस्ट ग्राउंड कॉफी",
        "Long Grain Jasmine Rice": "लंबे दाने वाले चमेली चावल",
        "Organic Quinoa (White)": "जैविक क्विनोआ (सफेद)",
        "Organic Penne Rigate": "जैविक पेने रिगेट",
        "Extra Virgin Olive Oil": "एक्स्ट्रा वर्जिन ऑलिव ऑयल",
        "Creamy Peanut Butter": "मलाईदार पीनट बटर",
        "Organic Honey (Clover)": "जैविक शहद (क्लोवर)",
        "Canned Black Beans": "डिब्बाबंद काली बीन्स",
        "Classic Potato Chips": "क्लासिक आलू के चिप्स",
        "Roasted & Salted Mixed Nuts": "भुने और नमकीन मिश्रित मेवे",
        "72% Dark Chocolate Bar": "72% डार्क चॉकलेट बार",
        "Oat Honey Granola Bars": "ओट हनी ग्रेनोला बार",
        "Boneless Chicken Breasts": "बोनलेस चिकन ब्रेस्ट",
        "Lean Ground Beef (85/15)": "लीन ग्राउंड बीफ (85/15)",
        "Fresh Salmon Fillet": "ताजा सैल्मन पट्टिका",
        "Thick-Cut Applewood Bacon": "मोटे कटे हुए एप्पलवुड बेकन",
        "Dish Soap (Lavender)": "डिश सोप (लैवेंडर)",
        "Ultra Strong Paper Towels": "अल्ट्रा स्ट्रॉन्ग पेपर टॉवल",
        "Liquid Laundry Detergent": "तरल कपड़े धोने का डिटर्जेंट",
        "Multi-Surface Spray Cleaner": "मल्टी-सरफेस स्प्रे क्लीनर",
        "Tall Kitchen Trash Bags": "लंबे रसोई कचरा बैग",
        "Fresh Strawberries": "ताजी स्ट्रॉबेरी",
        "Organic Carrots": "जैविक गाजर",
        "Organic Crown Broccoli": "जैविक क्राउन ब्रोकोली",
        "Yellow Onions": "पीले प्याज",
        "Russet Potatoes": "रसेट आलू",
        "Grass-Fed Ribeye Steak": "ग्रास-फेड रिबे स्टीक",
        "Roasted Deli Turkey Slices": "भुना हुआ डेली टर्की स्लाइस",
        "Gluten-Free Granola": "ग्लूटेन-मुक्त ग्रेनोला",
        "Natural Sea Salt Popcorn": "प्राकृतिक समुद्री नमक पॉपकॉर्न",
        "Pure Maple Syrup": "शुद्ध मेपल सिरप"
      }
    }
  },
  kn: {
    translation: {
      login: {
        title: "ಮರಳಿ ಸ್ವಾಗತ",
        subtitle: "ನಿಮ್ಮ ದಾಸ್ತಾನು ನಿರ್ವಹಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ",
        email: "ಇಮೇಲ್ ವಿಳಾಸ",
        password: "ಪಾಸ್ವರ್ಡ್",
        signIn: "ಸೈನ್ ಇನ್ ಮಾಡಿ",
        creating: "ಪರೀಕ್ಷಾ ಬಳಕೆದಾರರನ್ನು ರಚಿಸಲಾಗುತ್ತಿದೆ...",
        selectLanguage: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ"
      },
      header: {
        title: "ಗ್ರೋಸಿಫೈ",
        subtitle: "ಗ್ರೋಸಿಫೈಗೆ ಸ್ವಾಗತ",
        dailyRevenue: "ದೈನಂದಿನ ಆದಾಯ",
        todayPnL: "ಇಂದಿನ ಲಾಭ/ನಷ್ಟ",
        dailyCost: "ದೈನಂದಿನ ವೆಚ್ಚ",
        refresh: "ರಿಫ್ರೆಶ್",
        addItem: "ಐಟಂ ಸೇರಿಸಿ"
      },
      profile: {
        theme: "ಥೀಮ್",
        language: "ಭಾಷೆ",
        logout: "ಲಾಗ್ ಔಟ್",
        light: "ಲೈಟ್",
        dark: "ಡಾರ್ಕ್"
      },
      stats: {
        totalValue: "ಒಟ್ಟು ಮೌಲ್ಯ",
        uniqueItems: "ವಿಶಿಷ್ಟ ಐಟಂಗಳು",
        lowStock: "ಕಡಿಮೆ ಸ್ಟಾಕ್",
        outOfStock: "ಸ್ಟಾಕ್ ಖಾಲಿಯಾಗಿದೆ",
        expiringSoon: "ಶೀಘ್ರದಲ್ಲೇ ಅವಧಿ ಮುಗಿಯಲಿದೆ",
        viewAnalytics: "ಅನಾಲಿಟಿಕ್ಸ್ ವೀಕ್ಷಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ →",
        viewItems: "ಐಟಂಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ →",
        viewAlerts: "ಎಚ್ಚರಿಕೆಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ →"
      },
      analytics: {
        title: "ಆದಾಯ ಅನಾಲಿಟಿಕ್ಸ್",
        subtitle: "ಆದಾಯ, ವೆಚ್ಚ ಮತ್ತು ಲಾಭದ ಟ್ರೆಂಡ್ಗಳು",
        week: "ವಾರ",
        month: "ತಿಂಗಳು",
        year: "ವರ್ಷ"
      },
      lowStockList: {
        title: "ಕಡಿಮೆ ಸ್ಟಾಕ್ ಎಚ್ಚರಿಕೆಗಳು",
        quickRestock: "ತ್ವರಿತ ರೀಸ್ಟಾಕ್",
        restock: "ರೀಸ್ಟಾಕ್",
        left: "ಉಳಿದಿದೆ",
        min: "ಕನಿಷ್ಠ"
      },
      inventory: {
        title: "ದಾಸ್ತಾನು ನಿರ್ವಹಣೆ",
        searchPlaceholder: "ಹೆಸರು, SKU, ಅಥವಾ ಪೂರೈಕೆದಾರರಿಂದ ಹುಡುಕಿ...",
        allCategories: "ಎಲ್ಲಾ ವರ್ಗಗಳು",
        emptyTitle: "ಯಾವುದೇ ದಾಸ್ತಾನು ಐಟಂಗಳು ಕಂಡುಬಂದಿಲ್ಲ",
        emptySub: "ನಿಮ್ಮ ಹುಡುಕಾಟವನ್ನು ತೆರವುಗೊಳಿಸಲು ಅಥವಾ ಫಿಲ್ಟರ್ಗಳನ್ನು ಸರಿಹೊಂದಿಸಲು ಪ್ರಯತ್ನಿಸಿ.",
        colProduct: "ಉತ್ಪನ್ನದ ವಿವರಗಳು",
        colCategory: "ವರ್ಗ",
        colPrice: "ಬೆಲೆ",
        colStock: "ಸ್ಟಾಕ್ ಮಟ್ಟ",
        colActions: "ಕ್ರಿಯೆಗಳು",
        deleteConfirm: "\"{{name}}\" ಅನ್ನು ದಾಸ್ತಾನಿನಿಂದ ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?"
      },
      modal: {
        editTitle: "ದಾಸ್ತಾನು ಐಟಂ ಸಂಪಾದಿಸಿ",
        addTitle: "ಹೊಸ ಕಿರಾಣಿ ಐಟಂ ಸೇರಿಸಿ",
        name: "ಉತ್ಪನ್ನದ ಹೆಸರು*",
        category: "ವರ್ಗ*",
        unit: "ಘಟಕ/ಪ್ಯಾಕೇಜ್ ಗಾತ್ರ*",
        price: "ಬೆಲೆ (₹)*",
        stock: "ಪ್ರಸ್ತುತ ಸ್ಟಾಕ್ ಪ್ರಮಾಣ*",
        minStock: "ಕನಿಷ್ಠ ಸ್ಟಾಕ್ ಮಿತಿ*",
        sku: "SKU (ಸ್ವಯಂ-ರಚಿಸಲು ಖಾಲಿ ಬಿಡಿ)",
        supplier: "ಪೂರೈಕೆದಾರ",
        expiry: "ಅವಧಿ ಮುಗಿಯುವ ದಿನಾಂಕ",
        imageUrl: "ಚಿತ್ರ URL",
        desc: "ವಿವರಣೆ",
        cancel: "ರದ್ದುಮಾಡಿ",
        save: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ",
        create: "ಐಟಂ ರಚಿಸಿ"
      },
      details: {
        back: "ಹಿಂದೆ",
        productsRequire: "{{count}} ಉತ್ಪನ್ನಗಳಿಗೆ ವ್ಯವಸ್ಥಾಪಕರ ಗಮನ ಅಗತ್ಯವಿದೆ",
        productsTotal: "ಒಟ್ಟು {{count}} ಉತ್ಪನ್ನಗಳು",
        allClearTitle: "ಎಲ್ಲವೂ ಸರಿ!",
        allClearSub: "ಪ್ರಸ್ತುತ ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಈ ಸ್ಥಿತಿಗೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ. ಉತ್ತಮ ಕೆಲಸವನ್ನು ಮುಂದುವರಿಸಿ!",
        colProduct: "ಉತ್ಪನ್ನ",
        colCategory: "ವರ್ಗ",
        colSku: "SKU",
        colExpiry: "ಅವಧಿ ಮುಗಿಯುವ ದಿನಾಂಕ",
        colStock: "ಸ್ಟಾಕ್ ಮಟ್ಟ",
        colActions: "ಕ್ರಿಯೆಗಳು",
        expired: "ಅವಧಿ ಮುಗಿದಿದೆ",
        daysLeft: "{{days}} ದಿನ ಉಳಿದಿದೆ",
        min: "ಕನಿಷ್ಠ",
        deleteConfirm: "\"{{name}}\" ಅಳಿಸಬೇಕೇ?"
      },
      pos: {
        title: "ಪಾಯಿಂಟ್ ಆಫ್ ಸೇಲ್ ಚೆಕ್ಔಟ್",
        search: "ಹೆಸರು ಅಥವಾ SKU ಮೂಲಕ ಹುಡುಕಿ...",
        noItems: "ಸ್ಟಾಕ್ನಲ್ಲಿ ಹೊಂದಿಕೆಯಾಗುವ ಯಾವುದೇ ಐಟಂಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
        cart: "ಪ್ರಸ್ತುತ ಆದೇಶ",
        success: "ಮಾರಾಟ ಪೂರ್ಣಗೊಂಡಿದೆ!",
        emptyCart: "ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ",
        subtotal: "ಉಪಮೊತ್ತ",
        tax: "ತೆರಿಗೆ (5%)",
        total: "ಒಟ್ಟು",
        checkout: "ಮಾರಾಟವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ"
      },
      categories: {
        "Fruits & Vegetables": "ಹಣ್ಣುಗಳು ಮತ್ತು ತರಕಾರಿಗಳು",
        "Dairy & Eggs": "ಡೈರಿ ಮತ್ತು ಮೊಟ್ಟೆಗಳು",
        "Bakery & Bread": "ಬೇಕರಿ ಮತ್ತು ಬ್ರೆಡ್",
        "Beverages": "ಪಾನೀಯಗಳು",
        "Pantry & Grains": "ಪ್ಯಾಂಟ್ರಿ ಮತ್ತು ಧಾನ್ಯಗಳು",
        "Snacks & Sweets": "ತಿಂಡಿಗಳು ಮತ್ತು ಸಿಹಿತಿಂಡಿಗಳು",
        "Meat & Seafood": "ಮಾಂಸ ಮತ್ತು ಸಮುದ್ರಾಹಾರ",
        "Household & Cleaning": "ಮನೆಬಳಕೆ ಮತ್ತು ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
        "All": "ಎಲ್ಲಾ ವರ್ಗಗಳು"
      },
      products: {
        "Organic Gala Apples": "ಸಾವಯವ ಗಾಲಾ ಸೇಬುಗಳು",
        "Fresh Organic Bananas": "ತಾಜಾ ಸಾವಯವ ಬಾಳೆಹಣ್ಣುಗಳು",
        "Organic Baby Spinach": "ಸಾವಯವ ಬೇಬಿ ಪಾಲಕ್",
        "Vine-Ripened Roma Tomatoes": "ಮಾಗಿದ ರೋಮಾ ಟೊಮ್ಯಾಟೊ",
        "Organic Haas Avocados": "ಸಾವಯವ ಹಾಸ್ ಆವಕಾಡೊ",
        "Fresh Blueberries": "ತಾಜಾ ಬೆರಿಹಣ್ಣುಗಳು",
        "Organic Whole Milk": "ಸಾವಯವ ಸಂಪೂರ್ಣ ಹಾಲು",
        "Large Grade A Brown Eggs": "ದೊಡ್ಡ ಗ್ರೇಡ್ ಎ ಕಂದು ಮೊಟ್ಟೆಗಳು",
        "Greek Non-Fat Yogurt (Plain)": "ಗ್ರೀಕ್ ಕೊಬ್ಬು ರಹಿತ ಮೊಸರು (ಸಾದಾ)",
        "Salted Butter Twins": "ಉಪ್ಪುಸಹಿತ ಬೆಣ್ಣೆ ಟ್ವಿನ್ಸ್",
        "Shredded Sharp Cheddar": "ತುರಿದ ಶಾರ್ಪ್ ಚೆಡ್ಡಾರ್",
        "Unsweetened Almond Milk": "ಸಿಹಿಗೊಳಿಸದ ಬಾದಾಮಿ ಹಾಲು",
        "Sourdough Bread Round": "ಹುಳಿ ರೊಟ್ಟಿ ಸುತ್ತು",
        "Whole Wheat Sliced Bread": "ಸಂಪೂರ್ಣ ಗೋಧಿ ಕತ್ತರಿಸಿದ ಬ್ರೆಡ್",
        "Butter Croissants": "ಬೆಣ್ಣೆ ಕ್ರೊಸೆಂಟ್ಸ್",
        "Organic Tortillas (Flour)": "ಸಾವಯವ ಟೋರ್ಟಿಲ್ಲಾಗಳು (ಹಿಟ್ಟು)",
        "100% Orange Juice (Pulp-Free)": "100% ಕಿತ್ತಳೆ ರಸ (ತಿರುಳು-ಮುಕ್ತ)",
        "Sparkling Water (Lime)": "ಹೊಳೆಯುವ ನೀರು (ನಿಂಬೆ)",
        "Organic Green Tea Bags": "ಸಾವಯವ ಹಸಿರು ಚಹಾ ಚೀಲಗಳು",
        "Medium Roast Ground Coffee": "ಮಧ್ಯಮ ಹುರಿದ ಕಾಫಿ ಪುಡಿ",
        "Long Grain Jasmine Rice": "ಉದ್ದವಾದ ಕಾಳು ಮಲ್ಲಿಗೆ ಅಕ್ಕಿ",
        "Organic Quinoa (White)": "ಸಾವಯವ ಕ್ವಿನೋವಾ (ಬಿಳಿ)",
        "Organic Penne Rigate": "ಸಾವಯವ ಪೆನ್ನೆ ರಿಗೇಟ್",
        "Extra Virgin Olive Oil": "ಹೆಚ್ಚುವರಿ ವರ್ಜಿನ್ ಆಲಿವ್ ಎಣ್ಣೆ",
        "Creamy Peanut Butter": "ಕೆನೆ ಕಡಲೆಕಾಯಿ ಬೆಣ್ಣೆ",
        "Organic Honey (Clover)": "ಸಾವಯವ ಜೇನುತುಪ್ಪ (ಕ್ಲೋವರ್)",
        "Canned Black Beans": "ಕ್ಯಾನ್ ಮಾಡಿದ ಕಪ್ಪು ಬೀನ್ಸ್",
        "Classic Potato Chips": "ಕ್ಲಾಸಿಕ್ ಆಲೂಗಡ್ಡೆ ಚಿಪ್ಸ್",
        "Roasted & Salted Mixed Nuts": "ಹುರಿದ ಮತ್ತು ಉಪ್ಪುಸಹಿತ ಮಿಶ್ರ ಬೀಜಗಳು",
        "72% Dark Chocolate Bar": "72% ಡಾರ್ಕ್ ಚಾಕೊಲೇಟ್ ಬಾರ್",
        "Oat Honey Granola Bars": "ಓಟ್ ಜೇನುತುಪ್ಪ ಗ್ರಾನೋಲಾ ಬಾರ್ಗಳು",
        "Boneless Chicken Breasts": "ಮೂಳೆಗಳಿಲ್ಲದ ಚಿಕನ್ ಸ್ತನಗಳು",
        "Lean Ground Beef (85/15)": "ನೇರವಾದ ನೆಲದ ಗೋಮಾಂಸ (85/15)",
        "Fresh Salmon Fillet": "ತಾಜಾ ಸಾಲ್ಮನ್ ಫಿಲೆಟ್",
        "Thick-Cut Applewood Bacon": "ದಪ್ಪ ಕತ್ತರಿಸಿದ ಆಪಲ್ವುಡ್ ಬೇಕನ್",
        "Dish Soap (Lavender)": "ಡಿಶ್ ಸೋಪ್ (ಲ್ಯಾವೆಂಡರ್)",
        "Ultra Strong Paper Towels": "ಅಲ್ಟ್ರಾ ಸ್ಟ್ರಾಂಗ್ ಪೇಪರ್ ಟವೆಲ್",
        "Liquid Laundry Detergent": "ದ್ರವ ಲಾಂಡ್ರಿ ಡಿಟರ್ಜೆಂಟ್",
        "Multi-Surface Spray Cleaner": "ಬಹು-ಮೇಲ್ಮೈ ಸ್ಪ್ರೇ ಕ್ಲೀನರ್",
        "Tall Kitchen Trash Bags": "ಎತ್ತರದ ಅಡಿಗೆ ಕಸದ ಚೀಲಗಳು",
        "Fresh Strawberries": "ತಾಜಾ ಸ್ಟ್ರಾಬೆರಿಗಳು",
        "Organic Carrots": "ಸಾವಯವ ಕ್ಯಾರೆಟ್",
        "Organic Crown Broccoli": "ಸಾವಯವ ಕ್ರೌನ್ ಕೋಸುಗಡ್ಡೆ",
        "Yellow Onions": "ಹಳದಿ ಈರುಳ್ಳಿ",
        "Russet Potatoes": "ರಸ್ಸೆಟ್ ಆಲೂಗಡ್ಡೆ",
        "Grass-Fed Ribeye Steak": "ಹುಲ್ಲು ತಿನ್ನಿಸಿದ ರಿಬೆ ಸ್ಟೀಕ್",
        "Roasted Deli Turkey Slices": "ಹುರಿದ ಡೆಲಿ ಟರ್ಕಿ ಚೂರುಗಳು",
        "Gluten-Free Granola": "ಗ್ಲುಟನ್-ಮುಕ್ತ ಗ್ರಾನೋಲಾ",
        "Natural Sea Salt Popcorn": "ನೈಸರ್ಗಿಕ ಸಮುದ್ರ ಉಪ್ಪು ಪಾಪ್ಕಾರ್ನ್",
        "Pure Maple Syrup": "ಶುದ್ಧ ಮೇಪಲ್ ಸಿರಪ್"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values to prevent XSS
    }
  });

export default i18n;
