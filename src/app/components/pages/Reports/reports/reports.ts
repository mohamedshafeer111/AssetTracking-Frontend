import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Roleservice } from '../../../service/role/roleservice';
import { Reportservice } from '../../../service/reports/reportservice';

@Component({
  selector: 'app-reports',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {

  activeTab: string = 'project'; // 👈 default tab
  selectedTimeRange: string = 'day';


  constructor(private role: Roleservice, private cdr: ChangeDetectorRef, private api: Reportservice, private router: Router) { }

  ngOnInit(): void {
    this.selectedTimeRange = 'day';
    this.loadProject();
    this.setDefaultHours();
  }

  // ... rest of your code unchanged ...






  projects: any[] = [];

  loadProject() {
    this.role.getProject().subscribe({
      next: (res: any) => {
        this.projects = res;
        this.cdr.detectChanges();

      },
      error: () => {
        console.log("error loading project")
      }
    })
  }



  countriesByProject: { [projectId: string]: any[] } = {};
  expandedProjects: Set<string> = new Set();

  toggleProject(projectId: string) {
    if (this.expandedProjects.has(projectId)) {
      this.expandedProjects.delete(projectId);
    } else {
      this.expandedProjects.add(projectId);
      this.loadCountries(projectId);
    }
  }

  loadCountries(projectId: string) {
    if (this.expandedProjects.has(projectId)) {
      this.expandedProjects.delete(projectId);
      return;
    }

    this.role.countryGetById(projectId).subscribe({
      next: (res: any) => {
        this.countriesByProject[projectId] = Array.isArray(res) ? res : [];
        this.expandedProjects.add(projectId);
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading countries");
      }
    });
  }

  areaByCountry: { [countryId: string]: any[] } = {};
  expandedCountry: Set<string> = new Set();
  toggleCountry(countryId: string) {
    if (this.expandedCountry.has(countryId)) {
      this.expandedCountry.delete(countryId);
    } else {
      this.expandedCountry.add(countryId);
      this.loadArea(countryId);
    }
  }


  loadArea(countryId: string) {
    if (this.expandedCountry.has(countryId)) {
      this.expandedCountry.delete(countryId);
      return;
    }

    if (!this.areaByCountry[countryId]) {
      this.role.getSummary(countryId).subscribe({
        next: (res: any) => {
          this.areaByCountry[countryId] = Array.isArray(res) ? res : [];
          this.expandedCountry.add(countryId);
          this.cdr.detectChanges();
        },
        error: () => {
          console.log("Error loading areas");
        }
      });
    } else {
      this.expandedCountry.add(countryId);
      this.cdr.detectChanges();
    }
  }


  buildingByArea: { [areaId: string]: any[] } = {};
  expandedArea: Set<string> = new Set(); // track open dropdowns

  toggleArea(areaId: string) {
    if (this.expandedArea.has(areaId)) {
      this.expandedArea.delete(areaId);
    } else {
      this.expandedArea.add(areaId);
      this.loadBuilding(areaId);
    }
  }


  loadBuilding(areaId: string) {
    if (this.expandedArea.has(areaId)) {
      this.expandedArea.delete(areaId);
      return;
    }

    this.role.getBuilding(areaId).subscribe({
      next: (res: any) => {
        this.buildingByArea[areaId] = Array.isArray(res) ? res : [];
        this.expandedArea.add(areaId);
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading building");
      }
    });
  }


  floors: any[] = [];
  floorByBuilding: { [buildingId: string]: any[] } = {};
  expandedBuilding: Set<string> = new Set();

  toggleBuilding(buildingId: string) {
    if (this.expandedBuilding.has(buildingId)) {
      this.expandedBuilding.delete(buildingId);
    } else {
      this.expandedBuilding.add(buildingId);
      this.loadFloor(buildingId);
    }
  }

  loadFloor(buildingId: string) {
    if (this.expandedBuilding.has(buildingId)) {
      this.expandedBuilding.delete(buildingId);
      return;
    }
    this.role.getFloor(buildingId).subscribe({
      next: (res: any) => {
        console.log("Floors for building:", buildingId, res);
        this.floors = res;
        this.floorByBuilding[buildingId] = Array.isArray(res) ? res : [];
        this.expandedBuilding.add(buildingId);
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading floor");
      }
    });
  }



  zones: any[] = [];
  zoneByFloor: { [floorId: string]: any[] } = {};
  expandedFloor: Set<string> = new Set();

  toggleFloor(floorId: string) {
    if (this.expandedFloor.has(floorId)) {
      this.expandedFloor.delete(floorId);
    } else {
      this.expandedFloor.add(floorId);
      this.loadZones(floorId);
    }
  }

  loadZones(floorId: string) {
    if (this.expandedFloor.has(floorId)) {
      this.expandedFloor.delete(floorId);
      return;
    }
    this.role.getZones(floorId).subscribe({
      next: (res: any) => {
        console.log("Zones for floor:", floorId, res);
        this.zones = res;
        this.zoneByFloor[floorId] = Array.isArray(res) ? res : [];
        this.expandedFloor.add(floorId);
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading zones");
      }
    });
  }


  subZones: any[] = [];
  subZoneByZone: { [zoneId: string]: any[] } = {};
  expandedZone: Set<string> = new Set();

  toggleZone(zoneId: string) {
    if (this.expandedZone.has(zoneId)) {
      this.expandedZone.delete(zoneId);
    } else {
      this.expandedZone.add(zoneId);
      this.loadSubZones(zoneId);
    }
  }

  loadSubZones(zoneId: string) {
    if (this.expandedZone.has(zoneId)) {
      this.expandedZone.delete(zoneId);
      return;
    }
    this.role.getSubZones(zoneId).subscribe({
      next: (res: any) => {
        console.log("SubZones for zone:", zoneId, res);
        this.subZones = res;
        this.subZoneByZone[zoneId] = Array.isArray(res) ? res : [];
        this.expandedZone.add(zoneId);
        this.cdr.detectChanges();
      },
      error: () => {
        console.error("Error loading subzones");
      }
    });
  }

  selectedItemId: string | number | null = null; // to store the clicked item's ID

  selectItem(id: string | number) {
    this.selectedItemId = id;
  }




  hours: string[] = [];
  selectedHour = 'Live';

  reportName = '';
  selectedTemplate = '';
  selectedFormat = 'URL';
  includeCSV = false;

  recurrence = 'Once';
  shareEmails = '';

  // 🆕 For custom date range
  customStartDate: string = '';
  customEndDate: string = '';
  isCustomStartFocused: boolean = false;
  isCustomEndFocused: boolean = false;


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
      case 'custom':
        this.hours = []; // hide hour buttons for custom
        this.selectedHour = '';
        break;
      default:
        this.hours = [];
    }

    if (this.selectedTimeRange !== 'custom') {
      this.selectedHour = this.hours[0];
      this.customStartDate = '';
      this.customEndDate = '';
    }
  }

  cancel() {
    this.reportName = '';
    this.selectedTemplate = '';
    this.selectedFormat = 'URL';
    this.includeCSV = false;
    this.recurrence = 'Once';
    this.shareEmails = '';
    this.selectedTimeRange = 'day';
    this.setDefaultHours();
  }


















  selectedZoneName: string | null = null;
  // ✅ Keep this inside the class
  private saveReport(reportDetails: any) {
    const existingReports = JSON.parse(localStorage.getItem('reports') || '[]');
    existingReports.push(reportDetails);
    localStorage.setItem('reports', JSON.stringify(existingReports));
    console.log('Saved report:', reportDetails);
  }



  getHoursFromSelection(selectedHour: string): number {
    if (!selectedHour) return 0;

    const value = selectedHour.toLowerCase().trim();

    // Optional: handle Live
    if (value === 'live') {
      return 0;
    }

    // Only allow hours
    if (value.includes('hour')) {
      const hours = parseInt(value, 10);
      return isNaN(hours) ? 0 : hours;
    }

    // ❌ Ignore day/week/month completely
    return 0;
  }




  getDaysFromSelection(selection: string): number {
    if (!selection) return 0;

    if (selection.includes('Day')) {
      return parseInt(selection); // "1 Day" → 1, "5 Days" → 5
    }

    if (selection.includes('Week')) {
      return parseInt(selection) * 7; // "2 Weeks" → 14
    }

    return 0;
  }






  generateReport() {

    /* =========================
       🟣 CUSTOM DATE RANGE
       ========================= */
    if (this.selectedTimeRange === 'custom') {

      if (!this.customStartDate || !this.customEndDate) {
        alert('⚠️ Please select both From and To dates.');
        return;
      }

      if (!this.reportName?.trim()) {
        alert('⚠️ Please enter a report name.');
        return;
      }

      let apiCall;

      if (this.selectedZoneName) {
        apiCall = this.api.getGenerateReportZone(
          this.customStartDate,
          this.customEndDate,
          this.selectedZoneName,
          this.reportName.trim(),
          this.shareEmails
        );
      } else {
        apiCall = this.api.getGenerateReport(
          this.customStartDate,
          this.customEndDate,
          this.reportName.trim(),
          this.shareEmails,
          this.selectedTemplate ?? ''
        );
      }

      apiCall.subscribe({
        next: (res: any) => {
          this.saveReport({
            // id: res.id || Date.now(),
            bsonId: res.bsonId,
            reportName: this.reportName.trim(),
            timeRange: 'custom',
            createdOn: new Date().toLocaleString(),
            recurrence: `${this.customStartDate} → ${this.customEndDate}`,
            shareWith: this.shareEmails,
            template: this.selectedTemplate,   // ✅ ADD THIS
            customRange: {
              from: this.customStartDate,
              to: this.customEndDate
            },
            zoneName: this.selectedZoneName
          });




          alert(`✅ Report "${this.reportName}" generated successfully!`);
          this.router.navigate(['/createreport']);
        },
        error: () => alert('⚠️ Failed to generate report.')
      });

      return;
    }



    /* =========================
      🕒 HOUR-BASED REPORT
      ========================= */
    const hoursValue = this.getHoursFromSelection(this.selectedHour);

    if (hoursValue > 0) {

      if (!this.reportName?.trim()) {
        alert('⚠️ Please enter a report name.');
        return;
      }

      this.api.getGenerateReportZoneByHours(
        hoursValue,
        this.reportName.trim(),
        this.shareEmails,
        this.selectedZoneName ?? undefined,
        this.selectedTemplate ?? ''   // ✅ ADD THIS
      )

        .subscribe({
          next: (res: any) => {
            this.saveReport({
              id: res.id || Date.now(),
              reportName: this.reportName.trim(),
              timeRange: 'hours',
              createdOn: new Date().toLocaleString(),
              recurrence: `Last ${this.selectedHour}`,
              shareWith: this.shareEmails,
              template: this.selectedTemplate,   // ✅ ADD THIS
              ...(this.selectedZoneName ? { zoneName: this.selectedZoneName } : {})
            });



            alert(`✅ Report generated for last ${this.selectedHour}`);
            this.router.navigate(['/createreport']);
          },
          error: () => alert('⚠️ Failed to generate hour-based report.')
        });

      return;
    }



    /* =========================
       📅 DAY-BASED REPORT
       ========================= */
    const daysValue = this.getDaysFromSelection(this.selectedHour);

    if (daysValue > 0 && this.selectedTimeRange !== 'custom') {

      if (!this.reportName?.trim()) {
        alert('⚠️ Please enter a report name.');
        return;
      }

      this.api.getGenerateReportZoneByDays(
        daysValue,
        this.reportName.trim(),
        this.shareEmails,
        this.selectedZoneName ?? undefined
      ).subscribe({
        next: (res: any) => {

          this.saveReport({
            id: res.id || Date.now(),
            reportName: this.reportName.trim(),
            timeRange: 'days',
            createdOn: new Date().toLocaleString(),
            recurrence: `${daysValue} Days`,
            shareWith: this.shareEmails,
            template: this.selectedTemplate,   // ✅ ADD THIS
            ...(this.selectedZoneName ? { zoneName: this.selectedZoneName } : {})
          });


          alert(`✅ Report generated for last ${this.selectedHour}`);
          this.router.navigate(['/createreport']);
        },
        error: () => alert('⚠️ Failed to generate day-based report.')
      });

      return;
    }



    /* =========================
       ❌ INVALID SELECTION
       ========================= */
    alert('⚠️ Please select a valid time range or hour option.');
  }








  selectZone(zone: any) {
    this.selectedItemId = zone.id;
    this.selectedZoneName = zone.zoneName;
    console.log('✅ Selected Zone:', this.selectedZoneName);
  }


  today: string = new Date().toISOString().split('T')[0];



















  // ADD THIS METHOD
  selectHour(hour: string) {
    this.selectedHour = hour;
  }














  dailyTime: string = "";
  isDailyTimeFocused: boolean = false;  // ✅ ADD THIS



  weeklyDay: string = '';
  weeklyTime: string = '';
  isWeeklyDayFocused: boolean = false;
  isWeeklyTimeFocused: boolean = false;



  monthlyDay: number | null = null;
  monthlyTime: string = "";
  isMonthlyDateFocused: boolean = false;
  isMonthlyTimeFocused: boolean = false;


}









