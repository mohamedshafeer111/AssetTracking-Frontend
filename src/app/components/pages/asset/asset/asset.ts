import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Assetservice } from '../../../service/asset/assetservice';
import { FormsModule } from '@angular/forms';
import { Roleservice } from '../../../service/role/roleservice';
import { Peopletype } from '../../../service/peopletype/peopletype';
import { Reusabletable } from '../../reusabletable/reusabletable/reusabletable';


@Component({
  selector: 'app-asset',
  imports: [RouterModule, CommonModule, FormsModule, Reusabletable],
  templateUrl: './asset.html',
  styleUrl: './asset.css'
})




export class Asset implements OnInit {

  isAssetLoading: boolean = false;
  assetSummary: any[] = [];

  constructor(
    private assetservice: Assetservice,
    private role: Roleservice,
    private deviceService: Peopletype,
    private cdr: ChangeDetectorRef,

  ) { }

  ngOnInit(){
    this.loadProject();
    this.loadAssets();
    this.loadDevices();
  }

  activeTab: 'asset' | 'transaction' = 'asset';

  setActive(tab: 'asset' | 'transaction') {
    this.activeTab = tab;
  }

  loadAssetSummary() {
    this.isAssetLoading = true;

    this.assetservice.getAllAssets().subscribe({
      next: (res: any) => {
        console.log('📦 Asset summary:', res);
        this.assetSummary = res;
        this.isAssetLoading = false;
      },
      error: (err: any) => {
        console.error('❌ Error loading asset summary', err);
        this.isAssetLoading = false;
      }
    });
  }

  assetColumns = [
    { header: 'Asset Name', field: 'assetName' },
    { header: 'Unique ID', field: 'uniqueId' },
    { header: 'Project', field: 'projectName' },
    { header: 'Country', field: 'countryName' },
    { header: 'Area', field: 'areaName' },
    { header: 'Building', field: 'buildingName' },
    { header: 'Floor', field: 'floorName' },
    { header: 'Zone', field: 'zoneName' },
    { header: 'Department', field: 'department' },
    { header: 'Custodian', field: 'custodian' },
    { header: 'Main Category', field: 'mainCategory' },
    { header: 'Sub Category', field: 'subCategory' },
    { header: 'Brand', field: 'brand' },
    { header: 'Model', field: 'model' },
    { header: 'Mapped Device', field: 'mappedDevice' },
    { header: 'Status', field: 'assetStatus', type: 'status' },
    { header: 'Action', type: 'action' }
  ];

  handleAssetAction(event: any) {
    if (event.type === 'edit') {
      this.openEditAssetPopup(event.row);
    } else {
      this.openDeleteAssetPopup(event.row);
    }
  }

  searchText:string='';

  

  // ✅ HIERARCHICAL DATA STORAGE
  projects: any[] = [];
  selectedProjectId: string = '';
  countriesByProject: { [projectId: string]: any[] } = {};

  selectedCountryId: string = '';
  areaByCountry: { [countryId: string]: any[] } = {};

  buildingByArea: { [areaId: string]: any[] } = {};
  floorByBuilding: { [buildingId: string]: any[] } = {};
  zoneByFloor: { [floorId: string]: any[] } = {};
  outdoorZonesByArea: { [areaId: string]: any[] } = {};

  openAddAsset = false;
  isEditMode = false;
  createAssetData: any = {
    assetName: '',
    uniqueId: '',
    createdBy: '',
    outdoorZoneName: '',
    projectId: '',
    projectName: '',
    countryId: '',
    countryName: '',
    areaId: '',
    areaName: '',
    buildingId: '',
    buildingName: '',
    floorId: '',
    floorName: '',
    zoneId: '',
    zoneName: '',
    department: '',
    custodian: '',
    mainCategory: '',
    subCategory: '',
    subSubCategory: '',
    brand: '',
    model: '',
    assetDescription: '',
    assetStatus: true,
    mappedDevice: '',
    mappedDeviceUniqueId: '',
    deliverydate: '',
    capitalizationDate: '',
    invoiceDate: '',
    poDate: '',
    expiryDate: '',
    serviceStartDate: '',
    serviceEndDate: '',
    warrantyEndDate: ''
  };

  openCreateAssetPopup() {
    this.openAddAsset = true;

    // Reset all fields
    this.createAssetData = {
      assetName: '',
      uniqueId: '',
      createdBy: '',
      outdoorZoneName: '',
      projectId: '',
      projectName: '',
      countryId: '',
      countryName: '',
      areaId: '',
      areaName: '',
      buildingId: '',
      buildingName: '',
      floorId: '',
      floorName: '',
      zoneId: '',
      zoneName: '',
      department: '',
      custodian: '',
      mainCategory: '',
      subCategory: '',
      subSubCategory: '',
      brand: '',
      model: '',
      assetDescription: '',
      assetStatus: false,
      mappedDevice: '',
      mappedDeviceUniqueId: '',
      deliverydate: '',
      capitalizationDate: '',
      invoiceDate: '',
      poDate: '',
      expiryDate: '',
      serviceStartDate: '',
      serviceEndDate: '',
      warrantyEndDate: ''
    };

    this.selectedProjectId = '';
    this.selectedCountryId = '';
  }

  closeCreateAssetPopup() {
    this.openAddAsset = false;
  }


  // ✅ Add helper method to extract unique ID from mapped device
  extractUniqueIdFromMappedDevice(mappedDevice: string): string {
    if (!mappedDevice) return '';

    // Extract uniqueId from format: "deviceName (uniqueId)"
    const match = mappedDevice.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
  }

  createNewAsset() {
    const mappedDeviceUniqueId = this.extractUniqueIdFromMappedDevice(this.createAssetData.mappedDevice);
    // ✅ Find related objects for mapping
    const projectObj = this.projects.find(p => p.id === this.selectedProjectId);
    const countryObj = (this.countriesByProject[this.selectedProjectId] || []).find(
      c => c.id === this.selectedCountryId
    );
    const areaObj = (this.areaByCountry[this.selectedCountryId] || []).find(
      a => a.id === this.createAssetData.areaId
    );
    const buildingObj = (this.buildingByArea[this.createAssetData.areaId] || []).find(
      b => b.id === this.createAssetData.buildingId
    );
    const floorObj = (this.floorByBuilding[this.createAssetData.buildingId] || []).find(
      f => f.id === this.createAssetData.floorId
    );
    const zoneObj = (this.zoneByFloor[this.createAssetData.floorId] || []).find(
      z => z.id === this.createAssetData.zoneId
    );

    // ✅ Build final request body
    const reqBody = {
      assetName: this.createAssetData.assetName,
      uniqueId: this.createAssetData.uniqueId,
      createdBy: this.createAssetData.createdBy,

      projectId: this.selectedProjectId,
      projectName: projectObj?.projectName || '',

      countryId: this.selectedCountryId,
      countryName: countryObj?.countryName || '',

      areaId: this.createAssetData.areaId,
      areaName: areaObj?.areaName || '',

      outdoorZoneName: this.createAssetData.outdoorZoneName || '',

      buildingId: this.createAssetData.buildingId,
      buildingName: buildingObj?.buildingName || '',

      floorId: this.createAssetData.floorId,
      floorName: floorObj?.floorName || '',

      zoneId: this.createAssetData.zoneId,
      zoneName: zoneObj?.zoneName || '',

      department: this.createAssetData.department,
      custodian: this.createAssetData.custodian,
      mainCategory: this.createAssetData.mainCategory,
      subCategory: this.createAssetData.subCategory,
      subSubCategory: this.createAssetData.subSubCategory,
      brand: this.createAssetData.brand,
      model: this.createAssetData.model,
      assetDescription: this.createAssetData.assetDescription,
      assetStatus: this.createAssetData.assetStatus,
      mappedDevice: this.createAssetData.mappedDevice,
      mappedDeviceUniqueId: mappedDeviceUniqueId, // ✅ Add extracted unique ID
      deliverydate: this.createAssetData.deliverydate,
      capitalizationDate: this.createAssetData.capitalizationDate,
      invoiceDate: this.createAssetData.invoiceDate,
      poDate: this.createAssetData.poDate,
      expiryDate: this.createAssetData.expiryDate,
      serviceStartDate: this.createAssetData.serviceStartDate,
      serviceEndDate: this.createAssetData.serviceEndDate,
      warrantyEndDate: this.createAssetData.warrantyEndDate
    };

    console.log('🚀 Final Asset Payload:', reqBody);

    this.assetservice.createAsset(reqBody).subscribe({
      next: (res) => {
        alert('✅ Asset created successfully');
        this.closeCreateAssetPopup();
        this.loadAssets();
      },
      error: (err) => {
        console.error(err);
        alert('❌ Failed to create asset');
      }
    });
  }
  // ✅ LOAD PROJECT
  loadProject() {
    this.role.getProject().subscribe({
      next: (res: any) => {
        this.projects = res;
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading project");
      }
    });
  }

  // ✅ PROJECT CHANGE HANDLER
  onProjectChange(projectId: string) {
    console.log('📍 Project changed to:', projectId);
    this.selectedProjectId = projectId;
    this.selectedCountryId = '';

    this.createAssetData.countryId = '';
    this.createAssetData.areaId = '';
    this.createAssetData.buildingId = '';
    this.createAssetData.floorId = '';
    this.createAssetData.zoneId = '';
    this.createAssetData.outdoorZoneName = '';

    if (!projectId) {
      this.cdr.detectChanges();
      return;
    }

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

  // ✅ COUNTRY CHANGE HANDLER
  onCountryChange(countryId: string) {
    console.log('📍 Country changed to:', countryId);
    this.selectedCountryId = countryId;

    this.createAssetData.countryId = countryId;
    this.createAssetData.areaId = '';
    this.createAssetData.buildingId = '';
    this.createAssetData.floorId = '';
    this.createAssetData.zoneId = '';
    this.createAssetData.outdoorZoneName = '';

    if (!countryId) {
      this.cdr.detectChanges();
      return;
    }

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

  // ✅ AREA CHANGE HANDLER
  onAreaChange(areaId: string) {
    console.log('📍 Area changed to:', areaId);

    this.createAssetData.areaId = areaId;
    this.createAssetData.outdoorZoneName = '';
    this.createAssetData.buildingId = '';
    this.createAssetData.floorId = '';
    this.createAssetData.zoneId = '';

    if (!areaId) {
      this.cdr.detectChanges();
      return;
    }

    // Load outdoor zones
    if (!this.outdoorZonesByArea[areaId]) {
      this.loadOutdoorZonesForArea(areaId);
    }

    // Load buildings
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

  // ✅ LOAD OUTDOOR ZONES
  loadOutdoorZonesForArea(areaId: string) {
    this.deviceService.getOutdoorZoneMapping(areaId).subscribe({
      next: (zones: any[]) => {
        console.log('✅ Outdoor zones loaded for area:', zones);
        this.outdoorZonesByArea[areaId] = zones;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error loading outdoor zones:', err);
        this.outdoorZonesByArea[areaId] = [];
        this.cdr.detectChanges();
      }
    });
  }

  // ✅ BUILDING CHANGE HANDLER
  onBuildingChange(buildingId: string) {
    console.log('📍 Building changed to:', buildingId);

    this.createAssetData.buildingId = buildingId;
    this.createAssetData.floorId = '';
    this.createAssetData.zoneId = '';

    if (!buildingId) {
      this.cdr.detectChanges();
      return;
    }

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

  // ✅ FLOOR CHANGE HANDLER
  onFloorChange(floorId: string) {
    console.log('📍 Floor changed to:', floorId);

    this.createAssetData.floorId = floorId;
    this.createAssetData.zoneId = '';

    if (!floorId) {
      this.cdr.detectChanges();
      return;
    }

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









  // Add these properties
  deviceList: any[] = [];
  deviceOptions: string[] = [];

  // Add this method (similar to loadDevices but adapted for assets)
  loadDevices(): void {
    this.deviceService.getaddDevices().subscribe({
      next: (res: any) => {
        this.deviceList = res.data ? res.data : res;
        console.log("Device List:", this.deviceList);

        // ✅ Build dropdown options in format: "deviceName (uniqueId)"
        this.deviceOptions = this.deviceList.map((d: any) =>
          `${d.deviceName} (${d.uniqueId})`
        );

        console.log("Device Options:", this.deviceOptions);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error("Error loading devices", err);
      }
    });
  }






  assetList: any[] = []; // ✅ Add this property to store assets


  loadAssets() {
    this.assetservice.getAllAssets().subscribe({
      next: (res: any) => {
        console.log('📦 Assets loaded:', res);

        this.assetList = Array.isArray(res)
          ? res
          : res?.data ?? [];

        // Force UI refresh (only needed in some cases)
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error loading assets', err);
      }
    });
  }







































  // ✅ Add these properties
  openEditAsset = false;

  editAssetData: any = {
    id: '',
    assetName: '',
    uniqueId: '',
    createdBy: '',
    outdoorZoneName: '',
    projectId: '',
    projectName: '',
    countryId: '',
    countryName: '',
    areaId: '',
    areaName: '',
    buildingId: '',
    buildingName: '',
    floorId: '',
    floorName: '',
    zoneId: '',
    zoneName: '',
    department: '',
    custodian: '',
    mainCategory: '',
    subCategory: '',
    subSubCategory: '',
    brand: '',
    model: '',
    assetDescription: '',
    assetStatus: true,
    mappedDevice: '',
    mappedDeviceUniqueId: '',
    deliverydate: '',
    capitalizationDate: '',
    invoiceDate: '',
    poDate: '',
    expiryDate: '',
    serviceStartDate: '',
    serviceEndDate: '',
    warrantyEndDate: ''
  };

  // // ✅ Open Edit Popup
  // openEditAssetPopup(asset: any) {
  //   console.log('🔍 Opening edit popup for asset:', asset);

  //   this.openEditAsset = true;

  //   // ✅ Initialize editAssetData with actual asset values
  //   this.editAssetData = {
  //     id: asset.id,
  //     assetName: asset.assetName || '',
  //     uniqueId: asset.uniqueId || '',
  //     createdBy: asset.createdBy || '',
  //     outdoorZoneName: asset.outdoorZoneName || '',
  //     department: asset.department || '',
  //     custodian: asset.custodian || '',
  //     mainCategory: asset.mainCategory || '',
  //     subCategory: asset.subCategory || '',
  //     subSubCategory: asset.subSubCategory || '',
  //     brand: asset.brand || '',
  //     model: asset.model || '',
  //     assetDescription: asset.assetDescription || '',
  //     assetStatus: asset.assetStatus ?? true,
  //     mappedDevice: asset.mappedDevice || '',
  //     deliverydate: asset.deliverydate ? asset.deliverydate.split('T')[0] : '',
  //     capitalizationDate: asset.capitalizationDate ? asset.capitalizationDate.split('T')[0] : '',
  //     invoiceDate: asset.invoiceDate ? asset.invoiceDate.split('T')[0] : '',
  //     poDate: asset.poDate ? asset.poDate.split('T')[0] : '',
  //     expiryDate: asset.expiryDate ? asset.expiryDate.split('T')[0] : '',
  //     serviceStartDate: asset.serviceStartDate ? asset.serviceStartDate.split('T')[0] : '',
  //     serviceEndDate: asset.serviceEndDate ? asset.serviceEndDate.split('T')[0] : '',
  //     warrantyEndDate: asset.warrantyEndDate ? asset.warrantyEndDate.split('T')[0] : '',
  //     projectId: '',
  //     countryId: '',
  //     areaId: '',
  //     buildingId: '',
  //     floorId: '',
  //     zoneId: ''
  //   };

  //   // ✅ Find and set project ID
  //   const project = this.projects.find(p => p.projectName === asset.projectName);

  //   if (!project) {
  //     console.error('❌ Project not found for:', asset.projectName);
  //     this.cdr.detectChanges();
  //     return;
  //   }

  //   this.editAssetData.projectId = project.id;
  //   this.selectedProjectId = project.id;

  //   // ✅ Load hierarchical data
  //   this.loadHierarchicalDataForEdit(asset, project.id);
  // }




  openEditAssetPopup(asset: any) {
    console.log('🔍 Opening edit popup for asset:', asset);

    this.openEditAsset = true;

    // ✅ Initialize editAssetData with actual asset values
    this.editAssetData = {
      id: asset.id,
      assetName: asset.assetName || '',
      uniqueId: asset.uniqueId || '',
      createdBy: asset.createdBy || '',
      outdoorZoneName: asset.outdoorZoneName || '',
      department: asset.department || '',
      custodian: asset.custodian || '',
      mainCategory: asset.mainCategory || '',
      subCategory: asset.subCategory || '',
      subSubCategory: asset.subSubCategory || '',
      brand: asset.brand || '',
      model: asset.model || '',
      assetDescription: asset.assetDescription || '',
      assetStatus: asset.assetStatus ?? true,
      mappedDevice: asset.mappedDevice || '',
      deliverydate: asset.deliverydate ? asset.deliverydate.split('T')[0] : '',
      capitalizationDate: asset.capitalizationDate ? asset.capitalizationDate.split('T')[0] : '',
      invoiceDate: asset.invoiceDate ? asset.invoiceDate.split('T')[0] : '',
      poDate: asset.poDate ? asset.poDate.split('T')[0] : '',
      expiryDate: asset.expiryDate ? asset.expiryDate.split('T')[0] : '',
      serviceStartDate: asset.serviceStartDate ? asset.serviceStartDate.split('T')[0] : '',
      serviceEndDate: asset.serviceEndDate ? asset.serviceEndDate.split('T')[0] : '',
      warrantyEndDate: asset.warrantyEndDate ? asset.warrantyEndDate.split('T')[0] : '',
      // ✅ These will be set by loadHierarchicalDataForEdit
      projectId: asset.projectId || '',
      countryId: asset.countryId || '',
      areaId: asset.areaId || '',
      buildingId: asset.buildingId || '',
      floorId: asset.floorId || '',
      zoneId: asset.zoneId || ''
    };

    // ✅ Find and set project ID directly from asset data
    const project = this.projects.find(p => p.id === asset.projectId || p.projectName === asset.projectName);

    if (!project) {
      console.error('❌ Project not found for:', asset.projectName);
      this.cdr.detectChanges();
      return;
    }

    this.editAssetData.projectId = project.id;
    this.selectedProjectId = project.id;

    console.log('✅ Set project ID:', this.editAssetData.projectId);

    // ✅ Load hierarchical data
    this.loadHierarchicalDataForEdit(asset, project.id);
  }



  // ✅ Load hierarchical data for edit mode
  // private loadHierarchicalDataForEdit(asset: any, projectId: string) {
  //   console.log('🌍 Starting hierarchical data load for edit');

  //   // Step 1: Load countries
  //   this.role.countryGetById(projectId).subscribe({
  //     next: (countries: any) => {
  //       const countryArray = Array.isArray(countries) ? countries : [];
  //       this.countriesByProject[projectId] = countryArray;

  //       const country = countryArray.find((c: any) => c.countryName === asset.countryName);

  //       if (!country) {
  //         console.error('❌ Country not found');
  //         this.cdr.detectChanges();
  //         return;
  //       }

  //       this.editAssetData.countryId = country.id;
  //       this.selectedCountryId = country.id;
  //       console.log('✅ Set country ID:', this.editAssetData.countryId);

  //       // Step 2: Load areas
  //       this.role.getSummary(country.id).subscribe({
  //         next: (areas: any) => {
  //           const areaArray = Array.isArray(areas) ? areas : [];
  //           this.areaByCountry[country.id] = areaArray;

  //           const area = areaArray.find((a: any) => a.areaName === asset.areaName);

  //           if (!area) {
  //             console.error('❌ Area not found');
  //             this.cdr.detectChanges();
  //             return;
  //           }

  //           this.editAssetData.areaId = area.id;
  //           console.log('✅ Set area ID:', this.editAssetData.areaId);

  //           // Load outdoor zones for this area
  //           this.loadOutdoorZonesForArea(area.id);

  //           // Step 3: Load buildings
  //           this.role.getBuilding(area.id).subscribe({
  //             next: (buildings: any) => {
  //               const buildingArray = Array.isArray(buildings) ? buildings : [];
  //               this.buildingByArea[area.id] = buildingArray;

  //               const building = buildingArray.find((b: any) => b.buildingName === asset.buildingName);

  //               if (!building) {
  //                 console.error('❌ Building not found');
  //                 this.cdr.detectChanges();
  //                 return;
  //               }

  //               this.editAssetData.buildingId = building.id;
  //               console.log('✅ Set building ID:', this.editAssetData.buildingId);

  //               // Step 4: Load floors
  //               this.role.getFloor(building.id).subscribe({
  //                 next: (floors: any) => {
  //                   const floorArray = Array.isArray(floors) ? floors : [];
  //                   this.floorByBuilding[building.id] = floorArray;

  //                   const floor = floorArray.find((f: any) => f.floorName === asset.floorName);

  //                   if (!floor) {
  //                     console.error('❌ Floor not found');
  //                     this.cdr.detectChanges();
  //                     return;
  //                   }

  //                   this.editAssetData.floorId = floor.id;
  //                   console.log('✅ Set floor ID:', this.editAssetData.floorId);

  //                   // Step 5: Load zones
  //                   this.role.getZones(floor.id).subscribe({
  //                     next: (zones: any) => {
  //                       const zoneArray = Array.isArray(zones) ? zones : [];
  //                       this.zoneByFloor[floor.id] = zoneArray;

  //                       const zone = zoneArray.find((z: any) => z.zoneName === asset.zoneName);

  //                       if (zone) {
  //                         this.editAssetData.zoneId = zone.id;
  //                         console.log('✅ Set zone ID:', this.editAssetData.zoneId);
  //                       } else {
  //                         console.error('❌ Zone not found');
  //                       }

  //                       console.log('🎉 All hierarchical data loaded!');
  //                       console.log('✅ Final editAssetData:', this.editAssetData);

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




  private loadHierarchicalDataForEdit(asset: any, projectId: string) {
    console.log('🌍 Starting hierarchical data load for edit');

    // ✅ ALWAYS load countries (don't check cache)
    this.role.countryGetById(projectId).subscribe({
      next: (countries: any) => {
        const countryArray = Array.isArray(countries) ? countries : [];
        this.countriesByProject[projectId] = countryArray;

        const country = countryArray.find((c: any) =>
          c.id === asset.countryId || c.countryName === asset.countryName
        );

        if (!country) {
          console.error('❌ Country not found');
          this.cdr.detectChanges();
          return;
        }

        this.editAssetData.countryId = country.id;
        this.selectedCountryId = country.id;
        console.log('✅ Set country ID:', this.editAssetData.countryId);

        // ✅ ALWAYS load areas
        this.role.getSummary(country.id).subscribe({
          next: (areas: any) => {
            const areaArray = Array.isArray(areas) ? areas : [];
            this.areaByCountry[country.id] = areaArray;

            const area = areaArray.find((a: any) =>
              a.id === asset.areaId || a.areaName === asset.areaName
            );

            if (!area) {
              console.error('❌ Area not found');
              this.cdr.detectChanges();
              return;
            }

            this.editAssetData.areaId = area.id;
            console.log('✅ Set area ID:', this.editAssetData.areaId);

            // ✅ Load outdoor zones if needed
            if (asset.outdoorZoneName) {
              this.loadOutdoorZonesForArea(area.id);
            }

            // ✅ ALWAYS load buildings
            this.role.getBuilding(area.id).subscribe({
              next: (buildings: any) => {
                const buildingArray = Array.isArray(buildings) ? buildings : [];
                this.buildingByArea[area.id] = buildingArray;

                const building = buildingArray.find((b: any) =>
                  b.id === asset.buildingId || b.buildingName === asset.buildingName
                );

                if (!building) {
                  console.error('❌ Building not found');
                  this.cdr.detectChanges();
                  return;
                }

                this.editAssetData.buildingId = building.id;
                console.log('✅ Set building ID:', this.editAssetData.buildingId);

                // ✅ ALWAYS load floors
                this.role.getFloor(building.id).subscribe({
                  next: (floors: any) => {
                    const floorArray = Array.isArray(floors) ? floors : [];
                    this.floorByBuilding[building.id] = floorArray;

                    const floor = floorArray.find((f: any) =>
                      f.id === asset.floorId || f.floorName === asset.floorName
                    );

                    if (!floor) {
                      console.error('❌ Floor not found');
                      this.cdr.detectChanges();
                      return;
                    }

                    this.editAssetData.floorId = floor.id;
                    console.log('✅ Set floor ID:', this.editAssetData.floorId);

                    // ✅ ALWAYS load zones
                    this.role.getZones(floor.id).subscribe({
                      next: (zones: any) => {
                        const zoneArray = Array.isArray(zones) ? zones : [];
                        this.zoneByFloor[floor.id] = zoneArray;

                        const zone = zoneArray.find((z: any) =>
                          z.id === asset.zoneId || z.zoneName === asset.zoneName
                        );

                        if (zone) {
                          this.editAssetData.zoneId = zone.id;
                          console.log('✅ Set zone ID:', this.editAssetData.zoneId);
                        } else {
                          console.error('❌ Zone not found');
                        }

                        console.log('🎉 All hierarchical data loaded!');
                        console.log('✅ Final editAssetData:', this.editAssetData);

                        // ✅ Force Angular to detect all changes
                        setTimeout(() => {
                          this.cdr.detectChanges();
                        }, 100);
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

  // ✅ Close Edit Popup
  closeEditAssetPopup() {
    this.openEditAsset = false;
  }

  // ✅ Update Asset
  updateAssetData() {
    // Extract unique ID from mappedDevice
    const mappedDeviceUniqueId = this.extractUniqueIdFromMappedDevice(this.editAssetData.mappedDevice);

    // ✅ Find related objects for mapping
    const projectObj = this.projects.find(p => p.id === this.editAssetData.projectId);
    const countryObj = (this.countriesByProject[this.editAssetData.projectId] || []).find(
      c => c.id === this.editAssetData.countryId
    );
    const areaObj = (this.areaByCountry[this.editAssetData.countryId] || []).find(
      a => a.id === this.editAssetData.areaId
    );
    const buildingObj = (this.buildingByArea[this.editAssetData.areaId] || []).find(
      b => b.id === this.editAssetData.buildingId
    );
    const floorObj = (this.floorByBuilding[this.editAssetData.buildingId] || []).find(
      f => f.id === this.editAssetData.floorId
    );
    const zoneObj = (this.zoneByFloor[this.editAssetData.floorId] || []).find(
      z => z.id === this.editAssetData.zoneId
    );

    // ✅ Build final request body
    const reqBody = {
      assetName: this.editAssetData.assetName,
      uniqueId: this.editAssetData.uniqueId,
      createdBy: this.editAssetData.createdBy,

      projectId: this.editAssetData.projectId,
      projectName: projectObj?.projectName || '',

      countryId: this.editAssetData.countryId,
      countryName: countryObj?.countryName || '',

      areaId: this.editAssetData.areaId,
      areaName: areaObj?.areaName || '',

      outdoorZoneName: this.editAssetData.outdoorZoneName || '',

      buildingId: this.editAssetData.buildingId,
      buildingName: buildingObj?.buildingName || '',

      floorId: this.editAssetData.floorId,
      floorName: floorObj?.floorName || '',

      zoneId: this.editAssetData.zoneId,
      zoneName: zoneObj?.zoneName || '',

      department: this.editAssetData.department,
      custodian: this.editAssetData.custodian,
      mainCategory: this.editAssetData.mainCategory,
      subCategory: this.editAssetData.subCategory,
      subSubCategory: this.editAssetData.subSubCategory,
      brand: this.editAssetData.brand,
      model: this.editAssetData.model,
      assetDescription: this.editAssetData.assetDescription,
      assetStatus: this.editAssetData.assetStatus,
      mappedDevice: this.editAssetData.mappedDevice,
      mappedDeviceUniqueId: mappedDeviceUniqueId, // ✅ Add extracted unique ID
      deliverydate: this.editAssetData.deliverydate,
      capitalizationDate: this.editAssetData.capitalizationDate,
      invoiceDate: this.editAssetData.invoiceDate,
      poDate: this.editAssetData.poDate,
      expiryDate: this.editAssetData.expiryDate,
      serviceStartDate: this.editAssetData.serviceStartDate,
      serviceEndDate: this.editAssetData.serviceEndDate,
      warrantyEndDate: this.editAssetData.warrantyEndDate
    };



    console.log('🧾 Final Update Payload:', reqBody);

    // ✅ UPDATE API call
    this.assetservice.updateAsset(this.editAssetData.id, reqBody).subscribe({
      next: (res: any) => {
        alert(res.message || '✅ Asset updated successfully!');
        this.closeEditAssetPopup();
        this.loadAssets();
      },
      error: (err: any) => {
        console.error('❌ Error updating asset:', err);
        alert('❌ Error updating asset.');
      }
    });
  }

  // ✅ Update the event handlers for edit mode
  onProjectChangeEdit(projectId: string) {
    console.log('📍 Project changed to:', projectId);
    this.editAssetData.projectId = projectId;
    this.selectedProjectId = projectId;

    this.editAssetData.countryId = '';
    this.editAssetData.areaId = '';
    this.editAssetData.buildingId = '';
    this.editAssetData.floorId = '';
    this.editAssetData.zoneId = '';
    this.editAssetData.outdoorZoneName = '';

    if (!projectId) {
      this.cdr.detectChanges();
      return;
    }

    if (!this.countriesByProject[projectId]) {
      this.role.countryGetById(projectId).subscribe({
        next: (res: any) => {
          this.countriesByProject[projectId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => console.log("Error loading countries")
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onCountryChangeEdit(countryId: string) {
    console.log('📍 Country changed to:', countryId);
    this.editAssetData.countryId = countryId;
    this.selectedCountryId = countryId;

    this.editAssetData.areaId = '';
    this.editAssetData.buildingId = '';
    this.editAssetData.floorId = '';
    this.editAssetData.zoneId = '';
    this.editAssetData.outdoorZoneName = '';

    if (!countryId) {
      this.cdr.detectChanges();
      return;
    }

    if (!this.areaByCountry[countryId]) {
      this.role.getSummary(countryId).subscribe({
        next: (res: any) => {
          this.areaByCountry[countryId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => console.log("Error loading areas")
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onAreaChangeEdit(areaId: string) {
    console.log('📍 Area changed to:', areaId);
    this.editAssetData.areaId = areaId;
    this.editAssetData.outdoorZoneName = '';
    this.editAssetData.buildingId = '';
    this.editAssetData.floorId = '';
    this.editAssetData.zoneId = '';

    if (!areaId) {
      this.cdr.detectChanges();
      return;
    }

    if (!this.outdoorZonesByArea[areaId]) {
      this.loadOutdoorZonesForArea(areaId);
    }

    if (!this.buildingByArea[areaId]) {
      this.role.getBuilding(areaId).subscribe({
        next: (res: any) => {
          this.buildingByArea[areaId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => console.log("Error loading buildings")
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onBuildingChangeEdit(buildingId: string) {
    console.log('📍 Building changed to:', buildingId);
    this.editAssetData.buildingId = buildingId;
    this.editAssetData.floorId = '';
    this.editAssetData.zoneId = '';

    if (!buildingId) {
      this.cdr.detectChanges();
      return;
    }

    if (!this.floorByBuilding[buildingId]) {
      this.role.getFloor(buildingId).subscribe({
        next: (res: any) => {
          this.floorByBuilding[buildingId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => console.log("Error loading floors")
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onFloorChangeEdit(floorId: string) {
    console.log('📍 Floor changed to:', floorId);
    this.editAssetData.floorId = floorId;
    this.editAssetData.zoneId = '';

    if (!floorId) {
      this.cdr.detectChanges();
      return;
    }

    if (!this.zoneByFloor[floorId]) {
      this.role.getZones(floorId).subscribe({
        next: (res: any) => {
          this.zoneByFloor[floorId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => console.log("Error loading zones")
      });
    } else {
      this.cdr.detectChanges();
    }
  }









  // controls delete popup
  openDeleteAsset: boolean = false;

  // holds selected asset to delete
  selectedAssetToDelete: any = null;


  openDeleteAssetPopup(asset: any) {
    this.selectedAssetToDelete = asset; // store full asset or just id
    this.openDeleteAsset = true;
  }


  closeDeleteAssetPopup() {
    this.openDeleteAsset = false;
    this.selectedAssetToDelete = null;
  }



  confirmDeleteAsset() {
    if (!this.selectedAssetToDelete?.id) return;

    this.assetservice.deleteAsset(this.selectedAssetToDelete.id).subscribe({
      next: () => {
        alert('Asset deleted successfully ✅');

        this.closeDeleteAssetPopup();
        this.loadAssets(); // 🔁 reload asset list (important)
      },
      error: (err) => {
        console.error(err);
        alert('Failed to delete asset ❌');
      }
    });
  }





}