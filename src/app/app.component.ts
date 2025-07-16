import { DOCUMENT } from "@angular/common";
import { Component, Inject, OnInit, OnDestroy } from "@angular/core";
import { LanguageServiceService } from "@service/shared/language-service.service";
import { DirectionService } from "@service/shared/direction.service"; // ✅ ADDED
import { Subject, takeUntil, combineLatest } from "rxjs"; // ✅ ADDED

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  // ✅ ADDED: OnDestroy
  private destroy$ = new Subject<void>(); // ✅ ADDED: Memory management

  constructor(
    @Inject(DOCUMENT) private document: Document,
    public LanguageService: LanguageServiceService,
    private directionService: DirectionService // ✅ ADDED
  ) {}

  ngOnInit() {
    // ✅ ENHANCED: Your original logic + reactive updates
    this.setupInitialDirection(); // Your original logic
    this.setupReactiveUpdates(); // New reactive logic
  }

  // ✅ ADDED: Memory cleanup
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ KEPT: Your original logic (slightly enhanced)
  private setupInitialDirection(): void {
    const htmlTag = this.document.getElementsByTagName(
      "html"
    )[0] as HTMLHtmlElement;
    const body = this.document.getElementsByTagName(
      "body"
    )[0] as HTMLBodyElement;

    const direction = this.LanguageService.currentLang === "ar" ? "rtl" : "ltr";
    const lang = this.LanguageService.activeCurrentLanguage;

    htmlTag.dir = direction;
    htmlTag.lang = lang;
    body.dir = direction;
    body.lang = lang;

    // ✅ ADDED: CSS classes
    htmlTag.classList.add(direction, `lang-${lang}`);
    body.classList.add(direction, `lang-${lang}`);
  }

  // ✅ ADDED: Reactive updates for real-time changes
  private setupReactiveUpdates(): void {
    this.directionService.direction$
      .pipe(takeUntil(this.destroy$))
      .subscribe((direction) => {
        const lang = this.LanguageService.activeCurrentLanguage;
        this.updateDOMProperties(lang, direction);
      });
  }

  // ✅ ADDED: Dynamic DOM updates
  private updateDOMProperties(lang: string, direction: string): void {
    if (typeof document !== "undefined") {
      const htmlTag = this.document.documentElement;
      const body = this.document.body;

      htmlTag.dir = direction;
      htmlTag.lang = lang;
      body.dir = direction;
      body.lang = lang;

      htmlTag.classList.remove("ltr", "rtl", "lang-en", "lang-ar");
      htmlTag.classList.add(direction, `lang-${lang}`);

      body.classList.remove("ltr", "rtl", "lang-en", "lang-ar");
      body.classList.add(direction, `lang-${lang}`);
    }
  }
}
