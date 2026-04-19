import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
  en: {
    // Navbar
    marketplace: 'Marketplace',
    dashboard: 'Dashboard',
    addCrop: 'Add Crop',
    messages: 'Messages',
    login: 'Login',
    signUp: 'Sign Up',
    logout: 'Logout',
    profile: 'Profile',
    wallet: 'Wallet',
    notifications: 'Notifications',
    marketPrices: 'Market Prices',
    analytics: 'Analytics',
    
    // Home
    heroTitle: 'Connect Directly with',
    heroHighlight: 'Local Farmers',
    heroSubtitle: 'for Fresh Produce',
    heroDesc: 'FarmConnect eliminates middlemen, ensuring farmers get fair prices and buyers receive the freshest crops directly from the source.',
    getStarted: 'Get Started Free',
    browseMarketplace: 'Browse Marketplace',
    goToDashboard: 'Go to Dashboard',
    whyChoose: 'Why Choose FarmConnect?',
    verifiedFarmers: 'Verified Farmers',
    directDelivery: 'Direct Delivery',
    realTimeChat: 'Real-time Chat',
    organicOptions: 'Organic Options',
    fairPricing: 'Fair Pricing',
    smartMatching: 'Smart Matching',
    howItWorks: 'How It Works',
    
    // Dashboard
    welcome: 'Welcome back',
    pending: 'Pending',
    active: 'Active',
    completed: 'Completed',
    revenue: 'Revenue',
    spent: 'Spent',
    orders: 'Orders',
    myCrops: 'My Crops',
    noOrders: 'No Orders Yet',
    
    // Marketplace
    freshMarketplace: 'Fresh Marketplace',
    searchCrops: 'Search crops...',
    allCategories: 'All Categories',
    noCropsFound: 'No Crops Found',
    
    // Market Prices
    liveMarketPrices: 'Live Market Prices',
    livePricesDesc: 'Real-time mandi prices from major markets across India',
    cropName: 'Crop',
    market: 'Market',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    modalPrice: 'Modal Price',
    trend: 'Trend',
    
    // Order
    placeOrder: 'Place Order',
    quantity: 'Quantity',
    shippingAddress: 'Shipping Address',
    paymentMethod: 'Payment Method',
    totalAmount: 'Total Amount',
    confirmOrder: 'Confirm & Place Order',
    orderPlaced: 'Order Placed!',
    orderTracking: 'Order Tracking',
    
    // Reviews
    rating: 'Rating',
    writeReview: 'Write a Review',
    submitReview: 'Submit Review',
    reviews: 'Reviews',
    
    // Profile
    editProfile: 'Edit Profile',
    saveChanges: 'Save Changes',
    verified: 'Verified',
    getVerified: 'Get Verified',
    memberSince: 'Member since',
    
    // Wallet
    walletBalance: 'Wallet Balance',
    addFunds: 'Add Funds',
    paymentHistory: 'Payment History',
    
    // Pre-orders
    preOrder: 'Pre-Order',
    bookInAdvance: 'Book in Advance',
    lockPrice: 'Lock Price',
    
    // Analytics
    bestSelling: 'Best Selling Crops',
    demandTrends: 'Demand Trends',
    profitEstimation: 'Profit Estimation',
    cropRecommendations: 'Crop Recommendations',
    
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    confirm: 'Confirm',
    search: 'Search',
    filter: 'Filter',
    sortBy: 'Sort by',
    viewAll: 'View All',
    noData: 'No data available',
    perUnit: 'per',
    available: 'Available',
    organic: 'Organic',
    nearby: 'Nearby',
  },
  hi: {
    marketplace: 'बाज़ार',
    dashboard: 'डैशबोर्ड',
    addCrop: 'फसल जोड़ें',
    messages: 'संदेश',
    login: 'लॉगिन',
    signUp: 'साइन अप',
    logout: 'लॉगआउट',
    profile: 'प्रोफाइल',
    wallet: 'वॉलेट',
    notifications: 'सूचनाएं',
    marketPrices: 'बाज़ार भाव',
    analytics: 'विश्लेषण',
    heroTitle: 'सीधे जुड़ें',
    heroHighlight: 'स्थानीय किसानों',
    heroSubtitle: 'से ताज़ा उपज के लिए',
    heroDesc: 'FarmConnect बिचौलियों को हटाता है, किसानों को उचित मूल्य और खरीदारों को सीधे स्रोत से सबसे ताज़ी फसलें सुनिश्चित करता है।',
    getStarted: 'मुफ्त शुरू करें',
    browseMarketplace: 'बाज़ार देखें',
    goToDashboard: 'डैशबोर्ड पर जाएं',
    whyChoose: 'FarmConnect क्यों चुनें?',
    verifiedFarmers: 'सत्यापित किसान',
    directDelivery: 'सीधी डिलीवरी',
    realTimeChat: 'रीयल-टाइम चैट',
    organicOptions: 'जैविक विकल्प',
    fairPricing: 'उचित मूल्य',
    smartMatching: 'स्मार्ट मिलान',
    howItWorks: 'यह कैसे काम करता है',
    welcome: 'वापसी पर स्वागत है',
    pending: 'लंबित',
    active: 'सक्रिय',
    completed: 'पूर्ण',
    revenue: 'राजस्व',
    spent: 'खर्च',
    orders: 'ऑर्डर',
    myCrops: 'मेरी फसलें',
    noOrders: 'अभी तक कोई ऑर्डर नहीं',
    freshMarketplace: 'ताज़ा बाज़ार',
    searchCrops: 'फसलें खोजें...',
    allCategories: 'सभी श्रेणियां',
    noCropsFound: 'कोई फसल नहीं मिली',
    liveMarketPrices: 'लाइव मंडी भाव',
    livePricesDesc: 'भारत के प्रमुख बाज़ारों से रीयल-टाइम मंडी भाव',
    cropName: 'फसल',
    market: 'मंडी',
    minPrice: 'न्यूनतम भाव',
    maxPrice: 'अधिकतम भाव',
    modalPrice: 'मोडल भाव',
    trend: 'रुझान',
    placeOrder: 'ऑर्डर दें',
    quantity: 'मात्रा',
    shippingAddress: 'डिलीवरी पता',
    paymentMethod: 'भुगतान विधि',
    totalAmount: 'कुल राशि',
    confirmOrder: 'पुष्टि करें और ऑर्डर दें',
    orderPlaced: 'ऑर्डर सफल!',
    orderTracking: 'ऑर्डर ट्रैकिंग',
    rating: 'रेटिंग',
    writeReview: 'समीक्षा लिखें',
    submitReview: 'समीक्षा भेजें',
    reviews: 'समीक्षाएं',
    editProfile: 'प्रोफाइल संपादित करें',
    saveChanges: 'बदलाव सहेजें',
    verified: 'सत्यापित',
    getVerified: 'सत्यापित हों',
    memberSince: 'सदस्य तब से',
    walletBalance: 'वॉलेट बैलेंस',
    addFunds: 'पैसे जोड़ें',
    paymentHistory: 'भुगतान इतिहास',
    preOrder: 'प्री-ऑर्डर',
    bookInAdvance: 'अग्रिम बुकिंग',
    lockPrice: 'मूल्य लॉक करें',
    bestSelling: 'सबसे ज्यादा बिकने वाली फसलें',
    demandTrends: 'मांग रुझान',
    profitEstimation: 'लाभ अनुमान',
    cropRecommendations: 'फसल सिफारिशें',
    loading: 'लोड हो रहा है...',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    confirm: 'पुष्टि',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    sortBy: 'क्रमबद्ध करें',
    viewAll: 'सभी देखें',
    noData: 'कोई डेटा उपलब्ध नहीं',
    perUnit: 'प्रति',
    available: 'उपलब्ध',
    organic: 'जैविक',
    nearby: 'आस-पास',
  },
  mr: {
    marketplace: 'बाजारपेठ',
    dashboard: 'डॅशबोर्ड',
    addCrop: 'पीक जोडा',
    messages: 'संदेश',
    login: 'लॉगिन',
    signUp: 'साइन अप',
    logout: 'लॉगआउट',
    profile: 'प्रोफाइल',
    wallet: 'वॉलेट',
    notifications: 'सूचना',
    marketPrices: 'बाजार भाव',
    analytics: 'विश्लेषण',
    heroTitle: 'थेट जोडले जा',
    heroHighlight: 'स्थानिक शेतकऱ्यांशी',
    heroSubtitle: 'ताज्या उत्पादनासाठी',
    heroDesc: 'FarmConnect मध्यस्थ काढून टाकतो, शेतकऱ्यांना योग्य भाव आणि खरेदीदारांना थेट स्रोतातून सर्वात ताजी पिके मिळतात.',
    getStarted: 'मोफत सुरू करा',
    browseMarketplace: 'बाजारपेठ पहा',
    goToDashboard: 'डॅशबोर्डवर जा',
    whyChoose: 'FarmConnect का निवडावे?',
    verifiedFarmers: 'सत्यापित शेतकरी',
    directDelivery: 'थेट वितरण',
    realTimeChat: 'रिअल-टाइम चॅट',
    organicOptions: 'सेंद्रिय पर्याय',
    fairPricing: 'योग्य किंमत',
    smartMatching: 'स्मार्ट जुळणी',
    howItWorks: 'हे कसे कार्य करते',
    welcome: 'पुन्हा स्वागत आहे',
    pending: 'प्रलंबित',
    active: 'सक्रिय',
    completed: 'पूर्ण',
    revenue: 'महसूल',
    spent: 'खर्च',
    orders: 'ऑर्डर',
    myCrops: 'माझी पिके',
    noOrders: 'अजून ऑर्डर नाहीत',
    freshMarketplace: 'ताजी बाजारपेठ',
    searchCrops: 'पिके शोधा...',
    allCategories: 'सर्व श्रेणी',
    noCropsFound: 'पिके सापडली नाहीत',
    liveMarketPrices: 'लाइव मंडी भाव',
    livePricesDesc: 'भारतातील प्रमुख बाजारपेठांमधून रिअल-टाइम मंडी भाव',
    cropName: 'पीक',
    market: 'मंडी',
    minPrice: 'किमान भाव',
    maxPrice: 'कमाल भाव',
    modalPrice: 'मोडल भाव',
    trend: 'कल',
    placeOrder: 'ऑर्डर द्या',
    quantity: 'प्रमाण',
    shippingAddress: 'वितरण पत्ता',
    paymentMethod: 'पेमेंट पद्धत',
    totalAmount: 'एकूण रक्कम',
    confirmOrder: 'पुष्टी करा आणि ऑर्डर द्या',
    orderPlaced: 'ऑर्डर यशस्वी!',
    orderTracking: 'ऑर्डर ट्रॅकिंग',
    rating: 'रेटिंग',
    writeReview: 'पुनरावलोकन लिहा',
    submitReview: 'पुनरावलोकन पाठवा',
    reviews: 'पुनरावलोकने',
    editProfile: 'प्रोफाइल संपादित करा',
    saveChanges: 'बदल जतन करा',
    verified: 'सत्यापित',
    getVerified: 'सत्यापित व्हा',
    memberSince: 'सदस्य तेव्हापासून',
    walletBalance: 'वॉलेट शिल्लक',
    addFunds: 'पैसे जोडा',
    paymentHistory: 'पेमेंट इतिहास',
    preOrder: 'प्री-ऑर्डर',
    bookInAdvance: 'आगाऊ बुकिंग',
    lockPrice: 'किंमत लॉक करा',
    bestSelling: 'सर्वाधिक विकली जाणारी पिके',
    demandTrends: 'मागणी कल',
    profitEstimation: 'नफा अंदाज',
    cropRecommendations: 'पीक शिफारसी',
    loading: 'लोड होत आहे...',
    save: 'जतन करा',
    cancel: 'रद्द करा',
    delete: 'हटवा',
    confirm: 'पुष्टी',
    search: 'शोधा',
    filter: 'फिल्टर',
    sortBy: 'यानुसार क्रमवारी',
    viewAll: 'सर्व पहा',
    noData: 'डेटा उपलब्ध नाही',
    perUnit: 'प्रति',
    available: 'उपलब्ध',
    organic: 'सेंद्रिय',
    nearby: 'जवळपास',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('farmconnect_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('farmconnect_lang', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const changeLanguage = (lang) => {
    if (['en', 'hi', 'mr'].includes(lang)) {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

export default LanguageContext;
