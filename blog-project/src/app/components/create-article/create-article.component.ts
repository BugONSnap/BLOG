import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-article',
  templateUrl: './create-article.component.html',
  styleUrls: ['./create-article.component.css']
})
export class CreateArticleComponent implements OnInit {
  createArticleForm!: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.createArticleForm = this.fb.group({
      title: ['', Validators.required],
      summary: ['', Validators.required],
      profile_image_url: ['', Validators.required]
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.createArticleForm.patchValue({ profile_image_url: e.target.result });
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  triggerFileUpload() {
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onSubmit() {
    this.createArticleForm.patchValue({
      summary: document.getElementById('editor')?.innerHTML
    });

    console.log('Form Valid:', this.createArticleForm.valid);
    console.log('Title Valid:', this.createArticleForm.controls['title'].valid);
    console.log('Summary Valid:', this.createArticleForm.controls['summary'].valid);
    console.log('Profile Image URL Valid:', this.createArticleForm.controls['profile_image_url'].valid);

    if (this.createArticleForm.valid) {
      const articleData = this.createArticleForm.value;
      articleData.author_unique_id = this.apiService.getAuthorUniqueId();
      articleData.summary = document.getElementById('editor')?.innerHTML; // Get the HTML content from the editor
      if (this.selectedFile) {
        const formData: FormData = new FormData();
        formData.append('file', this.selectedFile, this.selectedFile.name);
        this.apiService.uploadImage(formData).subscribe(
          (response: any) => {
            console.log('Image upload response:', response);
            articleData.profile_image_url = response.url;
            this.createArticle(articleData);
          },
          (error) => {
            console.error('Image upload failed:', error);
            alert('Image upload failed: ' + (error.error?.error || error.message));
          }
        );
      } else {
        this.createArticle(articleData);
      }
    }
  }

  createArticle(articleData: any) {
    this.apiService.createArticle(articleData).subscribe(
      (response: any) => {
        console.log('Article created:', response);
        this.router.navigate(['/mp']); // Navigate to MpComponent after successful creation
      },
      (error) => {
        console.error('Article creation failed:', error);
        alert('Article creation failed: ' + (error.error?.error || error.message));
      }
    );
  }

  formatText(command: string, value: string = '') {
    document.execCommand(command, false, value);
  }

  navigateToMp(): void {
    this.router.navigate(['/mp']);
  }
}