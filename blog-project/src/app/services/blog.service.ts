import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'http://localhost/api-blog';

  constructor(private http: HttpClient) {}

  getBlogs(): Observable<any> {
    return this.http.get('http://localhost/api-blog/get_articles.php');
  }

  getUserDetails(uniqueId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/user_details`, { unique_id: uniqueId });
  }
}
