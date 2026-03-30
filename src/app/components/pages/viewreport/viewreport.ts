import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Reportservice } from '../../service/reports/reportservice';
import { FormsModule } from '@angular/forms';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';






@Component({
  selector: 'app-viewreport',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './viewreport.html',
  styleUrl: './viewreport.css'
})
export class Viewreport implements OnInit {
  

  report: any;

  reportId: any;
  noData = false;
  // reportData: any;

  constructor(private route: ActivatedRoute, private api: Reportservice, private cdr: ChangeDetectorRef) { }

reportData: any = {}; 
visits: any[] = [];
startTime: string = "";
endTime: string = "";
reportName: string = "";



page: number = 1;
//pageSize: number = 15;  // default
totalRecords: number = 0;



// ngOnInit(): void {

//   this.reportId = this.route.snapshot.paramMap.get("id")!;
//   console.log("📄 Viewing report ID:", this.reportId);

//   // Load report metadata first
//   this.api.getReportByID(this.reportId, 1, 1).subscribe({
//     next: (res: any) => {
//       console.log("🔍 Report Meta Response:", res);
//       this.reportData = res.report;
//       this.cdr.detectChanges();

//       // Then load asset live summary
//      this.loadAssetLiveSummary();
//     },
//     error: err => {
//       console.error("❌ Error loading report:", err);
//       alert("Report not found.");
//     }
//   });
// }


ngOnInit(): void {

  console.log("🔥 ViewReportComponent Loaded");

  this.route.paramMap.subscribe(params => {

    this.reportId = params.get('id');

    console.log("📌 Route ID:", this.reportId);

    if (this.reportId) {
      this.loadAssetLiveSummary(this.reportId);
    } else {
      console.error("❌ No ID in route");
    }

  });
}

loadGeneratedReport() {
  this.api.getGenerateReport(this.startTime, this.endTime, this.reportName)
    .subscribe({
      next: (res: any) => {
        console.log("Generated Report:", res);

        this.reportData = res.report;   // << IMPORTANT

        this.cdr.detectChanges();
      },
      error: err => {
        console.error(err);
        alert("Failed to generate report");
      }
    });
}




loadReport() {
  this.api.getReportByID(this.reportId, this.page, this.pageSize).subscribe({
    next: (res: any) => {
      console.log("🔥 Paged API Response:", res);

      this.reportData = res.report;        
      this.visits = res.visits || [];      
      this.totalRecords = res.totalRecords || this.reportData.totalVisits || 0;

      this.cdr.detectChanges();  
    },
    error: err => {
      console.error(err);
      alert("Failed to load report.");
    }
  });
}




// changePageSize() {
//   this.page = 1;
//   // this.loadReport();
//     this.loadAssetLiveSummary();
// }

// nextPage() {
//   if ((this.page * this.pageSize) < this.totalRecords) {
//     this.page++;
//       // this.loadReport();
//   this.loadAssetLiveSummary();
//   }
// }





// prevPage() {
//   if (this.page > 1) {
//     this.page--;
//     // this.loadReport();
//      this.loadAssetLiveSummary();
//   }
// }




// loadGeneratedReport() {
//   this.api.getGenerateReport(this.startTime, this.endTime, this.reportName)
//     .subscribe({
//       next: (res: any) => {
//         console.log("Generated Report:", res);
//         this.reportData = res;   // IMPORTANT
//         this.cdr.detectChanges();
//       },
//       error: err => {
//         console.error(err);
//         alert("Failed to generate report");
//       }
//     });
// }



// generateReport() {
//   this.api.getGenerateReport(this.startTime, this.endTime, this.reportName)
//     .subscribe({
//       next: (res: any) => {
//         console.log("API Response:", res);   // <-- Shows totalVisits
//         this.reportData = res;               // <-- REQUIRED to display in HTML
//       },
//       error: (err) => {
//         console.error("Error generating report:", err);
//       }
//     });
// }


  // loadReportData() {
  //   console.log('Fetching report ID:', this.reportId);
  //   this.api.getReportByID(this.reportId).subscribe({
  //     next: (res) => {
  //       console.log('Fetched Report Data:', res);
  //       this.reportData = res;
  //     },
  //     error: (err) => {
  //       console.error('Error fetching report:', err);
  //       alert('⚠️ Report not found on the server.');
  //     }
  //   });















  // calculateDuration(checkIn: string, checkOut: string): string {
  //   if (!checkIn || !checkOut) return '—';
  //   const start = new Date(checkIn).getTime();
  //   const end = new Date(checkOut).getTime();
  //   const diffMinutes = Math.round((end - start) / 60000); // convert ms → minutes
  //   return diffMinutes + ' min';

  // }













  // downloadReport() {
  //   if (!this.reportData) {
  //     alert('⚠️ No report data available to download.');
  //     return;
  //   }

  //   // Convert visits to CSV
  //   if (!this.reportData.visits || this.reportData.visits.length === 0) {
  //     alert('⚠️ No visit data found to download.');
  //     return;
  //   }

  //   // Create CSV header
  //   let csv = 'S.No,BLE Tag ID,Zone ID,Check-In Time,Check-Out Time,Time Spent (mins)\n';

  //   this.reportData.visits.forEach((visit: any, index: number) => {
  //     const checkIn = new Date(visit.checkInTime);
  //     const checkOut = new Date(visit.checkOutTime);
  //     const duration = ((checkOut.getTime() - checkIn.getTime()) / 60000).toFixed(1); // minutes

  //     csv += `${index + 1},${visit.bleTagId},${visit.zoneId},${checkIn.toLocaleString()},${checkOut.toLocaleString()},${duration}\n`;
  //   });

  //   // Add summary/info on top
  //   const headerInfo =
  //     `Report Name: ${this.reportData.reportName}\n` +
  //     `Start Time: ${new Date(this.reportData.startTime).toLocaleString()}\n` +
  //     `End Time: ${new Date(this.reportData.endTime).toLocaleString()}\n` +
  //     `Total Visits: ${this.reportData.totalVisits}\n` +   // <-- ADD THIS
  //     `Created At: ${new Date(this.reportData.createdAt).toLocaleString()}\n\n`;


  //   const fullCSV = headerInfo + csv;

  //   // Create downloadable file
  //   const blob = new Blob([fullCSV], { type: 'text/csv' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = `${this.reportData.reportName || 'report'}.csv`;
  //   a.click();
  //   window.URL.revokeObjectURL(url);
  // }







// async loadAllPages() {
//   let page = 1;
//   let pageSize = 100;
//   let allVisits: any[] = [];
//   let total = 0;

//   while (true) {
//     const res: any = await this.api.getReportByID(this.reportId, page, pageSize).toPromise();

//     if (!res || !res.visits) break;

//     // First page → set report and total
//     if (page === 1) {
//       this.reportData = res.report;
//       total = res.totalRecords || res.report.totalVisits || 0;
//     }

//     allVisits.push(...res.visits);

//     if (allVisits.length >= total) break; // STOP when full data collected

//     page++;
//   }

//   this.visits = allVisits; // FULL dataset here
// }







// async loadAll() {
//   const res: any = await this.api.getReportByID(this.reportId, 1, 1000000).toPromise();
//   this.reportData = res.report;
//   this.visits = res.visits;
// }
async loadAll() {
  try {
    const res: any = await this.api.getAssetLiveSummary(this.reportId, 1, 1000000).toPromise();
    
    if (Array.isArray(res)) {
      this.visits = res;
    } else {
      this.visits = res.assets || res.data || res.results || [];
    }
    
    console.log("📥 Downloaded all assets:", this.visits.length);
  } catch (error) {
    console.error("❌ Error loading all assets:", error);
    throw error;
  }
}




// async onDownloadClick() {

//   await this.loadAll();

//   const wb = XLSX.utils.book_new();
  
//   const wsData = [
//     [`Report Name: ${this.reportData.reportName}`],
//     [`Start Time: ${new Date(this.reportData.startTime).toLocaleString()}`],
//     [`End Time: ${new Date(this.reportData.endTime).toLocaleString()}`],
//     [`Total Visits: ${this.visits.length}`],
//     [],  // blank row
//     ["S.No", "BLE Tag ID", "Zone ID", "Check-In Time", "Check-Out Time", "Time Spent (mins)"]
//   ];

//   this.visits.forEach((v: any, i: number) => {
//     const checkIn = new Date(v.checkInTime);
//     const checkOut = new Date(v.checkOutTime);
//     const dur = ((checkOut.getTime() - checkIn.getTime()) / 60000).toFixed(2);

//     wsData.push([
//       i + 1,
//       v.bleTagId,
//       v.zoneId,
//       checkIn.toLocaleString(),
//       checkOut.toLocaleString(),
//       dur
//     ]);
//   });

//   const ws = XLSX.utils.aoa_to_sheet(wsData);

//   // Optional: merge first header row A1:F1
//   ws['!merges'] = [
//     { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
//   ];

//   XLSX.utils.book_append_sheet(wb, ws, 'Report');

//   const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

//   saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${this.reportData.reportName}.xlsx`);
// }



// 9-2-2026

async onDownloadClick() {
  await this.loadAll();

  const wb = XLSX.utils.book_new();
  
  const wsData = [
    [`Report Name: ${this.reportData.reportName}`],
    [`Start Time: ${new Date(this.reportData.startTime).toLocaleString()}`],
    [`End Time: ${new Date(this.reportData.endTime).toLocaleString()}`],
    [`Total Assets: ${this.visits.length}`],
    [],  // blank row
    ["S.No", "Asset Name", "Unique ID", "Project", "Department", "Category", "Brand", "Model", "Status", "Check-In Time", "Check-Out Time"]
  ];

  this.visits.forEach((v: any, i: number) => {
    const checkIn = v.checkInTime ? new Date(v.checkInTime).toLocaleString() : '—';
    const checkOut = v.checkOutTime ? new Date(v.checkOutTime).toLocaleString() : '—';

    wsData.push([
      i + 1,
      v.assetName || '—',
      v.uniqueId || '—',
      v.projectName || '—',
      v.department || '—',
      v.mainCategory || '—',
      v.brand || '—',
      v.model || '—',
      v.status || '—',
      checkIn,
      checkOut
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }];

  XLSX.utils.book_append_sheet(wb, ws, 'Asset Report');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${this.reportData.reportName}.xlsx`);
}





// 9-2-2026


// loadAssetLiveSummary() {
//   console.log("🔵 Loading asset summary for reportId:", this.reportId);
  
//   this.api.getAssetReportSummary(this.reportId)
//     .subscribe({
//       next: (res: any) => {
//         console.log("🟢 Asset Live Summary Response:", res);

//         // The response is directly an array
//         if (Array.isArray(res)) {
//           this.visits = res;
//           this.totalRecords = res.length;
//         } else {
//           // In case the response has a wrapper object
//           this.visits = res.assets || res.data || res.results || [];
//           this.totalRecords = res.totalRecords || res.total || this.visits.length;
//         }

//         console.log("✅ Assets loaded:", this.visits.length);
//         this.cdr.detectChanges();
//       },
//       error: err => {
//         console.error("❌ Asset Summary Error:", err);
//         alert("Failed to load asset summary.");
//       }
//     });
// }


// loadAssetLiveSummary(bsonId: string) {
//   console.log("🔵 Loading asset summary for bsonId:", bsonId);
//   this.api.getAssetReportSummary(bsonId).subscribe({
//     next: (res: any) => {
//       console.log("🟢 Asset Live Summary Response:", res);
//        this.reportData = res;
//       // Attach expanded flag to each asset
//       this.visits = (res.assets || []).map((asset: any) => ({
//         ...asset,
//         expanded: false
//       }));
//       this.totalRecords = res.totalAssets || 0;
//       this.cdr.detectChanges();
//     },
//     error: err => {
//       console.error("❌ Asset Summary Error:", err);
//       alert("Failed to load asset summary.");
//     }
//   });
// }


pageSizes: number[] = [5, 10, 25, 50];
pageSize: number = 10;
pageNumber: number = 1;
totalPages: number = 0;
totalAssets: number = 0;
bsonId: string = '';

onPageSizeChange() {
  this.pageNumber = 1; // reset to first page when page size changes
  this.loadAssetLiveSummary(this.bsonId, 1);
}
loadAssetLiveSummary(bsonId: string, pageNumber: number = 1) {
  this.bsonId = bsonId;
  this.pageNumber = pageNumber;

  this.api.getAssetReportSummary(bsonId, pageNumber, this.pageSize).subscribe({
    next: (res: any) => {
      console.log("🟢 Asset Live Summary Response:", res);
      this.reportData = res;
      this.totalAssets = res.totalAssets || 0;
      this.totalPages = Math.ceil(this.totalAssets / this.pageSize);

      this.visits = (res.assets || []).map((asset: any) => ({
        ...asset,
        expanded: false
      }));
      this.cdr.detectChanges();
    },
    error: err => {
      console.error("❌ Asset Summary Error:", err);
      alert("Failed to load asset summary.");
    }
  });
}



expandedAssets: Set<string> = new Set();

toggleAsset(asset: any) {
  asset.expanded = !asset.expanded;
}
}



