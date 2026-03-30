import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from '../../../service/user/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reusabletable } from '../../reusabletable/reusabletable/reusabletable';

@Component({
  selector: 'app-events',
  imports: [CommonModule, FormsModule,Reusabletable],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class Events implements OnInit {

  activeTab: string = 'events';

  eventsList: any[] = []; // only deviceId + description

  constructor(private user: User, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadEvents();
  }


  currentPage: number = 1;    // dynamic current page
  pageSize: number = 10;       // dynamic page size
  pageSizes: number[] = [5, 10, 20, 50]; // user can choose
  totalPages: number = 0;


  loadEvents(page: number = this.currentPage) {
    this.user.loadevent(page, this.pageSize).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.eventsList = res.data;
          this.currentPage = res.currentPage;
          this.totalPages = res.totalPages;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading events', err)
    });
  }
  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.loadEvents(1);
  }

  setActive(tab: string) {
    this.activeTab = tab;
  }




  alertsList: any[] = [];

  switchTab(tab: string) {
    this.activeTab = tab;

    if (tab === 'events') {
      this.loadEvents(1);
    } else if (tab === 'alerts') {
      this.loadAlerts();

    }
  }

  alertList: any[] = [];
  alertPageNumber: number = 1;
  alertPageSize: number = 10;
  alertTotalPages: number = 0;
  alertTotalCount: number = 0;
  alertPageSizes: number[] = [5, 10, 25, 50];

  loadAlerts(pageNumber: number = 1) {
    this.alertPageNumber = pageNumber;
    this.user.getAlert(pageNumber, this.alertPageSize).subscribe({
      next: (res: any) => {
        this.alertList = res.data;
        this.alertTotalCount = res.totalCount;
        this.alertTotalPages = res.totalPages;
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error getting alert");
      }
    });
  }

  onAlertPageSizeChange() {
    this.alertPageNumber = 1;
    this.loadAlerts(1);
  }


  alertColoumns=[
    {header:'DeviceId',field:'deviceId'},
    {header:'Device Name',field:'deviceName'},
    {header:'Status',field:'status'},
    {header:'Description',field:'description',type:'status'},
    {header:'Timestamp',field:'timestamp'}
  ]


}





