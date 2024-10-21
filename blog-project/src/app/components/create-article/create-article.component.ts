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
      profile_image_url: ['', Validators.required],
      article_image: ['']
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

    if (this.createArticleForm.valid) {
      const articleData = this.createArticleForm.value;
      articleData.author_unique_id = this.apiService.getAuthorUniqueId();
      if (this.selectedFile) {
        const formData: FormData = new FormData();
        formData.append('file', this.selectedFile, this.selectedFile.name);
        this.apiService.uploadImage(formData).subscribe(
          (response: any) => {
            articleData.profile_image_url = response.url;  // Use URL returned from server
            articleData.article_image = response.url; // Set article image URL
            this.createArticle(articleData); // Proceed to create the article
          },
          (error) => {
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
        this.router.navigate(['/mp']);
      },
      (error) => {
        alert('Article creation failed: ' + (error.error?.error || error.message));
      }
    );
  }
  uploadImage(formData: FormData) {
    return this.apiService.uploadImage(formData);
  }
  formatText(command: string, value: string = '') {
    document.execCommand(command, false, value);
  }

  changeFontColor(event: any) {
    const color = event.target.value;
    document.execCommand('foreColor', false, color);  // Set the font color using the selected value
  }

  navigateToMp(): void {
    this.router.navigate(['/mp']);
  }

  // Trigger the hidden file input for image upload
  triggerImageUpload() {
    const fileInput = document.getElementById('imageUploadInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Handle the image file selection
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageUrl = e.target.result;

        // Insert the image into the editor at the current cursor position
        this.insertImageInEditor(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  }

  // Insert the selected image into the rich text editor
  insertImageInEditor(imageUrl: string) {
    const editor = document.getElementById('editor');
    if (editor) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.style.maxWidth = '100%'; // Ensure the image fits within the editor
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
}
