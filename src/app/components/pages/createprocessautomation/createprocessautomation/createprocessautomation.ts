import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChildren, QueryList, ElementRef, AfterViewChecked , HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Roleservice } from '../../../service/role/roleservice';
import { Device } from '../../../service/device/device';
// import { Router } from 'express';





interface AlarmForm {
  severity: 'major' | 'minor' | 'critical' | '';
  title: string;
  description: string;
  recurrence: string;
  message: string;
}

interface ActionItem {
  label: string;
  selectedAction: string;
  selectedActionLabel: string;
  showActionDropdown: boolean;
  selectedAlarmType: 'dashboard' | 'email' | 'task' | '';

  email: AlarmForm;
  task: AlarmForm;
}


interface Condition {
  label: string;
  selectedCondition: string;
  selectedConditionLabel: string;
  showDropdown: boolean;
  showPeopleInputs?: boolean;

  operator: 'AND' | 'OR'; // 🔥 NEW
}



@Component({
  selector: 'app-createprocessautomation',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './createprocessautomation.html',
  styleUrl: './createprocessautomation.css'
})





export class Createprocessautomation implements OnInit, AfterViewChecked {



  activeTab: string = 'project'; // 👈 default tab


  constructor(private role: Roleservice, private cdr: ChangeDetectorRef, private device: Device, private router: Router) { }

  ngOnInit(): void {

    this.loadProject();
  }




















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
















  
  // ADD a new helper to look up projectId from a countryId
  // (needed because loadArea only receives countryId)
  private countryProjectMap: { [countryId: string]: string } = {};

  // Call this whenever countries are loaded — update loadCountries():
  // loadCountries(projectId: string) {
  //   if (this.expandedProjects.has(projectId)) {
  //     this.expandedProjects.delete(projectId);
  //     return;
  //   }
  //   this.role.countryGetById(projectId).subscribe({
  //     next: (res: any) => {
  //       const countries: any[] = Array.isArray(res) ? res : [];
  //       this.countriesByProject[projectId] = countries;
  //       // build reverse map
  //       countries.forEach(c => this.countryProjectMap[c.id] = projectId);
  //       this.expandedProjects.add(projectId);
  //       this.devicesGetByProjectId(projectId);
  //       this.cdr.detectChanges();
  //     },
  //     error: () => console.log('Error loading countries')
  //   });
  // }
loadCountries(projectId: string) {
  if (this.expandedProjects.has(projectId)) {
    this.expandedProjects.delete(projectId);
    return;
  }
  this.role.countryGetById(projectId).subscribe({
    next: (res: any) => {
      const countries: any[] = Array.isArray(res) ? res : [];
      this.countriesByProject[projectId] = countries;
      countries.forEach(c => this.countryProjectMap[c.id] = projectId);
      this.expandedProjects.add(projectId);
      this.cdr.detectChanges();
    },
    error: () => console.log('Error loading countries')
  });
}
  private getProjectIdForCountry(countryId: string): string | null {
    return this.countryProjectMap[countryId] ?? null;
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


  // REPLACE loadArea():
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
      error: () => console.log('Error loading areas')
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


  // REPLACE loadBuilding():
  loadBuilding(areaId: string) {
    if (this.expandedArea.has(areaId)) {
      this.expandedArea.delete(areaId);
      return;
    }
    this.role.getBuilding(areaId).subscribe({
      next: (res: any) => {
        this.buildingByArea[areaId] = Array.isArray(res) ? res : [];
        this.expandedArea.add(areaId);
        // devices loaded via selectZone/floor/area — or add helper if needed
        this.cdr.detectChanges();
      },
      error: () => console.log('Error loading building')
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

  selectedItemId: string | number | null = null;
  activeLevel: 'project' | 'country' | 'area' | 'building' | 'floor' | 'zone' | null = null;

  selectItem(id: string | number) {
    this.selectedItemId = id;
  }


  projectDevices: any[] = [];
  countryDevices: any[] = [];
  areaDevices: any[] = [];
  buildingDevices: any[] = [];
  floorDevices: any[] = [];
  zoneDevices: any[] = [];



  get activeDevices(): any[] {
    switch (this.activeLevel) {
      case 'project': return this.projectDevices;
      case 'country': return this.countryDevices;
      case 'area': return this.areaDevices;
      case 'building': return this.buildingDevices;
      case 'floor': return this.floorDevices;
      case 'zone': return this.zoneDevices;
      default: return [];
    }
  }



  private clearAllDeviceLists() {
    this.projectDevices = [];
    this.countryDevices = [];
    this.areaDevices = [];
    this.buildingDevices = [];
    this.floorDevices = [];
    this.zoneDevices = [];
  }





  // devicesGetByProjectId(projectId: string) {
  //   this.device.getDevicesByProject(projectId).subscribe({
  //     next: (res: any) => {
  //       this.clearAllDeviceLists();
  //       this.projectDevices = res ?? [];
  //        this.devices = this.projectDevices;
  //       this.activeLevel = 'project';
  //       this.cdr.detectChanges();
  //     },
  //     error: () => console.log('error loading devices by project')
  //   });
  // }
devicesGetByProjectId(projectId: string) {
  // ❌ Don't load devices at project level
  this.clearAllDeviceLists();
  this.activeLevel = null;
  this.devices = [];
  this.cdr.detectChanges();
}



  devicesGetByCountryId(projectId: string, countryId: string) {
    this.device.getDevicesByCountry(projectId, countryId).subscribe({
      next: (res: any) => {
        this.clearAllDeviceLists();
        // this.countryDevices = res ?? [];
         this.devices = this.countryDevices;
        this.activeLevel = 'country';
        this.cdr.detectChanges();
      },
      error: () => console.log('error loading devices by country')
    });
  }



  devicesGetByAreaId(projectId: string, countryId: string, areaId: string) {
    this.device.getDevicesByArea(projectId, countryId, areaId).subscribe({
      next: (res: any) => {
        this.clearAllDeviceLists();
        // this.areaDevices = res ?? [];
            this.devices = this.areaDevices;
        this.activeLevel = 'area';
        this.cdr.detectChanges();
      },
      error: () => console.log('error loading devices by area')
    });
  }





  devicesGetByBuildingId(projectId: string, countryId: string, areaId: string, buildingId: string) {
    this.device.getDevicesByBuilding(projectId, countryId, areaId, buildingId).subscribe({
      next: (res: any) => {
        this.clearAllDeviceLists();
        // this.buildingDevices = res ?? [];
        this.devices = this.buildingDevices;
        this.activeLevel = 'building';
        this.cdr.detectChanges();
      },
      error: () => console.log('error loading devices by building')
    });
  }



  devicesGetByFloorId(projectId: string, countryId: string, areaId: string, buildingId: string, floorId: string) {
    this.device.getDevicesByFloor(projectId, countryId, areaId, buildingId, floorId).subscribe({
      next: (res: any) => {
        this.clearAllDeviceLists();
        // this.floorDevices = res ?? [];
        this.devices = this.floorDevices;
        this.activeLevel = 'floor';
        this.cdr.detectChanges();
      },
      error: () => console.log('error loading devices by floor')
    });
  }


  devicesGetByZoneId(
    projectId: string, countryId: string, areaId: string,
    buildingId: string, floorId: string, zoneId: string
  ) {
    this.device.getDevicesByZone(projectId, countryId, areaId, buildingId, floorId, zoneId).subscribe({
      next: (res: any) => {
        this.clearAllDeviceLists();
        this.zoneDevices = res ?? [];
        this.devices = this.zoneDevices;
        this.activeLevel = 'zone';
        this.cdr.detectChanges();
      },
      error: () => console.log('error loading devices by zone')
    });
  }








  showTimePeriod = false;

  // Time values
  fromHour = '';
  fromMinute = '';
  toHour = '';
  toMinute = '';

  // Days
  days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  selectedDays: string[] = [];

  /* Toggle checkbox */
  toggleTimePeriod(event: Event) {
    this.showTimePeriod = (event.target as HTMLInputElement).checked;

    // OPTIONAL: reset when unchecked
    if (!this.showTimePeriod) {
      this.resetTimePeriod();
    }
  }

  /* Reset all values */
  resetTimePeriod() {
    this.fromHour = '';
    this.fromMinute = '';
    this.toHour = '';
    this.toMinute = '';
    this.selectedDays = [];
  }

  /* Day selection */
  toggleDay(day: string) {
    if (this.selectedDays.includes(day)) {
      this.selectedDays = this.selectedDays.filter(d => d !== day);
    } else {
      this.selectedDays.push(day);
    }
  }

  /* Validation */
  formatHour(event: any) {
    let val = event.target.value.replace(/\D/g, '');
    if (+val > 23) val = '23';
    event.target.value = val;
  }

  formatMinute(event: any) {
    let val = event.target.value.replace(/\D/g, '');
    if (+val > 59) val = '59';
    event.target.value = val;
  }







  showConditionDropdown = false;
  showPeopleDropdown = false;
  selectedCondition: 'device' | 'time' | 'people' | null = null;

  selectedConditionLabel = '';

  // toggleConditionDropdown() {
  //   this.showConditionDropdown = !this.showConditionDropdown;
  // }

  // selectCondition(type: 'device' | 'time') {
  //   this.selectedCondition = type;
  //   this.showConditionDropdown = false;

  //   this.selectedConditionLabel =
  //     type === 'device' ? 'When the device' : 'When the time is';
  // }









  selectedZoneId: string | null = null;

  // selectZone(zoneId: string, event: MouseEvent) {
  //   event.stopPropagation();
  //   this.selectedZoneId = zoneId;
  // }




  devices: any[] = [];
  // selectedDeviceId: string | null = null;

  // selectCondition(type: 'device' | 'time' | 'people') {
  //   this.selectedCondition = type;
  //   this.showConditionDropdown = false;

  //   this.showPeopleInputs = false;

  //   if (type === 'device') {
  //     this.selectedConditionLabel = 'When the device';
  //     this.loadDevicesForZone();
  //   }

  //   if (type === 'time') {
  //     this.selectedConditionLabel = 'When the time is';
  //   }

  //   if (type === 'people') {
  //     this.selectedConditionLabel = 'When the people is';
  //     this.showPeopleInputs = true;
  //   }
  // }
  showPeopleInputs = false;



  selectedProjectId: string | null = null;
  selectedCountryId: string | null = null;
  selectedAreaId: string | null = null;
  selectedBuildingId: string | null = null;
  selectedFloorId: string | null = null;
  // selectedZoneId: string | null = null;



  loadDevicesForZone() {
    if (!this.selectedZoneId) {
      console.warn('Zone not selected');
      return;
    }

    this.device
      .getDevicesByZone(
        this.selectedProjectId!,
        this.selectedCountryId!,
        this.selectedAreaId!,
        this.selectedBuildingId!,
        this.selectedFloorId!,
        this.selectedZoneId
      )
      .subscribe({
        next: (res: any) => {
          this.devices = res || [];
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('Failed to load devices', err);
        }
      });
  }

  // selectZone(zoneId: string, event: MouseEvent) {
  //   event.stopPropagation();
  //   this.selectedZoneId = zoneId;

  //   if (this.selectedCondition === 'device') {
  //     this.loadDevicesForZone();
  //   }
  // }











  // UPDATE selectZone — already loads zone devices:
  // FIND and REPLACE selectZone():
  selectZone(zone: any, floor: any, building: any, area: any, country: any, project: any, event: MouseEvent) {
    event.stopPropagation();
    this.selectedZoneId = zone.id;
    this.selectedZoneName = zone.zoneName;
    this.selectedFloorId = floor.id;
    this.selectedFloorName = floor.floorName;
    this.selectedBuildingId = building.id;
    this.selectedBuildingName = building.buildingName;
    this.selectedAreaId = area.id;
    this.selectedAreaName = area.areaName;
    this.selectedCountryId = country.id;
    this.selectedCountryName = country.countryName;
    this.selectedProjectId = project.id;
    this.selectedProjectName = project.projectName;
    this.devicesGetByZoneId(project.id, country.id, area.id, building.id, floor.id, zone.id);
  }

  selectFloor(floor: any, building: any, area: any, country: any, project: any, event: MouseEvent) {
    event.stopPropagation();
    this.selectedFloorId = floor.id;
    this.selectedFloorName = floor.floorName;
    this.selectedBuildingId = building.id;
    this.selectedBuildingName = building.buildingName;
    this.selectedAreaId = area.id;
    this.selectedAreaName = area.areaName;
    this.selectedCountryId = country.id;
    this.selectedCountryName = country.countryName;
    this.selectedProjectId = project.id;
    this.selectedProjectName = project.projectName;
    this.devicesGetByFloorId(project.id, country.id, area.id, building.id, floor.id);
  }

  selectBuilding(building: any, area: any, country: any, project: any, event: MouseEvent) {
    event.stopPropagation();
    this.selectedBuildingId = building.id;
    this.selectedBuildingName = building.buildingName;
    this.selectedAreaId = area.id;
    this.selectedAreaName = area.areaName;
    this.selectedCountryId = country.id;
    this.selectedCountryName = country.countryName;
    this.selectedProjectId = project.id;
    this.selectedProjectName = project.projectName;
    this.devicesGetByBuildingId(project.id, country.id, area.id, building.id);
  }

  selectArea(area: any, country: any, project: any, event: MouseEvent) {
    event.stopPropagation();
    this.selectedAreaId = area.id;
    this.selectedAreaName = area.areaName;
    this.selectedCountryId = country.id;
    this.selectedCountryName = country.countryName;
    this.selectedProjectId = project.id;
    this.selectedProjectName = project.projectName;
    this.devicesGetByAreaId(project.id, country.id, area.id);
  }

  selectCountry(country: any, project: any, event: MouseEvent) {
    event.stopPropagation();
    this.selectedCountryId = country.id;
    this.selectedCountryName = country.countryName;
    this.selectedProjectId = project.id;
    this.selectedProjectName = project.projectName;
    this.devicesGetByCountryId(project.id, country.id);
  }







  parameters: any[] = [];
  // selectedDeviceId: string | null = null;
  selectedParameterId: string | null = null;

  // onDeviceChange(deviceId: string) {
  //   if (!deviceId) {
  //     this.parameters = [];
  //     this.selectedParameterId = null;
  //     return;
  //   }

  //   this.device
  //     .getDeviceParametersByDeviceId(deviceId) // 👈 DEVICE ID PASSED
  //     .subscribe({
  //       next: (res: any) => {
  //         this.parameters = res ?? [];
  //         this.selectedParameterId = null;
  //       },
  //       error: (err: any) => {
  //         console.error('Failed to load parameters', err);
  //         this.parameters = [];
  //       }
  //     });
  // }


  // parameters: any[] = [];
  // selectedDeviceId: string | null = null;
  // selectedParameterId: string | null = null;

  // parameters: any[] = [];
  // selectedDeviceId: string | null = null;
  // selectedParameterId: string | null = null;

  // selectedDeviceId: string | null = null;
  // parameters: any[] = [];

  selectedDeviceId: string = '';
  // parameters: any[] = [];

  isParameterLoading = false;

onDeviceChange(deviceId: string) {
  console.log('Device ID:', deviceId);

  if (!deviceId) {
    this.parameters = [];
    return;
  }

  this.isParameterLoading = true;
  this.parameters = [];

  this.device
    .getDeviceParametersByDeviceId(deviceId)
    .subscribe({
      next: (res: any) => {          // ✅ changed any[] to any
        this.parameters = Array.isArray(res)
          ? res.flatMap((item: any) => item.deviceParameters || [])
          : [];
        this.isParameterLoading = false;
      },
      error: () => {
        this.parameters = [];
        this.isParameterLoading = false;
      }
    });
}






  loadParametersByDevice(deviceId: string) {
    this.device
      .getDeviceParametersByDeviceId(deviceId)
      .subscribe({
        next: (res: any) => {
          this.parameters = res ?? [];

        },
        error: (err: any) => {
          console.error('Failed to load parameters', err);
          this.parameters = [];
        }
      });
  }














  // ACTION DROPDOWN
  showActionDropdown = false;
  selectedAction: string | null = null;
  selectedActionLabel = "";

  // action device and parameter selections
  selectedActionDeviceId: any;
  selectedActionParameterId: any;
  actionParameters: any[] = [];
  conditionDevices: any[] = [];
  actionDevices: any[] = [];
dashboardChecked: boolean = false;



  loadActionDevices() {
    if (!this.selectedZoneId) return;

    this.device.getDevicesByZone(
      this.selectedProjectId!,
      this.selectedCountryId!,
      this.selectedAreaId!,
      this.selectedBuildingId!,
      this.selectedFloorId!,
      this.selectedZoneId
    )
      .subscribe((res: any) => {
        this.actionDevices = (res as any[]) || [];
      });

  }




  // toggleActionDropdown(index: number) {
  //   this.actions[index].showDropdown =
  //     !this.actions[index].showDropdown;
  // }




  selectedAlarmType: 'dashboard' | 'email' | 'task' | null = null;

  // selectAction(type: 'dashboard' | 'email' | 'task', index: number) {
  //   const a = this.actions[index];

  //   a.selectedAction = type;
  //   a.showDropdown = false;

  //   if (type === 'dashboard') a.selectedActionLabel = 'Show on Dashboard';
  //   if (type === 'email') a.selectedActionLabel = 'Send Email';
  //   if (type === 'task') a.selectedActionLabel = 'Create Task';
  // }
onActionDeviceChange(deviceId: string) {
  this.selectedActionDeviceId = deviceId;
  this.selectedActionParameterId = null;
  this.actionParameters = [];

  if (!deviceId) return;

  this.device.getDeviceParametersByDeviceId(deviceId)
    .subscribe({
      next: (res: any) => {                               // ✅ any[] → any
        this.actionParameters = Array.isArray(res)
          ? res.flatMap((x: any) => x.deviceParameters || [])  // ✅ null safe
          : [];
      },
      error: () => {
        this.actionParameters = [];
      }
    });
}









  get relationshipText(): string {
    if (!this.conditions || this.conditions.length === 0) {
      return '';
    }

    // Extract only A / B / C from label
    const shortLabel = (label: string) =>
      label.replace(/Condition\s*/i, '').trim();

    let text = shortLabel(this.conditions[0].label);

    for (let i = 1; i < this.conditions.length; i++) {
      const op = this.conditions[i].operator || 'AND';
      text += ` ${op} ${shortLabel(this.conditions[i].label)}`;
    }

    return text;
  }







  // maxConditions = 3; // A, B, C only
  maxConditions = 1; // A, B, C only

  conditions = [
    // this.createCondition('Condition A')
    this.createCondition('')
  ];

  // FIND and REPLACE createCondition():
  createCondition(label: string) {
    return {
      label,
      selectedCondition: '',
      selectedConditionLabel: '',
      showDropdown: false,
      showPeopleInputs: false,
      deviceName: '',
      deviceId: '',
      deviceStatus: '',       // ← RENAMED from deviceId to avoid confusion
      deviceTime: '',
      operator: 'AND' as 'AND' | 'OR'
    };
  }







  addCondition() {
    if (this.conditions.length >= this.maxConditions) {
      return; // 🚫 stop after Condition C
    }

    const nextLabel = `Condition ${String.fromCharCode(65 + this.conditions.length)}`;
    this.conditions.push(this.createCondition(nextLabel));
  }




  toggleConditionDropdown(index: number) {
    this.conditions[index].showDropdown =
      !this.conditions[index].showDropdown;
  }






  selectCondition(type: 'device' | 'time' | 'people', index: number) {
    const c = this.conditions[index];

    c.selectedCondition = type;
    c.showDropdown = false;   // ✅ FIXED
    c.showPeopleInputs = false;

    if (type === 'device') {
      c.selectedConditionLabel = 'When the device';
    }

    if (type === 'time') {
      c.selectedConditionLabel = 'When the time is';
    }

    if (type === 'people') {
      c.selectedConditionLabel = 'When the people is';
      c.showPeopleInputs = true;
    }
  }

  removeCondition(index: number) {
    if (index === 0) return; // ❌ cannot remove Condition A
    this.conditions.splice(index, 1);
  }






  selectAction(type: 'device' | 'alarm', index: number) {
    const a = this.actions[index];

    a.selectedAction = type;
    a.selectedActionLabel =
      type === 'device' ? 'Trigger Device' : 'Send an alarm';

    a.showActionDropdown = false; // ✅ FIXED
  }







  selectAlarmType(
    type: 'dashboard' | 'email' | 'task',
    index: number
  ) {
    const a = this.actions[index];

    // Just switch the type
    a.selectedAlarmType = type;
  }






  actions: ActionItem[] = [
    // this.createAction('Action A')

  ];

  createAction(label: string): ActionItem {
    return {
      label,
      selectedAction: '',
      selectedActionLabel: '',
      showActionDropdown: false,
      selectedAlarmType: '',

      email: {
        severity: '',
        title: '',
        description: '',
        recurrence: '',
        message: ''
      },

      task: {
        severity: '',
        title: '',
        description: '',
        recurrence: '',
        message: ''
      }
    };
  }






  addAction() {
    if (this.actions.length >= 3) return; // max Action C
    const label = `Action ${String.fromCharCode(65 + this.actions.length)}`;
    this.actions.push(this.createAction(label));
  }

  removeAction(index: number) {
    if (index === 0) return; // Action A not removable
    this.actions.splice(index, 1);
  }

  toggleActionDropdown(index: number) {
    this.actions[index].showActionDropdown =
      !this.actions[index].showActionDropdown;
  }

  // selectAction(type: 'device' | 'alarm', index: number) {
  //   const a = this.actions[index];
  //   a.selectedAction = type;
  //   a.showActionDropdown = false;

  //   a.selectedActionLabel =
  //     type === 'device' ? 'Trigger Device' : 'Send an alarm';
  // }

  // selectAlarmType(type: 'dashboard' | 'email' | 'task', index: number) {
  //   this.actions[index].selectedAlarmType = type;
  // }













  alarms = [
    {
      selectedAlarmType: '',
      title: '',
      description: '',
      target: ''
    }
  ];









  trackByCondition(index: number): number {
    return index;
  }






  // Add this property
  @ViewChildren('conditionBlock') conditionBlocks!: QueryList<ElementRef>;

  ngAfterViewChecked() {
    // This ensures AND/OR dropdowns align with their corresponding conditions
    this.syncLogicBoxHeights();
  }

  syncLogicBoxHeights() {
    if (!this.conditionBlocks) return;

    const blocks = this.conditionBlocks.toArray();
    const logicBoxes = document.querySelectorAll('.logic-box');

    blocks.forEach((block, index) => {
      if (index < logicBoxes.length) {
        const blockHeight = block.nativeElement.offsetHeight;
        (logicBoxes[index] as HTMLElement).style.minHeight = `${blockHeight}px`;
      }
    });
  }


























  // 13-2-26



  selectedAreaName: string | null = null;


  selectedBuildingName: string | null = null;


  selectedCountryName: string | null = null;

  selectedProjectName: string | null = null;


  selectedFloorName: string | null = null;


  selectedZoneName: string | null = null;


  selectedDeviceName: string = '';

  selectedDevices: any[] = [];

  description: string = '';

  // ADD these new properties (replace/add after existing selectedDevices: any[] = []):
  selectedActionType: string = '';   // ← binds "Select Type" dropdown → goes to "action" field

  toggleDeviceSelection(device: any) {
    const index = this.selectedDevices.findIndex(d => d.deviceId === device.id);
    if (index > -1) {
      this.selectedDevices.splice(index, 1);
    } else {
      this.selectedDevices.push({
     deviceId: device.deviceUniqueId,
        deviceName: device.deviceName
      });
    }
  }


  isDeviceSelected(deviceId: string): boolean {
    return this.selectedDevices.some(d => d.deviceId === deviceId);
  }


  // Convenience label for the multi-select trigger button
  get selectedDevicesLabel(): string {
    if (this.selectedDevices.length === 0) return 'Select devices';
    if (this.selectedDevices.length === 1) return this.selectedDevices[0].deviceName;
    return `${this.selectedDevices.length} devices selected`;
  }

  showDeviceDropdown = false;

toggleDeviceDropdown() {
  this.showDeviceDropdown = !this.showDeviceDropdown;
  this.cdr.detectChanges();
}
closeDeviceDropdown() {
  this.showDeviceDropdown = false;
  this.cdr.detectChanges();
}

title: string = '';

validationErrors: { devices?: string; time?: string } = {};

saveProcessAutomation() {
  this.validationErrors = {};
  const errorMessages: string[] = [];

  if (this.selectedDevices.length === 0) {
    this.validationErrors.devices = 'Please select at least one device';
    errorMessages.push('• Please select the Country and select at least one device');
  }

  const time = this.conditions[0]?.deviceTime;
  if (!time || time.toString().trim() === '') {
    this.validationErrors.time = 'Please enter time in seconds';
    errorMessages.push('• Please enter time in seconds');
  }

  if (errorMessages.length > 0) {
    alert('Please fix the following:\n\n' + errorMessages.join('\n'));
    return;
  }

  const payload = {
    id: '',
    projectId: this.selectedProjectId,
    projectName: this.selectedProjectName,
    countryId: this.selectedCountryId ?? '',
    countryName: this.selectedCountryName ?? '',
    areaId: this.selectedAreaId ?? '',
    areaName: this.selectedAreaName ?? '',
    buildingId: this.selectedBuildingId ?? '',
    buildingName: this.selectedBuildingName ?? '',
    floorId: this.selectedFloorId ?? '',
    floorName: this.selectedFloorName ?? '',
    zoneId: this.selectedZoneId ?? '',
    zoneName: this.selectedZoneName ?? '',
    createdAt: new Date().toISOString(),
    createdBy: 'Admin',
    condition: this.title,
    description: this.description,
    time: time,
    action: this.selectedActionType,
    dashboard: this.dashboardChecked,
    devices: this.selectedDevices,
    priority: 'Major',
    status: this.conditions[0]?.deviceStatus || 'OFFLINE',
  };

  this.device.createProcessAutomation(payload).subscribe({
    next: (res) => {
      console.log('✅ Process Automation Created', res);
      this.router.navigate(['/processautomation']);
    },
    error: (err) => {
      console.error('❌ Error creating process automation', err);
    }
  });
}


















  // 16-2-26

// selectProject(project: any, event: MouseEvent) {
//   event.stopPropagation();
//   this.selectedProjectId = project.id;
//   this.selectedProjectName = project.projectName;

//   // Clear all lower-level selections
//   this.selectedCountryId = null;
//   this.selectedCountryName = null;
//   this.selectedAreaId = null;
//   this.selectedAreaName = null;
//   this.selectedBuildingId = null;
//   this.selectedBuildingName = null;
//   this.selectedFloorId = null;
//   this.selectedFloorName = null;
//   this.selectedZoneId = null;
//   this.selectedZoneName = null;

//   this.devicesGetByProjectId(project.id);
// }
selectProject(project: any, event: MouseEvent) {
  event.stopPropagation();
  this.selectedProjectId = project.id;
  this.selectedProjectName = project.projectName;

  this.selectedCountryId = null;
  this.selectedCountryName = null;
  this.selectedAreaId = null;
  this.selectedAreaName = null;
  this.selectedBuildingId = null;
  this.selectedBuildingName = null;
  this.selectedFloorId = null;
  this.selectedFloorName = null;
  this.selectedZoneId = null;
  this.selectedZoneName = null;

  // ❌ Clear devices — don't load at project level
  this.clearAllDeviceLists();
  this.devices = [];
  this.activeLevel = null;
  this.cdr.detectChanges();
}







onDeviceSelectionChange(device: any) {
  this.toggleDeviceSelection(device);
  
  // Clear device error as soon as at least one device is selected
  if (this.selectedDevices.length > 0) {
    this.validationErrors.devices = undefined;
  }
}

onTimeChange(value: any) {
  if (value !== null && value !== undefined && value !== '') {
    this.validationErrors.time = undefined;
  }
}






@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  // Close if click is outside the multi-select-wrapper
  if (!target.closest('.multi-select-wrapper') && !target.closest('.multi-select-trigger')) {
    this.showDeviceDropdown = false;
    this.cdr.detectChanges();
  }
}
















}
