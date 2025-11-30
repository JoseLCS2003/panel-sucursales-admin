import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private showSubject = new BehaviorSubject<boolean>(false);
  show$ = this.showSubject.asObservable();

  private messageSubject = new BehaviorSubject<string>('');
  message$ = this.messageSubject.asObservable();

  private confirmationSubject = new Subject<boolean>();

  constructor() {}

  confirm(message: string): Promise<boolean> {
    this.messageSubject.next(message);
    this.showSubject.next(true);

    // Reset the subject for new confirmation
    this.confirmationSubject = new Subject<boolean>();

    return new Promise((resolve) => {
      this.confirmationSubject.subscribe((result) => {
        this.showSubject.next(false);
        resolve(result);
      });
    });
  }

  resolve(result: boolean) {
    this.confirmationSubject.next(result);
    this.confirmationSubject.complete();
  }
}
