import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Reportservice {

  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }


  private reports: any[] = [];

  addReport(report: any) {
    this.reports.push(report);
  }

  getReports() {
    return this.reports;
  }


  getGenerateReport(
    startTime: string,
    endTime: string,
    reportName: string,
    shareWith?: string,
    templateName?: string
  ) {
    const body: any = {
      startTime: new Date(startTime).toISOString(), // ✅ FIX DATE
      endTime: new Date(endTime).toISOString(),     // ✅ FIX DATE
      reportName

    };

    if (shareWith) {
      body.shareWith = shareWith;
    }

    if (templateName) {
      body.templateName = templateName;
    }

    return this.http.post(`${this.apiUrl}Asset/asset-history-report`, body);
  }



  getGenerateReportZone(
    startTime: string,
    endTime: string,
    zoneName: string,
    reportName: string,
    shareWith?: string,
    templateName?: string
  ) {
    const params: any = {
      startTime,
      endTime,
      zoneName,
      reportName
    };

    if (shareWith) params.shareWithEmail = shareWith;
    if (templateName) params.templateName = templateName;

    return this.http.get(`${this.apiUrl}Reports/generate/zone`, { params });
  }





  getReportByID(id: string, page: number = 1, pageSize: number = 100) {
    const params = { page, pageSize };
    return this.http.get(`${this.apiUrl}Reports/${id}/full`, { params });
  }


  DeleteReport(id: string) {
    return this.http.delete(`${this.apiUrl}Reports/${id}`);
  }




  getGenerateReportZoneByHours(
    hours: number,
    reportName: string,
    shareWithEmail?: string,
    zoneName?: string,
    templateName?: string
  ) {
    const params: any = {
      hours: hours.toString(),
      reportName: reportName.trim(),

      // ✅ ALWAYS send empty string if undefined
      zoneName: zoneName ?? '',
      shareWithEmail: shareWithEmail ?? '',
      templateName: templateName ?? ''
    };

    return this.http.get(
      `${this.apiUrl}Reports/generate/hours`,
      { params }
    );
  }



  getGenerateReportZoneByDays(
    days: number,
    reportName: string,
    shareWithEmail?: string,
    zoneName?: string,
    templateName?: string
  ) {
    const params: any = {
      days: days.toString(),
      reportName
    };

    if (zoneName) params.zoneName = zoneName;
    if (shareWithEmail) params.shareWithEmail = shareWithEmail;
    if (templateName) params.templateName = templateName;

    return this.http.get(`${this.apiUrl}Reports/generate/days`, { params });
  }





  // 9-2-26


  getAssetLiveSummary(reportId: string, page: number, pageSize: number): Observable<any> {
    return this.http.get(`${this.apiUrl}Asset/asset-summary-live?reportId=${reportId}&page=${page}&pageSize=${pageSize}`);
  }


    getAssetReportSummary(bsonId: string,pageNumber: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}Asset/asset-history-report/${bsonId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

}
