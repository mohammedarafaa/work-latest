import { Component, OnInit, OnDestroy } from "@angular/core";
import { ProfileService } from "@service/profile.service";
import { ThemeService } from "@service/theme.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  // Add the isDarkMode property
  isDarkMode = false;
  allCustomersCount!: number;
  private destroy$ = new Subject<void>();

  constructor(
    private profileService: ProfileService,
    private themeService: ThemeService // Add ThemeService injection
  ) {}

  ngOnInit(): void {
    this.initializeTheme(); // Initialize theme subscription
    this.getAllCustomersCount();
    this.stats = [
      { value: "24/7", label: "stats.support", animation: "fade-left" },
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Add theme initialization method
  private initializeTheme(): void {
    // Subscribe to theme changes
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDark) => {
        this.isDarkMode = isDark;
        console.log("Home: Theme changed to:", isDark ? "dark" : "light");
      });

    // Initialize current state
    this.isDarkMode = this.themeService.currentTheme;
  }

  getAllCustomersCount() {
    this.profileService.getAllCustomersCount().subscribe({
      next: (response) => {
        console.log("All Customers Count:", response);
        this.allCustomersCount = response;
        this.stats = [
          {
            value: this.allCustomersCount.toLocaleString(),
            label: "stats.activeUsers",
            animation: "fade-right",
          },
          ...this.stats,
        ];
      },
    });
  }

  features = [
    {
      icon: "fas fa-tachometer-alt",
      title: "home.features.realTimeMonitoring",
      description: "home.features.realTimeMonitoringDesc",
      info: "Get live updates on system performance.",
      animation: "fade-up",
    },
    {
      icon: "fas fa-chart-line",
      title: "home.features.usageAnalytics",
      description: "home.features.usageAnalyticsDesc",
      info: "Detailed insights into your data usage.",
      animation: "fade-up",
    },
    {
      icon: "fas fa-bell",
      title: "home.features.smartNotifications",
      description: "home.features.smartNotificationsDesc",
      info: "Get alerts and updates in real-time.",
      animation: "fade-up",
    },
    {
      icon: "fas fa-credit-card",
      title: "home.features.easyPayments",
      description: "home.features.easyPaymentsDesc",
      info: "Make payments effortlessly and securely.",
      animation: "fade-up",
    },
  ];

  // Policy data for better organization
  policies = {
    serviceActivation: {
      sections: [
        {
          icon: "fas fa-file-alt",
          title: "policy.serviceActivation.overviewTitle",
          content: "policy.serviceActivation.overviewText",
        },
        {
          icon: "fas fa-credit-card",
          title: "policy.serviceActivation.paymentTitle",
          content: "policy.serviceActivation.paymentText",
        },
        {
          icon: "fas fa-clock",
          title: "policy.serviceActivation.activationTitle",
          content: "policy.serviceActivation.activationText",
        },
        {
          icon: "fas fa-cogs",
          title: "policy.serviceActivation.experienceTitle",
          content: "policy.serviceActivation.experienceText",
        },
      ],
    },
    refund: {
      sections: [
        {
          icon: "fas fa-ban",
          title: "policy.refund.noRefundTitle",
          content: "policy.refund.noRefundText",
        },
        {
          icon: "fas fa-undo-alt",
          title: "policy.refund.noReversalTitle",
          content: "policy.refund.noReversalText",
        },
        {
          icon: "fas fa-check-circle",
          title: "policy.refund.responsibilityTitle",
          content: "policy.refund.responsibilityText",
        },
      ],
    },
  };

  stats = [
    {
      value: this.allCustomersCount,
      label: "stats.activeUsers",
      animation: "fade-right",
    },
    { value: "24/7", label: "stats.support", animation: "fade-left" },
  ];

  scrollToSection(elementId: string): void {
    const element = document.getElementById(elementId);
    element?.scrollIntoView({ behavior: "smooth" });
  }
}
