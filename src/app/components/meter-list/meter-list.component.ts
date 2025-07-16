import { Component, OnInit } from '@angular/core';
import { MeterService } from '../../service/meter.service';
import { Meter } from '../../models/meter.model';

@Component({
  selector: 'app-meter-list',
  templateUrl: './meter-list.component.html',
  styleUrls: ['./meter-list.component.scss']
})
export class MeterListComponent implements OnInit {
  meters: Meter[] = [];
  loading = false;
  error: string | null = null;

  constructor(private meterService: MeterService) { }

  ngOnInit(): void {
    this.loadMeters();
  }

  loadMeters(): void {
    this.loading = true;
    this.error = null;
    
    this.meterService.getAllMeters().subscribe({
      next: (data) => {
        this.meters = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load meters. Please try again later.';
        this.loading = false;
        console.error('Error loading meters:', err);
      }
    });
  }

  deleteMeter(id: number): void {
    if (confirm('Are you sure you want to delete this meter?')) {
      this.meterService.deleteMeter(id).subscribe({
        next: () => {
          this.meters = this.meters.filter(meter => meter.code !== id);
        },
        error: (err) => {
          this.error = 'Failed to delete meter. Please try again later.';
          console.error('Error deleting meter:', err);
        }
      });
    }
  }
} 