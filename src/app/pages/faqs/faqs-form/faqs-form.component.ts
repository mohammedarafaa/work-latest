import { Component, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FAQ } from '@model/models/faq.model';
import { paging_$Searching } from '@model/Utils/Pagination';
import { TranslateService } from '@ngx-translate/core';
import { FAQService } from '@service/faq.service';
import { NotificationService } from '@service/shared/notifcation.service';
import { SharedService } from '@service/shared/Shared.service';

@Component({
  selector: 'app-faqs-form',
  templateUrl: './faqs-form.component.html',
  styleUrls: ['./faqs-form.component.scss']
})
export class FaqsFormComponent {
  form: FormGroup = this.fb.group({});
  isLoading: boolean = false;
  _isLoading: boolean = false;

  isUpdated: boolean = false;
  updateId: number = 0;
  UpdatedItem!: FAQ;
  pageTitle!: string

  paging = new paging_$Searching();

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private _faqService: FAQService,
    private _sharedService: SharedService,
  ) {

  }
  ngOnDestroy(): void {

  }
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.paging.page = params['page'] ? parseInt(params['page'], 10) : 1;
      this.paging.size = params['size'] ? parseInt(params['size'], 10) : 8;
    });


    this.route.params.subscribe((params: any) => {
      console.log(params);

      if (this._sharedService.isNotEmpty(params.FaqId)) {
        console.log(params);
        this.updateId = parseInt(params.FaqId);
        this.isUpdated = true;
        this.getDataById(this.updateId)
      }
      // this.isLoading=false;

    });
    this.pageTitle = this.isUpdated ? "Update_FAQ" : "Create_FAQ";
    this.isUpdated ? this.getDataById(this.updateId) : null;
    this.createForm();
  }
  //if user press back in browser
  
  getDataById(id: number) {
    this._faqService.getOneRecordById(id)
      .subscribe({
        next: (value: any) => {
          if (value.status === 200) {
            this.UpdatedItem = value.data;
            this.setFormValue();

          } else {
            this.notificationService.WaringNotification(this.translate.instant(`Get_FAQ_Error`));
          }
        },
        error: (err) => {
          this.notificationService.ErrorNotification(this.translate.instant(`${err.message}`));
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }
  createForm() {
    this.form = this.fb.group({
      id: [''],
      questionEn: ['', [Validators.required]],
      questionAr: ['', [Validators.required]],
      answerEn: ['', [Validators.required]],
      answerAr: ['', [Validators.required]],
    });
  }
  setFormValue() {
    this.f['id'].setValue(this.UpdatedItem.id);
    this.f['questionEn'].setValue(this.UpdatedItem.questionEn);
    this.f['questionAr'].setValue(this.UpdatedItem.questionAr);
    this.f['answerEn'].setValue(this.UpdatedItem.answerEn);
    this.f['answerAr'].setValue(this.UpdatedItem.answerAr);
  }

  onAdd(isExit: boolean): void {
    isExit ? this._isLoading = true : this.isLoading = true;
    this._faqService.addRecord(this.form.value).subscribe({
      next: (value: any) => {
        if (value.status === 201) {
          isExit ? this.resetForm() : this.form.reset();
          this.notificationService.SuccessNotification(this.translate.instant('New_FAQ_msg'));
        } else {
          this.notificationService.WaringNotification(
            this.translate.instant(value.status.toString())
          );
          isExit ? this._isLoading = false : this.isLoading = false;

        }
      },
      error: (err) => {
        this.notificationService.ErrorNotification(this.translate.instant(`${err.message}`));
        isExit ? this._isLoading = false : this.isLoading = false;

      },
      complete: () => (
        isExit ? this._isLoading = false : this.isLoading = false
      ),
    });
  }
  onUpdate(): void {
    this.isLoading = true;
    this._faqService.editRecord(this.form.value).subscribe({
      next: (value: any) => {
        if (value.status === 200) {
          this.notificationService.SuccessNotification(this.translate.instant('Edit_FAQ_msg'));
          this.resetForm();
        } else {
          this.notificationService.WaringNotification(
            this.translate.instant(value.status.toString())
          );
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.notificationService.ErrorNotification(this.translate.instant(`${err.message}`));
        this.isLoading = false;
      },
      complete: () => (this.isLoading = false),
    });
  }

  resetForm() {
    this.form.reset();
    this.router.navigate(['/Faqs']);
  }
}
