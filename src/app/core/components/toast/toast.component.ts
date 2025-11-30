import { Component } from '@angular/core';
import {
  NotificationService,
  Toast,
} from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
})
export class ToastComponent {
  toasts$ = this.notificationService.toasts$;

  constructor(private notificationService: NotificationService) {}

  remove(id: number) {
    this.notificationService.remove(id);
  }
}
