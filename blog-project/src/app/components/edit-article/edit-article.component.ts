import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-edit-article',
  templateUrl: './edit-article.component.html',
  styleUrls: ['./edit-article.component.css']
})
export class EditArticleComponent implements OnInit {
  editArticleForm!: FormGroup;
  articleTitle: string | null = null;
  article: any = {};
  userDetails: any = {};
  articlesByAuthor: any[] = [];
  uploadedImageId: string | null = null;
  sanitizedSummary: SafeHtml | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    this.editArticleForm = this.fb.group({
      title: ['', Validators.required],
      summary: ['', Validators.required],
      profile_image_url: ['', Validators.required],
      author_unique_id: [''],
      image_id: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.articleTitle = params['title'];
      this.loadArticle();
      this.loadUserDetails();
      this.loadArticlesByAuthor();
    });
  }

  loadArticle(): void {
    const articleId = this.route.snapshot.paramMap.get('id');
    if (articleId !== null) {
      this.apiService.getArticleById(articleId).subscribe(
        data => {
          this.article = data;
          this.sanitizedSummary = this.sanitizer.bypassSecurityTrustHtml(this.article.summary);
          this.editArticleForm.patchValue({
            title: this.article.title,
            summary: this.article.summary,
            profile_image_url: this.article.profile_image_url,
            author_unique_id: this.article.author_unique_id,
            image_id: this.article.image_id
          });
        },
        error => {
          console.error('Error fetching article:', error);
          alert('Error fetching article: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      );
    }
  }

  loadUserDetails(): void {
    this.apiService.getUserDetails(this.authService.getUniqueId()!).subscribe(
      data => {
        this.userDetails = data.user;
        this.editArticleForm.patchValue({
          author_email: this.userDetails.email,
          author_unique_id: this.userDetails.unique_id // Ensure this line is added
        });
      },
      error => {
        console.error('Error fetching user details:', error);
        alert('Error fetching user details: ' + (error.error?.message || error.message || 'Unknown error'));
      }
    );
  }

  loadArticlesByAuthor(): void {
    this.apiService.getArticlesByAuthor(this.authService.getUniqueId()!).subscribe(
      data => {
        if (data && Array.isArray(data.articles)) {
          this.articlesByAuthor = data.articles;
        } else {
          console.error('Invalid response format:', data);
          this.articlesByAuthor = [];
        }
      },
      error => {
        console.error('Error fetching articles by author:', error);
        alert('Error fetching articles by author: ' + (error.error?.message || error.message || 'Unknown error'));
        this.articlesByAuthor = [];
      }
    );
  }

  onSubmit(): void {
    if (this.editArticleForm.valid) {
      const articleData = {
        id: this.route.snapshot.paramMap.get('id'),
        title: this.editArticleForm.value.title,
        summary: document.getElementById('editor')?.innerHTML,
        profile_image_url: this.editArticleForm.value.profile_image_url,
        author_unique_id: this.editArticleForm.value.author_unique_id,
        image_id: this.uploadedImageId
      };

      this.apiService.editArticle(articleData).subscribe(
        response => {
          this.router.navigate(['/mp']);
        },
        error => {
          console.error('Article update failed:', error);
          const errorMessage = error.error?.error || error.message || 'Unknown error';
          alert('Article update failed: ' + errorMessage);
        }
      );
    } else {
      console.error('Form is invalid');
      alert('Form is invalid');
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const formData: FormData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);

      this.apiService.uploadImage(formData).subscribe(
        (response: any) => {
          this.uploadedImageId = response.image_id;
          this.editArticleForm.patchValue({ profile_image_url: response.url });
        },
        (error) => {
          const errorMessage = error.error?.error || error.message || 'Unknown error';
          alert('Image upload failed: ' + errorMessage);
        }
      );
    }
  }

  navigateToBlog(): void {
    this.router.navigate(['/blog']);
  }

  onContentChange(event: any): void {
    const content = event.target.innerHTML;
    this.editArticleForm.patchValue({ summary: content });
  }

  formatText(command: string, value: string = '') {
    document.execCommand(command, false, value);
  }

  applyColor(event: any): void {
    const color = event.target.value;
    this.formatText('foreColor', color);
  }

  insertImageInEditor(imageUrl: string) {
    const editor = document.getElementById('editor');
    if (editor) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.style.maxWidth = '100%';
      editor.appendChild(img);
    }
  }

  onImagesSelected(event: any) {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const imageUrl = e.target.result;
          this.insertImageInEditor(imageUrl);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  triggerImageUpload() {
    const imageUploadInput = document.getElementById('imageUploadInput') as HTMLInputElement;
    if (imageUploadInput) {
      imageUploadInput.click();
    }
  }
}
