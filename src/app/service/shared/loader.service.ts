import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loading: boolean = true;
  private spinner: boolean = true;

  constructor() {}
  // for Application loader
  setLoading(loading: boolean) {
    this.loading = loading;
  }

  getLoading(): boolean {
    return this.loading;
  }

  // for loader datatable
  setSpinner(spinner: boolean) {
    this.spinner = spinner;
  }

  getSpinner(): boolean {
    return this.spinner;
  }
}
