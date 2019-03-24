import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IVlastnik } from '../components/models/models';

@Injectable()
export class ServerAppService {
  constructor(private http: HttpClient) {

  }

  public getVlastnici(telId: string): Observable<IVlastnik[]> {
    return this.http.get<IVlastnik[]>(`http://localhost:8081/api/VfkData/${telId}`);
  }
}
