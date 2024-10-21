import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-mp',
  templateUrl: './mp.component.html',
  styleUrls: ['./mp.component.css']
})
export class MpComponent implements OnInit {
  createArticleForm!: FormGroup;
  createdArticles: any[] = [];
  filteredArticles: any[] = [];
  userDetails: any = {};
  searchTerm: string = '';
  isModalOpen = false;
  selectedArticle: any = null;
  editMode: boolean = false;
  editArticleId: number | null = null;
  originalImageUrl: string | null = null;
  uploadedImageId: number | null = null;
  selectedFile: File | null = null;
  isCreateArticleModalOpen = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    public authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const uniqueId = this.authService.getUniqueId();
    if (!uniqueId) {
      console.error('Unique ID is null');
      this.router.navigate(['/login']);
      return;
    }

    this.createArticleForm = this.fb.group({
      title: ['', Validators.required],
      summary: ['', Validators.required],
      profile_image_url: ['', Validators.required],
      author_unique_id: [uniqueId, Validators.required]
    });

    this.fetchUserDetails(uniqueId);
    this.fetchArticles(uniqueId);
  }

  onSubmit() {
    if (this.createArticleForm.valid) {
      const articleData = this.createArticleForm.value;
      if (this.editMode && this.editArticleId !== null) {
        articleData.article_id = this.editArticleId;
        if (!articleData.profile_image_url) {
          articleData.profile_image_url = this.originalImageUrl;
        }
        if (this.uploadedImageId) {
          articleData.image_id = this.uploadedImageId;
        }
        this.apiService.editArticle(articleData).subscribe(
          response => {
            this.fetchArticles(this.authService.getUniqueId()!); // Refresh articles after edit
            this.resetForm();
          },
          error => {
            alert('Article update failed: ' + (error.error?.error || error.message));
          }
        );
      } else {
        this.apiService.createArticle(articleData).subscribe(
          response => {
            this.fetchArticles(this.authService.getUniqueId()!); // Refresh articles after creation
            this.resetForm();
          },
          error => {
            alert('Article creation failed: ' + (error.error?.error || error.message));
          }
        );
      }
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const formData: FormData = new FormData();
      formData.append('file', file, file.name);

      this.apiService.uploadImage(formData).subscribe(
        (response: any) => {
          this.uploadedImageId = response.image_id;
          this.createArticleForm.patchValue({ profile_image_url: response.url });
        },
        (error) => {
          alert('Image upload failed: ' + (error.error?.error || error.message));
        }
      );
    }
  }

  fetchArticles(uniqueId: string) {
    this.apiService.getArticlesByAuthor(uniqueId).subscribe(
      (response: any) => {
        this.createdArticles = response.articles;
        this.filteredArticles = this.createdArticles;
      },
      (error) => {
        console.error('Failed to fetch articles:', error);
      }
    );
  }

  fetchUserDetails(uniqueId: string) {
    this.apiService.getUserDetails(uniqueId).subscribe(
      (response: any) => {
        this.userDetails = response.user;
      },
      (error) => {
        console.error('Failed to fetch user details:', error);
      }
    );
  }

  filterArticles(): void {
    this.filteredArticles = this.createdArticles.filter(article =>
      article.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openModal(article: any) {
    this.router.navigate(['/read-blog', article.id]);
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedArticle = null;
  }

  deleteArticle(articleId: number) {
    const uniqueId = this.authService.getUniqueId();
    if (!uniqueId) {
      console.error('Unique ID is null');
      return;
    }
    this.apiService.deleteArticle(articleId, uniqueId).subscribe(
      response => {
        this.fetchArticles(uniqueId);
      },
      error => {
        alert('Article deletion failed: ' + (error.error?.error || error.message));
      }
    );
  }

  editArticle(article: any) {
    this.editMode = true;
    this.editArticleId = article.id;
    this.originalImageUrl = article.profile_image_url;
    this.uploadedImageId = article.image_id;
    this.createArticleForm.patchValue({
      title: article.title,
      summary: article.summary,
      profile_image_url: article.profile_image_url,
      author_unique_id: article.author_unique_id
    });
    this.openCreateArticleModal();
  }

  resetForm() {
    const uniqueId = this.authService.getUniqueId();
    if (!uniqueId) {
      console.error('Unique ID is null');
      return;
    }
    this.createArticleForm.reset();
    this.createArticleForm.patchValue({ author_unique_id: uniqueId });
    this.editMode = false;
    this.editArticleId = null;
    this.originalImageUrl = null;
    this.uploadedImageId = null;
  }

  navigateToBlogForms() {
    this.router.navigate(['/blog-form']);
  }

  openCreateArticleModal() {
    this.isCreateArticleModalOpen = true;
  }

  closeCreateArticleModal() {
    this.isCreateArticleModalOpen = false;
  }

  navigateToArticle(article: any) {
    this.router.navigate(['/read-article', article.id]);
  }

}
