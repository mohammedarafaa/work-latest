import { Component, Input } from '@angular/core';
import { APP_LINK, App_Navigation } from '@model/Utils/APP_LINK';
import { AuthenticationService } from '@service/auth/authentication.service';
import { LanguageServiceService } from '@service/shared/language-service.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent {
  @Input() isCollapsed!: boolean;

  appLink!: App_Navigation[];
  currentRoute: string = '';

  constructor(
    public LanguageService: LanguageServiceService,
    private auth: AuthenticationService
  ) {}

  ngOnInit(): void {
    const userAccountType = this.auth.getAccountType();
    
    this.appLink = APP_LINK.filter(menu => {
      // If isAuthorize is null, the menu is accessible to everyone
      if (menu.isAuthorize === null) {
        return true;
      }
      
      // Check if the user's account type is included in the array of authorized account types
      return Array.isArray(menu.isAuthorize) 
        ? menu.isAuthorize.includes(userAccountType)
        : menu.isAuthorize === userAccountType;
    });
  }

  isActiveLink(nav: string) {
    return nav.toUpperCase() === this.currentRoute.toUpperCase();
  }

  toggleSubmenu(clickedNav: App_Navigation) {
    clickedNav.isCollapse = !clickedNav.isCollapse;
  }
}