import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-model',
  templateUrl: './confirm-model.component.html',
  styleUrls: ['./confirm-model.component.scss']
})
export class ConfirmModelComponent {
  @Input() modelHeader!: string;
  @Input() modelDescription!: string;
  @Output() isConfirmed: EventEmitter<boolean> = new EventEmitter();

  constructor(
    public activeModal: NgbActiveModal
  ) {

  }
  onConfirm() {
    this.isConfirmed.emit(true);
    this.activeModal.close(); // Close after emitting
  }
}


