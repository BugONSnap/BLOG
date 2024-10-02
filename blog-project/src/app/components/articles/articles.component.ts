import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {
  articles: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchArticles();
  }

  fetchArticles() {
    this.apiService.getArticles().subscribe(
      (response: any) => {
        this.articles = response.articles;
      },
      (error) => {
        console.error('Failed to fetch articles:', error);
      }
    );
  }
}