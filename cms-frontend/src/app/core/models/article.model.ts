// Import User interface
import { User } from './user.model';

export interface Article {
  _id: string;
  title: string;
  body: string;
  image?: string;
  author: User;
  status: 'draft' | 'published';
  publishedAt?: Date;
  views: number;
  createdAt?: Date;
  updatedAt?: Date;
}
