
import { Component, OnInit  } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { LanguageServiceService } from '@service/shared/language-service.service';
import { filter } from 'rxjs';

// import * as feather from 'feather-icons';
@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  currentLanguage: string = '';
  isCollapsed = false;
  currentRoute: string = '';

  constructor(
    private router: Router,
    private titleService: Title,
    public LanguageService: LanguageServiceService) {
    this.currentLanguage = this.LanguageService.activeCurrentLanguage;
  }

  onChangeCollapsed(eventData: any) {
    this.isCollapsed = eventData.isCollapsed;
  }
  ngOnInit(): void {
    this.changeTitle();
  }


  changeTitle() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentRoute = this.router.routerState.snapshot.url;
        const moduleName = this.currentRoute.substring(1).split('/');
        console.log(moduleName);

        if (moduleName.length === 2)
          this.titleService.setTitle(
            `Madkour Client Dashboard - ${moduleName[0]} Module - ${moduleName[1]}`
          );
        else if (moduleName.length === 1)
          this.titleService.setTitle(
            `Madkour Client Dashboard - ${moduleName[0]} Page`
          );
      });
  }
}