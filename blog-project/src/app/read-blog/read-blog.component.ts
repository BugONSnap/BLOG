import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-read-blog',
  templateUrl: './read-blog.component.html',
  styleUrls: ['./read-blog.component.css']
})
export class ReadBlogComponent implements OnInit {
  blog: any = {};
  userDetails: any = {};
  sanitizedContent: SafeHtml = '';
  searchTerm: string = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const blogId = params['id'];
      if (blogId) {
        this.apiService.getArticleById(blogId).subscribe(
          data => {
            this.blog = data;
            this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(this.blog.content || this.blog.summary);
            this.userDetails.profile_image_url = this.blog.profile_image_url; // Set profile image directly
            this.userDetails.email = this.blog.author_email; // Set author email if available
          },
        );
      }
    });
  }

  loadUserDetails(authorId: string): void {
    this.apiService.getUserDetails(authorId).subscribe(
      userData => {
        this.userDetails = userData.user;
        this.apiService.getArticlesByAuthor(authorId).subscribe(
          articleData => {
            if (articleData.articles && articleData.articles.length > 0) {
              this.userDetails.profile_image_url = articleData.articles[0].profile_image_url;
            }
          },
        );
      },

    );
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  filterBlogs(): void {

  }
}
