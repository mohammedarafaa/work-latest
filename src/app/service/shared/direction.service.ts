import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DirectionService {
  private _direction = new BehaviorSubject<string>('ltr');
  public readonly direction$: Observable<string> = this._direction.asObservable();

  constructor() {
    // Initialize direction based on document direction or a default
    if (typeof document !== 'undefined') {
      this._direction.next(document.documentElement.dir || 'ltr');
    }
  }

  setDirection(direction: 'ltr' | 'rtl'): void {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction;
    }
    this._direction.next(direction);
  }

  toggleDirection(): void {
    const currentDirection = this._direction.getValue();
    const newDirection = currentDirection === 'ltr' ? 'rtl' : 'ltr';
    this.setDirection(newDirection);
  }

  get currentDirection(): string {
    return this._direction.getValue();
  }
}
