import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ERROR } from '@model/Utils/ERROR';

@Component({
  selector: 'app-error-main',
  templateUrl: './error-main.component.html',
  styleUrls: ['./error-main.component.css']
})
export class ErrorMainComponent {
  errorList:any[]=ERROR;
  currentError!:any;
  constructor(
    private route: ActivatedRoute
  ){

  }
  ngOnInit(): void {
    const errorId:string = this.route.snapshot.paramMap.get('errorId')!;

    this.currentError= this.errorList.find(error => error.id === parseInt(errorId));
  }
}
