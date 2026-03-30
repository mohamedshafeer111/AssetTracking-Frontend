import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Roleservice {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getRole() {
    return this.http.get(`${this.apiUrl}role/summary`)
  }

  createNewRole(createRoles: any) {
    return this.http.post(`${this.apiUrl}role/create`, createRoles)
  }



  updateRole(updateRole: any, id: string) {
    return this.http.put(`${this.apiUrl}Role/update/${id}`, updateRole)
  }

  DeleteRole(roleId: string) {
    return this.http.delete(`${this.apiUrl}Role/delete/${roleId}`)
  }

  //project
  createnewProject(createProject: any) {
    return this.http.post(`${this.apiUrl}projects/create`, createProject)
  }


  getProject() {
    return this.http.get(`${this.apiUrl}projects/projects/summary`)
  }

  updateProject(updateProject: any, id: string) {
    return this.http.put(`${this.apiUrl}projects/update/${id}`, updateProject)
  }


  DeleteProject(id: string) {
    return this.http.delete(`${this.apiUrl}projects/delete/${id}`)
  }




  //country create
  CountryCreate(projectId: string, countryData: any) {
    return this.http.post(`${this.apiUrl}countries/create?projectId=${projectId}`, countryData);
  }

  //country summary
  countryGetById(id: any) {
    return this.http.get(`${this.apiUrl}countries/Summary?projectId=${id}`);
  }



  //area
  getSummary(id: any) {
    return this.http.get(`${this.apiUrl}areas/summary?countryId=${id}`,);
  }




  createNewArea(createArea: any) {
    return this.http.post(`${this.apiUrl}projects/create`, createArea)
  }






  CountryArea(countryId: string, areaData: any) {
    return this.http.post(`${this.apiUrl}areas/create?countryId=${countryId}`, areaData);
  }


  //edit country

  updateCountry(updateCountry: any, id: string) {
    return this.http.put(`${this.apiUrl}countries/update/${id}`, updateCountry)
  }


  //delete country

  DeleteCountry(id: string) {
    return this.http.delete(`${this.apiUrl}countries/delete/${id}`)
  }


  //area update

  updatearea(updateArea: any, id: string) {
    return this.http.put(`${this.apiUrl}areas/update/${id}`, updateArea)
  }

  //delete area

  Deletearea(id: string) {
    return this.http.delete(`${this.apiUrl}areas/delete/${id}`)
  }


  //create building

  createNewBuilding(areaId: string, createBuilding: any) {
    return this.http.post(`${this.apiUrl}buildings/create?areaId=${areaId}`, createBuilding)
  }




  //area
  getBuilding(id: any):Observable<any> {
    return this.http.get(`${this.apiUrl}buildings/summary?areaId=${id}`);
  }








  updatebuilding(updateBuilding: any, id: string) {
    return this.http.put(`${this.apiUrl}buildings/update/${id}`, updateBuilding)
  }


  Deletebuilding(id: string) {
    return this.http.delete(`${this.apiUrl}buildings/delete/${id}`)
  }



  //create floor
  createNewFloor(buildingId: string, floorData: any) {
    return this.http.post(`${this.apiUrl}floors/create?buildingId=${buildingId}`, floorData);
  }


  //foor summary
  getFloor(id: any) {
    return this.http.get(`${this.apiUrl}floors/summary?buildingId=${id}`);
  }




  //update floor

  updatefloor(updateFloor: any, id: string) {
    return this.http.put(`${this.apiUrl}floors/update/${id}`, updateFloor)
  }



  //delete floor

  Deletefloor(id: string) {
    return this.http.delete(`${this.apiUrl}floors/delete/${id}`)
  }




  //create floor
  createNewZone(floorId: string, zoneData: any) {
    return this.http.post(`${this.apiUrl}zones/create?floorId=${floorId}`, zoneData);
  }


  getZones(id: any) {
    return this.http.get(`${this.apiUrl}zones/summary?floorId=${id}`);
  }



  //update zone
  updatezone(updateZone: any, id: string) {
    return this.http.put(`${this.apiUrl}zones/update/${id}`, updateZone)
  }


  //delete zone
  Deletezone(id: string) {
    return this.http.delete(`${this.apiUrl}zones/delete/${id}`)
  }



  getSubZones(id: any) {
    return this.http.get(`${this.apiUrl}subzones/summary?zoneId=${id}`);
  }


  createSubZone(zoneId: string, subzoneData: any) {
    return this.http.post(`${this.apiUrl}subzones/create?zoneId=${zoneId}`, subzoneData);
  }

  //update zone
  updateSubZone(updateSubZone: any, id: string) {
    return this.http.put(`${this.apiUrl}subzones/update/${id}`, updateSubZone)
  }



  //delete subzone
  Deletesubzone(id: string) {
    return this.http.delete(`${this.apiUrl}subzones/delete/${id}`)
  }





  getDashboard(id: any) {
    return this.http.get(`${this.apiUrl}zonesensor/dashboardsummary`);
  }


  DeleteDashboard(id: string) {
    return this.http.delete(`${this.apiUrl}zonesensor/${id}`)
  }


  getDashboardID(id: any) {
    return this.http.get(`${this.apiUrl}zonesensor/by-dashboard/${id}`);
  }

getRoleById(id: string) {
  return this.http.get(`${this.apiUrl}Role/get/${id}`);  // try this
}

  CreateDashboardName(dashboardName: string) {
    return this.http.post(`${this.apiUrl}zonesensor/createdashboard`, {
      dashboardName: dashboardName
    });
  }



  createAreaZone(areaId:string,zoneAreaData:any){
    return this.http.post(`${this.apiUrl}zones/createZonebasedonArea?areaId=${areaId}`,zoneAreaData)
  }

  getAreaZone(id:string):Observable<any>{
    return this.http.get(`${this.apiUrl}zones/zone1/${id}`)
  }

  deleteAreaBasedZone(id:string){
    return this.http.delete(`${this.apiUrl}zones/delete1/${id}`)
  }

  updateAreaBasedZone(id:string,zoneAreaData:any){
    return this.http.put(`${this.apiUrl}zones/update1/${id}`,zoneAreaData)
  }

}





