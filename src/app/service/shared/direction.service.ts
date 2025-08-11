// direction.service.ts (Enhanced version)
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DirectionService {
  private _direction = new BehaviorSubject<string>("ltr");
  public readonly direction$: Observable<string> =
    this._direction.asObservable();

  constructor() {
    if (typeof document !== "undefined") {
      const currentDir = document.documentElement.dir || "ltr";
      this._direction.next(currentDir);
    }
  }

  setDirection(direction: "ltr" | "rtl"): void {
    console.log("DirectionService: Setting direction to:", direction);

    if (typeof document !== "undefined") {
      // Apply to DOM
      document.documentElement.dir = direction;
      document.body.dir = direction;

      // Add/remove CSS classes
      if (direction === "rtl") {
        document.documentElement.classList.add("rtl");
        document.documentElement.classList.remove("ltr");
        document.body.classList.add("rtl");
        document.body.classList.remove("ltr");
      } else {
        document.documentElement.classList.add("ltr");
        document.documentElement.classList.remove("rtl");
        document.body.classList.add("ltr");
        document.body.classList.remove("rtl");
      }

      // Force reflow
      document.documentElement.offsetHeight;

      // Dispatch events
      this.dispatchDirectionEvents(direction);
    }

    // Update observable
    this._direction.next(direction);
  }

  private dispatchDirectionEvents(direction: string): void {
    // Multiple events for better compatibility
    const events = [
      new CustomEvent("directionchange", { detail: { direction } }),
      new CustomEvent("directionChanged", { detail: { direction } }),
      new CustomEvent("globalDirectionChange", { detail: { direction } }),
    ];

    events.forEach((event) => document.dispatchEvent(event));
  }

  toggleDirection(): void {
    const currentDirection = this._direction.getValue();
    const newDirection = currentDirection === "ltr" ? "rtl" : "ltr";
    this.setDirection(newDirection);
  }

  get currentDirection(): string {
    return this._direction.getValue();
  }

  get isRTL(): boolean {
    return this._direction.getValue() === "rtl";
  }
}
