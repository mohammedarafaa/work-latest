import { Injectable, TemplateRef } from '@angular/core';
export interface ToastInfo {
  header: string;
  body: string;
  delay?: number;
}
@Injectable({ providedIn: 'root' })
export class AlertService {
  toasts: any[] = [];
  options: any = {};
  SuccessNotification(textOrTpl: string | TemplateRef<any>) {
    this.toasts.push({
      textOrTpl,
      classname: 'bg-success text-white',
      delay: 3000
    });
  }
  ErrorNotification(textOrTpl: string | TemplateRef<any>) {
    this.toasts.push({
      textOrTpl,
      classname: 'bg-danger text-white',
      delay: 3000
    });
  }
  WaringNotification(textOrTpl: string | TemplateRef<any>) {
    this.toasts.push({
      textOrTpl,
      classname: 'bg-danger text-white',
      delay: 3000
    });
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }

  clear() {
    this.toasts.splice(0, this.toasts.length);
  }
}
