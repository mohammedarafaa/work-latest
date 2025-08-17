import { AccountType } from '@model/auth/auth.model';
import * as modulePermission from './modulePremission';

export interface SubMenu {
  name: string;
  icon: string;
  href: string;
  title: string;
  isAuthorize: any;
}
export interface App_Navigation {
  name: string;
  icon: string;
  href: string;
  title: string;
  isAuthorize: string[] | null;
  isSubMenu: boolean;
  isCollapse: boolean;
  subMenu: SubMenu[];
}

export const APP_LINK: App_Navigation[] = [
  {
    name: "app_link.Dashboard",
    icon: "bi bi-speedometer2",
    href: "/Dashboard",
    title: "",
    isAuthorize: null,
    isSubMenu: false,
    isCollapse: false,
    subMenu: [],
  },
  {
    name: "app_link.Faqs",
    icon: "bi bi-question-circle",
    href: "/Faqs",
    title: "",
    isAuthorize: [AccountType.ADMIN, AccountType.SYSTEM],
    isSubMenu: false,
    isCollapse: false,
    subMenu: [],
  },
  {
    name: "app_link.Meters",
    icon: "bi bi-device-hdd",
    href: "/Meters",
    title: "",
    isAuthorize: [AccountType.CUSTOMER],
    isSubMenu: false,
    isCollapse: false,
    subMenu: [],
  },
  {
    name: "app_link.Consumption_History",
    icon: "bi bi-bar-chart-line",
    href: "/Consumption_History",
    title: "",
    isAuthorize: [AccountType.CUSTOMER],
    isSubMenu: false,
    isCollapse: false,
    subMenu: [],
  },
  {
    name: "app_link.Meter_Transactions",
    icon: "bi bi-receipt",
    href: "/Meter_Transactions",
    title: "",
    isAuthorize: [AccountType.CUSTOMER],
    isSubMenu: false,
    isCollapse: false,
    subMenu: [],
  },
  // {
  //   name: 'Charge',
  //       icon: 'bi bi-lightning-charge-fill',
  //       href: '/Charge',
  //   title: '',
  //   isAuthorize: [AccountType.CUSTOMER,AccountType.SYSTEM],
  //   isSubMenu: false,
  //   isCollapse: false,
  //   subMenu: []
  // },
  {
    name: "app_link.Charging",
    icon: "bi bi-lightning-charge-fill",
    href: "/Charging",
    title: "",
    isAuthorize: [AccountType.CUSTOMER],
    isSubMenu: false,
    isCollapse: false,
    subMenu: [],
  },
  {
    name: "app_link.Charging_",
    icon: "bi bi-lightning",
    href: "/Charging_",
    title: "",
    isAuthorize: [AccountType.SYSTEM],
    isSubMenu: false,
    isCollapse: false,
    subMenu: [],
  },
  // {
  //   name: 'Payment',
  //       icon: 'bi bi-lightning-charge-fill',
  //       href: '/Payment',
  //   title: '',
  //   isAuthorize: [AccountType.CUSTOMER,AccountType.SYSTEM],
  //   isSubMenu: false,
  //   isCollapse: false,
  //   subMenu: []
  // },

  // {
  //   name: 'Payment_CIb',
  //       icon: 'bi bi-lightning-charge-fill',
  //       href: '/Payment_CIb',
  //   title: '',
  //   isAuthorize: [AccountType.CUSTOMER,AccountType.SYSTEM],
  //   isSubMenu: false,
  //   isCollapse: false,
  //   subMenu: []
  // },
  {
    name: "app_link.Customer",
    icon: "bi bi-people",
    href: "/Customer",
    title: "",
    isAuthorize: [AccountType.SYSTEM, AccountType.ADMIN],
    isSubMenu: false,
    isCollapse: false,
    subMenu: [],
  },
  {
    name: "app_link.Property",
    icon: "bi bi-building",
    href: "/Property",
    title: "",
    isAuthorize: [AccountType.ADMIN],
    isSubMenu: false,
    isCollapse: false,
    subMenu: [],
  },
  {
    name: "app_link.Project",
    icon: "bi bi-folder",
    href: "/Project",
    title: "",
    isAuthorize: [AccountType.ADMIN],
    isSubMenu: false,
    isCollapse: false,
    subMenu: [],
  },
  {
    name: "app_link.Payment_Getway",
    icon: "bi bi-credit-card-2-back",
    href: "/Payment_Getway",
    title: "",
    isAuthorize: [AccountType.ADMIN],
    isSubMenu: false,
    isCollapse: false,
    subMenu: [],
  },
];

export const PROFILE_LINK: App_Navigation[] = [
  {
    name: "app_link.Profile_info",
    icon: "bi bi-person-circle",
    href: "/Profile",
    title: "",
    isAuthorize: null,
    isSubMenu: false,
    isCollapse: false,
    subMenu: [],
  },
  {
    name: "app_link.Edit_Profile",
    icon: "bi bi-person-gear",
    href: "/Profile/Edit_Profile",
    title: "",
    isAuthorize: null,
    isSubMenu: false,
    isCollapse: false,
    subMenu: [],
  },
  {
    name: "app_link.Change_Password",
    icon: "bi bi-key",
    href: "/Profile/Change_Password",
    title: "",
    isAuthorize: null,
    isSubMenu: false,
    isCollapse: false,
    subMenu: [],
  },
  {
    name: "app_link.Account_Setting",
    icon: "bi bi-gear",
    href: "/Profile/Account_Setting",
    title: "",
    isAuthorize: [AccountType.CUSTOMER],
    isSubMenu: false,
    isCollapse: false,
    subMenu: [],
  },
  {
    name: "app_link.Payment",
    icon: "bi bi-wallet2",
    href: "/Profile/Payment",
    title: "",
    isAuthorize: [AccountType.CUSTOMER],
    isSubMenu: false,
    isCollapse: false,
    subMenu: [],
  },
  {
    name: "app_link.Support",
    icon: "bi bi-headset",
    href: "/Profile/Support",
    title: "",
    isAuthorize: [AccountType.CUSTOMER],
    isSubMenu: false,
    isCollapse: false,
    subMenu: [],
  },
];

export const searchMenu = (searchTerm: string): any => {
  let results;
  for (const item of APP_LINK) {
    // Check if the item's name matches the search term
    if (item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      console.log(item);

      return item; // Return the first matching item
    }

    // Check if the subMenu exists and search within it
    if (item.isSubMenu && item.subMenu) {
      for (const subItem of item.subMenu) {
        if (subItem.name.toLowerCase() === searchTerm.toLowerCase()) {

          return subItem; // Return the first matching subItem
        }
      }
    }
  }
  return null;
};
