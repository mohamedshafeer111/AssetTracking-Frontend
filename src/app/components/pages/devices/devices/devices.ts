import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Peopletype } from '../../../service/peopletype/peopletype';
import { FormsModule } from '@angular/forms';
import { Roleservice } from '../../../service/role/roleservice';
import { forkJoin } from 'rxjs';
import { DevicesearchPipe } from '../../../pipe/devicesearch/devicesearch-pipe';
import { Reusabletable } from '../../reusabletable/reusabletable/reusabletable';

@Component({
  selector: 'app-devices',
  imports: [RouterModule, CommonModule, FormsModule, DevicesearchPipe, Reusabletable],
  templateUrl: './devices.html',
  styleUrl: './devices.css'
})


export class Devices implements OnInit {
  ngOnInit(): void {
    // ✅ Load initial data here
    // this.loadDeviceTypes();
    this.loadDevices();
    this.loadDeviceTypes();
    this.loadDeviceParameters()




    //from project component 
    this.loadProject();
  }
  constructor(private deviceService: Peopletype, private cdr: ChangeDetectorRef, private role: Roleservice) { }





  activeTab: string = 'device';
  deviceList: any[] = [];
  searchText: string = '';



  deviceColumns = [
    { header: 'Device Type', field: 'deviceType' },
    { header: 'Device Name', field: 'deviceName' },
    { header: 'Unique ID', field: 'uniqueId' },
    { header: 'Model', field: 'model' },
    { header: 'Project', field: 'projectName' },
    { header: 'Country', field: 'countryName' },
    { header: 'Area', field: 'areaName' },
    { header: 'Outdoor Zone', field: 'outdoorZoneName' },
    { header: 'Building', field: 'buildingName' },
    { header: 'Floor', field: 'floorName' },
    { header: 'Zone', field: 'zoneName' },
    { header: 'Technology', field: 'technology' },
    { header: 'Status', field: 'status', type: 'status' },
    { header: 'Action', type: 'action' }
  ];

  // keep your existing list
  deviceData = this.deviceList;

  // handle actions
  handleDeviceAction(event: any) {
    if (event.type === 'edit') {
      this.openEditDevicePopup(event.row);
    } else {
      this.openDeleteDevicePopup(event.row);
    }
  }
  deviceTypeColumns = [
    { header: 'Device Type', field: 'deviceType' },
    { header: 'Description', field: 'description' },
    { header: 'Status', field: 'status', type: 'status' },
    { header: 'Action', type: "action" }
  ]

  handleDeviceTypeAction(event: any) {
    if (event.type === 'edit') {
      this.openEditDeviceTypePopup(event.row);
    } else {
      this.openDeleteDeviceTypePopup(event.row);
    }

  }

  paraColumns = [
    { header: 'Device Name', field: 'deviceName' },
    { header: 'Parameters', field: 'parameterNames' },
    { header: 'Actions', type: 'action' }
  ]

  handleParaTypeAction(events:any) {
    if (events.type === 'edit') {
      this.openUpdatePara(events.row);
    } else {
      this.openDeletePara(events.row);
    }

  }
  setActive(tab: string) {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }
















  openAddDevice = false;

  // Add this property at the top
  outdoorZonesByArea: { [key: string]: any[] } = {};

  createDevice: any = {
    deviceType: '',
    uniqueId: '',
    model: '',
    project: '',
    deviceName: '',
    country: '',
    area: '',
    outdoorZoneName: '', // This is what we'll send to API
    building: '',
    floor: '',
    zone: '',
    technology: '',
    status: false
  };



  devices: any[] = [];


  openCreateDevicePopup() {
    this.openAddDevice = true;

    // Reset all device fields
    this.createDevice = {
      deviceType: '',
      uniqueId: '',
      model: '',
      area: '',
      outdoorZoneName: '',
      building: '',
      floor: '',
      zone: '',
      deviceName: '',
      technology: '',
      status: false
    };

    // Reset project and country selections
    this.selectedProjectId = '';
    this.selectedCountryId = '';
  }



  closeCreateDevicePopup() {
    this.openAddDevice = false;
  }

  createNewDevice() {
    // 🔍 Step-by-step field validation
    if (!this.createDevice.deviceType) {
      alert("⚠️ Please select a Device Type.");
      return;
    }

    if (!this.createDevice.uniqueId?.trim()) {
      alert("⚠️ Please enter the Unique ID.");
      return;
    }


    const isDuplicate = this.deviceList.some(
      (d: any) =>
        d.uniqueId?.trim().toLowerCase() ===
        this.createDevice.uniqueId.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert("⚠️ This Unique ID already exists. Please use a different one.");
      return;
    }


    if (isDuplicate) {
      alert("⚠️ This Unique ID already exists. Please use a different one.");
      return;
    }




    if (!this.createDevice.deviceName?.trim()) {
      alert("⚠️ Please enter the Device Name.");
      return;
    }


    // if (!this.createDevice.model?.trim()) {
    //   alert("⚠️ Please enter the Model.");
    //   return;
    // }

    // if (!this.selectedProjectId) {
    //   alert("⚠️ Please select a Project.");
    //   return;
    // }

    // if (!this.selectedCountryId) {
    //   alert("⚠️ Please select a Country.");
    //   return;
    // }

    // if (!this.createDevice.area) {
    //   alert("⚠️ Please select an Area.");
    //   return;
    // }

    // if (!this.createDevice.building) {
    //   alert("⚠️ Please select a Building.");
    //   return;
    // }

    // if (!this.createDevice.floor) {
    //   alert("⚠️ Please select a Floor.");
    //   return;
    // }

    // if (!this.createDevice.zone) {
    //   alert("⚠️ Please select a Zone.");
    //   return;
    // }

    // ✅ Find related data objects for display names
    const projectObj = this.projects.find(p => p.id === this.selectedProjectId);
    const countryObj = (this.countriesByProject[this.selectedProjectId] || []).find(
      c => c.id === this.selectedCountryId
    );
    const areaObj = (this.areaByCountry[this.selectedCountryId] || []).find(
      a => a.id === this.createDevice.area
    );
    const buildingObj = (this.buildingByArea[this.createDevice.area] || []).find(
      b => b.id === this.createDevice.building
    );
    const floorObj = (this.floorByBuilding[this.createDevice.building] || []).find(
      f => f.id === this.createDevice.floor
    );
    const zoneObj = (this.zoneByFloor[this.createDevice.floor] || []).find(
      z => z.id === this.createDevice.zone
    );

    // ✅ Build the final request body
    const reqBody = {
      deviceType: this.createDevice.deviceType,
      uniqueId: this.createDevice.uniqueId,
      model: this.createDevice.model,

      projectId: this.selectedProjectId,
      projectName: projectObj?.projectName || "",

      countryId: this.selectedCountryId,
      countryName: countryObj?.countryName || "",

      areaId: this.createDevice.area,
      areaName: areaObj?.areaName || "",

      outdoorZoneName: this.createDevice.outdoorZoneName || "",

      buildingId: this.createDevice.building,
      buildingName: buildingObj?.buildingName || "",

      floorId: this.createDevice.floor,
      floorName: floorObj?.floorName || "",

      zoneId: this.createDevice.zone,
      zoneName: zoneObj?.zoneName || "",

      deviceName: this.createDevice.deviceName,
      technology: this.createDevice.technology || "",

      status: this.createDevice.status
    };

    console.log("🚀 Final Payload:", reqBody);

    // ✅ POST API call
    this.deviceService.createadddevice(reqBody).subscribe({
      next: (res: any) => {
        console.log("✅ Device created:", res);
        alert(res.message || "✅ Device created successfully!");
        this.openAddDevice = false;
        this.loadDevices(); // refresh list
      },
      error: (err: any) => {
        console.error("❌ Error creating device:", err);
        alert("❌ Failed to create device.");
      }
    });
  }


  technologyOptions: string[] = [
    'BLE GATEWAY',
    'BLE TAGS',
    'LORA',
    'QR BARCODE',
    'RFID',
    'Zigbee',
    'GSM',
    'WIFI',
    'VISUAL',
    'GPS'
  ];



  deviceSummary: any = {
    total: 0,
    active: 0,
    inactive: 0
  };
  deviceTypeOptions: string[] = [];

  // loadDevices(): void {
  //   this.deviceService.getaddDevices().subscribe({
  //     next: (res: any) => {
  //       this.deviceList = res.data ? res.data : res;

  //       console.log("Device List:", this.deviceList);

  //       // ✅ Build summary
  //       this.deviceSummary = {
  //         total: this.deviceList.length,
  //         active: this.deviceList.filter((d: any) => d.status === true).length,
  //         inactive: this.deviceList.filter((d: any) => d.status === false).length
  //       };




  //       // ✅ Extract unique deviceType values for dropdown
  //       this.deviceTypeOptions = [
  //         ...new Set(this.deviceList.map((d: any) => d.deviceType))
  //       ];

  //       console.log("Device Type Options:", this.deviceTypeOptions);
  //       //new up

  //       console.log("Device Summary:", this.deviceSummary);

  //       this.cdr.detectChanges();
  //     },
  //     error: (err: any) => {
  //       console.error("Error loading devices", err);
  //     }
  //   });
  // }


  loadDevices(): void {
    this.deviceService.getaddDevices().subscribe({
      next: (res: any) => {
        this.deviceList = res.data ? res.data : [];

        console.log("Device List:", this.deviceList);

        // ✅ Build summary
        this.deviceSummary = {
          total: this.deviceList.length,
          active: this.deviceList.filter((d: any) => d.status === true).length,
          inactive: this.deviceList.filter((d: any) => d.status === false).length
        };

        // ✅ Extract unique device types
        this.deviceTypeOptions = [
          ...new Set(this.deviceList.map((d: any) => d.deviceType))
        ];

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error("Error loading devices", err);
      }
    });
  }



  //update add device

  openEditDevice = false;

  editDevice: any = {
    id: '',
    deviceType: '',
    uniqueId: '',
    model: '',
    projectName: '',
    deviceName: '',
    countryName: '',
    areaName: '',
    outdoorZoneName: '',
    buildingName: '',
    floorName: '',
    zoneName: '',
    technology: '',
    status: true
  };


  // openEditDevicePopup(device: any) {
  //   console.log('🔍 Opening edit popup for device:', device);

  //   this.openEditDevice = true;

  //   // ✅ Initialize editDevice with actual device values
  //   this.editDevice = {
  //     id: device.id,
  //     deviceType: device.deviceType || '',
  //     uniqueId: device.uniqueId || '',
  //     model: device.model || '',
  //     deviceName: device.deviceName || '',
  //     technology: device.technology || '',
  //     status: device.status ?? true,
  //     project: '',
  //     country: '',
  //     area: '',
  //     outdoorZoneName: '',
  //     building: '',
  //     floor: '',
  //     zone: ''
  //   };

  //   // ✅ Find and set project ID
  //   const project = this.projects.find(p => p.projectName === device.projectName);

  //   if (!project) {
  //     console.error('❌ Project not found for:', device.projectName);
  //     this.cdr.detectChanges();
  //     return;
  //   }

  //   this.editDevice.project = project.id;
  //   this.selectedProjectId = project.id;

  //   // ✅ Load ALL hierarchical data using forkJoin (parallel loading)
  //   this.loadHierarchicalDataParallel(device, project.id);


  //   const isDuplicate = this.deviceList.some(
  //     (d: any) =>
  //       d.uniqueId?.trim().toLowerCase() ===
  //       this.editDevice.uniqueId.trim().toLowerCase() &&
  //       d.id !== this.editDevice.id   // 🔥 ignore current device
  //   );

  //   if (isDuplicate) {
  //     alert("⚠️ This Unique ID already exists for another device.");
  //     return;
  //   }


  // }

  // private loadHierarchicalDataParallel(device: any, projectId: string) {
  //   console.log('🌍 Starting parallel hierarchical data load');

  //   // Step 1: Load countries first
  //   this.role.countryGetById(projectId).subscribe({
  //     next: (countries: any) => {
  //       const countryArray = Array.isArray(countries) ? countries : [];
  //       this.countriesByProject[projectId] = countryArray;

  //       const country = countryArray.find((c: any) => c.countryName === device.countryName);

  //       if (!country) {
  //         console.error('❌ Country not found');
  //         this.cdr.detectChanges();
  //         return;
  //       }

  //       this.editDevice.country = country.id;
  //       this.selectedCountryId = country.id;
  //       console.log('✅ Set country ID:', this.editDevice.country);

  //       // Step 2: Load remaining hierarchy in parallel using forkJoin
  //       forkJoin({
  //         areas: this.role.getSummary(country.id),
  //       }).subscribe({
  //         next: (results: any) => {
  //           const areaArray = Array.isArray(results.areas) ? results.areas : [];
  //           this.areaByCountry[country.id] = areaArray;

  //           const area = areaArray.find((a: any) => a.areaName === device.areaName);

  //           if (!area) {
  //             console.error('❌ Area not found');
  //             this.cdr.detectChanges();
  //             return;
  //           }

  //           this.editDevice.area = area.id;
  //           console.log('✅ Set area ID:', this.editDevice.area);

  //           // Step 3: Load building, floor, zone in parallel
  //           forkJoin({
  //             buildings: this.role.getBuilding(area.id)
  //           }).subscribe({
  //             next: (buildingResults: any) => {
  //               const buildingArray = Array.isArray(buildingResults.buildings) ? buildingResults.buildings : [];
  //               this.buildingByArea[area.id] = buildingArray;

  //               const building = buildingArray.find((b: any) => b.buildingName === device.buildingName);

  //               if (!building) {
  //                 console.error('❌ Building not found');
  //                 this.cdr.detectChanges();
  //                 return;
  //               }

  //               this.editDevice.building = building.id;
  //               console.log('✅ Set building ID:', this.editDevice.building);

  //               // Step 4: Load floors and zones
  //               forkJoin({
  //                 floors: this.role.getFloor(building.id)
  //               }).subscribe({
  //                 next: (floorResults: any) => {
  //                   const floorArray = Array.isArray(floorResults.floors) ? floorResults.floors : [];
  //                   this.floorByBuilding[building.id] = floorArray;

  //                   const floor = floorArray.find((f: any) => f.floorName === device.floorName);

  //                   if (!floor) {
  //                     console.error('❌ Floor not found');
  //                     this.cdr.detectChanges();
  //                     return;
  //                   }

  //                   this.editDevice.floor = floor.id;
  //                   console.log('✅ Set floor ID:', this.editDevice.floor);

  //                   // Final step: Load zones
  //                   this.role.getZones(floor.id).subscribe({
  //                     next: (zones: any) => {
  //                       const zoneArray = Array.isArray(zones) ? zones : [];
  //                       this.zoneByFloor[floor.id] = zoneArray;

  //                       const zone = zoneArray.find((z: any) => z.zoneName === device.zoneName);

  //                       if (zone) {
  //                         this.editDevice.zone = zone.id;
  //                         console.log('✅ Set zone ID:', this.editDevice.zone);
  //                       }

  //                       console.log('🎉 All hierarchical data loaded!');
  //                       console.log('✅ Final editDevice:', this.editDevice);

  //                       // ✅✅✅ CRITICAL: Trigger change detection ONCE at the end
  //                       this.cdr.detectChanges();
  //                     },
  //                     error: (err) => {
  //                       console.error('❌ Error loading zones:', err);
  //                       this.cdr.detectChanges();
  //                     }
  //                   });
  //                 },
  //                 error: (err) => {
  //                   console.error('❌ Error loading floors:', err);
  //                   this.cdr.detectChanges();
  //                 }
  //               });
  //             },
  //             error: (err) => {
  //               console.error('❌ Error loading buildings:', err);
  //               this.cdr.detectChanges();
  //             }
  //           });
  //         },
  //         error: (err) => {
  //           console.error('❌ Error loading areas:', err);
  //           this.cdr.detectChanges();
  //         }
  //       });
  //     },
  //     error: (err) => {
  //       console.error('❌ Error loading countries:', err);
  //       this.cdr.detectChanges();
  //     }
  //   });
  // }


  openEditDevicePopup(device: any) {
    console.log('🔍 Opening edit popup for device:', device);

    this.openEditDevice = true;

    // ✅ Initialize editDevice with actual device values INCLUDING IDs
    this.editDevice = {
      id: device.id,
      deviceType: device.deviceType || '',
      uniqueId: device.uniqueId || '',
      model: device.model || '',
      deviceName: device.deviceName || '',
      technology: device.technology || '',
      status: device.status ?? true,
      project: device.projectId || '',      // ✅ Use projectId
      country: device.countryId || '',      // ✅ Use countryId
      area: device.areaId || '',            // ✅ Use areaId
      outdoorZoneName: device.outdoorZoneName || '',
      building: device.buildingId || '',    // ✅ Use buildingId
      floor: device.floorId || '',          // ✅ Use floorId
      zone: device.zoneId || ''             // ✅ Use zoneId
    };

    // ✅ Set selected IDs BEFORE loading data
    this.selectedProjectId = device.projectId || '';
    this.selectedCountryId = device.countryId || '';

    // ✅ Find project
    const project = this.projects.find(p => p.id === device.projectId);
    if (!project) {
      console.error('❌ Project not found for ID:', device.projectId);
      this.cdr.detectChanges();
      return;
    }

    console.log('✅ Found project:', project);

    // ✅ Load ALL hierarchical data
    this.loadHierarchicalDataParallel(device, project.id);
  }



  outdoorZoneByArea: { [areaId: string]: any[] } = {};

  // private loadHierarchicalDataParallel(device: any, projectId: string) {
  //   console.log('🌍 Starting parallel hierarchical data load');

  //   // Step 1: Load countries first
  //   this.role.countryGetById(projectId).subscribe({
  //     next: (countries: any) => {
  //       const countryArray = Array.isArray(countries) ? countries : [];
  //       this.countriesByProject[projectId] = countryArray;

  //       const country = countryArray.find((c: any) => c.countryName === device.countryName);

  //       if (!country) {
  //         console.error('❌ Country not found');
  //         this.cdr.detectChanges();
  //         return;
  //       }

  //       this.editDevice.country = country.id;
  //       this.selectedCountryId = country.id;
  //       console.log('✅ Set country ID:', this.editDevice.country);

  //       // Step 2: Load areas
  //       this.role.getSummary(country.id).subscribe({
  //         next: (areas: any) => {
  //           const areaArray = Array.isArray(areas) ? areas : [];
  //           this.areaByCountry[country.id] = areaArray;

  //           const area = areaArray.find((a: any) => a.areaName === device.areaName);

  //           if (!area) {
  //             console.error('❌ Area not found');
  //             this.cdr.detectChanges();
  //             return;
  //           }

  //           this.editDevice.area = area.id;
  //           console.log('✅ Set area ID:', this.editDevice.area);






  //           // Step 3: Load buildings
  //           this.role.getBuilding(area.id).subscribe({
  //             next: (buildings: any) => {
  //               const buildingArray = Array.isArray(buildings) ? buildings : [];
  //               this.buildingByArea[area.id] = buildingArray;

  //               const building = buildingArray.find((b: any) => b.buildingName === device.buildingName);

  //               if (!building) {
  //                 console.error('❌ Building not found');
  //                 this.cdr.detectChanges();
  //                 return;
  //               }

  //               this.editDevice.building = building.id;
  //               console.log('✅ Set building ID:', this.editDevice.building);

  //               // Step 4: Load floors
  //               this.role.getFloor(building.id).subscribe({
  //                 next: (floors: any) => {
  //                   const floorArray = Array.isArray(floors) ? floors : [];
  //                   this.floorByBuilding[building.id] = floorArray;

  //                   const floor = floorArray.find((f: any) => f.floorName === device.floorName);

  //                   if (!floor) {
  //                     console.error('❌ Floor not found');
  //                     this.cdr.detectChanges();
  //                     return;
  //                   }

  //                   this.editDevice.floor = floor.id;
  //                   console.log('✅ Set floor ID:', this.editDevice.floor);

  //                   // Step 5: Load zones
  //                   this.role.getZones(floor.id).subscribe({
  //                     next: (zones: any) => {
  //                       const zoneArray = Array.isArray(zones) ? zones : [];
  //                       this.zoneByFloor[floor.id] = zoneArray;

  //                       const zone = zoneArray.find((z: any) => z.zoneName === device.zoneName);

  //                       if (zone) {
  //                         this.editDevice.zone = zone.id;
  //                         console.log('✅ Set zone ID:', this.editDevice.zone);
  //                       } else {
  //                         console.error('❌ Zone not found');
  //                       }

  //                       console.log('🎉 All hierarchical data loaded!');
  //                       console.log('✅ Final editDevice:', this.editDevice);

  //                       // ✅✅✅ CRITICAL: Trigger change detection ONCE at the end
  //                       this.cdr.detectChanges();
  //                     },
  //                     error: (err) => {
  //                       console.error('❌ Error loading zones:', err);
  //                       this.cdr.detectChanges();
  //                     }
  //                   });
  //                 },
  //                 error: (err) => {
  //                   console.error('❌ Error loading floors:', err);
  //                   this.cdr.detectChanges();
  //                 }
  //               });
  //             },
  //             error: (err) => {
  //               console.error('❌ Error loading buildings:', err);
  //               this.cdr.detectChanges();
  //             }
  //           });
  //         },
  //         error: (err) => {
  //           console.error('❌ Error loading areas:', err);
  //           this.cdr.detectChanges();
  //         }
  //       });
  //     },
  //     error: (err) => {
  //       console.error('❌ Error loading countries:', err);
  //       this.cdr.detectChanges();
  //     }
  //   });
  // }



  private loadHierarchicalDataParallel(device: any, projectId: string) {
    console.log('🌍 Starting hierarchical data load for device:', device);

    // Step 1: Load countries
    this.role.countryGetById(projectId).subscribe({
      next: (countries: any) => {
        const countryArray = Array.isArray(countries) ? countries : [];
        this.countriesByProject[projectId] = countryArray;
        console.log('✅ Countries loaded:', countryArray);

        this.cdr.detectChanges();

        if (!device.countryId) {
          console.warn('⚠️ No countryId in device');
          return;
        }

        // Step 2: Load areas
        this.role.getSummary(device.countryId).subscribe({
          next: (areas: any) => {
            const areaArray = Array.isArray(areas) ? areas : [];
            this.areaByCountry[device.countryId] = areaArray;
            console.log('✅ Areas loaded:', areaArray);

            this.cdr.detectChanges();

            if (!device.areaId) {
              console.warn('⚠️ No areaId in device');
              return;
            }

            // ✅ CRITICAL: Load outdoor zones for this area
            console.log('🔍 Loading outdoor zones for area:', device.areaId);
            this.loadOutdoorZonesForArea(device.areaId);

            // Step 3: Load buildings
            this.role.getBuilding(device.areaId).subscribe({
              next: (buildings: any) => {
                const buildingArray = Array.isArray(buildings) ? buildings : [];
                this.buildingByArea[device.areaId] = buildingArray;
                console.log('✅ Buildings loaded:', buildingArray);

                this.cdr.detectChanges();

                if (!device.buildingId) {
                  console.warn('⚠️ No buildingId in device');
                  this.cdr.detectChanges(); // ✅ Final update even if no building
                  return;
                }

                // Step 4: Load floors
                this.role.getFloor(device.buildingId).subscribe({
                  next: (floors: any) => {
                    const floorArray = Array.isArray(floors) ? floors : [];
                    this.floorByBuilding[device.buildingId] = floorArray;
                    console.log('✅ Floors loaded:', floorArray);

                    this.cdr.detectChanges();

                    if (!device.floorId) {
                      console.warn('⚠️ No floorId in device');
                      this.cdr.detectChanges(); // ✅ Final update even if no floor
                      return;
                    }

                    // Step 5: Load zones
                    this.role.getZones(device.floorId).subscribe({
                      next: (zones: any) => {
                        const zoneArray = Array.isArray(zones) ? zones : [];
                        this.zoneByFloor[device.floorId] = zoneArray;
                        console.log('✅ Zones loaded:', zoneArray);

                        console.log('🎉 All hierarchical data loaded!');
                        console.log('✅ Final editDevice:', this.editDevice);
                        console.log('✅ Outdoor zones for area:', this.outdoorZonesByArea[device.areaId]);

                        // ✅ Final change detection
                        this.cdr.detectChanges();
                      },
                      error: (err) => {
                        console.error('❌ Error loading zones:', err);
                        this.cdr.detectChanges();
                      }
                    });
                  },
                  error: (err) => {
                    console.error('❌ Error loading floors:', err);
                    this.cdr.detectChanges();
                  }
                });
              },
              error: (err) => {
                console.error('❌ Error loading buildings:', err);
                this.cdr.detectChanges();
              }
            });
          },
          error: (err) => {
            console.error('❌ Error loading areas:', err);
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('❌ Error loading countries:', err);
        this.cdr.detectChanges();
      }
    });
  }

  closeEditDevicePopup() {
    this.openEditDevice = false;
  }

  // updateDevice() {
  //   const missingFields: string[] = [];

  //   // ✅ Helper to detect empty, null, undefined, or string "null"/"undefined"
  //   const isEmpty = (value: any): boolean => {
  //     if (value === undefined || value === null) return true;
  //     const str = value.toString().trim().toLowerCase();
  //     return str === "" || str === "null" || str === "undefined";
  //   };

  //   // ✅ Validation
  //   if (isEmpty(this.editDevice.deviceType)) missingFields.push("Device Type");
  //   if (isEmpty(this.editDevice.deviceName)) missingFields.push("Device Name");
  //   if (isEmpty(this.editDevice.uniqueId)) missingFields.push("Unique ID");
  //   if (isEmpty(this.editDevice.model)) missingFields.push("Model");
  //   if (isEmpty(this.editDevice.project)) missingFields.push("Project");
  //   if (isEmpty(this.editDevice.country)) missingFields.push("Country");
  //   if (isEmpty(this.editDevice.area)) missingFields.push("Area");
  //   if (isEmpty(this.editDevice.building)) missingFields.push("Building");
  //   if (isEmpty(this.editDevice.floor)) missingFields.push("Floor");
  //   if (isEmpty(this.editDevice.zone)) missingFields.push("Zone");

  //   // ✅ Stop if any field is missing
  //   if (missingFields.length) {
  //     alert("⚠️ Please fill in the following fields: " + missingFields.join(", "));
  //     return;
  //   }

  //   // ✅ Stop if status is OFF
  //   if (!this.editDevice.status) {
  //     alert("⚠️ Device status is OFF. Please enable it before updating.");
  //     return;
  //   }

  //   // ✅ Find related objects for mapping (same as createNewDevice)
  //   const projectObj = this.projects.find(p => p.id === this.editDevice.project);
  //   const countryObj = (this.countriesByProject[this.editDevice.project] || []).find(
  //     c => c.id === this.editDevice.country
  //   );
  //   const areaObj = (this.areaByCountry[this.editDevice.country] || []).find(
  //     a => a.id === this.editDevice.area
  //   );
  //   const buildingObj = (this.buildingByArea[this.editDevice.area] || []).find(
  //     b => b.id === this.editDevice.building
  //   );
  //   const floorObj = (this.floorByBuilding[this.editDevice.building] || []).find(
  //     f => f.id === this.editDevice.floor
  //   );
  //   const zoneObj = (this.zoneByFloor[this.editDevice.floor] || []).find(
  //     z => z.id === this.editDevice.zone
  //   );

  //   // ✅ Prepare final payload (parallel to createNewDevice)
  //   const reqBody = {
  //     id: this.editDevice.id,

  //     deviceType: this.editDevice.deviceType.trim(),
  //     uniqueId: this.editDevice.uniqueId.trim(),
  //     model: this.editDevice.model.trim(),
  //     deviceName: this.editDevice.deviceName.trim(),

  //     projectId: this.editDevice.project,
  //     projectName: projectObj ? projectObj.projectName : '',

  //     countryId: this.editDevice.country,
  //     countryName: countryObj ? countryObj.countryName : '',

  //     areaId: this.editDevice.area,
  //     areaName: areaObj ? areaObj.areaName : '',

  //     buildingId: this.editDevice.building,
  //     buildingName: buildingObj ? buildingObj.buildingName : '',

  //     floorId: this.editDevice.floor,
  //     floorName: floorObj ? floorObj.floorName : '',

  //     zoneId: this.editDevice.zone,
  //     zoneName: zoneObj ? zoneObj.zoneName : '',

  //     status: this.editDevice.status
  //   };

  //   console.log('🧾 Final Update Payload:', reqBody);

  //   // ✅ Double-check for any empty string values
  //   const emptyReqKeys = Object.keys(reqBody).filter(
  //     key => reqBody[key as keyof typeof reqBody]?.toString().trim() === ""
  //   );
  //   if (emptyReqKeys.length) {
  //     alert("⚠️ Invalid data: Some required values are empty (" + emptyReqKeys.join(", ") + ")");
  //     return;
  //   }

  //   // ✅ PUT/UPDATE API call
  //   this.deviceService.updateAddDevice(reqBody, this.editDevice.id).subscribe({
  //     next: (res: any) => {
  //       alert(res.message || "✅ Device updated successfully!");
  //       this.closeEditDevicePopup();
  //       this.loadDevices();
  //     },
  //     error: (err: any) => {
  //       console.error("❌ Error updating device:", err);
  //       alert("❌ Error updating device.");
  //     }
  //   });
  // }


  updateDevice() {
    // 🔍 Step-by-step field validation (ONLY 3 fields)
    if (!this.editDevice.deviceType) {
      alert("⚠️ Please select a Device Type.");
      return;
    }
    if (!this.editDevice.uniqueId?.trim()) {
      alert("⚠️ Please enter the Unique ID.");
      return;
    }


    const isDuplicate = this.deviceList.some(
      (d: any) =>
        d.uniqueId?.trim().toLowerCase() ===
        this.editDevice.uniqueId.trim().toLowerCase() &&
        d.id !== this.editDevice.id   // 🔥 ignore current device
    );

    if (isDuplicate) {
      alert("⚠️ This Unique ID already exists for another device.");
      return;
    }



    if (!this.editDevice.deviceName?.trim()) {
      alert("⚠️ Please enter the Device Name.");
      return;
    }



    // ✅ Find related data objects for display names (SAFE even if IDs are empty)
    const projectObj = this.projects.find(p => p.id === this.editDevice.project);
    const countryObj = (this.countriesByProject[this.editDevice.project] || []).find(
      c => c.id === this.editDevice.country
    );
    const areaObj = (this.areaByCountry[this.editDevice.country] || []).find(
      a => a.id === this.editDevice.area
    );
    const buildingObj = (this.buildingByArea[this.editDevice.area] || []).find(
      b => b.id === this.editDevice.building
    );
    const floorObj = (this.floorByBuilding[this.editDevice.building] || []).find(
      f => f.id === this.editDevice.floor
    );
    const zoneObj = (this.zoneByFloor[this.editDevice.floor] || []).find(
      z => z.id === this.editDevice.zone
    );

    // ✅ Build final request body (SAME STRUCTURE AS CREATE)
    const reqBody = {
      id: this.editDevice.id,

      deviceType: this.editDevice.deviceType,
      uniqueId: this.editDevice.uniqueId,
      model: this.editDevice.model,

      projectId: this.editDevice.project,
      projectName: projectObj?.projectName || "",

      countryId: this.editDevice.country,
      countryName: countryObj?.countryName || "",

      areaId: this.editDevice.area,
      areaName: areaObj?.areaName || "",


      outdoorZoneName: this.editDevice.outdoorZoneName || "",

      buildingId: this.editDevice.building,
      buildingName: buildingObj?.buildingName || "",

      floorId: this.editDevice.floor,
      floorName: floorObj?.floorName || "",

      zoneId: this.editDevice.zone,
      zoneName: zoneObj?.zoneName || "",

      deviceName: this.editDevice.deviceName,
      technology: this.editDevice.technology,
      status: this.editDevice.status
    };

    console.log("🧾 Final Update Payload:", reqBody);

    // ✅ UPDATE API call
    this.deviceService.updateAddDevice(reqBody, this.editDevice.id).subscribe({
      next: (res: any) => {
        alert(res.message || "✅ Device updated successfully!");
        this.closeEditDevicePopup();
        this.loadDevices();
      },
      error: (err: any) => {
        console.error("❌ Error updating device:", err);
        alert("❌ Error updating device.");
      }
    });
  }




  //delete add device

  openDeleteDevice = false;
  deleteDeviceId: string = '';

  openDeleteDevicePopup(device: any) {
    // Use the correct ID field here. Example:
    this.deleteDeviceId = device.id || device._id || device.uniqueId;
    this.openDeleteDevice = true;
  }


  closeDeleteDevicePopup() {
    this.openDeleteDevice = false;
    this.deleteDeviceId = '';
  }

  confirmDeleteDevice() {
    if (!this.deleteDeviceId) return;

    this.deviceService.DeleteAddDevice(this.deleteDeviceId).subscribe({
      next: (res: any) => {
        console.log("Delete response:", res);
        alert(res.message || "Device Deleted Successfully");
        this.closeDeleteDevicePopup();
        this.loadDevices(); // refresh list
      },
      error: (err: any) => {
        console.error("Error deleting device:", err);
        alert("Error deleting device");
      }
    });
  }






  // Device Type list


  deviceTypeList: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizes: number[] = [5, 10, 20, 50];
  totalPages: number = 0;

















  // Load Device Types from API
  loadDeviceTypes(page: number = 1) {
    if (page < 1 || (this.totalPages && page > this.totalPages)) return;

    this.currentPage = page;
    this.deviceService.getaddDeviceType(this.currentPage, this.pageSize).subscribe({
      next: (res: any) => {
        this.deviceTypeList = Array.isArray(res.data) ? res.data : [];
        this.totalPages = res.totalPages || 1;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error("Error loading device types", err)
    });
  }

  onPageSizeChange(size: number) {
    this.pageSize = +size;
    this.currentPage = 1;
    this.loadDeviceTypes(this.currentPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.loadDeviceTypes(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.loadDeviceTypes(this.currentPage - 1);
    }
  }




  // Popup control for creating a device type
  openAddDeviceType = false;

  // Form model
  createDeviceTypeData: any = {
    deviceType: '',
    description: '',
    status: true
  };


  // Open create popup
  openCreateDeviceTypePopup() {
    this.openAddDeviceType = true;
    this.createDeviceTypeData = {
      deviceType: '',
      description: '',
      status: false
    };
  }

  // Close create popup
  closeCreateDeviceTypePopup() {
    this.openAddDeviceType = false;
  }

  createDeviceType() {
    // 🔍 Validate fields one by one
    if (!this.createDeviceTypeData.deviceType?.trim()) {
      alert('⚠️ Please enter the Device Type.');
      return;
    }

    if (!this.createDeviceTypeData.description?.trim()) {
      alert('⚠️ Please enter the Description.');
      return;
    }

    // ✅ Validate status
    if (!this.createDeviceTypeData.status) {
      alert('⚠️ Device type can only be created when status is active.');
      return;
    }

    // ✅ Check for duplicate device type (case-insensitive)
    const isDuplicate = this.deviceTypeList.some(
      (type: any) =>
        type.deviceType?.trim().toLowerCase() ===
        this.createDeviceTypeData.deviceType.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert('⚠️ This Device Type already exists!');
      return;
    }

    // ✅ Proceed only if all validations pass
    this.deviceService.createdeviceType(this.createDeviceTypeData).subscribe({
      next: (res: any) => {
        alert(res.message || '✅ Device Type Created Successfully');
        this.closeCreateDeviceTypePopup();
        this.loadDeviceTypes(); // reload list after creation
      },
      error: (err: any) => {
        console.error('❌ Error creating device type:', err);
        alert('❌ Error creating device type');
      }
    });
  }




  //update device type



  // Popup control
  openEditDeviceType = false;

  // Holds the currently selected Device Type for editing
  editDeviceType: any = {
    id: '',
    deviceType: '',
    description: '',
    status: true
  };

  // Open the edit popup and fill it with selected row data
  openEditDeviceTypePopup(type: any) {
    this.openEditDeviceType = true;
    this.editDeviceType = { ...type }; // clone the object
  }

  // Close the popup
  closeEditDeviceTypePopup() {
    this.openEditDeviceType = false;
  }

  // Update Device Type API call
  updateDeviceType() {
    // 🔍 Validate fields one by one
    if (!this.editDeviceType.deviceType?.trim()) {
      alert('⚠️ Please enter the Device Type.');
      return;
    }

    if (!this.editDeviceType.description?.trim()) {
      alert('⚠️ Please enter the Description.');
      return;
    }

    // ✅ Check if status is active
    if (!this.editDeviceType.status) {
      alert('⚠️ Device type can only be updated when status is active.');
      return;
    }

    // ✅ Proceed only if all validations pass
    console.log('Updating Device Type:', this.editDeviceType);

    this.deviceService.updateDevice(this.editDeviceType, this.editDeviceType.id).subscribe({
      next: (res: any) => {
        console.log('Update response:', res);
        alert(res.message || '✅ Device Type Updated Successfully');
        this.closeEditDeviceTypePopup();
        this.loadDeviceTypes(); // refresh list
      },
      error: (err: any) => {
        console.error('❌ Error updating Device Type:', err);
        alert('❌ Error updating Device Type');
      }
    });
  }


  // Popup control
  openDeleteDeviceType = false;
  deleteDeviceTypeId: string = '';

  // Open the delete popup and store selected Device Type ID
  openDeleteDeviceTypePopup(type: any) {
    this.deleteDeviceTypeId = type.id || type._id;
    this.openDeleteDeviceType = true;
  }

  // Close the delete popup
  closeDeleteDeviceTypePopup() {
    this.openDeleteDeviceType = false;
    this.deleteDeviceTypeId = '';
  }

  // Confirm delete action
  confirmDeleteDeviceType() {
    if (!this.deleteDeviceTypeId) return;

    this.deviceService.DeleteDevicetype(this.deleteDeviceTypeId).subscribe({
      next: (res: any) => {
        console.log("Delete response:", res);
        alert(res.message || "Device Type Deleted Successfully");
        this.closeDeleteDeviceTypePopup();
        this.loadDeviceTypes(); // refresh table
      },
      error: (err: any) => {
        console.error("Error deleting Device Type:", err);
        alert("Error deleting Device Type");
      }
    });
  }










  //summary from project 


  projects: any[] = [];

  loadProject() {
    this.role.getProject().subscribe({
      next: (res: any) => {
        this.projects = res;
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error loading project");
      }
    });
  }





  selectedProjectId: string = '';
  countriesByProject: { [projectId: string]: any[] } = {};

  onProjectChange(projectId: string) {
    console.log('📍 Project changed to:', projectId);
    this.selectedProjectId = projectId;

    // Reset dependent fields
    this.selectedCountryId = '';

    if (this.openAddDevice) {
      // For create mode
      this.createDevice.country = '';
      this.createDevice.area = '';
      this.createDevice.building = '';
      this.createDevice.floor = '';
      this.createDevice.zone = '';
    }

    if (this.openEditDevice) {
      // For edit mode - don't reset, just load countries
      // The hierarchical data loader will handle setting values
    }

    if (!projectId) {
      this.cdr.detectChanges();
      return;
    }

    // Load countries for this project
    if (!this.countriesByProject[projectId]) {
      this.role.countryGetById(projectId).subscribe({
        next: (res: any) => {
          this.countriesByProject[projectId] = Array.isArray(res) ? res : [];
          console.log('✅ Loaded countries:', this.countriesByProject[projectId]);
          this.cdr.detectChanges();
        },
        error: () => console.log("Error loading countries")
      });
    } else {
      this.cdr.detectChanges();
    }
  }






  selectedCountryId: string = '';
  areaByCountry: { [countryId: string]: any[] } = {};





  loadArea(countryId: string) {
    if (!this.areaByCountry[countryId]) {
      this.role.getSummary(countryId).subscribe({
        next: (res: any) => {
          this.areaByCountry[countryId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => {
          console.log("Error loading areas");
        }
      });
    }
  }


  onCountryChange(countryId: string) {
    console.log('📍 Country changed to:', countryId);
    this.selectedCountryId = countryId;

    if (this.openAddDevice) {
      // For create mode
      this.createDevice.country = countryId;
      this.createDevice.area = '';
      this.createDevice.building = '';
      this.createDevice.floor = '';
      this.createDevice.zone = '';
    }

    if (!countryId) {
      this.cdr.detectChanges();
      return;
    }

    // Load areas for this country
    if (!this.areaByCountry[countryId]) {
      this.role.getSummary(countryId).subscribe({
        next: (res: any) => {
          this.areaByCountry[countryId] = Array.isArray(res) ? res : [];
          console.log('✅ Loaded areas:', this.areaByCountry[countryId]);
          this.cdr.detectChanges();
        },
        error: () => console.log("Error loading areas")
      });
    } else {
      this.cdr.detectChanges();
    }
  }




  selectedBuildingId: string = '';
  buildingByArea: { [areaId: string]: any[] } = {};

  loadBuilding(areaId: string) {
    if (!this.buildingByArea[areaId]) {
      this.role.getBuilding(areaId).subscribe({
        next: (res: any) => {
          this.buildingByArea[areaId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => {
          console.log("Error loading building");
        }
      });
    }
  }

  // onAreaChange(areaId: string) {
  //   console.log('📍 Area changed to:', areaId);

  //   if (this.openAddDevice) {
  //     this.createDevice.area = areaId;
  //     this.createDevice.building = '';
  //     this.createDevice.floor = '';
  //     this.createDevice.zone = '';
  //   }

  //   if (!areaId) {
  //     this.cdr.detectChanges();
  //     return;
  //   }

  //   // Load buildings for this area
  //   if (!this.buildingByArea[areaId]) {
  //     this.role.getBuilding(areaId).subscribe({
  //       next: (res: any) => {
  //         this.buildingByArea[areaId] = Array.isArray(res) ? res : [];
  //         console.log('✅ Loaded buildings:', this.buildingByArea[areaId]);
  //         this.cdr.detectChanges();
  //       },
  //       error: () => console.log("Error loading buildings")
  //     });
  //   } else {
  //     this.cdr.detectChanges();
  //   }
  // }


  onAreaChange(areaId: string) {
    console.log('📍 Area changed to:', areaId);

    if (this.openAddDevice) {
      this.createDevice.area = areaId;
      this.createDevice.outdoorZoneName = ''; // ✅ Reset outdoor zone
      this.createDevice.building = '';
      this.createDevice.floor = '';
      this.createDevice.zone = '';
    }

    if (!areaId) {
      this.cdr.detectChanges();
      return;
    }

    // ✅ Load outdoor zones for this area
    if (!this.outdoorZonesByArea[areaId]) {
      this.loadOutdoorZonesForArea(areaId);
    }

    // Load buildings for this area
    if (!this.buildingByArea[areaId]) {
      this.role.getBuilding(areaId).subscribe({
        next: (res: any) => {
          this.buildingByArea[areaId] = Array.isArray(res) ? res : [];
          console.log('✅ Loaded buildings:', this.buildingByArea[areaId]);
          this.cdr.detectChanges();
        },
        error: () => console.log("Error loading buildings")
      });
    } else {
      this.cdr.detectChanges();
    }
  }


  selectedFloorId: string = '';
  floorByBuilding: { [buildingId: string]: any[] } = {};


  loadFloor(buildingId: string) {
    if (!this.floorByBuilding[buildingId]) {
      this.role.getFloor(buildingId).subscribe({
        next: (res: any) => {
          this.floorByBuilding[buildingId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => {
          console.log("Error loading floors");
        }
      });
    }
  }






  loadOutdoorZonesForArea(areaId: string) {
    console.log('🔍 Loading outdoor zones for area:', areaId);
    this.deviceService.getOutdoorZoneMapping(areaId).subscribe({
      next: (zones: any) => {
        console.log('✅ Raw outdoor zones response:', zones);

        // ✅ Handle different response formats
        const zonesArray = Array.isArray(zones) ? zones : (zones.data ? zones.data : []);

        this.outdoorZonesByArea[areaId] = zonesArray;
        console.log('✅ Outdoor zones stored for area', areaId, ':', this.outdoorZonesByArea[areaId]);

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error loading outdoor zones:', err);
        this.outdoorZonesByArea[areaId] = [];
        this.cdr.detectChanges();
      }
    });
  }










  onBuildingChange(buildingId: string) {
    console.log('📍 Building changed to:', buildingId);

    if (this.openAddDevice) {
      this.createDevice.building = buildingId;
      this.createDevice.floor = '';
      this.createDevice.zone = '';
    }

    if (!buildingId) {
      this.cdr.detectChanges();
      return;
    }

    // Load floors for this building
    if (!this.floorByBuilding[buildingId]) {
      this.role.getFloor(buildingId).subscribe({
        next: (res: any) => {
          this.floorByBuilding[buildingId] = Array.isArray(res) ? res : [];
          console.log('✅ Loaded floors:', this.floorByBuilding[buildingId]);
          this.cdr.detectChanges();
        },
        error: () => console.log("Error loading floors")
      });
    } else {
      this.cdr.detectChanges();
    }
  }




  selectedZoneId: string = '';
  zoneByFloor: { [floorId: string]: any[] } = {};


  loadZones(floorId: string) {
    if (!this.zoneByFloor[floorId]) {
      this.role.getZones(floorId).subscribe({
        next: (res: any) => {
          this.zoneByFloor[floorId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => {
          console.log("Error loading zones");
        }
      });
    }
  }




  onFloorChange(floorId: string) {
    console.log('📍 Floor changed to:', floorId);

    if (this.openAddDevice) {
      this.createDevice.floor = floorId;
      this.createDevice.zone = '';
    }

    if (!floorId) {
      this.cdr.detectChanges();
      return;
    }

    // Load zones for this floor
    if (!this.zoneByFloor[floorId]) {
      this.role.getZones(floorId).subscribe({
        next: (res: any) => {
          this.zoneByFloor[floorId] = Array.isArray(res) ? res : [];
          console.log('✅ Loaded zones:', this.zoneByFloor[floorId]);
          this.cdr.detectChanges();
        },
        error: () => console.log("Error loading zones")
      });
    } else {
      this.cdr.detectChanges();
    }
  }















  deviceParamsList: any[] = [];

  loadDeviceParameters() {
    this.deviceService.getAllDeviceParameters().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [res];

        this.deviceParamsList = data.map((device: any) => ({
          ...device,
          parameterNames: device.deviceParameters.map((p: any) => p.name).join(', ')
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading device parameters', err);
      }
    });
  }



  addDevicePara: boolean = false;

  openAddDevicePara() {
    this.addDevicePara = true;
    this.loadDevices();

    // ✅ Completely reset all fields
    this.createPara = {
      deviceId: '',
      deviceName: '',
      deviceParameters: ''
    };
  }


  closeAddDevicepara() {
    this.addDevicePara = false;
  }

  createPara: any = {
    deviceId: '',
    deviceName: '',
    deviceParameters: ''
  };

  createNewDevicePara() {
    // ✅ Find the selected device name based on selected ID
    const selectedDevice = this.deviceList.find(
      (d: any) => d.id === this.createPara.deviceId
    );

    if (!selectedDevice) {
      alert('Please select a valid device.');
      return;
    }

    // ✅ Construct payload exactly as backend expects
    const payload = {
      deviceId: this.createPara.deviceId, // From dropdown
      deviceName: selectedDevice.deviceName, // Auto-filled from deviceList
      deviceUniqueId: selectedDevice.uniqueId,
      deviceParameters: this.createPara.deviceParameters
        ? this.createPara.deviceParameters.split(',').map((p: string) => p.trim())
        : []
    };

    console.log('✅ Request Payload:', payload);

    // ✅ Call API
    this.deviceService.addNewPara(payload).subscribe({
      next: (res) => {
        alert('Parameter created successfully!');
        this.closeAddDevicepara();
        this.loadDeviceParameters();
      },
      error: (err) => {
        console.error('❌ Failed to create parameter:', err);
        alert('Failed to create parameter.');
      }
    });
  }



  updatePara: boolean = false;
  selectedParaIdToUpdate = "";

  updateParaData = {
    deviceId: '',
    deviceName: '',
    deviceParameters: ''
  };
  openUpdatePara(device: any) {
    // Extract parameter names correctly
    const parameterNames = device.deviceParameters.map((p: any) =>
      typeof p === 'string' ? p : p.name
    );

    this.updateParaData = {
      deviceId: device.deviceId || device.id,
      deviceName: device.deviceName,
      deviceParameters: parameterNames.join(', ') // convert names to comma-separated string
    };

    this.selectedParaIdToUpdate = device.id;
    this.updatePara = true;
  }

  closeUpdatePara() {
    this.updatePara = false
  }

  updateDevicePara() {
    if (!this.updateParaData.deviceId) {
      alert("Please select a valid device");
      return;
    }

    const selectedDevice = this.deviceList.find(
      (d: any) => d.id === this.updateParaData.deviceId
    );

    const payload = {
      deviceId: this.updateParaData.deviceId,
      deviceUniqueId: selectedDevice.uniqueId,
      deviceName: selectedDevice ? selectedDevice.deviceName : this.updateParaData.deviceName,
      deviceParameters: this.updateParaData.deviceParameters
        ? this.updateParaData.deviceParameters.split(',').map((p: string) => p.trim())
        : []
    };

    console.log("Final payload to update:", payload);

    this.deviceService.updateDeviceParametersById(this.selectedParaIdToUpdate, payload)
      .subscribe({
        next: (res: any) => {
          console.log("Device parameter updated successfully", res);
          alert("Device parameter updated successfully!");
          this.closeUpdatePara();
          this.loadDeviceParameters();
        },
        error: (err) => {
          console.error("Error updating device parameter:", err);
          alert("Failed to update device parameter");
        }
      });
  }

  deletePara: boolean = false;
  selectedParaIdToDelete = '';

  openDeletePara(device: any) {
    this.deletePara = true;
    this.selectedParaIdToDelete = device.id;
  }

  closeDeletePara() {
    this.deletePara = false;
  }

  deleteDevicePara() {
    this.deviceService.deleteDevicePara(this.selectedParaIdToDelete).subscribe({
      next: (res: any) => {
        alert("Parameter Deleted Successfully");
        this.closeDeletePara();
        this.loadDeviceParameters();

      },
      error: () => {
        alert("error deleting parameter")
      }
    })
  }






}








