import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NewsItem {
  ITEMID: number;
  TITLE: string;
  CONTENT: string;
  ITEMSHORTCONTENT?: string;
  ITEMIMG: string;
  PUBLISHDATE: string;
  CREATED: string;
  MODIFIED: string;
  VIEWCOUNT: number;
  AUTHORID: number;
  STRAUTHOR_NAME: string;
  STRCATEGORY_NAME?: string;
  STRARTICLETYPE_NAME: string;
  FRIENDLYNAME: string;
  ISDISPLAY: boolean;
  STATUS: number;
  STRSTATUS: string;
  STRUCTUREID: string;
  CATEGORYID?: number;
  ARTICLETYPEID: number;
  TAG?: string;
  TOPITEM: boolean;
}

export interface NewsResponse {
  success: boolean;
  lstNewsPaging: NewsItem[];
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.appUrl}`; // Localhost cho các API khác
  private newsApiUrl = 'https://thuvien.huit.edu.vn'; // API tin tức từ website trường
  private customerId = 'HUFI'; // Customer ID for HUIT

  /**
   * Lấy danh sách tin tức với phân trang
   */
  getNewsList(pageNumber: number = 1, pageSize: number = 10): Observable<NewsResponse> {
    // Gọi API tin tức thực tế - sử dụng GetOverViews endpoint
    const headers = {
      'Content-Type': 'application/json',
    };

    const body = {
      friendlyName: 'tin-tuc-su-kien',
      pageIndex: pageNumber,
      pageSize: pageSize,
      language: '',
    };

    console.log('GetOverViews payload:', body);
    return this.http.post<NewsResponse>(`${this.newsApiUrl}/News/GetOverViews`, body, { headers });
  }

  /**
   * Lấy tin tức nổi bật
   */
  getFeaturedNews(limit: number = 5): Observable<NewsResponse> {
    const headers = {
      'Content-Type': 'application/json',
    };

    const body = {
      friendlyName: 'tin-tuc-su-kien',
      pageIndex: 1,
      pageSize: limit,
      language: '',
    };

    console.log('GetFeaturedNews payload:', body);
    return this.http.post<NewsResponse>(`${this.newsApiUrl}/News/GetOverViews`, body, { headers });
  }

  /**
   * Lấy chi tiết tin tức theo ID
   */
  getNewsDetail(
    itemId: number
  ): Observable<{ success: boolean; data: NewsItem; message?: string }> {
    return this.http.get<{ success: boolean; data: NewsItem; message?: string }>(
      `${this.newsApiUrl}/News/GetNewsDetail`,
      {
        params: {
          itemId: itemId.toString(),
          customerId: this.customerId,
        },
      }
    );
  }

  /**
   * Tăng lượt xem tin tức
   */
  increaseViewCount(itemId: number): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.newsApiUrl}/News/IncreaseViewCount`,
      {
        itemId: itemId,
        customerId: this.customerId,
      }
    );
  }

  /**
   * Lấy URL ảnh từ news item hoặc DisplayImage API
   */
  getImageUrl(newsItem: NewsItem): string {
    // Nếu có ITEMIMG base64, sử dụng trực tiếp
    if (newsItem.ITEMIMG && newsItem.ITEMIMG.startsWith('/9j/')) {
      return `data:image/jpeg;base64,${newsItem.ITEMIMG}`;
    }

    // Nếu có ITEMID, sử dụng DisplayImage API
    if (newsItem.ITEMID) {
      const timestamp = Date.now();
      return `${this.newsApiUrl}/News/DisplayImage/?customerId=${this.customerId}&itemID=${newsItem.ITEMID}&t=${timestamp}`;
    }

    // Fallback placeholder
    return 'https://via.placeholder.com/400x250/2196F3/FFFFFF?text=Tin+tức+HUIT';
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return '';
    }
  }

  /**
   * Get excerpt from content
   */
  getExcerpt(content: string, maxLength: number = 150): string {
    if (!content) return '';

    // Remove HTML tags
    const textContent = content.replace(/<[^>]*>/g, '');

    if (textContent.length <= maxLength) {
      return textContent;
    }

    return textContent.substring(0, maxLength).trim() + '...';
  }

  /**
   * Get category display name
   */
  getCategoryName(newsItem: NewsItem): string {
    return newsItem.STRCATEGORY_NAME || newsItem.STRARTICLETYPE_NAME || 'Tin tức';
  }

  /**
   * Check if news item is hot/featured
   */
  isHotNews(newsItem: NewsItem): boolean {
    return newsItem.TOPITEM || false;
  }

  /**
   * Get author name
   */
  getAuthorName(newsItem: NewsItem): string {
    return newsItem.STRAUTHOR_NAME || 'Ban biên tập';
  }
}
