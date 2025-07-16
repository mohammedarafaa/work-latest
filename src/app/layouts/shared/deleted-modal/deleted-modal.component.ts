import { Component , Output , Input ,  EventEmitter} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-deleted-modal',
  templateUrl: './deleted-modal.component.html',
  styleUrls: ['./deleted-modal.component.css']
})
export class DeletedModalComponent {
  @Input() modelHeader!:string;
  @Input() modelName!:string;
  @Output() isDeleted: EventEmitter<boolean> = new EventEmitter();

constructor(
  public activeModal: NgbActiveModal
){

}
  onDelete(){
    this.isDeleted.emit(true);
  }
}
