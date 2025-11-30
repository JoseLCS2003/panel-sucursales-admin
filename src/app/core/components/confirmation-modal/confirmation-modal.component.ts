import { Component } from '@angular/core';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css'],
})
export class ConfirmationModalComponent {
  show$ = this.confirmationService.show$;
  message$ = this.confirmationService.message$;

  constructor(private confirmationService: ConfirmationService) {}

  confirm() {
    this.confirmationService.resolve(true);
  }

  cancel() {
    this.confirmationService.resolve(false);
  }
}
