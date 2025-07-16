import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Property } from '../models/property.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private apiUrl = `${environment._apiUrl}/properties`;

  constructor(private http: HttpClient) { }

  /**
   * Get all properties
   * @returns Observable of Property array
   */
  getAllProperties(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/list`);
  }
  getAllPropertiesByCompoundId(projectId:string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/list?projectId=${projectId}`);
  }

  /**
   * Get a property by ID
   * @param id Property ID
   * @returns Observable of Property
   */
  getProperty(id: number): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create or update a property
   * @param property Property object to save
   * @returns Observable of saved Property
   */
  saveProperty(property: Property): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, property);
  }

  /**
   * Delete a property
   * @param id Property ID to delete
   * @returns Observable of string (success message)
   */
  deleteProperty(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }
} 