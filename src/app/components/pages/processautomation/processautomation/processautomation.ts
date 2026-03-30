import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Device } from '../../../service/device/device';

@Component({
  selector: 'app-processautomation',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './processautomation.html',
  styleUrl: './processautomation.css'
})
export class Processautomation implements OnInit {




  
  searchQuery = '';
  isSearchOpen = false;

  allItems: any[] = [];
  filteredItems: any[] = [];

  constructor(private device: Device, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit() {
    this.loadAll();
  }


  goToEdit(id: string) {
  this.router.navigate(['/editprocessautomation', id]);
}

loadAll() {
  this.device.getAllProcessAutomation().subscribe({
    next: (res: any) => {
      // Handle both array response and wrapped response
      const list: any[] = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);

      this.allItems = list.map(item => ({
        ...item,
        condition:  item.condition  ?? '-',
        action:     item.action     ?? '-',
        zoneName:   item.zoneName   ?? '-',
        createdAt:  item.createdAt  ?? '',
        status:
          item.status === true  || item.status === 'true'  ? 'ONLINE'  :
          item.status === false || item.status === 'false' ? 'OFFLINE' :
          item.status ?? 'OFFLINE'
      }));

      this.filteredItems = [...this.allItems];
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('❌ Error loading process automations:', err.status, err.message);
      this.allItems = [];
      this.filteredItems = [];
      this.cdr.detectChanges();
    }
  });
}


  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
  }

  applyUnifiedSearch() {
    const query = this.searchQuery?.trim().toLowerCase() || '';

    if (!query) {
      this.filteredItems = [...this.allItems];
      return;
    }

    this.filteredItems = this.allItems.filter(item => {
      const desc = (item.description || '').toLowerCase();

      const raw = item.createdAt?.replace(' ', 'T');
      const date = new Date(raw);

      const yyyyMMdd = !isNaN(date.getTime())
        ? date.toISOString().split('T')[0]
        : '';

      const ddMMyyyy = !isNaN(date.getTime())
        ? date.toLocaleDateString('en-GB')
        : '';

      return (
        desc.includes(query) ||
        yyyyMMdd.includes(query) ||
        ddMMyyyy.includes(query)
      );
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-GB') + ' ' +
           date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }



// toggleStatus(item: any) {
//   // Handle both old boolean and new string values
//   const isCurrentlyActive =
//     item.status === true ||
//     item.status === 'true' ||
//     item.status === 'ONLINE';

//   const newStatus = isCurrentlyActive ? 'OFFLINE' : 'ONLINE';
//   const previousStatus = item.status;
//   item.status = newStatus;

//   const payload = {
//     ...item,
//     status: newStatus,
//     devices: [...(item.devices ?? [])]
//   };

//   this.device.updateProcessAutomation(item.id, payload).subscribe({
//     next: () => this.loadAll(),
//     error: (err) => {
//       console.error('❌ Error toggling status', err);
//       item.status = previousStatus; // revert on failure
//       this.cdr.detectChanges();
//     }
//   });
// }


toggleStatus(item: any) {
  // Handle both old boolean and new string values
  const isCurrentlyActive =
    item.status === true ||
    item.status === 'true' ||
    item.status === 'ONLINE';

 item.status = isCurrentlyActive ? 'OFFLINE' : 'ONLINE';
 
  }

deleteItem(id: string) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  this.device.deleteProcessAutomation(id).subscribe({
    next: () => {
      this.router.navigate(['/processautomation']);
      this.loadAll(); // ← just reload data directly, no navigation needed

    },
    error: () => {
      console.log('Error deleting process automation');
    }
  });
}

}