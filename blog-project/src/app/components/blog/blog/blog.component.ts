import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../../services/blog.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {
  blogs: any[] = [];
  filteredBlogs: any[] = [];
  searchTerm: string = '';
  isModalOpen = false;
  isCommentModalOpen = false;
  selectedBlog: any = null;
  newComment: string = '';
  comments: any[] = []; // Initialize the comments array

  constructor(
    private blogService: BlogService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.fetchArticles();
  }

  fetchArticles(): void {
    this.blogService.getBlogs().subscribe(
      (response: any) => {
        if (response && response.articles) {
          this.blogs = response.articles.map((article: any) => ({
            ...article,
            sanitizedSummary: this.sanitizer.bypassSecurityTrustHtml(article.summary)
          }));
          this.filteredBlogs = this.blogs;
          this.fetchEmailsForArticles();
        } else {
          console.error('Invalid response format:', response);
        }
      },
      (error: any) => {
        console.error('Failed to fetch blogs:', error);
      }
    );
  }

  fetchEmailsForArticles(): void {
    this.blogs.forEach((blog, index) => {
      this.blogService.getUserDetails(blog.author_unique_id).subscribe(
        (response: any) => {
          if (response && response.user && response.user.email) {
            this.blogs[index].author_email = response.user.email;
          } else {
            console.error('Invalid response structure:', response);
          }
        },
        (error: any) => {
          console.error('Failed to fetch user details:', error);
        }
      );
    });
  }

  filterBlogs(): void {
    this.filteredBlogs = this.blogs.filter(blog =>
      blog.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openModal(blog: any) {
    this.router.navigate(['/read-blog', blog.id]);
  }

  closeModal() {
    this.isModalOpen = false; // Ensure this is set to false
    this.selectedBlog = null;
  }

  closeModalOnOutsideClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.closeModal();
    }
  }

  scrollToTop(): void {
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
      modalContent.scrollTop = 0;
    }
  }

  openCommentModal(blog: any) {
    this.selectedBlog = blog;
    this.isCommentModalOpen = true;
  }

  closeCommentModal() {
    this.isCommentModalOpen = false;
  }

  closeCommentModalOnOutsideClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.closeCommentModal();
    }
  }

  addComment(): void {
    if (this.newComment.trim()) {
      const comment = {
        author: this.authService.getUsername(), // Assuming you have a method to get the username
        text: this.newComment.trim()
      };
      if (!this.comments) {
        this.comments = []; // Ensure the comments array is initialized
      }
      this.comments.push(comment);
      this.newComment = '';
    }
  }
}
