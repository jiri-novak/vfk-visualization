import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICreateExport, IExport, IExportDetails, IExportId, IGenerateExcel, IKatuze, ILvInfo, ISession, ISetPriceAndComment } from '../components/models/models';
import { map } from 'rxjs/operators';

@Injectable()
export class ServerAppService {
  constructor(private http: HttpClient) {
  }

  public getLvInfo(telId: string): Observable<ILvInfo> {
    return this.http.get<ILvInfo>(`api/VfkData/${telId}`);
  }

  public getSession(): Observable<ISession> {
    return this.http.get<ISession>(`api/vfkData/session`);
  }

  public setActiveKu(katuze: IKatuze): Observable<ISession> {
    return this.http.post<ISession>(`api/vfkData/session/katuze`, katuze);
  }

  public setNoActiveKu(): Observable<ISession> {
    return this.http.delete<ISession>(`api/vfkData/session/katuze`);
  }

  public setActiveExport(exportId: IExportId): Observable<ISession> {
    return this.http.post<ISession>(`api/vfkData/session/export`, { exportId: exportId.id });
  }

  public setNoActiveExport(): Observable<ISession> {
    return this.http.delete<ISession>(`api/vfkData/session/export`);
  }

  public setPriceAndComment(telId: number, setPriceAndComment: ISetPriceAndComment): Observable<Object> {
    return this.http.post(`api/vfkData/${telId}/price-and-comment`, setPriceAndComment);
  }

  public createExport(createExport: ICreateExport): Observable<IExport> {
    return this.http.post<IExport>(`api/vfkData/export`, createExport);
  }

  public deleteExport(id: number): Observable<ISession> {
    return this.http.delete<ISession>(`api/vfkData/export/${id}`);
  }

  public getAllExports(): Observable<IExport[]> {
    return this.http.get<IExport[]>(`api/vfkData/exports`);
  }

  public getExports(startsWith?: string): Observable<IExportId[]> {
    const params = new HttpParams().append('startsWith', startsWith);
    return this.http.get<IExportId[]>(`api/vfkData/export`, { params });
  }

  public getKus(startsWith?: string): Observable<IKatuze[]> {
    const params = new HttpParams().append('startsWith', startsWith);
    return this.http.get<IKatuze[]>(`api/vfkData/kus`, { params });
  }

  public getExportDetails(exportId: number): Observable<IExportDetails> {
    return this.http.get<IExportDetails>(`api/vfkData/export/${exportId}`);
  }

  public export(generateExcel: IGenerateExcel): Observable<any> {
    return this.http
      .post('api/VfkData/generate/excel', generateExcel, {
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
