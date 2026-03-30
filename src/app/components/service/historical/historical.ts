import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class Historical {

  constructor(private http:HttpClient){}

  private baseUrl = environment.apiUrl;

getHistorical(pageNumber: number, pageSize: number) {
  return this.http.get(
    `${this.baseUrl}Asset/asset-device-history?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
}
   
  getOverviw(assetId:any){
    return this.http.get(`${this.baseUrl}Reports/by-device?id=${assetId}`)
  }
  
  getZone(){
    return this.http.get(`${this.baseUrl}zones/all`)
  }

  // getZoneDetailsBasedOnFilter(zoneName:string,startDate:string,endDate:string){
  //   return this.http.get(`${this.baseUrl}Reports/zone/events?zoneName=${zoneName}&startDate=${startDate}&endDate=${endDate}`)
  // }

getZoneDetailsBasedOnFilter(zoneName: string, startDate: string, endDate: string) {
  return this.http.get(
    `${this.baseUrl}Reports/zone/events?zoneName=${zoneName}&startDate=${startDate}&endDate=${endDate}`
  );
}


}
