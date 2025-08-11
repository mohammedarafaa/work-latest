// app.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  ChangeDetectorRef,
} from "@angular/core";
import { combineLatest, Subject, startWith } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { LanguageServiceService } from "@service/shared/language-service.service";
import { DOCUMENT } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";
import { HttpService } from "@service/shared/http.service";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  // Public properties for template binding
  public currentLanguage = "en";
  public isRTL = false;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    public languageService: LanguageServiceService,
    private cdr: ChangeDetectorRef,
    private http: HttpService
  ) {}

  ngOnInit(): void {
    this.setupLanguageAndDirectionSync();
    this.hello();
  }
  // In your AppComponent


  hello() {
    console.log("Hello");
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupLanguageAndDirectionSync(): void {
    // Subscribe to both language and direction changes from your service
    combineLatest([
      this.languageService
        .getLanguageChangedObservable()
        .pipe(startWith(this.languageService.activeCurrentLanguage)),
      this.languageService
        .getDirectionChangedObservable()
        .pipe(startWith(this.languageService.getCurrentDirection())),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([language, direction]) => {
        console.log("App: Language/Direction sync:", { language, direction });

        this.currentLanguage = language;
        this.isRTL = direction === "rtl";
        this.cdr.detectChanges();
      });

    // Initialize values
    this.currentLanguage = this.languageService.activeCurrentLanguage;
    this.isRTL = this.languageService.isRTL();
  }
}
