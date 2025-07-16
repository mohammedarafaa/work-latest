
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { Router } from "@angular/router";
import { AuthenticationService } from "@service/auth/authentication.service";

import { AuthToken, User } from "@model/auth/auth.model";
import { BehaviorSubject, Subscription } from "rxjs";
import { APP_LINK, App_Navigation } from "@model/Utils/APP_LINK";
import { TranslateService } from "@ngx-translate/core";
import { LanguageServiceService } from "@service/shared/language-service.service";
import { MqttService } from "@service/shared/mqtt.service";
import { Notification } from "@model/notification";
import { environment } from "@environments/environment";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() isCollapseChanged = new EventEmitter<{ isCollapsed: boolean }>();
  @Input() isCollapsed!: boolean;

  currentLanguage!: string;
  url: string = "assets/img/avatar/avatar.png";
  currentUser!: AuthToken | null;
  languageList: any[] = [
    { name: "English", image: "assets/img/flags/en.png", value: "en" },
    { name: "Arabic", image: "assets/img/flags/ar.png", value: "ar" },
  ];
  themeIconName: BehaviorSubject<any> = new BehaviorSubject("fas fa-eye-slash");
  isLight = false;

  notificationList: Notification[] = [];

  appLink: App_Navigation[] = APP_LINK;
  allLinks: any[] = [];
  isMobile = false;
  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    public LanguageService: LanguageServiceService,
    private authService: AuthenticationService,
    private auth: AuthenticationService,
    private mqttService: MqttService, // Inject the MqttService
    private _translate: TranslateService
  ) {
    this.currentUser = this.authService.getAuthUser();
  }
  ngOnDestroy(): void {
    this.mqttService.disconnect();
  }
  ngOnInit(): void {
    this.checkScreenSize();
    this.mqttService.connect();
    // const userId = this.authService.userValue ? this.authService.userValue?.id : 1 ;
    this.initializeNotifications();

    // const Perm: string[] = this.authService.userValue?.roles || []; // Ensure Perm is always an array

    const userAccountType = this.auth.getAccountType();
    this.allLinks = APP_LINK.filter((menu) => {
      // If isAuthorize is null, the menu is accessible to everyone
      if (menu.isAuthorize === null) {
        return true;
      }
      // Check if the user's account type is included in the array of authorized account types
      return Array.isArray(menu.isAuthorize)
        ? menu.isAuthorize.includes(userAccountType)
        : menu.isAuthorize === userAccountType;
    });
    this.currentLanguage = this.LanguageService.activeCurrentLanguage;
  }
  collapse() {
    this.isCollapseChanged.emit({ isCollapsed: !this.isCollapsed });
  }
  changeLanguage(language: string) {
    console.log(language);
    setTimeout(() => {
      window.location.reload();
      this.LanguageService.toggleLanguage(language);
    }, 1000);
  }

  logout() {
    this.mqttService.disconnect();
    this.authService.logout();
    this.router.navigateByUrl("/");
  }

  onSearchPage($event: any) {
    console.log($event);
  }

  onSelectPage($event: any) {
    console.log($event);
    this.router.navigateByUrl($event.href);
  }
  private initializeNotifications(): void {
    // Subscribe to MQTT messages
    this.mqttService.getMessages().subscribe((res: any) => {
      console.log(res);
      res.payload.forEach((message: any) => {
        let newNotification = {
          id: message.id,
          title: message.title,
          message: message.message,
          icon: message.icon,
          type: message.type,
          actionUrl: message.actionUrl,
          timestamp: new Date().toLocaleString(),
          read: false, // Mark as unread by default
        };
        this.notificationList.unshift(newNotification);
      });
    });

    // Subscribe to the MQTT topic for notifications
    console.log(`${environment.Mqqt_Message}1`);
    // const userId = this.authService.userValue ? this.authService.userValue?.id : 1;
    this.mqttService.subscribeToTopics(`${environment.Mqqt_Message}1`); // Replace with your actual topic
  }

  markAsRead(notification: any): void {
    notification.read = true;
    // Optionally, send an update to the server to mark the notification as read
  }

  markAllAsRead(): void {
    this.notificationList.forEach(
      (notification: Notification) => (notification.read = true)
    );
    // Optionally, send an update to the server to mark all notifications as read
  }
  @HostListener("window:resize", [])
  onResize() {
    this.checkScreenSize();
  }
    onLogoClick(event?: Event) {
      if (event) event.preventDefault();
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/Dashboard']);
      } else {
        this.router.navigate(['/']);
      }
    }
  private checkScreenSize() {
    this.isMobile = window.innerWidth < 992; // Bootstrap's lg breakpoint
  }
}