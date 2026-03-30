import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChildren ,HostListener} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Roleservice } from '../../../service/role/roleservice';
import { Device } from '../../../service/device/device';










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

@Component({
  selector: 'app-editprocessautomation',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './editprocessautomation.html',
  styleUrl: './editprocessautomation.css'
})
export class Editprocessautomation implements OnInit, AfterViewChecked{












   editId: string = '';
  activeTab: string = 'project';

constructor(
  private role: Roleservice,
  private cdr: ChangeDetectorRef,
  private device: Device,
  private router: Router,           // ← from @angular/router
  private route: ActivatedRoute     // ← from @angular/router
) {}




    ngOnInit(): void {
    // Get ID from route
    this.editId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadProject();
    if (this.editId) {
      this.loadExistingData();
    }
  }




loadExistingData() {
  this.device.getProcessAutomationById(this.editId).subscribe({
    next: (res: any) => {
      // Prefill simple fields
 this.title = res.condition ?? '';   // ← API has no "title" field, use description
this.description        = res.description  ?? '';
      this.selectedActionType = res.action       ?? '';

      // Prefill location IDs and names
      this.selectedProjectId    = res.projectId    ?? null;
      this.selectedProjectName  = res.projectName  ?? null;
      this.selectedCountryId    = res.countryId    ?? null;
      this.selectedCountryName  = res.countryName  ?? null;
      this.selectedAreaId       = res.areaId       ?? null;
      this.selectedAreaName     = res.areaName     ?? null;
      this.selectedBuildingId   = res.buildingId   ?? null;
      this.selectedBuildingName = res.buildingName ?? null;
      this.selectedFloorId      = res.floorId      ?? null;
      this.selectedFloorName    = res.floorName    ?? null;
      this.selectedZoneId       = res.zoneId       ?? null;
      this.selectedZoneName     = res.zoneName     ?? null;
      // ADD after existing prefill lines:
this.dashboardChecked = res.dashboard === true || res.dashboard === 'true' || res.dashboard === 1;
// this.cdr.detectChanges();

      // Prefill devices
      this.selectedDevices = res.devices ?? [];

      // Prefill condition
// ADD after existing prefills:
if (this.conditions[0]) {
  this.conditions[0].deviceStatus = res.condition ?? '';
  this.conditions[0].deviceTime   = res.time      ?? '';
  // Also normalize status for the dropdown
  const s = res.status;
  this.conditions[0].deviceStatus =
    s === true || s === 'true' ? 'ONLINE' :
    s === false || s === 'false' ? 'OFFLINE' :
    s ?? '';
}

// Force UI update BEFORE hierarchy loads (so fields show immediately)
this.cdr.detectChanges();

// Expand hierarchy (async — runs after)
setTimeout(() => {
  this.expandHierarchy(res);
}, 0);
    },
    error: () => console.log('Error loading existing process automation')
  });
}




expandHierarchy(res: any) {
  if (!res.projectId) return;

  // Step 1: Load countries under project → expands project node
  this.role.countryGetById(res.projectId).subscribe({
    next: (countries: any) => {
      const arr: any[] = Array.isArray(countries) ? countries : [];
      this.countriesByProject[res.projectId] = arr;
      arr.forEach((c: any) => this.countryProjectMap[c.id] = res.projectId);
      this.expandedProjects.add(res.projectId);

      if (!res.countryId) { this.cdr.detectChanges(); return; }

      // Step 2: Load areas under country → expands country node
      this.role.getSummary(res.countryId).subscribe({
        next: (areas: any) => {
          this.areaByCountry[res.countryId] = Array.isArray(areas) ? areas : [];
          this.expandedCountry.add(res.countryId);

          if (!res.areaId) { this.cdr.detectChanges(); return; }

          // Step 3: Load buildings under area → expands area node
          this.role.getBuilding(res.areaId).subscribe({
            next: (buildings: any) => {
              this.buildingByArea[res.areaId] = Array.isArray(buildings) ? buildings : [];
              this.expandedArea.add(res.areaId);

              if (!res.buildingId) { this.cdr.detectChanges(); return; }

              // Step 4: Load floors under building → expands building node
              this.role.getFloor(res.buildingId).subscribe({
                next: (floors: any) => {
                  this.floorByBuilding[res.buildingId] = Array.isArray(floors) ? floors : [];
                  this.expandedBuilding.add(res.buildingId);

                  if (!res.floorId) { this.cdr.detectChanges(); return; }

                  // Step 5: Load zones under floor → expands floor node
                  this.role.getZones(res.floorId).subscribe({
                 next: (zones: any) => {
  this.zoneByFloor[res.floorId] = Array.isArray(zones) ? zones : [];
  this.expandedFloor.add(res.floorId);

  // ✅ Highlight the selected zone
  if (res.zoneId) {
    this.selectItem(res.zoneId);          // ← triggers purple highlight

    this.devicesGetByZoneId(
      res.projectId, res.countryId, res.areaId,
      res.buildingId, res.floorId, res.zoneId
    );
  }

  this.cdr.detectChanges();
},
                    error: () => console.log('Error expanding zones')
                  });
                },
                error: () => console.log('Error expanding floors')
              });
            },
            error: () => console.log('Error expanding buildings')
          });
        },
        error: () => console.log('Error expanding areas')
      });
    },
    error: () => console.log('Error expanding countries')
  });
}





saveProcessAutomation() {
  this.validationErrors = {};
  const errorMessages: string[] = [];

  if (this.selectedDevices.length === 0) {
    this.validationErrors.devices = 'Please select at least one device';
    errorMessages.push('• Please select at least one device');
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
    id: this.editId,
    areaId:        this.selectedAreaId,
    areaName:      this.selectedAreaName,
    buildingId:    this.selectedBuildingId,
    buildingName:  this.selectedBuildingName,
    countryId:     this.selectedCountryId,
    countryName:   this.selectedCountryName,
    createdAt:     new Date().toISOString(),
    createdBy:     'Admin',
    condition:     this.title,
    description:   this.description,
    time:          this.conditions[0]?.deviceTime ?? '',
    action:        this.selectedActionType,
    dashboard:     this.dashboardChecked,
    devices:       this.selectedDevices,
    floorId:       this.selectedFloorId,
    floorName:     this.selectedFloorName,
    priority:      'Major',
    projectId:     this.selectedProjectId,
    projectName:   this.selectedProjectName,
    status:        this.conditions[0]?.deviceStatus ?? '',
    zoneId:        this.selectedZoneId,
    zoneName:      this.selectedZoneName
  };

  this.device.updateProcessAutomation(this.editId, payload).subscribe({
next: () => {
  this.router.navigate(['/processautomation']);
},
      error: (err) => {
        console.error('❌ Error updating', err);
      }
    });
  }






   projects: any[] = [];
  loadProject() {
    this.role.getProject().subscribe({
      next: (res: any) => { this.projects = res; this.cdr.detectChanges(); },
      error: () => console.log('error loading project')
    });
  }





  countriesByProject: { [projectId: string]: any[] } = {};
  expandedProjects: Set<string> = new Set();
  private countryProjectMap: { [countryId: string]: string } = {};

  loadCountries(projectId: string) {
    if (this.expandedProjects.has(projectId)) {
      this.expandedProjects.delete(projectId); return;
    }
    this.role.countryGetById(projectId).subscribe({
      next: (res: any) => {
        const countries: any[] = Array.isArray(res) ? res : [];
        this.countriesByProject[projectId] = countries;
        countries.forEach(c => this.countryProjectMap[c.id] = projectId);
        this.expandedProjects.add(projectId);
        this.devicesGetByProjectId(projectId);
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

  loadArea(countryId: string) {
    if (this.expandedCountry.has(countryId)) {
      this.expandedCountry.delete(countryId); return;
    }
    if (!this.areaByCountry[countryId]) {
      this.role.getSummary(countryId).subscribe({
        next: (res: any) => {
          this.areaByCountry[countryId] = Array.isArray(res) ? res : [];
          this.expandedCountry.add(countryId);
          const projectId = this.getProjectIdForCountry(countryId);
          if (projectId) this.devicesGetByCountryId(projectId, countryId);
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
  expandedArea: Set<string> = new Set();

  loadBuilding(areaId: string) {
    if (this.expandedArea.has(areaId)) {
      this.expandedArea.delete(areaId); return;
    }
    this.role.getBuilding(areaId).subscribe({
      next: (res: any) => {
        this.buildingByArea[areaId] = Array.isArray(res) ? res : [];
        this.expandedArea.add(areaId);
        this.cdr.detectChanges();
      },
      error: () => console.log('Error loading building')
    });
  }

  floors: any[] = [];
  floorByBuilding: { [buildingId: string]: any[] } = {};
  expandedBuilding: Set<string> = new Set();

  loadFloor(buildingId: string) {
    if (this.expandedBuilding.has(buildingId)) {
      this.expandedBuilding.delete(buildingId); return;
    }
    this.role.getFloor(buildingId).subscribe({
      next: (res: any) => {
        this.floors = res;
        this.floorByBuilding[buildingId] = Array.isArray(res) ? res : [];
        this.expandedBuilding.add(buildingId);
        this.cdr.detectChanges();
      },
      error: () => console.log('Error loading floor')
    });
  }

  zones: any[] = [];
  zoneByFloor: { [floorId: string]: any[] } = {};
  expandedFloor: Set<string> = new Set();
  dashboardChecked: boolean = false;

  loadZones(floorId: string) {
    if (this.expandedFloor.has(floorId)) {
      this.expandedFloor.delete(floorId); return;
    }
    this.role.getZones(floorId).subscribe({
      next: (res: any) => {
        this.zones = res;
        this.zoneByFloor[floorId] = Array.isArray(res) ? res : [];
        this.expandedFloor.add(floorId);
        this.cdr.detectChanges();
      },
      error: () => console.log('Error loading zones')
    });
  }

  subZones: any[] = [];
  subZoneByZone: { [zoneId: string]: any[] } = {};
  expandedZone: Set<string> = new Set();

  loadSubZones(zoneId: string) {
    if (this.expandedZone.has(zoneId)) {
      this.expandedZone.delete(zoneId); return;
    }
    this.role.getSubZones(zoneId).subscribe({
      next: (res: any) => {
        this.subZones = res;
        this.subZoneByZone[zoneId] = Array.isArray(res) ? res : [];
        this.expandedZone.add(zoneId);
        this.cdr.detectChanges();
      },
      error: () => console.error('Error loading subzones')
    });
  }

  selectedItemId: string | number | null = null;
  activeLevel: 'project' | 'country' | 'area' | 'building' | 'floor' | 'zone' | null = null;

  selectItem(id: string | number) { this.selectedItemId = id; }

  projectDevices: any[] = [];
  countryDevices: any[] = [];
  areaDevices: any[] = [];
  buildingDevices: any[] = [];
  floorDevices: any[] = [];
  zoneDevices: any[] = [];

  get activeDevices(): any[] {
    switch (this.activeLevel) {
      case 'project':  return this.projectDevices;
      case 'country':  return this.countryDevices;
      case 'area':     return this.areaDevices;
      case 'building': return this.buildingDevices;
      case 'floor':    return this.floorDevices;
      case 'zone':     return this.zoneDevices;
      default:         return [];
    }
  }

  private clearAllDeviceLists() {
    this.projectDevices = this.countryDevices = this.areaDevices =
    this.buildingDevices = this.floorDevices = this.zoneDevices = [];
  }

  devicesGetByProjectId(projectId: string) {
    this.device.getDevicesByProject(projectId).subscribe({
      next: (res: any) => { this.clearAllDeviceLists(); 
        // this.projectDevices = res ?? []; 
        this.activeLevel = 'project'; this.cdr.detectChanges(); },
      error: () => console.log('error loading devices by project')
    });
  }

  devicesGetByCountryId(projectId: string, countryId: string) {
    this.device.getDevicesByCountry(projectId, countryId).subscribe({
      next: (res: any) => { this.clearAllDeviceLists();
        //  this.countryDevices = res ?? []; 
         this.activeLevel = 'country'; this.cdr.detectChanges(); },
      error: () => console.log('error loading devices by country')
    });
  }

  devicesGetByAreaId(projectId: string, countryId: string, areaId: string) {
    this.device.getDevicesByArea(projectId, countryId, areaId).subscribe({
      next: (res: any) => { this.clearAllDeviceLists();
        //  this.areaDevices = res ?? [];
          this.activeLevel = 'area'; this.cdr.detectChanges(); },
      error: () => console.log('error loading devices by area')
    });
  }

  devicesGetByBuildingId(projectId: string, countryId: string, areaId: string, buildingId: string) {
    this.device.getDevicesByBuilding(projectId, countryId, areaId, buildingId).subscribe({
      next: (res: any) => { this.clearAllDeviceLists();
        //  this.buildingDevices = res ?? [];
          this.activeLevel = 'building'; this.cdr.detectChanges(); },
      error: () => console.log('error loading devices by building')
    });
  }

  devicesGetByFloorId(projectId: string, countryId: string, areaId: string, buildingId: string, floorId: string) {
    this.device.getDevicesByFloor(projectId, countryId, areaId, buildingId, floorId).subscribe({
      next: (res: any) => { this.clearAllDeviceLists(); 
        // this.floorDevices = res ?? [];
         this.activeLevel = 'floor'; this.cdr.detectChanges(); },
      error: () => console.log('error loading devices by floor')
    });
  }

  devicesGetByZoneId(projectId: string, countryId: string, areaId: string, buildingId: string, floorId: string, zoneId: string) {
    this.device.getDevicesByZone(projectId, countryId, areaId, buildingId, floorId, zoneId).subscribe({
      next: (res: any) => { this.clearAllDeviceLists(); this.zoneDevices = res ?? []; this.activeLevel = 'zone'; this.cdr.detectChanges(); },
      error: () => console.log('error loading devices by zone')
    });
  }

  selectZone(zone: any, floor: any, building: any, area: any, country: any, project: any, event: MouseEvent) {
    event.stopPropagation();
    this.selectedZoneId = zone.id; this.selectedZoneName = zone.zoneName;
    this.selectedFloorId = floor.id; this.selectedFloorName = floor.floorName;
    this.selectedBuildingId = building.id; this.selectedBuildingName = building.buildingName;
    this.selectedAreaId = area.id; this.selectedAreaName = area.areaName;
    this.selectedCountryId = country.id; this.selectedCountryName = country.countryName;
    this.selectedProjectId = project.id; this.selectedProjectName = project.projectName;
    this.devicesGetByZoneId(project.id, country.id, area.id, building.id, floor.id, zone.id);
  }

  selectFloor(floor: any, building: any, area: any, country: any, project: any, event: MouseEvent) {
    event.stopPropagation();
    this.selectedFloorId = floor.id; this.selectedFloorName = floor.floorName;
    this.selectedBuildingId = building.id; this.selectedBuildingName = building.buildingName;
    this.selectedAreaId = area.id; this.selectedAreaName = area.areaName;
    this.selectedCountryId = country.id; this.selectedCountryName = country.countryName;
    this.selectedProjectId = project.id; this.selectedProjectName = project.projectName;
    this.devicesGetByFloorId(project.id, country.id, area.id, building.id, floor.id);
  }

  selectBuilding(building: any, area: any, country: any, project: any, event: MouseEvent) {
    event.stopPropagation();
    this.selectedBuildingId = building.id; this.selectedBuildingName = building.buildingName;
    this.selectedAreaId = area.id; this.selectedAreaName = area.areaName;
    this.selectedCountryId = country.id; this.selectedCountryName = country.countryName;
    this.selectedProjectId = project.id; this.selectedProjectName = project.projectName;
    this.devicesGetByBuildingId(project.id, country.id, area.id, building.id);
  }

  selectArea(area: any, country: any, project: any, event: MouseEvent) {
    event.stopPropagation();
    this.selectedAreaId = area.id; this.selectedAreaName = area.areaName;
    this.selectedCountryId = country.id; this.selectedCountryName = country.countryName;
    this.selectedProjectId = project.id; this.selectedProjectName = project.projectName;
    this.devicesGetByAreaId(project.id, country.id, area.id);
  }

  selectCountry(country: any, project: any, event: MouseEvent) {
    event.stopPropagation();
    this.selectedCountryId = country.id; this.selectedCountryName = country.countryName;
    this.selectedProjectId = project.id; this.selectedProjectName = project.projectName;
    this.devicesGetByCountryId(project.id, country.id);
  }

  // Condition fields
  showTimePeriod = false;
  fromHour = ''; fromMinute = ''; toHour = ''; toMinute = '';
  days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  selectedDays: string[] = [];

  toggleTimePeriod(event: Event) {
    this.showTimePeriod = (event.target as HTMLInputElement).checked;
    if (!this.showTimePeriod) this.resetTimePeriod();
  }
  resetTimePeriod() { this.fromHour = this.fromMinute = this.toHour = this.toMinute = ''; this.selectedDays = []; }
  toggleDay(day: string) {
    this.selectedDays.includes(day)
      ? (this.selectedDays = this.selectedDays.filter(d => d !== day))
      : this.selectedDays.push(day);
  }
  formatHour(event: any) { let v = event.target.value.replace(/\D/g,''); if (+v > 23) v = '23'; event.target.value = v; }
  formatMinute(event: any) { let v = event.target.value.replace(/\D/g,''); if (+v > 59) v = '59'; event.target.value = v; }

  showPeopleInputs = false;
  selectedZoneId: string | null = null;
  devices: any[] = [];
  selectedProjectId: string | null = null;
  selectedCountryId: string | null = null;
  selectedAreaId: string | null = null;
  selectedBuildingId: string | null = null;
  selectedFloorId: string | null = null;
  selectedAreaName: string | null = null;
  selectedBuildingName: string | null = null;
  selectedCountryName: string | null = null;
  selectedProjectName: string | null = null;
  selectedFloorName: string | null = null;
  selectedZoneName: string | null = null;

  parameters: any[] = [];
  selectedParameterId: string | null = null;
  selectedDeviceId: string = '';
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

  showActionDropdown = false;
  selectedAction: string | null = null;
  selectedActionLabel = '';
  selectedActionDeviceId: any;
  selectedActionParameterId: any;
  actionParameters: any[] = [];
  actionDevices: any[] = [];
  selectedAlarmType: 'dashboard' | 'email' | 'task' | null = null;

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
    if (!this.conditions?.length) return '';
    const short = (l: string) => l.replace(/Condition\s*/i, '').trim();
    let t = short(this.conditions[0].label);
    for (let i = 1; i < this.conditions.length; i++)
      t += ` ${this.conditions[i].operator || 'AND'} ${short(this.conditions[i].label)}`;
    return t;
  }

  maxConditions = 1;
  conditions = [this.createCondition('')];

  createCondition(label: string) {
    return { label, selectedCondition: '', selectedConditionLabel: '', showDropdown: false, showPeopleInputs: false, deviceName: '', deviceId: '', deviceStatus: '', deviceTime: '', operator: 'AND' as 'AND' | 'OR' };
  }

  addCondition() {
    if (this.conditions.length >= this.maxConditions) return;
    this.conditions.push(this.createCondition(`Condition ${String.fromCharCode(65 + this.conditions.length)}`));
  }

  toggleConditionDropdown(index: number) { this.conditions[index].showDropdown = !this.conditions[index].showDropdown; }

  selectCondition(type: 'device' | 'time' | 'people', index: number) {
    const c = this.conditions[index];
    c.selectedCondition = type; c.showDropdown = false; c.showPeopleInputs = false;
    if (type === 'device') c.selectedConditionLabel = 'When the device';
    if (type === 'time')   c.selectedConditionLabel = 'When the time is';
    if (type === 'people') { c.selectedConditionLabel = 'When the people is'; c.showPeopleInputs = true; }
  }

  removeCondition(index: number) { if (index === 0) return; this.conditions.splice(index, 1); }

  selectAction(type: 'device' | 'alarm', index: number) {
    const a = this.actions[index];
    a.selectedAction = type;
    a.selectedActionLabel = type === 'device' ? 'Trigger Device' : 'Send an alarm';
    a.showActionDropdown = false;
  }

  selectAlarmType(type: 'dashboard' | 'email' | 'task', index: number) { this.actions[index].selectedAlarmType = type; }

  actions: ActionItem[] = [];

  createAction(label: string): ActionItem {
    return { label, selectedAction: '', selectedActionLabel: '', showActionDropdown: false, selectedAlarmType: '',
      email: { severity: '', title: '', description: '', recurrence: '', message: '' },
      task:  { severity: '', title: '', description: '', recurrence: '', message: '' }
    };
  }

  addAction() { if (this.actions.length >= 3) return; this.actions.push(this.createAction(`Action ${String.fromCharCode(65 + this.actions.length)}`)); }
  removeAction(index: number) { if (index === 0) return; this.actions.splice(index, 1); }
  toggleActionDropdown(index: number) { this.actions[index].showActionDropdown = !this.actions[index].showActionDropdown; }

  alarms = [{ selectedAlarmType: '', title: '', description: '', target: '' }];
  trackByCondition(index: number): number { return index; }

  @ViewChildren('conditionBlock') conditionBlocks!: QueryList<ElementRef>;
  ngAfterViewChecked() { this.syncLogicBoxHeights(); }
  syncLogicBoxHeights() {
    if (!this.conditionBlocks) return;
    const blocks = this.conditionBlocks.toArray();
    document.querySelectorAll('.logic-box').forEach((box, i) => {
      if (i < blocks.length) (box as HTMLElement).style.minHeight = `${blocks[i].nativeElement.offsetHeight}px`;
    });
  }

selectedDeviceName: string = '';
selectedDevices: any[] = [];
description: string = '';
selectedActionType: string = '';
title: string = '';

validationErrors: { devices?: string; time?: string } = {};

onTimeChange(value: any) {
  if (value !== null && value !== undefined && value !== '') {
    this.validationErrors.time = undefined;
  }
}
  toggleDeviceSelection(device: any) {
    const index = this.selectedDevices.findIndex(d => d.deviceId === device.id);
    index > -1 ? this.selectedDevices.splice(index, 1) : this.selectedDevices.push({ deviceId: device.id, deviceName: device.deviceName });
  }

  isDeviceSelected(deviceId: string): boolean { return this.selectedDevices.some(d => d.deviceId === deviceId); }

  get selectedDevicesLabel(): string {
    if (!this.selectedDevices.length) return 'Select devices';
    if (this.selectedDevices.length === 1) return this.selectedDevices[0].deviceName;
    return `${this.selectedDevices.length} devices selected`;
  }

showDeviceDropdown = false;

toggleDeviceDropdown() {
  this.showDeviceDropdown = !this.showDeviceDropdown;
  this.cdr.detectChanges();
}

onDeviceSelectionChange(device: any) {
  this.toggleDeviceSelection(device);
  if (this.selectedDevices.length > 0) {
    this.validationErrors.devices = undefined;
  }
  this.cdr.detectChanges();
}
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.multi-select-wrapper') && !target.closest('.multi-select-trigger')) {
    this.showDeviceDropdown = false;
    this.cdr.detectChanges();
  }
}


}

