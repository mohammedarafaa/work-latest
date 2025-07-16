import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MeterService } from '../../service/meter.service';
import { Meter } from '../../models/meter.model';

@Component({
  selector: 'app-meter-form',
  templateUrl: './meter-form.component.html',
  styleUrls: ['./meter-form.component.scss']
})
export class MeterFormComponent implements OnInit {
  meterForm: FormGroup;
  isEditMode = false;
  loading = false;
  error: string | null = null;
  meterTypes = ['GAS', 'WATER', 'ELCTRICTY'];

  constructor(
    private fb: FormBuilder,
    private meterService: MeterService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.meterForm = this.fb.group({
      serial: ['', Validators.required],
      port: [null, [Validators.required, Validators.min(1)]],
      type: ['', Validators.required],
      model: ['', Validators.required],
      erpCode: ['', Validators.required],
      customer: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        fullName: ['', Validators.required],
        phoneNumber: ['', Validators.required],
        contact: [''],
        gender: ['', Validators.required],
        nationalId: ['', Validators.required],
        nationalIdAddress: [''],
        job: [''],
        erpCode: ['', Validators.required]
      }),
      property: this.fb.group({
        number: ['', Validators.required],
        propertyNo: ['', Validators.required],
        address: this.fb.group({
          street: ['', Validators.required],
          buildingNumber: ['', Validators.required],
          additionalInfo: [''],
          block: ['', Validators.required],
          floor: ['']
        })
      })
    });
  }

  ngOnInit(): void {
    const meterId = this.route.snapshot.paramMap.get('id');
    if (meterId) {
      this.isEditMode = true;
      this.loadMeter(Number(meterId));
    }
  }

  loadMeter(id: number): void {
    this.loading = true;
    this.meterService.getMeter(id).subscribe({
      next: (meter) => {
        this.meterForm.patchValue(meter);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load meter. Please try again later.';
        this.loading = false;
        console.error('Error loading meter:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.meterForm.valid) {
      this.loading = true;
      const meter: Meter = this.meterForm.value;

      const request = this.isEditMode
        ? this.meterService.saveMeter(meter)
        : this.meterService.saveMeter(meter);

      request.subscribe({
        next: () => {
          this.router.navigate(['/meters']);
        },
        error: (err) => {
          this.error = 'Failed to save meter. Please try again later.';
          this.loading = false;
          console.error('Error saving meter:', err);
        }
      });
    }
  }
} 