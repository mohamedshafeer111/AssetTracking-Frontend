import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Roleservice } from '../../../service/role/roleservice';
import { RouterLink, RouterModule } from '@angular/router';
import { Device } from '../../../service/device/device';
import { HttpClient } from '@angular/common/http';
import { Websocket } from '../../../service/websocket/websocket';
import { FormsModule } from '@angular/forms';
import { ClockWidget } from '../../clock-widget/clock-widget/clock-widget';
import { Widget } from '../../../service/widget/widget';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, NgIf, NgFor, RouterModule, FormsModule, ClockWidget],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {

  // private wsUrl = environment.wsUrl;

  ngOnInit(): void {
    this.loadProject();
    this.loadZoneSensors();
    this.connectWebSocket();
    this.loadDashboard();
    this.getDashboards();
    this.connectDeviceNotificationWS();
  }

  constructor(private cdr: ChangeDetectorRef, private role: Roleservice,
    private device: Device, private http: HttpClient, private zoneSocket: Websocket,
    private widget: Widget) { }

  isAddWidgetPopup: boolean = false;

  openAddWidgetPopup() {
    this.resetPopupData();
    this.isAddWidgetPopup = true;
  }
  closeAddWidgetPopup() {
    this.isAddWidgetPopup = false;
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

  loadCountries(projectId: string) {
    this.resetDeviceSelection();
    this.selectedProjectId = projectId;
    if (this.expandedProjects.has(projectId)) {
      this.expandedProjects.delete(projectId);
      return;
    }

    this.role.countryGetById(projectId).subscribe({
      next: (res: any) => {
        this.countriesByProject[projectId] = Array.isArray(res) ? res : [];
        this.expandedProjects.add(projectId);

        this.cdr.detectChanges();
        this.selectedProjectId = projectId;
        // this.devicesGetByProjectId(projectId);

      },
      error: () => {
        console.log("Error loading countries");
      }
    });
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



  selectedProjectId: string = '';
  loadArea(countryId: string, projectId?: string) {
    this.resetDeviceSelection();
    this.selectedCountryId = countryId;
    // Collapse if already expanded
    if (this.expandedCountry.has(countryId)) {
      this.expandedCountry.delete(countryId);
      return;
    }

    // Call your area summary API (existing logic)
    if (!this.areaByCountry[countryId]) {
      this.role.getSummary(countryId).subscribe({
        next: (res: any) => {
          this.areaByCountry[countryId] = Array.isArray(res) ? res : [];
          this.expandedCountry.add(countryId);
          this.cdr.detectChanges();

          // ✅ Call devices API for this country
          // if (this.selectedProjectId) {
          //   this.devicesGetByCountryId(this.selectedProjectId, countryId);
          // }
        },
        error: () => {
          console.log("Error loading areas");
        }
      });
    } else {
      this.expandedCountry.add(countryId);
      this.cdr.detectChanges();

      // ✅ Also call devices API when re-expanding
      // if (this.selectedProjectId) {
      //   this.devicesGetByCountryId(this.selectedProjectId, countryId);
      // }
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

  selectedCountryId: string = '';

  loadBuilding(areaId: string) {
    this.resetDeviceSelection();
    this.selectedAreaId = areaId;
    if (this.expandedArea.has(areaId)) {
      this.expandedArea.delete(areaId);
      return;
    }
    this.role.getBuilding(areaId).subscribe({
      next: (res: any) => {
        this.buildingByArea[areaId] = Array.isArray(res) ? res : [];
        this.expandedArea.add(areaId);
        this.cdr.detectChanges();

        console.log("Before calling devicesGetByAreaId", this.selectedProjectId, this.selectedCountryId, areaId);
        //this.devicesGetByAreaId(this.selectedProjectId, this.selectedCountryId, areaId);
      },
      error: () => {
        console.log("Error loading buildings");
      }
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

  selectedAreaId: string = '';
  loadFloor(buildingId: string) {
    this.resetDeviceSelection();
    this.selectedBuildingId = buildingId;
    if (this.expandedBuilding.has(buildingId)) {
      this.expandedBuilding.delete(buildingId);
      return;
    }

    this.role.getFloor(buildingId).subscribe({
      next: (res: any) => {
        this.floorByBuilding[buildingId] = Array.isArray(res) ? res : [];
        this.expandedBuilding.add(buildingId);
        this.cdr.detectChanges();

        // ✅ Fetch devices for this building
        // if (this.selectedProjectId && this.selectedCountryId && this.selectedAreaId) {
        //   this.devicesGetByBuildingId(
        //     this.selectedProjectId,
        //     this.selectedCountryId,
        //     this.selectedAreaId,
        //     buildingId
        //   );
        // }
      },
      error: () => {
        console.log("Error loading floors");
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

  selectedBuildingId: string = '';
  loadZones(floorId: string) {
    this.resetDeviceSelection();
    this.selectedFloorId = floorId;
    if (this.expandedFloor.has(floorId)) {
      this.expandedFloor.delete(floorId);
      return;
    }

    this.role.getZones(floorId).subscribe({
      next: (res: any) => {
        this.zoneByFloor[floorId] = Array.isArray(res) ? res : [];
        this.expandedFloor.add(floorId);
        this.cdr.detectChanges();

        // ✅ Fetch devices for this floor
        // if (this.selectedProjectId && this.selectedCountryId && this.selectedAreaId && this.selectedBuildingId) {
        //   this.devicesGetByFloorId(
        //     this.selectedProjectId,
        //     this.selectedCountryId,
        //     this.selectedAreaId,
        //     this.selectedBuildingId,
        //     floorId
        //   );
        // }
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
  selectedFloorId: string = '';
  loadSubZones(zoneId: string) {
    this.resetDeviceSelection();
    if (this.expandedZone.has(zoneId)) {
      this.expandedZone.delete(zoneId);
      return;
    }

    // ✅ 1. Always fetch subzones
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

    // ✅ 2. Always fetch devices for this zone
    if (
      this.selectedProjectId &&
      this.selectedCountryId &&
      this.selectedAreaId &&
      this.selectedBuildingId &&
      this.selectedFloorId
    ) {
      this.devicesGetByZoneId(
        this.selectedProjectId,
        this.selectedCountryId,
        this.selectedAreaId,
        this.selectedBuildingId,
        this.selectedFloorId,
        zoneId
      );
    }
  }




  selectedItemId: string | number | null = null; // to store the clicked item's ID

  selectItem(id: string | number) {
    this.selectedItemId = id;
  }

  activeLevel: 'project' | 'country' | 'area' | 'building' | 'floor' | 'zone' | null = null;

  projectDevices: any[] = [];

  devicesGetByProjectId(projectId: any) {
    this.device.getDevicesByProject(projectId).subscribe({
      next: (res: any) => {
        this.projectDevices = res;
        this.areaDevices = [];
        this.countryDevices = []; // clear old country data
        this.activeLevel = 'project';
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error loading devicesbyproject")
      }
    })

  }


  countryDevices: any[] = []
  devicesGetByCountryId(projectId: any, countryId: any) {
    this.device.getDevicesByCountry(projectId, countryId).subscribe({
      next: (res: any) => {
        this.countryDevices = res;
        this.areaDevices = [];
        this.projectDevices = []; // clear project devices
        this.activeLevel = 'country';
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error loading devicesbyCountry")
      }
    })
  }

  areaDevices: any[] = [];

  devicesGetByAreaId(projectId: string, countryId: string, areaId: string) {
    this.device.getDevicesByArea(projectId, countryId, areaId).subscribe({
      next: (res: any) => {
        this.areaDevices = res;
        this.projectDevices = [];
        this.countryDevices = [];
        this.activeLevel = 'area';
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error loading devicesbyCountry")
      }
    })
  }

  buildingDevices: any[] = [];

  devicesGetByBuildingId(projectId: string, countryId: string, areaId: string, buildingId: string) {
    this.device.getDevicesByBuilding(projectId, countryId, areaId, buildingId).subscribe({
      next: (res: any) => {
        this.buildingDevices = res;
        // Clear other levels
        this.projectDevices = [];
        this.countryDevices = [];
        this.areaDevices = [];
        this.activeLevel = 'building';
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading devices by building");
      }
    });
  }


  floorDevices: any[] = [];

  devicesGetByFloorId(projectId: string, countryId: string, areaId: string, buildingId: string, floorId: string) {
    this.device.getDevicesByFloor(projectId, countryId, areaId, buildingId, floorId).subscribe({
      next: (res: any) => {
        this.floorDevices = res;

        // clear other device arrays
        this.projectDevices = [];
        this.countryDevices = [];
        this.areaDevices = [];
        this.buildingDevices = [];

        this.activeLevel = 'floor';
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading devices by floor");
      }
    });
  }

  zoneDevices: any[] = [];

  // devicesGetByZoneId(
  //   projectId: string,
  //   countryId: string,
  //   areaId: string,
  //   buildingId: string,
  //   floorId: string,
  //   zoneId: string
  // ) {
  //   this.device.getDevicesByZone(projectId, countryId, areaId, buildingId, floorId, zoneId).subscribe({
  //     next: (res: any) => {
  //       this.zoneDevices = res;
  //       this.projectDevices = [];
  //       this.countryDevices = [];
  //       this.areaDevices = [];
  //       this.buildingDevices = [];
  //       this.floorDevices = [];
  //       this.activeLevel = 'zone';
  //       this.cdr.detectChanges();
  //     },
  //     error: () => {
  //       console.log("Error loading devices by zone");
  //     }
  //   });
  // }
  devicesGetByZoneId(
    projectId: string,
    countryId: string,
    areaId: string,
    buildingId: string,
    floorId: string,
    zoneId: string
  ) {
    this.device.getDevicesByZone(projectId, countryId, areaId, buildingId, floorId, zoneId).subscribe({
      next: (res: any) => {
        this.zoneDevices = (Array.isArray(res) ? res : []).map(d => ({
          id: d.id,
          deviceName: d.deviceName,
          deviceUniqueId: d.deviceUniqueId  // ✅
        }));
        this.activeLevel = 'zone';
        this.cdr.detectChanges();
      },
      error: (err) => console.error('❌ Error loading devices by zone:', err)
    });
  }



  selectedDeviceId: string = '';
  deviceParameters: any[] = []; // holds API response parameters
  selectedParameters: Set<string> = new Set(); // to track checked boxes



  selectDevice(device: any) {
    this.selectedDeviceId = device.id;
    this.loadDeviceParametersByDevice(device.id);
  }


  loadDeviceParametersByDevice(deviceId: string) {
    this.device.getDeviceParametersByDeviceId(deviceId).subscribe({
      next: (res: any) => {
        if (res && res.length > 0) {
          this.deviceParameters = res[0].deviceParameters || [];
        } else {
          this.deviceParameters = [];
        }
        this.cdr.detectChanges();
        console.log('Loaded Parameters:', this.deviceParameters);
      },
      error: (err) => {
        console.error('Error loading device parameters:', err);
        this.deviceParameters = [];
      }
    });
  }


  // toggleParameterSelection(param: any) {
  //   if (this.selectedParameters.has(param.id)) {
  //     this.selectedParameters.delete(param.id);
  //   } else {
  //     this.selectedParameters.add(param.id);
  //   }

  //   console.log('Selected Parameters:', Array.from(this.selectedParameters));
  // }
  toggleParameterSelection(param: any) {
    if (this.selectedParameters.has(param.id)) {
      this.selectedParameters.delete(param.id);
    } else {
      if (this.selectedParameters.size >= 3) {
        alert('⚠️ You can select a maximum of 3 parameters only.');
        return;
      }
      this.selectedParameters.add(param.id);
    }

    console.log('Selected Parameters:', Array.from(this.selectedParameters));
  }




  widgets: any[] = [];



  // loadZoneSensors() {
  //   this.device.getAllZoneSensors().subscribe(
  //     (response: any) => {
  //       const dataArray = Array.isArray(response) ? response : [response];

  //       // ✅ Step 1: Flatten all zoneSensors from all zones
  //       const allSensors = dataArray.flatMap(zone => zone.zoneSensors || []);

  //       // ✅ Step 2: Group sensors by deviceId (avoid duplicates)
  //       const deviceMap = new Map<string, any>();

  //       for (const sensor of allSensors) {
  //         if (!deviceMap.has(sensor.deviceId)) {
  //           deviceMap.set(sensor.deviceId, {
  //             deviceId: sensor.deviceId,
  //             deviceName: sensor.deviceName,
  //             params: new Set<string>()
  //           });
  //         }

  //         const current = deviceMap.get(sensor.deviceId);
  //         (sensor.params || []).forEach((p: any) => current.params.add(p.paramName));
  //       }

  //       // ✅ Step 3: Convert grouped data to widget array
  //       this.widgets = Array.from(deviceMap.values()).map(d => ({
  //         deviceName: d.deviceName,
  //         params: Array.from(d.params)
  //       }));

  //       console.log('🟢 Widgets:', this.widgets);
  //       this.cdr.detectChanges();
  //     },
  //     (error) => {
  //       console.error('❌ Error fetching zone sensors:', error);
  //     }
  //   );
  // }



  getDeviceNameById(deviceId: string): string {
    const allDevices = [
      ...this.projectDevices,
      ...this.countryDevices,
      ...this.areaDevices,
      ...this.buildingDevices,
      ...this.floorDevices,
      ...this.zoneDevices
    ];
    const device = allDevices.find(d => d.id === deviceId);
    return device ? device.deviceName : '';
  }



  selectedDeviceName: string = '';

  // onDeviceCheckboxChange(event: any, device: any) {
  //   if (event.target.checked) {
  //     // ✅ When checkbox is checked
  //     this.selectedDeviceId = device.id;
  //     this.selectedDeviceName = device.deviceName;

  //     console.log("✅ Selected Device:", device.deviceName);
  //     this.loadDeviceParametersByDevice(device.id);
  //   } else {
  //     // ✅ When checkbox is unchecked
  //     if (this.selectedDeviceId === device.id) {
  //       this.selectedDeviceId = '';
  //       this.selectedDeviceName = '';
  //     }
  //   }
  // }
  selectedDeviceUniqueId: string = ''; // ✅ Add this property at the top of your component

  onDeviceCheckboxChange(event: any, device: any) {
    if (event.target.checked) {
      // ✅ When checkbox is checked
      this.selectedDeviceId = device.id;
      this.selectedDeviceName = device.deviceName;
      this.selectedDeviceUniqueId = device.deviceUniqueId || device.uniqueId || ''; // ✅ CAPTURE UNIQUE ID

      console.log("✅ Selected Device:", {
        id: this.selectedDeviceId,
        name: device.deviceName,
        uniqueId: this.selectedDeviceUniqueId // ✅ LOG IT
      });

      this.loadDeviceParametersByDevice(device.id);
    } else {
      // ✅ When checkbox is unchecked
      if (this.selectedDeviceId === device.id) {
        this.selectedDeviceId = '';
        this.selectedDeviceName = '';
        this.selectedDeviceUniqueId = ''; // ✅ CLEAR UNIQUE ID
      }
    }
  }

  resetDeviceSelection() {
    this.selectedDeviceId = '';
    this.selectedDeviceName = '';
    this.deviceParameters = [];
  }





  // createWidgets() {
  //   if (!this.selectedDeviceId || this.selectedParameters.size === 0) {
  //     alert("Please select at least one device and one parameter.");
  //     return;
  //   }

  //   const selectedDeviceName = this.getDeviceNameById(this.selectedDeviceId);

  //   const selectedParams = Array.from(this.selectedParameters)
  //     .map(paramId => this.deviceParameters.find(p => p.id === paramId))
  //     .filter(p => !!p)
  //     .map(p => ({
  //       paramId: p!.id,
  //       paramName: p!.name
  //     }));

  //   // UI widget data
  //   this.widgets = [
  //     {
  //       deviceName: selectedDeviceName,
  //       params: selectedParams
  //     }
  //   ];

  //   // ✅ New API Payload (matches your updated request body)
  //   const payload = {
  //     id: "",

  //     projectId: this.selectedProjectId,
  //     countryId: this.selectedCountryId,
  //     areaId: this.selectedAreaId,
  //     buildingId: this.selectedBuildingId,
  //     floorId: this.selectedFloorId,

  //     // ✅ Zone (mapped from floor)
  //     zoneId: this.selectedFloorId ?? "",
  //     zone: "",

  //     // ✅ Dashboard (from selectedDashboard object)
  //     dashboardId: this.selectedDashboard?.id ?? "",
  //     dashboardName: this.selectedDashboard?.name ?? "",

  //     zoneSensors: [
  //       {
  //         deviceId: this.selectedDeviceId,
  //         deviceName: selectedDeviceName,
  //         params: selectedParams
  //       }
  //     ],

  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString()
  //   };


  //   console.log("🟢 Zone Sensor Payload:", payload);

  //   this.device.createZoneSensor(payload).subscribe({
  //     next: (res) => {
  //       console.log("✅ ZoneSensor Created Successfully:", res);

  //       // ✅ CLOSE POPUP FIRST
  //       this.closeAddWidgetPopup();
  //       // ✅ REFRESH DASHBOARD WIDGETS IMMEDIATELY
  //       if (this.selectedDashboard?.id) {
  //         this.loadDashboardContent(this.selectedDashboard.id);
  //       }

  //       // ✅ OPTIONAL: show alert AFTER UI updates
  //       setTimeout(() => {
  //         alert("Zone Sensor created successfully!");
  //       }, 0);
  //     },
  //     error: (err) => {
  //       console.error("❌ Error creating zone sensor:", err);
  //       alert("Failed to create zone sensor");
  //     }
  //   });

  // }


  createWidgets() {
    if (!this.selectedDeviceId || this.selectedParameters.size === 0) {
      alert("Please select at least one device and one parameter.");
      return;
    }

    // ✅ ADD THIS DEBUG LOG
    console.log('🔍 Creating widget with:', {
      deviceId: this.selectedDeviceId,
      deviceName: this.selectedDeviceName,
      deviceUniqueId: this.selectedDeviceUniqueId  // ✅ Check this value
    });

    const selectedDeviceName = this.getDeviceNameById(this.selectedDeviceId);
    const selectedParams = Array.from(this.selectedParameters)
      .map(paramId => this.deviceParameters.find(p => p.id === paramId))
      .filter(p => !!p)
      .map(p => ({
        paramId: p!.id,
        paramName: p!.name
      }));

    this.widgets = [
      {
        deviceName: selectedDeviceName,
        params: selectedParams
      }
    ];

    const payload = {
      id: "",
      projectId: this.selectedProjectId,
      countryId: this.selectedCountryId,
      areaId: this.selectedAreaId,
      buildingId: this.selectedBuildingId,
      floorId: this.selectedFloorId,
      zoneId: this.selectedFloorId ?? "",
      zone: "",
      dashboardId: this.selectedDashboard?.id ?? "",
      dashboardName: this.selectedDashboard?.name ?? "",
      zoneSensors: [
        {
          deviceId: this.selectedDeviceId,
          deviceName: selectedDeviceName,
          deviceUniqueId: this.selectedDeviceUniqueId, // ✅ THIS SHOULD HAVE VALUE NOW
          params: selectedParams
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log("🟢 Final Zone Sensor Payload:", payload);
    console.log("🔍 DeviceUniqueId in payload:", payload.zoneSensors[0].deviceUniqueId); // ✅ VERIFY

    this.device.createZoneSensor(payload).subscribe({
      next: (res) => {
        console.log("✅ ZoneSensor Created Successfully:", res);
        this.closeAddWidgetPopup();

        if (this.selectedDashboard?.id) {
          this.loadDashboardContent(this.selectedDashboard.id);
        }

        setTimeout(() => {
          alert("Zone Sensor created successfully!");
        }, 0);
      },
      error: (err) => {
        console.error("❌ Error creating zone sensor:", err);
        alert("Failed to create zone sensor");
      }
    });
  }
  resetPopupData() {
    // Clear selected items
    this.selectedItemId = "";
    this.selectedDeviceId = "";
    this.selectedParameters = new Set();

    // Clear device lists
    this.projectDevices = [];
    this.countryDevices = [];
    this.areaDevices = [];
    this.buildingDevices = [];
    this.floorDevices = [];
    this.zoneDevices = [];
    this.deviceParameters = [];

    // Clear expansions
    this.expandedProjects.clear();
    this.expandedCountry.clear();
    this.expandedArea.clear();
    this.expandedBuilding.clear();
    this.expandedFloor.clear();
    this.expandedZone.clear();

    // Clear nested data
    this.countriesByProject = {};
    this.areaByCountry = {};
    this.buildingByArea = {};
    this.floorByBuilding = {};
    this.zoneByFloor = {};
    this.subZoneByZone = {};

    // Reset active level
    this.activeLevel = null;
  }


  private ws!: WebSocket;
  private wsUrl = 'ws://172.16.100.29:5202/ws/ZoneCount';

   //private wsUrl = 'wss://phcc.purpleiq.ai/ws/ZoneCount';

  ngOnDestroy() {
    if (this.ws) this.ws.close();


    if (this.deviceNotificationWs) {
      this.deviceNotificationWs.close();
    }
    if (this.alertIntervalId) {
      clearInterval(this.alertIntervalId);
    }
  }



  loadZoneSensors() {

    this.device.getAllZoneSensors().subscribe(
      (response: any) => {
        const dataArray = Array.isArray(response) ? response : [response];

        // Attach mainId to every zonesensor
        const allSensors = dataArray.flatMap(zone =>
          (zone.zoneSensors || []).map((sensor: any) => ({
            ...sensor,
            mainId: zone.id     // <-- ADD mainId from parent
          }))

        );


        const deviceMap = new Map<string, any>();

        for (const sensor of allSensors) {
          if (!deviceMap.has(sensor.deviceId)) {
            deviceMap.set(sensor.deviceId, {
              deviceId: sensor.deviceId,
              deviceName: sensor.deviceName,
              mainId: sensor.mainId,    // <-- ADD mainId HERE
              params: sensor.params.map((p: any) => ({
                name: p.paramName,
                value: '-'  // your default logic remains
              }))
            });
          }
        }

        this.widgets = Array.from(deviceMap.values());
        this.cdr.detectChanges();
      },
      (error) => console.error('❌ Error fetching zone sensors:', error)
    );
  }


  convertToDubaiTime(utcTimestamp: string): string {
    if (!utcTimestamp) return '—';
    try {
      return new Date(utcTimestamp).toLocaleString('en-GB', {
        timeZone: 'Asia/Dubai',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return utcTimestamp;
    }
  }





  connectWebSocket() {
    console.log("🚀 connectWebSocket() called");

    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(this.wsUrl);

    // -------------------------
    // ON OPEN
    // -------------------------
    this.ws.onopen = () => {
      console.log("✅ WebSocket Connected");
      this.widgets.forEach((widget: any) => {
        const statusParam = widget.params?.find(
          (p: any) => p.name.toLowerCase() === 'status'
        );
        if (statusParam) {
          statusParam.value = 'offline';
        }
      });
      this.cdr.detectChanges();
    };

    // -------------------------
    // ON MESSAGE
    // -------------------------
    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        // ✅ Empty array → reset all widgets
        if (Array.isArray(data) && data.length === 0) {
          console.log("📭 Empty update received. Setting AssetCount = 0");
          this.widgets.forEach((widget: any) => {
            const countParam = widget.params?.find(
              (p: any) => p.name.toLowerCase().includes('asset')
            );
            const statusParam = widget.params?.find(
              (p: any) => p.name.toLowerCase() === 'status'
            );
            if (countParam) countParam.value = 0;
            if (statusParam) statusParam.value = 'Inactive';
          });
          this.cdr.detectChanges();
          return;
        }

        const updates = Array.isArray(data) ? data : [data];

        updates.forEach((update: any) => {

          // ─── MATCH BY ZoneId (Gateway widgets) ──────────────
          if (update.ZoneId !== undefined) {
            const wsZoneId = (update.ZoneId || '').trim().toUpperCase();
            const count = update.Count ?? 0;
            console.log("📨 WS Zone Update:", wsZoneId, count);

            const widget = this.widgets.find((w: any) => {
              const deviceUniqueId = (w.deviceUniqueId || '').trim().toUpperCase();
              return deviceUniqueId === wsZoneId;
            });

            if (widget && widget.params) {
              // Update Zone Name
              const zoneParam = widget.params.find(
                (p: any) => p.name.toLowerCase().includes('zone')
              );
              if (zoneParam) {
                zoneParam.value = widget.deviceName || update.ZoneId;
              }

              // Update Asset Count
              const countParam = widget.params.find(
                (p: any) => p.name.toLowerCase().includes('asset')
              );
              if (countParam) {
                countParam.value = count;
              }

              // Update Status
              const statusParam = widget.params.find(
                (p: any) => p.name.toLowerCase() === 'status'
              );
              if (statusParam) {
                statusParam.value = count > 0 ? 'Active' : 'Inactive';
              }

              console.log(`✅ Widget updated for ZoneId ${wsZoneId}`);
            } else {
              console.warn("⚠️ No matching widget for ZoneId:", wsZoneId);
            }
          }

          // ─── MATCH BY tagId (Robot/GPS widgets) ─────────────
          if (update.tagId !== undefined) {
            const wsTagId = (update.tagId || '').trim();
            console.log("📨 WS Tag Update:", wsTagId);

            const widget = this.widgets.find((w: any) => {
              const deviceUniqueId = (w.deviceUniqueId || '').trim();
              return deviceUniqueId === wsTagId;
            });

            if (widget && widget.params) {
              // Update Timestamp
              const timestampParam = widget.params.find(
                (p: any) => p.name.toLowerCase().includes('timestamp')
              );
              // if (timestampParam) {
              //   timestampParam.value = update.Gsmtimestamp || update.timestamp || '—';
              // }
              if (timestampParam) {
                // ✅ Convert to Dubai time
                timestampParam.value = this.convertToDubaiTime(
                  update.Gsmtimestamp || update.timestamp
                );
              }

              // Update Latitude
              const latParam = widget.params.find(
                (p: any) => p.name.toLowerCase().includes('lat')
              );
              if (latParam) {
                latParam.value = update.latitude ?? '—';
              }

              // Update Longitude
              const lngParam = widget.params.find(
                (p: any) => p.name.toLowerCase().includes('lon') ||
                  p.name.toLowerCase().includes('lng')
              );
              if (lngParam) {
                lngParam.value = update.longitude ?? '—';
              }

              console.log(`✅ Widget updated for tagId ${wsTagId}`);
            } else {
              console.warn("⚠️ No matching widget for tagId:", wsTagId);
            }
          }

          // ─── MATCH BY BleTagid (Asset widgets) ──────────────
          // if (update.BleTagid !== undefined) {
          //   const wsBleTagId = (update.BleTagid || '').trim().toUpperCase();
          //   console.log("📨 WS BLE Update:", wsBleTagId);

          //   const widget = this.widgets.find((w: any) => {
          //     const deviceUniqueId = (w.deviceUniqueId || '').trim().toUpperCase();
          //     return deviceUniqueId === wsBleTagId;
          //   });

          //   if (widget && widget.params) {
          //     // ✅ Update Zone Name — display as device name
          //     const zoneParam = widget.params.find(
          //       (p: any) => p.name.toLowerCase().includes('zone')
          //     );
          //     if (zoneParam) {
          //       zoneParam.value = widget.deviceName || '—';
          //     }

          //     // ✅ Update Timestamp — from checkintime
          //     const timestampParam = widget.params.find(
          //       (p: any) => p.name.toLowerCase().includes('timestamp')
          //     );
          //     if (timestampParam) {
          //       timestampParam.value = update.checkintime || update.Gsmtimestamp || '—';
          //     }

          //     // ✅ Update Status
          //     const statusParam = widget.params.find(
          //       (p: any) => p.name.toLowerCase() === 'status'
          //     );
          //     if (statusParam) {
          //       statusParam.value = update.checkintime ? 'Active' : 'Inactive';
          //     }

          //     console.log(`✅ Widget updated for BleTagid ${wsBleTagId}:`, update.checkintime);
          //   } else {
          //     console.warn("⚠️ No matching widget for BleTagid:", wsBleTagId);
          //   }
          // }

          // ─── MATCH BY BleTagid (Asset widgets) ──────────────
          if (update.BleTagid !== undefined) {
            const wsBleTagId = (update.BleTagid || '').trim().toUpperCase();
            console.log("📨 WS BLE Update:", wsBleTagId);

            const widget = this.widgets.find((w: any) => {
              const deviceUniqueId = (w.deviceUniqueId || '').trim().toUpperCase();
              return deviceUniqueId === wsBleTagId;
            });

            if (widget && widget.params) {

              // ✅ Find the Gateway widget whose deviceUniqueId === WS zoneId
              // e.g. zoneId: "AC233FC2280F" → matches "Gate Out Reader" widget
              const wsZoneId = (update.zoneId || update.ZoneId || '').trim().toUpperCase();

              const gatewayWidget = this.widgets.find((w: any) => {
                const deviceUniqueId = (w.deviceUniqueId || '').trim().toUpperCase();
                return deviceUniqueId === wsZoneId;
              });

              // ✅ Update ZoneName — use matched gateway widget's deviceName
              const zoneParam = widget.params.find(
                (p: any) => p.name.toLowerCase().includes('zone')
              );
              if (zoneParam) {
                zoneParam.value = gatewayWidget?.deviceName || wsZoneId || '—';
                console.log(`✅ ZoneName set to: ${zoneParam.value}`);
              }

              // ✅ Update Timestamp — from checkintime
              const timestampParam = widget.params.find(
                (p: any) => p.name.toLowerCase().includes('timestamp')
              );
              // if (timestampParam) {
              //   timestampParam.value = update.checkintime || update.Gsmtimestamp || '—';
              // }
              if (timestampParam) {
                // ✅ Convert to Dubai time
                timestampParam.value = this.convertToDubaiTime(
                  update.checkintime || update.Gsmtimestamp
                );
              }

              // ✅ Update Status
              const statusParam = widget.params.find(
                (p: any) => p.name.toLowerCase() === 'status'
              );
              if (statusParam) {
                statusParam.value = update.checkintime ? 'Active' : 'Inactive';
              }

              console.log(`✅ Widget updated for BleTagid ${wsBleTagId}:`, update.checkintime);
            } else {
              console.warn("⚠️ No matching widget for BleTagid:", wsBleTagId);
            }
          }

        });

        this.cdr.detectChanges();

      } catch (error) {
        console.error("❌ WebSocket Parse Error:", error);
      }
    };

    // -------------------------
    // ON ERROR
    // -------------------------
    this.ws.onerror = (error) => {
      console.error("❌ WebSocket Error:", error);
    };

    // -------------------------
    // ON CLOSE (Auto Reconnect)
    // -------------------------
    // this.ws.onclose = () => {
    //   console.warn("🔌 WebSocket Disconnected. Reconnecting in 2 seconds...");
    //   setTimeout(() => {
    //     this.connectWebSocket();
    //   }, 2000);
    // };
  }

  selectedWidgetId = ""
  showDeleteWidjet: boolean = false;
  cancelDelete() {
    this.showDeleteWidjet = false;
  }
  openDeleteWidget(widget: any) {
    // this.selectedWidgetId = widget.mainId;
    this.selectedWidgetId = widget.widgetId;
    this.showDeleteWidjet = true;

  }
  deleteWidget() {
    const deletedId = this.selectedWidgetId;

    this.device.deleteDashboardWidget(deletedId).subscribe({
      next: () => {
        alert("Deleted successfully");

        // ✅ REMOVE FROM UI IMMEDIATELY
        this.widgets = this.widgets.filter(
          w => w.widgetId !== deletedId
        );

        this.showDeleteWidjet = false;
        this.cdr.detectChanges();
      },
      error: (err) => {

        // backend returns 200 but empty body
        if (err.status === 200 || err.status === 204) {
          this.widgets = this.widgets.filter(
            w => w.widgetId !== deletedId
          );

          alert("Deleted successfully");
          this.showDeleteWidjet = false;
          this.cdr.detectChanges();
          return;
        }

        alert("Error deleting widget");
      }
    });
  }


  showPopup: boolean = false;
  dashboardName: string = "";

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    // console.log("Popup closing...");
    this.showPopup = false;
    this.dashboardName = "";
  }

  createDashboard() {



    if (!this.dashboardName.trim()) {
      alert("Please enter a dashboard name");
      return;
    }

    this.role.CreateDashboardName(this.dashboardName).subscribe({
      next: (res) => {
        console.log("Created:", res);
        this.closePopup();   // <-- closes immediately
        alert("Dashboard Created Successfully!");
        this.loadDashboard();
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error("Error:", err);
        alert("Failed to create dashboard!");
      }
    });
    this.showPopup = false;
  }







  dashboardData: any;

  loadDashboard() {
    this.role.getDashboard(1).subscribe({
      next: (res) => {
        this.dashboardData = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error loading dashboard", err);
      }
    });
  }








  deleteDashboard(item: any) {
    if (!item.id) {
      console.error("Dashboard ID not found");
      return;
    }

    this.role.DeleteDashboard(item.id).subscribe({
      next: () => {
        console.log("Dashboard deleted:", item.id);

        // Remove from UI instantly
        this.dashboardData = this.dashboardData.filter(
          (d: any) => d.id !== item.id
        );
      },
      error: (err) => {
        console.error("Error deleting dashboard:", err);
      }
    });
  }




  showDeletePopup: boolean = false;
  selectedItem: any = null;



  openDeletePopup(item: any) {
    this.selectedItem = item;   // store dashboard
    this.showDeletePopup = true;  // show popup
  }


  cancelDashboardDelete() {
    this.showDeletePopup = false;
    this.selectedItem = null;
  }



  confirmDeleteDashboard() {
    if (!this.selectedItem?.id) return;

    this.role.DeleteDashboard(this.selectedItem.id).subscribe({
      next: () => {

        alert("Dashboard deleted successfully");

        this.dashboardData = this.dashboardData.filter(
          (d: any) => d.id !== this.selectedItem.id
        );

        this.showDeletePopup = false;
        this.selectedItem = null;

        this.cdr.detectChanges();
        this.loadDashboard();
      },
      error: (err) => {
        console.error("Error deleting dashboard:", err);
      }
    });
  }






  selectedDashboard: any = null;



  getDashboards() {
    this.role.getDashboard(this.role).subscribe((res: any) => {

      // ✅ ensure array
      this.dashboardData = res || [];

      // ✅ auto select first dashboard
      if (this.dashboardData.length > 0) {
        this.selectDashboard(this.dashboardData[0]);
      }
    });
  }





  selectDashboard(item: any) {
    this.selectedDashboard = item;
    this.activeDashboardName = item.name;
    // ✅ pass dashboard ID
    this.loadDashboardContent(item.id);
    this.loadPersonalWidgets(item.id);
  }



  activeDashboardId: string = '';
  // widgets: any[] = [];

  loadDashboardContent(dashboardId: string) {
    console.log('Loading dashboard content for ID:', dashboardId);

    this.activeDashboardId = dashboardId;


    this.role.getDashboardID(dashboardId).subscribe({
      next: (res: any) => {
        const data = res as any[];



        // this.widgets = data
        //   .filter(d => d.dashboardId === dashboardId)
        //   .flatMap(d =>
        //     d.zoneSensors.map((sensor: any) => ({
        //       widgetId: d.id,                // ✅ REQUIRED
        //       deviceId: sensor.deviceId,
        //       deviceName: sensor.deviceName,
        //        deviceUniqueId: sensor.deviceUniqueId,
        //       params: sensor.params.map((p: any) => ({
        //         name: p.paramName,
        //         value: '-'
        //       }))
        //     }))
        //   );
        this.widgets = data
          .filter(d => d.dashboardId === dashboardId)
          .flatMap(d =>
            d.zoneSensors.map((sensor: any) => ({
              widgetId: d.id,
              deviceId: sensor.deviceId,
              deviceName: sensor.deviceName,
              deviceUniqueId: sensor.deviceUniqueId,  // ✅ ADD THIS LINE
              params: sensor.params.map((p: any) => ({
                name: p.paramName,
                value: '-'
              }))
            }))
          );


        this.cdr.detectChanges();
        this.connectWebSocket();
      },
      error: (err) => {
        this.widgets = [];
      }
    });

  }






  activeTab: string = 'zone';
  deviceCounts: { [deviceUniqueId: string]: number } = {};
  getDeviceCount(deviceUniqueId: string): number {
    if (!deviceUniqueId) return 0;
    const normalizedId = deviceUniqueId.toUpperCase();
    return this.deviceCounts[normalizedId] || 0;
  }
  onTabClick(tabname: string) {
    this.activeTab = tabname;

    switch (tabname) {
      case 'zone':
        break;
      case 'system':
        break;

    }

  }

  activeDashboardName: string = '';
  addClockWidget() {

    if (!this.activeDashboardId) {
      return;
    }

    const payload = {
      dashboard_Id: this.activeDashboardId,
      dashboardName: this.activeDashboardName || '',
      duration: 0,
      timeRange: 'Today',
      personals: [
        {
          isSelected: true,
          personalWidgetid: "",          // ✅ auto-generated by backend
          personalWidgetName: 'Clock Widget'
        }
      ]
    };

    this.widget.createDashboard(payload).subscribe({
      next: (res: any) => {
        alert("Clock Widget Created Successfully")
        this.closeAddWidgetPopup();
        this.loadPersonalWidgets(this.activeDashboardId);
      },
      error: err => {
        console.error('Clock widget add failed', err);
      }
    });
  }


  personalWidgets: any[] = [];

  loadPersonalWidgets(dashboardId: string) {
    this.widget.getPersonalDashboard(dashboardId).subscribe({
      next: (res: any) => {
        this.personalWidgets = res.personals || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.personalWidgets = [];
      }
    });
  }



  showClockWidgetDeletePopup: boolean = false;



  selectedWidgetidToDelete: string = "";

  selectedDashboardId: string = '';

  openClockDeletePopup(widgetid: string, dashboardId: string) {

    this.showClockWidgetDeletePopup = true;
    this.selectedWidgetidToDelete = widgetid;
    this.selectedDashboardId = dashboardId;

  }

  closeClockDeletePopup() {
    this.showClockWidgetDeletePopup = false;
  }

  deleteClockWidget() {
    this.widget.deleteClockWidget(this.selectedWidgetidToDelete, this.selectedDashboardId).subscribe({
      next: (res: any) => {
        alert(res.message);
        this.closeClockDeletePopup();
        this.loadPersonalWidgets(this.activeDashboardId);


      },
      error: () => {
        console.log("error deleting clock widget")
      }
    })
  }



  // ─── Device Notification WS Properties ───────────────
  deviceNotificationWs!: WebSocket;
  offlineAlerts: { deviceId: string; deviceName: string; description: string; timestamp: string }[] = [];

  alertIntervalId: any = null;
  lastAlertTimeMap: { [deviceId: string]: number } = {};

  connectDeviceNotificationWS() {
    if (this.deviceNotificationWs) {
      this.deviceNotificationWs.close();
    }

    //this.deviceNotificationWs = new WebSocket('wss://phcc.purpleiq.ai/ws/DeviceNotification');
     this.deviceNotificationWs = new WebSocket('ws://172.16.100.29:5202/ws/DeviceNotification');

    this.deviceNotificationWs.onopen = () => {
      console.log('✅ Device Notification WS Connected');
    };

    this.deviceNotificationWs.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        const updates = Array.isArray(data) ? data : [data];

        updates.forEach((update: any) => {
          if (!update.DeviceId) return;

          console.log(`📡 Device ${update.DeviceId} → ${update.Status}`);

          // ✅ Only process offline status
          if (update.Status?.toLowerCase() === 'offline') {
            this.handleOfflineAlert({
              deviceId: update.DeviceId,                        // ✅ add deviceId
              deviceName: update.DeviceName || update.DeviceId,
              description: update.Description || 'Device went offline',
              timestamp: update.Timestamp || new Date().toISOString()
            });
          }
          // ✅ Online — no alert needed
        });

        this.cdr.detectChanges();
      } catch (err) {
        console.error('❌ Device Notification WS parse error', err);
      }
    };

    this.deviceNotificationWs.onclose = () => {
      console.warn('🔌 Device Notification WS Closed. Reconnecting in 2s...');
      setTimeout(() => this.connectDeviceNotificationWS(), 2000);
    };

    this.deviceNotificationWs.onerror = (err) => {
      console.error('❌ Device Notification WS Error', err);
    };
  }


  handleOfflineAlert(alert: { deviceId: string; deviceName: string; description: string; timestamp: string }) {
    const now = Date.now();
    const fiveSeconds = 5 * 1000;

    const lastTime = this.lastAlertTimeMap[alert.deviceId] || 0;

    if (now - lastTime >= fiveSeconds) {
      // ✅ Update per-device timer
      this.lastAlertTimeMap[alert.deviceId] = now;
      this.showOfflineAlert(alert);
    } else {
      const remaining = Math.ceil((fiveSeconds - (now - lastTime)) / 1000);
      console.log(`⏳ Alert suppressed for ${alert.deviceId}. Next in ${remaining}s`);
    }
  }

  // ─── Alert State ─────────────────────────────────────
  showOfflineAlertBox: boolean = false;
  currentOfflineAlert: {
    deviceId: string;      // ✅ add deviceId
    deviceName: string;
    description: string;
    timestamp: string
  } | null = null;

showOfflineAlert(alert: { deviceId: string; deviceName: string; description: string; timestamp: string }) {
  // ✅ Add to queue — avoid duplicate deviceId
  const exists = this.offlineAlerts.find(a => a.deviceId === alert.deviceId);
  if (!exists) {
    this.offlineAlerts.push(alert);
  } else {
    // Update existing
    Object.assign(exists, alert);
  }
  this.showOfflineAlertBox = true;
  console.log('🚨 Offline Alerts:', this.offlineAlerts.length);
  this.cdr.detectChanges();
}

closeOfflineAlert(deviceId: string) {
  // ✅ Remove specific device alert
  this.offlineAlerts = this.offlineAlerts.filter(a => a.deviceId !== deviceId);
  if (this.offlineAlerts.length === 0) {
    this.showOfflineAlertBox = false;
  }
  this.cdr.detectChanges();
}
closeAllAlerts() {
  this.offlineAlerts = [];
  this.showOfflineAlertBox = false;
  this.cdr.detectChanges();
}


}