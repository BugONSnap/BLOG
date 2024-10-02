import { Component } from '@angular/core';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent {
  comments = [{ content: 'Great post!' }, { content: 'Thanks for sharing!' }];
  newComment = '';

  addComment() {
    if (this.newComment.trim()) {
      this.comments.push({ content: this.newComment });
      this.newComment = '';
    }
  }
}