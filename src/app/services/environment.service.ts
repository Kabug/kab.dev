import { Injectable } from '@angular/core';
import { environment as devEnvironment } from 'src/environments/environment';
import { environment as prodEnvironment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  get environment() {
    return process.env.NODE_ENV === 'production' ? prodEnvironment : devEnvironment;
  }
}
