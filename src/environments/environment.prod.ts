// environment.prod.ts - Enhanced production configuration
export const environment = {
  production: true,
  apiUrl: "/MadkourPortal/api",
  _apiUrl: "/MadkourPortal/Api",
  mediaUrl: "/MadkourPortal/image?imagePath=",
  imagePlaceHolderUrl: "assets/img/image_placeholder.png",
  Mqqt_host: "68.183.221.11",
  Mqqt_port: 4200,
  Mqqt_Message: "MUMS_PORTAL_",
  App_Name: "MADKOUR-CLIENT",
  currentUser: "MADKOUR-CLIENT-$User",
  CurrentLang: "MADKOUR-CLIENT-$Lang",

  // Add these configurations for better API handling
  api: {
    timeout: 15000, // 15 seconds for HTTPS (longer due to SSL handshake)
    retryAttempts: 3,
    retryDelay: 1000,
    useAbsoluteUrls: false, // Using relative URLs
  },

  // Theme specific settings
  theme: {
    loadTimeout: 10000, // 10 seconds max for theme loading
    fallbackTheme: "light",
    enableCaching: true,
  },

  // Network settings for production
  network: {
    protocol: "https",
    enableCache: true,
    cacheTimeout: 300000, // 5 minutes
  },
};
