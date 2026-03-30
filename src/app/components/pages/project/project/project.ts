import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Roleservice } from '../../../service/role/roleservice';
import { Projecthierarchy } from '../../projecthierarchy/projecthierarchy/projecthierarchy';




@Component({
  selector: 'app-project',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './project.html',
  styleUrl: './project.css'
})
export class Project implements OnInit {
  activeTab: string = 'project';   // ✅ Added property
  projects: any[] = [];
  ngOnInit(): void {
    this.loadProject();
    // this.loadCountries(this.projectId);
    // this.loadArea(this.areaId);
    // this.loadBuilding(this.buildingId);
    // this.loadFloor(this.floorid);
    // this.loadZones(this.zoneId);
    // this.loadSubZones(this.selectedSubZoneId)




  }
  constructor(private role: Roleservice, private cdr: ChangeDetectorRef, private zone: NgZone) { }

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



  //create button
  openCreatePersonPopup() {
    this.openCreateProject = true,
      this.createproject = {
        description: "",
        projectName: "",
        weekStart: "",
        weekEnd: "",
        status: true

      }

  }


  // create project

  openCreateProject = false;

  createproject: any = {
    description: "",
    projectName: "",
    weekStart: "",
    weekEnd: "",
    status: true
  };

  openCreateProjectPopup() {
    console.log("hai")
    this.openCreateProject = true;

    this.createproject = {
      description: "",
      projectName: "",
      weekStart: "",
      weekEnd: "",
      status: true
    }

  }
  closecreateproject() {
    this.openCreateProject = false;
  }

  createNewProject() {
    // ✅ validate required fields
    const isValid =
      this.createproject.projectName &&
      this.createproject.description &&
      this.createproject.weekStart &&
      this.createproject.weekEnd;

    if (!isValid) {
      alert("Please fill in all fields before creating the project.");
      return;
    }
    this.role.createnewProject(this.createproject).subscribe({
      next: (res: any) => {
        alert("project Created");
        this.closecreateproject();
        this.loadProject();
      },
      error: () => {
        alert("erroe loading")

      }
    })
  }




  //update project

  openEditProject = false;

  // selectedProject: string = '';

  editProject: any = {
    projectName: "",
    description: "",
    weekStart: "",
    weekEnd: "",
    status: true
  };

  openEditProjectPopup(project: any) {
    this.selectedProject = project.id;
    this.editProject = {
      projectName: project.projectName,
      description: project.description,
      weekStart: project.weekStart || "",
      weekEnd: project.weekEnd || "",
      status: project.status ?? true
    };
    this.openEditProject = true;
  }

  closeEditProjectPopup() {
    this.openEditProject = false;
  }

  updateProject() {
    // ✅ validate required fields
    const isValid =
      this.editProject.projectName &&
      this.editProject.description &&
      this.editProject.weekStart &&
      this.editProject.weekEnd;

    if (!isValid) {
      alert("Please fill in all fields before updating the project.");
      return;
    }
    this.role.updateProject(this.editProject, this.selectedProject).subscribe({
      next: (res: any) => {
        alert(res.message || 'Project updated successfully');
        this.closeEditProjectPopup();
        this.loadProject();
      },
      error: () => {
        alert("Error updating project");
      }
    });
  }













  //delete project


  openDeleteProject = false;


  selectedProject: string = '';

  openDeleteProjectPopup(Project: any) {
    console.log("open")
    this.selectedProject = Project.id;
    this.openDeleteProject = true;
  }

  closeDeleteProjectPopup() {
    this.openDeleteProject = false;
  }

  deleteProject() {
    this.role.DeleteProject(this.selectedProject).subscribe({
      next: (res: any) => {
        alert(res.message || 'Project Deleted successfully');
        this.closeDeleteProjectPopup();
        this.loadProject();
      },
      error: () => {
        alert("error Deleting Project")
      }
    })
  }







  //create country

  openCreateCountry = false;

  projectId: string = "";
  countryData: any = {
    projectId: "",
    countryName: "",
    countryCode: "",
    description: "",
    timeZone: "",
    latitude: 0,
    longitude: 0,
    zoomLevel: 0,
    status: true
  };

  openCreateCountryPopup(projectId: string) {

    this.projectId = projectId;
    this.openCreateCountry = true;

    this.countryData = {
      countryName: "",
      countryCode: "",
      description: "",
      timeZone: "",
      latitude: 0,
      longitude: 0,
      zoomLevel: 0,
      status: true
    }

  }
  closeCreateCountry() {
    this.openCreateCountry = false;
  }

  createNewCountry() {
    const isValid =
      this.countryData.countryName &&
      this.countryData.countryCode &&
      this.countryData.description &&
      this.countryData.timeZone &&
      this.countryData.latitude !== null &&
      this.countryData.longitude !== null &&
      this.countryData.zoomLevel !== null;

    if (!isValid) {
      alert("Please fill in all required fields before creating a country.");
      return;
    }

    this.role.CountryCreate(this.projectId, this.countryData).subscribe({
      next: (res: any) => {
        alert("Country Created");

        // Close popup immediately
        this.openCreateCountry = false;

        // 🔥 Force Angular to update the view
        this.cdr.detectChanges();

        // Optional: reload countries
        // this.loadCountries();
      },
      error: () => {
        alert("Error creating country");
      }
    });
  }


  //country summary


  countriesByProject: { [projectId: string]: any[] } = {}; // store countries per project
  // Track expanded projects
  expandedProjects: Set<string> = new Set();

  toggleProject(projectId: string) {
    if (this.expandedProjects.has(projectId)) {
      // Collapse
      this.expandedProjects.delete(projectId);
    } else {
      // Expand + load countries
      this.expandedProjects.add(projectId);
      this.loadCountries(projectId);
    }
  }








  loadCountries(projectId: string) {
    // toggle open/close
    if (this.expandedProjects.has(projectId)) {
      this.expandedProjects.delete(projectId);
      return;
    }

    this.role.countryGetById(projectId).subscribe({
      next: (res: any) => {
        // ✅ Only assign the array part
        this.countriesByProject[projectId] = Array.isArray(res) ? res : [];
        this.expandedProjects.add(projectId);
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading countries");
      }
    });
  }























  //update country

  openEditCountry = false;

  selectedCountry: string = '';

  editCountry: any = {

    countryName: "",
    countryCode: "",
    description: "",
    timeZone: "",
    latitude: 0,
    longitude: 0,
    zoomLevel: 0,
    status: true
  };

  openEditCountryPopup(country: any) {
    this.selectedCountry = country.id;
    this.editCountry = {
      projectId: country.projectId,   // ✅ include projectId
      countryName: country.countryName,
      countryCode: country.countryCode,
      description: country.description,
      timeZone: country.timeZone,
      latitude: country.latitude ?? 0,
      longitude: country.longitude ?? 0,
      zoomLevel: country.zoomLevel ?? 0,
      status: country.status ?? true
    };
    this.openEditCountry = true;
  }
  closeEditCountryPopup() {
    this.openEditCountry = false
  }
  updateCountry() {
    const isValid =
      this.editCountry.countryName &&
      this.editCountry.countryCode &&
      this.editCountry.description &&
      this.editCountry.timeZone &&
      this.editCountry.latitude !== null &&
      this.editCountry.longitude !== null &&
      this.editCountry.zoomLevel !== null;

    if (!isValid) {
      alert("Please fill in all required fields before updating the country.");
      return;
    }

    this.role.updateCountry(this.editCountry, this.selectedCountry).subscribe({
      next: (res: any) => {
        alert(res.message || 'Country updated successfully');

        // close the popup
        this.openEditCountry = false;

        // force Angular to detect changes immediately
        this.cdr.detectChanges();

        if (this.editCountry.projectId) {
          this.loadCountries(this.editCountry.projectId);
        } else {
          this.loadCountries(this.projectId);
        }
      },
      error: () => {
        alert("Error updating Country");
      }
    });
  }











  //delete country


  openDeleteCountry = false;


  selectedcountry: string = '';

  openDeleteCountryPopup(Country: any) {
    console.log("open")
    this.selectedcountry = Country.id;
    this.openDeleteCountry = true;
  }



  closeDeleteCountryPopup() {
    this.openDeleteCountry = false;   // hide the popup
    this.cdr.detectChanges();         // force Angular to update view immediately
  }


  deleteCountry() {
    this.role.DeleteCountry(this.selectedcountry).subscribe({
      next: (res: any) => {
        alert(res.message || 'Country Deleted successfully');
        this.closeDeleteCountryPopup();
        this.loadCountries(this.countryId);

      },
      error: () => {
        alert("error Deleting Country")
      }
    })
  }














  //Area summary

  // Store areas per country


  // Cache areas per country
  areaByCountry: { [countryId: string]: any[] } = {};

  expandedCountry: Set<string> = new Set(); // track open dropdowns
  toggleCountry(countryId: string) {
    if (this.expandedCountry.has(countryId)) {
      // Collapse
      this.expandedCountry.delete(countryId);
    } else {
      // Expand + load area
      this.expandedCountry.add(countryId);
      this.loadArea(countryId);
    }
  }






  loadArea(countryId: string) {
    // toggle open/close
    if (this.expandedCountry.has(countryId)) {
      this.expandedCountry.delete(countryId);
      return;
    }

    // If not cached, fetch areas
    if (!this.areaByCountry[countryId]) {
      this.role.getSummary(countryId).subscribe({
        next: (res: any) => {
          this.areaByCountry[countryId] = Array.isArray(res) ? res : [];
          this.expandedCountry.add(countryId);
          this.cdr.detectChanges();
        },
        error: () => {
          console.log("Error loading areas");
        }
      });
    } else {
      // Already cached → just open
      this.expandedCountry.add(countryId);
      this.cdr.detectChanges();
    }
  }





  // 9-9-2025


  // area under country
  openCreatearea = false;

  areaId: string = "";
  countryId: string = "";

  areaData: any = {
    countryId: "",
    areaName: "",
    description: "",
    outdoorMap: "",
    latitude: 0,
    longitude: 0,
    status: true
  };

  openCreateareaPopup(countryId: string) {
    console.log(this.countryId)

    this.countryId = countryId;
    this.openCreatearea = true;

    this.areaData = {
      areaName: "",
      description: "",
      outdoorMap: "",
      latitude: 0,
      longitude: 0,
      status: true

    }

  }
  closeCreatearea() {
    this.openCreatearea = false;
  }



  createNewarea() {
    const isValid =
      this.areaData.areaName &&
      this.areaData.description &&
      this.areaData.outdoorMap &&
      this.areaData.latitude !== null &&
      this.areaData.longitude !== null;

    if (!isValid) {
      alert("Please fill in all required fields before creating the area.");
      return;
    }

    this.role.CountryArea(this.countryId, this.areaData).subscribe({
      next: (res: any) => {
        alert("Area Created");

        // ✅ Correct variable name
        this.openCreatearea = false;

        // Force Angular to detect changes immediately
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert("Error creating area");
      }
    });
  }












  //update Area

  openEditArea = false;

  selectedArea: string = '';

  editArea: any = {

    areaName: "",
    description: "",
    outdoorMap: "",
    latitude: 0,
    longitude: 0,
    status: true
  };

  openEditAreaPopup(area: any) {
    this.selectedArea = area.id;
    this.editArea = {
      areaName: area.areaName,   // ✅ include projectId
      description: area.description,
      outdoorMap: area.outdoorMap,
      latitude: area.latitude,
      longitude: area.longitude,
      status: area.status ?? true
      //  countryId: area.countryId 
    };
    this.openEditArea = true;
  }
  closeEditAreaPopup() {
    this.openEditArea = false;      // hide the popup
    this.cdr.detectChanges();       // optional, forces Angular to refresh the view immediately
  }

  updateArea() {
    // Validate required fields
    const isValid =
      this.editArea.areaName &&
      this.editArea.description &&
      this.editArea.outdoorMap &&
      this.editArea.latitude !== null &&
      this.editArea.longitude !== null;

    if (!isValid) {
      alert("Please fill in all required fields before updating the area.");
      return;
    }

    this.role.updatearea(this.editArea, this.selectedArea).subscribe({
      next: (res: any) => {
        alert(res.message || 'Area updated successfully');

        // ✅ Close popup immediately
        this.closeEditAreaPopup();

        // Reload area list
        if (this.editArea.countryId) {
          this.loadArea(this.editArea.countryId);
        } else {
          this.loadArea(this.countryId);
        }
      },
      error: () => {
        alert("Error updating Area");
      }
    });
  }








  //delete Area

  openDeleteArea = false;
  selectedarea: string = '';

  openDeleteAreaPopup(area: any) {
    console.log("open");
    this.selectedarea = area.id;
    this.openDeleteArea = true;
  }

  closeDeleteAreaPopup() {
    this.openDeleteArea = false;
    this.cdr.detectChanges();
  }

  deleteArea() {
    this.role.Deletearea(this.selectedarea).subscribe({
      next: (res: any) => {
        alert(res.message || 'Area Deleted successfully');
        this.closeDeleteAreaPopup();
        this.loadArea(this.countryId);
      },
      error: () => {
        alert("Error Deleting Area");
      }
    });
  }









  // building under area

  openCreateBuilding = false;

  buildingId: string = "";


  buildingData: any = {
    areaId: "",
    buildingName: "",
    description: "",
    latitude: 0,
    longitude: 0,
    zoomLevel: 0,
    status: true
  };

  openCreateBuildingPopup(areaId: string) {
    console.log(this.areaId)

    this.areaId = areaId;
    this.openCreateBuilding = true;

    this.buildingData = {
      areaId: this.areaId,
      buildingName: "",
      description: "",
      latitude: 0,
      longitude: 0,
      zoomLevel: 0,
      status: true

    }

  }
  closeCreatebuilding() {
    this.openCreateBuilding = false;
    this.cdr.detectChanges();
  }

  createNewbuilding() {

    if (!this.buildingData.buildingName || !this.buildingData.description) {
      alert("Please fill all required fields");
      return;
    }

    this.role.createNewBuilding(this.areaId, this.buildingData).subscribe({
      next: (res: any) => {
        alert("Building Created");
        this.closeCreatebuilding();
      },
      error: (err) => {
        console.error("Error creating Building:", err);
        alert("Error creating Building");
      }
    });
  }






  //building summary

  // Store building per area
  // buildingByArea: { [areaId: string]: any[] } = {};

  expandedArea: Set<string> = new Set(); // track open dropdowns

  // toggleArea(areaId: string) {
  //   if (this.expandedArea.has(areaId)) {
  //     // Collapse
  //     this.expandedArea.delete(areaId);
  //   } else {
  //     // Expand + load buildings
  //     this.expandedArea.add(areaId);
  //     this.loadBuilding(areaId);
  //   }
  // }


  buildingByArea: { [key: string]: any[] } = {};

  toggleArea(areaId: string) {
    if (this.expandedArea.has(areaId)) {
      this.expandedArea.delete(areaId);
    } else {
      this.expandedArea.add(areaId);

      // 🔥 Initialize empty arrays for both zones and buildings
      this.zoneByArea[areaId] = [];
      this.buildingByArea[areaId] = [];

      // Load both zones and buildings for this area
      this.getAreaBasedZone(areaId);
      this.loadBuilding(areaId);
    }
  }






  // loadBuilding(areaId: string) {
  //   // toggle open/close
  //   if (this.expandedArea.has(areaId)) {
  //     this.expandedArea.delete(areaId);
  //     return;
  //   }

  //   this.role.getBuilding(areaId).subscribe({
  //     next: (res: any) => {
  //       // ✅ assign areas of this country
  //       this.buildingByArea[areaId] = Array.isArray(res) ? res : [];

  //       this.expandedArea.add(areaId);
  //       this.cdr.detectChanges();
  //     },
  //     error: () => {
  //       console.log("Error loading building");
  //     }
  //   });
  // }

  loadBuilding(areaId: string) {
    this.role.getBuilding(areaId).subscribe({
      next: (res: any) => {
        this.buildingByArea[areaId] = res;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('Error loading buildings for area', error);
        this.buildingByArea[areaId] = [];
      }
    });
  }











  //update building

  openEditBuilding = false;

  selectedBuilding: string = '';

  editBuilding: any = {

    buildingName: "",
    description: "",
    latitude: 0,
    longitude: 0,
    zoomLevel: 0,
    status: true
  };

  openEditBuildingPopup(building: any) {
    this.selectedBuilding = building.id;
    this.editBuilding = {
      buildingName: building.buildingName,   // ✅ include projectId
      description: building.description,
      zoomLevel: building.zoomLevel,
      latitude: building.latitude,
      longitude: building.longitude,
      status: building.status ?? true
      //  countryId: area.countryId 
    };
    this.openEditBuilding = true;
  }
  closeEditBuildingPopup() {
    this.openEditBuilding = false;
    this.cdr.detectChanges();
  }
  updateBuilding() {
    // ✅ validate required fields
    const isValid =
      this.editBuilding.buildingName &&
      this.editBuilding.description &&
      this.editBuilding.latitude !== null &&
      this.editBuilding.longitude !== null;

    if (!isValid) {
      alert("Please fill in all required fields before updating the building.");
      return;
    }
    this.role.updatebuilding(this.editBuilding, this.selectedBuilding).subscribe({
      next: (res: any) => {
        alert(res.message || 'building updated successfully');
        this.closeEditBuildingPopup();  // ✅ correct close method
        if (this.editBuilding.areaId) {
          this.loadBuilding(this.editBuilding.areaId);
        } else {
          this.loadBuilding(this.areaId);
        }
      },
      error: () => {
        alert("Error updating Building");
      }
    });
  }







  //delete building


  openDeleteBuilding = false;
  selectedbuiloding: string = '';

  openDeleteBuildingPopup(building: any) {

    this.selectedBuilding = building.id;
    this.openDeleteBuilding = true;
  }

  closeDeleteBuildingPopup() {
    this.openDeleteBuilding = false;
    this.cdr.detectChanges();
  }

  deleteBuilding() {
    this.role.Deletebuilding(this.selectedBuilding).subscribe({
      next: (res: any) => {
        alert(res.message || 'Building Deleted successfully');
        this.closeDeleteBuildingPopup();
        this.loadBuilding(this.areaId);
      },
      error: () => {
        alert("Error Deleting Building");
      }
    });
  }





  floorPreviewUrl: string | ArrayBuffer | null = null;




  // create floor under building

  openCreateFloor = false;
  selectedBuildingId: string = "";
  areaid: string = "";

  floorData: any = {
    id: "",
    buildingId: "",
    floorName: "",
    description: "",
    uploadMap: "",
    Status: true,
    createdAt: "",
    updatedAt: ""
  };

  openCreateFloorPopup(buildingId: string) {
    console.log("Building ID:", buildingId);
    this.selectedBuildingId = buildingId;
    this.openCreateFloor = true;

    // Reset floor form
    this.floorData = {
      buildingId: buildingId,
      id: "",
      floorName: "",
      description: "",
      uploadMap: null,
      Status: true,
      createdAt: "",
      updatedAt: ""
    };
    // Reset preview image
    this.floorPreviewUrl = null;
  }

  closeCreatefloor() {
    this.openCreateFloor = false;
    this.cdr.detectChanges();
  }

  onFloorFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (input && input.files && input.files.length > 0) {
      const file: File = input.files[0];
      this.floorData.uploadMap = file;

      const reader = new FileReader();  // Declare reader variable here

      reader.onload = () => {
        this.floorPreviewUrl = reader.result;
        this.cdr.detectChanges();  // trigger view update
      };
      reader.readAsDataURL(file);
    } else {
      this.floorPreviewUrl = null;
      this.cdr.detectChanges();  // trigger view update for clearing preview
    }
  }


  createNewfloor() {
    const formData = new FormData();

    // map JSON properties to backend expected parameters
    formData.append('BuildingId', this.floorData.buildingId);
    formData.append('FloorName', this.floorData.floorName);
    formData.append('Description', this.floorData.description);
    formData.append('Status', String(this.floorData.Status));

    // optional file upload

    // file input handler


    if (this.floorData.uploadMap) {
      formData.append('UploadMapFile', this.floorData.uploadMap, this.floorData.uploadMap.name);
    }

    console.log("FormData being sent:", formData);

    this.role.createNewFloor(this.selectedBuildingId, formData).subscribe({
      next: (res: any) => {
        alert("Floor Created");
        this.closeCreatefloor();
        this.loadFloor(this.selectedBuildingId); // reload floors
      },
      error: (err) => {
        console.error("Error creating floor:", err);
        alert("Error creating floor");
      }
    });
  }












  //Floor summary
  floors: any[] = [];

  floorByBuilding: { [buildingId: string]: any[] } = {};

  expandedBuilding: Set<string> = new Set();



  toggleBuilding(buildingId: string) {
    if (this.expandedBuilding.has(buildingId)) {
      // Collapse
      this.expandedBuilding.delete(buildingId);
    } else {
      // Expand + load floors
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
        this.floors = res; // ✅ store floors of this building     new 16

        this.floorByBuilding[buildingId] = Array.isArray(res) ? res : [];

        this.expandedBuilding.add(buildingId);
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading floor");
      }
    });
  }














  //update floor
  openEditFloor = false;
  selectedFloor: string = '';

  editFloor: any = {
    id: "",
    buildingId: "",
    floorName: "",
    description: "",
    status: true,
    uploadMap: "",        // can be File or string (URL)
    createdAt: "",
    updatedAt: ""
  };

  editFloorPreviewUrl: string | ArrayBuffer | null = null;  // <-- preview variable

  openEditFloorPopup(floor: any) {
    this.selectedFloor = floor.id;
    this.editFloor = {
      id: floor.id,
      buildingId: floor.buildingId,
      floorName: floor.floorName,
      description: floor.description,
      status: floor.status,
      uploadMap: floor.uploadMap || "",
      createdAt: floor.createdAt || "",
      updatedAt: floor.updatedAt || ""
    };

    // If there's already a map URL, show it in preview
    if (floor.uploadMap) {
      this.editFloorPreviewUrl = floor.uploadMap;
    } else {
      this.editFloorPreviewUrl = null;
    }

    this.openEditFloor = true;
  }

  closeEditFloorPopup() {
    this.openEditFloor = false;
    this.editFloorPreviewUrl = null;  // reset preview when closing
    this.cdr.detectChanges();
  }

  // handle new file selection
  onEditFloorFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (input && input.files && input.files.length > 0) {
      const file: File = input.files[0];
      this.editFloor.uploadMap = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.editFloorPreviewUrl = reader.result;  // update preview
        this.cdr.detectChanges();                  // <- force UI update!

      };
      reader.readAsDataURL(file);
    }


  }

  updateFloor() {
    const formData = new FormData();

    formData.append("BuildingId", this.editFloor.buildingId);
    formData.append("FloorName", this.editFloor.floorName);
    formData.append("Description", this.editFloor.description);
    formData.append("Status", String(this.editFloor.status));

    if (this.editFloor.uploadMap instanceof File) {
      formData.append(
        "UploadMapFile",
        this.editFloor.uploadMap,
        this.editFloor.uploadMap.name
      );
    }

    this.role.updatefloor(formData, this.selectedFloor).subscribe({
      next: (res: any) => {
        alert(res.message || "Floor updated successfully");
        this.closeEditFloorPopup();
        this.loadFloor(this.editFloor.buildingId);
      },
      error: (err) => {
        console.error("Error updating Floor:", err);
        alert("Error updating Floor");
      }
    });
  }









  //delete floor


  openDeleteFloor = false;
  selectedfloor: string = '';


  openDeleteFloorPopup(floor: any) {
    console.log("Floor object received:", floor);

    // Match your API property names exactly
    this.selectedfloor = floor.id;   // <-- check which one exists
    // this.buildingId = floor.buildingId;               // needed to reload floors
    this.openDeleteFloor = true;
  }

  closeDeleteFloorPopup() {
    this.openDeleteFloor = false;
    this.cdr.detectChanges();
  }

  deleteFloor() {
    // if (!this.selectedfloor) {
    //   alert("No floor selected for deletion");
    //   return;
    // }

    this.role.Deletefloor(this.selectedfloor).subscribe({
      next: (res: any) => {
        alert(res.message || 'Floor deleted successfully');
        this.closeDeleteFloorPopup();

        // reload floors for parent building
        if (this.buildingId) {
          this.loadFloor(this.buildingId);
        }
      },
      error: (err) => {
        console.error("Error deleting Floor", err);
        alert("Error Deleting Floor");
      }
    });
  }




  //zone under floor


  openCreateZone = false;
  selectedAreaId: string = "";
  floorid: string = "";

  zoneData: any = {
    FloorId: "",
    ZoneName: "",
    Description: "",
    TopZone: "",
    Priority: "",
    Status: true,
    UploadMapFile: ""

  };



  //zone summary

  zones: any[] = [];

  zoneByFloor: { [floorId: string]: any[] } = {};

  expandedFloor: Set<string> = new Set();
  toggleFloor(floorId: string) {
    if (this.expandedFloor.has(floorId)) {
      // Collapse
      this.expandedFloor.delete(floorId);
    } else {
      // Expand + load zones
      this.expandedFloor.add(floorId);
      this.loadZones(floorId);
    }
  }

  // ✅ load zones under a floor
  loadZones(floorId: string) {
    if (this.expandedFloor.has(floorId)) {
      this.expandedFloor.delete(floorId);
      return;
    }

    this.role.getZones(floorId).subscribe({
      next: (res: any) => {
        console.log("Zones for floor:", floorId, res);
        this.zones = res; // store zones of this floor (optional, if you need flat list)

        this.zoneByFloor[floorId] = Array.isArray(res) ? res : [];

        this.expandedFloor.add(floorId);
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading zones");
      }
    });
  }

  //map preview








  // ✅ open popup for creating a zone under a floor
  openCreateZonePopup(floorId: string) {
    console.log("Floor ID:", floorId);
    this.floorid = floorId;
    this.openCreateZone = true;

    // Reset zone form
    this.zoneData = {
      FloorId: floorId,
      ZoneName: "",
      Description: "",
      TopZone: true,
      Priority: "",
      Status: true,
      UploadMapFile: null   // file goes here
    };
    // Reset preview image
    this.zonePreviewUrl = null;
  }

  // ✅ close popup
  closeCreateZone() {
    this.openCreateZone = false;
    this.cdr.detectChanges();
  }

  // ✅ create new zone
  zonePreviewUrl: string | ArrayBuffer | null = null;       // for create
  createNewZone() {
    const formData = new FormData();

    // map JSON properties to backend expected parameters
    formData.append('floorId', this.zoneData.FloorId);
    formData.append('zoneName', this.zoneData.ZoneName);
    formData.append('description', this.zoneData.Description);
    formData.append('topZone', this.zoneData.TopZone);
    formData.append('priority', this.zoneData.Priority);
    formData.append('status', String(this.zoneData.Status));


    // optional file upload
    if (this.zoneData.UploadMapFile) {
      formData.append('UploadMapFile', this.zoneData.UploadMapFile, this.zoneData.UploadMapFile.name);
    }

    console.log("FormData being sent:", formData);

    this.role.createNewZone(this.floorid, formData).subscribe({
      next: (res: any) => {
        alert("Zone Created");
        this.closeCreateZone();
        this.loadZones(this.floorid); // ✅ reload zones for this floor
      },
      error: (err) => {
        console.error("Error creating zone:", err);
        alert("Error creating zone");
      }
    });
  }
  // -------------------- File Selection Handler (create/edit) --------------------
  onZoneFileSelected(event: Event, isEdit: boolean = false): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file: File = input.files[0];

      if (isEdit) {
        this.editZone.uploadMap = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.editZonePreviewUrl = reader.result;
          this.cdr.detectChanges();  // <-- Call *here*, inside onload
        };
        reader.readAsDataURL(file);
      } else {
        this.zoneData.UploadMapFile = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.zonePreviewUrl = reader.result;
          this.cdr.detectChanges();  // <-- Call *here*, inside onload
        };
        reader.readAsDataURL(file);
      }
    } else {
      if (isEdit) {
        this.editZone.uploadMap = null;
        this.editZonePreviewUrl = null;
        this.cdr.detectChanges();
      } else {
        this.zoneData.UploadMapFile = null;
        this.zonePreviewUrl = null;
        this.cdr.detectChanges();
      }
    }
  }







  // -------------------- Zone Edit --------------------
  openEditZone = false;
  selectedZone: string = '';

  editZone: any = {
    zoneName: "",
    description: "",
    topZone: true,
    priority: 0,
    status: true,
    uploadMap: "",        // can be File or string (URL)
  };

  editZonePreviewUrl: string | ArrayBuffer | null = null; // preview variable

  // Open popup + bind selected zone
  openEditZonePopup(zone: any) {
    console.log("Zone clicked:", zone);

    this.selectedZone = zone.id;
    this.editZone = {
      zoneName: zone.zoneName,
      description: zone.description,
      topZone: zone.topZone ?? true,
      priority: zone.priority ?? 0,
      status: zone.status,
      uploadMap: zone.uploadMap || "",
      floorId: zone.floorId   // ✅ add this
    };

    // Show preview if there's already a map URL
    if (zone.uploadMap) {
      this.editZonePreviewUrl = zone.uploadMap;
    } else {
      this.editZonePreviewUrl = null;
    }

    console.log("Mapped editZone:", this.editZone);
    this.openEditZone = true;
  }

  // Close popup + reset preview
  closeEditZonePopup() {
    this.openEditZone = false;
    this.editZonePreviewUrl = null;
    this.cdr.detectChanges();
  }




  // Update zone API call
  updateZone() {
    const formData = new FormData();

    formData.append("ZoneName", this.editZone.zoneName);
    formData.append("Description", this.editZone.description);
    formData.append("TopZone", String(this.editZone.topZone));
    formData.append("Priority", String(this.editZone.priority));
    formData.append("Status", String(this.editZone.status));

    // append file only if it is a File object
    if (this.editZone.uploadMap instanceof File) {
      formData.append("UploadMapFile", this.editZone.uploadMap, this.editZone.uploadMap.name);
    }

    this.role.updatezone(formData, this.selectedZone).subscribe({
      next: (res: any) => {
        alert(res.message || "Zone updated successfully");
        this.closeEditZonePopup();
        this.loadZones(this.editZone.floorId);// refresh zones under this floor
      },
      error: (err) => {
        console.error("Error updating Zone:", err);
        alert("Error updating Zone");
      }
    });
  }



  // delete zone

  openDeleteZone = false;
  selectedZoneId: string = '';
  parentFloorId: string = ''; // needed for reload

  openDeleteZonePopup(zone: any) {
    console.log("Zone object received:", zone);

    this.selectedZoneId = zone.id;      // assuming zone.id is correct
    this.parentFloorId = zone.floorId;  // so we can reload zones after delete
    this.openDeleteZone = true;
  }

  closeDeleteZonePopup() {
    this.openDeleteZone = false;
    this.cdr.detectChanges();
  }

  deleteZone() {
    this.role.Deletezone(this.selectedZoneId).subscribe({
      next: (res: any) => {
        alert(res.message || 'Zone deleted successfully');
        this.closeDeleteZonePopup();

        // reload zones under the parent floor
        if (this.parentFloorId) {
          this.loadZones(this.parentFloorId);
        }
      },
      error: (err) => {
        console.error("Error deleting Zone", err);
        alert("Error Deleting Zone");
      }
    });
  }






  //Subzone under zone


  subZones: any[] = [];

  subZoneByZone: { [zoneId: string]: any[] } = {};

  expandedZone: Set<string> = new Set();


  toggleZone(zoneId: string) {
    if (this.expandedZone.has(zoneId)) {
      // Collapse
      this.expandedZone.delete(zoneId);
    } else {
      // Expand + load subzones
      this.expandedZone.add(zoneId);
      this.loadSubZones(zoneId);
    }
  }

  // ✅ load subzones under a zone
  loadSubZones(zoneId: string) {
    if (this.expandedZone.has(zoneId)) {
      this.expandedZone.delete(zoneId); // collapse if already open
      return;
    }

    this.role.getSubZones(zoneId).subscribe({
      next: (res: any) => {
        console.log("SubZones for zone:", zoneId, res);
        this.subZones = res; // optional flat list (like floors)

        this.subZoneByZone[zoneId] = Array.isArray(res) ? res : [];

        this.expandedZone.add(zoneId);
        this.cdr.detectChanges();
      },
      error: () => {
        console.error("Error loading subzones");
      }
    });
  }








  //create sub zone


  // popup control
  openCreateSubZone = false;

  // selected zone for reference
  zoneId: string = "";
  subZonePreviewUrl: string | ArrayBuffer | null = null; // ✅ add this for subzone upload preview

  // form model
  subZoneData: any = {
    ZoneId: "",
    SubZoneName: "",
    Description: "",
    TopSubZone: true,
    Priority: 0,
    Status: true,
    UploadMapFile: null
  };

  // ✅ open popup for creating a subzone under a zone
  openCreateSubZonePopup(zoneId: string) {
    console.log("Zone ID:", zoneId);
    this.zoneId = zoneId;
    this.openCreateSubZone = true;


    // Reset form
    this.subZoneData = {
      ZoneId: zoneId,
      SubZoneName: "",
      Description: "",
      TopSubZone: true,
      Priority: 0,
      Status: true,
      UploadMapFile: null
    };

    // Reset preview image
    this.subZonePreviewUrl = null;
  }

  // ✅ close popup
  closeCreateSubZone() {
    this.openCreateSubZone = false;
    this.cdr.detectChanges();
  }



  // extra property for preview
  previewUrl: string | ArrayBuffer | null = null;

  // ✅ file input handler with preview
  onSubZoneFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (input && input.files && input.files.length > 0) {
      const file = input.files[0];
      this.subZoneData.UploadMapFile = file;

      // generate preview
      const reader = new FileReader();
      reader.onload = () => {
        console.log("Preview generated:", reader.result);
        this.subZonePreviewUrl = reader.result; // ✅ FIXED: update subZonePreviewUrl
        this.cdr.detectChanges();
      };

      reader.readAsDataURL(file);
    }
  }



  // ✅ create new subzone
  createNewSubZone() {
    const formData = new FormData();
    formData.append("ZoneId", this.subZoneData.ZoneId);
    formData.append("SubZoneName", this.subZoneData.SubZoneName);
    formData.append("Description", this.subZoneData.Description);
    formData.append("TopSubZone", String(this.subZoneData.TopSubZone));
    formData.append("Priority", String(this.subZoneData.Priority));
    formData.append("Status", String(this.subZoneData.Status));

    if (this.subZoneData.UploadMapFile) {
      formData.append(
        "UploadMapFile",
        this.subZoneData.UploadMapFile,
        this.subZoneData.UploadMapFile.name
      );
    }

    this.role.createSubZone(this.zoneId, formData).subscribe({
      next: (res: any) => {
        alert("SubZone Created");
        this.closeCreateSubZone();
        this.loadSubZones(this.zoneId); // reload subzones under this zone
      },
      error: (err) => {
        console.error("Error creating subzone:", err);
        alert("Error creating subzone");
      }
    });
  }














  // -------------------- SubZone Edit --------------------
  openEditSubZone = false;

  selectedSubZoneId: string = ''; // store SubZone ID



  editSubZone: any = {
    ZoneId: "",
    SubZoneName: "",
    Description: "",
    TopSubZone: true,
    Priority: 0,
    Status: true,
    UploadMapFile: null
  };

  // open popup + bind selected subzone
  openEditSubZonePopup(subZone: any) {
    console.log("SubZone clicked:", subZone);

    this.selectedSubZoneId = subZone.id || subZone.subZoneId || subZone._id;
    this.editSubZone = {
      ZoneId: subZone.zoneId,
      SubZoneName: subZone.subZoneName,
      Description: subZone.description,
      TopSubZone: subZone.topSubZone ?? true,
      Priority: subZone.priority ?? 0,
      Status: subZone.status,
      UploadMapFile: null // start with null; user can select new file
    };

    // ✅ Show existing image in preview
    this.editSubZonePreviewUrl = subZone.uploadMap || null;

    this.openEditSubZone = true;
  }


  // close popup
  closeEditSubZonePopup() {
    this.openEditSubZone = false;
    this.cdr.detectChanges();
  }

  // file input handler for edit
  editSubZonePreviewUrl: string | ArrayBuffer | null = null; // preview image

  onEditSubZoneFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.editSubZone.UploadMapFile = file;

      // generate preview for newly selected file
      const reader = new FileReader();
      reader.onload = () => {
        this.editSubZonePreviewUrl = reader.result;
        this.cdr.detectChanges(); // ensure change detection
      };
      reader.readAsDataURL(file);
    }
  }


  // update subzone API call
  updateSubZone() {

    // ✅ Simple validation
    if (
      !this.editSubZone.SubZoneName?.trim() ||
      !this.editSubZone.Description?.trim() ||
      this.editSubZone.Priority === null || this.editSubZone.Priority === undefined
    ) {
      alert("Please fill in all required fields: SubZone Name, Description, Priority");
      return; // stop the API call
    }


    const formData = new FormData();

    formData.append("ZoneId", this.editSubZone.ZoneId);
    formData.append("SubZoneName", this.editSubZone.SubZoneName);
    formData.append("Description", this.editSubZone.Description);
    formData.append("TopSubZone", String(this.editSubZone.TopSubZone));
    formData.append("Priority", String(this.editSubZone.Priority));
    formData.append("Status", String(this.editSubZone.Status));

    if (this.editSubZone.UploadMapFile) {
      formData.append(
        "UploadMapFile",
        this.editSubZone.UploadMapFile,
        this.editSubZone.UploadMapFile.name
      );
    }

    this.role.updateSubZone(formData, this.selectedSubZoneId).subscribe({
      next: (res: any) => {
        alert(res.message || "SubZone updated successfully");
        this.closeEditSubZonePopup();
        this.loadSubZones(this.editSubZone.ZoneId);
      },
      error: (err) => {
        console.error("Error updating SubZone:", err);
        alert("Error updating SubZone");
      }
    });
  }












  // -------------------- SubZone Delete --------------------
  openDeleteSubZone = false;

  parentZoneId: string = ''; // needed for reload

  // open popup and store IDs
  openDeleteSubZonePopup(subZone: any) {
    console.log("SubZone object received:", subZone);

    this.selectedSubZoneId = subZone.id || subZone.subZoneId || subZone._id;
    this.parentZoneId = subZone.zoneId;  // so we can reload subzones after delete
    this.openDeleteSubZone = true;
  }

  // close popup
  closeDeleteSubZonePopup() {
    this.openDeleteSubZone = false;
    this.cdr.detectChanges();
  }

  // confirm delete
  deleteSubZone() {
    this.role.Deletesubzone(this.selectedSubZoneId).subscribe({
      next: (res: any) => {
        alert(res.message || "SubZone deleted successfully");
        this.closeDeleteSubZonePopup();

        // reload subzones under the parent zone
        if (this.parentZoneId) {
          this.loadSubZones(this.parentZoneId);
        }
      },
      error: (err) => {
        console.error("Error deleting SubZone", err);
        alert("Error deleting SubZone");
      }
    });
  }






  todayString = new Date().toISOString().split('T')[0];
  validateWeeks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(this.createproject.weekStart);
    const end = new Date(this.createproject.weekEnd);

    if (start < today) {
      alert("Week start cannot be earlier than today");
      return false;
    }
    if (end < today) {
      alert("Week end cannot be earlier than today");
      return false;
    }
    if (end < start) {
      alert("Week end cannot be earlier than start date");
      return false;
    }

    return true;
  }
  onSubmit() {
    if (!this.validateWeeks()) return;

    // Continue form submission
  }





  openCreateAreaZone: boolean = false;

  zoneAreaData: any = {
    zoneName: "",
    description: "",
    latitude: '',
    longitude: '',
    topZone: true,
    priority: "",
    status: true,
  }


  createAreaZone() {
    this.role.createAreaZone(this.selectedAreaId, this.zoneAreaData).subscribe({
      next: (res: any) => {
        alert("Area based Zone Created Successfully");
        this.closeAreaZone();

        // reload zones
        this.getAreaBasedZone(this.selectedAreaId);

        // ensure area stays expanded
        this.expandedArea.add(this.selectedAreaId);
      },
      error: () => {
        alert("error creating zone");
      }
    });
  }


  closeAreaZone() {
    this.openCreateAreaZone = false;
  }

  openAreaZone(areaId: string) {
    this.selectedAreaId = areaId;
    this.openCreateAreaZone = true;

    this.zoneAreaData = {
      zoneName: "",
      description: "",
      latitude: '',
      longitude: '',
      topZone: true,
      priority: "",
      status: true,
    }
  }


  zoneByArea: { [areaId: string]: any[] } = {};
  getAreaBasedZone(areaId: string) {
    this.role.getAreaZone(areaId).subscribe({
      next: (res: any) => {
        console.log('Area Zones for', areaId, ':', res);
        this.zoneByArea[areaId] = res;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('Error loading area based zones', error);
        this.zoneByArea[areaId] = [];
      }
    });
  }


  openDeleteAreaZone: boolean = false;
  selectedAreaBasedZoneid = "";

  cancelDeleteAreaZone() {
    this.openDeleteAreaZone = false;
  }

  openDeleteAreaZonePopup(zoneid: string) {
    this.selectedAreaBasedZoneid = zoneid
    this.openDeleteAreaZone = true;
  }

  deleteAreaZone() {
    this.role.deleteAreaBasedZone(this.selectedAreaBasedZoneid).subscribe({
      next: (res: any) => {
        alert("Area Baes Zone Deleted Successfully");
        this.cancelDeleteAreaZone();
        this.getAreaBasedZone(this.selectedAreaId);
      },
      error: () => {
        console.log("error deleting Area Based Zone")

      }
    })
  }


  openUpdateAreaZone: boolean = false;

  cancelAreaZone() {
    this.openUpdateAreaZone = false;
  }

  openUpdateAreaZonePopup(zone: any) {
    this.selectedZoneId = zone.id;
    this.openUpdateAreaZone = true;
    this.zoneAreaData = {
      zoneName: zone.zoneName,
      description: zone.description,
      latitude:zone.latitude,
      longitude:zone.longitude,
      topZone: zone.topZone,
      priority: zone.priority,
      status: zone.status,
    }


  }

  updateAreaZone() {
    this.role.updateAreaBasedZone(this.selectedZoneId, this.zoneAreaData).subscribe({
      next: (res: any) => {
        alert(res.message);
        this.cancelAreaZone();
        this.getAreaBasedZone(this.selectedAreaId);
      },
      error: () => {
        alert("error updating Area Based Zone")
      }
    })
  }

}












