import { ChangeDetectorRef, Component ,OnInit} from '@angular/core';
import { Roleservice } from '../../../service/role/roleservice';
import { ActivatedRoute, Router, RouterModule} from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editrole',
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './editrole.html',
  styleUrl: './editrole.css'
})
export class Editrole implements OnInit {

  constructor(
    private role: Roleservice,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router:Router
  
  ) {}

  roleId: string = '';

editRoles = {
  roleName: "",
  description: "",
  createdBy: "",
  createdAt: "",
  assignPermissions: [] as { featureName: string; status: boolean }[]
};
  modules = ['Dashboard', 'Tracking', 'Events', 'Reports', 'Process&Automation', 'Administration'];

ngOnInit(): void {
  this.roleId = this.route.snapshot.paramMap.get('id') || '';
  
  // Read data passed from role list
  const state = history.state.role;
  if (state) {
    this.editRoles.roleName = state.roleName;
    this.editRoles.description = state.description;
    this.editRoles.createdBy = state.createdBy || '';
    this.editRoles.createdAt = state.createdAt || '';
    this.editRoles.assignPermissions = state.assignPermissions || [];
    this.cdr.detectChanges();
  }
}

loadRoleById() {
  console.log('Loading role id:', this.roleId);   // ← check id

  this.role.getRoleById(this.roleId).subscribe({
    next: (res: any) => {
      console.log('Role data:', res);              // ← check full response structure
      this.editRoles.roleName = res.roleName;
      this.editRoles.description = res.description;
      this.editRoles.createdBy = res.createdBy;
      this.editRoles.createdAt = res.createdAt;
      this.editRoles.assignPermissions = res.assignPermissions || [];
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.log('Load error:', err);             // ← check error
    }
  });
}

  onCheckboxChange(module: string, checked: boolean) {
    if (checked) {
      this.editRoles.assignPermissions.push({ featureName: module, status: true });
    } else {
      this.editRoles.assignPermissions = this.editRoles.assignPermissions.filter(
        p => p.featureName !== module
      );
    }
  }

  isChecked(module: string): boolean {
    return this.editRoles.assignPermissions.some(p => p.featureName === module);
  }

updateRole() {
  if (!this.editRoles.roleName || !this.editRoles.description) {
    alert("Please fill all fields");
    return;
  }

  console.log('Sending:', this.editRoles);      // ← check this in browser console
  console.log('Role ID:', this.roleId);          // ← make sure id is correct

  this.role.updateRole(this.editRoles, this.roleId).subscribe({
    next: (res: any) => {
      alert(res.message || "Role updated successfully");
      this.router.navigate(['/role']);
    },
    error: (err) => {
      console.log('Update error:', err);         // ← check full error details
      alert("Error updating role");
    }
  });
}
}
