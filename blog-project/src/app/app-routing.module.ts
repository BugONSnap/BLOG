import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BlogComponent } from './components/blog/blog/blog.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { MpComponent } from './components/auth/mp/mp.component';
import { CommentsComponent } from './components/comments/comments.component';
import { ArticlesComponent } from './components/articles/articles.component';
import { EditArticleComponent } from './components/edit-article/edit-article.component';
import { CreateArticleComponent } from './components/create-article/create-article.component';
import { ReadBlogComponent } from './read-blog/read-blog.component';

const routes: Routes = [
  { path: '', redirectTo: '/mp', pathMatch: 'full' },
  { path: 'mp', component: MpComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'comments', component: CommentsComponent },
  { path: 'articles', component: ArticlesComponent },
  { path: 'edit-article/:id', component: EditArticleComponent },
  { path: 'create-article', component: CreateArticleComponent },
  { path: 'read-blog/:id', component: ReadBlogComponent },
  { path: '**', redirectTo: '/mp' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
