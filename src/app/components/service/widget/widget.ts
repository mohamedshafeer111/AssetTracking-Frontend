import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class Widget {

  constructor(private http: HttpClient) { }

  private baseUrl = environment.apiUrl

  // private apiUrl = 'http://172.16.100.26:5202/api/PersonalDashboard';

  createDashboard(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}PersonalDashboard`, payload);
  }

  getPersonalDashboard(dashboardId: string) {
    return this.http.get(`${this.baseUrl}PersonalDashboard/${dashboardId}`);
  }

   deleteClockWidget(dashboardId:string,personalWidgetId:string):Observable<any>{
    return this.http.delete(`${this.baseUrl}PersonalDashboard/${dashboardId}/widgets/${personalWidgetId}`)

   }

}
