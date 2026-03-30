import { Routes } from '@angular/router';
import { Login } from './components/pages/login/login/login';
import { Otp } from './components/pages/otp/otp/otp';
import { Navbar } from './components/navbar/navbar/navbar';
import { People } from './components/pages/people/people/people';
import { Dashboard } from './components/pages/dashboard/dashboard/dashboard';
import { UserManagement } from './components/pages/userManagement/user-management/user-management';
import { Role } from './components/pages/Role/role/role';
import { Project } from './components/pages/project/project/project';
import { Devices } from './components/pages/devices/devices/devices';
import { Events } from './components/pages/events/events/events';
import { Live } from './components/pages/live/live/live';
import { Reports } from './components/pages/Reports/reports/reports';
import { Historicals } from './components/pages/Historicals/historicals/historicals';
import { Createreport } from './components/pages/createreport/createreport/createreport';
import { Createrole } from './components/pages/createrole/createrole/createrole';
import { Processautomation } from './components/pages/processautomation/processautomation/processautomation';
import { Createprocessautomation } from './components/pages/createprocessautomation/createprocessautomation/createprocessautomation';
import { Licensemanagement } from './components/pages/lincemanagement/licensemanagement/licensemanagement';
import { Viewreport } from './components/pages/viewreport/viewreport';
import { Overview } from './components/pages/overview/overview/overview';
import { Detailed } from './components/pages/detailed/detailed/detailed';
import { Personaldashboard } from './components/pages/personaldashboard/personaldashboard/personaldashboard';
import { Customerdashboard } from './components/pages/customerdashboard/customerdashboard/customerdashboard';
import { Newuser } from './components/pages/newuser/newuser/newuser';
import { Projecthierarchy } from './components/pages/projecthierarchy/projecthierarchy/projecthierarchy';
import { Asset } from './components/pages/asset/asset/asset';
import { Editprocessautomation } from './components/pages/editprocessautomation/editprocessautomation/editprocessautomation';
import { Editrole } from './components/pages/editrole/editrole/editrole';




export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'otp', component: Otp },
  {
    path: '',
    component: Navbar,   // 👈 Parent (Navbar)
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: '', redirectTo: 'project', pathMatch: 'full' },
      { path: 'project', component: Project },
      { path: 'people', component: People },
      { path: 'events', component: Events },
      { path: 'user-management', component: UserManagement },
      { path: 'role', component: Role },

      { path: 'devices', component: Devices },
      { path: 'live', component: Live },
      { path: 'reports', component: Reports },
      { path: 'historicals', component: Historicals },
      { path: 'createreport', component: Createreport },
      { path: 'createrole', component: Createrole },
      { path: 'processautomation', component: Processautomation },
      { path: 'createprocessautomation', component: Createprocessautomation },
      { path: 'licensemanagement', component: Licensemanagement },
      { path: 'viewreport', component: Viewreport },
      { path: 'viewreport/:id', component: Viewreport },//new
      { path: 'overview', component: Overview },
      { path: 'detailed', component: Detailed },
      { path: 'personalDashboard', component: Personaldashboard },
      { path: 'customerdashboard', component: Customerdashboard },
      {
        path: 'projecthierarchy', component: Projecthierarchy
      },
      { path: 'asset', component: Asset },
      {   path: 'editprocessautomation/:item.bsonId', component:Editprocessautomation},
        { path: 'editrole/:id', component: Editrole }
    ]
  }



];



