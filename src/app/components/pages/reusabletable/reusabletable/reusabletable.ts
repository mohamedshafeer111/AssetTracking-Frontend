import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reusabletable',
  imports: [CommonModule, FormsModule],
  templateUrl: './reusabletable.html',
  styleUrl: './reusabletable.css'
})
export class Reusabletable implements OnChanges {

  @Input() columns: any[] = [];
  @Input() data: any[] = [];

  @Output() action = new EventEmitter<any>();


  @Input() searchText: string = " ";

  onAction(type: string, row: any) {
    this.action.emit({ type, row });
  }

  filteredData: any[] = [];

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['data'] || changes['searchText']) {
  //     this.applyFilter();
  //   }
  // }

  // applyFilter() {
  //   if (!this.searchText) {
  //     this.filteredData = [...this.data];
  //   } else {
  //     const search = this.searchText.toLowerCase();

  //     this.filteredData = this.data.filter(row =>
  //       Object.values(row).some(value =>
  //         value && value.toString().toLowerCase().includes(search)
  //       )
  //     );
  //   }
  // }



  applyFilter() {
    if (!this.searchText) {
      this.filteredData = [...this.data];
    } else {
      const search = this.searchText.toLowerCase();

      this.filteredData = this.data.filter(row =>
        Object.values(row).some(value =>
          value && value.toString().toLowerCase().includes(search)
        )
      );
    }

    this.setupPagination(); // 🔥 IMPORTANT
  }



    // ✅ Pagination variables
    currentPage = 1;
    pageSize = 10;
    pageSizes = [5, 10, 20];
    paginatedData: any[] = [];
    totalPages = 0;

    // 🔥 IMPORTANT: reacts when parent sends new data
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['searchText']) {
      this.currentPage = 1;
      this.applyFilter();
    }
  }

  setupPagination() {
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    this.updatePaginatedData();
  }

  updatePaginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedData = this.filteredData.slice(start, end);
  }

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.updatePaginatedData();
      }
    }

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.updatePaginatedData();
      }
    }

    changePageSize() {
      this.currentPage = 1;
      this.setupPagination();
    }

}
