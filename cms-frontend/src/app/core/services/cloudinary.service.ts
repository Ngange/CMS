import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private uploadUrl = `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`;

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<string> {
    if (!environment.cloudinary?.unsignedUploadPreset) {
      return throwError(() => new Error('Cloudinary unsigned upload preset is not configured'));
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', environment.cloudinary.unsignedUploadPreset);

    return this.http.post<any>(this.uploadUrl, formData).pipe(
      map((response) => response.secure_url as string),
      catchError((error) => {
        console.error('Cloudinary upload failed', error);
        return throwError(() => error);
      })
    );
  }
}
