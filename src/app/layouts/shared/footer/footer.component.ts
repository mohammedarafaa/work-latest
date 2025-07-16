import { Component } from '@angular/core';
import { LanguageServiceService } from '@service/shared/language-service.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  constructor(
    public LanguageService: LanguageServiceService
  ) {}
}
