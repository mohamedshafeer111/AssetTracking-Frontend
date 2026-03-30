import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Roleservice } from '../../../service/role/roleservice';
import { CommonModule } from '@angular/common';
import { Router } from 'express';

@Component({
  selector: 'app-createrole',
  imports: [RouterModule,FormsModule,CommonModule],
  templateUrl: './createrole.html',
  styleUrl: './createrole.css'
})
export class Createrole {


  activeTab: string = 'project'; // 👈 default tab
  selectedTimeRange: string = 'day';

  projects: any[] = [];
  expandedProjects = new Set<string>();
  countriesByProject: { [projectId: string]: any[] } = {};
  currentProjectId: string | null = null;
  expandedCountry: Set<string> = new Set();
  areaByCountry: { [countryId: string]: any[] } = {};
  expandedArea: Set<string> = new Set();
  buildingByArea: { [areaId: string]: any[] } = {};
  expandedBuilding: Set<string> = new Set();
  floorByBuilding: { [buildingId: string]: any[] } = {};
  expandedFloor: Set<string> = new Set();
  zoneByFloor: { [floorId: string]: any[] } = {};
  expandedZone: Set<string> = new Set();
  subZoneByZone: { [zoneId: string]: any[] } = {};

  constructor(private role: Roleservice, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadProject();
  }

  // ... rest of your code unchanged ...






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




loadCountries(projectId: string) {
  // toggle open/close
  if (this.expandedProjects.has(projectId)) {
    this.expandedProjects.delete(projectId);
    return;
  }

  this.role.countryGetById(projectId).subscribe({
    next: (res: any) => {
      // ✅ Assign only array data
      this.countriesByProject[projectId] = Array.isArray(res) ? res : [];

      // ✅ If the project is already selected, select all its countries too
      if (this.selectedProjects.has(projectId)) {
        for (const country of this.countriesByProject[projectId]) {
          this.selectedCountries.add(country.id);
        }
      }

      this.expandedProjects.add(projectId);
      this.cdr.detectChanges();
    },
    error: () => {
      console.log("Error loading countries");
    }
  });
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

        // ✅ Auto-select areas if parent country is already selected
        if (this.selectedCountries.has(Number(countryId))) {
          for (const area of this.areaByCountry[countryId]) {
            this.selectedAreas.add(area.id);
          }
        }

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

    // ✅ Ensure selection consistency even when re-opening
    if (this.selectedCountries.has(Number(countryId))) {
      for (const area of this.areaByCountry[countryId]) {
        this.selectedAreas.add(area.id);
      }
    }

    this.cdr.detectChanges();
  }
}





loadBuilding(areaId: string) {
  // toggle open/close
  if (this.expandedArea.has(areaId)) {
    this.expandedArea.delete(areaId);
    return;
  }

  // Fetch buildings for this area
  this.role.getBuilding(areaId).subscribe({
    next: (res: any) => {
      this.buildingByArea[areaId] = Array.isArray(res) ? res : [];

      // ✅ If the parent area is already selected, select all its buildings
      if (this.selectedAreas.has(Number(areaId))) {
        for (const building of this.buildingByArea[areaId]) {
          this.selectedBuildings.add(building.id);
        }
      }

      this.expandedArea.add(areaId);
      this.cdr.detectChanges();
    },
    error: () => {
      console.log("Error loading building");
    }
  });
}


  floors: any[] = [];
loadFloor(buildingId: string) {
  // toggle open/close
  if (this.expandedBuilding.has(buildingId)) {
    this.expandedBuilding.delete(buildingId);
    return;
  }

  this.role.getFloor(buildingId).subscribe({
    next: (res: any) => {
      console.log("Floors for building:", buildingId, res);

      // ✅ Store floors of this building
      this.floors = Array.isArray(res) ? res : [];
      this.floorByBuilding[buildingId] = this.floors;

      // ✅ If parent building is already selected, auto-select all floors
      if (this.selectedBuildings.has(Number(buildingId))) {
        for (const floor of this.floors) {
          this.selectedFloors.add(floor.id);
        }
      }

      this.expandedBuilding.add(buildingId);
      this.cdr.detectChanges();
    },
    error: () => {
      console.log("Error loading floor");
    }
  });
}




  zones: any[] = [];
loadZones(floorId: string) {
  // Toggle open/close
  if (this.expandedFloor.has(floorId)) {
    this.expandedFloor.delete(floorId);
    return;
  }

  this.role.getZones(floorId).subscribe({
    next: (res: any) => {
      console.log("Zones for floor:", floorId, res);

      // ✅ Store zones of this floor
      this.zones = Array.isArray(res) ? res : [];
      this.zoneByFloor[floorId] = this.zones;

      // ✅ Auto-select all zones if parent floor is already selected
      if (this.selectedFloors.has(Number(floorId))) {
        for (const zone of this.zones) {
          this.selectedZones.add(zone.id);
        }
      }

      this.expandedFloor.add(floorId);
      this.cdr.detectChanges();
    },
    error: () => {
      console.log("Error loading zones");
    }
  });
}





  subZones: any[] = [];
loadSubZones(zoneId: string) {
  // Toggle open/close
  if (this.expandedZone.has(zoneId)) {
    this.expandedZone.delete(zoneId); // collapse if already open
    return;
  }

  this.role.getSubZones(zoneId).subscribe({
    next: (res: any) => {
      console.log("SubZones for zone:", zoneId, res);

      // ✅ Store subzones
      this.subZones = Array.isArray(res) ? res : [];
      this.subZoneByZone[zoneId] = this.subZones;

      // ✅ If the zone is already selected, auto-select all subzones
      if (this.selectedZones.has(Number(zoneId))) {
        for (const subZone of this.subZones) {
          this.selectedSubZones.add(subZone.id);
        }
      }

      this.expandedZone.add(zoneId);
      this.cdr.detectChanges();
    },
    error: () => {
      console.error("Error loading subzones");
    }
  });
}










  // 🔹 Select all countries, areas, buildings, etc. under a project
selectAllChildren(projectId: string) {
  const countries = this.countriesByProject[projectId] || [];
  for (const country of countries) {
    this.selectedCountries.add(country.id);

    const areas = this.areaByCountry[country.id] || [];
    for (const area of areas) {
      this.selectedAreas.add(area.id);

      const buildings = this.buildingByArea[area.id] || [];
      for (const building of buildings) {
        this.selectedBuildings.add(building.id);

        const floors = this.floorByBuilding[building.id] || [];
        for (const floor of floors) {
          this.selectedFloors.add(floor.id);

          const zones = this.zoneByFloor[floor.id] || [];
          for (const zone of zones) {
            this.selectedZones.add(zone.id);

            const subZones = this.subZoneByZone[zone.id] || [];
            for (const subZone of subZones) {
              this.selectedSubZones.add(subZone.id);
            }
          }
        }
      }
    }
  }
}

// 🔹 Unselect all children when a project is unchecked
unselectAllChildren(projectId: string) {
  const countries = this.countriesByProject[projectId] || [];
  for (const country of countries) {
    this.selectedCountries.delete(country.id);

    const areas = this.areaByCountry[country.id] || [];
    for (const area of areas) {
      this.selectedAreas.delete(area.id);

      const buildings = this.buildingByArea[area.id] || [];
      for (const building of buildings) {
        this.selectedBuildings.delete(building.id);

        const floors = this.floorByBuilding[building.id] || [];
        for (const floor of floors) {
          this.selectedFloors.delete(floor.id);

          const zones = this.zoneByFloor[floor.id] || [];
          for (const zone of zones) {
            this.selectedZones.delete(zone.id);

            const subZones = this.subZoneByZone[zone.id] || [];
            for (const subZone of subZones) {
              this.selectedSubZones.delete(subZone.id);
            }
          }
        }
      }
    }
  }
}





  // Store selected projects in a Set for easy add/remove
selectedProjects: Set<string> = new Set();

toggleProjectSelection(projectId: string) {
  if (this.selectedProjects.has(projectId)) {
    // 🔹 Unselect everything under this project
    this.selectedProjects.delete(projectId);
    this.unselectAllChildren(projectId);
  } else {
    // 🔹 Select everything under this project
    this.selectedProjects.add(projectId);
    this.selectAllChildren(projectId);
  }
  console.log('Selected Projects:', Array.from(this.selectedProjects));
}






selectedCountries = new Set<number>();

toggleCountrySelection(countryId: number) {
  if (this.selectedCountries.has(countryId)) {
    this.selectedCountries.delete(countryId);
  } else {
    this.selectedCountries.add(countryId);
  }
  console.log('Selected Countries:', Array.from(this.selectedCountries));
}


selectedAreas: Set<number> = new Set();

toggleAreaSelection(areaId: number) {
  if (this.selectedAreas.has(areaId)) {
    this.selectedAreas.delete(areaId);
  } else {
    this.selectedAreas.add(areaId);
  }
  console.log('Selected Areas:', Array.from(this.selectedAreas));
}



selectedBuildings: Set<number> = new Set();

toggleBuildingSelection(buildingId: number) {
  if (this.selectedBuildings.has(buildingId)) {
    this.selectedBuildings.delete(buildingId);
  } else {
    this.selectedBuildings.add(buildingId);
  }
  console.log('Selected Buildings:', Array.from(this.selectedBuildings));
}


selectedFloors: Set<number> = new Set();

toggleFloorSelection(floorId: number) {
  if (this.selectedFloors.has(floorId)) {
    this.selectedFloors.delete(floorId);
  } else {
    this.selectedFloors.add(floorId);
  }
  console.log('Selected Floors:', Array.from(this.selectedFloors));
}




selectedZones: Set<number> = new Set();

toggleZoneSelection(zoneId: number) {
  if (this.selectedZones.has(zoneId)) {
    this.selectedZones.delete(zoneId);
  } else {
    this.selectedZones.add(zoneId);
  }
  console.log('Selected Zones:', Array.from(this.selectedZones));
}


selectedSubZones: Set<number> = new Set();

toggleSubZoneSelection(subZoneId: number) {
  if (this.selectedSubZones.has(subZoneId)) {
    this.selectedSubZones.delete(subZoneId);
  } else {
    this.selectedSubZones.add(subZoneId);
  }
  console.log('Selected SubZones:', Array.from(this.selectedSubZones));
}











roles: any[] = [];

  loadRole() {
    this.role.getRole().subscribe({
      next: (res: any) => {
        this.roles = res;
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error loading role")
      }
    })
  }


createRoles = {
  roleName: "",
  description: "",
  createdBy: "",
  createdAt: new Date().toISOString(),
  assignPermissions: [] as { featureName: string; status: boolean }[]
};

modules = ['Dashboard', 'Tracking', 'Reports', 'Process & Automation', 'Administration'];



onCheckboxChange(module: string, checked: boolean) {
  if (checked) {
    this.createRoles.assignPermissions.push({ featureName: module, status: true });
  } else {
    this.createRoles.assignPermissions = this.createRoles.assignPermissions.filter(
      p => p.featureName !== module
    );
  }
}

isChecked(module: string): boolean {
  return this.createRoles.assignPermissions.some(p => p.featureName === module);
}



  createRole() {
    if (!this.createRoles.roleName || !this.createRoles.description) {
      alert("Please fill all fields");
      return;
    }

    this.role.createNewRole(this.createRoles).subscribe({
      next: (res: any) => {
        alert(res.message || "Role created successfully");
        // this.router.navigate(['/role']);   // now it works ✔
      },
      error: () => {
        alert("Error creating role");
      }
    });
  }


}