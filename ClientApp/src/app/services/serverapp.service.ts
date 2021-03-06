import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IVlastnik, IVybraneLv } from '../components/models/models';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs/operators';

@Injectable()
export class ServerAppService {
  constructor(private http: HttpClient, private toastr: ToastrService) {

  }

  public getLvInfo(telId: string): Observable<IVlastnik[]> {
    return this.http.get<IVlastnik[]>(`api/VfkData/${telId}`);
  }

  public export(vybranaLv: IVybraneLv[]): Observable<any> {
    return this.http
      .post('api/VfkData/generate/excel', vybranaLv, {
        responseType: 'blob',
        observe: 'response'
      })
      .pipe(
        map(res => {
          const contentDisposition = res.headers.get('Content-Disposition');
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(contentDisposition);
          let fileName = `nabidka_${new Date()}.xlsx`;
          if (matches != null && matches[1]) {
            fileName = matches[1].replace(/['"]/g, '');
          }
          const url = window.URL.createObjectURL(res.body);
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.setAttribute('style', 'display: none');
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        })
    );
  }
}
