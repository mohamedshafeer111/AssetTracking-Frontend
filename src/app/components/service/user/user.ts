// src/app/services/user.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class User {


  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  sendOtp(users: any) {
    return this.http.post(`${this.apiUrl}auth/login`, users);
  }


  verifyOtp(otp: any): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/verify-otp`, otp);
  }

  getUser() {
    return this.http.get(`${this.apiUrl}users/summary`)
  }

  addUser(newUser: any) {
    return this.http.post(`${this.apiUrl}users/create`, newUser)
  }

  updateUsers(updateUser: any, id: string) {
    return this.http.put(`${this.apiUrl}users/update/${id}`, updateUser)
  }

  DeleteUsers(userId: string) {
    return this.http.delete(`${this.apiUrl}users/delete/${userId}`)
  }





  //event summary 

  // user.service.ts
  loadevent(pageNumber: number, pageSize: number) {
    return this.http.get(`${this.apiUrl}EventLog/summary?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  }




  // 7-2-26





  technologyByCount() {
  return this.http.get(`${this.apiUrl}deviceadd/count-by-technology`);
}





getAssetByTechnology(technology: string) {
  return this.http.get<any>(
    `${this.apiUrl}Asset/by-technology`,
    {
      params: {
        technology
      }
    }
  );
}









// 20-2-26


getRoleById(roleId: string): Observable<any> {
  return this.http.get(`${this.apiUrl}Role/${roleId}`);
}

getAlert(pageNumber: number = 1, pageSize: number = 10){
  return this.http.get(`${this.apiUrl}device-notifications?pageNumber=${pageNumber}&pageSize=${pageSize}`)
}

}
