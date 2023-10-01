import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient, private environmentService: EnvironmentService) {}

  getData(): Observable<any> {
    const apiUrl = this.environmentService.environment.apiUrl;
    return this.http.get(apiUrl); // Make a GET request to the correct API URL
  }
}
