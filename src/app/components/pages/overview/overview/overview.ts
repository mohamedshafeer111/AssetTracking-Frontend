import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Historical } from '../../../service/historical/historical';

@Component({
  selector: 'app-overview',
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './overview.html',
  styleUrl: './overview.css'
})
export class Overview {



  selectedItemId: string | number | null = null; // to store the clicked item's ID


  selectItem(id: string | number) {
    this.selectedItemId = id;
  }


  hours: string[] = [];
  selectedTimeRange = 'day';
  selectedHour = 'Live';

  ngOnInit() {

    this.loadZone();

    this.route.queryParams.subscribe(params => {
      const assetId = params['id'];
      if (assetId) {
        this.loadOverview(assetId);
      }
    });

    this.setDefaultHours();

    // Create form
    this.filterForm = this.fb.group({
      fromDate: [''],
      toDate: [''],
      zone: ['']
    });

    // Set default date
    // const now = new Date();
    // const formatted = now.toISOString().slice(0, 16);

    // this.filterForm.patchValue({
    //   fromDate: formatted,
    //   toDate: formatted
    // });

  }

  onTimeRangeChange() {
    this.setDefaultHours();
  }

  setDefaultHours() {
    switch (this.selectedTimeRange) {
      case 'day':
        this.hours = ['Live', '1 Hour', '2 Hours', '8 Hours', '24 Hours'];
        break;
      case 'week':
        this.hours = ['1 Day', '2 Days', '5 Days', '7 Days'];
        break;
      case 'month':
        this.hours = ['1 Week', '2 Weeks', '3 Weeks', '4 Weeks'];
        break;
      default:
        this.hours = [];
    }

    // Set default selected hour
    this.selectedHour = this.hours[0] || '';
  }

  selectHour(hour: string) {
    this.selectedHour = hour;
    console.log('Selected Hour:', hour);
  }




  filterForm!: FormGroup;

  zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];

  tableData = [
    { name: '4321563454654', zone: 'Zone A', timeOut: '2026-01-25 T 21:02:01.795Z', timeSpend: '76', timeIn: '2026-01-25 T 21:00:45.795Z' },
    { name: '4321563454654', zone: 'Zone A', timeOut: '2026-01-25 T 21:05:25.795Z', timeSpend: '76', timeIn: '2026-01-25 T 21:04:09.795Z' },
    { name: '4321563454654', zone: 'Zone A', timeOut: '2026-01-25 T 21:09:01.795Z', timeSpend: '103', timeIn: '2026-01-25 T 21:07:18.795Z' }
  ];

  constructor(private fb: FormBuilder, private http: HttpClient, private route: ActivatedRoute, private historical: Historical,
    private cdr: ChangeDetectorRef
  ) { }






  overviewData: any[] = [];
  loadOverview(assetId: string) {
    this.historical.getOverviw(assetId).subscribe({
      next: (res: any) => {
        this.overviewData = res;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Failed to load overview:', err);
      }
    });
  }

  zoneList: any[] = [];
  loadZone() {
    this.historical.getZone().subscribe({
      next: (res: any) => {
        this.zoneList = res.data;
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error getting Zone")
      }
    })
  }

  // applyFilter() {

  //   // Get form values
  //   const zoneName = this.filterForm.get('zone')?.value;
  //   const fromDate = this.filterForm.get('fromDate')?.value;
  //   const toDate = this.filterForm.get('toDate')?.value;

  //   console.log("Form Value:", zoneName, fromDate, toDate);

  //   // Validation
  //   if (!zoneName && !fromDate && !toDate) {
  //     alert("Please select Zone and Date");
  //     return;
  //   }

  //   // Convert datetime-local to YYYY-MM-DD
  //   const startDate = new Date(fromDate).toISOString().split('T')[0];
  //   const endDate = new Date(toDate).toISOString().split('T')[0];



  //   console.log("API Params:", zoneName, startDate, endDate);

  //   // Call API
  //   this.historical
  //     .getZoneDetailsBasedOnFilter(zoneName, startDate, endDate)
  //     .subscribe({
  //       next: (res: any) => {

  //         console.log("API Response:", res);

  //         // Map response to table
  //         this.overviewData = res.map((item: any) => {

  //           const checkIn = new Date(item.checkInTime);
  //           const checkOut = new Date(item.checkOutTime);

  //           const timeSpentSeconds =
  //             (checkOut.getTime() - checkIn.getTime()) / 1000;

  //           return {
  //             zoneName: zoneName,
  //             checkInTime: checkIn.toLocaleString(),
  //             checkOutTime: checkOut.toLocaleString(),
  //             timeSpentSeconds: Math.floor(timeSpentSeconds)
  //           };

  //         });

  //         this.cdr.detectChanges();

  //       },
  //       error: (err) => {
  //         console.error("API Error:", err);
  //       }
  //     });

  // }




  applyFilter() {
  const zoneName = this.filterForm.get('zone')?.value;
  const fromDate = this.filterForm.get('fromDate')?.value;
  const toDate = this.filterForm.get('toDate')?.value;

  // ✅ Check all fields BEFORE any date conversion
  if (!zoneName) {
    alert("Please select a Zone");
    return;
  }
  if (!fromDate || fromDate.trim() === '') {
    alert("Please select a Start Date");
    return;
  }
  if (!toDate || toDate.trim() === '') {
    alert("Please select an End Date");
    return;
  }

  // ✅ Only convert after validation passes
   const startDate = new Date(fromDate).toISOString().split('T')[0];
   const endDate = new Date(toDate).toISOString().split('T')[0];

  console.log("API Params:", zoneName, startDate, endDate);

  this.historical
    .getZoneDetailsBasedOnFilter(zoneName, startDate, endDate)
    .subscribe({
      next: (res: any) => {
        this.overviewData = res.map((item: any) => {
          const checkIn = new Date(item.checkInTime);
          const checkOut = new Date(item.checkOutTime);
          const timeSpentSeconds = (checkOut.getTime() - checkIn.getTime()) / 1000;
          return {
            zoneName: zoneName,
            checkInTime: checkIn.toLocaleString(),
            checkOutTime: checkOut.toLocaleString(),
            timeSpentSeconds: Math.floor(timeSpentSeconds)
          };
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("API Error:", err);
      }
    });
}

}


