import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class Device {

  constructor(private http: HttpClient) { }

  private baseUrl = environment.apiUrl;


  getDevicesByProject(projectId: string) {
    return this.http.get(`${this.baseUrl}deviceadd/project/${projectId}`)
  }

  getDevicesByCountry(projectId: string, countryId: string) {
    return this.http.get(`${this.baseUrl}deviceadd/project/${projectId}/country/${countryId}`)
  }

  getDevicesByArea(projectId: string, countryId: string, areaId: string) {
    return this.http.get(`${this.baseUrl}deviceadd/project/${projectId}/country/${countryId}/area/${areaId}`)
  }

  getDevicesByBuilding(projectId: string, countryId: string, areaId: string, buildingId: string) {
    return this.http.get(`${this.baseUrl}deviceadd/project/${projectId}/country/${countryId}/area/${areaId}/building/${buildingId}`);
  }
  getDevicesByFloor(projectId: string, countryId: string, areaId: string, buildingId: string, floorId: string) {
    return this.http.get(`${this.baseUrl}deviceadd/project/${projectId}/country/${countryId}/area/${areaId}/building/${buildingId}/floor/${floorId}`);
  }
  // getDevicesByZone(
  //   projectId: string,
  //   countryId: string,
  //   areaId: string,
  //   buildingId: string,
  //   floorId: string,
  //   zoneId: string
  // ) {
  //   const url = `http://172.16.100.26:5202/api/deviceadd/project/${projectId}/country/${countryId}/area/${areaId}/building/${buildingId}/floor/${floorId}/zone/${zoneId}`;
  //   return this.http.get(url);
  // }

  getDevicesByZone(
    projectId: string,
    countryId: string,
    areaId: string,
    buildingId: string,
    floorId: string,
    zoneId: string
  ) {
    const url = `${this.baseUrl}deviceadd/project/${projectId}/country/${countryId}/area/${areaId}/building/${buildingId}/floor/${floorId}/zone/${zoneId}`;
    return this.http.get(url);
  }

  // getAllDeviceParameters() {
  //   const url = 'http://172.16.100.26:5202/api/device-parameters/all';
  //   return this.http.get(url);
  // }

  getAllDeviceParameters() {
    return this.http.get(`${this.baseUrl}device-parameters/all`);
  }

  addNewPara(payload: any) {
    return this.http.post(`${this.baseUrl}device-parameters/create`, payload);
  }

  updateDeviceParametersById(id: string, payload: any) {
    return this.http.put(`${this.baseUrl}device-parameters/update/${id}`, payload)
  }

  deleteDevicePara(id: string) {
    return this.http.delete(`${this.baseUrl}device-parameters/delete/${id}`, { responseType: 'text' })
  }


  getDeviceParametersByDeviceId(deviceId: string) {
    return this.http.get(`${this.baseUrl}device-parameters/bydevice/${deviceId}`);
  }

  getAllZoneSensors() {
    return this.http.get(`${this.baseUrl}zonesensor/all`)
  }

  createZoneSensor(payload: any) {
    return this.http.post(`${this.baseUrl}zonesensor/create`, payload);
  }


  saveZoneMapping(data: any) {
    return this.http.post(`${this.baseUrl}ZoneMapping`, data);
  }


  getZoneMappingById(zoneId: string) {
    return this.http.get(`${this.baseUrl}ZoneMapping/by-zone/${zoneId}`);
  }

  saveDeviceGeoJson(payload: any) {
    return this.http.post(`${this.baseUrl}DeviceGeoJsonMapping/create-device-on-zone`, payload);
  }


  saveDeviceGeoJsonMap(payload: any) {
    return this.http.post(`${this.baseUrl}DeviceGeoJsonMappingController1`, payload);
  }



  getZoneMapping(zoneId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}DeviceGeoJsonMapping/zone/${zoneId}`);
  }


  getZoneMappingByFloor(floorId: string) {
    return this.http.get<any[]>(`${this.baseUrl}ZoneMapping/by-Floor/${floorId}`);
  }


  getZoneImageByZoneId(zoneId: string) {
    return this.http.get(`${this.baseUrl}zones/${zoneId}/map`);
  }

  getDevicesByZoneId(zoneId: string) {
    return this.http.get(`${this.baseUrl}deviceadd/by-zone/${zoneId}`);
  }

  getDeviceGeoJsonByFloor(floorId: string) {
    return this.http.get(`${this.baseUrl}DeviceGeoJsonMapping/Floor/${floorId}`);
  }


  ProcessedEvetbyHours(zoneId: string, hours: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}ProcessedEventReport/zone-count`,
      { params: { zoneId, hours } }
    );
  }



  getVisitorsByDate(zone: string, days: number) {
    return this.http.get<any>(`${this.baseUrl}ProcessedEventReport/zone-count-by-days`, {
      params: {
        zone: zone,
        days: days.toString()
      }
    });
  }



  deleteWidget(id: any) {
    return this.http.delete(`${this.baseUrl}zonesensor/${id}`)
  }

  deleteDashboardWidget(id: any) {
    return this.http.delete(`${this.baseUrl}zonesensor/delete/${id}`)
  }


  getDevicesByAreaId(areaId: string) {
    return this.http.get<any[]>(
      `http://172.16.100.29:5202/api/DeviceGeoJsonMappingController1/area/${areaId}`
    );
  }






  deleteDeviceGeoJsonMap(id: string) {
    return this.http.delete(
      `http://172.16.100.29:5202/api/DeviceGeoJsonMappingController1/${id}`
    );
  }


  deleteIndoorDevice(id: string) {
    return this.http.delete(`${this.baseUrl}DeviceGeoJsonMapping/${id}`
    );
  }





  getZoneReportByHours(floorId: string, hours: number) {
    return this.http.get(
      `${this.baseUrl}zone-report/floor/hours`,
      {
        params: {
          floorId: floorId,      // ✅ Changed from zoneId to floorId
          hours: hours.toString()
        }
      }
    );
  }

  // Day-based API (floorId + days)
  getZoneReportByDays(floorId: string, days: number) {
    return this.http.get(
      `${this.baseUrl}zone-report/floor`,
      {
        params: {
          floorId: floorId,      // ✅ Changed from zoneId to floorId
          days: days.toString()
        }
      }
    );
  }



  getRecentProcessedEvents(tagIds: any[] | any) {
    let params: any = {};

    if (Array.isArray(tagIds)) {
      if (tagIds.length === 1) {
        params.tagIds = tagIds[0];          // ?tagIds=5
      } else if (tagIds.length > 1) {
        params.tagIds = tagIds.join(',');   // ?tagIds=1,2,3
      }
    } else if (tagIds) {
      params.tagIds = tagIds;               // ?tagIds=5
    }

    return this.http.get<any>(
      `${this.baseUrl}processedevents/recent`,
      { params }
    );
  }

  getMappedDevice(uniqueid: string) {
    return this.http.get(`${this.baseUrl}Asset/MappedDevice/${uniqueid}`)
  }

  getActiveAsset(deviceUniqueId: string) {
    return this.http.get(`${this.baseUrl}Asset/active/?zoneId=${deviceUniqueId}`)
  }


  getMappedDeviceByTagId(tagId: string) {
    return this.http.get(`${this.baseUrl}Asset/MappedDevice/${tagId}`);
  }




  createProcessAutomation(payload: any) {
    return this.http.post(
      `${this.baseUrl}processautomation`,
      payload
    );
  }

getAllProcessAutomation() {
  return this.http.get<any>(`${this.baseUrl}processautomation`);
}

  
// ADD alongside getAllProcessAutomation():
getProcessAutomationById(id: string) {
  return this.http.get<any>(`${this.baseUrl}processautomation/${id}`);
}


  // ADD these two methods alongside getAllProcessAutomation():

updateProcessAutomation(id: string, payload: any) {
  return this.http.put(`${this.baseUrl}processautomation/${id}`, payload);
}

deleteProcessAutomation(id: string) {
  return this.http.delete(`${this.baseUrl}processautomation/${id}`);
}


// GET
getOutdoorZoneMapping(zoneId: string): Observable<any> {
  return this.http.get(`http://172.16.100.29:5202/api/ZoneMappingController1/by-zone/${zoneId}`);
}

// POST
saveOutdoorZoneMapping(payload: any): Observable<any> {
  return this.http.post(
    `http://172.16.100.29:5202/api/ZoneMappingController1/createZoneMappingBasedOnArea`,
    payload
  );
}


updateZoneMapping(zoneId: string, data: any) {
  return this.http.put(`${this.baseUrl}ZoneMapping/by-zone/${zoneId}`, data);
}

}