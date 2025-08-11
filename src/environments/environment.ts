export const environment = {
  production: false,
  apiUrl: "http://sadeem.eastus.cloudapp.azure.com:7070/MadkourPortal/api",
  _apiUrl: "http://sadeem.eastus.cloudapp.azure.com:7070/MadkourPortal/Api",
  mediaUrl:
    "http://sadeem.eastus.cloudapp.azure.com:7070/MadkourPortal/image?imagePath=",
  imagePlaceHolderUrl: "assets/img/image_placeholder.png",
  Mqqt_host: "68.183.221.11",
  Mqqt_port: 4200,
  Mqqt_Message: "MUMS_PORTAL_",
  App_Name: "MADKOUR-CLIENT",
  currentUser: `MADKOUR-CLIENT-$User`,
  CurrentLang: `MADKOUR-CLIENT-$Lang`,
  payment: {
    enableCSPFallback: true,
    maxRetryAttempts: 3,
    scriptTimeout: 15000,
    mastercardGatewayUrl: "https://cibpaynow.gateway.mastercard.com",
  },
};
